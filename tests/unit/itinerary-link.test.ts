import { describe, expect, it } from 'vitest';
import { itineraryDayUrl } from '../../src/lib/trip';

describe('itineraryDayUrl', () => {
  it('links to the day anchor when a base URL is configured', () => {
    expect(itineraryDayUrl('2026-11-21', 'https://example.com/trip/')).toBe('https://example.com/trip/#d21');
    expect(itineraryDayUrl('2026-11-05', 'https://example.com/trip/')).toBe('https://example.com/trip/#d5');
  });
  it('returns nothing without a base URL, so the Today link stays hidden', () => {
    expect(itineraryDayUrl('2026-11-21', '')).toBeUndefined();
  });
});
