// The one full-screen show card, opened from anywhere.
import { useEffect, useState } from 'preact/hooks';

export interface ShowCardView { head?: string; ja: string; en: string; romaji?: string; tel?: string; telLabel?: string; sub?: string }

let open: ShowCardView | null = null;
const subs = new Set<(v: ShowCardView | null) => void>();

export function showCard(v: ShowCardView | null) { open = v; subs.forEach((f) => f(open)); }

export function useShowCard() {
  const [v, set] = useState(open);
  useEffect(() => { subs.add(set); return () => { subs.delete(set); }; }, []);
  return v;
}

// +81 3-3234-1111 → 03-3234-1111 for display; tel:+81332341111 for dialing.
export const telDisplay = (tel: string) => tel.replace(/^\+81 /, '0');
export const telHref = (tel: string) => 'tel:' + tel.replace(/[^+0-9]/g, '');
