import { describe, expect, it } from 'vitest';
import { readNumber, readTime, readYen } from '../../src/lib/numbers';

describe('number readings', () => {
  const table: [number, string][] = [
    [1, 'ichi'], [4, 'yon'], [9, 'kyuu'], [10, 'juu'], [11, 'juuichi'], [20, 'nijuu'], [99, 'kyuujuukyuu'],
    [100, 'hyaku'], [300, 'sanbyaku'], [600, 'roppyaku'], [800, 'happyaku'], [450, 'yonhyaku gojuu'],
    [1000, 'sen'], [3000, 'sanzen'], [8000, 'hassen'], [2500, 'nisen gohyaku'],
    [10000, 'ichiman'], [30000, 'sanman'], [15000, 'ichiman gosen'], [50000, 'goman'],
    [100000, 'juuman'], [1000000, 'hyakuman'], [10000000, 'issenman'], [123456, 'juuniman sanzen yonhyaku gojuuroku']
  ];
  it.each(table)('%i → %s', (n, r) => expect(readNumber(n).romaji).toBe(r));
  it('kana', () => {
    expect(readNumber(3480).kana).toBe('さんぜんよんひゃくはちじゅう');
    expect(readNumber(10000).kana).toBe('いちまん');
  });
});

describe('prices', () => {
  it('reads the spec example', () => expect(readYen(3480).romaji).toBe('sanzen yonhyaku hachijuu en'));
  it('says yo en for a final 4', () => {
    expect(readYen(4).romaji).toBe('yo en');
    expect(readYen(1004).romaji).toBe('sen yo en');
    expect(readYen(14).romaji).toBe('juuyo en');
  });
  it('kana', () => expect(readYen(500).kana).toBe('ごひゃくえん'));
});

describe('times', () => {
  it.each([
    [7, 30, 'gozen shichiji han'], [16, 0, 'gogo yoji'], [9, 15, 'gozen kuji juugofun'], [12, 10, 'gogo juuniji juppun'],
    [21, 1, 'gogo kuji ippun'], [8, 20, 'gozen hachiji nijuppun'], [13, 45, 'gogo ichiji yonjuugofun']
  ] as const)('%i:%i → %s', (h, m, r) => expect(readTime(h, m).romaji).toBe(r));
});
