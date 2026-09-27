/**
 * Construcción del body de `QUERY /tours/search` alineado al contrato
 * compartido `TourSearchSchema` (`@borondo/contracts`, RFC 10008).
 *
 * El catálogo del frontend trabaja con un `CatalogState` de dominio
 * (regiones/duraciones/dificultades en snake_case propio del B2C). El backend
 * espera la forma anidada del contrato: `filters.priceRange`, `filters.durationRange`,
 * `filters.difficulties` (enum en MAYÚSCULAS), `sort:{field,order}` y `cursor`.
 *
 * Este módulo es la ÚNICA frontera de traducción dominio→contrato. Mantenerlo
 * puro (sin dependencias de framework/BD) lo hace testeable en aislamiento
 * (04-coding-standards §domain puro; ADR-011 SW2).
 *
 * TypeScript strict, sin `any`.
 */

import type { CatalogState, Difficulty, DurationBucket } from "./types";

/** Precio máximo del sistema (alineado con queryParams.ts / FilterPanel). */
const PRICE_MAX = 999_999_999;

/**
 * Dificultad del dominio B2C → enum del contrato (`DIFFICULTY`).
 * El contrato usa la taxonomía de negocio (FACIL/MODERADO/DIFICIL/EXTREMO);
 * el frontend histórico usa (familiar/moderado/aventurero/extremo).
 */
const DIFFICULTY_TO_CONTRACT: Readonly<Record<Difficulty, string>> = {
  familiar: "FACIL",
  moderado: "MODERADO",
  aventurero: "DIFICIL",
  extremo: "EXTREMO",
};

/**
 * Rango de duración en HORAS por bucket del catálogo. El contrato expresa la
 * duración como `durationRange {min,max}` numérico (horas), no como buckets.
 * `max: null` = sin límite superior (se omite `max` en el request).
 */
const DURATION_HOURS: Readonly<
  Record<DurationBucket, { min: number; max: number | null }>
> = {
  half_day: { min: 0, max: 5 },
  one_day: { min: 5, max: 24 },
  two_three_days: { min: 24, max: 72 },
  more_than_three: { min: 72, max: null },
};

/** `sort` del dominio → `{field, order}` del contrato. */
function mapSort(sort: CatalogState["sort"]): {
  field: "popular" | "price_asc" | "price_desc" | "recent";
  order: "asc" | "desc";
} {
  // El contrato acepta un `field` semántico + `order`. Para price_asc/desc el
  // `field` ya codifica la dirección; se envía `order` coherente por claridad.
  switch (sort) {
    case "price_asc":
      return { field: "price_asc", order: "asc" };
    case "price_desc":
      return { field: "price_desc", order: "desc" };
    case "recent":
      return { field: "recent", order: "desc" };
    case "popular":
    default:
      return { field: "popular", order: "desc" };
  }
}

/**
 * Combina varios buckets de duración en un único `durationRange {min,max}`.
 * Toma el mínimo de los `min` y el máximo de los `max` (null = sin tope).
 * Devuelve `undefined` si no hay buckets seleccionados.
 */
function mapDurationRange(
  durations: readonly DurationBucket[],
): { min: number; max: number } | undefined {
  if (durations.length === 0) return undefined;
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  let unbounded = false;
  for (const bucket of durations) {
    const range = DURATION_HOURS[bucket];
    if (range.min < min) min = range.min;
    if (range.max === null) unbounded = true;
    else if (range.max > max) max = range.max;
  }
  return {
    min: Number.isFinite(min) ? min : 0,
    // Si algún bucket es "sin tope", usamos un techo alto y explícito.
    max: unbounded ? 1_000_000 : max,
  };
}

/** Cuerpo del request de búsqueda (forma del contrato `TourSearchSchema`). */
export interface TourSearchBody {
  q?: string;
  filters?: {
    regions?: string[];
    difficulties?: string[];
    priceRange?: { min: number; max: number };
    durationRange?: { min: number; max: number };
    ivaExemptAvailable?: boolean;
  };
  sort?: {
    field: "popular" | "price_asc" | "price_desc" | "recent";
    order: "asc" | "desc";
  };
  cursor?: string;
}

/**
 * Traduce el `CatalogState` del frontend al body del contrato de búsqueda.
 * Omite campos vacíos/por defecto para mantener el request mínimo y estable.
 *
 * @param state  Estado actual del catálogo (filtros + sort + cursor).
 * @returns Body listo para `apiFetch("/tours/search", { method: "QUERY", body })`.
 */
export function buildTourSearchBody(state: CatalogState): TourSearchBody {
  const body: TourSearchBody = {};

  const q = state.q.trim();
  if (q.length > 0) body.q = q;

  const filters: NonNullable<TourSearchBody["filters"]> = {};

  if (state.regions.length > 0) filters.regions = [...state.regions];

  if (state.difficulties.length > 0) {
    filters.difficulties = state.difficulties.map(
      (d) => DIFFICULTY_TO_CONTRACT[d],
    );
  }

  const priceMinActive = state.priceMin > 0;
  const priceMaxActive = state.priceMax < PRICE_MAX;
  if (priceMinActive || priceMaxActive) {
    filters.priceRange = { min: state.priceMin, max: state.priceMax };
  }

  const durationRange = mapDurationRange(state.durations);
  if (durationRange !== undefined) filters.durationRange = durationRange;

  if (state.passportOnly) filters.ivaExemptAvailable = true;

  if (Object.keys(filters).length > 0) body.filters = filters;

  // El backend ordena por defecto por "popular"; solo enviamos sort si difiere
  // o si el usuario lo fijó explícitamente. Enviarlo siempre es válido igualmente.
  body.sort = mapSort(state.sort);

  if (typeof state.cursor === "string" && state.cursor.length > 0) {
    body.cursor = state.cursor;
  }

  return body;
}
