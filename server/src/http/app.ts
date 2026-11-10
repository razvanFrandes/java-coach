import express, { type ErrorRequestHandler, type Response } from 'express';
import { z } from 'zod';
import type { AnalyzeCv } from '../application/analyze-cv';
import { CoachFailedError, CoachTimeoutError } from '../application/errors';

const analyzeRequestSchema = z.object({
  cvText: z.string().min(50).max(100_000),
});

interface AppDependencies {
  analyzeCv: Pick<AnalyzeCv, 'execute'>;
}

/** Builds the Express app. No listening here, so tests can call it with supertest. */
export function createApp({ analyzeCv }: AppDependencies) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/coach/analyze', async (req, res) => {
    const parsed = analyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, 'INVALID_REQUEST', 'cvText must be a string of 50 to 100000 characters.');
      return;
    }
    res.json(await analyzeCv.execute(parsed.data.cvText));
  });

  app.use('/api', (_req, res) => {
    sendError(res, 404, 'NOT_FOUND', 'There is no such API route.');
  });

  app.use(errorHandler);
  return app;
}

/** Turns every thrown error into the `{ error: { code, message } }` shape from docs/api-contract.md. */
const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof CoachTimeoutError) {
    sendError(res, 504, 'COACH_TIMEOUT', error.message);
  } else if (error instanceof CoachFailedError) {
    sendError(res, 502, 'COACH_FAILED', error.message);
  } else if (isBodyParserError(error, 'entity.too.large')) {
    sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'The request body must be at most 1 MB.');
  } else if (isBodyParserError(error, 'entity.parse.failed')) {
    sendError(res, 400, 'INVALID_REQUEST', 'The request body is not valid JSON.');
  } else {
    console.error(error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on the server.');
  }
};

function isBodyParserError(error: unknown, type: string): boolean {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === type;
}

function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ error: { code, message } });
}
