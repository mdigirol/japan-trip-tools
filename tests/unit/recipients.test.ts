import { describe, expect, it } from 'vitest';
import { decodeRecipients, encodeRecipients, mergeRecipients } from '../../src/lib/recipients';

describe('recipients sync', () => {
  it('round-trips through the issue body', () => {
    const d = { recipients: ['A', 'B -- C'], at: '2026-11-01T00:00:00.000Z' };
    expect(decodeRecipients(encodeRecipients(d))).toEqual(d);
  });
  it('rejects bad bodies', () => {
    expect(decodeRecipients('nothing')).toBeNull();
    expect(decodeRecipients('<!-- companion {"recipients":[1],"at":"x"} -->')).toBeNull();
  });
  it('newer remote wins', () => {
    const m = mergeRecipients({ recipients: ['A'], at: '2026-11-01', dirty: false }, { recipients: ['A', 'B'], at: '2026-11-02' });
    expect(m).toEqual({ recipients: ['A', 'B'], at: '2026-11-02', dirty: false });
  });
  it('newer local is kept', () => {
    const local = { recipients: ['A'], at: '2026-11-03', dirty: true };
    expect(mergeRecipients(local, { recipients: ['B'], at: '2026-11-02' })).toBe(local);
  });
  it('first sync unions and pushes back if remote lacked names', () => {
    const m = mergeRecipients({ recipients: ['A', 'C'], at: '', dirty: false }, { recipients: ['A', 'B'], at: '2026-11-02' });
    expect(m.recipients).toEqual(['A', 'C', 'B']);
    expect(m.dirty).toBe(true);
    expect(m.at > '2026-11-02').toBe(true);
  });
});
