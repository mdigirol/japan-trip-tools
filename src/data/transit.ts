// Transit how-to cards, from context/transit.md. No routing: Google Maps does that.
import type { Source } from './schema';

export interface TransitSection { id: string; title: string; items: { text: string; source: Source[] }[] }
const t = (text: string, ...source: Source[]) => ({ text, source });

export const transit: TransitSection[] = [
  { id: 'ic', title: 'IC cards (Suica, PASMO, ICOCA)', items: [
    t('Tap in at the gate and tap out. The fare comes off automatically.', 'T', 'K'),
    t('A Tokyo Suica works in Kyoto, Osaka and Nara, and on buses.', 'N', 'K'),
    t('iPhone: Suica in Apple Wallet, topped up with a card from the phone.', 'N', 'T'),
    t('Top up a physical card at any station machine: look for チャージ (charge). Machines have English.', 'N', 'T'),
    t('Also pays at konbini, vending machines and some restaurants.', 'K', 'T'),
    t('Romancecar: the limited-express seat is separate. Tap Suica at the gate for the base fare.', 'I')
  ] },
  { id: 'riding', title: 'Riding trains', items: [
    t('Google Maps gives the platform, the best car for transfers, and local vs rapid.', 'T'),
    t('Local (各駅停車) stops everywhere. Rapid (快速) skips stops.', 'T'),
    t('The map above the doors shows which side opens next. Move there early.', 'T'),
    t('Big stations have 100+ exits. Pick the exit number in Maps before you walk.', 'T'),
    t('Rush hours: about 7:30–9:30 AM and 5:30–7:30 PM.', 'N', 'T'),
    t('Last trains run about midnight. In Google Maps, use "Leave" → "Last".', 'T'),
    t('Using a restroom outside the gates means paying again to re-enter.', 'T')
  ] },
  { id: 'shinkansen', title: 'Shinkansen', items: [
    t('Reserved guarantees a seat. Non-reserved cars fill fast on Tokyo–Kyoto.', 'N'),
    t('Bags over 160 cm total (H+W+D, wheels included) need an oversized-luggage seat, at no extra cost. Without one: a ¥1,000 fee. Over 250 cm: ship it.', 'N'),
    t('Missed train: an ordinary reserved ticket usually lets you ride a later train the same day, non-reserved. Some discount tickets don’t.', 'N', 'V'),
    t('Mt. Fuji: window seat E (D/E in Green). Visible about 40–45 minutes out of Tokyo; sooner from Odawara. Needs a clear day.', 'N', 'K', 'V'),
    t('Buy an ekiben before boarding. Eating on board is normal.', 'N', 'K'),
    t('Smart EX links the booking to your IC card, so you tap through the gate.', 'N', 'T')
  ] },
  { id: 'kyoto-bus', title: 'Kyoto buses and subway', items: [
    t('Board at the rear door. Pay at the front as you get off: about ¥230 in the central zone. Tap IC on exit.', 'K', 'V'),
    t('The bus-only day pass ended in 2023. Use IC.', 'V'),
    t('Buses crawl in autumn. Train plus a 10–15 minute walk is often faster.', 'K'),
    t('Fushimi Inari is two stops from Kyoto Station on the JR Nara Line.', 'K'),
    t('The subway has only two lines. Expect to walk more than in Tokyo.', 'K')
  ] },
  { id: 'taxi', title: 'Taxis', items: [
    t('空車 (red) in the windshield = free. 賃走 = occupied. 迎車 = on its way to a pickup.', 'N', 'T', 'V'),
    t('The doors open and close on their own.', 'T'),
    t('GO and Uber hail ordinary metered taxis, about ¥100 extra. Register before you need them; signup uses SMS.', 'N', 'T'),
    t('Late-night surcharge of about 20%, 10 PM to 5 AM.', 'N', 'V'),
    t('At airports, use the taxi rank.', 'N'),
    t('Show the hotel card instead of saying the address.', 'V')
  ] },
  { id: 'luggage', title: 'Luggage forwarding (takkyubin)', items: [
    t('Ship bags hotel to hotel, usually next-day. Ask the front desk the night before, or use a konbini counter.', 'K', 'T'),
    t('About ¥1,500–2,500 per bag between cities.', 'K', 'T'),
    t('Station coin lockers hold shopping bags for the day. Ecbo Cloak books storage in shops.', 'T')
  ] },
  { id: 'hakone', title: 'Hakone', items: [
    t('The ropeway and cable car can close for volcanic gas or wind. Check the status the morning you go.', 'V'),
    t('Fares and the Hakone Freepass are in the itinerary.', 'I')
  ] }
];
