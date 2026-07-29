import type { Context, Next } from 'hono'
import { type Role } from '@borondo/contracts'

/**
 * Higher-Order Function para RBAC.
 * Uso: app.use('/admin/*', requireRoles('SUPER_ADMIN', 'GERENTE'))
 *
 * Verifica que el usuario autenticado tenga al menos uno de los roles permitidos.
 */
export function requireRoles(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    // TODO: Obtener user del contexto (previamente seteado por authMiddleware)
    // const user = c.get('user')
    // if (!user || !roles.includes(user.role)) { ... }

    await next()
  }
}
