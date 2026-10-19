import { EARTHQUAKE, numbers, PHARMACY, PHARMACY_INTRO, PHARMACY_NOTES, WHEN_WRONG } from '../data/emergency';
import { now } from '../lib/now';
import { href } from '../lib/router';
import { showCard, telDisplay } from '../lib/showcard';
import { todayState, stayById, trip } from '../lib/trip';

export function Emergency() {
  const st = todayState(now());
  const hotel = st.primary ?? stayById(trip.stays[0]?.id);
  const openAmbulance = () => showCard({
    head: '救急車を呼んでください。',
    ja: hotel ? hotel.addrJa : '救急車を呼んでください。',
    sub: hotel ? `滞在先：${hotel.nameJa}` : undefined,
    tel: hotel?.tel, telLabel: hotel ? telDisplay(hotel.tel) : undefined,
    en: `Please call an ambulance. ${hotel ? `We are staying at ${hotel.name}, ${hotel.addrEn}.` : ''}`,
    romaji: 'Kyuukyuusha o yonde kudasai.'
  });
  return (
    <div>
      <h1>Emergency</h1>
      <button class="btn primary block" style="min-height:64px;font-size:1.15em" onClick={openAmbulance} data-testid="ambulance-card">
        Show “Please call an ambulance”
      </button>
      <p class="small faint">The card includes {hotel ? 'tonight’s hotel address' : 'a hotel address'}.</p>

      <h2>Call</h2>
      {numbers.map((n) => (
        <a class="card tel" href={`tel:${n.dial}`} key={n.id} data-testid={`tel-${n.id}`}>
          <div class="grow"><b>{n.who}</b><div class="small muted">{n.note}</div>
            {!n.verified && <div class="small" style="color:var(--ochre)">Not yet checked on an official page</div>}</div>
          <span class="num">{n.number}</span>
        </a>
      ))}
      {hotel && (
        <a class="card tel" href={`tel:${hotel.tel.replace(/[^+0-9]/g, '')}`}>
          <div class="grow"><b>Hotel front desk</b><div class="small muted">{hotel.name}. They can call a doctor or a taxi.</div></div>
          <span class="num">{telDisplay(hotel.tel)}</span>
        </a>
      )}

      <h2>Earthquake</h2>
      <div class="card"><ol class="list-plain">{EARTHQUAKE.map((e) => <li key={e}>{e}</li>)}</ol></div>

      <h2>When things go wrong</h2>
      {WHEN_WRONG.map((w) => <div class="card" key={w.title}><h3>{w.title}</h3><p class="small">{w.text}</p></div>)}

      <h2>Pharmacy</h2>
      <p class="small">{PHARMACY_INTRO}</p>
      <table class="tbl"><thead><tr><th>Need</th><th>Brands</th></tr></thead>
        <tbody>{PHARMACY.map((p) => <tr key={p.need}><td>{p.need}</td><td>{p.brands}</td></tr>)}</tbody></table>
      <p class="small faint">{PHARMACY_NOTES}</p>
      <a class="btn block" href={href('phrases', { tab: 'pharmacy' })}>Symptom phrases →</a>
    </div>
  );
}
