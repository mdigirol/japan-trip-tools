import { describe, expect, it } from 'vitest';
import data from '@data/konbini-near-stops.json';
import { brandOf, distM } from '../../src/lib/overpass';

const days = (data as { days: Record<string, { lat: number; lng: number; nearHotel: boolean; brand: string }[]> }).days;
const nov21 = days['2026-11-21'] ?? [];

describe('konbini', () => {
  it('normalizes brands', () => {
    expect(brandOf({ brand: 'セブン-イレブン' })).toBe('7-Eleven');
    expect(brandOf({ name: 'ローソン 京都三条店' })).toBe('Lawson');
    expect(brandOf({ 'brand:en': 'FamilyMart' })).toBe('FamilyMart');
    expect(brandOf({ name: 'Some shop' })).toBe('Other');
  });

  // AC §6.12. Skipped only until `npm run build-konbini` has filled Nov 21.
  it.skipIf(!nov21.length)('Nov 21 lists stores near Kinkaku-ji, Nara Park and the Kyoto hotel', () => {
    const near = (lat: number, lng: number, m = 700) => nov21.some((k) => distM(k, { lat, lng }) <= m);
    expect(nov21.some((k) => k.nearHotel)).toBe(true);
    expect(near(35.0394, 135.7292)).toBe(true);   // Kinkaku-ji
    expect(near(34.6851, 135.8430, 1500)).toBe(true);   // Nara Park: no store inside the park; nearest are by Kintetsu Nara
  });
});
