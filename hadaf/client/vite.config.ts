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
  },
});