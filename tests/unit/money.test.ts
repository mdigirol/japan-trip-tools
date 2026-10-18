import { describe, expect, it } from 'vitest';
import { fmtUsd, fmtYen, taxIn, usdToYen, withoutTax, withTax, yenToUsd } from '../../src/lib/rates';

describe('yen and dollars', () => {
  const r = 1 / 150;
  it('converts both ways', () => {
    expect(yenToUsd(3000, r)).toBeCloseTo(20);
    expect(usdToYen(20, r)).toBeCloseTo(3000);
  });
  it('formats', () => {
    expect(fmtYen(30000)).toBe('¥30,000');
    expect(fmtYen(1234.6)).toBe('¥1,235');
    expect(fmtUsd(0.6666)).toBe('$0.67');
    expect(fmtUsd(3.333)).toBe('$3.33');
    expect(fmtUsd(333.33)).toBe('$333');
    expect(fmtUsd(1234.5)).toBe('$1,235');
  });
});

describe('税込 / 税抜', () => {
  it('adds 10% (rounded down at the register)', () => {
    expect(withTax(1000)).toBe(1100);
    expect(withTax(1980)).toBe(2178);
    expect(withTax(999)).toBe(1098);
  });
  it('adds 8% for takeaway food', () => {
    expect(withTax(500, 0.08)).toBe(540);
  });
  it('takes tax back out', () => {
    expect(withoutTax(1100)).toBe(1000);
    expect(taxIn(1100)).toBe(100);
    expect(taxIn(5500)).toBe(500);
  });
});
