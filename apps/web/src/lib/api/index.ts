/**
 * Punto de entrada de la capa de datos del Portal B2C (Fase 1).
 *
 * Reexporta el cliente de fetch, la configuración de TanStack Query, los
 * errores tipados y los helpers de mapeo `snake_case` ↔ `camelCase`.
 */

export {
  apiFetch,
  parseApiResponse,
  DEFAULT_TIMEOUT_MS,
  type HttpMethod,
  type RequestOptions,
} from "./client";

export {
  createQueryClient,
  defaultQueryOptions,
  catalogQueryDefaults,
  shouldRetry,
  retryDelay,
  CATALOG_STALE_TIME_MS,
  MAX_QUERY_RETRIES,
} from "./queryClient";

export {
  ApiClientError,
  isApiClientError,
  resolveErrorI18nKey,
  isRetryableError,
  ERROR_I18N_KEYS,
  type ApiErrorKind,
  type ErrorI18nKey,
  type ApiClientErrorInit,
} from "./errors";

export { camelizeKeysDeep, snakeToCamelKey, isPlainObject } from "./mapping";
