// PRIVATE APP ONLY (never in japan-trip-tools-public). How a note for Claude is stored as a GitHub issue,
// and how a thread's status is read from its replies. Shared by the app (src/lib/notes.ts) and the fix-loop
// script (scripts/loop/notes.ts), so both read threads the same way. Rules for Claude: docs/fix-loop.md.
//
// Issue: title "note: <first line>", labels ["note", "k:<kind>"], body "<!-- jtc-note {...} -->\n<text>".
// Every reply starts with the same tag: Claude's carry st (working | needs | done), Matt's approval carries ok.

export const NOTE_LABEL = 'note';
export const NOTE_MAX = 1500;

export type NoteKind = 'broken' | 'wrong' | 'glitch' | 'change' | 'add' | 'question' | 'idea';
export type NoteStatus = 'unsent' | 'queued' | 'working' | 'needs' | 'approved' | 'done';

// Urgent kinds start the GitHub Action right away; the rest wait for the hourly routine.
export const NOTE_KINDS: { id: NoteKind; label: string; urgent: boolean; hint: string }[] = [
  { id: 'broken', label: 'Broken', urgent: true, hint: 'A tool won’t load or work' },
  { id: 'wrong', label: 'Wrong info', urgent: true, hint: 'A fact, phrase, number or rule is wrong' },
  { id: 'glitch', label: 'Glitch', urgent: true, hint: 'Looks off or acts odd' },
  { id: 'change', label: 'Change', urgent: false, hint: 'Reword or rework something' },
  { id: 'add', label: 'Add', urgent: false, hint: 'A phrase, tip or place to add' },
  { id: 'question', label: 'Question', urgent: false, hint: 'How does this work?' },
  { id: 'idea', label: 'Idea / later', urgent: false, hint: 'A new tool or bigger change' }
];
export const URGENT_KINDS: NoteKind[] = NOTE_KINDS.filter((k) => k.urgent).map((k) => k.id);
export const isNoteKind = (k: unknown): k is NoteKind => NOTE_KINDS.some((x) => x.id === k);
export const isUrgent = (k: string) => (URGENT_KINDS as string[]).includes(k);
export const kindLabel = (k: string) => NOTE_KINDS.find((x) => x.id === k)?.label ?? '';

export const STATUS_LABEL: Record<NoteStatus, string> = {
  unsent: 'Not sent yet', queued: 'Waiting for Claude', working: 'Claude is on it',
  needs: 'Needs Matt', approved: 'Approved', done: 'Done'
};

export interface NoteMeta {
  id?: string; by?: string; ty?: string; scr?: string; v?: string; b?: string;   // on the note
  st?: 'working' | 'needs' | 'done'; ok?: 1; shipped?: string;                    // on replies
}

// "--" is escaped so text in the tag can't end the HTML comment early.
export const tag = (o: NoteMeta) => `<!-- jtc-note ${JSON.stringify(o).replace(/--/g, '-\\u002d')} -->\n`;

export function parse(body: string | null | undefined): { meta: NoteMeta; text: string } {
  const b = body || '';
  const m = /^<!-- jtc-note (\{[\s\S]*?\}) -->\s*/.exec(b);
  let meta: NoteMeta = {};
  if (m) { try { meta = JSON.parse(m[1]); } catch { /* not ours */ } }
  return { meta, text: m ? b.slice(m[0].length) : b };
}

export function noteTitle(message: string): string {
  const first = message.trim().split('\n')[0].trim().replace(/\s+/g, ' ');
  return `note: ${first.length > 60 ? `${first.slice(0, 59)}…` : first}`;
}

export const noteLabels = (kind: NoteKind) => [NOTE_LABEL, `k:${kind}`];

// id is the phone's own id for the note, so a send that is retried after a lost answer is spotted.
export const noteBody = (meta: NoteMeta, message: string) => tag(meta) + message.trim().slice(0, NOTE_MAX);

export interface GhIssue { number: number; state: string; body: string | null; created_at: string; labels?: (string | { name: string })[]; user?: { login: string }; pull_request?: unknown }
export interface GhComment { body: string | null; created_at: string; issue_url?: string; user?: { login: string } }
export interface Reply { by: string; at: string; text: string; meta: NoteMeta }
export interface Thread {
  n: number; open: boolean; id: string; by: string; kind: string; screen: string; version: string; built: string;
  at: string; text: string; labels: string[]; replies: Reply[];
}

export function thread(issue: GhIssue, comments: GhComment[]): Thread {
  const p = parse(issue.body);
  return {
    n: issue.number, open: issue.state === 'open', id: p.meta.id || '', by: p.meta.by || '', kind: p.meta.ty || '',
    screen: p.meta.scr || '', version: p.meta.v || '', built: p.meta.b || '', at: issue.created_at, text: p.text,
    labels: (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name)),
    replies: comments.map((c) => { const q = parse(c.body); return { by: q.meta.by || c.user?.login || '', at: c.created_at, text: q.text, meta: q.meta }; })
  };
}

export const isMatt = (who: string | undefined) => /^matt$/i.test(String(who || '').trim());

// A claim older than this is a run that died; the thread is picked up again.
export const STALE_CLAIM = 30 * 60e3;

// Status as the phones show it, plus whether Claude has something to do. A thread is actionable when it is
// open and either Claude hasn't answered yet, or a person wrote after Claude's last message (an answer, a
// follow-up, or Matt's approval). `shipped` is the commit time of the last fix Claude reported live.
export function state(t: Thread, now = Date.now()): { status: NoteStatus; actionable: boolean; approved: boolean; shipped: string } {
  let status = 'queued' as NoteStatus, lastClaude = -1, shipped = '';
  t.replies.forEach((c, i) => {
    if (c.by === 'Claude') lastClaude = i;
    if (c.meta.st) status = c.meta.st;
    else if (c.meta.ok) status = 'approved';
    else if (status === 'needs' && c.by !== 'Claude') status = 'queued';
    if (c.by === 'Claude' && c.meta.shipped) shipped = c.meta.shipped;
  });
  const approved = t.replies.some((c) => c.meta.ok && isMatt(c.by));
  if (!t.open) return { status: 'done', actionable: false, approved, shipped };
  const humanAfter = t.replies.slice(lastClaude + 1).some((c) => c.by !== 'Claude');
  let actionable = lastClaude < 0 || humanAfter;
  if (status === 'working' && !humanAfter) actionable = now - Date.parse(t.replies[lastClaude].at) > STALE_CLAIM;
  return { status, actionable, approved, shipped };
}

// The phone runs a build older than the fix Claude reported live: reopening the app picks it up.
export function updateReady(shipped: string, builtAt: string): boolean {
  const s = Date.parse(shipped), b = Date.parse(builtAt);
  return !!shipped && Number.isFinite(s) && Number.isFinite(b) && b < s;
}
