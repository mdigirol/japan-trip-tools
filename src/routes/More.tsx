import { MODULES } from '../lib/modules';
import { href } from '../lib/router';

export function More() {
  return (
    <div>
      <h1>More</h1>
      {MODULES.filter((m) => m.ready).map((m) => (
        <a class="card card-btn row" href={href(m.path)} key={m.path} style="text-decoration:none;color:inherit">
          <span style="font-size:26px;width:36px;text-align:center" aria-hidden="true">{m.ic}</span>
          <span class="grow"><b>{m.label}</b><div class="small muted">{m.blurb}</div></span>
          <span class="faint" aria-hidden="true">›</span>
        </a>
      ))}
      {MODULES.some((m) => !m.ready) && <p class="small faint" style="margin-top:12px">Coming before the trip: {MODULES.filter((m) => !m.ready).map((m) => m.label).join(', ')}.</p>}
    </div>
  );
}
