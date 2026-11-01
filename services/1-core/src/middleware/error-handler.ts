import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppEnv } from '../index';

// Manejo centralizado de errores → formato {data, error, meta}
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error(`[${c.get('requestId')}]`, err);

  const rawStatus = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  // Solo códigos de error HTTP válidos; cualquier otro valor se trata como 500
  const status: ContentfulStatusCode =
    rawStatus >= 400 && rawStatus <= 599 ? (rawStatus as ContentfulStatusCode) : 500;
  const isServerError = status >= 500;
  const code =
    !isServerError && 'code' in err && typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';

  // En 5xx nunca se expone el mensaje interno (puede traer PII o detalles de BD — Ley 1581)
  const message = isServerError ? 'Error interno del servidor' : err.message || 'Solicitud inválida';

  return c.json({
    data: null,
    error: {
      code,
      message,
    },
    meta: null,
  }, status);
};
