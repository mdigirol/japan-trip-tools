// Money and shopping content, from context/money-and-shopping.md.
export const QUICK_AMOUNTS = [100, 500, 1000, 3000, 5000, 10000, 30000, 50000];
export const QUICK_USD = [1, 5, 10, 20, 50, 100, 200, 500];

export const TAX = { standard: 0.1, takeawayFood: 0.08 };
export const TAX_FREE_MIN_YEN = 5000;   // before tax, per store, per day
export const JNTO_TAX_FREE_URL = 'https://www.japan.travel/en/ca/news/changes-are-coming-to-japans-tax-free-shopping/';

export const COMMON_PRICES = [
  { what: 'Konbini breakfast', yen: '¥400–600' },
  { what: 'Ramen or beef bowl', yen: '¥700–1,000' },
  { what: 'Casual lunch set', yen: '¥800–1,200' },
  { what: 'Yakitori, per stick', yen: '¥200–400' },
  { what: 'Kyoto city bus', yen: '¥230' },
  { what: 'IC card deposit', yen: '¥500' },
  { what: 'Bar seat charge', yen: '¥500–1,500' },
  { what: 'Izakaya otoshi', yen: '¥300–600' }
];

export const CASH_TIPS = [
  'Japan is still cash-heavy. Kyoto most of all.',
  'Keep about ¥10,000 or more in mixed notes and coins.',
  'Use 7-Eleven ATMs. They reliably take foreign cards.',
  'When a terminal offers dollars, choose yen. The dollar option uses a worse rate.',
  'Bring a coin purse. Shrines and lockers need coins.',
  'No tipping, ever.'
];

// The Nov 1, 2026 refund system. Safety-relevant: verify against the Japan Tourism Agency before the freeze.
export const TAX_FREE_RULES = [
  'Through Oct 31, 2026 the old process applies: the shop takes the tax off at the register.',
  'For purchases from Nov 1, 2026, you pay the tax-inclusive price. The rate is 10%, or 8% for qualifying food and non-alcoholic drinks.',
  'You then show the goods to customs on departure, before check-in. The shop or its refund service pays you back after customs confirms. Customs itself doesn’t hand out cash.',
  'The goods must be with you and shown at customs. Shipped items don’t count.',
  'Keep every receipt. No receipt, no refund.',
  'Minimum ¥5,000 before tax, per store, per day. Bundle small buys at one store.',
  'Consumables no longer need sealed bags, but lose eligibility if used in Japan.',
  'You have 90 days to take the goods out of Japan.',
  'Show your passport at the shop. It’s logged electronically.',
  'Look for the "Japan. Tax-free Shop" sign.'
];

export const WORTH_BUYING = [
  'Skincare and sunscreen. Drugstores are calmer than Don Quijote.',
  'Japanese whisky and gin.',
  'Snacks, tea, seasonings and nori. They travel well.',
  'Uniqlo, GU and Muji basics. FamilyMart socks.',
  'Same-day glasses at JINS.',
  'Ceramics, knives, chopsticks, onigiri molds: Kappabashi or a department store kitchen floor.',
  'Matcha from a specialist (Ippodo, or Uji shops), not a tourist stall. Ask which grade suits you.'
];

export const SIZE_NOTES = [
  'Japanese and US sizes have no reliable conversion. Check each brand’s size chart and garment measurements, and try items on when you can.',
  'Shoes are in centimeters. Try on to be sure.'
];

// Rough shoe-size guide: US men's + 18 = cm; US women's + 17 = cm. [V]
export const shoeCm = (us: number, kind: 'men' | 'women') => us + (kind === 'men' ? 18 : 17);
export const CLOTHING = [
  { us: 'XS', jp: 'S' }, { us: 'S', jp: 'M' }, { us: 'M', jp: 'L' }, { us: 'L', jp: 'XL (LL)' }, { us: 'XL', jp: 'XXL (3L)' }
];

export const KNIFE_NOTE = 'Knives go in checked luggage only. Leave them in the store box until packing.';
