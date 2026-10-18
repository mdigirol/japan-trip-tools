// The Purchase store shared by the souvenir tracker and the tax-free claim log.
// Writes go to IndexedDB first, plus a sync-queue entry (§8).
import { useEffect, useState } from 'preact/hooks';
import type { Purchase } from '../data/schema';
import { TAX, TAX_FREE_MIN_YEN } from '../data/money';
import { db } from './db';
import { taxIn, withoutTax } from './rates';

const subs = new Set<() => void>();
export const notifyPurchases = () => subs.forEach((f) => f());

export async function allPurchases(includeDeleted = false): Promise<Purchase[]> {
  try {
    const l = await (await db()).getAll('purchases');
    return l.filter((p) => includeDeleted || !p.deleted).sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  } catch { return []; }
}

export function usePurchases(): Purchase[] | null {
  const [l, set] = useState<Purchase[] | null>(null);
  useEffect(() => {
    const f = () => { allPurchases().then(set); };
    f(); subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return l;
}

export const uuid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });

export async function savePurchase(p: Purchase): Promise<Purchase> {
  const d = await db();
  const tx = d.transaction(['purchases', 'queue'], 'readwrite');
  await tx.objectStore('purchases').put(p);
  await tx.objectStore('queue').add({ purchaseId: p.id, at: new Date().toISOString() });
  await tx.done;
  notifyPurchases();
  window.dispatchEvent(new Event('jtc-sync-request'));
  return p;
}

export async function setDeleted(p: Purchase, deleted: boolean) {
  return savePurchase({ ...p, deleted, updatedAt: new Date().toISOString() });
}

// ---- merge (last write wins per record, by updatedAt) ----
export function mergePurchase(local: Purchase | undefined, remote: Purchase): Purchase {
  if (!local) return remote;
  if (remote.updatedAt > local.updatedAt) return { ...remote, photoIds: local.photoIds };   // photos are per-device
  return local;
}

// ---- totals and claim-log math ----
// Shops charge the full price including 10% tax; the refund is that tax.
export const taxDue = (p: Purchase) => p.taxPaidYen ?? taxIn(p.priceYen, TAX.standard);

export function claimTotals(list: Purchase[]) {
  const items = list.filter((p) => p.taxFree && !p.deleted);
  return { count: items.length, priceYen: items.reduce((a, p) => a + p.priceYen, 0), taxYen: items.reduce((a, p) => a + taxDue(p), 0) };
}

// The ¥5,000-before-tax minimum applies per store per day.
export interface StoreDay { shop: string; date: string; preTaxYen: number; ok: boolean; items: Purchase[] }
export function storeDays(list: Purchase[]): StoreDay[] {
  const m = new Map<string, StoreDay>();
  for (const p of list) {
    if (!p.taxFree || p.deleted) continue;
    const shop = (p.shop || 'Unknown shop').trim();
    const k = shop.toLowerCase() + '|' + p.date;
    const e = m.get(k) ?? { shop, date: p.date, preTaxYen: 0, ok: false, items: [] };
    e.preTaxYen += p.taxPaidYen != null ? p.priceYen - p.taxPaidYen : withoutTax(p.priceYen, TAX.standard);
    e.items.push(p);
    m.set(k, e);
  }
  return [...m.values()].map((e) => ({ ...e, ok: e.preTaxYen >= TAX_FREE_MIN_YEN })).sort((a, b) => a.date.localeCompare(b.date));
}

export function byRecipient(list: Purchase[]): Map<string, Purchase[]> {
  const m = new Map<string, Purchase[]>();
  for (const p of list) {
    if (p.deleted) continue;
    const who = p.forWhom?.length ? p.forWhom : ['For us'];
    for (const w of who) m.set(w, [...(m.get(w) ?? []), p]);
  }
  return m;
}

export function stillNeed(recipients: string[], list: Purchase[]): string[] {
  const got = byRecipient(list);
  return recipients.filter((r) => !got.has(r));
}

// ---- photos (local only; not synced in v1) ----
export async function addPhoto(purchaseId: string, blob: Blob): Promise<string> {
  const id = uuid();
  await (await db()).put('photos', { id, purchaseId, blob, at: new Date().toISOString() });
  return id;
}
export async function getPhoto(id: string): Promise<Blob | undefined> {
  try { return (await (await db()).get('photos', id))?.blob; } catch { return undefined; }
}
