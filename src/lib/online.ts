import { useEffect, useState } from 'preact/hooks';

export function useOnline() {
  const [on, set] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const up = () => set(true), down = () => set(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    set(navigator.onLine);   // catch a change between the first render and now
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  return on;
}
