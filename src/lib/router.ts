// Hash routing (#/phrases?tab=bar). Works on GitHub Pages and from the service worker's cache.
import { useEffect, useState } from 'preact/hooks';

export interface Route { path: string; params: URLSearchParams }

function parse(): Route {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace(/^#\/?/, '');
  const [path, q] = h.split('?');
  return { path: path || '', params: new URLSearchParams(q || '') };
}

export function useRoute(): Route {
  const [r, set] = useState(parse);
  useEffect(() => {
    const f = () => { set(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

// Keep the ?now= override when linking around the app.
export const href = (path: string, q?: Record<string, string>) => {
  const qs = q ? '?' + new URLSearchParams(q).toString() : '';
  return `#/${path}${qs}`;
};
