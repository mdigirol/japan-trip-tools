// Konbini lookups from OpenStreetMap (Overpass). Cached per ~500 m tile for 24 h.
import { cacheGet, cachePut } from './db';

export interface Konbini { name: string; brand: string; lat: number; lng: number; hours?: string }
// The main server first, then public mirrors. Each gets a short timeout.
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

export async function overpass(query: string, timeoutMs = 25000, headers: Record<string, string> = {}): Promise<Konbini[]> {
  let last: unknown;
  const env = typeof process !== 'undefined' ? process.env?.OVERPASS_URL : undefined;   // build script override
  for (const url of env ? [env] : OVERPASS_ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST', body: 'data=' + encodeURIComponent(query), signal: AbortSignal.timeout(timeoutMs),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers }
      });
      if (r.ok) return parseOverpass(await r.json());
      last = new Error(`${url} ${r.status}`);
    } catch (e) { last = e; }
  }
  throw last;
}

const BRANDS: [RegExp, string][] = [
  [/7-eleven|seven|セブン/i, '7-Eleven'], [/lawson|ローソン/i, 'Lawson'], [/family ?mart|ファミリーマート|ファミマ/i, 'FamilyMart'],
  [/ministop|ミニストップ/i, 'Ministop'], [/daily yamazaki|デイリーヤマザキ/i, 'Daily Yamazaki'], [/newdays|ニューデイズ/i, 'NewDays']
];
export function brandOf(tags: Record<string, string>): string {
  const s = [tags.brand, tags['brand:en'], tags.name, tags['name:en']].filter(Boolean).join(' ');
  return BRANDS.find(([re]) => re.test(s))?.[1] ?? 'Other';
}

export function distM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function parseOverpass(json: { elements?: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] }): Konbini[] {
  return (json.elements ?? []).map((e) => {
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon, tags = e.tags ?? {};
    if (lat == null || lng == null) return null;
    return { name: tags['name:en'] || tags.name || brandOf(tags), brand: brandOf(tags), lat, lng, ...(tags.opening_hours ? { hours: tags.opening_hours } : {}) };
  }).filter((x): x is Konbini => !!x);
}

export async function nearMe(lat: number, lng: number, radius = 500): Promise<Konbini[]> {
  const key = `overpass:${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = await cacheGet<Konbini[]>(key);
  if (hit && Date.now() - hit.at < 86400000) return hit.value;
  const q = `[out:json][timeout:20];nwr["shop"="convenience"](around:${radius},${lat},${lng});out center tags;`;
  const list = await overpass(q, 12000);
  await cachePut(key, list);
  return list;
}

export const mapsLink = (k: { name: string; lat: number; lng: number }) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${k.lat},${k.lng}`)}`;
export const MAPS_SEARCH_KONBINI = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('コンビニ');
