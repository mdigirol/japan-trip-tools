// Private app only: notes for Claude (src/lib/noteThread.ts), shared by the app and scripts/loop/notes.ts.
import { describe, expect, it } from 'vitest';
import { NOTE_KINDS, URGENT_KINDS, noteBody, noteLabels, noteTitle, parse, state, tag, thread, updateReady, type GhComment, type GhIssue } from '../../src/lib/noteThread';

const issue = (body: string, open = true): GhIssue => ({ number: 7, state: open ? 'open' : 'closed', body, created_at: '2026-11-12T01:00:00Z', labels: [{ name: 'note' }, { name: 'k:broken' }] });
const c = (meta: object, text: string, at: string): GhComment => ({ body: tag(meta) + text, created_at: at });
const T0 = Date.parse('2026-11-12T02:00:00Z');

describe('note issues', () => {
  it('Broken, Wrong info and Glitch are the urgent kinds', () => {
    expect(URGENT_KINDS).toEqual(['broken', 'wrong', 'glitch']);
    expect(NOTE_KINDS.map((k) => k.id)).toEqual(['broken', 'wrong', 'glitch', 'change', 'add', 'question', 'idea']);
  });
  it('round-trips the hidden tag, even with "-->" in the text', () => {
    const body = noteBody({ id: 'a', by: 'Matt', ty: 'broken', scr: 'currency' }, '  the table says --> wrong  ');
    const p = parse(body);
    expect(p.meta).toEqual({ id: 'a', by: 'Matt', ty: 'broken', scr: 'currency' });
    expect(p.text).toBe('the table says --> wrong');
    expect(parse(tag({ by: 'x -->' }) + 'hi').meta.by).toBe('x -->');
  });
  it('titles from the first line, labels by kind', () => {
    expect(noteTitle('Rate is stale\nmore')).toBe('note: Rate is stale');
    expect(noteTitle('x'.repeat(80))).toHaveLength(6 + 60);
    expect(noteLabels('glitch')).toEqual(['note', 'k:glitch']);
  });
});

describe('thread status', () => {
  const t = (comments: GhComment[], open = true) => thread(issue(noteBody({ id: 'a', by: 'Matt', ty: 'broken' }, 'Broken'), open), comments);

  it('a new note is queued and actionable', () => {
    expect(state(t([]), T0)).toMatchObject({ status: 'queued', actionable: true });
  });
  it('a fresh claim is not actionable; a stale one is picked up again', () => {
    const th = t([c({ by: 'Claude', st: 'working' }, 'Claude is on it.', '2026-11-12T01:50:00Z')]);
    expect(state(th, T0)).toMatchObject({ status: 'working', actionable: false });
    expect(state(th, T0 + 40 * 60e3).actionable).toBe(true);
  });
  it('needs Matt until someone answers; Matt’s approval reads as Approved', () => {
    const asked = [c({ by: 'Claude', st: 'needs' }, 'Add it?', '2026-11-12T01:10:00Z')];
    expect(state(t(asked), T0)).toMatchObject({ status: 'needs', actionable: false, approved: false });
    const ok = [...asked, c({ by: 'Matt', ok: 1 }, 'Approved.', '2026-11-12T01:20:00Z')];
    expect(state(t(ok), T0)).toMatchObject({ status: 'approved', actionable: true, approved: true });
    const answered = [...asked, c({ by: 'Katherine' }, 'Yes please', '2026-11-12T01:20:00Z')];
    expect(state(t(answered), T0)).toMatchObject({ status: 'queued', actionable: true, approved: false });
  });
  it('only Matt’s ok counts as approval', () => {
    const th = t([c({ by: 'Claude', st: 'needs' }, '?', '2026-11-12T01:10:00Z'), c({ by: 'Katherine', ok: 1 }, 'ok', '2026-11-12T01:20:00Z')]);
    expect(state(th, T0).approved).toBe(false);
  });
  it('closed is done, with the shipped time of the fix', () => {
    const th = t([c({ by: 'Claude', st: 'done', shipped: '2026-11-12T01:30:00Z' }, 'Fixed.', '2026-11-12T01:40:00Z')], false);
    expect(state(th, T0)).toMatchObject({ status: 'done', actionable: false, shipped: '2026-11-12T01:30:00Z' });
  });
  it('a reply on a done-but-open thread makes it actionable again', () => {
    const th = t([c({ by: 'Claude', st: 'needs' }, '?', '2026-11-12T01:10:00Z'), c({ by: 'Matt' }, 'Also the font', '2026-11-12T01:20:00Z')]);
    expect(state(th, T0).actionable).toBe(true);
  });
});

describe('update ready', () => {
  it('only when the phone’s build is older than the shipped fix', () => {
    expect(updateReady('2026-11-12T01:30:00Z', '2026-11-11T00:00:00Z')).toBe(true);
    expect(updateReady('2026-11-12T01:30:00Z', '2026-11-12T01:35:00Z')).toBe(false);
    expect(updateReady('', '2026-11-11T00:00:00Z')).toBe(false);
    expect(updateReady('2026-11-12T01:30:00Z', 'test')).toBe(false);
  });
});
