// Kuli Kuli button (#41): iPhone gets the universal link, Android the Play Store listing.
import { describe, expect, it } from 'vitest';
import { KULI_KULI_LINK, KULI_KULI_PLAY, kuliKuliHref } from '../../src/components/KuliKuli';

describe('kuliKuliHref', () => {
  it('uses the universal link on iPhone and desktop', () => {
    expect(kuliKuliHref('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15')).toBe(KULI_KULI_LINK);
    expect(kuliKuliHref('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(KULI_KULI_LINK);
  });
  it('uses the Play Store listing on Android', () => {
    expect(kuliKuliHref('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36')).toBe(KULI_KULI_PLAY);
  });
  it('links are https', () => {
    for (const u of [KULI_KULI_LINK, KULI_KULI_PLAY]) expect(u).toMatch(/^https:\/\//);
  });
});
