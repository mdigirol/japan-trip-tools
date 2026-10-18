// Builds src/data/konbini-near-stops.json: convenience stores within ~600 m of each day's points and
// that night's hotel, from OpenStreetMap via Overpass. Coordinates only come from trip.json (§2).
// Run: npm run build-konbini   (one Overpass request per day, spaced out per the usage policy)
import { readFileSync, writeFileSync } from 'node:fs';
import { distM, overpass, type Konbini } from '../src/lib/overpass';

const trip = JSON.parse(readFileSync('src/data/trip.json', 'utf8'));
const RADIUS = 600, PER_DAY = 40;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Pt { lat: number; lng: number; hotel?: boolean }
const out: { generatedAt: string; attribution: string; days: Record<string, (Konbini & { dist: number; nearHotel: boolean })[]> } = {
  generatedAt: new Date().toISOString(), attribution: '© OpenStreetMap contributors (ODbL)', days: {}
};

for (const day of trip.days) {
  const stay = trip.stays.find((s: { id: string }) => s.id === day.stayTonight) ?? trip.stays.find((s: { id: string }) => s.id === day.stayLastNight);
  const pts: Pt[] = [...(stay ? [{ lat: stay.lat, lng: stay.lng, hotel: true }] : []), ...day.points];
  if (!pts.length) { out.days[day.date] = []; continue; }
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
    // Keep the nearest to the hotel, plus the nearest to the day's points.
    .sort((a, b) => (+b.nearHotel - +a.nearHotel) || a.dist - b.dist);
  const hotelSide = ranked.filter((k) => k.nearHotel).slice(0, 8);
  const daySide = ranked.filter((k) => !k.nearHotel).slice(0, PER_DAY - hotelSide.length);
  out.days[day.date] = [...hotelSide, ...daySide];
  console.log(`${day.date}: ${list.length} found, kept ${out.days[day.date].length}`);
  await sleep(3000);
}

writeFileSync('src/data/konbini-near-stops.json', JSON.stringify(out) + '\n');
console.log('Wrote src/data/konbini-near-stops.json');
