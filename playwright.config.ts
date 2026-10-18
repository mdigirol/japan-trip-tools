import { defineConfig, devices } from '@playwright/test';

// Runs against the production build (service worker included) via `vite preview`.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:4173/japan-trip-tools/', ...devices['iPhone 13'], browserName: 'chromium', serviceWorkers: 'allow' },
  webServer: { command: 'npx vite build && npx vite preview --port 4173 --strictPort', port: 4173, reuseExistingServer: !process.env.CI, timeout: 120_000 }
});
