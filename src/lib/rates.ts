// JPY ↔ USD. Fetch on open when online; keep the last good rate with its time. A manual override wins.
import { cacheGet, cachePut } from './db';

export interface Rate { usdPerYen: number; at: number; source: string }
const KEY = 'rate:JPY-USD';

export async function cachedRate(): Promise<Rate | undefined> {
  return (await cacheGet<Rate>(KEY))?.value;
}

async function fromFrankfurter(): Promise<Rate> {
  const r = await fetch('https://api.frankfurter.dev/v1/latest?base=JPY&symbols=USD', { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('frankfurter ' + r.status);
  const j = await r.json();
  const v = j?.rates?.USD;
  if (typeof v !== 'number' || !(v > 0)) throw new Error('frankfurter: no rate');
  return { usdPerYen: v, at: Date.now(), source: 'ECB via Frankfurter' };
}

async function fromErApi(): Promise<Rate> {
  const r = await fetch('https://open.er-api.com/v6/latest/JPY', { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('er-api ' + r.status);
  const j = await r.json();
  const v = j?.rates?.USD;
  if (typeof v !== 'number' || !(v > 0)) throw new Error('er-api: no rate');
  return { usdPerYen: v, at: Date.now(), source: 'open.er-api.com' };
}

export async function refreshRate(): Promise<Rate | undefined> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return cachedRate();
  for (const f of [fromFrankfurter, fromErApi]) {
    try { const rate = await f(); await cachePut(KEY, rate); return rate; } catch { /* try the next */ }
  }
  return cachedRate();
}

// ---- math ----
export const yenToUsd = (yen: number, usdPerYen: number) => yen * usdPerYen;
export const usdToYen = (usd: number, usdPerYen: number) => usd / usdPerYen;

export function fmtUsd(v: number): string {
  if (!isFinite(v)) return '—';
  const digits = v < 10 ? 2 : 0;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export const fmtYen = (v: number) => '¥' + Math.round(v).toLocaleString('en-US');

// 税抜 → 税込: add tax, rounded down to the yen as most registers do.
export const withTax = (yen: number, rate = 0.1) => Math.floor(yen * (1 + rate));
// 税込 → 税抜
export const withoutTax = (yen: number, rate = 0.1) => Math.round(yen / (1 + rate));
export const taxIn = (taxInclusiveYen: number, rate = 0.1) => taxInclusiveYen - withoutTax(taxInclusiveYen, rate);
