import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const builtAt = new Date().toISOString();

// Live calls fall back to the cache when offline. GitHub (sync) is never cached by the worker.
const networkFirst = (name: string, pattern: RegExp, maxAgeDays: number) => ({
  urlPattern: pattern,
  handler: 'NetworkFirst' as const,
  options: {
    cacheName: name,
    networkTimeoutSeconds: 6,
    expiration: { maxEntries: 60, maxAgeSeconds: maxAgeDays * 86400 },
    cacheableResponse: { statuses: [0, 200] }
  }
});

export default defineConfig({
  base: '/japan-trip-tools/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILT_AT__: JSON.stringify(builtAt)
  },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Japan Trip Companion',
        short_name: 'Japan',
        description: 'What to say, do, or pay, right now. Works offline.',
        start_url: '/japan-trip-tools/',
        scope: '/japan-trip-tools/',
        display: 'standalone',
        background_color: '#faf7f2',
        theme_color: '#b7282e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,webmanifest,mp3}'],
        navigateFallback: '/japan-trip-tools/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          networkFirst('rates', /^https:\/\/(api\.frankfurter\.(app|dev)|open\.er-api\.com)\//, 30),
          networkFirst('weather', /^https:\/\/api\.open-meteo\.com\//, 10),
          networkFirst('overpass', /^https:\/\/(overpass-api\.de|overpass\.kumi\.systems|overpass\.private\.coffee)\//, 2)
        ]
      }
    })
  ]
});
