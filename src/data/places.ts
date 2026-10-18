// Area tips by slug, from context/places.md. Today matches each day's hoods (trip.json) to these by slug.
import type { AreaTip, Place, Source } from './schema';

const a = (slug: string, name: string, place: Place, source: Source[], ...tips: string[]): AreaTip => ({ slug, name, place, tips, source });

export const KYOTO_GENERAL = 'Carry more cash than in Tokyo. Many temples, small restaurants and shops are cash-only. Book anything popular ahead. Use train plus walking over buses where you can.';

export const areaTips: AreaTip[] = [
  // Tokyo
  a('tsukiji', 'Tsukiji', 'tokyo', ['N', 'T'], 'Best early, about 8–9 AM, before tour groups.', 'Many stalls close by early afternoon.', 'Eat at the stall, not while walking.'),
  a('ginza', 'Ginza', 'tokyo', ['T', 'V'], 'Pricier than Shibuya or Shinjuku for the same goods.', 'Department-store food halls (depachika) sell top prepared food.', 'Big stores have tax-free counters on an upper floor.'),
  a('asakusa', 'Asakusa', 'tokyo', ['N', 'T'], 'Senso-ji is free and quietest about 7 AM.', 'Kaminarimon is worth seeing lit at night.', 'Nakamise is for snacks. Eat at the stall.'),
  a('yanaka-nezu', 'Yanaka and Nezu', 'tokyo', ['T'], 'Residential old-town streets. Keep voices down.', "Nezu Shrine's torii tunnel is a quiet stand-in for Fushimi Inari.", 'Yanaka Ginza is best in the late afternoon.'),
  a('shinjuku', 'Shinjuku and Kabukicho', 'tokyo', ['N', 'T'], 'Never follow street touts into bars.', 'Golden Gai bars often have a seat charge; some are regulars-only. Look for English or "welcome" signs.', 'The station has 100+ exits. Check the exit number in Maps.', 'Avoid changing between JR and Metro here when you can.'),
  a('kichijoji', 'Kichijoji', 'tokyo', ['I'], 'Relaxed western suburb. Market alleys by the station.'),
  a('shimokitazawa', 'Shimokitazawa', 'tokyo', ['N', 'I'], 'Thrift shops cluster by the west exit.', 'Many shops open around noon.'),
  a('shibuya', 'Shibuya', 'tokyo', ['N', 'T'], 'Watch for "fashion store" invitations from strangers. It’s a known pressure-sales scam.', 'Nonbei Yokocho is the small izakaya alley.'),
  a('harajuku', 'Harajuku and Omotesando', 'tokyo', ['N', 'T'], 'Same scam warning as Shibuya.', 'Yoyogi Park next door is the calm break.'),
  a('ebisu', 'Ebisu', 'tokyo', ['T', 'V'], 'Grown-up food-and-drink area.', 'Small bars, so expect seat charges.'),
  a('jimbocho', 'Jimbocho', 'tokyo', ['T', 'V'], 'Used-book town. Many shops close Sundays and holidays.'),
  a('marunouchi', 'Marunouchi and the Imperial Palace', 'tokyo', ['I'], 'The East Gardens are free. They close Mondays and Fridays.'),
  a('toranomon', 'Toranomon', 'tokyo', ['I', 'V'], 'Small cocktail bars with seat charges and house rules.'),
  a('azabu-juban', 'Azabu-Juban', 'tokyo', ['I', 'V'], 'Small cocktail bars with seat charges and house rules.'),
  a('hama-rikyu', 'Shiba Park and Hama-rikyu', 'tokyo', ['T'], "Hama-rikyu's teahouse serves matcha in the garden."),
  a('kappabashi', 'Kappabashi', 'tokyo', ['N', 'V'], 'Kitchenware street. The knife words are under Shopping.', 'Many shops close Sundays.', 'Knives are tax-free eligible at ¥5,000 or more at one shop.'),
  a('maihama', 'Maihama / DisneySea', 'maihama', ['T', 'V'], 'Use the Tokyo Disney Resort app for Premier Access and mobile ordering.', 'English is widely spoken.'),
  a('meiji-jingu', 'Meiji Jingu and Yoyogi', 'tokyo', ['T', 'V'], 'A Shinto shrine: wash at the basin, then two bows, two claps, one bow.', "Weddings are common. Don't photograph the party up close."),
  a('haneda', 'Haneda', 'tokyo', ['N', 'V'], 'Leave extra time at customs, before check-in, to claim the tax-free refund.'),
  // Hakone
  a('hakone', 'Tonosawa / Hakone-Yumoto', 'hakone', ['N', 'I'], 'Shops along the river close around 5:30–6 PM.', 'Relatively tattoo-friendly. Private baths are easy to find.'),
  a('hakone-upper', 'Gora, Owakudani, Lake Ashi', 'hakone', ['T', 'V'], 'Cable car, ropeway and lake ship.', 'The ropeway can close for volcanic gas or wind. Check the status that morning.'),
  // Kyoto
  a('gion', 'Gion', 'kyoto', ['K', 'V'], "Don't chase or block maiko and geiko. No photos without permission.", 'Some private lanes ban photos outright, with posted fines.', 'Hanamikoji places with English menus out front are the tourist tier; the side alleys are better.', 'Yasaka Shrine is free and best after 8 PM.'),
  a('higashiyama', 'Higashiyama', 'kyoto', ['K'], 'Kiyomizu-dera opens at 6 AM.', 'Ninenzaka and Sannenzaka are empty before 8 and packed by 10.', 'Step aside for photos rather than stopping mid-lane.', 'Watch the uneven Sannenzaka steps. Tripping there is said to bring bad luck.'),
  a('kyoto-downtown', 'Downtown Kyoto: Sanjo, Nishiki, Pontocho, Kiyamachi', 'kyoto', ['K', 'V'], "Nishiki is mostly tourist snacks now. Don't eat while walking there.", 'Pontocho is cheaper at lunch than dinner.', 'The best counters are one street east or west of Pontocho.'),
  a('fushimi', 'Fushimi', 'kyoto', ['K'], "You don't need the full two-hour hike. Ten to twenty minutes up, the gates thin out.", 'Inari sushi is the local food.', 'The sake district (Fushimi-Momoyama) is 10 minutes south.'),
  a('kinugasa', 'Kinugasa: Kinkaku-ji, Ryoan-ji, Ninna-ji', 'kyoto', ['K'], 'Kinkaku-ji opens at 9; tour buses arrive about 10.', 'At Ryoan-ji, sit for ten minutes and look for the hidden fifteenth stone.'),
  a('arashiyama', 'Arashiyama and Sagano', 'kyoto', ['K', 'I'], 'The bamboo grove is quiet only before 7 AM.', 'Walk five minutes past the grove exit to Jojakko-ji for leaves with no crowd.', 'Late November is peak season, the busiest it gets.'),
  a('hozu', 'Kameoka and the Hozu gorge', 'kyoto', ['K', 'I'], 'The boat ride is about two hours.', 'Nothing to buy on board until the end. Bring water and a layer.'),
  // Osaka
  a('namba', 'Namba and Dotonbori', 'osaka', ['N', 'V'], 'Stand on the right on escalators.', 'Kushikatsu shops share one sauce pot: dip once, never twice.', 'Takoyaki is molten inside. Let it cool.', 'Ura-Namba is a maze of standing bars (tachinomi).'),
  a('shinsaibashi', 'Amerikamura and Shinsaibashi', 'osaka', ['N', 'T'], 'Youth fashion and vintage. Busy, so watch your bag.'),
  a('umeda', 'Umeda', 'osaka', ['I', 'V'], 'Huge underground maze. Use exit numbers.'),
  // Nara
  a('nara', 'Nara Park', 'nara', ['N', 'V'], 'The deer bow for shika senbei crackers, but they nip and head-butt.', 'Feed quickly, then show empty palms. Don’t tease them with food.', 'Try kaki-no-ha-zushi: sushi wrapped in persimmon leaves.')
];

export const tipsBySlug = new Map(areaTips.map((t) => [t.slug, t]));
