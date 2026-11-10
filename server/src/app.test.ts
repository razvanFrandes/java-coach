import request from 'supertest';
import { createApp } from './app';
import { analyzeCv } from './services/coach.service';
import type { AnalyzeResult } from './types';
import { HttpError } from './utils/http-error';

// The HTTP layer is tested on its own: the coach service is a mock.
vi.mock('./services/coach.service', () => ({ analyzeCv: vi.fn() }));

const result: AnalyzeResult = {
  report: { summary: 'A junior developer.', skills: [], gaps: [], learningPath: [] },
  cached: false,
};
const cvText = 'Junior Java developer with Spring Boot, JUnit 5, Maven and PostgreSQL experience.';
const app = createApp();

describe('HTTP API', () => {
  beforeEach(() => {
    vi.mocked(analyzeCv).mockReset().mockResolvedValue(result);
  });

  it('AC24: reports health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('AC25: analyses a CV', async () => {
    const response = await request(app).post('/api/coach/analyze').send({ cvText });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
    expect(analyzeCv).toHaveBeenCalledWith(cvText);
  });

  it.each([
    ['missing', {}],
    ['not a string', { cvText: 42 }],
    ['too short', { cvText: 'Java' }],
    ['too long', { cvText: 'a'.repeat(100_001) }],
  ])('AC26/AC31: rejects a cvText that is %s', async (_case, body) => {
    const response = await request(app).post('/api/coach/analyze').send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
    expect(typeof response.body.error.message).toBe('string');
    expect(analyzeCv).not.toHaveBeenCalled();
  });

  it('AC26: rejects malformed JSON', async () => {
    const response = await request(app)
      .post('/api/coach/analyze')
      .set('Content-Type', 'application/json')
      .send('{"cvText": ');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('AC27: rejects a body over 1 MB', async () => {
    const response = await request(app)
      .post('/api/coach/analyze')
      .send({ cvText: 'a'.repeat(1_100_000) });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it.each([
    [502, 'COACH_FAILED', 'Codex failed: not logged in'],
    [504, 'COACH_TIMEOUT', 'Codex did not answer within 180 seconds.'],
  ])('AC28: answers an HttpError with its status %s', async (status, code, message) => {
    vi.mocked(analyzeCv).mockRejectedValue(new HttpError(status, code, message));

    const response = await request(app).post('/api/coach/analyze').send({ cvText });

    expect(response.status).toBe(status);
    expect(response.body).toEqual({ error: { code, message } });
  });

  it('AC29: hides unexpected errors behind a generic 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(analyzeCv).mockRejectedValue(new Error('SQLITE_BUSY'));

    const response = await request(app).post('/api/coach/analyze').send({ cvText });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' },
    });
  });

  it('AC30: answers unknown API routes with 404', async () => {
    const response = await request(app).get('/api/nope');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
