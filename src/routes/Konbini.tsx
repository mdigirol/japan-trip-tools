import { useState } from 'preact/hooks';
import offline from '@data/konbini-near-stops.json';
import { CHAINS, KONBINI_USES } from '../data/konbini';
import { DRINK_KIND_LABELS, DRINK_PURPOSE_LABELS, DRINK_TIPS, konbiniDrinks } from '../data/konbiniDrinks';
import { DRINK_PURPOSES, type KonbiniDrink } from '../data/schema';
import { Dot } from '../components/Dot';
import { drinkGroups, type DrinkPurpose, type DrinkSort } from '../lib/drinks';
import { now } from '../lib/now';
import { href, type Route } from '../lib/router';
import { distM, mapsLink, MAPS_SEARCH_KONBINI, nearMe, type Konbini as K } from '../lib/overpass';
import { todayState } from '../lib/trip';

type Row = K & { dist: number; nearHotel?: boolean };
const data = offline as unknown as { attribution: string; days: Record<string, Row[]> };

const fmtDist = (m: number) => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;

const TABS = [{ id: 'stores', label: 'Stores' }, { id: 'drinks', label: 'Drinks' }] as const;
export const DRINKS_NOTE = '“Sold for” is how each drink is marketed. This list is for orientation, not medical advice.';

export function Konbini({ route }: { route: Route }) {
  const tab = route.params.get('tab') === 'drinks' ? 'drinks' : 'stores';
  return (
    <div>
      <h1>Konbini</h1>
      <div class="chips" role="tablist" aria-label="Konbini" style="margin-top:10px">
        {TABS.map((t) => (
          <a key={t.id} class={'chip' + (tab === t.id ? ' on' : '')} href={href('konbini', { tab: t.id })} role="tab" aria-selected={tab === t.id}>{t.label}</a>
        ))}
      </div>
      {tab === 'drinks' ? <Drinks /> : <Stores />}
    </div>
  );
}

function Stores() {
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

function Drinks() {
  const [sort, setSort] = useState<DrinkSort>('az');
  const [only, setOnly] = useState<DrinkPurpose | undefined>();
  const groups = drinkGroups(konbiniDrinks, sort, only);
  return (
    <div>
      <p class="small faint" style="margin-top:0">{DRINKS_NOTE}</p>
      <details class="card tight drink-tips" data-testid="konbini-drink-tips">
        <summary>Buying tips</summary>
        <ul class="list-plain small">
          {DRINK_TIPS.map((t) => (
            <li key={t.text}>{t.text}{t.sourceUrl && <> <a href={t.sourceUrl} target="_blank" rel="noopener">Source ↗</a></>}</li>
          ))}
        </ul>
      </details>
      <div class="seg" role="group" aria-label="Sort drinks">
        <button aria-pressed={sort === 'az'} onClick={() => setSort('az')}>A–Z</button>
        <button aria-pressed={sort === 'type'} onClick={() => setSort('type')}>By type</button>
        <button aria-pressed={sort === 'use'} onClick={() => setSort('use')}>By use</button>
      </div>
      <div class="chips drink-filter" role="group" aria-label="Sold for" style="margin-top:10px">
        <button class={'chip' + (!only ? ' on' : '')} aria-pressed={!only} onClick={() => setOnly(undefined)}>All</button>
        {DRINK_PURPOSES.filter((p) => konbiniDrinks.some((d) => d.purposes.includes(p))).map((p) => (
          <button key={p} class={'chip' + (only === p ? ' on' : '')} aria-pressed={only === p} onClick={() => setOnly(p)}>{DRINK_PURPOSE_LABELS[p]}</button>
        ))}
      </div>
      {!groups.length && <div class="empty">No drinks for this use.</div>}
      {groups.map((g) => (
        <section key={g.kind ?? g.purpose ?? 'all'}>
          {g.kind && <h2>{DRINK_KIND_LABELS[g.kind]}</h2>}
          {g.purpose && <h2>{DRINK_PURPOSE_LABELS[g.purpose]}</h2>}
          {g.drinks.map((d) => <DrinkCard d={d} key={d.id} />)}
        </section>
      ))}
    </div>
  );
}

function DrinkCard({ d }: { d: KonbiniDrink }) {
  return (
    <div class="card drink" data-testid={`drink-${d.id}`}>
      <b>{d.brand}</b>
      <div class="ja" lang="ja">{d.ja}<Dot reviewed={d.reviewed} /></div>
      <div class="ro">{d.romaji}</div>
      <div class="small">{d.look}</div>
      <div class="small">{d.note}</div>
      {d.purposes.length > 0 && <div class="small muted">Sold for: {d.purposes.map((p) => DRINK_PURPOSE_LABELS[p]).join(' · ')}</div>}
      {(d.caffeine || d.abv !== undefined) && (
        <div class="pills" style="margin:6px 0 0">
          {d.abv !== undefined && <span class="pill">Contains alcohol · {d.abv}%</span>}
          {d.caffeine && <span class="pill">Has caffeine</span>}
        </div>
      )}
      <div class="small" style="margin-top:6px"><a href={d.productUrl} target="_blank" rel="noopener">Photo on the maker’s site ↗</a> <span class="faint">· Needs internet</span></div>
    </div>
  );
}
