// Vitest config — server is plain CommonJS, Vite/Vitest wants ESM. We use
// @originjs/vite-plugin-commonjs so Vite can transform the server's
// require()/module.exports source files on the fly.
import { defineConfig } from 'vitest/config';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [viteCommonjs()],
  test: {
    include: ['tests/**/*.test.js', 'utils/**/*.test.js'],
    globals: true,
    environment: 'node',
    setupFiles: ['tests/api/setup.js'],
    hookTimeout: 30000,
  },
});