import { Hono } from 'hono';
import type { AppEnv } from '../index';

export const usersRouter = new Hono<AppEnv>();

usersRouter.get('/me', async (c) => {
  const user = c.get('currentUser');
  // TODO: fetch user profile from DB
  return c.json({ data: user, error: null, meta: null });
});
