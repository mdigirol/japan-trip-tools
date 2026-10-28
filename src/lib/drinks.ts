// Konbini drinks (#23, #34, #40): sort A–Z by brand, group by type, or group by what each drink is sold for;
// filter by type and search the label text.
import { DRINK_KIND_LABELS, DRINK_PURPOSE_LABELS } from '../data/konbiniDrinks';
import { DRINK_KINDS, DRINK_PURPOSES, type KonbiniDrink } from '../data/schema';
import { matchesAll } from './search';

export type DrinkKind = (typeof DRINK_KINDS)[number];
export type DrinkPurpose = (typeof DRINK_PURPOSES)[number];
export type DrinkSort = 'az' | 'type' | 'use';
export interface DrinkGroup { kind?: DrinkKind; purpose?: DrinkPurpose; drinks: KonbiniDrink[] }

const byBrand = (a: KonbiniDrink, b: KonbiniDrink) =>
  a.brand.localeCompare(b.brand, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id);

// Search covers what you can see on the shelf (brand, Japanese, romaji, the look line with its colors
// and logos) plus the note, the type and what it's sold for.
export function matchDrink(d: KonbiniDrink, q: string): boolean {
  return matchesAll([d.brand, d.ja, d.romaji, d.look, d.note, DRINK_KIND_LABELS[d.kind], ...d.purposes.map((p) => DRINK_PURPOSE_LABELS[p])], q);
}

// A–Z gives one group with no heading. By type gives one group per kind, in DRINK_KINDS order.
// By use gives one group per purpose, in DRINK_PURPOSES order; a drink sold for two things appears
// under both, and everyday drinks (no purpose) are left out. Empty groups are left out.
export function drinkGroups(list: KonbiniDrink[], sort: DrinkSort, only?: DrinkKind, q = ''): DrinkGroup[] {
  const shown = list.filter((d) => (!only || d.kind === only) && matchDrink(d, q)).sort(byBrand);
  if (sort === 'az') return shown.length ? [{ drinks: shown }] : [];
  if (sort === 'type') {
    return DRINK_KINDS.map((k) => ({ kind: k, drinks: shown.filter((d) => d.kind === k) }))
      .filter((g) => g.drinks.length > 0);
  }
  return DRINK_PURPOSES.map((p) => ({ purpose: p, drinks: shown.filter((d) => d.purposes.includes(p)) }))
    .filter((g) => g.drinks.length > 0);
}
