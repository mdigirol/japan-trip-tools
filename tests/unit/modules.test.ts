import { describe, expect, it } from 'vitest';
import { MODULES, moveModule, navModules, orderedModules } from '../../src/lib/modules';

const paths = (order: string[]) => orderedModules(order).map((m) => m.path);
const ready = MODULES.filter((m) => m.ready).map((m) => m.path);

describe('tool order', () => {
  it('defaults to the MODULES order', () => {
    expect(paths([])).toEqual(ready);
    expect(navModules([]).map((m) => m.path)).toEqual(['phrases', 'cards', 'etiquette']);
  });
  it('puts saved tools first, keeps the rest in default order, Settings last', () => {
    const p = paths(['konbini', 'currency']);
    expect(p.slice(0, 2)).toEqual(['konbini', 'currency']);
    expect(p.at(-1)).toBe('settings');
    expect(new Set(p).size).toBe(ready.length);
  });
  it('ignores unknown, duplicate and pinned paths', () => {
    const p = paths(['gone', 'settings', 'units', 'units']);
    expect(p[0]).toBe('units');
    expect(p.at(-1)).toBe('settings');
    expect(p).not.toContain('gone');
  });
  it('the bar follows the saved order and never shows Settings', () => {
    expect(navModules(['settings', 'transit', 'emergency']).map((m) => m.path)).toEqual(['transit', 'emergency', 'phrases']);
  });
  it('moves a tool up and down, stopping at the ends', () => {
    expect(moveModule([], 'cards', -1).slice(0, 2)).toEqual(['cards', 'phrases']);
    expect(moveModule([], 'phrases', -1)[0]).toBe('phrases');
    const last = moveModule([], 'shopping', 1);
    expect(last.at(-1)).toBe('shopping');
    expect(last).not.toContain('settings');
  });
});
