# Context notes for the content

These files are raw material, safe to keep in the public repo because they are paraphrased. They are for the app's static content: phrases, etiquette, show cards, glossary terms, transit, money, konbini, health, and area tips. They are notes to build from, not data the app loads directly. Phase 1 of the spec turns them into typed data files under `src/data/`.

Drafted 2026-10-18 from three travel guides Matt bought, plus the itinerary repo and general knowledge. All content is paraphrased. Nothing is copied from the guides, so they stay out of the repo.

## Source tags

Every item carries one tag. Keep the tag when you turn the item into data (`source` field).

| Tag | Source |
| --- | --- |
| `[N]` | Nina's Japan Travel Guide (2026, 57 pp.), a general guide from a Japanese-American traveler |
| `[K]` | Insiders Kyoto Travel Guide (Farr East, 182 pp.) |
| `[T]` | The Ultimate Tokyo Guide, Bonus Included (Farr East, 2026, 261 pp.) |
| `[I]` | The itinerary repo (`~/Documents/japan-trip-itinerary/index.html`) |
| `[JNTO]` | [JNTO news post on the tax-free change](https://www.japan.travel/en/ca/news/changes-are-coming-to-japans-tax-free-shopping/), read 2026-10-18 |
| `[V]` | General knowledge, not in the guides. **Verify against an official source** (safety items before the trip, the rest later). |

## Rules for turning notes into content

1. **Japanese is checked after the build.** All Japanese here, sourced or not, ships as a draft (`reviewed: false`) and gets a native-speaker check after the build. Romaji uses Hepburn with long vowels written out (ou, uu, ee).
2. **`[V]` items are drafts.** Confirm them against an official source (JNTO, JR, the venue's own site) or drop them. Emergency numbers, tax-free rules and transit rules are confirmed before the trip.
3. **Don't trust the guides on everything.** Some claims are dated or dubious, and these notes leave them out or flag them:
   - The Kyoto guide's ¥700 city-bus day pass. Kyoto ended the bus-only day pass in 2023 `[V]`.
   - The Tokyo guide's claim that sunglasses read as yakuza. Left out.
   - The Tokyo guide's claim that Wise has 0% fees on everything. Left out; fees vary.
   - The Kyoto guide says "okini". The usual spelling is ookini (おおきに). It is used mostly by older shopkeepers. Fine to say, optional.
   - Konbini specialties: Nina and the Tokyo guide disagree on whose egg sandwich is best. Both views are recorded.
4. **Write in American English.**
5. **Write for one glance.** Keep cards to a title, three to five short do/don't lines, and a one-line why.

## Files

| File | Feeds module |
| --- | --- |
| `phrases.md` | Phrasebook |
| `show-cards.md` | Show cards, Today (taxi card) |
| `etiquette.md` | Etiquette and tips |
| `places.md` | Today (area tips), Etiquette (by place) |
| `glossary.md` | Signs and menu decoder |
| `transit.md` | Transit helper |
| `money-and-shopping.md` | Currency, Shopping and tax-free, Tax-free claim log, Souvenir tracker |
| `konbini.md` | Konbini finder |
| `emergency-and-health.md` | Emergency |

The Hakone ryokan guide in the Dropbox folder (`Hakone_Ryokan_Guide_Nov2026.docx`) was not used. It may have house rules for Kinnotake Tonosawa worth adding to the ryokan cards.
