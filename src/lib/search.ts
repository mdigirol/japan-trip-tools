// Free-text search shared by Phrases and the konbini Drinks tab: case, width and punctuation are
// ignored, every word must match, and a word may also match across spaces ("mugicha" finds "mugi cha").
export const norm = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function matchesAll(fields: string[], q: string): boolean {
  const n = norm(q);
  if (!n) return true;
  const hay = norm(fields.join(' '));
  const squashed = hay.replace(/ /g, '');
  return n.split(' ').every((w) => hay.includes(w) || squashed.includes(w));
}
