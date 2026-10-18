import { useEffect, useState } from 'preact/hooks';
import { updateSettings, useSettings, applyTextSize, type Settings as S } from '../lib/settings';
import { stamp } from '../lib/now';
import { trip } from '../lib/trip';
import { SyncStatus } from '../components/SyncStatus';


function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (l: string[]) => void; placeholder: string }) {
  const [v, setV] = useState('');
  const add = () => { const t = v.trim(); if (t && !items.includes(t)) onChange([...items, t]); setV(''); };
  return (
    <div class="field" style="margin:12px 0">
      <span class="small muted">{label}</span>
      <div class="chips wrap" style="margin:6px 0">
        {items.map((x) => <button class="chip" key={x} onClick={() => onChange(items.filter((y) => y !== x))} aria-label={`Remove ${x}`}>{x} ✕</button>)}
        {!items.length && <span class="small faint">None yet.</span>}
      </div>
      <div class="row">
        <input type="text" value={v} placeholder={placeholder} onInput={(e) => setV(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label={label} />
        <button class="btn" onClick={add}>Add</button>
      </div>
    </div>
  );
}

function useOfflineReady() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) { setReady(false); return; }
    navigator.serviceWorker.getRegistration().then(async (r) => {
      if (!r?.active) return setReady(false);
      try { const keys = await caches.keys(); setReady(keys.some((k) => k.includes('precache'))); } catch { setReady(!!r.active); }
    }).catch(() => setReady(false));
  }, []);
  return ready;
}

export function Settings() {
  const s = useSettings();
  const ready = useOfflineReady();
  const set = (p: Partial<S>) => updateSettings(p);
  const [showToken, setShowToken] = useState(false);
  return (
    <div>
      <h1>Settings</h1>
      <div class="card">
        <label class="field"><span>Who is using this phone?</span>
          <input type="text" value={s.who} placeholder="Your first name" onInput={(e) => set({ who: e.currentTarget.value.trim() })} /></label>
        <div class="field"><span class="small muted">Temperature first</span>
          <div class="seg" role="group" aria-label="Temperature first">
            <button aria-pressed={s.tempFirst === 'F'} onClick={() => set({ tempFirst: 'F' })}>°F</button>
            <button aria-pressed={s.tempFirst === 'C'} onClick={() => set({ tempFirst: 'C' })}>°C</button>
          </div></div>
        <div class="field"><span class="small muted">Text size</span>
          <div class="seg" role="group" aria-label="Text size">
            {(['normal', 'large', 'xl'] as const).map((t) => (
              <button key={t} aria-pressed={s.textSize === t} onClick={() => { set({ textSize: t }); applyTextSize(t); }}>{t === 'normal' ? 'A' : t === 'large' ? 'A+' : 'A++'}</button>
            ))}
          </div></div>
      </div>

      <h2>Souvenirs</h2>
      <div class="card">
        <ListEditor label="Souvenir recipients" items={s.recipients} onChange={(l) => set({ recipients: l })} placeholder="Add a name" />
        <ListEditor label="Bags (for the claim log)" items={s.bags} onChange={(l) => set({ bags: l })} placeholder="Add a bag" />
        <p class="small faint">Names stay on this phone and in the private sync repo. They’re never in the public site.</p>
      </div>

      <h2>Sync between phones</h2>
      <div class="card">
        <SyncStatus />
        <label class="field"><span>Sync token (GitHub, Issues on the data repo only)</span>
          <div class="row">
            <input {...{ type: showToken ? 'text' : 'password' } as { type: 'text' }} value={s.syncToken} autoComplete="off" spellcheck={false} placeholder="github_pat_…"
              onInput={(e) => set({ syncToken: e.currentTarget.value.trim() })} />
            <button class="btn" onClick={() => setShowToken(!showToken)}>{showToken ? 'Hide' : 'Show'}</button>
          </div></label>
        <p class="small faint">Stored only on this phone. Paste it once. Only souvenirs and claim-log items sync; photos stay on the phone that took them.</p>
      </div>

      <h2>Offline</h2>
      <div class="card" data-testid="offline-ready">
        {ready ? <b>Ready for offline ✓</b> : ready === false ? <b>Not ready for offline yet. Open once while online.</b> : '…'}
        <div class="small muted">Version {__APP_VERSION__} · built {__BUILT_AT__ === 'test' ? 'test' : stamp(__BUILT_AT__)} · trip data {stamp(trip.generatedAt)}</div>
      </div>
    </div>
  );
}
