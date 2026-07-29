import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono().basePath('/api/v1')

app.use('*', logger())
app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ data: { status: 'ok', service: 'payments' }, error: null, meta: null })
})

// TODO: Webhook Onepayla, split fare, dispersión
app.post('/webhooks/onepayla', (c) => {
  // Validar HMAC, idempotencia, procesar evento
  return c.json({ data: { received: true }, error: null, meta: null })
})

app.onError((err, c) => {
  console.error(`[service-payments] ${err.message}`)
  return c.json({ data: null, error: { message: err.message, code: 'INTERNAL_ERROR' }, meta: null }, 500)
})

export { app }
