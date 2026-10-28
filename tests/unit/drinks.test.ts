// Konbini Drinks tab: A–Z, By type and By use ordering, the type filter and search, with inline fixtures (not the real list).
import { describe, expect, it } from 'vitest';
import type { KonbiniDrink } from '../../src/data/schema';
import { drinkGroups, matchDrink } from '../../src/lib/drinks';

const d = (id: string, brand: string, purposes: KonbiniDrink['purposes'], kind: KonbiniDrink['kind'] = 'functional'): KonbiniDrink => ({
  id, brand, ja: 'テスト', romaji: 'tesuto', kind, purposes, look: 'Can', note: 'Test.',
  caffeine: false, productUrl: 'https://example.com/', source: ['N'], reviewed: false
});
const list = [d('c', 'zeta', ['energy']), d('a', 'Alpha', ['after-drinking', 'stomach']), d('b', 'beta', ['hydration'])];
const mixed = [...list, d('t', 'Tango', [], 'tea'), d('s', 'Sierra', [], 'soft-drink'), { ...d('x', 'Xray', [], 'alcohol'), abv: 5 }];

describe('drinkGroups', () => {
  it('A–Z sorts by brand, ignoring case, in one group with no heading', () => {
    const g = drinkGroups(list, 'az');
    expect(g).toHaveLength(1);
    expect(g[0].purpose).toBeUndefined();
    expect(g[0].drinks.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('By use groups in purpose order, repeats two-purpose drinks, and skips empty groups', () => {
    const g = drinkGroups(list, 'use');
    expect(g.map((x) => x.purpose)).toEqual(['after-drinking', 'stomach', 'energy', 'hydration']);
    expect(g.map((x) => x.drinks.map((y) => y.id))).toEqual([['a'], ['a'], ['c'], ['b']]);
  });
  it('By type groups in kind order, sorted A–Z inside, and skips empty kinds', () => {
    const g = drinkGroups(mixed, 'type');
    expect(g.map((x) => x.kind)).toEqual(['tea', 'soft-drink', 'functional', 'alcohol']);
    expect(g.map((x) => x.drinks.map((y) => y.id))).toEqual([['t'], ['s'], ['a', 'b', 'c'], ['x']]);
  });
  it('By use leaves out everyday drinks with no purpose', () => {
    expect(drinkGroups(mixed, 'use').flatMap((x) => x.drinks.map((y) => y.id))).not.toContain('t');
  });
  it('the type filter applies to every view', () => {
    expect(drinkGroups(mixed, 'az', 'tea')[0].drinks.map((x) => x.id)).toEqual(['t']);
    expect(drinkGroups(mixed, 'type', 'alcohol').map((x) => x.kind)).toEqual(['alcohol']);
    expect(drinkGroups(mixed, 'use', 'functional').map((x) => x.purpose)).toEqual(['after-drinking', 'stomach', 'energy', 'hydration']);
    expect(drinkGroups(mixed, 'use', 'tea')).toEqual([]);
    expect(drinkGroups(mixed, 'az', 'water')).toEqual([]);
  });
  it('search narrows every view and combines with the type filter', () => {
    const can = [...mixed, { ...d('k', 'Kilo', [], 'alcohol'), look: 'Silver can, 350 ml', abv: 5 }];
    expect(drinkGroups(can, 'az', undefined, 'silver')[0].drinks.map((x) => x.id)).toEqual(['k']);
    expect(drinkGroups(can, 'type', 'tea', 'silver')).toEqual([]);
    expect(drinkGroups(can, 'az', undefined, '  ')[0].drinks).toHaveLength(can.length);
  });
});

describe('matchDrink', () => {
  const x = { ...d('m', 'Kenko Mineral Mugicha', ['hydration'], 'tea'), ja: '健康ミネラルむぎ茶', romaji: 'kenkō mineraru mugicha', look: 'PET bottle, green label', note: 'Roasted barley tea.' };
  it('matches brand, Japanese, romaji, look and note, ignoring case', () => {
    for (const q of ['MUGICHA', 'むぎ茶', 'kenkō', 'green label', 'barley']) expect(matchDrink(x, q), q).toBe(true);
  });
  it('matches the type and what it is sold for', () => {
    expect(matchDrink(x, 'tea')).toBe(true);
    expect(matchDrink(x, 'hydration')).toBe(true);
  });
  it('needs every word to match', () => {
    expect(matchDrink(x, 'green bottle')).toBe(true);
    expect(matchDrink(x, 'green can')).toBe(false);
  });
});

describe('drinkGroups input', () => {
  it('does not reorder the input', () => {
    drinkGroups(list, 'az');
    expect(list.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});
