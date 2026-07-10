// Vitest config — server is plain CommonJS, Vite/Vitest wants ESM. We use
// @originjs/vite-plugin-commonjs so Vite can transform the server's
// require()/module.exports source files on the fly.
//
// E0 runs unit tests only (`tests/unit/`, top-level pure-logic tests).
// Integration tests under `tests/api/` belong to later epics (E1-E4) and
// require supertest + a live MongoDB instance — they're staged here but
// excluded from the default `npm test` run until those epics land.
import { defineConfig } from 'vitest/config';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [viteCommonjs()],
  test: {
    include: ['tests/**/*.test.js', 'utils/**/*.test.js'],
    exclude: ['tests/api/**', 'node_modules/**'],
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
  },
});