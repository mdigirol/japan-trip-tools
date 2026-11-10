// PRIVATE APP ONLY (never in japan-trip-tools-public). "Report a problem": notes for Claude, and their threads.
// How notes travel: src/lib/notes.ts. What Claude does with them: docs/fix-loop.md.
import { useState } from 'preact/hooks';
import { MODULES } from '../lib/modules';
import { stamp } from '../lib/now';
import { NOTE_KINDS, NOTE_MAX, STATUS_LABEL, isMatt, isUrgent, kindLabel, state, updateReady, type NoteStatus, type Thread } from '../lib/noteThread';
import { NOTES_REPO, loadDraft, postReply, queueNote, saveDraft, useNotes, useNotesRefresh, type Draft, type Outgoing } from '../lib/notes';
import { useOnline } from '../lib/online';
import { href, type Route } from '../lib/router';
import { useSettings } from '../lib/settings';

const SCREENS: [string, string][] = [['', 'Whole app'], ['today', 'Today'],
  ...MODULES.filter((m) => m.ready && m.path !== 'notes').map((m): [string, string] => [m.path, m.label])];
const screenLabel = (s: string) => SCREENS.find(([p]) => p === s)?.[1] ?? s;

const BOLT = <svg class="bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>;

export function Notes({ route }: { route: Route }) {
  const s = useSettings();
  const notes = useNotes();
  const online = useOnline();
  useNotesRefresh();
  const from = route.params.get('from') ?? '';
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [screen, setScreen] = useState(SCREENS.some(([p]) => p === from) ? from : '');
  const [sentMsg, setSentMsg] = useState('');
  const edit = (p: Partial<Draft>) => { const d = { ...draft, ...p }; setDraft(d); saveDraft(d); setSentMsg(''); };
  const kind = NOTE_KINDS.find((k) => k.id === draft.kind)!;

  if (!NOTES_REPO) {
    return <div><h1>Report a problem</h1><div class="card"><p>Notes are off in this build.</p></div></div>;
  }

  const send = () => {
    queueNote(draft.kind, draft.message, screen);
    edit({ message: '' });
    setSentMsg(!s.syncToken ? 'Saved. Add the sync token in Settings to send it.'
      : online ? 'Sent to Claude.' : 'Saved. It goes out when you’re back online with the app open.');
  };

  const threads = [...notes.threads].sort((a, b) => Number(!a.open) - Number(!b.open) || b.at.localeCompare(a.at));
  return (
    <div>
      <h1>Report a problem</h1>
      <div class="card notes-form">
        <div class="small muted">What kind?</div>
        <div class="chips wrap" role="group" aria-label="Kind of note">
          {NOTE_KINDS.map((k) => (
            <button key={k.id} class={`chip${k.urgent ? ' urg' : ''}`} aria-pressed={draft.kind === k.id} onClick={() => edit({ kind: k.id })}>
              {k.urgent && BOLT}{k.label}
            </button>
          ))}
        </div>
        <p class="small muted" style="margin:2px 0 0">{kind.hint}. {kind.urgent ? 'Claude starts on it right away.' : 'Claude picks it up within the hour.'}</p>
        <label class="field"><span>About</span>
          <select value={screen} onChange={(e) => setScreen(e.currentTarget.value)}>
            {SCREENS.map(([p, l]) => <option key={p} value={p}>{l}</option>)}
          </select></label>
        <label class="field"><span>What happened?</span>
          <textarea rows={4} maxLength={NOTE_MAX} value={draft.message} placeholder="One thing per note"
            onInput={(e) => edit({ message: e.currentTarget.value })} /></label>
        {!s.who && <p class="small"><a href={href('settings')}>Add your name in Settings</a> so Claude knows who wrote it.</p>}
        {!s.syncToken && <p class="small"><a href={href('settings')}>Add the sync token in Settings</a> to send notes. They wait here until then.</p>}
        <button class="btn primary block" disabled={!draft.message.trim()} onClick={send}>Send to Claude</button>
        {sentMsg && <p class="small muted" role="status">{sentMsg}</p>}
        <p class="small faint">Goes to our private notes repo. Matt gets a notification.</p>
      </div>

      <h2>Notes</h2>
      <p class="small muted" role="status">
        {notes.error ? notes.error
          : !online ? `Offline.${notes.at ? ` Last checked ${stamp(notes.at, s.timeZone)}.` : ''}`
          : notes.busy ? 'Checking…'
          : notes.at ? `Checked ${stamp(notes.at, s.timeZone)}.` : ''}
      </p>
      {!notes.outbox.length && !threads.length && <p class="small faint">No notes yet.</p>}
      {notes.outbox.map((o) => <Unsent key={o.id} o={o} zone={s.timeZone} />)}
      {threads.map((t) => <ThreadCard key={t.n} t={t} who={s.who} zone={s.timeZone} online={online} />)}
    </div>
  );
}

function Pills({ kind, status }: { kind: string; status: NoteStatus }) {
  return (
    <span class="note-pills">
      {kind && <span class={`npill kind${isUrgent(kind) ? ' urg' : ''}`}>{isUrgent(kind) && BOLT}{kindLabel(kind)}</span>}
      <span class={`npill st-${status}`}>{STATUS_LABEL[status]}</span>
    </span>
  );
}

const firstLine = (t: string) => t.trim().split('\n')[0];
const meta = (by: string, at: string, screen: string, zone: ReturnType<typeof useSettings>['timeZone']) =>
  [by, stamp(at, zone), screen ? screenLabel(screen) : ''].filter(Boolean).join(' · ');

function Unsent({ o, zone }: { o: Outgoing; zone: ReturnType<typeof useSettings>['timeZone'] }) {
  return (
    <div class="card note" data-testid="note-unsent">
      <Pills kind={o.kind} status="unsent" />
      <div class="note-text">{firstLine(o.message)}</div>
      <div class="small faint">{meta(o.by, o.at, o.screen, zone)}</div>
    </div>
  );
}

function ThreadCard({ t, who, zone, online }: { t: Thread; who: string; zone: ReturnType<typeof useSettings>['timeZone']; online: boolean }) {
  const { status, shipped } = state(t);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const last = [...t.replies].reverse().find((r) => r.by === 'Claude' && r.text.trim() && !(r.meta.st === 'working' && r.text.trim() === 'Claude is on it.'));
  const go = async (approve: boolean) => {
    setBusy(true);
    if (await postReply(t.n, text, approve)) setText('');
    setBusy(false);
  };
  const canApprove = status === 'needs' && isMatt(who);
  return (
    <div class="card note" data-testid="note">
      <Pills kind={t.kind} status={status} />
      <div class="note-text">{firstLine(t.text)}</div>
      <div class="small faint">{meta(t.by, t.at, t.screen, zone)}</div>
      {last && <p class="note-reply"><b>Claude:</b> {firstLine(last.text)}</p>}
      {status === 'done' && updateReady(shipped, __BUILT_AT__) && <p class="small note-update">Update ready: close and reopen the app.</p>}
      <details>
        <summary>{t.replies.length ? `Thread (${t.replies.length})` : 'Details'}</summary>
        <p class="note-full">{t.text}</p>
        {t.replies.map((r, i) => (
          <div class="note-msg" key={i}>
            <div class="small faint">{r.by || 'Someone'} · {stamp(r.at, zone)}{r.meta.ok ? ' · approved' : ''}</div>
            <div class="note-full">{r.text}</div>
          </div>
        ))}
        {t.open && <>
          <label class="field"><span>{canApprove ? 'Reply or approve' : 'Reply'}</span>
            <textarea rows={2} maxLength={NOTE_MAX} value={text} onInput={(e) => setText(e.currentTarget.value)} /></label>
          <div class="row" style="gap:8px">
            {canApprove && <button class="btn primary grow" disabled={!online || busy} onClick={() => go(true)}>Approve</button>}
            <button class="btn grow" disabled={!online || busy || !text.trim()} onClick={() => go(false)}>Reply</button>
          </div>
          {!online && <p class="small faint">Replies need a connection.</p>}
        </>}
      </details>
    </div>
  );
}
