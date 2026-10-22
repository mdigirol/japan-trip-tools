import { orderedModules } from '../lib/modules';
import { href } from '../lib/router';
import { useSettings } from '../lib/settings';

export function Tiles() {
  const { toolOrder } = useSettings();
  return (
    <nav class="tiles" aria-label="Tools">
      {orderedModules(toolOrder).map((m) => (
        <a class="tile" href={href(m.path)} key={m.path}><span class="ic" aria-hidden="true">{m.ic}</span>{m.label}</a>
      ))}
    </nav>
  );
}
