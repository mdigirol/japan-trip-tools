// Small per-device settings in localStorage (try/catch everywhere). Includes the sync token (§8),
// which never leaves this device except in requests to the GitHub API.
import { useEffect, useState } from 'preact/hooks';
import type { ZoneId } from './now';

export interface Settings {
  who: string;
  tempFirst: 'F' | 'C';
  textSize: 'normal' | 'large' | 'xl';
  recipients: string[];
  bags: string[];
  syncToken: string;
  rateOverride: number | null;     // USD per ¥1, set by hand; wins until cleared
  tableFocus: 'yen' | 'usd';       // Currency quick table: round yen or round dollars
  favorites: string[];             // phrase ids, local only
  toolOrder: string[];             // module paths; tiles, More and the bottom bar follow it
  timeZone: ZoneId;                // zone for cache ages and sync times; trip days stay JST
}

const KEY = 'jtc-settings-v1';
const DEFAULTS: Settings = {
  who: '', tempFirst: 'F', textSize: 'normal', recipients: [], bags: ['Carry-on', 'Big suitcase', 'Backpack'],
  syncToken: '', rateOverride: null, tableFocus: 'yen', favorites: [], toolOrder: [], timeZone: 'JST'
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* storage blocked */ }
  return { ...DEFAULTS };
}

let current = load();
const subs = new Set<(s: Settings) => void>();

export const getSettings = () => current;

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage blocked */ }
  subs.forEach((f) => f(current));
}

export function useSettings(): Settings {
  const [s, set] = useState(current);
  useEffect(() => { subs.add(set); return () => { subs.delete(set); }; }, []);
  return s;
}

export function applyTextSize(size: Settings['textSize']) {
  if (typeof document !== 'undefined') document.documentElement.dataset.text = size;
}
