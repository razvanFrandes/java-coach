import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { sampleReport } from '@/test/fixtures/coach-report';
import { HttpCoachService } from './http-coach-service';

const coach = new HttpCoachService();

describe('HttpCoachService', () => {
  it('AC9: posts the CV text and returns the report from the response', async () => {
    let receivedBody: unknown;
    server.use(
      http.post('*/api/coach/analyze', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ report: sampleReport });
      }),
    );

    const report = await coach.analyzeCv('my cv text');

    expect(receivedBody).toEqual({ cvText: 'my cv text' });
    expect(report).toEqual(sampleReport);
  });

  it("AC10: throws the server's message when it answers with an error status", async () => {
    server.use(
      http.post('*/api/coach/analyze', () =>
        HttpResponse.json(
          { error: { code: 'CV_TOO_LONG', message: 'The CV text is too long.' } },
          { status: 422 },
        ),
      ),
    );

    await expect(coach.analyzeCv('x')).rejects.toThrow('The CV text is too long.');
  });

  it('AC10: falls back to the status code when the error has no JSON body', async () => {
    server.use(http.post('*/api/coach/analyze', () => new HttpResponse('boom', { status: 502 })));

    await expect(coach.analyzeCv('x')).rejects.toThrow(
      'The coach server answered with status 502.',
    );
  });

  it('AC10: explains when the server cannot be reached', async () => {
    server.use(http.post('*/api/coach/analyze', () => HttpResponse.error()));

    await expect(coach.analyzeCv('x')).rejects.toThrow('Could not reach the coach server.');
  });
});
