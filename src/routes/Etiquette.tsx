import { useEffect } from 'preact/hooks';
import type { EtiquetteCard } from '../data/schema';
import { etiquette, ETIQUETTE_GROUPS } from '../data/etiquette';
import { areaTips, tipsBySlug } from '../data/places';
import { href, type Route } from '../lib/router';

const RANK = { must: 0, should: 1, nice: 2 } as const;
export const sortCards = (l: EtiquetteCard[]) => [...l].sort((a, b) => RANK[a.severity] - RANK[b.severity]);

const SEVERITY_LABEL = { must: 'Must know', should: 'Good to know', nice: 'Bonus' } as const;

export function Etiquette({ route }: { route: Route }) {
  const area = route.params.get('area');
  const group = area ? '' : route.params.get('group') || 'everywhere';
  const focus = route.params.get('card');

  useEffect(() => {
    if (focus) document.getElementById('etq-' + focus)?.scrollIntoView({ block: 'center' });
  }, [focus]);

  const cards = area
    ? sortCards(etiquette.filter((c) => c.areas?.includes(area)))
    : sortCards(etiquette.filter((c) => c.group === group));
  const tip = area ? tipsBySlug.get(area) : undefined;

  return (
    <div>
      <h1>Etiquette</h1>
      <div class="chips" aria-label="Place types">
        {ETIQUETTE_GROUPS.map((g) => <a key={g.id} class={'chip' + (g.id === group ? ' on' : '')} href={href('etiquette', { group: g.id })}>{g.label}</a>)}
      </div>
      <p class="etq-key">Cards run from <span class="badge must">Must know</span> to <span class="badge should">Good to know</span> to <span class="badge nice">Bonus</span>.</p>
      <label class="field"><span>Or by area</span>
        <select value={area ?? ''} onChange={(e) => { const v = e.currentTarget.value; location.hash = v ? href('etiquette', { area: v }) : href('etiquette'); }} aria-label="Area">
          <option value="">Choose an area…</option>
          {areaTips.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
      </label>
      {tip && (
        <div class="card">
          <h3>{tip.name}</h3>
          <ul class="tips">{tip.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {cards.map((c) => <EtqCard c={c} key={c.id} focus={c.id === focus} />)}
      {area && !cards.length && !tip && <div class="empty">No cards for this area.</div>}
    </div>
  );
}

export function EtqCard({ c, focus }: { c: EtiquetteCard; focus?: boolean }) {
  return (
    <article class="card etq" id={'etq-' + c.id} data-testid={`etq-${c.id}`} style={focus ? 'outline:3px solid var(--accent)' : ''}>
      <h3><span>{c.title}</span><span class={'badge ' + c.severity}>{SEVERITY_LABEL[c.severity]}</span></h3>
      {c.steps && <ol class="steps">{c.steps.map((s) => <li key={s}>{s}</li>)}</ol>}
      {(c.do.length > 0 || c.dont.length > 0) && (
        <ul>
          {c.do.map((d) => <li class="do" key={d}><span class="tag do">Do</span>{d}</li>)}
          {c.dont.map((d) => <li class="dont" key={d}><span class="tag dont">Don’t</span>{d}</li>)}
        </ul>
      )}
      <div class="why">{c.why}</div>
    </article>
  );
}
