import { defineConfig, devices } from '@playwright/test';
import { basePath } from './scripts/build-env';

// Runs against a production build (service worker included) of the SAMPLE itinerary, via `vite preview`.
// The build goes to dist-e2e so it never overwrites the real build in dist.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:4173${basePath()}`, ...devices['iPhone 13'], browserName: 'chromium', serviceWorkers: 'allow' },
  webServer: {
    command: 'npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port 4173 --strictPort',
    // No sync repo, whatever a local .env says.
    env: { TRIP_DATA: 'sample', VITE_DATA_REPO: '' },
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
