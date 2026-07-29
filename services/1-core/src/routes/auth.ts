import { Hono } from 'hono'

export const authRoutes = new Hono()

// TODO: Implementar — Login, registro, JWT, OAuth, OTP
authRoutes.post('/login', (c) => {
  return c.json({ data: null, error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' }, meta: null }, 501)
})

authRoutes.post('/register', (c) => {
  return c.json({ data: null, error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' }, meta: null }, 501)
})
