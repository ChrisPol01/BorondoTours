import type { Context, Next } from 'hono'

/**
 * Middleware de autenticación JWT.
 * Valida el Bearer token y adjunta el usuario al contexto.
 * TODO: Implementar validación real con JWT RS256
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }, meta: null },
      401
    )
  }

  // TODO: Validar JWT, extraer payload, set en contexto
  // c.set('user', decodedPayload)

  await next()
}
