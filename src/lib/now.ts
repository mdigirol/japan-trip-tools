// Trip clock. All date logic uses Asia/Tokyo time.
// ?now=2026-11-21T08:00%2B09:00 overrides the clock for testing, like the itinerary's.

let override: Date | null | undefined;

export function parseNowParam(search: string): Date | null {
  const m = /[?&]now=([^&]+)/.exec(search);
  if (!m) return null;
  const d = new Date(decodeURIComponent(m[1]).replace(' ', '+'));
  return isNaN(d.getTime()) ? null : d;
}

export function now(): Date {
  if (override === undefined) {
    override = typeof location !== 'undefined' ? parseNowParam(location.search) : null;
  }
  return override ? new Date(override.getTime()) : new Date();
}

export function setNowForTests(d: Date | null) { override = d; }

export interface TokyoParts { ymd: string; y: number; m: number; d: number; hh: number; mm: number; dow: string; minutes: number }

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23'
});

export function tokyo(d: Date = now()): TokyoParts {
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(d)) p[part.type] = part.value;
  const y = +p.year, m = +p.month, day = +p.day, hh = +p.hour % 24, mm = +p.minute;
  return { y, m, d: day, hh, mm, dow: p.weekday, minutes: hh * 60 + mm, ymd: `${p.year}-${p.month}-${p.day}` };
}

// "Sat, Nov 21" for a YYYY-MM-DD date.
export function longDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 3));
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(dt);
}

// "Nov 14, 9:02 AM" in Tokyo time, for cache ages.
export function stamp(iso: string | number): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
}

export function daysBetween(a: string, b: string): number {
  const t = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((t(b) - t(a)) / 86400000);
}

export const hhmmToMinutes = (s: string) => +s.slice(0, 2) * 60 + +s.slice(3, 5);
