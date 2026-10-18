// Phone voice (ja-JP) via speechSynthesis (Q1, risk spike R2). Recorded clips can replace it per phrase.
let voice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'));
  return vs.find((v) => v.localService) ?? vs[0] ?? null;
}

export const canSpeak = () => typeof speechSynthesis !== 'undefined';

export function speak(ja: string, audio?: string) {
  if (audio) { new Audio(`${import.meta.env.BASE_URL}audio/${audio}`).play().catch(() => speakVoice(ja)); return; }
  speakVoice(ja);
}

function speakVoice(ja: string) {
  if (!canSpeak()) return;
  if (voice === undefined || voice === null) voice = pickVoice();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(ja.replace(/[\[\]]/g, ''));
  u.lang = 'ja-JP';
  u.rate = 0.85;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

if (typeof speechSynthesis !== 'undefined') speechSynthesis.addEventListener?.('voiceschanged', () => { voice = pickVoice(); });
