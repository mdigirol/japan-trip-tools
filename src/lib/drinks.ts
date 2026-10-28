// Konbini drinks (#23, #34): sort A–Z by brand, group by type, or group by what each drink is sold for.
import { DRINK_KINDS, DRINK_PURPOSES, type KonbiniDrink } from '../data/schema';

export type DrinkKind = (typeof DRINK_KINDS)[number];
export type DrinkPurpose = (typeof DRINK_PURPOSES)[number];
export type DrinkSort = 'az' | 'type' | 'use';
export interface DrinkGroup { kind?: DrinkKind; purpose?: DrinkPurpose; drinks: KonbiniDrink[] }

const byBrand = (a: KonbiniDrink, b: KonbiniDrink) =>
  a.brand.localeCompare(b.brand, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id);

// A–Z gives one group with no heading. By type gives one group per kind, in DRINK_KINDS order.
// By use gives one group per purpose, in DRINK_PURPOSES order; a drink sold for two things appears
// under both, and everyday drinks (no purpose) are left out. Empty groups are left out.
export function drinkGroups(list: KonbiniDrink[], sort: DrinkSort, only?: DrinkPurpose): DrinkGroup[] {
  const shown = [...list].filter((d) => !only || d.purposes.includes(only)).sort(byBrand);
  if (sort === 'az') return shown.length ? [{ drinks: shown }] : [];
  if (sort === 'type') {
    return DRINK_KINDS.map((k) => ({ kind: k, drinks: shown.filter((d) => d.kind === k) }))
      .filter((g) => g.drinks.length > 0);
  }
  return DRINK_PURPOSES.filter((p) => !only || p === only)
    .map((p) => ({ purpose: p, drinks: shown.filter((d) => d.purposes.includes(p)) }))
    .filter((g) => g.drinks.length > 0);
}
