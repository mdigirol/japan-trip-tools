// Links to the Japan Meteorological Agency's English local forecast. We link rather than fetch: JMA's
// forecast JSON is undocumented, Japanese-coded, covers 7 days and has no sunset time, so Open-Meteo
// stays the source for the cards. Area codes are JMA's `class20s` (cities and wards).
import type { TripDay } from '../data/schema';
import { distM } from './overpass';
import type { City } from './trip';

export interface JmaArea { code: string; name: string; city: City['id']; lat: number; lng: number }

// Centroids are approximate (ward offices, city centers). They only pick the nearest area.
export const JMA_AREAS: JmaArea[] = [
  { code: '1310100', name: 'Chiyoda City', city: 'tokyo', lat: 35.6940, lng: 139.7536 },
  { code: '1310200', name: 'Chuo City', city: 'tokyo', lat: 35.6706, lng: 139.7720 },
  { code: '1310300', name: 'Minato City', city: 'tokyo', lat: 35.6581, lng: 139.7514 },
  { code: '1310400', name: 'Shinjuku City', city: 'tokyo', lat: 35.6938, lng: 139.7034 },
  { code: '1310500', name: 'Bunkyo City', city: 'tokyo', lat: 35.7081, lng: 139.7525 },
  { code: '1310600', name: 'Taito City', city: 'tokyo', lat: 35.7126, lng: 139.7800 },
  { code: '1310700', name: 'Sumida City', city: 'tokyo', lat: 35.7107, lng: 139.8015 },
  { code: '1310800', name: 'Koto City', city: 'tokyo', lat: 35.6727, lng: 139.8171 },
  { code: '1310900', name: 'Shinagawa City', city: 'tokyo', lat: 35.6090, lng: 139.7302 },
  { code: '1311000', name: 'Meguro City', city: 'tokyo', lat: 35.6414, lng: 139.6982 },
  { code: '1311100', name: 'Ota City', city: 'tokyo', lat: 35.5613, lng: 139.7161 },
  { code: '1311200', name: 'Setagaya City', city: 'tokyo', lat: 35.6461, lng: 139.6532 },
  { code: '1311300', name: 'Shibuya City', city: 'tokyo', lat: 35.6640, lng: 139.6982 },
  { code: '1311400', name: 'Nakano City', city: 'tokyo', lat: 35.7078, lng: 139.6638 },
  { code: '1311500', name: 'Suginami City', city: 'tokyo', lat: 35.6995, lng: 139.6364 },
  { code: '1311600', name: 'Toshima City', city: 'tokyo', lat: 35.7263, lng: 139.7166 },
  { code: '1311700', name: 'Kita City', city: 'tokyo', lat: 35.7528, lng: 139.7336 },
  { code: '1311800', name: 'Arakawa City', city: 'tokyo', lat: 35.7362, lng: 139.7834 },
  { code: '1311900', name: 'Itabashi City', city: 'tokyo', lat: 35.7512, lng: 139.7090 },
  { code: '1312000', name: 'Nerima City', city: 'tokyo', lat: 35.7356, lng: 139.6517 },
  { code: '1312100', name: 'Adachi City', city: 'tokyo', lat: 35.7752, lng: 139.8046 },
  { code: '1312200', name: 'Katsushika City', city: 'tokyo', lat: 35.7436, lng: 139.8472 },
  { code: '1312300', name: 'Edogawa City', city: 'tokyo', lat: 35.7068, lng: 139.8683 },
  { code: '1222700', name: 'Urayasu City', city: 'tokyo', lat: 35.6536, lng: 139.9019 },   // Maihama
  { code: '1438200', name: 'Hakone Town', city: 'hakone', lat: 35.2324, lng: 139.1069 },
  { code: '2610000', name: 'Kyoto City', city: 'kyoto', lat: 35.0116, lng: 135.7681 },
  { code: '2710000', name: 'Osaka City', city: 'osaka', lat: 34.6937, lng: 135.5023 },
  { code: '2920101', name: 'Western Nara City', city: 'nara', lat: 34.6800, lng: 135.8050 },
  { code: '2920102', name: 'Eastern Nara City', city: 'nara', lat: 34.6500, lng: 135.9500 }
];

// Used when no itinerary point falls in the city.
const CITY_DEFAULT: Record<string, string> = {
  tokyo: '1310100', hakone: '1438200', kyoto: '2610000', osaka: '2710000', nara: '2920101'
};

const MAX_KM = 12;

const byCode = (code: string) => JMA_AREAS.find((a) => a.code === code)!;

export const jmaUrl = (code: string) =>
  `https://www.jma.go.jp/bosai/#lang=en&pattern=forecast&area_type=class20s&area_code=${code}`;
// JMA's map, for places outside the areas above.
export const JMA_MAP_URL = 'https://www.jma.go.jp/bosai/#lang=en&pattern=forecast';

export function nearestJmaArea(p: { lat: number; lng: number }, maxKm = MAX_KM): JmaArea | undefined {
  let best: JmaArea | undefined, bestM = maxKm * 1000;
  for (const a of JMA_AREAS) {
    const m = distM(p, a);
    if (m <= bestM) { best = a; bestM = m; }
  }
  return best;
}

// The area for a city card: the first stop of the day inside that city, else the city's default area.
export function jmaAreaForCity(city: City, day?: TripDay): JmaArea {
  for (const p of day?.points ?? []) {
    const a = nearestJmaArea(p);
    if (a?.city === city.id) return a;
  }
  return byCode(CITY_DEFAULT[city.id] ?? CITY_DEFAULT.tokyo);
}
