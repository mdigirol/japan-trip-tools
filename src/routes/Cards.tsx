import { useState } from 'preact/hooks';
import type { ShowCard } from '../data/schema';
import { LOST_ITEMS, showCards } from '../data/showCards';
import { Dot } from '../components/Dot';
import { hotelCard } from '../lib/hotelCard';
import { now } from '../lib/now';
import { showCard, telDisplay } from '../lib/showcard';
import { todayState, trip } from '../lib/trip';

const KINDS: { kind: ShowCard['kind']; label: string }[] = [
  { kind: 'dining', label: 'Dining' }, { kind: 'bath', label: 'Bath' }, { kind: 'other', label: 'Other' }
];

const fmtRange = (from: string, to: string) => `Nov ${+from.slice(8)}–${+to.slice(8)}`;

export function Cards() {
  const tonight = todayState(now()).primary?.id;
  return (
    <div>
      <h1>Show cards</h1>
      <p class="small muted">Tap a card to show it full screen. The screen stays awake while it’s open.</p>
      <h2>Taxi: hotels</h2>
      {trip.stays.map((s) => (
        <button class={'card card-btn hotel-compact' + (s.id === tonight ? '' : ' secondary')} key={s.id} onClick={() => showCard(hotelCard(s))} data-testid={`card-hotel-${s.id}`}>
          <div class="small muted">{fmtRange(s.from, s.to)}{s.id === tonight ? ' · tonight' : ''}</div>
          <div class="ja" lang="ja">{s.nameJa}</div>
          <div class="small" lang="ja">{s.addrJa}</div>
          <div class="small faint">{s.name} · ☎ {telDisplay(s.tel)}</div>
        </button>
      ))}
      {KINDS.map(({ kind, label }) => (
        <section key={kind}>
          <h2>{label}</h2>
          {showCards.filter((c) => c.kind === kind).map((c) => <CardRow c={c} key={c.id} />)}
        </section>
      ))}
    </div>
  );
}

function CardRow({ c }: { c: ShowCard }) {
  const [pick, setPick] = useState<{ ja: string; en: string } | null>(null);
  const slot = c.slots?.[0];
  const options = slot === 'hotel' ? trip.stays.map((s) => ({ ja: s.nameJa, en: s.name })) : slot === 'X' ? LOST_ITEMS : [];
  const ja = slot ? c.ja.replace(`[${slot}]`, pick?.ja ?? `[${slot}]`) : c.ja;
  const en = slot ? c.en.replace(`[${slot}]`, pick?.en ?? `[${slot}]`) : c.en;
  return (
    <div class="card">
      <button class="card-btn" style="background:none;border:0;padding:0" onClick={() => showCard({ ja, en })} data-testid={`card-${c.id}`}>
        <h3>{c.title}</h3>
        <div lang="ja" style="font-size:1.15em">{ja}<Dot reviewed={c.reviewed} /></div>
        <div class="small muted">{en}</div>
      </button>
      {slot && (
        <div class="chips" style="margin-top:8px">
          {options.map((o) => <button class={'chip' + (pick?.ja === o.ja ? ' on' : '')} key={o.ja} onClick={() => setPick(o)}>{o.en}</button>)}
        </div>
      )}
    </div>
  );
}
