# Japan Trip Companion — conventions

Phone-first offline web app for Matt and Katherine's Japan trip, Nov 11–27, 2026. Spec: `SPEC.md`. Content notes: `context/`.

## Public repo rules

- **This repo and site are public.** Commit nothing confidential: no booking or confirmation numbers, reservation names, prices paid, tokens or keys, and no personal names beyond what's already in `SPEC.md`.
- The sync token lives only on the phones (localStorage). Never in source, the build, the workflow or a test fixture.
- Souvenir recipients and purchases live only on the phones and in the private `mdigirol/japan-trip-tools-data` repo.
- `data/local/trip.json` comes from the itinerary via `npm run sync-trip`. `tests/unit/trip.test.ts` fails the build on anything outside the schema or anything that looks like a booking number, price, token or clock time. Don't loosen it to make an export pass; fix the export.

## Shared code

- Shared code comes from `japan-trip-tools-public` by `git fetch public && git merge public/main` (push to `public` is disabled). Nothing goes from here to public.
- On conflicts: public wins for code; this repo wins for `README.md`, `CLAUDE.md`, `SPEC.md`, `context/` and `package.json` (name, `sync-trip`).
- Real data lives in `data/local/` (tracked here via `data/local/.tracked-ok`). Build settings are in the tracked `.env` (`VITE_DATA_REPO`, `VITE_ITINERARY_URL`).
- Checks that only apply to this itinerary go in files public doesn't have (`tests/unit/local-trip.test.ts`), so merges never conflict on them.

## Content

- American English in UI copy, comments and docs.
- Every content item carries `source` tags (`N`, `K`, `T`, `I`, `V`, `JNTO`; see `context/README.md`).
- Safety-relevant `[V]` facts (emergency numbers, tax-free rules, transit rules) need an official `sourceUrl` before the freeze (Nov 8). Phone numbers are verified before the trip; set `verified: true` only with an official URL.
- All Japanese ships as a draft, `reviewed: false` (D9). `npm run review-sheet` exports it; `npm run review-import` applies the native speaker's corrections. Dev builds show an amber dot on unreviewed strings.
- Copyright: never paste text from the purchased guides. Paraphrase only. The guides stay in Dropbox.
- No flashcards (D4). No shared favorites (D6).
- UI copy: short, plain, specific. One idea per line on cards.

## Code

- Vite + TypeScript + Preact, plain CSS with custom properties (`src/styles.css`). No CSS framework, no web fonts.
- Hash routes (`#/phrases?tab=bar`), one file per module in `src/routes/`. Register new tools in `src/lib/modules.ts` (`ready: true` shows the tile).
- All date logic goes through `src/lib/now.ts` (Asia/Tokyo). `?now=2026-11-21T08:00%2B09:00` overrides the clock.
- Today's logic lives in `src/lib/trip.ts` (`todayState`). Today shows no stop names or times from the itinerary.
- Storage: IndexedDB via `src/lib/db.ts` (purchases, photos, sync queue, API cache); `localStorage` via `src/lib/settings.ts` (try/catch).
- Sync (`src/lib/sync.ts`): pull, merge (last write wins by `updatedAt`), then push the queue. Photos never sync.
- Service worker: `vite-plugin-pwa` (generateSW) in `vite.config.ts`. Live APIs (rates, weather, Overpass) are network-first with cache fallback; GitHub is never cached.
- Every phone-facing screen must work at 375 px wide, in both themes, with the network off. Tap targets ≥ 44 px.

## Commands

- `npm run dev` — dev server at http://localhost:5173/japan-trip-tools/
- `npm test` — Vitest (logic, content schemas, trip.json confidentiality)
- `npm run test:e2e` — Playwright against the production build (offline, `?now=` scenarios, cards, claim log)
- `npm run build` — typecheck and build to `dist/`
- `npm run sync-trip` — re-export `trip.json` from `~/Documents/japan-trip-itinerary` and run its tests
- `npm run build-konbini` — refresh the offline konbini list from Overpass
- `npm run review-sheet` / `npm run review-import` — the Japanese review round trip

## Other repos

- The itinerary repo (`~/Documents/japan-trip-itinerary`) is read-only from here, except `scripts/export-trip.mjs`, which only reads its `index.html`. Several sessions edit that `index.html`.
- Deploys: push to `main` → GitHub Actions runs the tests, builds, and publishes to Pages. No secrets in the workflow.
