// Kuli Kuli button (#41): the App Store listing on iPhone (and anything not Android), the Play Store listing on Android.
import { describe, expect, it } from 'vitest';
import { KULI_KULI_APP_STORE, KULI_KULI_PLAY, kuliKuliHref } from '../../src/components/KuliKuli';

describe('kuliKuliHref', () => {
  it('uses the App Store on iPhone, iPad and desktop', () => {
    expect(kuliKuliHref('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15')).toBe(KULI_KULI_APP_STORE);
    expect(kuliKuliHref('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(KULI_KULI_APP_STORE);
  });
  it('uses the Play Store on Android', () => {
    expect(kuliKuliHref('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36')).toBe(KULI_KULI_PLAY);
  });
  it('links are https store listings', () => {
    expect(KULI_KULI_APP_STORE).toMatch(/^https:\/\/apps\.apple\.com\//);
    expect(KULI_KULI_PLAY).toMatch(/^https:\/\/play\.google\.com\//);
  });
});
