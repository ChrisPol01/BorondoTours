/**
 * Cliente de fetch del Portal B2C (Fase 1).
 *
 * TypeScript strict, sin `any`. Fuente: design.md §"Estado servidor",
 * §"Flujo de datos por vista" y §"Error Handling"; Requirements 21.3, 21.6.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Contrato único de la capa de datos
 * ─────────────────────────────────────────────────────────────────────────
 * Toda respuesta del backend tiene la forma `{ data, error, meta }`
 * (`ApiResponse<T>`). `apiFetch` aplica una regla determinista:
 *
 *   1. `error !== null` O status HTTP no 2xx  → lanza `ApiClientError`
 *      (estado de error para TanStack Query).
 *   2. `data === null` y `error === null`     → devuelve `null` (estado vacío,
 *      NO es un error).
 *   3. En otro caso                            → devuelve `data` ya mapeado a
 *      `camelCase` y tipado como `T`.
 *
 * Los mensajes visibles al usuario se derivan del `i18nKey` acotado del error
 * (`common:error.*`), nunca del `error.message` crudo del backend.
 *
 * Timeout de 10s vía `AbortController` (R21.3). El cliente NO reintenta por su
 * cuenta: los reintentos los gobierna TanStack Query (ver `queryClient.ts`),
 * y los `Skeleton` reservan altura para evitar layout shift.
 */

import type { ApiResponse } from "../types";
import { ApiClientError } from "./errors";
import { camelizeKeysDeep, isPlainObject } from "./mapping";

// ─────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────

/** Timeout por defecto de una petición de datos de vista (R21.3). */
export const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Base URL de la API. Se resuelve desde una env var pública de Astro/Vite y cae
 * a `/api/v1` (mismo origen tras el CDN/reverse proxy) cuando no está definida.
 */
const API_BASE_URL: string =
  (typeof import.meta.env.PUBLIC_API_BASE_URL === "string" &&
    import.meta.env.PUBLIC_API_BASE_URL.length > 0
    ? import.meta.env.PUBLIC_API_BASE_URL
    : "/api/v1"
  ).replace(/\/+$/, "");

/** Métodos HTTP soportados por el cliente (04-coding-standards §API Design). */
export type HttpMethod = "GET" | "QUERY" | "POST" | "PATCH" | "DELETE";

/** Opciones de una petición. `fetchImpl` permite inyectar un fetch en tests. */
export interface RequestOptions {
  method?: HttpMethod;
  /** Cuerpo JSON serializable; se omite en peticiones sin cuerpo. */
  body?: unknown;
  /** Señal externa para cancelar la petición (p. ej. desmontaje de un island). */
  signal?: AbortSignal;
  /** Timeout en ms; por defecto `DEFAULT_TIMEOUT_MS` (R21.3). */
  timeoutMs?: number;
  /** Cabeceras adicionales. */
  headers?: Readonly<Record<string, string>>;
  /** Implementación de fetch inyectable (tests); por defecto `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
}

// ─────────────────────────────────────────────────────────────────────────
// Parseo del sobre { data, error, meta }
// ─────────────────────────────────────────────────────────────────────────

/**
 * Normaliza el campo `error` del sobre a `{ code, message }` o `null`. Solo se
 * usa `code` para la lógica; `message` se conserva como detalle técnico para
 * logs (nunca se muestra al usuario).
 */
function normalizeEnvelopeError(raw: unknown): { code: string; message: string } | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (isPlainObject(raw)) {
    const code = typeof raw.code === "string" ? raw.code : "unknown";
    const message = typeof raw.message === "string" ? raw.message : "";
    return { code, message };
  }
  // Un `error` presente pero con forma inesperada se trata como error genérico.
  return { code: "unknown", message: "" };
}

/**
 * Convierte el cuerpo JSON crudo (en `snake_case`) en un `ApiResponse<T>` con
 * `data`/`meta` ya mapeados a `camelCase`. Lanza `ApiClientError` de tipo
 * `parse` si el cuerpo no tiene la forma del sobre estándar.
 */
export function parseApiResponse<T>(raw: unknown): ApiResponse<T> {
  if (!isPlainObject(raw)) {
    throw new ApiClientError({
      kind: "parse",
      code: "invalid_envelope",
      status: null,
      detail: "El cuerpo de la respuesta no es un objeto { data, error, meta }.",
    });
  }

  const error = normalizeEnvelopeError(raw.error);
  const data =
    raw.data === null || raw.data === undefined ? null : (camelizeKeysDeep(raw.data) as T);
  const meta =
    raw.meta === null || raw.meta === undefined
      ? null
      : (camelizeKeysDeep(raw.meta) as ApiResponse<T>["meta"]);

  return { data, error, meta };
}

// ─────────────────────────────────────────────────────────────────────────
// Ejecución de la petición con timeout
// ─────────────────────────────────────────────────────────────────────────

interface FetchOutcome {
  response: Response;
}

/**
 * Ejecuta el `fetch` combinando la señal externa con un `AbortController`
 * propio que dispara el timeout de 10s (R21.3). Distingue el timeout de una
 * cancelación externa para no tratar una cancelación como error de UI.
 */
async function runFetchWithTimeout(
  url: string,
  method: HttpMethod,
  body: unknown,
  headers: Readonly<Record<string, string>>,
  timeoutMs: number,
  externalSignal: AbortSignal | undefined,
  fetchImpl: typeof fetch,
): Promise<FetchOutcome> {
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  // Propaga una cancelación externa al controlador interno.
  const onExternalAbort = (): void => controller.abort();
  if (externalSignal !== undefined) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  const hasBody = body !== undefined && method !== "GET";

  try {
    const response = await fetchImpl(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    return { response };
  } catch (cause) {
    if (didTimeout) {
      throw new ApiClientError({
        kind: "timeout",
        code: "timeout",
        status: null,
        detail: `La petición a ${url} superó ${timeoutMs}ms.`,
      });
    }
    // Cancelación externa: se propaga tal cual para que TanStack Query la trate
    // como cancelación (no como estado de error visible).
    if (externalSignal?.aborted === true) {
      throw cause;
    }
    throw new ApiClientError({
      kind: "network",
      code: "network",
      status: null,
      detail: cause instanceof Error ? cause.message : "Fallo de red.",
    });
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal !== undefined) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/**
 * Lee y parsea el cuerpo de la respuesta como JSON. Devuelve `undefined` cuando
 * el cuerpo está vacío (p. ej. `204 No Content`). Lanza cuando el cuerpo no es
 * JSON válido en una respuesta 2xx (los cuerpos no-2xx se toleran).
 */
async function readJsonBody(response: Response): Promise<unknown | undefined> {
  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (response.ok) {
      throw new ApiClientError({
        kind: "parse",
        code: "invalid_json",
        status: response.status,
        detail: "El cuerpo 2xx no es JSON válido.",
      });
    }
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────

/**
 * Realiza una petición a la API y aplica el contrato `{ data, error, meta }`.
 *
 * @typeParam T  Forma en `camelCase` del payload esperado (ver `lib/types.ts`).
 * @param path   Ruta relativa a la base (`/tours/search`) o URL absoluta.
 * @returns `T` cuando hay datos; `null` cuando la respuesta es vacía
 *          (`data === null && error === null`).
 * @throws {ApiClientError} si `error !== null`, el status no es 2xx, hay
 *          timeout (10s), fallo de red o el cuerpo no es un sobre válido.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = {},
    fetchImpl = globalThis.fetch,
  } = options;

  const url = /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const { response } = await runFetchWithTimeout(
    url,
    method,
    body,
    headers,
    timeoutMs,
    signal,
    fetchImpl,
  );

  const rawBody = await readJsonBody(response);

  // Regla 1a: status HTTP no 2xx → error. Se aprovecha el `error.code` del
  // backend como código de máquina si viene en el cuerpo, sin exponerlo al usuario.
  if (!response.ok) {
    const backendCode =
      rawBody !== undefined && isPlainObject(rawBody)
        ? normalizeEnvelopeError(rawBody.error)?.code
        : undefined;
    throw new ApiClientError({
      kind: "http",
      code: backendCode ?? `http_${response.status}`,
      status: response.status,
      detail: `Respuesta HTTP ${response.status} de ${url}.`,
    });
  }

  // 2xx con cuerpo vacío → estado vacío (sin contenido), no error.
  if (rawBody === undefined) {
    return null;
  }

  const parsed = parseApiResponse<T>(rawBody);

  // Regla 1b: `error !== null` en un 2xx → error de negocio del backend.
  if (parsed.error !== null) {
    throw new ApiClientError({
      kind: "backend",
      code: parsed.error.code,
      status: response.status,
      detail: parsed.error.message,
    });
  }

  // Regla 2: `data === null && error === null` → estado vacío.
  if (parsed.data === null) {
    return null;
  }

  // Regla 3: datos presentes.
  return parsed.data;
}
