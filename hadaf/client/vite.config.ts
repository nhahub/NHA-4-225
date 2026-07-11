import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind IPv4 explicitly. Without this, Vite's default on Windows binds
    // to IPv6 `::1` only, and browsers that resolve `localhost` to
    // `127.0.0.1` (or axios calls that go IPv4-first) hit a refused
    // connection → "errors.networkError" fallback in the API client.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Same-origin dev: the browser only ever talks to the Vite origin
    // (http://127.0.0.1:5173) and Vite forwards /api/* to the Express server.
    // This eliminates the cross-site condition (127.0.0.1 client ↔ localhost
    // API) that stopped auth cookies from being sent, so httpOnly access/
    // refresh cookies now flow as first-party. No CORS is exercised in the
    // browser. VITE_API_URL is set to the relative "/api" to match.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});