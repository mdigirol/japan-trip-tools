import { MODULES } from '../lib/modules';
import { href } from '../lib/router';

export function Tiles() {
  return (
    <nav class="tiles" aria-label="Tools">
      {MODULES.filter((m) => m.ready).map((m) => (
        <a class="tile" href={href(m.path)} key={m.path}><span class="ic" aria-hidden="true">{m.ic}</span>{m.label}</a>
      ))}
    </nav>
  );
}
