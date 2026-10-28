// Every content file passes its schema, and the module ACs that are about content.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { AreaTip, DRINK_KINDS, DRINK_PURPOSES, EmergencyNumber, EtiquetteCard, GlossaryTerm, KonbiniDrink, Phrase, ShowCard } from '../../src/data/schema';
import { phrases, PHRASE_TABS } from '../../src/data/phrases';
import { etiquette } from '../../src/data/etiquette';
import { showCards } from '../../src/data/showCards';
import { glossary } from '../../src/data/glossary';
import { areaTips } from '../../src/data/places';
import { numbers } from '../../src/data/emergency';
import { DRINK_KIND_LABELS, DRINK_PURPOSE_LABELS, konbiniDrinks } from '../../src/data/konbiniDrinks';
import trip from '@data/trip.json';
import { matchPhrase } from '../../src/routes/Phrases';

const ctx = (f: string) => readFileSync(new URL(`../../context/${f}`, import.meta.url), 'utf8');
const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe('schemas', () => {
  it.each([
    ['phrases', Phrase, phrases], ['etiquette', EtiquetteCard, etiquette], ['showCards', ShowCard, showCards],
    ['glossary', GlossaryTerm, glossary], ['places', AreaTip, areaTips], ['emergency', EmergencyNumber, numbers],
    ['konbiniDrinks', KonbiniDrink, konbiniDrinks]
  ] as const)('%s', (_n, schema, data) => {
    const r = z.array(schema as z.ZodTypeAny).safeParse(data);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
    expect(unique((data as { id?: string; slug?: string }[]).map((d) => d.id ?? d.slug!))).toBe(true);
  });
  it('phrases use known tabs', () => {
    const tabs = new Set<string>(PHRASE_TABS.map((t) => t.id));
    for (const p of phrases) expect(tabs.has(p.tab), p.id).toBe(true);
  });
  it('all Japanese ships as unreviewed drafts until the native-speaker check', () => {
    expect([...phrases, ...etiquette, ...showCards, ...glossary, ...konbiniDrinks].every((x) => typeof x.reviewed === 'boolean')).toBe(true);
  });
});

describe('phrasebook ACs', () => {
  it('has every ★ phrase from context/phrases.md', () => {
    const stars = [...ctx('phrases.md').matchAll(/^\| ★ [^|]+\| ([^|]+) \|/gm)].map((m) => m[1].trim());
    expect(stars.length).toBeGreaterThanOrEqual(20);
    for (const ja of stars) {
      const p = phrases.find((x) => x.ja === ja);
      expect(p, ja).toBeTruthy();
      expect(p!.mvp, ja).toBe(true);
    }
  });
  it('search for "check" finds お会計お願いします', () => {
    expect(phrases.filter((p) => matchPhrase(p, 'check')).map((p) => p.ja)).toContain('お会計お願いします');
    expect(phrases.filter((p) => matchPhrase(p, 'okaikei')).map((p) => p.ja)).toContain('お会計お願いします');
    expect(phrases.filter((p) => matchPhrase(p, 'お会計')).length).toBe(1);
  });
});

describe('etiquette ACs', () => {
  it('has every "must" card from context/etiquette.md', () => {
    const musts = [...ctx('etiquette.md').matchAll(/^- \*\*must · /gm)].length;
    expect(etiquette.filter((c) => c.severity === 'must').length).toBeGreaterThanOrEqual(musts);
  });
  it('Ryokan shows the yukata, slippers and dinner-time cards', () => {
    const ids = etiquette.filter((c) => c.group === 'ryokan').map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['yukata', 'tatami-slippers', 'toilet-slippers', 'dinner-time']));
  });
  it('the shrine card has the numbered washing sequence', () => {
    expect(etiquette.find((c) => c.id === 'temizuya')?.steps?.length).toBe(5);
  });
});

describe('konbini drinks', () => {
  it('every purpose has a label', () => {
    for (const p of DRINK_PURPOSES) expect(DRINK_PURPOSE_LABELS[p], p).toBeTruthy();
  });
  it('every kind has a label', () => {
    for (const k of DRINK_KINDS) expect(DRINK_KIND_LABELS[k], k).toBeTruthy();
  });
  it('ids and brands are unique', () => {
    expect(new Set(konbiniDrinks.map((d) => d.id)).size).toBe(konbiniDrinks.length);
    expect(new Set(konbiniDrinks.map((d) => d.brand.toLowerCase())).size).toBe(konbiniDrinks.length);
  });
  it('notes and looks make no effect or dose claims', () => {
    const claim = /\b(cure|treat|prevent|heal|remedy|reliev|detox|mg)\b/i;
    for (const d of konbiniDrinks) {
      expect(d.note, d.id).not.toMatch(claim);
      expect(d.look, d.id).not.toMatch(claim);
    }
  });
});

describe('area tips', () => {
  it('cover the slugs Today uses, where notes exist', () => {
    const slugs = new Set(areaTips.map((a) => a.slug));
    const used = new Set(trip.days.flatMap((d) => d.hoods.map((h) => h.slug)));
    const missing = [...used].filter((s) => !slugs.has(s));
    expect(missing).toEqual([]);
  });
});

describe('emergency numbers', () => {
  it('every verified number has an official sourceUrl', () => {
    for (const n of numbers.filter((x) => x.verified)) expect(n.sourceUrl, n.id).toMatch(/^https:\/\//);
  });
  it('110 and 119 are present and verified', () => {
    expect(numbers.find((n) => n.dial === '110')?.verified).toBe(true);
    expect(numbers.find((n) => n.dial === '119')?.verified).toBe(true);
  });
});
