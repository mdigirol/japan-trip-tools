// The "People you're buying for" list, synced as one issue titled "recipients" in the private data repo.
// Whole-list last write wins by `at`. A phone that has never synced a list merges by union instead,
// so two phones that each typed names before first sync don't wipe each other out.
export interface RecipientsDoc { recipients: string[]; at: string }

export const RECIPIENTS_TITLE = 'recipients';

export function encodeRecipients(d: RecipientsDoc): string {
  return `<!-- companion ${JSON.stringify(d).replace(/--/g, '-\\u002d')} -->\n\nPeople to buy souvenirs for: ${d.recipients.length}`;
}

export function decodeRecipients(body: string | null | undefined): RecipientsDoc | null {
  const m = /<!-- companion ([\s\S]*?) -->/.exec(body ?? '');
  if (!m) return null;
  try {
    const j = JSON.parse(m[1]);
    if (!Array.isArray(j.recipients) || !j.recipients.every((x: unknown) => typeof x === 'string') || typeof j.at !== 'string') return null;
    return { recipients: j.recipients, at: j.at };
  } catch { return null; }
}

export interface RecipientsLocal { recipients: string[]; at: string; dirty: boolean }

/** Merge a remote list into the local one. `dirty` on the result means the remote needs our version pushed. */
export function mergeRecipients(local: RecipientsLocal, remote: RecipientsDoc): RecipientsLocal {
  if (!local.at) {
    const union = [...local.recipients, ...remote.recipients.filter((r) => !local.recipients.includes(r))];
    const same = union.length === remote.recipients.length;
    const dirty = !same || local.dirty;
    // Bump the stamp when we have names the remote lacks, so the other phone adopts the union.
    return { recipients: union, at: dirty ? new Date().toISOString() : remote.at, dirty };
  }
  if (remote.at > local.at) return { recipients: remote.recipients, at: remote.at, dirty: false };
  return local;
}
