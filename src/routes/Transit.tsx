import { transit } from '../data/transit';
import { showCard } from '../lib/showcard';

// An annotated mock Shinkansen ticket. The labels point at the parts that matter.
function TicketDiagram() {
  return (
    <figure class="card" style="margin:0">
      <svg viewBox="0 0 340 190" role="img" aria-labelledby="tkt-t" style="width:100%;height:auto;display:block">
        <title id="tkt-t">A sample Shinkansen ticket with the car, seat, train and times labeled</title>
        <rect x="6" y="6" width="328" height="118" rx="8" fill="#e9f1f7" stroke="#8aa9c1" />
        <text x="18" y="30" font-size="13" fill="#333">乗車券・特急券</text>
        <text x="18" y="58" font-size="20" font-weight="700" fill="#111">東京 → 新大阪</text>
        <text x="18" y="84" font-size="14" fill="#111">12月 1日 (10:03発) (12:33着)</text>
        <text x="18" y="108" font-size="15" font-weight="700" fill="#111">のぞみ 21号</text>
        <text x="150" y="108" font-size="15" font-weight="700" fill="#b7282e">7号車 12番 E席</text>
        <g font-size="11" fill="currentColor">
          <line x1="200" y1="114" x2="200" y2="140" stroke="#b7282e" /><text x="150" y="152">Car 7 · Row 12 · Seat E</text>
          <line x1="60" y1="114" x2="60" y2="140" stroke="#263463" /><text x="12" y="152">Train: Nozomi 21</text>
          <line x1="120" y1="88" x2="300" y2="170" stroke="#263463" /><text x="190" y="182">発 departs · 着 arrives</text>
        </g>
      </svg>
      <figcaption class="small muted" style="margin-top:6px">
        Sample ticket, not yours. 号車 = car (painted on the platform where the doors stop). 番 + letter = seat. 番線 on the departure board = platform. Seat E is the Mt. Fuji side.
      </figcaption>
    </figure>
  );
}

export function Transit() {
  return (
    <div>
      <h1>Transit</h1>
      <a class="btn block" href="https://www.google.com/maps/dir/?api=1&travelmode=transit" target="_blank" rel="noopener">Route in Google Maps ↗</a>
      <h2>Reading a Shinkansen ticket</h2>
      <TicketDiagram />
      {transit.map((s) => (
        <section key={s.id}>
          <h2>{s.title}</h2>
          <div class="card"><ul class="list-plain">{s.items.map((i) => <li key={i.text}>{i.text}</li>)}</ul></div>
        </section>
      ))}
      <button class="btn block" style="margin-top:12px" onClick={() => showCard({ ja: 'タクシーを呼んでいただけますか？', en: 'Could you call a taxi for us?' })}>Show “Please call a taxi”</button>
    </div>
  );
}
