// Etiquette cards, from context/etiquette.md. Paraphrased; one glance per card.
import type { EtiquetteCard, Place, Source, Venue } from './schema';

export const ETIQUETTE_GROUPS = [
  { id: 'everywhere', label: 'Everywhere' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'bars', label: 'Bars' },
  { id: 'onsen', label: 'Onsen' },
  { id: 'ryokan', label: 'Ryokan' },
  { id: 'shrines', label: 'Shrines' },
  { id: 'temples', label: 'Temples' },
  { id: 'trains', label: 'Trains' },
  { id: 'taxis', label: 'Taxis' },
  { id: 'shops', label: 'Shops' }
] as const;

const GROUP_VENUES: Record<string, Venue[]> = {
  everywhere: [],
  restaurants: ['restaurant', 'izakaya', 'yakitori', 'ramen'],
  sushi: ['sushi-counter'],
  bars: ['cocktail-bar'],
  onsen: ['onsen'],
  ryokan: ['ryokan'],
  shrines: ['shrine'],
  temples: ['temple'],
  trains: ['train', 'shinkansen'],
  taxis: ['taxi'],
  shops: ['shop', 'department-store', 'market']
};

interface Opts { do?: string[]; dont?: string[]; why: string; venues?: Venue[]; places?: Place[]; areas?: string[]; steps?: string[] }

function c(group: string, id: string, severity: EtiquetteCard['severity'], title: string, source: Source[], o: Opts): EtiquetteCard {
  return {
    id, group, severity, title, source, reviewed: false,
    do: o.do ?? [], dont: o.dont ?? [], why: o.why,
    venues: o.venues ?? GROUP_VENUES[group],
    ...(o.places ? { places: o.places } : {}),
    ...(o.areas ? { areas: o.areas } : {}),
    ...(o.steps ? { steps: o.steps } : {})
  };
}

export const etiquette: EtiquetteCard[] = [
  // ---- Everywhere ----
  c('everywhere', 'no-tipping', 'must', 'No tipping', ['N', 'T'], {
    dont: ['Leave cash on the table', 'Add a tip to a card payment'],
    why: "Service is included. Staff may chase you to return the money."
  }),
  c('everywhere', 'street-touts', 'must', 'Ignore street touts', ['T'], {
    dont: ['Follow anyone pulling you into a bar', 'Stop to chat with "fashion store" recruiters'],
    do: ['Keep walking. A firm "no thanks" is fine'],
    why: 'Shinjuku and Shibuya touts lead to overcharging and pressure to pay.', areas: ['shinjuku', 'shibuya', 'harajuku']
  }),
  c('everywhere', 'pay-on-tray', 'should', 'Pay on the tray', ['T'], {
    do: ['Put cash or card on the small tray by the register'], dont: ["Hand money into the cashier's hand"],
    why: 'The tray is how change and cards are passed.'
  }),
  c('everywhere', 'carry-trash', 'should', 'Carry your trash', ['N', 'T', 'V'], {
    do: ['Keep a small bag for trash', 'Use konbini bins for things you bought there'],
    why: 'Public bins are rare by design.'
  }),
  c('everywhere', 'eat-standing-still', 'should', "Don't eat while walking", ['N', 'V'], {
    do: ['Step aside and finish, then move on'], dont: ['Walk and eat through crowds'],
    why: 'Not illegal, but reads as careless. Nishiki posts signs about it.'
  }),
  c('everywhere', 'shoes-off', 'should', 'Shoes off at any step up', ['N'], {
    do: ['Look for a step or slippers at the entry', 'Wear decent socks'],
    why: 'Entryways, ryokan, some restaurants and temple halls are shoe-free.'
  }),
  c('everywhere', 'smoking-areas', 'should', 'Smoke only in marked areas', ['N'], {
    dont: ['Smoke on the street'], why: 'Big cities fine street smoking, about ¥1,000–2,000. Many small bars still allow it inside.'
  }),
  c('everywhere', 'tissues', 'should', 'Carry tissues and a hand towel', ['N', 'T'], {
    do: ['Pack a pocket tissue pack and a small towel'], why: 'Many restrooms lack paper or paper towels.'
  }),
  c('everywhere', 'restroom-first', 'should', 'Use the station restroom before you exit', ['T'], {
    do: ['Station restrooms are usually inside the ticket gates (改札)'], why: 'Leaving the gates means paying a new fare to come back in.'
  }),
  c('everywhere', 'perfume', 'nice', 'Keep perfume light', ['N'], {
    why: "Small spaces and crowded trains. The value is meiwaku: don't trouble the people around you."
  }),
  c('everywhere', 'drinking-outside', 'nice', 'Drinking outside: check local rules', ['N', 'V'], {
    dont: ['Get loudly drunk', 'Drink in public around Shibuya Station from 6 p.m. to 5 a.m.'], why: 'Many places allow it, but rules are local. Shibuya bans it in its station area every night. Follow posted signs. Rowdiness is not welcome anywhere.'
  }),

  // ---- Restaurants and izakaya ----
  c('restaurants', 'call-server', 'must', 'Call the server', ['N'], {
    do: ['Say "sumimasen!" when ready to order', 'Press the call button if there is one'],
    why: "They won't come until you do."
  }),
  c('restaurants', 'chopsticks', 'must', 'Chopstick rules', ['N'], {
    dont: ['Stand chopsticks upright in rice', 'Pass food chopstick to chopstick'],
    why: 'Both echo funeral rites.', venues: ['restaurant', 'izakaya', 'yakitori', 'ramen', 'sushi-counter', 'ryokan']
  }),
  c('restaurants', 'ask-check', 'should', 'Ask for the check', ['N', 'T'], {
    do: ['Say "okaikei onegaishimasu"', 'Pay at the register'], why: "At many casual places you ask for the check and pay at the register. Follow the venue’s instructions; some use table payment."
  }),
  c('restaurants', 'eat-and-go', 'should', 'Eat and go at busy places', ['T'], {
    dont: ['Linger after eating at a ramen counter'], why: 'Counters are built for turnover.', venues: ['ramen']
  }),
  c('restaurants', 'ticket-machine', 'should', 'Use the ramen ticket machine', ['N'], {
    do: ['Pick, pay, and hand the ticket to staff'], why: 'Most buttons have photos. Ordering at the counter often isn’t possible.', venues: ['ramen']
  }),
  c('restaurants', 'otoshi', 'should', 'Expect a table charge (otoshi)', ['V'], {
    do: ['Accept the small dish you didn’t order'], why: 'About ¥300–600 each. Normal, not a scam.', venues: ['izakaya', 'yakitori']
  }),
  c('restaurants', 'share-plates', 'nice', 'Order small plates to share', ['N'], {
    do: ['Ask for the osusume (house picks)'], why: 'Izakaya food comes in small plates, a few at a time.', venues: ['izakaya', 'yakitori']
  }),
  c('restaurants', 'smoke-ask', 'nice', 'Ask before you sit if smoke matters', ['N'], {
    do: ['Ask "kin\'en seki wa arimasu ka?"'], why: 'Old izakaya often allow smoking.', venues: ['izakaya', 'yakitori']
  }),

  // ---- Sushi counter ----
  c('sushi', 'on-time', 'must', 'Arrive on time', ['V'], {
    do: ['Be at the door a few minutes early'], why: 'Seatings start together. Late arrivals hold up the counter.'
  }),
  c('sushi', 'eat-right-away', 'must', 'Eat each piece right away', ['V'], {
    dont: ['Let a piece sit for a photo'], why: 'The chef times rice and fish to the moment it’s served.'
  }),
  c('sushi', 'hands-ok', 'should', 'Hands or chopsticks are both fine', ['V'], {
    do: ['Dip the fish side, not the rice, if you use soy at all'], why: 'Often the chef has already seasoned it.'
  }),
  c('sushi', 'no-perfume', 'should', 'No strong perfume', ['N', 'V'], { why: 'It competes with the food at a counter.' }),
  c('sushi', 'photo-ask', 'should', 'Ask before taking photos', ['V'], { why: 'Some top counters ban photos.' }),
  c('sushi', 'thank-chef', 'nice', 'Thank the chef as you leave', ['N'], {
    do: ['Say "gochisousama deshita"'], why: 'It’s the expected send-off.'
  }),

  // ---- Bars ----
  c('bars', 'seat-charge', 'should', 'Expect a seat charge', ['V'], {
    do: ['Ask "chaaji wa arimasu ka?" if unsure'], why: 'Often ¥500–1,500 a person, sometimes with a snack.'
  }),
  c('bars', 'house-rules', 'should', 'Read the house rules', ['V'], {
    do: ['Look for a sign at the door'], why: 'Seat limits, one-drink minimums, no photos or no standing groups are common.'
  }),
  c('bars', 'quiet-voice', 'should', 'Keep your voice down', ['V'], { why: 'Many bars have 8 to 12 seats.' }),
  c('bars', 'order-by-mood', 'nice', 'Order by mood', ['V'], {
    do: ['Say "osusume de" (your recommendation)', 'Name a spirit and "not too sweet"'], why: 'Bartenders like building to taste.'
  }),

  // ---- Onsen ----
  c('onsen', 'wash-first', 'must', 'Wash before you soak', ['N'], {
    do: ['Sit on the stool and scrub fully', 'Rinse the stool and turn the basin over'], why: 'The bath is shared and for soaking only.'
  }),
  c('onsen', 'no-swimsuit', 'must', 'No swimsuit', ['N', 'K'], { do: ['Everything comes off'], why: 'Swimsuits are seen as unclean in the bath.' }),
  c('onsen', 'small-towel', 'must', 'Keep the small towel out of the water', ['N'], {
    do: ['Fold it on your head or set it on the edge'], dont: ['Bring the big towel into the bath area'], why: 'Towels in the water are unhygienic.'
  }),
  c('onsen', 'no-phones', 'must', 'No phones or cameras', ['N'], { dont: ['Bring a phone into the bath area'], why: 'This rule holds everywhere.' }),
  c('onsen', 'curtain', 'must', 'Check the curtain', ['N'], {
    do: ['女 = women', '男 = men'], dont: ['Go by color alone'], why: 'Some ryokan swap the sides at set times.'
  }),
  c('onsen', 'tattoos', 'should', 'Tattoos: ask ahead', ['N'], {
    do: ['Use a private bath (kashikiri-buro)', 'Show the tattoo card'], why: 'Hakone is more relaxed than most places.', places: ['hakone']
  }),
  c('onsen', 'quiet', 'should', "Keep quiet and don't stare", ['N'], { why: 'A bath is for rest.' }),
  c('onsen', 'dry-off', 'should', 'Dry off before the changing room', ['N'], { do: ['Return borrowed towels and keys'], why: 'Wet floors in the changing room annoy everyone.' }),
  c('onsen', 'water', 'should', 'Drink water', ['N'], { why: 'Hot baths dehydrate you faster than you’d think.' }),

  // ---- Ryokan ----
  c('ryokan', 'yukata', 'must', 'Yukata: left over right', ['N'], {
    do: ['Left panel over the right', 'Tie the sash at your natural waist', 'Wear the heavier tanzen jacket over it'],
    dont: ['Wrap right over left'], why: 'Right over left is for dressing the dead.', places: ['hakone']
  }),
  c('ryokan', 'tatami-slippers', 'must', 'No slippers on tatami', ['N'], {
    do: ['Bare feet or socks on the mats'], why: 'Tatami is treated like a clean floor.', places: ['hakone']
  }),
  c('ryokan', 'toilet-slippers', 'must', 'Toilet slippers stay in the toilet', ['N'], {
    do: ['Swap at the door, both ways'], why: 'Wearing them out is a classic faux pas.', places: ['hakone']
  }),
  c('ryokan', 'dinner-time', 'must', 'Dinner is at a set time', ['N'], {
    do: ['Be on time'], why: 'The kitchen times each course for you.', places: ['hakone']
  }),
  c('ryokan', 'arrive-by', 'should', 'Arrive by check-in (about 3–5 PM)', ['N'], {
    why: 'That leaves time to settle and bathe before dinner.', places: ['hakone']
  }),
  c('ryokan', 'let-staff', 'should', 'Let staff carry bags and lay out the futon', ['N'], {
    dont: ['Rearrange the room'], why: 'It’s part of the service.', places: ['hakone']
  }),
  c('ryokan', 'welcome-tea', 'should', 'Have the welcome tea and sweets', ['N'], { why: 'That’s what they’re for.', places: ['hakone'] }),
  c('ryokan', 'checkout', 'nice', 'At checkout', ['N'], {
    do: ['Fold the yukata loosely', 'Say "osewa ni narimashita"'], why: 'A small thank-you for the stay.', places: ['hakone']
  }),
  c('ryokan', 'bath-times', 'nice', 'Best bath times', ['N'], { do: ['Just before dinner', 'Late at night'], why: 'The baths are quietest then.', places: ['hakone'] }),

  // ---- Shrines ----
  c('shrines', 'temizuya', 'must', 'Wash at the water basin', ['T'], {
    steps: [
      'Ladle in your right hand. Rinse your left hand.',
      'Switch hands. Rinse your right hand.',
      'Pour water into your left palm. Rinse your mouth.',
      'Never touch the ladle to your lips.',
      'Tip the ladle upright to rinse the handle. Set it back.'
    ],
    why: 'Purifying before you approach the shrine.'
  }),
  c('shrines', 'two-bows', 'must', 'Pray: two bows, two claps, one bow', ['T'], {
    steps: ['Drop a coin in the offering box', 'Bow twice', 'Clap twice', 'Pray silently', 'Bow once'],
    why: 'The standard Shinto prayer.'
  }),
  c('shrines', 'path-side', 'should', 'Walk at the side of the path', ['V'], { dont: ['Walk down the center'], why: 'The center is for the deity.' }),
  c('shrines', 'photo-people', 'should', 'Ask before photographing people praying', ['T'], { why: 'It’s a private moment.' }),

  // ---- Temples ----
  c('temples', 'no-clapping', 'must', 'No clapping at temples', ['T'], {
    do: ['Palms together, a quiet wish, a bow'], dont: ['Clap (that’s for shrines)'], why: 'Buddhist temples pray in silence.'
  }),
  c('temples', 'no-photos-inside', 'must', 'Assume no photos inside halls', ['T'], { do: ['Look for a sign that says otherwise'], why: 'Many halls ban photos.' }),
  c('temples', 'dont-touch', 'should', "Don't touch statues or ritual objects", ['T'], { why: 'Unless you’re invited to.' }),
  c('temples', 'goshuin', 'nice', 'Goshuin book', ['K'], { do: ['Buy the book at the first temple'], why: 'A brush-written stamp from each temple, about ¥300–500.' }),
  c('temples', 'otowa', 'nice', "Kiyomizu-dera's Otowa waterfall", ['K'], {
    do: ['Drink from one stream only'], why: 'Drinking from all three is seen as greedy.', places: ['kyoto'], areas: ['higashiyama']
  }),

  // ---- Trains ----
  c('trains', 'no-calls', 'must', 'No phone calls; ringer on silent', ['N'], { why: 'Trains are quiet spaces.' }),
  c('trains', 'no-eating-local', 'should', 'No eating on local trains', ['N'], {
    do: ['Eat on the Shinkansen. Bring an ekiben'], why: 'Long-distance trains are the exception.'
  }),
  c('trains', 'queue', 'should', 'Let people off first', ['N'], { do: ['Queue at the floor markings'], why: 'Boarding is orderly and fast.' }),
  c('trains', 'backpack-front', 'should', 'Backpack on your front in crowds', ['T'], { why: 'It saves space and bumps.' }),
  c('trains', 'escalators', 'should', 'Escalators: stand still', ['N', 'V'], {
    do: ['Stand still and hold the handrail', 'Follow posted station signs', 'Use stairs to go faster'], dont: ['Walk on escalators'], why: 'Railway operators ask riders not to walk. Many locals still stand left in Tokyo and right in Osaka, but the open side is not a walking lane.'
  }),
  c('trains', 'women-only', 'nice', 'Women-only cars', ['N'], { why: 'Marked in pink, usually the first or last car at rush hour.' }),

  // ---- Taxis ----
  c('taxis', 'door', 'should', "Don't touch the door", ['T'], { why: 'The driver opens and closes it.' }),
  c('taxis', 'show-card', 'nice', 'Show the address card', ['V'], { dont: ['Try to pronounce the address'], why: 'Drivers read the card faster.' }),

  // ---- Shops ----
  c('shops', 'receipts', 'should', 'Keep every receipt and your passport handy', ['N'], {
    why: 'Tax-free needs both. No receipt, no refund.'
  }),
  c('shops', 'bags', 'nice', 'Bags cost a few yen', ['V'], { do: ['Say "fukuro wa irimasen" if you don’t need one'], why: 'Plastic bags are charged by law.' })
];
