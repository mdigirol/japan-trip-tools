import { describe, expect, it } from 'vitest';
import { stamp, tokyo } from '../../src/lib/now';

describe('stamp', () => {
  it('defaults to Tokyo time with a JST label', () => {
    expect(stamp('2026-11-02T00:00:00Z')).toBe('Nov 2, 9:00 AM JST');
  });

  it('shows US Eastern with an ET label, on its own calendar date', () => {
    expect(stamp('2026-11-02T00:00:00Z', 'ET')).toBe('Nov 1, 7:00 PM ET');
  });

  it('follows US daylight saving, which ends Nov 1, 2026', () => {
    expect(stamp('2026-10-31T16:00:00Z', 'ET')).toBe('Oct 31, 12:00 PM ET');  // EDT, UTC-4
    expect(stamp('2026-11-02T17:00:00Z', 'ET')).toBe('Nov 2, 12:00 PM ET');   // EST, UTC-5
  });

  it('accepts epoch milliseconds', () => {
    expect(stamp(Date.parse('2026-11-14T00:02:00Z'), 'JST')).toBe('Nov 14, 9:02 AM JST');
  });
});

describe('tokyo', () => {
  it('stays on Tokyo time', () => {
    expect(tokyo(new Date('2026-11-02T00:00:00Z')).ymd).toBe('2026-11-02');
  });
});
