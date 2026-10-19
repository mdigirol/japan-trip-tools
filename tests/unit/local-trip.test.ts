// Checks that only apply to this repo's itinerary in data/local/. The shared tests (trip.test.ts) cover the
// schema and confidentiality rules; this file isn't in japan-trip-tools-public, so merges never touch it.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { areaTips } from '../../src/data/places';
import { distM } from '../../src/lib/overpass';
import { dataDir, dataFile } from '../../scripts/build-env';

const trip = JSON.parse(readFileSync(dataFile('trip.json'), 'utf8')) as {
  stays: { id: string; addrJa: string }[]; days: { date: string; hoods: { slug: string }[] }[];
};

describe('data/local trip.json', () => {
  it('is the data the app builds with', () => {
    expect(dataDir().replace(/\\/g, '/')).toMatch(/\/data\/local$/);
  });

  it('has 17 days, Nov 11–27, and four stays', () => {
    expect(trip.days).toHaveLength(17);
    expect(trip.days[0].date).toBe('2026-11-11');
    expect(trip.days[16].date).toBe('2026-11-27');
    expect(trip.stays.map((s) => s.id)).toEqual(['prince', 'kinnotake', 'nol', 'edition']);
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

  it('has area tips for every hood Today uses, except the known gaps', () => {
    const slugs = new Set(areaTips.map((a) => a.slug));
    const used = new Set(trip.days.flatMap((d) => d.hoods.map((h) => h.slug)));
    // These hoods have no notes in context/places.md yet.
    expect([...used].filter((s) => !slugs.has(s)).sort()).toEqual(['kioicho', 'nihonbashi', 'roppongi', 'shinjuku-gyoen']);
  });
});

describe('data/local konbini-near-stops.json', () => {
  const days = JSON.parse(readFileSync(dataFile('konbini-near-stops.json'), 'utf8')).days as Record<string, { lat: number; lng: number; nearHotel: boolean }[]>;

  it('has stores for every trip day after arrival', () => {
    const empty = trip.days.slice(1).map((d) => d.date).filter((d) => !days[d]?.length);
    expect(empty).toEqual([]);
  });

  // AC §6.12
  it('Nov 21 lists stores near Kinkaku-ji, Nara Park and the Kyoto hotel', () => {
    const nov21 = days['2026-11-21'] ?? [];
    const near = (lat: number, lng: number, m = 700) => nov21.some((k) => distM(k, { lat, lng }) <= m);
    expect(nov21.some((k) => k.nearHotel)).toBe(true);
    expect(near(35.0394, 135.7292)).toBe(true);   // Kinkaku-ji
    expect(near(34.6851, 135.8430, 1500)).toBe(true);   // Nara Park: nearest stores are by Kintetsu Nara
  });
});
