// Vitest config for the API/integration suites under tests/api/ (excluded
// from the default unit config). Uses mongodb-memory-server via setup.js.
// Run: npm run test:api  (or npx vitest run --config vitest.api.config.js)
import { defineConfig } from 'vitest/config';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [viteCommonjs()],
  test: {
    include: ['tests/api/**/*.test.js'],
    exclude: ['node_modules/**'],
    setupFiles: ['./tests/api/setup.js'],
    globals: true,
    environment: 'node',
    hookTimeout: 60000,
    testTimeout: 30000,
    // API suites share one in-memory Mongo per file; keep files sequential to
    // avoid port/instance churn on Windows.
    fileParallelism: false,
  },
});
