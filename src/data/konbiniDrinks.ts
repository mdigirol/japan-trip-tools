// Konbini drinks glossary (#23): teas and functional drinks. Notes are paraphrased; Japanese is unreviewed.
// Purposes say what a drink is sold for, never what it does. See context/konbini.md.
import type { KonbiniDrink as D } from './schema';

export const DRINK_PURPOSE_LABELS: Record<D['purposes'][number], string> = {
  'after-drinking': 'After drinking', stomach: 'Stomach', 'sleep-relax': 'Sleep / relax',
  energy: 'Energy', 'warm-up': 'Warm-up', hydration: 'Hydration'
};

// Checked against each maker's official page (Oct 2026). caffeine: true only where the maker lists it.
export const konbiniDrinks: D[] = [
  { id: 'mugicha', brand: 'Kenko Mineral Mugicha', ja: '健康ミネラルむぎ茶', romaji: 'kenkō mineraru mugicha', kind: 'tea', purposes: ['hydration'], look: 'PET bottle, about 600 ml', note: 'Roasted barley tea. Toasty, not bitter.', caffeine: false, productUrl: 'https://www.itoen.co.jp/mugicha/', source: ['V'], reviewed: false },
  { id: 'sokenbicha', brand: 'Sokenbicha', ja: '爽健美茶', romaji: 'sōkenbicha', kind: 'tea', purposes: ['hydration'], look: 'PET bottle, about 600 ml', note: 'Blended grain-and-herb tea. Light and toasty.', caffeine: false, productUrl: 'https://www.sokenbicha.jp/jp/ja/brands/sokenbicha/products', source: ['V'], reviewed: false },
  { id: 'namacha', brand: 'Kirin Namacha', ja: '生茶', romaji: 'namacha', kind: 'tea', purposes: ['hydration'], look: 'PET bottle, 525 ml', note: 'Green tea with a mellow, rounded taste.', caffeine: true, productUrl: 'https://www.kirin.co.jp/softdrink/namacha/about.html', source: ['V'], reviewed: false },
  { id: 'namacha-houji', brand: 'Kirin Namacha Hoji', ja: '生茶 ほうじ煎茶', romaji: 'namacha hōji sencha', kind: 'tea', purposes: ['hydration'], look: 'PET bottle, 525 ml', note: 'Roasted green tea. Toasty and a little sweet.', caffeine: true, productUrl: 'https://www.kirin.co.jp/softdrink/namacha/houji.html', source: ['V'], reviewed: false },
  { id: 'namacha-decaf', brand: 'Kirin Namacha Caffeine Free', ja: '生茶 カフェインフリー', romaji: 'namacha kafein furī', kind: 'tea', purposes: ['hydration'], look: 'PET bottle, about 430 ml', note: 'Green tea with the caffeine taken out.', caffeine: false, productUrl: 'https://www.kirin.co.jp/softdrink/namacha/decaf.html', source: ['V'], reviewed: false },
  { id: 'relax-rooibos', brand: 'ITO EN Relax Rooibos', ja: 'ルイボスティー', romaji: 'ruibosu tī', kind: 'tea', purposes: ['sleep-relax'], look: 'PET bottle, 500 or 600 ml', note: 'Rooibos tea. Sweet, fragrant, no caffeine.', caffeine: false, productUrl: 'https://www.itoen.co.jp/news/article/91580/', source: ['V'], reviewed: false },
  { id: 'ukon-no-chikara', brand: 'Ukon no Chikara', ja: 'ウコンの力 ウコンエキスドリンク', romaji: 'ukon no chikara ukon ekisu dorinku', kind: 'functional', purposes: ['after-drinking'], look: 'Small bottle, 100 ml', note: 'Fruity turmeric drink in a shot-size bottle.', caffeine: false, productUrl: 'https://www.house-wf.co.jp/products/detail.php?cd=091933', source: ['V'], reviewed: false },
  { id: 'hepalyse-w', brand: 'Hepalyse W', ja: 'ヘパリーゼW', romaji: 'heparīze daburyū', kind: 'functional', purposes: ['after-drinking'], look: 'Small bottle, 100 ml', note: 'Pineapple-flavored shot sold by the register.', caffeine: false, productUrl: 'https://www.zeria.co.jp/hepa/w/product/hepa-w_w.html', source: ['V'], reviewed: false },
  { id: 'y1000', brand: 'Yakult Y1000', ja: 'Y1000', romaji: 'wai sen', kind: 'functional', purposes: ['sleep-relax', 'stomach'], look: 'Small bottle, 110 ml', note: 'Sweet, thick cultured-milk drink.', caffeine: false, productUrl: 'https://www.yakult.co.jp/products/', source: ['V'], reviewed: false },
  { id: 'pocari-sweat', brand: 'Pocari Sweat', ja: 'ポカリスエット', romaji: 'pokari suetto', kind: 'functional', purposes: ['hydration'], look: 'PET bottle, 500 ml (also smaller and larger)', note: 'Lightly sweet electrolyte drink.', caffeine: false, productUrl: 'https://www.otsuka.co.jp/nutraceutical/products/pocarisweat/', source: ['V'], reviewed: false },
  { id: 'pocari-ion-water', brand: 'Pocari Sweat Ion Water', ja: 'ポカリスエット イオンウォーター', romaji: 'pokari suetto ion wōtā', kind: 'functional', purposes: ['hydration'], look: 'PET bottle, 500 ml', note: 'Lighter, less sweet version of Pocari.', caffeine: false, productUrl: 'https://www.otsuka.co.jp/nutraceutical/products/ionwater/', source: ['V'], reviewed: false },
  { id: 'os-1', brand: 'OS-1', ja: 'オーエスワン', romaji: 'ō esu wan', kind: 'functional', purposes: ['hydration'], look: 'PET bottle, 500 or 300 ml', note: 'Salty oral rehydration drink. Plain or apple.', caffeine: false, productUrl: 'https://www.otsuka.co.jp/nutraceutical/products/os-1/', source: ['V'], reviewed: false },
  { id: 'aquarius', brand: 'Aquarius', ja: 'アクエリアス', romaji: 'akueriasu', kind: 'functional', purposes: ['hydration'], look: 'PET bottle, 500 ml', note: 'Sports drink. Lighter than Pocari.', caffeine: false, productUrl: 'https://www.cocacola.co.jp/brands/aquarius', source: ['V'], reviewed: false }
];
