# Konbini

Feeds the Konbini finder: a nearest-store list, plus a short "what to get and what they do" panel.

## The big three

| Chain | Known for | Tag |
| --- | --- | --- |
| 7-Eleven | Most reliable ATM for foreign cards. Seven Cafe coffee, onigiri, smoothies. Nina rates its egg sandwich best. Most consistent free Wi-Fi. | [N][T] |
| Lawson | Uchi Cafe desserts (roll cake, Basque cheesecake). Karaage-kun fried chicken. The Tokyo guide rates its egg sandwich best. Many branches stock Muji basics. | [N][T] |
| FamilyMart | FamiChiki fried chicken, oden in cold months, its own-brand socks. | [N][T] |

Also seen: Daily Yamazaki (fewer stores) [T]. Late-night bento and dessert discounts at supermarkets run 20–50% off [T].

## What a konbini is good for

- ATM (7-Eleven is best for foreign cards). [N][T]
- Trash bins (for what you bought there). [T][V]
- Restroom: most have one; ask if it isn't obvious. [N][V]
- Takkyubin luggage forwarding at the counter. [T]
- Paying by IC card. [K]
- Phone battery rental (ChargeSPOT stands). [T][V]
- Free Wi-Fi (7-Eleven is the most consistent). [N]
- Hot food: the clerk offers to heat bento ("atatamemasu ka?"). [V]
- Deodorizer spray after a smoky bar, and tissues. [N]

## Finder data notes

- **Offline.** At build time, query OpenStreetMap (Overpass) for `shop=convenience` within about 600 m of each day's stops and that night's hotel. Use the stop coordinates from `trip.json`. Keep name, brand, lat/lng, and opening hours if tagged. Brand tags: `brand=7-Eleven`/`セブン-イレブン`, `Lawson`/`ローソン`, `FamilyMart`/`ファミリーマート`. [V]
- **Online.** Same query around the phone's location (Geolocation API), radius 500 m, sorted by distance.
- **Fallback.** A button that opens Google Maps searching コンビニ near you.
- OSM coverage of Japanese konbini is good in cities. Hakone (Tonosawa) is sparse: the nearest stores are near Hakone-Yumoto station. Treat any result as approximate. [V]
- Respect the Overpass usage policy: cache results, and don't query on every render.
