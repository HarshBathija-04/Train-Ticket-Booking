import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';

export interface AuthUser {
  id: number;
  role: 'USER' | 'ADMIN';
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, config.jwtSecret, { subject: String(user.id), expiresIn: '7d' });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'UNAUTHENTICATED', 'Please sign in'));
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    req.user = { id: Number(payload.sub), role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER' };
    next();
  } catch {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Your session has expired, please sign in again'));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) =>
  req.user?.role === 'ADMIN' ? next() : next(new HttpError(403, 'FORBIDDEN', 'Admin access required'));
