// Show cards, from context/show-cards.md. Hotel cards are generated from trip.json stays, never typed here.
import type { ShowCard } from './schema';

export const TAXI_HEADER = { ja: 'この住所までお願いします。', romaji: 'Kono juusho made onegaishimasu.', en: 'Please take me to this address.', reviewed: false };

export const showCards: ShowCard[] = [
  { id: 'walk-in', title: 'Walk-in', kind: 'dining', ja: '二名です。予約はしていませんが、席はありますか？', en: 'Two people, no reservation. Do you have seats?', romaji: 'Nimei desu. Yoyaku wa shite imasen ga, seki wa arimasu ka?', source: ['V'], reviewed: false },
  { id: 'card-ok', title: 'Card OK?', kind: 'dining', ja: 'カードで支払いできますか？', en: 'Can we pay by card?', romaji: 'Kaado de shiharai dekimasu ka?', source: ['V'], reviewed: false },
  { id: 'english-menu', title: 'English menu?', kind: 'dining', ja: '英語のメニューはありますか？', en: 'Do you have an English menu?', romaji: 'Eigo no menyuu wa arimasu ka?', source: ['V'], reviewed: false },
  { id: 'non-smoking', title: 'Non-smoking', kind: 'dining', ja: '禁煙席はありますか？', en: 'Do you have non-smoking seats?', romaji: 'Kin-enseki wa arimasu ka?', source: ['N'], reviewed: false },
  { id: 'tattoo', title: 'Tattoo at the bath', kind: 'bath', ja: '小さい入れ墨があります。大浴場を利用してもいいですか？貸切風呂はありますか？', en: 'I have a small tattoo. May I use the main bath? Is there a private bath?', romaji: 'Chiisai irezumi ga arimasu. Daiyokujou o riyou shite mo ii desu ka? Kashikiri-buro wa arimasu ka?', source: ['N', 'V'], reviewed: false },
  { id: 'call-taxi', title: 'Call a taxi', kind: 'other', ja: 'タクシーを呼んでいただけますか？', en: 'Could you call a taxi for us?', romaji: 'Takushii o yonde itadakemasu ka?', source: ['V'], reviewed: false },
  { id: 'write-it-down', title: 'Write it down', kind: 'other', ja: '書いていただけますか？', en: 'Could you write that down?', romaji: 'Kaite itadakemasu ka?', source: ['V'], reviewed: false },
  { id: 'ship-luggage', title: 'Ship luggage', kind: 'other', ja: 'この荷物を[hotel]へ送りたいです。', en: "I'd like to send this bag to [hotel].", romaji: 'Kono nimotsu o [hotel] e okuritai desu.', slots: ['hotel'], source: ['T', 'V'], reviewed: false },
  { id: 'tax-free', title: 'Tax-free', kind: 'other', ja: '免税でお願いします。パスポートはこちらです。', en: 'Tax-free, please. Here is my passport.', romaji: 'Menzei de onegaishimasu. Pasupooto wa kochira desu.', source: ['V'], reviewed: false },
  { id: 'lost-item', title: 'Lost item', kind: 'other', ja: '[X]をなくしました。届いていませんか？', en: 'I lost my [X]. Has it been turned in?', romaji: '[X] o nakushimashita. Todoite imasen ka?', slots: ['X'], source: ['V'], reviewed: false },
  { id: 'ambulance', title: 'Call an ambulance', kind: 'other', ja: '救急車を呼んでください。', en: 'Please call an ambulance.', romaji: 'Kyuukyuusha o yonde kudasai.', source: ['V'], reviewed: false }
];

// Quick picks for the lost-item slot.
export const LOST_ITEMS = [
  { en: 'wallet', ja: '財布', romaji: 'saifu' }, { en: 'phone', ja: '携帯電話', romaji: 'keitai denwa' },
  { en: 'passport', ja: 'パスポート', romaji: 'pasupooto' }, { en: 'bag', ja: 'かばん', romaji: 'kaban' },
  { en: 'umbrella', ja: '傘', romaji: 'kasa' }, { en: 'camera', ja: 'カメラ', romaji: 'kamera' }
];
