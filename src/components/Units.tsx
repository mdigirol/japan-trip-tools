import { useState } from 'preact/hooks';
import { CLOTHING, shoeCm } from '../data/money';
import { cToF, fToC } from '../lib/weather';

const PAIRS = [
  { id: 'temp', a: '°C', b: '°F', ab: cToF, ba: fToC },
  { id: 'dist', a: 'km', b: 'mi', ab: (x: number) => x * 0.621371, ba: (x: number) => x / 0.621371 },
  { id: 'mass', a: 'g', b: 'oz', ab: (x: number) => x / 28.3495, ba: (x: number) => x * 28.3495 }
];

function Pair({ p }: { p: typeof PAIRS[number] }) {
  const [a, setA] = useState(''), [b, setB] = useState('');
  const r = (x: number) => String(Math.round(x * 10) / 10);
  return (
    <div class="row" style="margin:8px 0">
      <label class="grow"><span class="sr">{p.a}</span>
        <input type="number" inputMode="decimal" placeholder={p.a} value={a} onInput={(e) => { const v = e.currentTarget.value; setA(v); setB(v === '' ? '' : r(p.ab(+v))); }} /></label>
      <span aria-hidden="true">⇄</span>
      <label class="grow"><span class="sr">{p.b}</span>
        <input type="number" inputMode="decimal" placeholder={p.b} value={b} onInput={(e) => { const v = e.currentTarget.value; setB(v); setA(v === '' ? '' : r(p.ba(+v))); }} /></label>
    </div>
  );
}

export function Measurements() {
  return <div class="card">{PAIRS.map((p) => <Pair p={p} key={p.id} />)}</div>;
}

export function Sizes() {
  const [us, setUs] = useState('9');
  const n = parseFloat(us);
  return (
    <div class="card">
      <h3>Shoes (rough guide)</h3>
      <div class="row">
        <label class="grow"><span class="small muted">US size</span>
          <input type="number" inputMode="decimal" value={us} onInput={(e) => setUs(e.currentTarget.value)} /></label>
        <div class="grow small">
          {n > 0 ? <>Men’s: <b>{shoeCm(n, 'men')} cm</b><br />Women’s: <b>{shoeCm(n, 'women')} cm</b></> : '—'}
        </div>
      </div>
      <h3 style="margin-top:12px">Clothing</h3>
      <table class="tbl small"><thead><tr><th>US</th><th>Japan</th></tr></thead>
        <tbody>{CLOTHING.map((c) => <tr key={c.us}><td>{c.us}</td><td>{c.jp}</td></tr>)}</tbody></table>
      <p class="small faint">Japanese sizes run small. Try on to be sure.</p>
    </div>
  );
}
