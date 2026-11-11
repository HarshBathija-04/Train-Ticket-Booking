import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { HttpError } from '../lib/errors.js';
import { requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email')).pipe(z.string().max(150));
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,14}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

const publicUser = 'id, name, email, phone, role';

authRouter.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body);
  const hash = await bcrypt.hash(body.password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING RETURNING ${publicUser}`,
    [body.name, body.email, hash, body.phone ?? null],
  );
  if (!rows[0]) throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
});

authRouter.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);
  const { rows } = await pool.query(`SELECT ${publicUser}, password_hash FROM users WHERE email = $1`, [body.email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
  }
  delete user.password_hash;
  res.json({ token: signToken(user), user });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(`SELECT ${publicUser} FROM users WHERE id = $1`, [req.user!.id]);
  if (!rows[0]) throw new HttpError(401, 'UNAUTHENTICATED', 'Account no longer exists');
  res.json({ user: rows[0] });
});
