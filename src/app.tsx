import { ShowCardOverlay } from './components/ShowCardOverlay';
import { StatusPills } from './components/StatusPills';
import { UpdatePrompt } from './components/UpdatePrompt';
import { href, useRoute } from './lib/router';
import { Cards } from './routes/Cards';
import { Currency } from './routes/Currency';
import { Emergency } from './routes/Emergency';
import { Etiquette } from './routes/Etiquette';
import { More } from './routes/More';
import { Phrases } from './routes/Phrases';
import { Purchases } from './routes/Purchases';
import { Settings } from './routes/Settings';
import { Shopping } from './routes/Shopping';
import { Today } from './routes/Today';

const NAV = [
  { path: '', label: 'Today', ic: '☀︎' },
  { path: 'phrases', label: 'Phrases', ic: '💬' },
  { path: 'cards', label: 'Cards', ic: '🪪' },
  { path: 'etiquette', label: 'Etiquette', ic: '🙇' },
  { path: 'more', label: 'More', ic: '☰' }
];
const IN_MORE = new Set(['more', 'currency', 'emergency', 'settings', 'shopping', 'purchases']);

export function App() {
  const route = useRoute();
  const p = route.path;
  let page;
  switch (p) {
    case 'phrases': page = <Phrases route={route} />; break;
    case 'cards': page = <Cards />; break;
    case 'etiquette': page = <Etiquette route={route} />; break;
    case 'currency': page = <Currency />; break;
    case 'emergency': page = <Emergency />; break;
    case 'more': page = <More />; break;
    case 'settings': page = <Settings />; break;
    case 'shopping': page = <Shopping />; break;
    case 'purchases': page = <Purchases route={route} />; break;
    default: page = <Today />;
  }
  const current = IN_MORE.has(p) ? 'more' : NAV.some((n) => n.path === p) ? p : '';
  return (
    <div class="app">
      <main>
        <StatusPills />
        {page}
      </main>
      <nav class="nav" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.path} href={href(n.path)} aria-current={current === n.path ? 'page' : undefined}>
            <span class="ic" aria-hidden="true">{n.ic}</span>{n.label}
          </a>
        ))}
      </nav>
      <UpdatePrompt />
      <ShowCardOverlay />
    </div>
  );
}
