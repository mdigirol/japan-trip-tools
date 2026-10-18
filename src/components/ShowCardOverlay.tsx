import { useEffect } from 'preact/hooks';
import { showCard, telHref, useShowCard } from '../lib/showcard';

// Keep the screen awake while a card is open (Screen Wake Lock API, where supported).
type Sentinel = { release(): Promise<void> };
async function wake(): Promise<Sentinel | null> {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Sentinel> } }).wakeLock;
    return wl ? await wl.request('screen') : null;
  } catch { return null; }
}

if (typeof window !== 'undefined') window.addEventListener('hashchange', () => showCard(null));

export function ShowCardOverlay() {
  const v = useShowCard();

  useEffect(() => {
    if (!v) return;
    let lock: Sentinel | null = null, alive = true;
    const get = () => wake().then((l) => { if (alive) lock = l; else l?.release(); });
    get();
    const onVis = () => { if (document.visibilityState === 'visible') get(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') showCard(null); };
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      alive = false; lock?.release().catch(() => {});
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [v]);

  if (!v) return null;
  const long = v.ja.length > 40;
  return (
    <div class="showcard" role="dialog" aria-modal="true" aria-label="Show card" lang="ja">
      <button class="close" onClick={() => showCard(null)} aria-label="Close card">✕</button>
      <div class="sc-body">
        {v.head && <div class="sc-head">{v.head}</div>}
        <div class={'sc-ja' + (long ? ' long' : '')} data-testid="sc-ja">{v.ja}</div>
        {v.sub && <div class="sc-head" style="font-size:max(22px,5vw)">{v.sub}</div>}
        {v.tel && <a class="sc-tel" href={telHref(v.tel)}>☎ {v.telLabel ?? v.tel}</a>}
      </div>
      <div class="sc-en" lang="en">{v.en}{v.romaji ? <><br /><i>{v.romaji}</i></> : null}</div>
    </div>
  );
}
