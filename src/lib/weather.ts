// Open-Meteo forecast per city, cached with its time. With no cache, typical mid-November values.
import { cacheGet, cachePut } from './db';
import type { City } from './trip';

export interface DayWeather { date: string; hiC: number; loC: number; rainPct: number | null; sunset: string | null }
export interface CityWeather { city: City; day: DayWeather; at: number | null; typical: boolean }

interface Forecast { days: DayWeather[] }

// Typical mid-November values (climate normals, rounded). Labeled "typical" in the UI.
const TYPICAL: Record<string, Omit<DayWeather, 'date'>> = {
  tokyo: { hiC: 17, loC: 9, rainPct: null, sunset: '16:35' },
  hakone: { hiC: 14, loC: 6, rainPct: null, sunset: '16:40' },
  kyoto: { hiC: 17, loC: 7, rainPct: null, sunset: '16:50' },
  osaka: { hiC: 18, loC: 9, rainPct: null, sunset: '16:52' },
  nara: { hiC: 16, loC: 5, rainPct: null, sunset: '16:50' }
};

const key = (c: City) => `weather:${c.id}`;

function pick(f: Forecast | undefined, ymd: string) { return f?.days.find((d) => d.date === ymd); }

export async function cachedWeather(c: City, ymd: string): Promise<CityWeather> {
  const e = await cacheGet<Forecast>(key(c));
  const day = pick(e?.value, ymd);
  if (day && e) return { city: c, day, at: e.at, typical: false };
  return { city: c, day: { date: ymd, ...TYPICAL[c.id] }, at: null, typical: true };
}

export async function refreshWeather(c: City, ymd: string): Promise<CityWeather> {
  if (typeof navigator === 'undefined' || navigator.onLine !== false) {
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}` +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunset&timezone=Asia%2FTokyo&forecast_days=16';
      const r = await fetch(u);
      if (r.ok) {
        const j = await r.json();
        const d = j.daily;
        const days: DayWeather[] = d.time.map((t: string, i: number) => ({
          date: t, hiC: d.temperature_2m_max[i], loC: d.temperature_2m_min[i],
          rainPct: d.precipitation_probability_max?.[i] ?? null,
          sunset: d.sunset?.[i] ? String(d.sunset[i]).slice(11, 16) : null
        }));
        await cachePut<Forecast>(key(c), { days });
      }
    } catch { /* fall back to cache */ }
  }
  return cachedWeather(c, ymd);
}

export const cToF = (c: number) => c * 9 / 5 + 32;
export const fToC = (f: number) => (f - 32) * 5 / 9;
