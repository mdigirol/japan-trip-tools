// Builds src/data/konbini-near-stops.json: convenience stores within ~600 m of each day's points and
// that night's hotel, from OpenStreetMap via Overpass. Coordinates only come from trip.json (§2).
// Run: npm run build-konbini           (refetches only days that are empty; --all refetches every day)
//      OVERPASS_URL=<mirror> npm run build-konbini   (when the main Overpass server is down)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { distM, overpass, type Konbini } from '../src/lib/overpass';

const trip = JSON.parse(readFileSync('src/data/trip.json', 'utf8'));
const RADIUS = 600, PER_DAY = 50;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Pt { lat: number; lng: number; hotel?: boolean }
const out: { generatedAt: string; attribution: string; days: Record<string, (Konbini & { dist: number; nearHotel: boolean })[]> } = {
  generatedAt: new Date().toISOString(), attribution: '© OpenStreetMap contributors (ODbL)', days: {}
};
const OUT = 'src/data/konbini-near-stops.json';
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { days: {} };
const all = process.argv.includes('--all');

for (const day of trip.days) {
  const stay = trip.stays.find((s: { id: string }) => s.id === day.stayTonight) ?? trip.stays.find((s: { id: string }) => s.id === day.stayLastNight);
  const pts: Pt[] = [...(stay ? [{ lat: stay.lat, lng: stay.lng, hotel: true }] : []), ...day.points];
  if (!pts.length) { out.days[day.date] = []; continue; }
  if (!all && prev.days?.[day.date]?.length) { out.days[day.date] = prev.days[day.date]; console.log(`${day.date}: kept ${prev.days[day.date].length} from the last run`); continue; }
  const q = `[out:json][timeout:60];(${pts.map((p) => `nwr["shop"="convenience"](around:${RADIUS},${p.lat},${p.lng});`).join('')});out center tags;`;
  let list: Konbini[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    try { list = await overpass(q, 60_000, { 'User-Agent': 'japan-trip-tools/0.1 (personal trip app build script)' }); break; }
    catch (e) { console.warn(`${day.date}: ${(e as Error).message}, retrying`); await sleep(10_000 * (attempt + 1)); }
  }
  const seen = new Set<string>();
  const ranked = list.filter((k) => { const id = k.lat.toFixed(5) + k.lng.toFixed(5); if (seen.has(id)) return false; seen.add(id); return true; })
    .map((k) => {
      const dHotel = stay ? distM(k, stay) : Infinity;
      const dPoint = Math.min(...pts.map((p) => distM(k, p)));
      return { ...k, dist: Math.round(Math.min(dHotel, dPoint)), nearHotel: dHotel <= RADIUS };
    })
    .sort((a, b) => a.dist - b.dist);
  // Keep up to 8 nearest the hotel, then the 3 nearest each of the day's points, so every area gets some.
  const keep = new Map<string, (typeof ranked)[number]>();
  const key = (k: Konbini) => k.lat.toFixed(5) + k.lng.toFixed(5);
  for (const k of ranked.filter((x) => x.nearHotel).slice(0, 8)) keep.set(key(k), k);
  for (const p of day.points as Pt[]) {
    ranked.filter((k) => !keep.has(key(k))).sort((a, b) => distM(a, p) - distM(b, p)).filter((k) => distM(k, p) <= RADIUS).slice(0, 3)
      .forEach((k) => keep.set(key(k), k));
  }
  out.days[day.date] = [...keep.values()].slice(0, PER_DAY).sort((a, b) => (+b.nearHotel - +a.nearHotel) || a.dist - b.dist);
  console.log(`${day.date}: ${list.length} found, kept ${out.days[day.date].length}`);
  await sleep(3000);
}

writeFileSync(OUT, JSON.stringify(out) + '\n');
const empty = Object.entries(out.days).filter(([d, l]) => !l.length && d !== '2026-11-11').map(([d]) => d);
console.log(`Wrote ${OUT}.` + (empty.length ? ` Empty days (rerun to retry): ${empty.join(', ')}` : ''));
