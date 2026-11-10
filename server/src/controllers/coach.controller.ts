import type { Request, Response } from 'express';
import { analyzeRequestSchema } from '../schemas/coach.schemas';
import { analyzeCv } from '../services/coach.service';
import { HttpError } from '../utils/http-error';

/** POST /api/coach/analyze: check the body, let the service do the work, send the result. */
export async function analyze(req: Request, res: Response) {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(
      400,
      'INVALID_REQUEST',
      'cvText must be a string of 50 to 100000 characters.',
    );
  }

  res.json(await analyzeCv(parsed.data.cvText));
}
