import { fmtYen } from '../lib/rates';
import { claimTotals, usePurchases } from '../lib/purchases';
import { href } from '../lib/router';

// Shown after the trip, and on Nov 27, when tax-free items haven't been ticked at customs.
export function UnclaimedNotice({ nov27 }: { nov27?: boolean }) {
  const l = usePurchases();
  if (!l) return null;
  const open = l.filter((p) => p.taxFree && !p.claimed);
  if (!open.length) return null;
  const t = claimTotals(open);
  return (
    <a class="card card-btn" href={href('purchases', { view: 'claim', check: '1' })} style="border-left:5px solid var(--ochre);text-decoration:none;color:inherit">
      <b>{nov27 ? 'Tax-free claim at Haneda customs, before check-in' : 'Unclaimed tax-free items'}</b>
      <div class="small">{t.count} item{t.count === 1 ? '' : 's'} · {fmtYen(t.taxYen)} tax due back. Open the checklist →</div>
    </a>
  );
}
