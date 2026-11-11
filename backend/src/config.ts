try {
  process.loadEnvFile(); // local .env only; on Render env comes from the dashboard
} catch {
  /* no .env file */
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const dbSchema = env.DB_SCHEMA ?? 'train_booking';
// interpolated into SQL identifiers, so it must be a plain identifier
if (!/^[a-z_][a-z0-9_]*$/.test(dbSchema)) throw new Error('DB_SCHEMA must be a lowercase identifier');

if (isProd && !env.JWT_SECRET) throw new Error('JWT_SECRET is required in production');

export const config = {
  isProd,
  port: Number(env.PORT ?? 5130),
  databaseUrl: env.DATABASE_URL,
  dbSchema,
  // dev fallback is random per process, so tokens simply expire on restart
  jwtSecret: env.JWT_SECRET ?? crypto.randomUUID(),
  frontendUrls: (env.FRONTEND_URL ?? 'http://localhost:5215')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  adminPassword: env.ADMIN_PASSWORD,
};
