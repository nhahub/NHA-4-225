// Vitest config for integration tests under tests/api/** (supertest +
// mongodb-memory-server). Split from vitest.config.js so the fast unit
// suite (`npm test`) stays fast, while `npm run test:api` exercises full
// HTTP round-trips against an in-memory Mongo instance.
import { defineConfig } from 'vitest/config';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [viteCommonjs()],
  test: {
    include: ['tests/api/**/*.test.js'],
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
    testTimeout: 20000,
  },
});
