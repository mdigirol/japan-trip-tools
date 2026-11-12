// Force refresh: the manual fallback for when the "Update available" bar never shows.
// Ask the service worker to check for a new version, let a new one take over, then reload.
// Caches are never cleared, so a refresh can't leave the phone without the offline copy.

export type RefreshStep = 'checking' | 'installing' | 'reloading';
export type RefreshResult = 'offline' | 'reloaded';

// Just the parts of ServiceWorkerRegistration / ServiceWorker this uses, so tests can fake them.
type Worker = { state: string; postMessage(m: unknown): void; addEventListener(t: 'statechange', f: () => void): void; removeEventListener(t: 'statechange', f: () => void): void };
type Registration = { installing: Worker | null; waiting: Worker | null; update(): Promise<unknown> };
export type RefreshEnv = {
  online: () => boolean;
  getRegistration: () => Promise<Registration | undefined>;
  onControllerChange: (f: () => void) => () => void;   // returns an unsubscribe
  reload: () => void;
  ms?: { check: number; install: number; takeover: number };
};

const MS = { check: 15_000, install: 60_000, takeover: 5_000 };

const wait = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p.then(() => true, () => false), new Promise<boolean>((r) => setTimeout(() => r(false), ms))]);

// Resolves once the worker has finished installing (or failed), or after `ms`.
function installed(w: Worker, ms: number) {
  return new Promise<void>((resolve) => {
    const done = () => { clearTimeout(t); w.removeEventListener('statechange', check); resolve(); };
    const check = () => { if (w.state !== 'installing') done(); };
    const t = setTimeout(done, ms);
    w.addEventListener('statechange', check);
    check();
  });
}

export function browserEnv(): RefreshEnv {
  const sw = 'serviceWorker' in navigator ? navigator.serviceWorker : null;
  return {
    online: () => navigator.onLine !== false,
    getRegistration: () => (sw ? sw.getRegistration() : Promise.resolve(undefined)) as Promise<Registration | undefined>,
    onControllerChange: (f) => { sw?.addEventListener('controllerchange', f); return () => sw?.removeEventListener('controllerchange', f); },
    reload: () => window.location.reload()
  };
}

export async function forceRefresh(onStep: (s: RefreshStep) => void = () => {}, env: RefreshEnv = browserEnv()): Promise<RefreshResult> {
  if (!env.online()) return 'offline';
  const ms = env.ms ?? MS;
  let reloaded = false;
  const reload = () => { if (reloaded) return; reloaded = true; onStep('reloading'); env.reload(); };

  onStep('checking');
  const reg = await env.getRegistration().catch(() => undefined);
  if (!reg) { reload(); return 'reloaded'; }          // no service worker: a plain reload gets the latest files

  await wait(reg.update(), ms.check);
  if (reg.installing) { onStep('installing'); await installed(reg.installing, ms.install); }

  const next = reg.waiting;
  if (!next) { reload(); return 'reloaded'; }          // nothing new to switch to

  // The new worker takes over, then the page reloads onto it. Reload anyway if the switch stalls.
  await new Promise<void>((resolve) => {
    const off = env.onControllerChange(() => { clearTimeout(t); off(); resolve(); });
    const t = setTimeout(() => { off(); resolve(); }, ms.takeover);
    next.postMessage({ type: 'SKIP_WAITING' });
  });
  reload();
  return 'reloaded';
}
