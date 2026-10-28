// Opens the Kuli Kuli translator app (#41). Kuli Kuli reads menus, labels and handwriting from the camera.
// iPhone: its universal link (the maker's apple-app-site-association covers every path on this host) opens
// the app when it's installed, else the maker's web page. Android has no app link, so it goes to the Play
// Store listing, which shows Open when the app is installed. Both need a connection.
export const KULI_KULI_LINK = 'https://menu-gpt-orpin.vercel.app/';
export const KULI_KULI_APP_STORE = 'https://apps.apple.com/app/id6458146511';
export const KULI_KULI_PLAY = 'https://play.google.com/store/apps/details?id=io.iftech.bistrobridge';

export const kuliKuliHref = (ua: string) => /Android/i.test(ua) ? KULI_KULI_PLAY : KULI_KULI_LINK;

export function KuliKuli({ label = '📷 Open Kuli Kuli ↗' }: { label?: string }) {
  return (
    <div class="kuli">
      <a class="btn primary block" href={kuliKuliHref(navigator.userAgent)} target="_blank" rel="noopener" data-testid="kuli-kuli">{label}</a>
      <p class="small faint" style="margin:4px 0 0">
        Opens the app if it’s installed. Get it: <a href={KULI_KULI_APP_STORE} target="_blank" rel="noopener">App Store ↗</a> · <a href={KULI_KULI_PLAY} target="_blank" rel="noopener">Google Play ↗</a>
      </p>
    </div>
  );
}
