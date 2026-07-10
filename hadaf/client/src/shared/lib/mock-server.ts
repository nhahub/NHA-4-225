// mock-server.ts — DEPRECATED. The real backend is wired in this app
// (Express endpoints under /api/*), and VITE_USE_MOCK=true should not be set
// in any environment that matters. We keep this file as an intentional no-op
// stub so legacy imports (api-client.ts's `setupMockServer` reference) keep
// compiling without serving Impulse-shaped fixtures into the new Task model.
//
// If you actually need offline development later, build a fresh mock fixture
// against the real Task schema and replace this file.
import { AxiosInstance } from 'axios';

export const setupMockServer = (_axios: AxiosInstance): void => {
  if (import.meta.env.DEV) {
    console.warn(
      '[mock-server] VITE_USE_MOCK=true was set, but no fixtures are wired. ' +
        'The real backend endpoints are used instead. Rebuild mocks against the ' +
        'current Task schema before relying on this for development.',
    );
  }
};
