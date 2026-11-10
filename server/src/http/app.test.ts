import request from 'supertest';
import type { CoachReport } from '@/domain/types';
import { CoachFailedError, CoachTimeoutError } from '../application/errors';
import { createApp } from './app';

const report: CoachReport = { summary: 'A junior developer.', assessments: [], steps: [] };
const cvText = 'Junior Java developer with Spring Boot, JUnit 5, Maven and PostgreSQL experience.';

function appWith(execute: (cvText: string) => Promise<{ report: CoachReport; cached: boolean }>) {
  return createApp({ analyzeCv: { execute: vi.fn(execute) } });
}

const ok = () => Promise.resolve({ report, cached: false });

describe('HTTP API', () => {
  it('AC15: reports health', async () => {
    const response = await request(appWith(ok)).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('AC16: analyses a CV', async () => {
    const execute = vi.fn(ok);
    const response = await request(createApp({ analyzeCv: { execute } }))
      .post('/api/coach/analyze')
      .send({ cvText });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ report, cached: false });
    expect(execute).toHaveBeenCalledWith(cvText);
  });

  it.each([
    ['missing', {}],
    ['not a string', { cvText: 42 }],
    ['too short', { cvText: 'Java' }],
    ['too long', { cvText: 'a'.repeat(100_001) }],
  ])('AC17/AC20: rejects a cvText that is %s', async (_case, body) => {
    const response = await request(appWith(ok)).post('/api/coach/analyze').send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
    expect(typeof response.body.error.message).toBe('string');
  });

  it('AC17: rejects malformed JSON', async () => {
    const response = await request(appWith(ok))
      .post('/api/coach/analyze')
      .set('Content-Type', 'application/json')
      .send('{"cvText": ');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('AC18: rejects a body over 1 MB', async () => {
    const response = await request(appWith(ok))
      .post('/api/coach/analyze')
      .send({ cvText: 'a'.repeat(1_100_000) });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('AC19: reports a coach failure as 502 with the reason', async () => {
    const response = await request(
      appWith(() => Promise.reject(new CoachFailedError('Codex failed: Not logged in'))),
    )
      .post('/api/coach/analyze')
      .send({ cvText });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: { code: 'COACH_FAILED', message: 'Codex failed: Not logged in' },
    });
  });

  it('AC19: reports a coach timeout as 504', async () => {
    const response = await request(appWith(() => Promise.reject(new CoachTimeoutError(180_000))))
      .post('/api/coach/analyze')
      .send({ cvText });

    expect(response.status).toBe(504);
    expect(response.body.error).toEqual({
      code: 'COACH_TIMEOUT',
      message: 'Codex did not answer within 180 seconds.',
    });
  });

  it('AC20: hides unexpected errors behind a generic 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(appWith(() => Promise.reject(new Error('SQLITE_BUSY'))))
      .post('/api/coach/analyze')
      .send({ cvText });

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on the server.',
    });
  });

  it('AC21: answers unknown API routes with 404', async () => {
    const response = await request(appWith(ok)).get('/api/nope');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
