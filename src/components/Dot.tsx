// Dev builds mark unreviewed Japanese with a small dot (D9). Production shows nothing.
export function Dot({ reviewed }: { reviewed: boolean }) {
  if (!import.meta.env.DEV || reviewed) return null;
  return <span class="dot-unreviewed" title="Japanese not yet reviewed" aria-label="Not yet reviewed" />;
}
