import { describe, expect, it } from 'vitest';
import { JMA_AREAS, jmaAreaForCity, jmaUrl, nearestJmaArea } from '../../src/lib/jma';
import { cityCoords, dayByDate, trip, weatherCities } from '../../src/lib/trip';

describe('JMA area links', () => {
  it('builds the English local forecast URL for an area code', () => {
    expect(jmaUrl('1311000')).toBe('https://www.jma.go.jp/bosai/#lang=en&pattern=forecast&area_type=class20s&area_code=1311000');
  });
  it('has unique 7-digit codes', () => {
    const codes = JMA_AREAS.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c).toMatch(/^\d{7}$/);
  });
  it('maps every area’s own center back to itself', () => {
    for (const a of JMA_AREAS) expect(nearestJmaArea(a)?.code).toBe(a.code);
  });
  it('finds the ward for known spots, and nothing far from the trip', () => {
    expect(nearestJmaArea({ lat: 35.6595, lng: 139.7005 })?.name).toBe('Shibuya City');   // Shibuya Crossing
    expect(nearestJmaArea({ lat: 35.6852, lng: 139.7528 })?.name).toBe('Chiyoda City');   // Imperial Palace
    expect(nearestJmaArea({ lat: 34.6852, lng: 135.8430 })?.name).toBe('Western Nara City'); // Nara Park
    expect(nearestJmaArea({ lat: 43.0621, lng: 141.3544 })).toBeUndefined();              // Sapporo
  });
  it('picks the area from the day’s own stops, per city', () => {
    const d15 = dayByDate('2026-11-15')!;   // Meiji Jingu → Harajuku → Shibuya
    expect(jmaAreaForCity(cityCoords.tokyo, d15).city).toBe('tokyo');
    const d25 = dayByDate('2026-11-25')!;   // DisneySea
    expect(jmaAreaForCity(cityCoords.tokyo, d25).name).toBe('Urayasu City');
  });
  it('gives every weather city on every day an area in that city', () => {
    for (const d of trip.days) {
      for (const c of weatherCities(d)) expect(jmaAreaForCity(c, d).city).toBe(c.id);
    }
  });
});
