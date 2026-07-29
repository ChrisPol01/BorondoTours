import { createMiddleware } from 'hono/factory';
import { createClient } from '@borondo/db';
import type { AppEnv } from '../index';

// Inyecta dependencias al contexto de Hono (DI sin librerías)
// El cliente de BD se crea una vez y se reutiliza entre invocaciones Lambda (singleton)
export const injectDeps = createMiddleware<AppEnv>(async (c, next) => {
  c.set('db', createClient());
  await next();
});
