import { href } from '../lib/router';
import { stamp } from '../lib/now';
import { syncNow, useSyncState } from '../lib/sync';

export function SyncStatus({ link }: { link?: boolean }) {
  const s = useSyncState();
  if (s.kind === 'off') {
    return <div class="small" data-testid="sync-status">Sync off — {link ? <a href={href('settings')}>add a token in Settings</a> : 'add a token in Settings'}</div>;
  }
  const pending = s.pending ? ` · ${s.pending} waiting to send` : '';
  return (
    <div class="row small" data-testid="sync-status">
      <span class="grow">
        {s.kind === 'syncing' && <>Syncing…{pending}</>}
        {s.kind === 'idle' && <>{s.at ? `Synced ${stamp(s.at)}` : 'Not synced yet'}{pending}</>}
        {s.kind === 'error' && <span style="color:var(--must)">{s.message}{pending}</span>}
      </span>
      <button class="btn" style="min-height:36px" onClick={() => syncNow(true)}>Sync now</button>
    </div>
  );
}
