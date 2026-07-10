

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.css';

// Enable mock service worker in development
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  // Optional: Setup MSW for API mocking
  // const { worker } = await import('./mocks/browser');
  // return worker.start();
}

enableMocking().then(() => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
