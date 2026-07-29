import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { usersRoutes } from './routes/users'
import { healthRoutes } from './routes/health'

const app = new Hono().basePath('/api/v1')

// Middleware global
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/health', healthRoutes)
app.route('/auth', authRoutes)
app.route('/users', usersRoutes)

// Error handler centralizado → formato {data, error, meta}
app.onError((err, c) => {
  console.error(`[service-core] ${err.message}`, err.stack)
  return c.json(
    {
      data: null,
      error: { message: err.message, code: 'INTERNAL_ERROR' },
      meta: { timestamp: new Date().toISOString() },
    },
    500
  )
})

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      data: null,
      error: { message: 'Not found', code: 'NOT_FOUND' },
      meta: { timestamp: new Date().toISOString() },
    },
    404
  )
})

export { app }
