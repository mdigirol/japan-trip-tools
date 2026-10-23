import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dataFile } from '../../scripts/build-env';

const trip = JSON.parse(readFileSync(dataFile('trip.json', 'sample'), 'utf8')) as {
  stays: { id: string; addrJa: string }[]; days: { hoods: { name: string; blurb: string }[] }[];
};

// Keep live APIs out of the tests: weather and rates fall back to "typical" and "Set a rate".
async function blockApis(page: Page) {
  await page.route(/open-meteo|frankfurter|er-api|overpass|api\.github\.com/, (r) => r.abort());
}
const at = (iso: string, hash = '') => `./?now=${encodeURIComponent(iso)}${hash}`;

test.beforeEach(async ({ page }) => { await blockApis(page); });

test('cold start offline after one online load', async ({ page, context }) => {
  await page.goto(at('2026-11-21T08:00+09:00'));
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();                                   // now controlled by the service worker
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sat, Nov 21 · Kyoto');
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
  for (const [hash, h1] of [['#/phrases', 'Phrases'], ['#/cards', 'Show cards'], ['#/etiquette', 'Etiquette'], ['#/currency', 'Currency'], ['#/emergency', 'Emergency']]) {
    await page.goto(at('2026-11-21T08:00+09:00', hash));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
  }
  await expect(page.getByTestId('tel-ambulance')).toBeVisible();
});

test('each MVP route renders', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [hash, h1] of [['', 'Sat, Nov 21 · Kyoto'], ['#/phrases', 'Phrases'], ['#/cards', 'Show cards'], ['#/etiquette', 'Etiquette'],
    ['#/currency', 'Currency'], ['#/emergency', 'Emergency'], ['#/more', 'More'], ['#/settings', 'Settings'], ['#/shopping', 'Shopping & tax-free'], ['#/purchases', 'Souvenirs & tax-free'],
    ['#/konbini', 'Konbini'], ['#/decoder', 'Signs & menus'], ['#/transit', 'Transit'], ['#/numbers', 'Numbers']]) {
    await page.goto(at('2026-11-21T08:00+09:00', hash));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
  }
  expect(errors).toEqual([]);
});

const scenarios: [string, string, string, string[], string?][] = [
  ['2026-11-12T18:00+09:00', 'Thu, Nov 12 · Tokyo', 'tokyo-1', ['Shinjuku']],
  ['2026-11-17T10:00+09:00', 'Tue, Nov 17 · Hakone', 'hakone', ['Hakone'], 'tokyo-1'],
  ['2026-11-17T16:00+09:00', 'Tue, Nov 17 · Hakone', 'hakone', ['Hakone']],
  ['2026-11-20T09:00+09:00', 'Fri, Nov 20 · Kyoto', 'kyoto', ['Fushimi Inari', 'Namba and Dotonbori']],
  ['2026-11-25T12:00+09:00', 'Wed, Nov 25 · Tokyo', 'tokyo-2', ['Maihama (Tokyo Bay)']],
  ['2026-11-27T08:00+09:00', 'Fri, Nov 27 · Tokyo', 'tokyo-2', ['Kappabashi']]
];

for (const [when, h1, hotel, hoods, checkingOut] of scenarios) {
  test(`Today at ${when}`, async ({ page }) => {
    await page.goto(at(when));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
    await expect(page.getByTestId(`hotel-${hotel}`)).toBeVisible();
    for (const h of hoods) await expect(page.getByRole('heading', { level: 3, name: h })).toBeVisible();
    if (checkingOut) {
      await expect(page.getByText(/^Checking out of/)).toBeVisible();
      await expect(page.getByTestId(`hotel-${checkingOut}`)).toBeVisible();
    } else {
      await expect(page.getByText(/^Checking out of/)).toHaveCount(0);
    }
  });
}


test('hotel show cards use the exact addrJa, and request a wake lock', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __wl: number }).__wl = 0;
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: async () => { (window as unknown as { __wl: number }).__wl++; return { release: async () => {} }; } }
    });
  });
  await page.goto(at('2026-11-21T08:00+09:00', '#/cards'));
  for (const s of trip.stays) {
    await page.getByTestId(`card-hotel-${s.id}`).click();
    await expect(page.getByTestId('sc-ja')).toHaveText(s.addrJa);
    await page.getByRole('button', { name: 'Close card' }).click();
  }
  expect(await page.evaluate(() => (window as unknown as { __wl: number }).__wl)).toBeGreaterThanOrEqual(4);
});

test('fixed show cards show romaji, with the slot filled in', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/cards'));
  await page.getByTestId('card-call-taxi').click();
  await expect(page.getByTestId('sc-romaji')).toHaveText('Takushii o yonde itadakemasu ka?');
  await page.getByRole('button', { name: 'Close card' }).click();
  await page.getByRole('button', { name: 'wallet' }).click();
  await page.getByTestId('card-lost-item').click();
  await expect(page.getByTestId('sc-romaji')).toHaveText('saifu o nakushimashita. Todoite imasen ka?');
});

test('currency says "Set a rate" with no rate, and works with a manual one', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/currency'));
  await expect(page.getByTestId('set-rate')).toBeVisible();
  await expect(page.getByTestId('calc-out')).toHaveText('Set a rate');
  await page.getByLabel('Yen per dollar').fill('150');
  await page.getByRole('button', { name: 'Use' }).click();
  await expect(page.getByTestId('qref')).toContainText('$67');
  await page.getByTestId('focus-usd').click();
  await expect(page.getByTestId('qref')).toContainText('¥1,500');
  await expect(page.getByRole('heading', { name: 'Units' })).toHaveCount(0);
  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: '00', exact: true }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await expect(page.getByTestId('calc-in')).toHaveText('¥3,000');
  await expect(page.getByTestId('calc-out')).toHaveText('= $20');
  await page.getByTestId('tax-10').click();
  await expect(page.getByTestId('calc-tax')).toContainText('¥3,300');
});

test('units has its own screen', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/units'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Units');
  await page.getByPlaceholder('°C').fill('20');
  await expect(page.getByPlaceholder('°F')).toHaveValue('68');
});

test('tool order in Settings drives the tiles and the bottom bar', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/settings'));
  const nav = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
  await expect(nav).toHaveText(['☀︎Today', '💬Phrases', '🪪Cards', '🙇Etiquette', '☰More']);
  await page.getByRole('button', { name: 'Move Currency up' }).click();
  await expect(nav.nth(3)).toHaveText('¥Currency');
  await page.reload();
  await expect(nav.nth(3)).toHaveText('¥Currency');
  await page.goto(at('2026-11-21T08:00+09:00', '#/'));
  await expect(page.locator('.tiles a').nth(2)).toHaveText('¥Currency');
  await page.goto(at('2026-11-21T08:00+09:00', '#/settings'));
  await page.getByRole('button', { name: 'Reset order' }).click();
  await expect(nav.nth(3)).toHaveText('🙇Etiquette');
});

test('sync is hidden with no data repo, and the claim-log checklist ticks', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/settings'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await expect(page.getByRole('heading', { name: 'Sync between phones' })).toHaveCount(0);
  await expect(page.getByText('Names stay on this phone. They’re never in the public site.')).toBeVisible();
  await page.goto(at('2026-11-21T08:00+09:00', '#/purchases?view=add'));
  await expect(page.locator('input[name=item]')).toBeVisible();
  await expect(page.getByTestId('sync-status')).toHaveCount(0);
  await page.locator('input[name=item]').fill('Knife');
  await page.locator('input[name=price]').fill('16500');
  await page.locator('input[name=shop]').fill('Kama-asa');
  await page.locator('input[name=taxFree]').check();
  await page.getByRole('button', { name: 'Save purchase' }).click();
  await expect(page.getByRole('status')).toContainText('Saved');
  await page.goto(at('2026-11-21T08:00+09:00', '#/purchases?view=claim&check=1'));
  await expect(page.getByText('¥1,500', { exact: true })).toBeVisible();
  const box = page.getByLabel('Shown at customs: Knife');
  await box.check();
  await expect(box).toBeChecked();
  await expect(page.getByText('Checklist: 1 of 1 shown')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Shown at customs: Knife')).toBeChecked();
  await expect(page.getByText('Checklist: 1 of 1 shown')).toBeVisible();
});

test('konbini "Near me" degrades to the saved list with a message', async ({ page, context }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/konbini'));
  await context.setOffline(true);
  await page.getByRole('button', { name: /Near me/ }).click();
  await expect(page.getByTestId('konbini-msg')).toContainText('Showing today’s saved list');
  await expect(page.getByRole('heading', { name: /Near today’s areas/ })).toBeVisible();
});

test('konbini Drinks tab lists drinks, groups by use, and keeps the Stores tab', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/konbini?tab=drinks'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Konbini');
  await expect(page.locator('[data-testid^="drink-"]').first()).toBeVisible();
  await page.getByRole('button', { name: 'By use' }).click();
  await expect(page.getByRole('button', { name: 'By use' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 2, name: /^(After drinking|Stomach|Sleep \/ relax|Energy|Warm-up|Hydration)$/ }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Stores' }).click();
  await expect(page.getByRole('heading', { name: 'Which chain for what' })).toBeVisible();
});

test('weather cards link to the JMA page for the day’s area', async ({ page }) => {
  await page.goto(at('2026-11-15T08:00+09:00'));
  const card = page.getByTestId('wx-tokyo');
  await expect(card).toHaveAttribute('href', /area_type=class20s&area_code=\d{7}$/);
  await expect(card).toHaveAttribute('target', '_blank');
  await expect(card).toHaveAttribute('rel', /noopener/);
  await expect(card).toContainText('JMA forecast,');
});

test('"Forecast where I am" offers the JMA page for the nearest area', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 35.6595, longitude: 139.7005 });
  await page.goto(at('2026-11-15T08:00+09:00'));
  await page.getByRole('button', { name: /Forecast where I am/ }).click();
  await expect(page.getByTestId('wx-here')).toHaveAttribute('href', /area_code=1311300$/);
  await expect(page.getByTestId('wx-here')).toContainText('Shibuya City');
});

test('"Forecast where I am" outside Japan says so and links the JMA map', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });
  await page.goto(at('2026-11-15T08:00+09:00'));
  await page.getByRole('button', { name: /Forecast where I am/ }).click();
  await expect(page.getByTestId('wx-here-msg')).toContainText('outside the areas');
  await expect(page.getByRole('link', { name: /JMA’s map/ })).toBeVisible();
});

test('numbers reads prices aloud in romaji', async ({ page }) => {
  await page.goto(at('2026-11-21T08:00+09:00', '#/numbers'));
  await expect(page.getByTestId('yen-romaji')).toHaveText('sanzen yonhyaku hachijuu en');
});
