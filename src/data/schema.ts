// Zod schemas and types for every content file. A bad entry fails the tests and the build.
import { z } from 'zod';

export const SOURCES = ['N', 'K', 'T', 'I', 'V', 'JNTO'] as const;
export const PLACES = ['tokyo', 'hakone', 'kyoto', 'osaka', 'nara', 'maihama', 'anywhere'] as const;
export const VENUES = ['sushi-counter', 'izakaya', 'yakitori', 'ramen', 'restaurant', 'cafe', 'cocktail-bar', 'ryokan',
  'onsen', 'temple', 'shrine', 'department-store', 'shop', 'konbini', 'train', 'shinkansen', 'taxi', 'theme-park',
  'market', 'pharmacy'] as const;
export const SITUATIONS = ['arriving', 'ordering', 'paying', 'asking', 'problem', 'emergency', 'leaving'] as const;

export const Source = z.enum(SOURCES);
export const Place = z.enum(PLACES);
export const Venue = z.enum(VENUES);
export const Situation = z.enum(SITUATIONS);
export type Source = z.infer<typeof Source>;
export type Place = z.infer<typeof Place>;
export type Venue = z.infer<typeof Venue>;
export type Situation = z.infer<typeof Situation>;

const id = z.string().regex(/^[a-z0-9-]+$/);
const sources = z.array(Source).min(1);
const url = z.string().url();

export const Phrase = z.strictObject({
  id, en: z.string().min(1), ja: z.string().min(1), kana: z.string().optional(), romaji: z.string().min(1),
  situations: z.array(Situation).min(1), venues: z.array(Venue), places: z.array(Place).optional(),
  slots: z.array(z.string()).optional(),
  note: z.string().optional(), mvp: z.boolean(), source: sources, sourceUrl: url.optional(),
  reviewed: z.boolean(), audio: z.string().optional(),
  tab: z.string()                 // phrasebook tab id (see PHRASE_TABS)
});
export type Phrase = z.infer<typeof Phrase>;

export const EtiquetteCard = z.strictObject({
  id, title: z.string().min(1), severity: z.enum(['must', 'should', 'nice']),
  do: z.array(z.string()), dont: z.array(z.string()), why: z.string(),
  venues: z.array(Venue), places: z.array(Place).optional(), areas: z.array(z.string()).optional(),
  group: z.string(),              // browse group (see ETIQUETTE_GROUPS)
  steps: z.array(z.string()).optional(),   // numbered sequence, e.g. the shrine washing ritual
  source: sources, sourceUrl: url.optional(), reviewed: z.boolean()
});
export type EtiquetteCard = z.infer<typeof EtiquetteCard>;

export const ShowCard = z.strictObject({
  id, title: z.string().min(1), ja: z.string().min(1), en: z.string().min(1), romaji: z.string().min(1),
  kind: z.enum(['hotel', 'dining', 'bath', 'other']),
  stayId: z.string().optional(), slots: z.array(z.string()).optional(), source: sources, reviewed: z.boolean()
});
export type ShowCard = z.infer<typeof ShowCard>;

export const GlossaryTerm = z.strictObject({
  id, ja: z.string().min(1), romaji: z.string(), en: z.string().min(1),
  category: z.enum(['sign', 'ticket', 'sushi', 'yakitori', 'ramen', 'izakaya', 'drink', 'regional', 'knife']),
  note: z.string().optional(),
  places: z.array(Place).optional(), source: sources, reviewed: z.boolean()
});
export type GlossaryTerm = z.infer<typeof GlossaryTerm>;

// Konbini drinks glossary (#23): teas and functional drinks, sorted by name or by what they're sold for.
export const DRINK_PURPOSES = ['after-drinking', 'stomach', 'sleep-relax', 'energy', 'warm-up', 'hydration'] as const;
export const KonbiniDrink = z.strictObject({
  id, brand: z.string().min(1),   // as printed on the shelf, in English letters
  ja: z.string().min(1),          // the Japanese on the label
  romaji: z.string().min(1),
  kind: z.enum(['tea', 'functional']),
  purposes: z.array(z.enum(DRINK_PURPOSES)).min(1),   // what it's sold for, never a claimed effect
  look: z.string().min(1),        // one line: bottle/can/carton, size, label color
  note: z.string().min(1),        // one line, paraphrased
  caffeine: z.boolean(),          // the one D10 exception: a "Has caffeine" flag
  productUrl: url,                // the maker's official product page (has a photo; needs a connection)
  source: sources, reviewed: z.boolean()
});
export type KonbiniDrink = z.infer<typeof KonbiniDrink>;

export const AreaTip = z.strictObject({
  slug: id, name: z.string(), place: Place, tips: z.array(z.string()).min(1), source: sources
});
export type AreaTip = z.infer<typeof AreaTip>;

export const EmergencyNumber = z.strictObject({
  id, who: z.string(), number: z.string(), dial: z.string().regex(/^(\+?[0-9]+|%23[0-9]+)$/), note: z.string(),
  source: sources, sourceUrl: url.optional(), verified: z.boolean()
});
export type EmergencyNumber = z.infer<typeof EmergencyNumber>;

// ---- trip.json (exported from the itinerary; §7) ----
const ymd = z.string().regex(/^2026-11-\d{2}$/);
export const Stay = z.strictObject({
  id: z.string(), name: z.string(), nameJa: z.string(), addrEn: z.string(), addrJa: z.string(),
  tel: z.string().regex(/^\+81 [0-9-]+$/), lat: z.number(), lng: z.number(), from: ymd, to: ymd,
  checkIn: z.string().regex(/^\d{2}:\d{2}$/).optional()
});
export type Stay = z.infer<typeof Stay>;

export const TripDay = z.strictObject({
  date: ymd, dow: z.string().length(3), seg: z.enum(['air', 't1', 'hk', 'ky', 't2']),
  places: z.array(Place), area: z.string(),
  hoods: z.array(z.strictObject({ name: z.string(), blurb: z.string(), slug: z.string() })),
  venues: z.array(Venue),
  points: z.array(z.strictObject({ lat: z.number(), lng: z.number() })),
  stayTonight: z.string(), stayLastNight: z.string().optional(),
  note: z.string().optional()
});
export type TripDay = z.infer<typeof TripDay>;

export const TripFile = z.strictObject({
  generatedAt: z.string(), stays: z.array(Stay), days: z.array(TripDay)
});
export type TripFile = z.infer<typeof TripFile>;

// ---- Purchase (souvenir tracker + tax-free claim log; never in the build) ----
export const Purchase = z.object({
  id: z.string(), createdAt: z.string(), updatedAt: z.string(), deleted: z.boolean().optional(),
  by: z.string(), item: z.string().min(1), shop: z.string().optional(), place: Place.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priceYen: z.number().nonnegative(), taxPaidYen: z.number().nonnegative().optional(),
  forWhom: z.array(z.string()).optional(), taxFree: z.boolean(),
  receiptKept: z.boolean().optional(), bag: z.string().optional(),
  photoIds: z.array(z.string()).optional(), claimed: z.boolean().optional(), note: z.string().optional()
});
export type Purchase = z.infer<typeof Purchase>;
