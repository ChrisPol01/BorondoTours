/**
 * Errores tipados de la capa de datos del Portal B2C (Fase 1).
 *
 * TypeScript strict, sin `any`. Fuente: design.md §"Error Handling" y
 * Requirements 21.3, 21.6.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Principio de seguridad (07-legal-compliance)
 * ─────────────────────────────────────────────────────────────────────────
 * El mensaje mostrado al usuario SIEMPRE proviene de i18n (`t('common:error.*')`),
 * NUNCA del campo `error.message` crudo del backend. `ApiClientError` transporta:
 *   - `code`   → código de máquina (para lógica/telemetría; p. ej. `"timeout"` o
 *                el `error.code` del backend). Nunca se muestra tal cual al usuario.
 *   - `i18nKey`→ clave i18n ACOTADA que la UI resuelve con `t()` para mostrar un
 *                mensaje seguro y traducible. Es lo único apto para pantalla.
 * El `message` del `Error` es técnico y está pensado solo para logs de desarrollo.
 */

// ─────────────────────────────────────────────────────────────────────────
// Clasificación del error
// ─────────────────────────────────────────────────────────────────────────

/**
 * Naturaleza del fallo, usada para decidir reintentos y la clave i18n:
 *   - `timeout` → la petición superó el límite de 10s (R21.3).
 *   - `network` → fallo de red/DNS/CORS antes de obtener respuesta.
 *   - `http`    → respuesta con status HTTP fuera del rango 2xx.
 *   - `backend` → status 2xx pero el sobre `{ data, error, meta }` trae `error != null`.
 *   - `parse`   → el cuerpo no es un sobre `{ data, error, meta }` válido.
 */
export type ApiErrorKind = "timeout" | "network" | "http" | "backend" | "parse";

/**
 * Conjunto ACOTADO de claves i18n de error que la UI puede mostrar. Mantener
 * este conjunto cerrado evita filtrar códigos arbitrarios del backend a la
 * pantalla y garantiza que siempre exista una traducción bajo `common:error.*`.
 */
export const ERROR_I18N_KEYS = {
  timeout: "common:error.timeout",
  network: "common:error.network",
  notFound: "common:error.notFound",
  server: "common:error.server",
  generic: "common:error.generic",
} as const;

export type ErrorI18nKey = (typeof ERROR_I18N_KEYS)[keyof typeof ERROR_I18N_KEYS];

/** Datos de construcción de un `ApiClientError`. */
export interface ApiClientErrorInit {
  kind: ApiErrorKind;
  /** Código de máquina (backend `error.code` o el `kind` por defecto). */
  code: string;
  /** Status HTTP asociado, o `null` si no hubo respuesta (timeout/red). */
  status: number | null;
  /** Detalle técnico para logs; NUNCA se muestra al usuario. */
  detail?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Mapeo kind/status → clave i18n acotada
// ─────────────────────────────────────────────────────────────────────────

/**
 * Deriva la clave i18n segura a partir del tipo de error y el status HTTP.
 * El backend `error.code` NO se usa como clave para no filtrar códigos
 * arbitrarios; solo el `kind`/status controlado decide el mensaje visible.
 */
export function resolveErrorI18nKey(kind: ApiErrorKind, status: number | null): ErrorI18nKey {
  switch (kind) {
    case "timeout":
      return ERROR_I18N_KEYS.timeout;
    case "network":
      return ERROR_I18N_KEYS.network;
    case "http":
      if (status === 404) {
        return ERROR_I18N_KEYS.notFound;
      }
      if (status !== null && status >= 500) {
        return ERROR_I18N_KEYS.server;
      }
      return ERROR_I18N_KEYS.generic;
    case "backend":
    case "parse":
    default:
      return ERROR_I18N_KEYS.generic;
  }
}

/**
 * Indica si un fallo es reintentable. Solo se reintentan errores transitorios
 * (timeout, red y 5xx del servidor); los errores de cliente (4xx), de negocio
 * (`backend`) y de parseo NO se reintentan porque repetir no cambia el
 * resultado. TanStack Query usa esta señal para reintentar sin layout shift.
 */
export function isRetryableError(kind: ApiErrorKind, status: number | null): boolean {
  if (kind === "timeout" || kind === "network") {
    return true;
  }
  if (kind === "http") {
    return status !== null && status >= 500;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────
// Error tipado de la capa de datos
// ─────────────────────────────────────────────────────────────────────────

/**
 * Error unificado de la capa de fetch. Cualquier fallo (timeout, red, HTTP no
 * 2xx, `error != null` del backend, o cuerpo no parseable) se normaliza a esta
 * clase para que la UI y TanStack Query lo traten de forma homogénea.
 */
export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly code: string;
  readonly status: number | null;
  readonly i18nKey: ErrorI18nKey;
  readonly retryable: boolean;

  constructor(init: ApiClientErrorInit) {
    // El `message` del Error es técnico (logs/telemetría), no apto para UI.
    super(init.detail ?? `ApiClientError(${init.kind}:${init.code})`);
    this.name = "ApiClientError";
    this.kind = init.kind;
    this.code = init.code;
    this.status = init.status;
    this.i18nKey = resolveErrorI18nKey(init.kind, init.status);
    this.retryable = isRetryableError(init.kind, init.status);
    // Mantiene la cadena de prototipos correcta al transpilar a ES5/ES2015.
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

/** Type guard sin `any` para reconocer un `ApiClientError`. */
export function isApiClientError(value: unknown): value is ApiClientError {
  return value instanceof ApiClientError;
}
