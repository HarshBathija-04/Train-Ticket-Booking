import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { errorHandler, notFound } from './lib/errors.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { bookingsRouter } from './routes/bookings.js';
import { trainsRouter } from './routes/trains.js';

const limit = (max: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  });

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // Render terminates TLS in front of us
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.frontendUrls, maxAge: 86400 }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'ok' });
    } catch {
      res.status(503).json({ status: 'error', db: 'error' });
    }
  });

  app.use('/api', limit(300));
  app.use('/api/auth', limit(30), authRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', trainsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
