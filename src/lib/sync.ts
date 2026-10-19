// Sync between the two phones over GitHub Issues in the private data repo (§8).
// One issue per purchase: title "purchase:<uuid>", body "<!-- companion {json} -->".
// Order per run: pull issues updated since the last sync, merge (last write wins), then push the queue.
// Pulling first means an older offline edit never overwrites a newer one from the other phone.
import { useEffect, useState } from 'preact/hooks';
import type { Purchase } from '../data/schema';
import { Purchase as PurchaseSchema } from '../data/schema';
import { cacheGet, cachePut, db } from './db';
import { mergePurchase, notifyPurchases } from './purchases';
import { getSettings } from './settings';

// Set VITE_DATA_REPO=owner/repo at build time to turn sync on; without it the app stays local-only.
export const DATA_REPO: string = import.meta.env.VITE_DATA_REPO ?? '';
const API = 'https://api.github.com';
const MAP_KEY = 'sync:issue-map';      // uuid → issue number
const SINCE_KEY = 'sync:since';

export type SyncState =
  | { kind: 'off' }
  | { kind: 'idle'; at?: number; pending: number }
  | { kind: 'syncing'; pending: number }
  | { kind: 'error'; message: string; pending: number; at?: number };

let state: SyncState = { kind: 'off' };
const subs = new Set<(s: SyncState) => void>();
const setState = (s: SyncState) => { state = s; subs.forEach((f) => f(s)); };

export function useSyncState() {
  const [s, set] = useState(state);
  useEffect(() => { subs.add(set); return () => { subs.delete(set); }; }, []);
  return s;
}

// ---- issue body encoding ----
export function encodeBody(p: Purchase): string {
  // "--" is escaped so text like "-->" in a note can't end the HTML comment early.
  return `<!-- companion ${JSON.stringify(p).replace(/--/g, '-\\u002d')} -->\n\n${p.item}${p.forWhom?.length ? ' · for ' + p.forWhom.join(', ') : ''}${p.taxFree ? ' · tax-free' : ''}`;
}

export function decodeBody(body: string | null | undefined): Purchase | null {
  const m = /<!-- companion ([\s\S]*?) -->/.exec(body ?? '');
  if (!m) return null;
  try {
    const r = PurchaseSchema.safeParse(JSON.parse(m[1]));
    return r.success ? r.data : null;
  } catch { return null; }
}

export const labelsFor = (p: Purchase) => [
  ...(p.forWhom?.length || !p.taxFree ? ['souvenir'] : []), ...(p.taxFree ? ['taxfree'] : []), ...(p.deleted ? ['deleted'] : [])
];

// ---- HTTP ----
class HttpError extends Error { constructor(public status: number, msg: string, public retryAfter?: number) { super(msg); } }

async function gh(path: string, token: string, init: RequestInit = {}) {
  const r = await fetch(API + path, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) }
  });
  if (!r.ok) {
    const ra = +(r.headers.get('retry-after') ?? '') || undefined;
    throw new HttpError(r.status, `GitHub ${r.status}`, ra);
  }
  return r;
}

interface Issue { number: number; title: string; body: string | null; state: string; updated_at: string; pull_request?: unknown }

async function pull(token: string, map: Record<string, number>): Promise<number> {
  const since = (await cacheGet<string>(SINCE_KEY))?.value;
  const started = new Date().toISOString();
  let page = 1, merged = 0;
  const d = await db();
  for (;;) {
    const q = `?state=all&per_page=100&page=${page}&sort=updated&direction=asc${since ? '&since=' + encodeURIComponent(since) : ''}`;
    const issues: Issue[] = await (await gh(`/repos/${DATA_REPO}/issues${q}`, token)).json();
    for (const is of issues) {
      if (is.pull_request || !is.title.startsWith('purchase:')) continue;
      const id = is.title.slice('purchase:'.length);
      map[id] = is.number;
      const remote = decodeBody(is.body);
      if (!remote || remote.id !== id) continue;
      const local = await d.get('purchases', id);
      const win = mergePurchase(local, remote);
      if (win !== local) { await d.put('purchases', win); merged++; }
    }
    if (issues.length < 100) break;
    page++;
  }
  await cachePut(SINCE_KEY, started);
  return merged;
}

async function push(token: string, map: Record<string, number>) {
  const d = await db();
  const queue = await d.getAll('queue');
  const ids = [...new Set(queue.map((q) => q.purchaseId))];
  for (const id of ids) {
    const p = await d.get('purchases', id);
    if (p) {
      const { photoIds: _photos, ...rest } = p;            // photos stay on this device
      const body = JSON.stringify({ body: encodeBody(rest as Purchase), labels: labelsFor(p), ...(map[id] ? { state: p.deleted ? 'closed' : 'open' } : {}) });
      if (map[id]) {
        await gh(`/repos/${DATA_REPO}/issues/${map[id]}`, token, { method: 'PATCH', body });
      } else {
        const r = await gh(`/repos/${DATA_REPO}/issues`, token, { method: 'POST', body: JSON.stringify({ title: `purchase:${id}`, ...JSON.parse(body) }) });
        const created: Issue = await r.json();
        map[id] = created.number;
        await cachePut(MAP_KEY, map);
        if (p.deleted) await gh(`/repos/${DATA_REPO}/issues/${created.number}`, token, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
      }
    }
    // Clear every queue entry for this record that was queued before we read it.
    for (const q of queue) if (q.purchaseId === id && q.id != null) await d.delete('queue', q.id);
  }
}

async function pendingCount() {
  try { return (await (await db()).getAll('queue')).reduce((s, q) => s.add(q.purchaseId), new Set<string>()).size; } catch { return 0; }
}

let running: Promise<void> | null = null;
let backoffUntil = 0, backoffMs = 60_000;

export async function syncNow(force = false): Promise<void> {
  const token = getSettings().syncToken;
  const pending = await pendingCount();
  if (!token || !DATA_REPO) { setState({ kind: 'off' }); return; }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { setState({ kind: 'idle', at: lastAt(), pending }); return; }
  if (!force && Date.now() < backoffUntil) return;
  if (running) return running;
  running = (async () => {
    setState({ kind: 'syncing', pending });
    try {
      const map = (await cacheGet<Record<string, number>>(MAP_KEY))?.value ?? {};
      const merged = await pull(token, map);
      await cachePut(MAP_KEY, map);
      await push(token, map);
      await cachePut(MAP_KEY, map);
      if (merged) notifyPurchases();
      backoffMs = 60_000;
      await cachePut('sync:last', Date.now());
      lastSyncAt = Date.now();
      setState({ kind: 'idle', at: lastSyncAt, pending: await pendingCount() });
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 0;
      let message = 'Couldn’t reach GitHub. Will retry.';
      if (status === 401) message = 'The sync token was rejected. Check it in Settings.';
      else if (status === 404) message = 'The data repo wasn’t found. Check the token’s repo access.';
      else if (status === 403 || status === 429) {
        const wait = e instanceof HttpError && e.retryAfter ? e.retryAfter * 1000 : backoffMs;
        backoffUntil = Date.now() + wait; backoffMs = Math.min(backoffMs * 2, 30 * 60_000);
        message = 'GitHub asked us to slow down. Will retry.';
      }
      setState({ kind: 'error', message, pending: await pendingCount(), at: lastAt() });
    } finally { running = null; }
  })();
  return running;
}

let lastSyncAt: number | undefined;
const lastAt = () => lastSyncAt;

// On app open, on reconnect, after a local write, and every 60 s while open.
export function startSync() {
  cacheGet<number>('sync:last').then((e) => { lastSyncAt = e?.value; syncNow(); });
  window.addEventListener('online', () => syncNow(true));
  window.addEventListener('jtc-sync-request', () => syncNow(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 60_000);
}
