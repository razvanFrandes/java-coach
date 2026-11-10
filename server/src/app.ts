import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { coachRoutes } from './routes/coach.routes';
import { HttpError } from './utils/http-error';

/** Builds the Express app. It does not listen, so tests can call it with supertest. */
export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/coach', coachRoutes);

  app.use('/api', () => {
    throw new HttpError(404, 'NOT_FOUND', 'There is no such API route.');
  });
  app.use(errorHandler);
  return app;
}
