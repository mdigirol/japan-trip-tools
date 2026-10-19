import { useState } from 'preact/hooks';
import offline from '@data/konbini-near-stops.json';
import { CHAINS, KONBINI_USES } from '../data/konbini';
import { now } from '../lib/now';
import { distM, mapsLink, MAPS_SEARCH_KONBINI, nearMe, type Konbini as K } from '../lib/overpass';
import { todayState } from '../lib/trip';

type Row = K & { dist: number; nearHotel?: boolean };
const data = offline as unknown as { attribution: string; days: Record<string, Row[]> };

const fmtDist = (m: number) => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;

export function Konbini() {
  const st = todayState(now());
  const ymd = st.phase === 'during' ? st.ymd : '2026-11-12';
  const today = data.days[ymd] ?? [];
  const [live, setLive] = useState<Row[] | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const findNearMe = () => {
    setMsg(''); setBusy(true);
    if (!('geolocation' in navigator)) { setBusy(false); setMsg('Location isn’t available. Showing today’s saved list.'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
        const l = await nearMe(me.lat, me.lng);
        setLive(l.map((k) => ({ ...k, dist: distM(me, k) })).sort((a, b) => a.dist - b.dist));
        if (!l.length) setMsg('No stores mapped within 500 m. Try the Maps search.');
      } catch {
        setLive(null);
        setMsg('Couldn’t look up stores (offline?). Showing today’s saved list.');
      } finally { setBusy(false); }
    }, () => { setBusy(false); setMsg('Location was blocked or timed out. Showing today’s saved list.'); }, { timeout: 10000, maximumAge: 60000 });
  };

  const list = live ?? today;
  return (
    <div>
      <h1>Konbini</h1>
      <div class="row">
        <button class="btn primary grow" onClick={findNearMe} disabled={busy}>{busy ? 'Looking…' : '📍 Near me'}</button>
        <a class="btn grow" href={MAPS_SEARCH_KONBINI} target="_blank" rel="noopener">コンビニ in Maps ↗</a>
      </div>
      {msg && <p class="small" role="status" data-testid="konbini-msg">{msg}</p>}
      <h2>{live ? 'Near you' : `Near today’s areas and hotel${st.phase === 'during' ? '' : ' (Nov 12)'}`}</h2>
      {!list.length && <div class="empty">No saved stores for this day.</div>}
      {list.slice(0, 30).map((k) => (
        <a class="card tight row" href={mapsLink(k)} target="_blank" rel="noopener" key={k.lat + ',' + k.lng} style="text-decoration:none;color:inherit">
          <span class="grow"><b>{k.brand}</b>{k.name !== k.brand && <span class="small muted"> · {k.name}</span>}
            <div class="small faint">{k.nearHotel ? 'Near the hotel' : live ? '' : 'Near today’s areas'}{k.hours ? ` · ${k.hours}` : ''}</div></span>
          <span class="small">{fmtDist(k.dist)}</span>
        </a>
      ))}
      <p class="small faint">Store data {data.attribution}. Treat locations as approximate.</p>
      <h2>Which chain for what</h2>
      {CHAINS.map((c) => <div class="card tight" key={c.chain}><b>{c.chain}</b><div class="small">{c.good}</div></div>)}
      <h2>What a konbini is good for</h2>
      <div class="card"><ul class="list-plain small">{KONBINI_USES.map((u) => <li key={u}>{u}</li>)}</ul></div>
    </div>
  );
}
