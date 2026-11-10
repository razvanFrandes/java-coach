import type { ErrorRequestHandler, Response } from 'express';
import { HttpError } from '../utils/http-error';

/**
 * Last middleware in app.ts. Turns every error into `{ error: { code, message } }`
 * (see docs/api-contract.md). Express 5 sends errors from async controllers here too.
 */
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    sendError(res, error.status, error.code, error.message);
  } else if (isBodyParserError(error, 'entity.too.large')) {
    sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'The request body must be at most 1 MB.');
  } else if (isBodyParserError(error, 'entity.parse.failed')) {
    sendError(res, 400, 'INVALID_REQUEST', 'The request body is not valid JSON.');
  } else {
    console.error(error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong on the server.');
  }
};

/** express.json() marks its errors with a `type`, e.g. "entity.too.large". */
function isBodyParserError(error: unknown, type: string): boolean {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === type;
}

function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ error: { code, message } });
}
