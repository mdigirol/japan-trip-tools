import { useEffect, useState } from 'preact/hooks';
import { COMMON_PRICES, QUICK_AMOUNTS, TAX } from '../data/money';
import { stamp } from '../lib/now';
import { cachedRate, fmtUsd, fmtYen, refreshRate, usdToYen, withoutTax, withTax, yenToUsd, type Rate } from '../lib/rates';
import { updateSettings, useSettings } from '../lib/settings';
import { useOnline } from '../lib/online';
import { Units } from '../components/Units';

// The rate to use: a manual override wins until cleared; otherwise the last good fetched rate.
export function useRate() {
  const s = useSettings();
  const online = useOnline();
  const [rate, setRate] = useState<Rate | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    cachedRate().then((r) => { if (alive && r) setRate(r); });
    refreshRate().then((r) => { if (alive) { if (r) setRate(r); setLoading(false); } });
    return () => { alive = false; };
  }, [online]);
  const usdPerYen = s.rateOverride ?? rate?.usdPerYen;
  return { usdPerYen, rate, override: s.rateOverride, loading };
}

export function Currency() {
  const { usdPerYen, rate, override, loading } = useRate();
  return (
    <div>
      <h1>Currency</h1>
      <RateLine usdPerYen={usdPerYen} rate={rate} override={override} loading={loading} />
      {usdPerYen ? <QuickTable usdPerYen={usdPerYen} /> : <div class="card empty" data-testid="set-rate">Set a rate below to see dollars.</div>}
      <Calculator usdPerYen={usdPerYen} />
      <Override override={override} />
      <h2>Is this price normal?</h2>
      <table class="tbl small">
        <tbody>{COMMON_PRICES.map((p) => <tr key={p.what}><td>{p.what}</td><td style="text-align:right;white-space:nowrap">{p.yen}</td></tr>)}</tbody>
      </table>
      <h2>Units</h2>
      <Units />
    </div>
  );
}

function RateLine({ usdPerYen, rate, override, loading }: { usdPerYen?: number; rate?: Rate; override: number | null; loading: boolean }) {
  return (
    <div class="card tight rate-line" data-testid="rate-line">
      {usdPerYen ? (
        <>
          <b>¥1,000 = {fmtUsd(1000 * usdPerYen)}</b>
          <span class="small muted">
            {override != null ? 'Your rate (manual)' : rate ? `${rate.source}, ${stamp(rate.at)}` : ''}
          </span>
        </>
      ) : (
        <><b>Set a rate</b><span class="small muted">{loading ? 'Fetching…' : 'No saved rate yet. Go online once, or enter one below.'}</span></>
      )}
    </div>
  );
}

function QuickTable({ usdPerYen }: { usdPerYen: number }) {
  return (
    <table class="qref card" style="margin-top:10px;padding:4px 12px" data-testid="qref">
      <tbody>{QUICK_AMOUNTS.map((y) => <tr key={y}><td>{fmtYen(y)}</td><td>{fmtUsd(yenToUsd(y, usdPerYen))}</td></tr>)}</tbody>
    </table>
  );
}

function Calculator({ usdPerYen }: { usdPerYen?: number }) {
  const [dir, setDir] = useState<'yen' | 'usd'>('yen');
  const [entry, setEntry] = useState('');
  const [tax, setTax] = useState<'none' | 'add10' | 'add8'>('none');

  const n = parseFloat(entry || '0');
  const press = (k: string) => {
    if (k === 'C') return setEntry('');
    if (k === '⌫') return setEntry((e) => e.slice(0, -1));
    if (k === '.' && (dir === 'yen' || entry.includes('.'))) return;
    if (entry.replace('.', '').length >= 9) return;
    setEntry((e) => (e === '0' && k !== '.' ? k : e + k));
  };
  const yen = dir === 'yen' ? n : usdPerYen ? usdToYen(n, usdPerYen) : NaN;
  const taxed = tax === 'add10' ? withTax(yen, TAX.standard) : tax === 'add8' ? withTax(yen, TAX.takeawayFood) : yen;
  const input = dir === 'yen' ? fmtYen(n) : '$' + (entry || '0');

  return (
    <section class="card" style="margin-top:10px" aria-label="Calculator">
      <div class="seg" role="group" aria-label="Direction">
        <button aria-pressed={dir === 'yen'} onClick={() => { setDir('yen'); setEntry(''); }}>¥ → $</button>
        <button aria-pressed={dir === 'usd'} onClick={() => { setDir('usd'); setEntry(''); }}>$ → ¥</button>
      </div>
      <div class="calc-display" style="margin-top:10px" aria-live="polite">
        <div class="in" data-testid="calc-in">{input}</div>
        <div class="out" data-testid="calc-out">
          {dir === 'yen'
            ? (usdPerYen ? '= ' + fmtUsd(yenToUsd(taxed, usdPerYen)) : 'Set a rate')
            : (usdPerYen ? '= ' + fmtYen(yen) : 'Set a rate')}
        </div>
        {dir === 'yen' && tax !== 'none' && n > 0 && (
          <div class="small" data-testid="calc-tax">
            税抜 {fmtYen(n)} → 税込 <b>{fmtYen(taxed)}</b> ({tax === 'add8' ? '8%' : '10%'} added)
          </div>
        )}
        {dir === 'yen' && tax === 'none' && n > 0 && (
          <div class="small faint">If this tag says 税込, tax is in. Before tax: {fmtYen(withoutTax(n))}</div>
        )}
      </div>
      {dir === 'yen' && (
        <div class="seg" role="group" aria-label="Tax" style="margin-top:10px">
          <button aria-pressed={tax === 'none'} onClick={() => setTax('none')}>税込 (tax in)</button>
          <button aria-pressed={tax === 'add10'} onClick={() => setTax('add10')} data-testid="tax-10">税抜 +10%</button>
          <button aria-pressed={tax === 'add8'} onClick={() => setTax('add8')}>Takeaway food +8%</button>
        </div>
      )}
      <div class="pad">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((k) => <button key={k} onClick={() => press(k)}>{k}</button>)}
        <button class="fn" onClick={() => press(dir === 'yen' ? '00' : '.')}>{dir === 'yen' ? '00' : '.'}</button>
        <button onClick={() => press('0')}>0</button>
        <button class="fn" onClick={() => press('⌫')} aria-label="Delete">⌫</button>
      </div>
      <button class="btn block" style="margin-top:8px" onClick={() => press('C')}>Clear</button>
    </section>
  );
}

function Override({ override }: { override: number | null }) {
  const [v, setV] = useState(override ? String(Math.round(1 / override * 100) / 100) : '');
  return (
    <section class="card" style="margin-top:10px">
      <h3>Your card’s rate</h3>
      <p class="small muted">Enter yen per dollar from a recent card charge. It wins until you clear it.</p>
      <div class="row">
        <input type="number" inputMode="decimal" placeholder="e.g. 152.40" value={v} onInput={(e) => setV(e.currentTarget.value)} aria-label="Yen per dollar" />
        <button class="btn primary" onClick={() => { const n = parseFloat(v); if (n > 0) updateSettings({ rateOverride: 1 / n }); }}>Use</button>
      </div>
      {override != null && <button class="btn block" style="margin-top:8px" onClick={() => { updateSettings({ rateOverride: null }); setV(''); }}>Clear manual rate (now ¥{(1 / override).toFixed(2)} per $1)</button>}
    </section>
  );
}
