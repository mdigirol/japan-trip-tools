import type { Stay } from '../data/schema';
import { TAXI_HEADER } from '../data/showCards';
import type { ShowCardView } from './showcard';
import { telDisplay } from './showcard';

export function hotelCard(s: Stay): ShowCardView {
  return {
    head: TAXI_HEADER.ja, ja: s.addrJa, sub: s.nameJa, tel: s.tel, telLabel: telDisplay(s.tel),
    en: `${TAXI_HEADER.en} ${s.name} · ${s.addrEn}`, romaji: TAXI_HEADER.romaji
  };
}
