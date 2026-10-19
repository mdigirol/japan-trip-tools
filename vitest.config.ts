import { defineConfig } from 'vitest/config';
import { dataPlugin } from './scripts/build-env';

// Scenario tests (Today, konbini, content) always run on the sample itinerary, so they pass in any repo.
// Tests that guard the real data read it directly (tests/unit/trip.test.ts).
export default defineConfig({
  plugins: [dataPlugin('sample')],
  define: { __APP_VERSION__: '"test"', __BUILT_AT__: '"test"' },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }
});
