import { render } from 'preact';
import './styles.css';
import { App } from './app';
import { persistStorage } from './lib/db';
import { applyTextSize, getSettings } from './lib/settings';
import { startSync } from './lib/sync';

applyTextSize(getSettings().textSize);
persistStorage();
startSync();
render(<App />, document.getElementById('app')!);
