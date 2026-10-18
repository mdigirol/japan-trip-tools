import { useEffect, useState } from 'preact/hooks';

// "Update available — tap to reload" when a new service worker is waiting.
export function UpdatePrompt() {
  const [update, setUpdate] = useState<null | ((reload?: boolean) => Promise<void>)>(null);
  useEffect(() => {
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
    import('virtual:pwa-register').then(({ registerSW }) => {
      const u = registerSW({
        immediate: true,
        onNeedRefresh() { setUpdate(() => u); },
        onRegisteredSW(_url, reg) { if (reg) setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000); }
      });
    }).catch(() => {});
  }, []);
  if (!update) return null;
  return (
    <div class="update-bar">
      <button class="btn primary block" onClick={() => update(true)}>Update available — tap to reload</button>
    </div>
  );
}
