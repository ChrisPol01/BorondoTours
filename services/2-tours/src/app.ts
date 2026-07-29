import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono().basePath('/api/v1')

app.use('*', logger())
app.use('*', cors())

// Health
app.get('/health', (c) => {
  return c.json({ data: { status: 'ok', service: 'tours' }, error: null, meta: null })
})

// TODO: Catálogo, búsqueda pg_trgm, instancias, disponibilidad
app.get('/tours', (c) => {
  return c.json({ data: [], error: null, meta: { page: 1, total: 0 } })
})

app.onError((err, c) => {
  console.error(`[service-tours] ${err.message}`)
  return c.json({ data: null, error: { message: err.message, code: 'INTERNAL_ERROR' }, meta: null }, 500)
})

export { app }
