import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { env } from './config/env';
import './index.css';

/** In mock mode MSW answers the API in the browser, so the server is not needed. */
async function enableMocking() {
  if (!env.ENABLE_API_MOCKING) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('index.html must contain <div id="root">');

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
