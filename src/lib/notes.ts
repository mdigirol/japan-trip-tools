// PRIVATE APP ONLY (never in japan-trip-tools-public). Notes for Claude: "Report a problem" (src/routes/Notes.tsx).
//
// Each note becomes an issue in the private data repo, sent straight from the phone with its sync token
// (Issues read/write on that repo). No relay, nothing public. Claude works the notes (docs/fix-loop.md):
// urgent kinds right away from a GitHub Action, the rest from an hourly routine. Replies come back as
// issue comments, and the app shows each thread's status from their hidden tags (src/lib/noteThread.ts).
//
// Notes written offline wait in localStorage and go out once the phone is online. The last list of threads
// is kept in IndexedDB so it shows offline.
import { useEffect, useState } from 'preact/hooks';
import { cacheGet, cachePut } from './db';
import { NOTE_LABEL, noteBody, noteLabels, noteTitle, tag, thread, isNoteKind, type GhComment, type GhIssue, type NoteKind, type Thread } from './noteThread';
import { uuid } from './purchases';
import { getSettings } from './settings';
import { DATA_REPO } from './sync';

export const NOTES_REPO: string = import.meta.env.VITE_NOTES_REPO || DATA_REPO;
const API = 'https://api.github.com';
const DRAFT_KEY = 'jtc-notes-draft-v1';
const OUTBOX_KEY = 'jtc-notes-outbox-v1';
const CACHE_KEY = 'notes:threads';
const SINCE = '2026-11-01T00:00:00Z';

export interface Draft { kind: NoteKind; message: string }
export interface Outgoing { id: string; kind: NoteKind; message: string; screen: string; by: string; at: string }

export interface NotesState {
  threads: Thread[];
  outbox: Outgoing[];
  at?: number;              // when the list was last fetched
  busy: boolean;
  error: string;
}

// ---- localStorage: the unsent draft and the outbox (try/catch, as everywhere else) ----
const validDraft = (d: unknown): d is Draft => !!d && isNoteKind((d as Draft).kind) && typeof (d as Draft).message === 'string';
const validOut = (d: unknown): d is Outgoing => validDraft(d) && typeof (d as Outgoing).id === 'string';

export function loadDraft(): Draft {
  try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); if (validDraft(d)) return d; } catch { /* storage blocked */ }
  return { kind: 'broken', message: '' };
}
export function saveDraft(d: Draft) {
  try { if (d.message) localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); else localStorage.removeItem(DRAFT_KEY); } catch { /* storage blocked */ }
}
function loadOutbox(): Outgoing[] {
  try { const l = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); if (Array.isArray(l)) return l.filter(validOut); } catch { /* storage blocked */ }
  return [];
}
function saveOutbox(l: Outgoing[]) {
  try { if (l.length) localStorage.setItem(OUTBOX_KEY, JSON.stringify(l)); else localStorage.removeItem(OUTBOX_KEY); } catch { /* storage blocked */ }
}

// ---- store ----
let st: NotesState = { threads: [], outbox: loadOutbox(), busy: false, error: '' };
const subs = new Set<(s: NotesState) => void>();
const set = (p: Partial<NotesState>) => { st = { ...st, ...p }; subs.forEach((f) => f(st)); };
let loaded = false;

export function useNotes(): NotesState {
  const [s, setS] = useState(st);
  useEffect(() => {
    subs.add(setS);
    if (!loaded) {
      loaded = true;
      cacheGet<Thread[]>(CACHE_KEY).then((e) => { if (e && !st.at) set({ threads: e.value, at: e.at }); }).catch(() => {});
    }
    return () => { subs.delete(setS); };
  }, []);
  return s;
}

export const notesEnabled = () => !!NOTES_REPO;

// ---- GitHub ----
async function gh<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(API + path, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) }
  });
  if (!r.ok) throw Object.assign(new Error(`GitHub ${r.status}`), { status: r.status });
  return r.json() as Promise<T>;
}

async function all<T>(path: string, token: string): Promise<T[]> {
  let out: T[] = [];
  for (let p = 1; ; p++) {
    const page = await gh<T[]>(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${p}`, token);
    out = out.concat(page);
    if (page.length < 100) return out;
  }
}

function message(e: unknown): string {
  const s = (e as { status?: number }).status;
  if (s === 401) return 'The sync token was rejected. Check it in Settings.';
  if (s === 403 || s === 404) return 'The sync token can’t reach the notes repo. Check it in Settings.';
  return 'Couldn’t reach GitHub. Your notes are saved; try again shortly.';
}

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

// Add a note to the outbox and try to send it.
export function queueNote(kind: NoteKind, text: string, screen: string) {
  const o: Outgoing = { id: uuid(), kind, message: text.trim(), screen, by: getSettings().who || '', at: new Date().toISOString() };
  const outbox = [...st.outbox, o];
  saveOutbox(outbox);
  set({ outbox });
  // A refresh already under way may have read the outbox before this note; send it right after.
  return (running ?? Promise.resolve()).then(() => refresh());
}

async function send(o: Outgoing, token: string) {
  const meta = { id: o.id, by: o.by || undefined, ty: o.kind, scr: o.screen || undefined, v: __APP_VERSION__, b: __BUILT_AT__ };
  await gh(`/repos/${NOTES_REPO}/issues`, token, {
    method: 'POST', body: JSON.stringify({ title: noteTitle(o.message), body: noteBody(meta, o.message), labels: noteLabels(o.kind) })
  });
}

let running: Promise<void> | null = null;

// Fetch the threads, then send whatever is in the outbox that isn't already on GitHub, then fetch again.
export function refresh(): Promise<void> {
  const token = getSettings().syncToken;
  if (!NOTES_REPO || !token || !online()) return Promise.resolve();
  if (running) return running;
  running = (async () => {
    set({ busy: true, error: '' });
    try {
      let threads = await fetchThreads(token);
      const sent = new Set(threads.map((t) => t.id).filter(Boolean));
      // Read st.outbox fresh each time: a note can be added while this runs.
      const drop = (id?: string) => {
        const outbox = st.outbox.filter((o) => !sent.has(o.id) && o.id !== id);
        saveOutbox(outbox);
        set({ outbox });
      };
      drop();
      if (st.outbox.length) {
        for (const o of [...st.outbox]) { await send(o, token); drop(o.id); }
        threads = await fetchThreads(token);
      }
      await cachePut(CACHE_KEY, threads).catch(() => {});
      set({ threads, at: Date.now(), busy: false });
    } catch (e) {
      set({ busy: false, error: message(e) });
    } finally { running = null; }
  })();
  return running;
}

async function fetchThreads(token: string): Promise<Thread[]> {
  const [issues, comments] = await Promise.all([
    all<GhIssue>(`/repos/${NOTES_REPO}/issues?state=all&labels=${NOTE_LABEL}&sort=created&direction=desc`, token),
    all<GhComment>(`/repos/${NOTES_REPO}/issues/comments?sort=created&direction=asc&since=${SINCE}`, token)
  ]);
  return issues.filter((i) => !i.pull_request).map((i) =>
    thread(i, comments.filter((c) => Number(String(c.issue_url).split('/').pop()) === i.number)));
}

// A reply on a thread, or Matt's approval of Claude's plan. Needs a connection.
export async function postReply(n: number, text: string, approve = false): Promise<boolean> {
  const token = getSettings().syncToken;
  const by = getSettings().who || '';
  try {
    await gh(`/repos/${NOTES_REPO}/issues/${n}/comments`, token, {
      method: 'POST', body: JSON.stringify({ body: tag({ by: by || undefined, ...(approve ? { ok: 1 as const } : {}) }) + (text.trim() || 'Approved.') })
    });
    await refresh();
    return true;
  } catch (e) {
    set({ error: message(e) });
    return false;
  }
}

// On opening Notes, on reconnect, and every minute while Notes is open.
export function useNotesRefresh() {
  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener('online', on);
    const t = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);
    return () => { window.removeEventListener('online', on); clearInterval(t); };
  }, []);
}
