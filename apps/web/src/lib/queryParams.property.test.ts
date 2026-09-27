/**
 * Property test (tarea 4.7 / Property 3) — round-trip del estado del catálogo
 * (`lib/queryParams.ts`).
 *
 * Property 3: Para todo `CatalogState` válido en forma canónica,
 * `parseCatalogState(serializeCatalogState(state))` produce un estado
 * equivalente a `state`, y `serializeCatalogState` es estable bajo re-parseo
 * (`serialize(parse(serialize(s)))` equivale a `serialize(s)`).
 *
 * **Validates: Requirements 9.4, 12.4, 13.8, 13.10**
 *
 * Los ejemplos concretos y casos límite viven en `queryParams.test.ts`; este
 * archivo cubre únicamente la propiedad universal con fast-check.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type {
  CatalogState,
  Difficulty,
  DurationBucket,
  Region,
} from "./types";
import { parseCatalogState, serializeCatalogState } from "./queryParams";

// ─────────────────────────────────────────────────────────────────────────
// Dominio canónico (mismo orden de declaración que en queryParams.ts / R13)
// ─────────────────────────────────────────────────────────────────────────

const REGION_ORDER: readonly Region[] = [
  "eje_cafetero",
  "llanos",
  "amazonia",
  "costa_caribe",
  "costa_pacifico",
  "andes",
  "bogota_dc",
];

const DURATION_ORDER: readonly DurationBucket[] = [
  "half_day",
  "one_day",
  "two_three_days",
  "more_than_three",
];

const DIFFICULTY_ORDER: readonly Difficulty[] = [
  "familiar",
  "moderado",
  "aventurero",
  "extremo",
];

const SORT_VALUES: readonly CatalogState["sort"][] = [
  "popular",
  "price_asc",
  "price_desc",
  "recent",
];

const VIEW_VALUES: readonly CatalogState["view"][] = ["list", "map"];

const PRICE_MAX = 999_999_999;

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Subconjunto canónico de una unión: elige un subconjunto arbitrario de
 * `order` y lo devuelve deduplicado y en el orden canónico de declaración.
 * `fc.subarray` ya preserva el orden del array base y no repite elementos, por
 * lo que el resultado es directamente canónico.
 */
function canonicalSubset<T>(order: readonly T[]): fc.Arbitrary<T[]> {
  return fc.subarray([...order]);
}

/**
 * `q` en forma canónica: cadena ya recortada (`q === q.trim()`). Generamos
 * texto arbitrario y aplicamos `trim` para respetar el invariante canónico sin
 * sesgar hacia cadenas triviales.
 */
const canonicalQ: fc.Arbitrary<string> = fc
  .string({ maxLength: 40 })
  .map((s) => s.trim());

/**
 * Par de precios canónico: `0 <= priceMin <= priceMax <= PRICE_MAX`.
 */
const canonicalPriceRange: fc.Arbitrary<{
  priceMin: number;
  priceMax: number;
}> = fc
  .tuple(
    fc.integer({ min: 0, max: PRICE_MAX }),
    fc.integer({ min: 0, max: PRICE_MAX }),
  )
  .map(([a, b]) => ({
    priceMin: Math.min(a, b),
    priceMax: Math.max(a, b),
  }));

/** `CatalogState` arbitrario en forma canónica. */
const canonicalCatalogState: fc.Arbitrary<CatalogState> = fc
  .record({
    q: canonicalQ,
    regions: canonicalSubset(REGION_ORDER),
    durations: canonicalSubset(DURATION_ORDER),
    priceRange: canonicalPriceRange,
    difficulties: canonicalSubset(DIFFICULTY_ORDER),
    passportOnly: fc.boolean(),
    sort: fc.constantFrom(...SORT_VALUES),
    // Cursor keyset canónico: token opaco no vacío (sin espacios en los
    // bordes) o `null`. Un string vacío/con espacios no es canónico porque
    // `parseCatalogState` lo normaliza a `null`.
    cursor: fc.option(
      fc
        .string({ minLength: 1, maxLength: 40 })
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      { nil: null },
    ),
    view: fc.constantFrom(...VIEW_VALUES),
  })
  .map((r) => ({
    q: r.q,
    regions: r.regions,
    durations: r.durations,
    priceMin: r.priceRange.priceMin,
    priceMax: r.priceRange.priceMax,
    difficulties: r.difficulties,
    passportOnly: r.passportOnly,
    sort: r.sort,
    cursor: r.cursor,
    view: r.view,
  }));

// ─────────────────────────────────────────────────────────────────────────
// Property 3
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: round-trip del estado del catálogo", () => {
  it(
    "Feature: frontend-b2c-portal, Property 3: Para todo CatalogState válido " +
      "en forma canónica, parseCatalogState(serializeCatalogState(state)) " +
      "produce un estado equivalente a state, y serializeCatalogState es " +
      "estable bajo re-parseo (serialize(parse(serialize(s))) equivale a " +
      "serialize(s)). **Validates: Requirements 9.4, 12.4, 13.8, 13.10**",
    () => {
      fc.assert(
        fc.property(canonicalCatalogState, (state) => {
          // (1) Round-trip: parse(serialize(state)) equivale al estado canónico.
          const roundTripped = parseCatalogState(serializeCatalogState(state));
          expect(roundTripped).toEqual(state);

          // (2) Estabilidad de la serialización bajo re-parseo:
          //     serialize(parse(serialize(s))) === serialize(s) (como string).
          const once = serializeCatalogState(state).toString();
          const twice = serializeCatalogState(
            parseCatalogState(serializeCatalogState(state)),
          ).toString();
          expect(twice).toBe(once);
        }),
        { numRuns: 200 },
      );
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────
// Property 4 (tarea 4.8) — invariantes de normalización del estado
// ─────────────────────────────────────────────────────────────────────────

/** Tokens válidos de las tres uniones para poder mezclarlos con basura. */
const ALL_VALID_TOKENS: readonly string[] = [
  ...REGION_ORDER,
  ...DURATION_ORDER,
  ...DIFFICULTY_ORDER,
];

/**
 * Valor "sucio" para un campo de lista separada por comas: mezcla tokens
 * válidos, tokens desconocidos, espacios externos, cadenas vacías y
 * duplicados, unidos por comas.
 */
const messyListValue: fc.Arbitrary<string> = fc
  .array(
    fc.oneof(
      fc.constantFrom(...ALL_VALID_TOKENS),
      fc.string({ maxLength: 12 }),
      fc.constant(""),
      // Token válido rodeado de espacios (debe seguir aceptándose tras trim).
      fc
        .constantFrom(...ALL_VALID_TOKENS)
        .map((t) => `  ${t}  `),
    ),
    { maxLength: 8 },
  )
  .map((parts) => parts.join(","));

/** Valor "sucio" para un precio: enteros, negativos, gigantes, texto, vacío. */
const messyPriceValue: fc.Arbitrary<string> = fc.oneof(
  fc.integer({ min: -5_000, max: 5_000 }).map(String),
  fc.integer({ min: 0, max: 2_000_000_000 }).map(String),
  fc.constantFrom(
    "-1",
    "0",
    "999999999",
    "1000000000",
    "1.5",
    "12abc",
    "abc",
    "",
    "  500  ",
    "NaN",
  ),
);

/** Valor "sucio" para `q`: cadena arbitraria con posibles espacios externos. */
const messyQValue: fc.Arbitrary<string> = fc.oneof(
  fc.string({ maxLength: 40 }),
  fc.string({ maxLength: 20 }).map((s) => `   ${s}   `),
  fc.constant("   "),
);

/** Valor "sucio" para `sort`: válidos + tokens desconocidos. */
const messySortValue: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom(...(SORT_VALUES as readonly string[])),
  fc.string({ maxLength: 12 }),
  fc.constantFrom("POPULAR", "price", "cheapest", ""),
);

/** Valor "sucio" para `view`: válidos + tokens desconocidos. */
const messyViewValue: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom(...(VIEW_VALUES as readonly string[])),
  fc.string({ maxLength: 12 }),
  fc.constantFrom("LIST", "grid", "table", ""),
);

/** Valor "sucio" para `page`: enteros, cero, negativos, texto. */
const messyPageValue: fc.Arbitrary<string> = fc.oneof(
  fc.integer({ min: -100, max: 100_000 }).map(String),
  fc.constantFrom("0", "1", "-3", "1.5", "abc", "", "  2  "),
);

/**
 * `URLSearchParams` arbitrario y desordenado: cada parámetro puede estar
 * ausente (para ejercitar los defaults) o presente con un valor "sucio".
 */
const messyCatalogSearch: fc.Arbitrary<URLSearchParams> = fc
  .record({
    q: fc.option(messyQValue, { nil: undefined }),
    regions: fc.option(messyListValue, { nil: undefined }),
    durations: fc.option(messyListValue, { nil: undefined }),
    difficulties: fc.option(messyListValue, { nil: undefined }),
    priceMin: fc.option(messyPriceValue, { nil: undefined }),
    priceMax: fc.option(messyPriceValue, { nil: undefined }),
    passport: fc.option(
      fc.constantFrom("1", "0", "true", "yes", ""),
      { nil: undefined },
    ),
    sort: fc.option(messySortValue, { nil: undefined }),
    page: fc.option(messyPageValue, { nil: undefined }),
    view: fc.option(messyViewValue, { nil: undefined }),
    // Parámetro totalmente desconocido para asegurar que se ignora.
    junk: fc.option(fc.string({ maxLength: 10 }), { nil: undefined }),
  })
  .map((entries) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(entries)) {
      if (value !== undefined) params.set(key, value);
    }
    return params;
  });

describe("Property-based: invariantes de normalización del estado del catálogo", () => {
  it(
    "Feature: frontend-b2c-portal, Property 4: Para toda URLSearchParams de " +
      "entrada (incluyendo q con espacios externos, priceMin > priceMax, y " +
      "valores fuera de rango o ausentes), el CatalogState resultante de " +
      "parseCatalogState cumple: q === q.trim(), " +
      "0 <= priceMin <= priceMax <= 999_999_999, sort toma un valor válido " +
      'con "popular" por defecto, y view toma "list" por defecto cuando ' +
      "falta o es inválido. **Validates: Requirements 12.3, 13.3, 13.9**",
    () => {
      fc.assert(
        fc.property(messyCatalogSearch, (search) => {
          const state = parseCatalogState(search);

          // (R12.3) q sin espacios inicial ni final.
          expect(state.q).toBe(state.q.trim());

          // (R13.3) rango de precio normalizado.
          expect(Number.isSafeInteger(state.priceMin)).toBe(true);
          expect(Number.isSafeInteger(state.priceMax)).toBe(true);
          expect(state.priceMin).toBeGreaterThanOrEqual(0);
          expect(state.priceMin).toBeLessThanOrEqual(state.priceMax);
          expect(state.priceMax).toBeLessThanOrEqual(PRICE_MAX);

          // (R13.9) sort válido con "popular" por defecto.
          expect(SORT_VALUES).toContain(state.sort);
          if (!search.has("sort") ||
            !(SORT_VALUES as readonly string[]).includes(search.get("sort")!)) {
            expect(state.sort).toBe("popular");
          }

          // (R14.1) view válido con "list" por defecto ante ausencia/invalidez.
          expect(VIEW_VALUES).toContain(state.view);
          if (!search.has("view") ||
            !(VIEW_VALUES as readonly string[]).includes(search.get("view")!)) {
            expect(state.view).toBe("list");
          }

          // (R13.1/13.2/13.4) listas solo con miembros válidos de su unión.
          for (const region of state.regions) {
            expect(REGION_ORDER).toContain(region);
          }
          for (const duration of state.durations) {
            expect(DURATION_ORDER).toContain(duration);
          }
          for (const difficulty of state.difficulties) {
            expect(DIFFICULTY_ORDER).toContain(difficulty);
          }
        }),
        { numRuns: 200 },
      );
    },
  );
});
