import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __APP_VERSION__: '"test"', __BUILT_AT__: '"test"' },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }
});
