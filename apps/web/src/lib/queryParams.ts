/**
 * Serialización/parseo del estado del catálogo (Discovery) desde/hacia
 * `URLSearchParams`. La URL es la fuente de verdad del estado de exploración
 * (R12, R13, R14). Fuente: design.md §"Discovery / Catálogo".
 *
 * Funciones puras, TypeScript strict, sin `any`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Invariantes garantizados por `parseCatalogState` (Property 4)
 * ─────────────────────────────────────────────────────────────────────────
 *   - `q === q.trim()` (R12.3)
 *   - `0 <= priceMin <= priceMax <= 999_999_999` (rangos inválidos se
 *     recortan/intercambian) (R13.3)
 *   - `sort` es un valor válido, con `"popular"` por defecto (R13.9)
 *   - `view` es `"list"` por defecto cuando falta o es inválido (R14.1)
 *   - `cursor` es un string opaco o `null` cuando falta o está vacío (keyset)
 *   - `regions`/`durations`/`difficulties` contienen solo miembros válidos de
 *     su unión, sin duplicados y en orden canónico (los desconocidos se
 *     descartan) (R13.1, R13.2, R13.4)
 *
 * Round-trip estable (Property 3): para todo `CatalogState` canónico,
 * `parseCatalogState(serializeCatalogState(s))` es equivalente a `s`, y
 * `serializeCatalogState(parseCatalogState(serializeCatalogState(s)))` produce
 * exactamente los mismos parámetros que `serializeCatalogState(s)`.
 */

import type {
  CatalogState,
  Difficulty,
  DurationBucket,
  Region,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────
// Constantes de dominio (orden canónico = orden de declaración en R13)
// ─────────────────────────────────────────────────────────────────────────

/** Precio máximo permitido en COP (R13.3). */
const PRICE_MAX = 999_999_999;
/** Precio mínimo permitido en COP (R13.3). */
const PRICE_MIN = 0;

/** Regiones válidas en orden canónico (R13.1). */
const REGION_ORDER: readonly Region[] = [
  "eje_cafetero",
  "llanos",
  "amazonia",
  "costa_caribe",
  "costa_pacifico",
  "andes",
  "bogota_dc",
];

/** Rangos de duración válidos en orden canónico (R13.2). */
const DURATION_ORDER: readonly DurationBucket[] = [
  "half_day",
  "one_day",
  "two_three_days",
  "more_than_three",
];

/** Dificultades válidas en orden canónico (R13.4). */
const DIFFICULTY_ORDER: readonly Difficulty[] = [
  "familiar",
  "moderado",
  "aventurero",
  "extremo",
];

/** Órdenes válidos; `"popular"` es el valor por defecto (R13.9). */
const SORT_VALUES: readonly CatalogState["sort"][] = [
  "popular",
  "price_asc",
  "price_desc",
  "recent",
];
const DEFAULT_SORT: CatalogState["sort"] = "popular";

/** Vistas válidas; `"list"` es el valor por defecto (R14.1). */
const VIEW_VALUES: readonly CatalogState["view"][] = ["list", "map"];
const DEFAULT_VIEW: CatalogState["view"] = "list";

// Nombres de los query params en la URL.
const PARAM = {
  q: "q",
  regions: "regions",
  durations: "durations",
  priceMin: "priceMin",
  priceMax: "priceMax",
  difficulties: "difficulties",
  passport: "passport",
  sort: "sort",
  cursor: "cursor",
  view: "view",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Helpers de normalización
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parsea una lista separada por comas conservando solo los miembros válidos de
 * la unión, sin duplicados y en el orden canónico indicado por `order`.
 */
function parseUnionList<T extends string>(
  raw: string | null,
  order: readonly T[],
): T[] {
  if (raw === null || raw.length === 0) return [];
  const allowed = new Set<string>(order);
  const selected = new Set<string>();
  for (const token of raw.split(",")) {
    const value = token.trim();
    if (allowed.has(value)) selected.add(value);
  }
  // Reordenar según el orden canónico para garantizar estabilidad.
  return order.filter((value) => selected.has(value));
}

/**
 * Parsea un entero no negativo desde un string. Devuelve `null` si el texto no
 * representa un entero decimal válido (evita aceptar `"12abc"`, `"1.5"`, etc.).
 */
function parseNonNegativeInt(raw: string | null): number | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(value) ? value : null;
}

/** Recorta `value` al rango `[PRICE_MIN, PRICE_MAX]`. */
function clampPrice(value: number): number {
  if (value < PRICE_MIN) return PRICE_MIN;
  if (value > PRICE_MAX) return PRICE_MAX;
  return value;
}

/**
 * Normaliza un par de precios: recorta ambos al rango permitido y los
 * intercambia si `min > max`, garantizando `0 <= min <= max <= PRICE_MAX`.
 */
function normalizePriceRange(
  rawMin: number,
  rawMax: number,
): { priceMin: number; priceMax: number } {
  let min = clampPrice(rawMin);
  let max = clampPrice(rawMax);
  if (min > max) [min, max] = [max, min];
  return { priceMin: min, priceMax: max };
}

// ─────────────────────────────────────────────────────────────────────────
// parseCatalogState — URLSearchParams → CatalogState (siempre normalizado)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Construye un `CatalogState` canónico a partir de los query params. Es total:
 * cualquier entrada (params ausentes, valores fuera de rango, `q` con espacios,
 * `priceMin > priceMax`, valores desconocidos) produce un estado válido.
 */
export function parseCatalogState(search: URLSearchParams): CatalogState {
  const q = (search.get(PARAM.q) ?? "").trim();

  const regions = parseUnionList(search.get(PARAM.regions), REGION_ORDER);
  const durations = parseUnionList(
    search.get(PARAM.durations),
    DURATION_ORDER,
  );
  const difficulties = parseUnionList(
    search.get(PARAM.difficulties),
    DIFFICULTY_ORDER,
  );

  const rawMin = parseNonNegativeInt(search.get(PARAM.priceMin));
  const rawMax = parseNonNegativeInt(search.get(PARAM.priceMax));
  const { priceMin, priceMax } = normalizePriceRange(
    rawMin ?? PRICE_MIN,
    rawMax ?? PRICE_MAX,
  );

  const passportOnly = search.get(PARAM.passport) === "1";

  const rawSort = search.get(PARAM.sort);
  const sort: CatalogState["sort"] =
    rawSort !== null && (SORT_VALUES as readonly string[]).includes(rawSort)
      ? (rawSort as CatalogState["sort"])
      : DEFAULT_SORT;

  // Cursor opaco de paginación keyset. Se conserva tal cual (trim); vacío → null.
  const rawCursor = (search.get(PARAM.cursor) ?? "").trim();
  const cursor = rawCursor.length > 0 ? rawCursor : null;

  const rawView = search.get(PARAM.view);
  const view: CatalogState["view"] =
    rawView !== null && (VIEW_VALUES as readonly string[]).includes(rawView)
      ? (rawView as CatalogState["view"])
      : DEFAULT_VIEW;

  return {
    q,
    regions,
    durations,
    priceMin,
    priceMax,
    difficulties,
    passportOnly,
    sort,
    cursor,
    view,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// serializeCatalogState — CatalogState → URLSearchParams (canónico y estable)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Serializa el estado del catálogo a `URLSearchParams`. Normaliza la entrada
 * (mismos invariantes que `parseCatalogState`) y omite los valores por defecto
 * para mantener la URL corta y la salida estable bajo re-parseo. Las claves se
 * emiten siempre en el mismo orden.
 */
export function serializeCatalogState(state: CatalogState): URLSearchParams {
  const params = new URLSearchParams();

  const q = state.q.trim();
  if (q.length > 0) params.set(PARAM.q, q);

  const regions = REGION_ORDER.filter((r) => state.regions.includes(r));
  if (regions.length > 0) params.set(PARAM.regions, regions.join(","));

  const durations = DURATION_ORDER.filter((d) => state.durations.includes(d));
  if (durations.length > 0) params.set(PARAM.durations, durations.join(","));

  const { priceMin, priceMax } = normalizePriceRange(
    Number.isSafeInteger(state.priceMin) ? state.priceMin : PRICE_MIN,
    Number.isSafeInteger(state.priceMax) ? state.priceMax : PRICE_MAX,
  );
  if (priceMin !== PRICE_MIN) params.set(PARAM.priceMin, String(priceMin));
  if (priceMax !== PRICE_MAX) params.set(PARAM.priceMax, String(priceMax));

  const difficulties = DIFFICULTY_ORDER.filter((d) =>
    state.difficulties.includes(d),
  );
  if (difficulties.length > 0)
    params.set(PARAM.difficulties, difficulties.join(","));

  if (state.passportOnly) params.set(PARAM.passport, "1");

  if ((SORT_VALUES as readonly string[]).includes(state.sort) &&
    state.sort !== DEFAULT_SORT)
    params.set(PARAM.sort, state.sort);

  // Cursor keyset: solo se emite si hay un token no vacío (primera página = sin param).
  if (typeof state.cursor === "string" && state.cursor.trim().length > 0)
    params.set(PARAM.cursor, state.cursor.trim());

  if ((VIEW_VALUES as readonly string[]).includes(state.view) &&
    state.view !== DEFAULT_VIEW)
    params.set(PARAM.view, state.view);

  return params;
}
