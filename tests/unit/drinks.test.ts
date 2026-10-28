// Konbini Drinks tab: A–Z, By type and By use ordering, with inline fixtures (not the real list).
import { describe, expect, it } from 'vitest';
import type { KonbiniDrink } from '../../src/data/schema';
import { drinkGroups } from '../../src/lib/drinks';

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
  it('the purpose filter applies to every view', () => {
    expect(drinkGroups(list, 'az', 'stomach')[0].drinks.map((x) => x.id)).toEqual(['a']);
    expect(drinkGroups(list, 'use', 'stomach').map((x) => x.purpose)).toEqual(['stomach']);
    expect(drinkGroups(list, 'az', 'warm-up')).toEqual([]);
    expect(drinkGroups(list, 'use', 'warm-up')).toEqual([]);
    expect(drinkGroups(mixed, 'type', 'hydration').map((x) => x.kind)).toEqual(['functional']);
  });
  it('does not reorder the input', () => {
    drinkGroups(list, 'az');
    expect(list.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});
