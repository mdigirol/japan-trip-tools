// trip.json: schema, shape, and the confidentiality rules for a public repo (§2, §7).
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { TripFile } from '../../src/data/schema';

const raw = readFileSync(new URL('../../src/data/trip.json', import.meta.url), 'utf8');
const trip = JSON.parse(raw);

describe('trip.json', () => {
  it('passes the strict schema (no keys outside it)', () => {
    const r = TripFile.safeParse(trip);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  it('has 17 days, Nov 11–27, and four stays', () => {
    expect(trip.days).toHaveLength(17);
    expect(trip.days[0].date).toBe('2026-11-11');
    expect(trip.days[16].date).toBe('2026-11-27');
    expect(trip.stays.map((s: { id: string }) => s.id)).toEqual(['prince', 'kinnotake', 'nol', 'edition']);
  });

  it('has the hotel Japanese addresses from the itinerary', () => {
    const expected: Record<string, string> = {
      prince: '〒102-8585 東京都千代田区紀尾井町1-2',
      kinnotake: '〒250-0315 神奈川県足柄下郡箱根町塔之澤191',
      nol: '〒604-8182 京都市中京区堺町通姉小路下る大阪材木町700番',
      edition: '〒105-0001 東京都港区虎ノ門4-1-1'
    };
    for (const s of trip.stays) expect(s.addrJa).toBe(expected[s.id]);
  });

  const itin = join(homedir(), 'Documents/japan-trip-itinerary/index.html');
  it.skipIf(!existsSync(itin))('matches STAYS addrJa in the itinerary exactly', () => {
    const html = readFileSync(itin, 'utf8');
    for (const s of trip.stays) expect(html).toContain(`addrJa: '${s.addrJa}'`);
  });

  it('contains no booking numbers, booking words, prices or tokens', () => {
    const banned: [string, RegExp][] = [
      ['long digit run (confirmation number)', /\d{7,}/],
      ['letter+digits code (C260517…)', /\b[A-Z]{1,3}\d{6,}\b/],
      ['control number (E372-style)', /\bE\d{3}\b/],
      ['trip reference (two letters, dash, letters+digits)', /\b[A-Z]{2}-[A-Z]{2}\d+/],
      ['booking words', /\b(Booked|Ticketed|Confirmation|Reservation (number|under)|prepaid)\b/i],
      ['prices', /(\$\s?\d|¥\s?\d|\d\s?yen\b|USD)/i],
      ['tokens', /(github_pat_|ghp_|gho_|AIza[0-9A-Za-z_-]{10,}|sk-[A-Za-z0-9]{10,})/],
      ['emails', /[\w.+-]+@[\w-]+\.[\w.]+/],
      ['clock times', /\b\d{1,2}:\d{2}\s?(AM|PM|a|p)\b/i]
    ];
    const strings: string[] = [];
    const walk = (v: unknown, path: string) => {
      if (typeof v === 'string') { if (path !== 'generatedAt') strings.push(v); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    };
    walk(trip, '');
    for (const s of strings) for (const [name, re] of banned) expect(re.test(s), `${name}: "${s}"`).toBe(false);
  });

  it('only has hotel front-desk phone numbers', () => {
    const phones = raw.match(/\+81[\d -]+/g) ?? [];
    expect(phones.sort()).toEqual(trip.stays.map((s: { tel: string }) => s.tel).sort());
  });
});
