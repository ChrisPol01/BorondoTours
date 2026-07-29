import type { ErrorHandler } from 'hono';
import type { AppEnv } from '../index';

// Manejo centralizado de errores → formato {data, error, meta}
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error(`[${c.get('requestId')}]`, err);

  const status = 'status' in err ? (err as any).status : 500;
  const code = 'code' in err ? (err as any).code : 'INTERNAL_ERROR';

  return c.json({
    data: null,
    error: {
      code,
      message: err.message || 'Error interno del servidor',
    },
    meta: null,
  }, status);
};
