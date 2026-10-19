// Today's day and tonight's stay, from trip.json.
import tripJson from '@data/trip.json';
import type { Place, Stay, TripDay, TripFile } from '../data/schema';
import { daysBetween, hhmmToMinutes, tokyo } from './now';

export const trip = tripJson as TripFile;
export const TRIP_START = '2026-11-11';
export const TRIP_END = '2026-11-27';
export const DEFAULT_CHECKIN = '15:00';
// Optional: set VITE_ITINERARY_URL at build time to show an "Open this day in the itinerary" link on Today.
export const ITINERARY_URL: string = import.meta.env.VITE_ITINERARY_URL ?? '';

export const SEG_CITY: Record<TripDay['seg'], string> = { air: 'In transit', t1: 'Tokyo', hk: 'Hakone', ky: 'Kyoto', t2: 'Tokyo' };

export const stayById = (id?: string): Stay | undefined => trip.stays.find((s) => s.id === id);
export const dayByDate = (ymd: string): TripDay | undefined => trip.days.find((d) => d.date === ymd);

export interface TodayState {
  phase: 'before' | 'air-out' | 'during' | 'after';
  ymd: string;                       // Tokyo date now
  day?: TripDay;                     // the trip day (or the preview day before the trip)
  dayNumber?: number;                // 1–17
  daysToGo?: number;                 // before the trip
  city: string;
  leg?: { stay: Stay; night: number; nights: number };
  primary?: Stay;                    // the hotel card to show first
  checkingOut?: Stay;                // travel days, before tonight's check-in
  flightHome?: boolean;              // Nov 27
}

function nightsOf(s: Stay) { return daysBetween(s.from, s.to); }

export function todayState(at: Date): TodayState {
  const t = tokyo(at);
  const ymd = t.ymd;
  if (ymd < TRIP_START) {
    return { phase: 'before', ymd, daysToGo: daysBetween(ymd, TRIP_START), day: dayByDate('2026-11-12'), city: 'Tokyo' };
  }
  if (ymd > TRIP_END) return { phase: 'after', ymd, city: 'Home' };
  const day = dayByDate(ymd)!;
  const dayNumber = daysBetween(TRIP_START, ymd) + 1;
  if (day.seg === 'air') return { phase: 'air-out', ymd, day, dayNumber, city: 'In the air' };

  const tonight = stayById(day.stayTonight);
  const last = stayById(day.stayLastNight);
  const state: TodayState = { phase: 'during', ymd, day, dayNumber, city: SEG_CITY[day.seg] };

  if (!tonight) {
    // Nov 27: checked out, bags held at last night's hotel, flying home tonight.
    state.primary = last;
    state.flightHome = true;
    if (last) state.leg = { stay: last, night: nightsOf(last), nights: nightsOf(last) };
    return state;
  }
  state.primary = tonight;
  state.leg = { stay: tonight, night: daysBetween(tonight.from, ymd) + 1, nights: nightsOf(tonight) };
  if (last && last.id !== tonight.id) {
    const checkIn = hhmmToMinutes(tonight.checkIn ?? DEFAULT_CHECKIN);
    if (t.minutes < checkIn) state.checkingOut = last;
  }
  return state;
}

// City list for weather: the day's main city first, then any day-trip city. Maihama counts as Tokyo.
export interface City { id: Place; name: string; lat: number; lng: number }
const CITY_COORDS: Record<string, City> = {
  tokyo: { id: 'tokyo', name: 'Tokyo', lat: 35.6812, lng: 139.7671 },
  hakone: { id: 'hakone', name: 'Hakone', lat: 35.2338, lng: 139.0890 },
  kyoto: { id: 'kyoto', name: 'Kyoto', lat: 35.0091, lng: 135.7633 },
  osaka: { id: 'osaka', name: 'Osaka', lat: 34.6687, lng: 135.5013 },
  nara: { id: 'nara', name: 'Nara', lat: 34.6851, lng: 135.8430 }
};
const SEG_PLACE: Record<string, Place> = { t1: 'tokyo', t2: 'tokyo', hk: 'hakone', ky: 'kyoto' };

export function weatherCities(day?: TripDay): City[] {
  if (!day || day.seg === 'air') return [CITY_COORDS.tokyo];
  const main = SEG_PLACE[day.seg];
  const ids = [main, ...day.places.filter((p) => p !== main && p !== 'maihama' && p !== 'anywhere')];
  return [...new Set(ids)].map((id) => CITY_COORDS[id]).filter(Boolean);
}

export const cityCoords = CITY_COORDS;

// The places and venues "today" means, for sorting phrases and etiquette.
export function todayContext(day?: TripDay): { places: Place[]; venues: string[] } {
  if (!day) return { places: [], venues: [] };
  return { places: day.places, venues: day.venues };
}

export function itineraryDayUrl(ymd: string, base: string = ITINERARY_URL): string | undefined {
  return base ? `${base}#d${+ymd.slice(8, 10)}` : undefined;
}
