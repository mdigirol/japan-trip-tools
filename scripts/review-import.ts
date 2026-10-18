// Applies review/japanese-strings.csv back to the data files: replaces corrected Japanese and romaji,
// and sets reviewed: true on every row the reviewer saw (rows with reviewed=true in the sheet, or any correction).
// Edits the TypeScript source files in place by matching each entry's id; check the git diff afterward.
import { readFileSync, writeFileSync } from 'node:fs';

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
    if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const FILES: Record<string, string> = { phrase: 'src/data/phrases.ts', showCard: 'src/data/showCards.ts', glossary: 'src/data/glossary.ts' };
const [head, ...rows] = parseCsv(readFileSync('review/japanese-strings.csv', 'utf8').replace(/^﻿/, ''));
const col = (n: string) => head.indexOf(n);
const src: Record<string, string> = {};
let changed = 0;
const reviewedPhrases: string[] = [];
for (const r of rows) {
  const kind = r[col('kind')], id = r[col('id')], file = FILES[kind];
  if (!file || id === 'taxi-header') continue;
  src[file] ??= readFileSync(file, 'utf8');
  const ja = r[col('japanese')], newJa = r[col('corrected_japanese')].trim(), newRo = r[col('corrected_romaji')].trim();
  const seen = r[col('reviewed')] === 'true' || newJa || newRo;
  if (!seen) continue;
  // Find the line holding this id and patch it.
  const lines = src[file].split('\n');
  const i = lines.findIndex((l) => l.includes(`'${id}'`));
  if (i < 0) { console.warn(`! ${kind} ${id} not found in ${file}`); continue; }
  let l = lines[i];
  if (newJa) l = l.split(`'${ja}'`).join(`'${newJa.replace(/'/g, "\\'")}'`);
  if (newRo) l = l.replace(new RegExp(`'${r[col('romaji')].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`), `'${newRo.replace(/'/g, "\\'")}'`);
  if (kind === 'phrase') reviewedPhrases.push(id); else l = l.replace('reviewed: false', 'reviewed: true');
  if (l !== lines[i]) { lines[i] = l; changed++; }
  src[file] = lines.join('\n');
}
if (reviewedPhrases.length) {
  const f = FILES.phrase;
  src[f] ??= readFileSync(f, 'utf8');
  src[f] = src[f].replace(/export const REVIEWED_PHRASES: string\[\] = \[([\s\S]*?)\];/, (_m, body: string) => {
    const ids = new Set([...body.matchAll(/'([^']+)'/g)].map((m) => m[1]).concat(reviewedPhrases));
    return `export const REVIEWED_PHRASES: string[] = [\n${[...ids].map((x) => `  '${x}',`).join('\n')}\n];`;
  });
}
for (const [f, s] of Object.entries(src)) writeFileSync(f, s);
console.log(`Updated ${changed} lines; ${reviewedPhrases.length} phrases marked reviewed. Check the git diff, then npm test.`);
