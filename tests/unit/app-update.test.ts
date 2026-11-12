import { describe, expect, it, vi } from 'vitest';
import { forceRefresh, type RefreshEnv, type RefreshStep } from '../../src/lib/appUpdate';

type Listener = () => void;
function worker(state: string) {
  const ls = new Set<Listener>();
  return {
    state, messages: [] as unknown[],
    postMessage(m: unknown) { this.messages.push(m); },
    addEventListener: (_t: 'statechange', f: Listener) => { ls.add(f); },
    removeEventListener: (_t: 'statechange', f: Listener) => { ls.delete(f); },
    set(s: string) { this.state = s; ls.forEach((f) => f()); }
  };
}

function setup(reg: { installing?: ReturnType<typeof worker> | null; waiting?: ReturnType<typeof worker> | null; update?: () => Promise<unknown> } | undefined, opts: { online?: boolean; takeover?: boolean } = {}) {
  const ccl = new Set<Listener>();
  const r = reg && { installing: null, waiting: null, update: () => Promise.resolve(), ...reg };
  const env: RefreshEnv = {
    online: () => opts.online ?? true,
    getRegistration: async () => r,
    onControllerChange: (f) => { ccl.add(f); return () => ccl.delete(f); },
    reload: vi.fn(),
    ms: { check: 50, install: 50, takeover: 50 }
  };
  // A waiting worker that obeys SKIP_WAITING fires controllerchange.
  if (r?.waiting && opts.takeover !== false) {
    const w = r.waiting; const post = w.postMessage.bind(w);
    w.postMessage = (m: unknown) => { post(m); queueMicrotask(() => ccl.forEach((f) => f())); };
  }
  return { env, r, ccl };
}

describe('forceRefresh', () => {
  it('does nothing offline', async () => {
    const { env } = setup({}, { online: false });
    expect(await forceRefresh(() => {}, env)).toBe('offline');
    expect(env.reload).not.toHaveBeenCalled();
  });

  it('reloads when there is no service worker', async () => {
    const { env } = setup(undefined);
    expect(await forceRefresh(() => {}, env)).toBe('reloaded');
    expect(env.reload).toHaveBeenCalledOnce();
  });

  it('reloads when no update is found', async () => {
    const update = vi.fn(() => Promise.resolve());
    const { env } = setup({ update });
    const steps: RefreshStep[] = [];
    expect(await forceRefresh((s) => steps.push(s), env)).toBe('reloaded');
    expect(update).toHaveBeenCalledOnce();
    expect(steps).toEqual(['checking', 'reloading']);
    expect(env.reload).toHaveBeenCalledOnce();
  });

  it('activates a waiting worker, then reloads', async () => {
    const waiting = worker('installed');
    const { env, ccl } = setup({ waiting });
    expect(await forceRefresh(() => {}, env)).toBe('reloaded');
    expect(waiting.messages).toEqual([{ type: 'SKIP_WAITING' }]);
    expect(env.reload).toHaveBeenCalledOnce();
    expect(ccl.size).toBe(0);
  });

  it('waits for an installing worker, then activates it', async () => {
    const w = worker('installing');
    const { env, r } = setup({ installing: w });
    const reg = r!;
    // Hook up takeover by hand, since the worker only becomes "waiting" later.
    const ccl = new Set<Listener>();
    env.onControllerChange = (f) => { ccl.add(f); return () => ccl.delete(f); };
    const post = w.postMessage.bind(w);
    w.postMessage = (m: unknown) => { post(m); queueMicrotask(() => ccl.forEach((f) => f())); };
    setTimeout(() => { reg.installing = null; reg.waiting = w; w.set('installed'); }, 5);
    const steps: RefreshStep[] = [];
    expect(await forceRefresh((s) => steps.push(s), env)).toBe('reloaded');
    expect(steps).toEqual(['checking', 'installing', 'reloading']);
    expect(w.messages).toEqual([{ type: 'SKIP_WAITING' }]);
    expect(env.reload).toHaveBeenCalledOnce();
  });

  it('reloads anyway if the update check fails or hangs', async () => {
    for (const update of [() => Promise.reject(new Error('net')), () => new Promise(() => {})]) {
      const { env } = setup({ update });
      expect(await forceRefresh(() => {}, env)).toBe('reloaded');
      expect(env.reload).toHaveBeenCalledOnce();
    }
  });

  it('reloads anyway if the new worker never takes over', async () => {
    const waiting = worker('installed');
    const { env } = setup({ waiting }, { takeover: false });
    expect(await forceRefresh(() => {}, env)).toBe('reloaded');
    expect(waiting.messages).toEqual([{ type: 'SKIP_WAITING' }]);
    expect(env.reload).toHaveBeenCalledOnce();
  });
});
