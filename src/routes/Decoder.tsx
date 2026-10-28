import { useState } from 'preact/hooks';
import { glossary, GLOSSARY_CATEGORIES } from '../data/glossary';
import { Dot } from '../components/Dot';
import { KuliKuli } from '../components/KuliKuli';

const norm = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');

export function Decoder() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('sign');
  const n = norm(q);
  const list = n ? glossary.filter((g) => norm(g.ja + g.romaji + g.en + (g.note ?? '')).includes(n)) : glossary.filter((g) => g.category === cat);
  return (
    <div>
      <h1>Signs & menus</h1>
      <KuliKuli label="📷 Camera translate in Kuli Kuli ↗" />
      <div class="row more-translate" style="margin:10px 0">
        <a class="btn grow" href="https://translate.google.com/?sl=ja&tl=en&op=images" target="_blank" rel="noopener">Google Translate ↗</a>
        <a class="btn grow" href="https://lens.google/" target="_blank" rel="noopener">Google Lens ↗</a>
      </div>
      <p class="small faint" style="margin-top:0">For anything not listed. Lens works best from the Google app.</p>
      <input type="search" placeholder="Search kanji, romaji or English" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Search words" />
      {!n && (
        <div class="chips" style="margin-top:10px">
          {GLOSSARY_CATEGORIES.map((c) => <button key={c.id} class={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}>{c.label}</button>)}
        </div>
      )}
      <table class="tbl" style="margin-top:6px">
        <tbody>{list.map((g) => (
          <tr key={g.id}>
            <td lang="ja" style="font-size:1.3em;font-weight:600;white-space:nowrap;padding-right:12px">{g.ja}<Dot reviewed={g.reviewed} /></td>
            <td><div>{g.en}</div><div class="small" style="color:var(--indigo)"><i>{g.romaji}</i>{g.note ? <span class="faint"> · {g.note}</span> : null}</div></td>
          </tr>
        ))}</tbody>
      </table>
      {!list.length && <div class="empty">No match. Try the camera.</div>}
    </div>
  );
}
