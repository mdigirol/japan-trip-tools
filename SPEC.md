# Japan Trip Companion · Build spec

**For:** a new Claude Code session in this folder.
**Owner:** Matt (mdigirol). Users: Matt and Katherine.
**Trip:** Nov 11–27, 2026 · Tokyo → Hakone → Kyoto (Osaka, Nara day trips) → Tokyo.
**Install-by date:** Nov 10, 2026 (the flight is Nov 11).
**Written:** 2026-10-18. Final revision the same day. Built from the scoping doc ([Japan Trip Companion — Scoping](https://claude.ai/code/artifact/fb65ddf5-33fa-4014-9210-32901d1f2f3c)) and the notes in `context/`.

---

## 0. How to use this spec

1. Read this file and `context/README.md` first, then the other `context/` files as each module needs them.
2. Nothing blocks the start. The open questions in §15 all have defaults; build on them and list them in the first PR for Matt to confirm.
3. Create a `CLAUDE.md` that records the conventions in §14, so later sessions keep them.
4. Work in the phases in §13. Each phase ends with something installed on a phone that works offline.
5. Do the two **risk spikes** in Phase 0 before building features.

---

## 1. What it is

A phone-first, offline web app for use **during** the trip. It answers "what do I say, do, or pay here, right now?" It sits beside the itinerary site and doesn't replace it. The itinerary covers where and when; the companion covers how.

- Separate repo, separate site, no shared code with the itinerary.
- It reads one exported trip file (`trip.json`) so it knows which city you're in today and where you sleep tonight.
- Home is **Today**: weather, today's neighborhoods, and the taxi card for tonight's hotel, with every other tool one tap away.
- **No password.** The site is public and holds nothing confidential. Its links into the itinerary hit that site's own password.

## 2. Users and constraints

- Two iPhones (assume iOS Safari), added to the home screen. Used standing, often one-handed.
- Signal is patchy: subway platforms, Hakone, inside a ryokan. **Everything except live weather, rates, store lookup and sync must work with no network after the first load.**
- Neither reads Japanese. Show cards must be readable by a stranger at arm's length.
- **Public by design.** What the public site may contain, and what it may not:

| Allowed | Never |
| --- | --- |
| Cities and neighborhoods by date | Booking references, confirmation numbers, reservation names |
| Hotel names, addresses and front-desk phones by night (needed for the taxi cards) | Restaurant and bar bookings, stop names and times, prices paid |
| Coordinates used to build the konbini list | Tokens, keys, passphrases |
| Generic content (phrases, etiquette, glossary) | Purchases, recipients, anything synced (these live only on the phones and in the private sync repo) |

- **Not in scope:** schedules, stops, bookings, routing, maps of the day (the itinerary does these). No accounts, no sign-in, no password.

## 3. Settled decisions

These came from Matt's comments on the scoping doc and his final notes. Don't reopen them.

| # | Decision |
| --- | --- |
| D1 | Today is the main page and stays general. It shows weather, neighborhoods, and tonight's hotel taxi card. It links to the itinerary's day and to the other tools. No schedule. |
| D2 | The purchase tracking is a **tax-free claim log**, not a general spending log. It holds only items to claim at departure. |
| D3 | Add a **souvenir tracker** (what we bought, who it's for) and a **konbini finder** (nearest stores by current location or the day's areas). |
| D4 | No practice or flashcard mode. Duolingo covers it. |
| D5 | Currency gets a **quick-reference table** of common yen amounts, plus the calculator. |
| D6 | No shared favorites. **Sync between the two phones** is in, for the souvenir tracker and the tax-free claim log. |
| D7 | American English everywhere (code comments, UI, docs). |
| D8 | **No password or encryption.** The app holds nothing confidential and is published openly on GitHub Pages. |
| D9 | **The Japanese is checked after the build**, not before. Ship draft content, flagged `reviewed: false`. |
| D10 | *Withdrawn 2026-10-27.* (Was: no dietary or allergy content.) |

## 4. Modules and priority

| Module | Priority | Section |
| --- | --- | --- |
| App shell (home, nav, offline, settings) | MVP | §6.1 |
| Today | MVP | §6.2 |
| Phrasebook | MVP | §6.3 |
| Show cards | MVP | §6.4 |
| Etiquette and tips | MVP | §6.5 |
| Currency | MVP | §6.6 |
| Emergency | MVP | §6.7 |
| Signs and menu decoder | Should | §6.8 |
| Transit helper | Should | §6.9 |
| Numbers and counting | Should | §6.10 |
| Shopping and tax-free (info) | Should | §6.11 |
| Units (inside Currency) | Should | §6.6 |
| Konbini finder | Should | §6.12 |
| Souvenir tracker | Should | §6.13 |
| Sync between phones | Should | §8 |
| Tax-free claim log | Should (built with the souvenir tracker; Q2) | §6.13 |
| Kanji camera | Not built; a link to Google Lens in the Decoder | §6.8 |

The souvenir tracker and the claim log share one `Purchase` store (§5.4), so they are built together.

---

## 5. Architecture

### 5.1 Stack

- **Vite + TypeScript + Preact** (small, fast, JSX). Plain CSS with custom properties, no CSS framework. Light and dark themes from `prefers-color-scheme`.
- **Ordinary static build** (`dist/`), deployed to GitHub Pages by a GitHub Actions workflow on every push to `main`. Use `base: '/japan-trip-tools/'` in the Vite config.
- **Service worker** precaches everything (§9). Use `vite-plugin-pwa` (Workbox) or a small hand-written `sw.ts`.
- **Storage:**
  - IndexedDB (via `idb`) for purchases, photos, the sync queue and cached API results.
  - `localStorage` (try/catch) for small settings, including the sync token (§8).
  - Call `navigator.storage.persist()` on first run.
- **Tests:** Vitest for logic, Playwright for flows and offline.
- **No backend.** Live calls:

| Call | Service | Key | Cache |
| --- | --- | --- | --- |
| Exchange rate | Frankfurter (ECB rates). Verify the current endpoint; fallback `open.er-api.com` | none | Keep the last good rate with its timestamp |
| Weather | Open-Meteo forecast API, `timezone=Asia/Tokyo` | none | Keep the last forecast per city with its timestamp |
| Konbini lookup | OpenStreetMap Overpass API | none | Per location tile, 24 h |
| Sync | GitHub REST API (Issues) | fine-grained token, entered on each phone | Offline queue (§8) |

### 5.2 Repos

| Repo | Visibility | Holds |
| --- | --- | --- |
| `mdigirol/japan-trip-tools` (this folder) | **public** | Source, content data, `trip.json`, the Pages deploy workflow |
| `mdigirol/japan-trip-tools-data` | private | Sync records (GitHub Issues) |

Site URL: `https://mdigirol.github.io/japan-trip-tools/`.

The source repo is public because GitHub's free plan serves Pages only from public repos. That's fine under §2: nothing confidential is ever committed.

### 5.3 Layout

```
SPEC.md
CLAUDE.md                  # conventions, created in Phase 0
context/                   # source notes (reference; paraphrased, safe to publish)
.github/workflows/deploy.yml
src/
  app.tsx, routes/         # one route per module
  data/
    trip.json              # exported from the itinerary (§7)
    phrases.ts  etiquette.ts  showCards.ts  glossary.ts
    places.ts  transit.ts  money.ts  konbini.ts  emergency.ts
    schema.ts              # zod schemas + types (§5.4)
  lib/
    now.ts                 # trip clock, ?now= override
    trip.ts                # today's day, tonight's stay
    rates.ts  weather.ts  overpass.ts  sync.ts  db.ts
  sw.ts
scripts/
  sync-trip.sh             # runs the itinerary's export script, copies trip.json here
  build-konbini.ts         # Overpass → data/local/konbini-near-stops.json
  review-sheet.ts          # exports Japanese strings to CSV for the after-build check
tests/
```

### 5.4 Data model

TypeScript sketch. Validate every data file with zod at build time, so a bad entry fails the build.

```ts
type Source = 'N' | 'K' | 'T' | 'I' | 'V' | 'JNTO';   // see context/README.md
type Place = 'tokyo' | 'hakone' | 'kyoto' | 'osaka' | 'nara' | 'maihama' | 'anywhere';
type Venue = 'sushi-counter' | 'izakaya' | 'yakitori' | 'ramen' | 'restaurant' | 'cafe'
  | 'cocktail-bar' | 'ryokan' | 'onsen' | 'temple' | 'shrine' | 'department-store' | 'shop'
  | 'konbini' | 'train' | 'shinkansen' | 'taxi' | 'theme-park' | 'market' | 'pharmacy';
type Situation = 'arriving' | 'ordering' | 'paying' | 'asking' | 'problem' | 'emergency' | 'leaving';

interface Phrase {
  id: string; en: string; ja: string; kana?: string; romaji: string;
  situations: Situation[]; venues: Venue[]; places?: Place[];
  slots?: string[];            // e.g. ['X'] for "[X]までお願いします"
  note?: string; mvp: boolean; source: Source[]; sourceUrl?: string;
  reviewed: boolean;           // native-speaker check done (after the build, D9)
  audio?: string;              // file name, if recorded audio is used
}

interface EtiquetteCard {
  id: string; title: string; severity: 'must' | 'should' | 'nice';
  do: string[]; dont: string[]; why: string;
  venues: Venue[]; places?: Place[]; areas?: string[];   // area slugs from places.ts
  source: Source[]; sourceUrl?: string; reviewed: boolean;
}

interface ShowCard {
  id: string; title: string; ja: string; en: string;
  kind: 'hotel' | 'dining' | 'bath' | 'other';
  stayId?: string;             // hotel cards come from trip.json, not typed here
  slots?: string[]; source: Source[]; reviewed: boolean;
}

interface GlossaryTerm {
  id: string; ja: string; romaji: string; en: string;
  category: 'sign' | 'ticket' | 'sushi' | 'yakitori' | 'ramen' | 'izakaya' | 'drink' | 'regional' | 'knife';
  places?: Place[]; source: Source[]; reviewed: boolean;
}

interface AreaTip {          // from context/places.md
  slug: string; name: string; place: Place; tips: string[]; source: Source[];
}

interface Purchase {         // shared by the souvenir tracker and the claim log; never in the build
  id: string;                // uuid
  createdAt: string; updatedAt: string; deleted?: boolean;
  by: string;                // the "who's using this phone" setting
  item: string; shop?: string; place?: Place; date: string;         // YYYY-MM-DD (JST)
  priceYen: number; taxPaidYen?: number;
  forWhom?: string[];        // souvenir recipients; empty = for us
  taxFree: boolean;          // claim at departure
  receiptKept?: boolean; bag?: string;   // which bag it's packed in
  photoIds?: string[];       // local IndexedDB blobs; not synced in v1
  claimed?: boolean;         // ticked at Haneda customs
  note?: string;
}
```

People's names and recipient lists live only in on-device settings and synced records, never in source files.

---

## 6. Module specs

Each module lists what it does, where its content comes from, and acceptance criteria (AC).

### 6.1 App shell

- **Home** is Today. A grid of large tool tiles sits below Today's cards. A persistent bottom bar holds: Today · Phrases · Cards · Etiquette · More.
- **Offline indicator:** a small pill showing "Offline", plus the age of the cached rate and weather ("rate from Nov 14, 9:02").
- **Trip clock** (`lib/now.ts`): all date logic uses Asia/Tokyo time. A `?now=2026-11-21T08:00%2B09:00` override works like the itinerary's, for testing.
- **Settings:**
  - Who is using this phone (a name, for sync records).
  - °F/°C primary, and text size.
  - The souvenir recipient list.
  - The **sync token** field (§8).
  - "Ready for offline ✓" with the content version.
- Tap targets of at least 44 px. Japanese text uses the system font (Hiragino on iOS), so no web font is needed.
- **AC:** with the network off, a cold start from the home screen shows Today with no errors. Every MVP tool opens.

### 6.2 Today (MVP)

Content: `trip.json` (§7) and `context/places.md`.

- **Header:** "Sat, Nov 21 · Kyoto" plus the leg (Kyoto, night 3 of 4).
- **Weather:**
  - Today's high and low, rain chance, and sunset, for the day's main city (lat/lng from `trip.json`).
  - On a day with two cities, such as Nov 20 Kyoto → Osaka, show both.
  - Use the last cached forecast with its age when offline.
  - With no cache at all, show typical mid-November ranges for that city, labeled "typical".
- **Neighborhoods:** the day's `HOODS` entries (name and one line from the itinerary), each with its area tips from `places.ts` behind a "Know before you go" disclosure.
- **Tonight's hotel:** the taxi card in compact form. Tap to open it full screen (§6.4).
  - **Travel days** (Nov 17, 19, 23): before that day's check-in time, show "Checking out of A · Tonight: B". Card B is primary.
- **"Open this day in the itinerary"** links to `https://mdigirol.github.io/japan-trip-2026-site/#d{day}`. That site asks for its own password. Check whether the `#d21` hash survives its unlock. If it doesn't, link to the root and say "then pick Nov 21".
- **Suggested for today:** up to six chips linking into the Phrasebook and Etiquette, filtered to today's venues and places, with "must" cards first.
- **Outside the trip:** before Nov 11, show a countdown and a preview of Nov 12. Nov 11 is "In the air" (JL 5). After Nov 27, show "Trip complete" with the claim log if any items are unclaimed.
- **AC:**
  - `?now=` set to Nov 12 18:00, Nov 17 10:00, Nov 17 16:00, Nov 20 09:00, Nov 25 12:00 and Nov 27 08:00 shows the right city, neighborhoods and hotel card in each case. Covered by a Playwright test.
  - No stop names or times from the itinerary appear anywhere on Today.

### 6.3 Phrasebook (MVP)

Content: `context/phrases.md`.

- Browse by situation tab (Restaurant, Bar, Sushi, Ryokan & onsen, Shopping, Konbini, Taxi, Trains, Temples, Pharmacy, Emergency) and by search across English, romaji and Japanese.
- Each phrase shows English, Japanese (large), and romaji. Tap to hear it (Q1). Long-press to show it full screen.
- **Fill-in slots** (`[X]`): pick from a short list (the trip's hotels, stations, numbers) or type. The Japanese updates live.
- Today's places and venues sort to the top. A star marks favorites, stored locally and not synced.
- **AC:** every ★ (mvp) phrase in `context/phrases.md` is present. Search for "check" finds お会計お願いします. It works offline.

### 6.4 Show cards (MVP)

Content: `context/show-cards.md`, plus the stays in `trip.json`.

- **Full screen:** white background in both themes, Japanese as large as fits (at least 32 px), and a small English line at the bottom. The phone number is a tap-to-call link.
- Hold the screen awake (Screen Wake Lock API, where supported) while a card is open. Rotation to landscape is fine.
- **Hotel cards** are generated from `trip.json` stays, never typed into the content files.
- **Other cards:** walk-in, card OK, English menu, non-smoking, tattoo at the bath, call a taxi, write it down, ship luggage, tax-free, lost item.
- **AC:** each of the four hotel cards shows the exact `addrJa` from the itinerary. Tested by comparing against `trip.json`.

### 6.5 Etiquette and tips (MVP)

Content: `context/etiquette.md`, `context/places.md`.

- Browse by place type (Everywhere, Restaurants, Sushi, Bars, Onsen, Ryokan, Shrines, Temples, Trains, Taxis, Shops) and by area (from `places.ts`).
- **Card layout:** title, severity badge, a "Do" list, a "Don't" list, and one line of why. "Must" cards come first.
- The shrine card includes a numbered washing sequence and the bow/clap pattern, readable at a glance.
- **AC:** every "must" card in `context/etiquette.md` is present. Filtering by "Ryokan" shows the yukata, slippers and dinner-time cards.

### 6.6 Currency and units (MVP)

Content: `context/money-and-shopping.md`.

- **Rate:** JPY ↔ USD. Fetch on open when online and cache it with its time. A manual override field lets Matt use the rate his card actually charges, and the override wins until cleared.
- **Quick-reference table** (D5): ¥100, ¥500, ¥1,000, ¥3,000, ¥5,000, ¥10,000, ¥30,000, ¥50,000 → USD, at the current rate. Readable without scrolling on an iPhone.
- **Calculator:** a large number pad, in either direction. Includes a **税込 / 税抜 toggle** showing the price with 10% tax added (and 8% for takeaway food, noted).
- **Units** (Should): °C↔°F, km↔mi, g↔oz, and clothing and shoe sizes (§6.11), as a small panel under the calculator.
- **AC:** offline with a cached rate, the table and calculator work and show the rate's age. With no cache and no override, they show "Set a rate" rather than a wrong number.

### 6.7 Emergency (MVP)

Content: `context/emergency-and-health.md`.

- Tap-to-call numbers.
- A "show this" card: 救急車を呼んでください (please call an ambulance) and tonight's hotel address.
- Earthquake steps.
- The pharmacy brand table and symptom phrases (linked from the Phrasebook).
- **AC:** every number has been verified against an official page, with the URL in `sourceUrl`. Phone numbers are the one content type verified before the trip, not after (D9 covers only the Japanese). The screen works offline.

### 6.8 Signs and menu decoder (Should)

- Search and category lists from `context/glossary.md`.
- A "Google Lens" button that opens the Lens or Translate camera, for anything not listed.

### 6.9 Transit helper (Should)

- How-to cards from `context/transit.md`: reading a Shinkansen ticket (annotated diagram), IC card basics, Kyoto buses, taxis, luggage forwarding.
- No routing; link to Google Maps.

### 6.10 Numbers and counting (Should)

- Prices said aloud (enter ¥3,480 → "sanzen yonhyaku hachijuu en", with audio if available).
- Times, and counters for people (hitori, futari…) and things (hitotsu, futatsu…).
- Generate the readings in code and unit-test them against a table.

### 6.11 Shopping and tax-free (Should)

- An explainer of the Nov 1, 2026 refund system, citing JNTO.
- Size conversion, the knife glossary, and the "worth buying" list.
- A link to the claim log.

### 6.12 Konbini finder (Should)

Content: `context/konbini.md`.

- **Offline list:**
  - Built by `scripts/build-konbini.ts` from Overpass: stores within about 600 m of each day's points and hotel, from `trip.json`.
  - Shows today's areas first: chain, name, distance from the hotel or from the nearest point of the day.
- **Live:** "Near me" uses geolocation and an Overpass query (500 m), sorted by distance, opening in Google Maps.
- **Fallback:** a Google Maps search for コンビニ.
- A panel on what each chain is good for.
- **AC:** offline, the Nov 21 list shows stores near Kinkaku-ji, Nara Park and the Kyoto hotel. "Near me" degrades to the offline list with a message.

### 6.13 Souvenir tracker and tax-free claim log (Should)

Both are views of one `Purchase` store.

- **Add:** a fast form with item, price in yen (the converter shows USD), shop, who it's for (recipients), a "Tax-free claim" toggle, which bag, and an optional photo of the item and receipt.
- **Souvenir view:** grouped by recipient, with an "Everyone still needs something" list taken from the recipient list in settings. Totals in yen and USD.
- **Claim-log view:**
  - Only `taxFree` items, grouped by bag.
  - Shows the total tax due back, and a check for the ¥5,000-per-store-per-day minimum, warning when a store's total for the day is below it.
  - On Nov 27, a checklist mode for the customs counter: tick each item as shown.
- **AC:**
  - Adding a purchase offline on phone A appears on phone B within a minute of both being online (§8).
  - Photos stay on the device that took them, which the UI says plainly.

---

## 7. `trip.json` export (in the itinerary repo)

Write `scripts/export-trip.mjs` in **`~/Documents/japan-trip-itinerary`** (read-only use of `index.html`). `scripts/sync-trip.sh` here runs it and copies the output to `data/local/trip.json`. Several sessions edit the itinerary's `index.html`, so the script must never write to it.

- **Inputs** (all JS literals inside `index.html`):
  - `STAYS` (around line 1093)
  - `DAYS` (around line 1212; built with helper calls `A(...)`, `S(...)`)
  - `HOODS` (around line 2268)
  - `INFO` (keyed by place name; the `role` chip such as "Eat · Dinner")
- **Approach:** pull the `<script>` text, stub the helpers (`A`, `S` and others) so they return plain objects, and evaluate the data block in Node's `vm` module. Don't use regex scraping.
- **Output** (validate with zod):

```ts
interface TripFile {
  generatedAt: string;
  stays: { id: string; name: string; nameJa: string; addrEn: string; addrJa: string;
           tel: string; lat: number; lng: number; from: string; to: string;   // YYYY-MM-DD
           checkIn?: string }[];     // HH:MM from the day's "Check in" item, if present
  days: { date: string; dow: string; seg: 'air' | 't1' | 'hk' | 'ky' | 't2';
          places: Place[];            // derived from seg and areas (Osaka, Nara, Maihama)
          area: string;               // DAYS.area
          hoods: { name: string; blurb: string; slug: string }[];
          venues: Venue[];            // derived; see mapping below
          points: { lat: number; lng: number }[];   // coordinates only, for the konbini build
          stayTonight: string; stayLastNight?: string;
          note?: string }[];          // e.g. "US Thanksgiving", public holiday
}
```

- **The output is committed to a public repo, so it must satisfy §2.** Exclude:
  - confirmation numbers, booking references, control numbers, reservation names
  - stop names, times, prices, notes
  - phone numbers other than hotel front desks
  - tokens and keys
- **Venue mapping:** derive `venues` from each stop's category argument (`cafe`, `see`, `shop`, `eat`, `bar`, `do`) and its `INFO` role words:
  - Bar → `cocktail-bar`
  - Temple → `temple`, Shrine → `shrine`
  - Onsen / ryokan → `onsen` + `ryokan`
  - Sushi / omakase → `sushi-counter`, Ramen → `ramen`, Yakitori → `yakitori`, Izakaya → `izakaya`
  - Market → `market`, Disney → `theme-park`
  - Train or Shinkansen items → `train` / `shinkansen`

  Print a report of stops whose role matched nothing, so the mapping can be extended.
- **AC:**
  - The output passes the schema; 17 days (Nov 11–27); four stays with Japanese addresses identical to `STAYS`.
  - A test fails the build if `trip.json` contains any key outside the schema, or any string matching the itinerary's booking-number patterns (for example `E372`-style control numbers, "Booked", "Ticketed").

---

## 8. Sync design

Scope: only `Purchase` records. Everything else is static or per-device.

- **Transport:** GitHub Issues in the private repo `japan-trip-tools-data`, the same pattern as the itinerary's comments (`japan-trip-2026-comments`). It's proven in this setup and needs no new account.
  - One issue per purchase: title `purchase:<uuid>`, body `<!-- companion {json} -->`.
  - Labels: `souvenir`, `taxfree`.
  - Editing a purchase edits the issue body. Deleting closes the issue with a `deleted` label (a soft delete, so it can be undone).
- **Token:** a fine-grained token with **Issues read/write on the data repo only**.
  - **Each phone pastes it once in Settings.** It's stored in `localStorage` on the device and is never in the source, the build or the public site.
  - Matt creates it and AirDrops or messages it to Katherine's phone.
  - Expiry: after Dec 31, 2026.
- **Offline queue:** writes go to IndexedDB first, plus a queue entry. On `online` (and on app open, and every 60 s while open), flush the queue, then pull issues updated since the last sync (`since=` parameter).
- **Conflicts:** last write wins per record, by `updatedAt`. Two people rarely edit the same purchase.
- **Photos are not synced in v1** (size, and the Issues API is a poor fit). Say so in the UI.
- **Rate limits:** well under 5,000 requests an hour for two people. Back off on 403/429.
- **AC:**
  - Airplane-mode add on A, then online: the record appears on B within one minute of B opening.
  - Editing on both offline, then going online: the later edit wins, with nothing lost or duplicated.
  - With no token, the app shows "Sync off — add a token in Settings" and keeps working locally.

---

## 9. Offline and caching

- **Service worker:**
  - Precache the app shell, JS/CSS bundles, data files, the manifest, the icons and any audio.
  - Network-first with cache fallback for the rate, weather and Overpass calls; GitHub API calls go straight to the network.
  - Version the cache by build hash and clean up old caches on activate. Show "Update available — tap to reload" when a new version is waiting.
- **iOS notes to verify on a device (risk spike R1):**
  - A home-screen app has its own storage, separate from Safari. Install from Safari, then open it once online from the home screen to fill the cache.
  - Confirm a cold start in airplane mode works from the home screen.
  - Confirm that `localStorage` (the sync token) and IndexedDB survive a few days unopened.

## 10. Publishing

- `.github/workflows/deploy.yml`: on push to `main`, run tests, `npm run build`, and deploy `dist/` to GitHub Pages (`actions/deploy-pages`). Turn on Pages with source "GitHub Actions" in the repo settings.
- No secrets are needed in the workflow, and none may be added. The sync token lives only on the phones.
- `.gitignore`: `dist/`, `.env*`, `review/` (if review exports contain notes).
- During the trip, a fix is: edit, commit, push. The phones pick it up on the next online open via the update prompt.

## 11. Content pipeline and review

1. Turn each `context/*.md` file into a typed data file in `src/data/`. Keep the `source` tags. Every Japanese string starts `reviewed: false`.
2. **Ship draft Japanese (D9).** No build gate on review. In dev builds, unreviewed strings show a small dot. In production, nothing is shown.
3. **After the build,** `npm run review-sheet` exports every Japanese string (id, English, Japanese, romaji, note) to `review/japanese-strings.csv` for a native speaker. `npm run review-import` applies corrections and sets `reviewed: true`. Matt schedules this himself.
4. Verify `[V]` facts that could cause harm if wrong before the freeze: emergency numbers, tax-free rules, transit rules. Record the URL in `sourceUrl`. Other `[V]` items can ship and be checked later.
5. **The context notes are paraphrased, so the public repo is safe for them.** Never paste text from the purchased guides into the repo. The guides themselves stay in Dropbox.

## 12. Testing

- **Vitest:**
  - Trip clock and today/tonight selection, including travel days and the edges (Nov 11, Nov 27).
  - Yen/USD math and rounding.
  - The tax toggle.
  - Number readings (§6.10).
  - Purchase merge (§8).
  - Schema validation of all data files.
  - The `trip.json` confidentiality test (§7).
- **Playwright** (mobile viewport):
  - Cold load offline after a first online load.
  - Each MVP route renders.
  - The `?now=` scenarios in §6.2.
  - The show-card wake lock is requested.
  - The claim-log checklist ticks.
  - Sync off with no token.
- **Device checklist** (manual, on both iPhones by Nov 10):
  - Add to the home screen.
  - Paste the sync token.
  - Airplane mode: cold start, every MVP tool, a show card, a purchase added and then synced when back online.
  - Speech plays (if the phone voice is used).

## 13. Phases and dates

| Phase | Dates | Done when |
| --- | --- | --- |
| 0. Setup and risk spikes | Oct 19–21 | Public repo with Pages deploy; private data repo; Vite scaffold with the shell and service worker; `trip.json` export working; **R1** and **R2** answered; `CLAUDE.md` written |
| 1. MVP modules | Oct 22–Nov 1 | Today, Phrasebook, Show cards, Etiquette, Currency, Emergency, all offline, with draft content from `context/` |
| 2. Should modules | Nov 2–7, cut as needed | Purchase store, sync, souvenir tracker and claim log first; then the konbini finder, decoder, transit, numbers, shopping |
| Freeze | Nov 8–10 | Emergency numbers and tax-free rules verified; installed on both phones; device checklist passed |
| During the trip | Nov 12–27 | Content fixes only, pushed from a laptop |
| After the build | When Matt chooses | Native-speaker review of the Japanese (D9) |

**Risk spikes (Phase 0):**

- **R1. iOS home-screen offline.** Deploy the empty shell to Pages, add it to an iPhone home screen, and confirm a cold start in airplane mode. Confirm that storage survives a few days unopened.
- **R2. Japanese speech on iOS.** Does `speechSynthesis` with a `ja-JP` voice work offline in a home-screen app, and does it sound right? If not, use recorded MP3s for the MVP phrases only (Q1).

## 14. Conventions for `CLAUDE.md`

- American English in UI copy, comments and docs.
- **This repo and site are public.** Commit nothing confidential (§2): no booking or confirmation numbers, reservation names, prices paid, tokens or keys, and no personal names beyond what's already in the spec. The sync token lives only on the phones.
- Content facts carry `source` tags; safety-relevant `[V]` facts need a `sourceUrl` before the freeze.
- Copyright: never paste text from the purchased guides. Paraphrase only. The guides stay in Dropbox.
- The itinerary repo is read-only from here, except for adding `scripts/export-trip.mjs` there.
- UI copy: short, plain, specific. One idea per line on cards.
- Every phone-facing screen must work at 375 px wide, in both themes, with the network off.

## 15. Open questions

All have defaults; build on them and confirm in the first PR.

| # | Question | Default |
| --- | --- | --- |
| Q1 | Phone voice or recorded audio? | Phone voice for the MVP (decided by R2); recorded clips for the top 50 phrases only if the voice fails |
| Q2 | Build the tax-free claim log alongside the souvenir tracker? | Yes, in Phase 2, since they share one store |
| Q3 | Katherine's priorities: which modules matter most to her, and does she want anything added? | Same app for both |
| Q4 | Add "Open in companion" links to the itinerary's days? | Yes, as one small change to `index.html` after the MVP ships, coordinated with other sessions |
| Q5 | Sync store: GitHub Issues or a hosted database? | GitHub Issues (§8) |
| Q6 | °F or °C first? | °F first, °C beside it |

## 16. Out of scope

- Itinerary content: stops, times, bookings, maps of the day.
- Passwords and encryption (D8).
- Translation of free text. Link to Google Translate or DeepL.
- Building OCR. Link to Google Lens.
- Flashcards and practice (D4).
- Shared favorites (D6).
- Native apps, an App Store build, push notifications.

## 17. References

- Scoping doc: [Japan Trip Companion — Scoping](https://claude.ai/code/artifact/fb65ddf5-33fa-4014-9210-32901d1f2f3c)
- Itinerary repo: `~/Documents/japan-trip-itinerary` (private `mdigirol/japan-trip-2026`). Its README covers the comments-token pattern that sync reuses.
- Itinerary site (password-protected): https://mdigirol.github.io/japan-trip-2026-site/ (day anchors `#d12`…`#d27`)
- Content notes: `context/` (sources and tags in `context/README.md`)
- Tax-free change: [JNTO](https://www.japan.travel/en/ca/news/changes-are-coming-to-japans-tax-free-shopping/)
