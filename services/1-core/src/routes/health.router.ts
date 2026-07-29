import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import type { AppEnv } from '../index';

export const healthRouter = new Hono<AppEnv>();

healthRouter.get('/health', async (c) => {
  const db = c.get('db');
  let dbOk = false;

  try {
    await db.execute(sql`SELECT 1`);
    dbOk = true;
  } catch { /* db down */ }

  const status = dbOk ? 200 : 503;
  return c.json({
    data: { status: dbOk ? 'ok' : 'degraded', db: dbOk },
    error: null,
    meta: null,
  }, status);
});
