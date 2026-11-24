import { app } from './app'

export type { AppEnv } from './app-env'

const port = Number(process.env.PORT) || 3001

console.log(`[service-core] listening on http://localhost:${port}`)

// Bun sirve el export por defecto ({ port, fetch }) al ejecutar `bun --hot src/index.ts`.
export default {
  port,
  fetch: app.fetch,
}
