import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** MSW in the browser. Started by src/main.tsx only in mock mode. */
export const worker = setupWorker(...handlers);
