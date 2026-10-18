import { describe, expect, it } from 'vitest';
import type { Purchase } from '../../src/data/schema';
import { byRecipient, claimTotals, mergePurchase, stillNeed, storeDays, taxDue } from '../../src/lib/purchases';
import { decodeBody, encodeBody, labelsFor } from '../../src/lib/sync';

const base = (o: Partial<Purchase>): Purchase => ({
  id: 'a', createdAt: '2026-11-13T01:00:00Z', updatedAt: '2026-11-13T01:00:00Z', by: 'M', item: 'Tea', date: '2026-11-13',
  priceYen: 1100, taxFree: false, ...o
});

describe('merge (last write wins)', () => {
  it('takes the newer record', () => {
    const local = base({ item: 'Old', updatedAt: '2026-11-13T01:00:00Z' });
    const remote = base({ item: 'New', updatedAt: '2026-11-13T02:00:00Z' });
    expect(mergePurchase(local, remote).item).toBe('New');
    expect(mergePurchase(remote, local).item).toBe('New');
    expect(mergePurchase(undefined, remote).item).toBe('New');
  });
  it('keeps local photos when the remote wins', () => {
    const local = base({ photoIds: ['p1'], updatedAt: '2026-11-13T01:00:00Z' });
    const remote = base({ updatedAt: '2026-11-13T03:00:00Z' });
    expect(mergePurchase(local, remote).photoIds).toEqual(['p1']);
  });
  it('a soft delete that is newer wins', () => {
    const local = base({});
    const remote = base({ deleted: true, updatedAt: '2026-11-14T00:00:00Z' });
    expect(mergePurchase(local, remote).deleted).toBe(true);
  });
});

describe('claim log', () => {
  const list = [
    base({ id: '1', shop: 'Uniqlo', priceYen: 3300, taxFree: true }),
    base({ id: '2', shop: 'uniqlo ', priceYen: 2200, taxFree: true }),
    base({ id: '3', shop: 'Loft', priceYen: 4400, taxFree: true, date: '2026-11-14' }),
    base({ id: '4', shop: 'Loft', priceYen: 9999, taxFree: false }),
    base({ id: '5', shop: 'Bic', priceYen: 11000, taxFree: true, deleted: true })
  ];
  it('totals the tax due back on tax-free, non-deleted items', () => {
    const t = claimTotals(list);
    expect(t.count).toBe(3);
    expect(t.taxYen).toBe(300 + 200 + 400);
    expect(taxDue(base({ priceYen: 1100, taxPaidYen: 90 }))).toBe(90);
  });
  it('checks the ¥5,000 minimum per store per day', () => {
    const d = storeDays(list);
    const uniqlo = d.find((x) => x.shop.toLowerCase().startsWith('uniqlo'))!;
    expect(uniqlo.preTaxYen).toBe(5000);
    expect(uniqlo.ok).toBe(true);
    const loft = d.find((x) => x.shop === 'Loft')!;
    expect(loft.preTaxYen).toBe(4000);
    expect(loft.ok).toBe(false);
  });
});

describe('souvenirs', () => {
  it('groups by recipient and finds who still needs something', () => {
    const list = [base({ id: '1', forWhom: ['Mom', 'Dad'] }), base({ id: '2', forWhom: [] })];
    const g = byRecipient(list);
    expect([...g.keys()].sort()).toEqual(['Dad', 'For us', 'Mom']);
    expect(stillNeed(['Mom', 'Sam'], list)).toEqual(['Sam']);
  });
});

describe('issue body', () => {
  it('round-trips a purchase', () => {
    const p = base({ forWhom: ['Mom'], taxFree: true, note: 'has --> arrow? no' });
    expect(decodeBody(encodeBody(p))).toEqual(p);
    expect(decodeBody('nothing here')).toBeNull();
  });
  it('labels souvenir, taxfree, deleted', () => {
    expect(labelsFor(base({ taxFree: true }))).toEqual(['taxfree']);
    expect(labelsFor(base({ forWhom: ['Mom'], taxFree: true, deleted: true }))).toEqual(['souvenir', 'taxfree', 'deleted']);
    expect(labelsFor(base({}))).toEqual(['souvenir']);
  });
});
