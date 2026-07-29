/**
 * Configuración de TanStack Query del Portal B2C (Fase 1).
 *
 * TypeScript strict, sin `any`. Fuente: design.md §"Estado servidor",
 * §"Reintentos y timeouts"; Requirements 21.3, 21.6.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Decisiones de configuración
 * ─────────────────────────────────────────────────────────────────────────
 * - `staleTime: 300s` para el catálogo (R21.6): durante ese intervalo TanStack
 *   Query NO vuelve a solicitar los datos. Se aplica como default de queries y
 *   se expone `catalogQueryDefaults` para el catálogo (Discovery).
 * - Reintentos gobernados por Query (no por el cliente) para no producir layout
 *   shift: los `Skeleton` reservan altura mientras Query reintenta en segundo
 *   plano. Solo se reintentan errores transitorios (timeout/red/5xx) — ver
 *   `ApiClientError.retryable`. Los 4xx y errores de negocio no se reintentan.
 * - `refetchOnWindowFocus: false`: el catálogo es contenido semi-estático; se
 *   evita refetch agresivo al recuperar el foco de la ventana.
 */

import { QueryClient } from "@tanstack/react-query";
import type { DefaultOptions } from "@tanstack/react-query";

import { ApiClientError } from "./errors";

/** `staleTime` del catálogo en milisegundos: 300 segundos (R21.6). */
export const CATALOG_STALE_TIME_MS = 300_000;

/** Número máximo de reintentos automáticos de una query fallida. */
export const MAX_QUERY_RETRIES = 2;

/**
 * Decide si TanStack Query debe reintentar una query fallida. Solo reintenta
 * errores transitorios (`ApiClientError.retryable`) hasta `MAX_QUERY_RETRIES`.
 * Cualquier otro error (4xx, negocio, parseo) no se reintenta. Los reintentos
 * ocurren sin layout shift porque la UI mantiene los `Skeleton`/altura reservada.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false;
  }
  if (error instanceof ApiClientError) {
    return error.retryable;
  }
  // Errores desconocidos (no `ApiClientError`) no se reintentan por defecto.
  return false;
}

/**
 * Backoff exponencial acotado entre reintentos (1s, 2s, … máx 10s). Evita
 * martillar al backend y mantiene la experiencia estable durante la espera.
 */
export function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 10_000);
}

/** Opciones por defecto compartidas por todas las queries/mutaciones. */
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    // El catálogo es la carga dominante del portal; 300s satisface R21.6 y es
    // un default seguro para el resto de lecturas semi-estáticas.
    staleTime: CATALOG_STALE_TIME_MS,
    retry: shouldRetry,
    retryDelay,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};

/**
 * `queryClient` a aplicar EXPLÍCITAMENTE en queries del catálogo (Discovery)
 * para dejar constancia del requisito, aunque coincida con el default (R21.6).
 */
export const catalogQueryDefaults = {
  staleTime: CATALOG_STALE_TIME_MS,
} as const;

/**
 * Crea un `QueryClient` configurado para el Portal B2C. Se crea uno por árbol de
 * islands (o compartido vía provider) según lo cablee cada vista.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: defaultQueryOptions });
}
