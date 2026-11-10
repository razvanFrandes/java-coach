import { http, HttpResponse } from 'msw';
import { server } from '@/testing/server';
import { apiPost } from './api-client';

describe('apiPost', () => {
  it('AC5: sends the body as JSON and returns the JSON answer', async () => {
    let received: unknown;
    server.use(
      http.post('/api/echo', async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(apiPost('/api/echo', { hello: 'world' })).resolves.toEqual({ ok: true });
    expect(received).toEqual({ hello: 'world' });
  });

  it("AC6: fails with the server's error message", async () => {
    server.use(
      http.post('/api/echo', () =>
        HttpResponse.json(
          { error: { code: 'COACH_TIMEOUT', message: 'Codex did not answer within 180 seconds.' } },
          { status: 504 },
        ),
      ),
    );

    await expect(apiPost('/api/echo', {})).rejects.toThrow(
      'Codex did not answer within 180 seconds.',
    );
  });

  it('AC6: falls back to the status when the error body is not the expected JSON', async () => {
    server.use(http.post('/api/echo', () => new HttpResponse('Bad gateway', { status: 502 })));

    await expect(apiPost('/api/echo', {})).rejects.toThrow('The server answered with status 502.');
  });

  it('AC6: says so when the server cannot be reached', async () => {
    server.use(http.post('/api/echo', () => HttpResponse.error()));

    await expect(apiPost('/api/echo', {})).rejects.toThrow('Could not reach the coach server.');
  });
});
