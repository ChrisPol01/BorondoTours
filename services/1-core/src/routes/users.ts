import { Hono } from 'hono'

export const usersRoutes = new Hono()

// TODO: Implementar — CRUD usuarios, perfil, onboarding
usersRoutes.get('/me', (c) => {
  return c.json({ data: null, error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' }, meta: null }, 501)
})
