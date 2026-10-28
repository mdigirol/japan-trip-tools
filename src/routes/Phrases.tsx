import { useMemo, useRef, useState } from 'preact/hooks';
import type { Phrase } from '../data/schema';
import { phrases, PHRASE_TABS, SLOT_PICKS } from '../data/phrases';
import { Dot } from '../components/Dot';
import { now } from '../lib/now';
import { href, type Route } from '../lib/router';
import { matchesAll } from '../lib/search';
import { getSettings, updateSettings, useSettings } from '../lib/settings';
import { showCard } from '../lib/showcard';
import { speak } from '../lib/speech';
import { todayState, trip } from '../lib/trip';

interface Fill { ja: string; romaji: string; en: string }

export function matchPhrase(p: Phrase, q: string): boolean {
  return matchesAll([p.en, p.romaji, p.ja, p.note ?? ''], q);
}

export function fillText(text: string, slots: string[] | undefined, fill: Fill | undefined, field: keyof Fill): string {
  if (!slots || !fill) return text;
  let out = text;
  for (const s of slots) out = out.split(`[${s}]`).join(fill[field] || `[${s}]`);
  return out;
}

export function Phrases({ route }: { route: Route }) {
  const s = useSettings();
  const tab = route.params.get('tab') || (s.favorites.length ? 'basics' : 'basics');
  const [q, setQ] = useState('');
  const day = todayState(now()).day;

  const list = useMemo(() => {
    const venues = new Set(day?.venues ?? []), places = new Set(day?.places ?? []);
    const today = (p: Phrase) => p.venues.some((v) => venues.has(v)) || (p.places ?? []).some((x) => places.has(x));
    let l = q ? phrases.filter((p) => matchPhrase(p, q))
      : tab === 'starred' ? phrases.filter((p) => s.favorites.includes(p.id))
        : phrases.filter((p) => p.tab === tab);
    l = [...l].sort((a, b) => (+today(b) - +today(a)) || (+b.mvp - +a.mvp));
    return l;
  }, [q, tab, s.favorites, day]);

  return (
    <div>
      <h1>Phrases</h1>
      <input type="search" placeholder="Search English, romaji or Japanese" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Search phrases" />
      {!q && (
        <div class="chips" role="tablist" aria-label="Situations" style="margin-top:10px">
          {s.favorites.length > 0 && <a class={'chip' + (tab === 'starred' ? ' on' : '')} href={href('phrases', { tab: 'starred' })} role="tab" aria-selected={tab === 'starred'}>★ Starred</a>}
          {PHRASE_TABS.map((t) => (
            <a key={t.id} class={'chip' + (tab === t.id ? ' on' : '')} href={href('phrases', { tab: t.id })} role="tab" aria-selected={tab === t.id}>{t.label}</a>
          ))}
        </div>
      )}
      <p class="small faint" style="margin:4px 0 10px">Tap to hear. Hold, or tap ⤢, to show it full screen.</p>
      {list.length === 0 && <div class="empty">No phrases match “{q}”.</div>}
      {list.map((p) => <PhraseCard p={p} key={p.id} />)}
      {tab === 'pharmacy' && !q && <p class="small"><a href={href('emergency')}>Pharmacy brands and emergency numbers →</a></p>}
    </div>
  );
}

function slotPicks(slot: string): Fill[] {
  if (slot === 'X' || slot === 'hotel') {
    const hotels = trip.stays.map((st) => ({ en: st.name, ja: st.nameJa, romaji: st.name }));
    return [...hotels, ...(slot === 'X' ? SLOT_PICKS.X : [])];
  }
  return SLOT_PICKS[slot] ?? [];
}

export function PhraseCard({ p }: { p: Phrase }) {
  const s = useSettings();
  const [fill, setFill] = useState<Fill | undefined>();
  const [typed, setTyped] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const fav = s.favorites.includes(p.id);

  const ja = fillText(p.ja, p.slots, fill, 'ja');
  const ro = fillText(p.romaji, p.slots, fill, 'romaji');
  const en = fillText(p.en, p.slots, fill, 'en');

  const full = () => showCard({ ja, en, romaji: ro });
  const down = () => { longPressed.current = false; timer.current = window.setTimeout(() => { longPressed.current = true; full(); }, 550); };
  const up = () => window.clearTimeout(timer.current);
  const tap = () => { if (longPressed.current) { longPressed.current = false; return; } speak(ja, p.audio); };
  const toggleFav = (e: Event) => {
    e.stopPropagation();
    const f = getSettings().favorites;
    updateSettings({ favorites: fav ? f.filter((x) => x !== p.id) : [...f, p.id] });
  };

  return (
    <div class="card phrase" data-testid={`phrase-${p.id}`}>
      <div class="body" role="button" tabIndex={0} aria-label={`Hear: ${en}`}
        onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onClick={tap}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speak(ja, p.audio); } }}
        onContextMenu={(e) => e.preventDefault()}>
        <div class="en">{en}{p.mvp && <span class="sr"> (essential)</span>}</div>
        <div class="ja" lang="ja">{ja}<Dot reviewed={p.reviewed} /></div>
        <div class="ro">{ro}</div>
        {p.note && <div class="note">{p.note}</div>}
      </div>
      <div class="actions">
        <button class={'icon-btn' + (fav ? ' on' : '')} onClick={toggleFav} aria-pressed={fav} aria-label={fav ? 'Unstar' : 'Star'}>{fav ? '★' : '☆'}</button>
        <button class="icon-btn" onClick={full} aria-label="Show full screen">⤢</button>
      </div>
      {p.slots && p.slots.map((slot) => (
        <div class="slot-row" key={slot}>
          <div class="chips">
            {slotPicks(slot).map((o) => (
              <button key={o.ja} class={'chip' + (fill?.ja === o.ja ? ' on' : '')} onClick={() => { setFill(o); setTyped(''); }}>{o.en}</button>
            ))}
          </div>
          <input type="text" placeholder={slot === 'name' ? 'Type the name' : slot === 'action' ? 'Or type it (Japanese or romaji)' : 'Or type a place (Japanese or romaji)'} value={typed}
            onInput={(e) => { const v = e.currentTarget.value; setTyped(v); setFill(v ? { ja: v, romaji: v, en: v } : undefined); }}
            aria-label={`Fill in ${slot}`} />
        </div>
      ))}
    </div>
  );
}
