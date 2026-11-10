import { CV_TEXT } from '@/testing/fixtures/files';
import { sampleReport } from './data/coach-report';

// The test server (src/testing/server.ts) is built from the same handlers as mock mode.
describe('mock handlers', () => {
  it('AC19: answer POST /api/coach/analyze with the sample report', async () => {
    const response = await fetch(new URL('/api/coach/analyze', window.location.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText: CV_TEXT }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ report: sampleReport, cached: false });
  });
});
