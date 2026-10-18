// Emergency content, from context/emergency-and-health.md.
// Phone numbers are the one content type verified BEFORE the trip (§6.7); each needs an official sourceUrl.
import type { EmergencyNumber } from './schema';

export const numbers: EmergencyNumber[] = [
  { id: 'police', who: 'Police', number: '110', dial: '110', note: 'Operators may switch to an interpreter. Stay on the line.', source: ['N'], verified: false },
  { id: 'ambulance', who: 'Ambulance / fire', number: '119', dial: '119', note: 'Say "kyuukyuusha" for an ambulance. Stay on the line.', source: ['N'], verified: false },
  { id: 'jnto', who: 'Japan Visitor Hotline (JNTO)', number: '050-3816-2787', dial: '+815038162787', note: 'English, 24/7. Accidents, disasters, general trouble.', source: ['N'], verified: false },
  { id: 'us-embassy', who: 'US Embassy Tokyo', number: '03-3224-5000', dial: '+81332245000', note: 'American Citizen Services.', source: ['V'], verified: false },
  { id: 'us-osaka', who: 'US Consulate General Osaka-Kobe', number: '06-6315-5900', dial: '+81663155900', note: 'Covers Kyoto, Osaka, Nara.', source: ['V'], verified: false },
  { id: 'amda', who: 'AMDA International Medical Information Center', number: '03-6233-9266', dial: '+81362339266', note: 'Finds clinics that speak English.', source: ['V'], verified: false },
  { id: 'himawari', who: 'Tokyo "Himawari" medical information', number: '03-5285-8181', dial: '+81352858181', note: 'English help finding a doctor in Tokyo.', source: ['V'], verified: false }
];

export const EARTHQUAKE = [
  'Small tremors are routine.',
  'In a strong one: drop, take cover under sturdy furniture, protect your head.',
  "Don't run outside while it's shaking.",
  'Phones sound a loud early warning. Follow the on-screen instructions.',
  'Find your nearest exit (非常口) at check-in. Hotels post evacuation maps.',
  'NERV is a disaster-alert app worth installing.'
];

export const WHEN_WRONG = [
  { title: 'Lost item', text: 'Japan returns lost things remarkably often. Ask at the nearest koban (police box) or the station office. Train items go to the line’s lost-and-found.' },
  { title: 'Hospitals', text: 'Some don’t take walk-ins. Call the hotlines above, or ask the hotel front desk to call a doctor.' },
  { title: 'Passport', text: 'Carry it. You need it for tax-free shopping too.' }
];

export const PHARMACY_INTRO = 'Matsumoto Kiyoshi, Sundrug and Welcia are well stocked and often open late. A pharmacist can recommend something. Google Lens reads labels well.';

export const PHARMACY = [
  { need: 'Headache, pain', brands: 'EVE, Bufferin, Loxonin S (stronger)' },
  { need: 'Cold, flu', brands: 'Pabron Gold, Contac 600' },
  { need: 'Fever', brands: 'Naron Ace' },
  { need: 'Stomach ache, diarrhea', brands: 'Seirogan' },
  { need: 'Nausea, motion sickness', brands: 'Anerongo, Travelmin (30 min before)' },
  { need: 'Sore throat', brands: 'Ryukakusan, Vicks drops' },
  { need: 'Indigestion', brands: "Ohta's Isan" },
  { need: 'Eye strain', brands: 'Sante FX, Rohto' },
  { need: 'Insect bites', brands: 'Muhi' },
  { need: 'Blisters', brands: 'Band-Aid, Compeed' },
  { need: 'Sleep', brands: 'Drewell (no melatonin in Japan)' }
];

export const PHARMACY_NOTES = 'Pseudoephedrine (Sudafed) is restricted, and Lactaid isn’t sold. This list is for orientation, not medical advice.';
