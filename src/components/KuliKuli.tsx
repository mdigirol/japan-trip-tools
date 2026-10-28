// Kuli Kuli translator (#41). Reads menus, labels and handwriting from the camera. A web page can't open the
// app reliably (no URL scheme, and its universal link didn't open it when tested on an iPhone), so the button
// opens the store listing for the phone's OS. The listing shows Open when the app is installed, Get when it
// isn't. Needs a connection.
export const KULI_KULI_APP_STORE = 'https://apps.apple.com/app/id6458146511';
export const KULI_KULI_PLAY = 'https://play.google.com/store/apps/details?id=io.iftech.bistrobridge';

export const kuliKuliHref = (ua: string) => /Android/i.test(ua) ? KULI_KULI_PLAY : KULI_KULI_APP_STORE;

export function KuliKuli({ label = '📷 Open Kuli Kuli ↗' }: { label?: string }) {
  return (
    <div class="kuli">
      <a class="btn primary block" href={kuliKuliHref(navigator.userAgent)} target="_blank" rel="noopener" data-testid="kuli-kuli">{label}</a>
      <p class="small faint" style="margin:4px 0 0">Opens its store page. Tap Open there, or Get to install it.</p>
    </div>
  );
}
