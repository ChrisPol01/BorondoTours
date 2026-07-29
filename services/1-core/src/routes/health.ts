import { Hono } from 'hono'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) => {
  return c.json({
    data: { status: 'ok', service: 'core', timestamp: new Date().toISOString() },
    error: null,
    meta: null,
  })
})
