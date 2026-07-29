import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono().basePath('/api/v1')

app.use('*', logger())
app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ data: { status: 'ok', service: 'ads' }, error: null, meta: null })
})

// TODO: Banners, rewarded ads, tracking, métricas
app.get('/ads/active', (c) => {
  return c.json({ data: [], error: null, meta: null })
})

app.onError((err, c) => {
  console.error(`[service-ads] ${err.message}`)
  return c.json({ data: null, error: { message: err.message, code: 'INTERNAL_ERROR' }, meta: null }, 500)
})

export { app }
