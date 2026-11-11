import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (req, _res, next) =>
  next(new HttpError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  // malformed JSON body from express.json()
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'BAD_JSON', message: 'Malformed JSON body' } });
    return;
  }
  // body-parser errors (e.g. 413 payload too large) carry a safe 4xx status
  if (err?.expose && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: { code: 'BAD_REQUEST', message: err.message } });
    return;
  }
  // unique violation on a race (e.g. PNR collision, seat taken) -> retryable conflict
  if (err?.code === '23505' || err?.code === '23514') {
    res
      .status(409)
      .json({ error: { code: 'CONFLICT', message: 'That conflicted with another booking, please try again' } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
};
