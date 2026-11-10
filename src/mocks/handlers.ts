import { delay, http, HttpResponse } from 'msw';
import type { AnalyzeCvResponse } from '@/types/api';
import { sampleReport } from './data/coach-report';

/**
 * Fake answers for the server's API. Used in two places:
 * - mock mode in the browser (VITE_ENABLE_API_MOCKING=true, see src/main.tsx)
 * - every test, through src/testing/server.ts
 */
export const handlers = [
  http.post('/api/coach/analyze', async () => {
    await delay(); // a realistic pause in the browser, none in tests
    return HttpResponse.json<AnalyzeCvResponse>({ report: sampleReport, cached: false });
  }),
];
