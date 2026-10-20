// Every tool, for the home tiles and the More page. `ready: false` hides a Phase 2 module until it ships.
export interface ModuleInfo { path: string; label: string; ic: string; blurb: string; ready: boolean }

export const MODULES: ModuleInfo[] = [
  { path: 'phrases', label: 'Phrases', ic: '💬', blurb: 'Say it, show it, hear it', ready: true },
  { path: 'cards', label: 'Show cards', ic: '🪪', blurb: 'Taxi, dining, bath', ready: true },
  { path: 'etiquette', label: 'Etiquette', ic: '🙇', blurb: 'Do and don’t', ready: true },
  { path: 'currency', label: 'Currency', ic: '¥', blurb: 'Rate, table, calculator', ready: true },
  { path: 'emergency', label: 'Emergency', ic: '🚑', blurb: 'Numbers, pharmacy, earthquakes', ready: true },
  { path: 'purchases', label: 'Souvenirs & tax-free', ic: '🛍️', blurb: 'What we bought, claim log', ready: true },
  { path: 'konbini', label: 'Konbini', ic: '🏪', blurb: 'Nearest stores', ready: true },
  { path: 'decoder', label: 'Signs & menus', ic: '🔤', blurb: 'Decode words', ready: true },
  { path: 'transit', label: 'Transit', ic: '🚄', blurb: 'Tickets, IC cards, taxis', ready: true },
  { path: 'numbers', label: 'Numbers', ic: '🔢', blurb: 'Prices aloud, counters', ready: true },
  { path: 'units', label: 'Units', ic: '📏', blurb: '°C/°F, km/mi, g/oz', ready: true },
  { path: 'shopping', label: 'Shopping', ic: '🧾', blurb: 'Tax-free rules, sizes', ready: true },
  { path: 'settings', label: 'Settings', ic: '⚙️', blurb: 'Name, units, sync', ready: true }
];
