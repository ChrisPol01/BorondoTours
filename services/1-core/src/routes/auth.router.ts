import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { LoginSchema, RegisterSchema } from '@borondo/contracts';
import type { AppEnv } from '../index';

export const authRouter = new Hono<AppEnv>();

authRouter.post('/register', zValidator('json', RegisterSchema), async (c) => {
  const input = c.req.valid('json');
  // TODO: implementar registro
  return c.json({ data: { message: 'registered' }, error: null, meta: null }, 201);
});

authRouter.post('/login', zValidator('json', LoginSchema), async (c) => {
  const input = c.req.valid('json');
  // TODO: implementar login + JWT
  return c.json({ data: { accessToken: '...', user: {} }, error: null, meta: null });
});
