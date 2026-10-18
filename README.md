# Japan Trip Companion

A phone-first, offline web app for Nov 11–27, 2026: what to say, do, or pay, right now. It sits beside the itinerary site; the itinerary covers where and when, this covers how.

**Site:** https://mdigirol.github.io/japan-trip-tools/ (public by design; see `SPEC.md` §2)

## Install on an iPhone

1. Open the site in Safari, while online.
2. Share → **Add to Home Screen**.
3. Open it once from the home screen while online. Settings shows **Ready for offline ✓** when the cache is full.
4. Settings → paste the sync token (see below) and set "Who is using this phone".

## What's in it

| Tool | What it does |
| --- | --- |
| Today | Date and city, weather, today's neighborhoods with tips, tonight's hotel taxi card, suggestions |
| Phrases | Situation tabs, search, tap to hear, hold for full screen, fill-in slots, stars |
| Show cards | Hotel taxi cards from `trip.json`, dining, bath and other cards; screen stays awake |
| Etiquette | Do/don't cards by place type and area, must-first |
| Currency | Live rate (cached), manual override, quick table, calculator with 税込/税抜, units |
| Emergency | Tap-to-call numbers, ambulance card with tonight's hotel, earthquakes, pharmacy |
| Souvenirs & tax-free | One purchase store: souvenir view by recipient, claim log by bag, Nov 27 customs checklist |
| Konbini | Offline list near each day's areas and hotel; live "near me" |
| Signs & menus, Transit, Numbers, Shopping | Reference |

## Sync between the phones

Purchases sync through GitHub Issues in the private repo `mdigirol/japan-trip-tools-data`.

1. Create the private repo `japan-trip-tools-data`, and add the labels `souvenir`, `taxfree` and `deleted`.
2. Create a fine-grained token: **Only select repositories** → `japan-trip-tools-data`; **Issues: Read and write**; expiry after Dec 31, 2026.
3. Paste it into Settings on each phone. It stays in that phone's storage only.

Photos stay on the phone that took them.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173/japan-trip-tools/
npm test             # Vitest
npm run test:e2e     # Playwright (builds and serves the production bundle)
npm run sync-trip    # refresh src/data/trip.json from the itinerary
npm run build-konbini
npm run review-sheet # Japanese strings → review/japanese-strings.csv
```

Add `?now=2026-11-21T08:00%2B09:00` to any URL to test a date.

Conventions are in `CLAUDE.md`.
