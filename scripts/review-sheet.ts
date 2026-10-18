// Exports every Japanese string to review/japanese-strings.csv for the native-speaker check (D9).
// Columns: kind, id, english, japanese, romaji, note, reviewed, corrected_japanese, corrected_romaji
// Fill the two "corrected" columns (leave blank if fine) and run `npm run review-import`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { phrases } from '../src/data/phrases';
import { etiquette } from '../src/data/etiquette';
import { showCards, TAXI_HEADER } from '../src/data/showCards';
import { glossary } from '../src/data/glossary';

const esc = (s = '') => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
const rows: string[][] = [['kind', 'id', 'english', 'japanese', 'romaji', 'note', 'reviewed', 'corrected_japanese', 'corrected_romaji']];
for (const p of phrases) rows.push(['phrase', p.id, p.en, p.ja, p.romaji, p.note ?? '', String(p.reviewed), '', '']);
for (const c of showCards) rows.push(['showCard', c.id, c.en, c.ja, c.romaji ?? '', '', String(c.reviewed), '', '']);
rows.push(['showCard', 'taxi-header', TAXI_HEADER.en, TAXI_HEADER.ja, TAXI_HEADER.romaji, 'Header on every hotel taxi card', String(TAXI_HEADER.reviewed), '', '']);
for (const g of glossary) rows.push(['glossary', g.id, g.en, g.ja, g.romaji, g.note ?? '', String(g.reviewed), '', '']);
// Etiquette cards are English, but some quote Japanese words; list those for a look.
for (const e of etiquette) {
  const text = [e.title, ...e.do, ...e.dont, ...(e.steps ?? []), e.why].join(' / ');
  if (/[぀-ヿ一-鿿]/.test(text)) rows.push(['etiquette', e.id, e.title, text, '', '', String(e.reviewed), '', '']);
}
mkdirSync('review', { recursive: true });
writeFileSync('review/japanese-strings.csv', '﻿' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
console.log(`Wrote review/japanese-strings.csv (${rows.length - 1} strings)`);
