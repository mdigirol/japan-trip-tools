// Helper for the fix loop (docs/fix-loop.md). Talks to the notes repo with LOOP_GH_TOKEN. Run with `npx tsx`.
//
//   npx tsx scripts/loop/notes.ts list [--urgent] [--issue N]   actionable notes as JSON
//   npx tsx scripts/loop/notes.ts claim N                       mark "Claude is on it" (label + tagged comment)
//   npx tsx scripts/loop/notes.ts reply N --st needs|done|working [--notify] [--shipped] < body.md
//   npx tsx scripts/loop/notes.ts wait-deploy [sha]             wait for the Pages deploy of a commit (default HEAD)
//   npx tsx scripts/loop/notes.ts today                         notes Claude touched in the last 24 h
//   npx tsx scripts/loop/notes.ts notify <priority> <title> < message
//
// Only issues labeled "note" are ever read or written. The same repo holds the purchase-sync issues; this
// script never touches them. --shipped records HEAD's commit time on the reply, so phones running an older
// build show "Update ready".
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NOTE_LABEL, isUrgent, kindLabel, state, tag, thread, type GhComment, type GhIssue, type Thread } from '../../src/lib/noteThread';

const REPO = process.env.NOTES_REPO || 'mdigirol/japan-trip-tools-data';
const APP_REPO = process.env.APP_REPO || 'mdigirol/japan-trip-tools';
const TOKEN = (process.env.LOOP_GH_TOKEN || '').trim();
const APP = 'https://mdigirol.github.io/japan-trip-tools/#/notes';

async function gh<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  if (!TOKEN) throw new Error('LOOP_GH_TOKEN is not set in this environment');
  if (!/^(github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}$/.test(TOKEN)) throw new Error(`LOOP_GH_TOKEN is set but doesn't look like a GitHub token (length ${TOKEN.length}); check for quotes or a stray "LOOP_GH_TOKEN=" in the value`);
  const url = path.startsWith('https://') ? path : `https://api.github.com/repos/${REPO}${path}`;
  const r = await fetch(url, {
    method, headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok && !(method === 'DELETE' && r.status === 404)) throw new Error(`${method} ${path}: GitHub answered ${r.status} ${await r.text()}`);
  return (r.status === 204 ? null : await r.json()) as T;
}
async function all<T>(path: string): Promise<T[]> {
  let out: T[] = [];
  for (let p = 1; ; p++) {
    const r = await gh<T[]>('GET', `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${p}`);
    out = out.concat(r);
    if (r.length < 100) return out;
  }
}

const isNote = (t: Thread) => t.labels.includes(NOTE_LABEL);
const issueOf = (c: GhComment) => Number(String(c.issue_url).split('/').pop());

async function load(n?: number): Promise<Thread[]> {
  if (n) {
    const [i, c] = await Promise.all([gh<GhIssue>('GET', `/issues/${n}`), all<GhComment>(`/issues/${n}/comments`)]);
    const t = thread(i, c);
    return isNote(t) ? [t] : [];
  }
  const [issues, comments] = await Promise.all([
    all<GhIssue>(`/issues?state=open&labels=${NOTE_LABEL}&sort=created&direction=asc`),
    all<GhComment>('/issues/comments?sort=created&direction=asc&since=2026-11-01T00:00:00Z')
  ]);
  return issues.filter((i) => !i.pull_request).map((i) => thread(i, comments.filter((c) => issueOf(c) === i.number)));
}

async function one(n: number): Promise<Thread> {
  const [t] = await load(n);
  if (!t) throw new Error(`#${n} is not a note (no "${NOTE_LABEL}" label); leaving it alone`);
  return t;
}

async function setLabels(n: number, add: string[], remove: string[]) {
  for (const l of remove) await gh('DELETE', `/issues/${n}/labels/${encodeURIComponent(l)}`);
  if (add.length) await gh('POST', `/issues/${n}/labels`, { labels: add });
}

export async function notify(priority: number, title: string, message: string) {
  const { PUSHOVER_TOKEN: token, PUSHOVER_USER: user } = process.env;
  if (!token || !user) { console.error('notify: PUSHOVER_TOKEN/PUSHOVER_USER not set, skipped'); return; }
  const body = new URLSearchParams({ token, user, priority: String(priority), title: title.slice(0, 250), message: message.slice(0, 1000), url: APP, url_title: 'Open notes in the app' });
  const r = await fetch('https://api.pushover.net/1/messages.json', { method: 'POST', body });
  if (!r.ok) console.error('notify: Pushover answered', r.status, await r.text());
}

const label = (t: Thread) => `${kindLabel(t.kind) || 'Note'}: ${t.text.trim().split('\n')[0].slice(0, 40)}`;

async function waitDeploy(sha: string) {
  const deadline = Date.now() + 25 * 60e3;
  let seen = false;
  while (Date.now() < deadline) {
    const r = await gh<{ workflow_runs: { status: string; conclusion: string | null; html_url: string }[] }>('GET',
      `https://api.github.com/repos/${APP_REPO}/actions/workflows/deploy.yml/runs?head_sha=${sha}&per_page=5`);
    const run = r.workflow_runs[0];
    if (run) {
      seen = true;
      if (run.status === 'completed') {
        if (run.conclusion === 'success') { console.log(`Deployed: ${sha.slice(0, 7)} is live`); return; }
        // A newer push cancels the older deploy. Follow the newest deploy of main, if it contains this commit.
        if (run.conclusion === 'cancelled') {
          const latest = await gh<{ workflow_runs: { head_sha: string }[] }>('GET',
            `https://api.github.com/repos/${APP_REPO}/actions/workflows/deploy.yml/runs?branch=main&event=push&per_page=1`);
          const next = latest.workflow_runs[0]?.head_sha;
          if (next && next !== sha) {
            execSync('git fetch -q origin main');
            try { execSync(`git merge-base --is-ancestor ${sha} ${next}`); } catch { next && console.log(`!! Deploy cancelled for ${sha.slice(0, 7)}, and the newest deploy doesn't contain it`); process.exit(1); }
            console.log(`Superseded by ${next.slice(0, 7)}; following that deploy`);
            return waitDeploy(next);
          }
        }
        console.log(`!! Deploy ${run.conclusion} for ${sha.slice(0, 7)}: ${run.html_url}`); process.exit(1);
      }
    }
    await new Promise((ok) => setTimeout(ok, 20_000));
  }
  console.log(`!! ${seen ? 'Deploy still running' : 'No deploy started'} for ${sha.slice(0, 7)} after 25 minutes`);
  process.exit(1);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flag = (f: string) => rest.includes(f);
  const opt = (f: string) => { const i = rest.indexOf(f); return i >= 0 ? rest[i + 1] : undefined; };
  if (cmd === 'list') {
    const n = opt('--issue');
    const out = (await load(n ? +n : undefined)).map((t) => ({ ...t, ...state(t) }))
      .filter((t) => t.actionable && (!flag('--urgent') || isUrgent(t.kind)));
    console.log(JSON.stringify(out, null, 1));
  } else if (cmd === 'claim') {
    const n = +rest[0], t = await one(n);
    await setLabels(n, ['s:working'].concat(/^katherine$/i.test(t.by) ? ['from:katherine'] : []), ['s:needs-matt', 's:approved']);
    await gh('POST', `/issues/${n}/comments`, { body: tag({ by: 'Claude', st: 'working' }) + 'Claude is on it.' });
  } else if (cmd === 'reply') {
    const n = +rest[0], st = opt('--st');
    if (st !== 'needs' && st !== 'done' && st !== 'working') throw new Error('--st must be needs, done or working');
    const text = readFileSync(0, 'utf8').trim();
    if (!text) throw new Error('empty reply on stdin');
    const t = await one(n);
    const shipped = flag('--shipped') ? execSync('git log -1 --format=%cI HEAD').toString().trim() : undefined;
    await gh('POST', `/issues/${n}/comments`, { body: tag({ by: 'Claude', st, ...(shipped ? { shipped } : {}) }) + text });
    if (st === 'needs') await setLabels(n, ['s:needs-matt'], ['s:working']);
    if (st === 'done') { await setLabels(n, [], ['s:working', 's:needs-matt']); await gh('PATCH', `/issues/${n}`, { state: 'closed' }); }
    if (flag('--notify') && st !== 'working') {
      const first = text.split('\n').find((l) => l.trim()) || '';
      await notify(st === 'needs' ? 1 : 0, `${st === 'needs' ? 'Needs you' : 'Done'} · app #${n} ${label(t)}`, first);
    }
  } else if (cmd === 'wait-deploy') {
    await waitDeploy(rest[0] || execSync('git rev-parse HEAD').toString().trim());
  } else if (cmd === 'today') {
    const since = new Date(Date.now() - 24 * 3600e3).toISOString();
    const [issues, comments] = await Promise.all([all<GhIssue>(`/issues?state=all&labels=${NOTE_LABEL}&since=${since}`), all<GhComment>(`/issues/comments?since=${since}`)]);
    const ts = issues.map((i) => thread(i, comments.filter((c) => issueOf(c) === i.number))).filter((t) => t.replies.some((r) => r.by === 'Claude'));
    console.log(JSON.stringify(ts.map((t) => ({ n: t.n, label: label(t), ...state(t) })), null, 1));
  } else if (cmd === 'notify') {
    await notify(+rest[0], rest[1], readFileSync(0, 'utf8').trim());
  } else {
    console.error('usage: notes.ts list [--urgent] [--issue N] | claim N | reply N --st needs|done|working [--notify] [--shipped] | wait-deploy [sha] | today | notify <priority> <title>');
    process.exit(2);
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
