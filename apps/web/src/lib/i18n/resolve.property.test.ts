/**
 * Property test (tarea 6.2 / Property 9) — resolución i18n con fallback
 * determinista (`lib/i18n/resolve.ts`).
 *
 * Property 9: Resolución i18n con fallback determinista. Para toda clave
 * `namespace:key` y todo par de catálogos generados, `resolve(key, activeLng,
 * catalogs)` devuelve: el valor del IDIOMA ACTIVO si la clave existe ahí; en su
 * defecto el valor del idioma de RESPALDO `es` si existe; en su defecto la
 * CLAVE LITERAL. Nunca devuelve una cadena vacía. Los valores de cadena vacía
 * en el catálogo se tratan como ausentes.
 *
 * **Validates: Requirements 19.4, 19.5, 3.9, 7.5**
 *
 * Los ejemplos concretos y casos límite viven en el test unitario de `resolve`;
 * este archivo cubre únicamente la propiedad universal con fast-check.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  FALLBACK_LANGUAGE,
  resolve,
  type Catalogs,
  type Language,
  type Namespace,
} from "./resolve";

// ─────────────────────────────────────────────────────────────────────────
// Dominio (alineado con resolve.ts)
// ─────────────────────────────────────────────────────────────────────────

const LANGUAGES: readonly Language[] = ["es", "en"];

const NAMESPACES: readonly Namespace[] = [
  "common",
  "nav",
  "footer",
  "home",
  "discovery",
  "detail",
];

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries)
// ─────────────────────────────────────────────────────────────────────────

/** Fragmento de clave bien formado (sin `:` para no romper el patrón). */
const keySegment: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 12 })
  .map((s) => s.replace(/:/g, "_"))
  .filter((s) => s.length > 0);

/** Clave con el patrón `namespace:key` (namespace del dominio conocido). */
const wellFormedKey: fc.Arbitrary<string> = fc
  .tuple(fc.constantFrom(...NAMESPACES), keySegment)
  .map(([ns, sub]) => `${ns}:${sub}`);

/**
 * Valor de catálogo para una clave: puede ser un texto no vacío, una cadena
 * VACÍA (que debe tratarse como ausente) o estar ausente por completo. Se
 * modela con `fc.option` donde `nil` significa "clave ausente del catálogo".
 */
const catalogValue: fc.Arbitrary<string | undefined> = fc.option(
  fc.oneof(
    // Texto significativo no vacío.
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.length > 0),
    // Cadena vacía explícita (debe comportarse como ausente).
    fc.constant(""),
  ),
  { nil: undefined },
);

/**
 * Escenario completo: una clave, el idioma activo, y qué valor tiene la clave
 * en el idioma activo y en el idioma de respaldo `es`. Construimos los
 * catálogos a partir de estos valores para poder razonar sobre el resultado
 * esperado con precisión.
 */
interface Scenario {
  readonly key: string;
  readonly activeLng: Language;
  readonly activeValue: string | undefined;
  readonly fallbackValue: string | undefined;
}

const scenario: fc.Arbitrary<Scenario> = fc.record({
  key: wellFormedKey,
  activeLng: fc.constantFrom(...LANGUAGES),
  activeValue: catalogValue,
  fallbackValue: catalogValue,
});

/**
 * Construye la colección de catálogos para un escenario, insertando además
 * "ruido": otras claves/namespaces que no deben influir en la resolución de la
 * clave bajo prueba.
 */
function buildCatalogs(s: Scenario): Catalogs {
  const [namespace, subKey] = splitKey(s.key);

  const setEntry = (
    catalogs: Record<string, Record<string, Record<string, string>>>,
    lng: Language,
    value: string | undefined,
  ): void => {
    if (value === undefined) return;
    catalogs[lng] ??= {};
    catalogs[lng][namespace] ??= {};
    catalogs[lng][namespace][subKey] = value;
  };

  const catalogs: Record<string, Record<string, Record<string, string>>> = {};

  // Valor de la clave bajo prueba en el idioma activo.
  setEntry(catalogs, s.activeLng, s.activeValue);
  // Valor de la clave bajo prueba en el idioma de respaldo.
  setEntry(catalogs, FALLBACK_LANGUAGE, s.fallbackValue);

  // Ruido: una clave distinta en el mismo namespace, presente en ambos idiomas.
  catalogs[s.activeLng] ??= {};
  catalogs[s.activeLng][namespace] ??= {};
  catalogs[s.activeLng][namespace]["__noise__"] = "ruido-activo";
  catalogs[FALLBACK_LANGUAGE] ??= {};
  catalogs[FALLBACK_LANGUAGE][namespace] ??= {};
  catalogs[FALLBACK_LANGUAGE][namespace]["__noise__"] = "ruido-fallback";

  return catalogs as Catalogs;
}

/** Parte una clave `namespace:key` en sus dos componentes. */
function splitKey(key: string): [string, string] {
  const i = key.indexOf(":");
  return [key.slice(0, i), key.slice(i + 1)];
}

/**
 * Oráculo independiente: lee el valor EFECTIVO de una clave en el catálogo de
 * un idioma aplicando la misma regla que `resolve` (cadena vacía = ausente).
 * Se usa para calcular el resultado esperado a partir de los catálogos ya
 * construidos, de modo que el alias `activeLng === "es"` no afecta al oráculo.
 */
function readEffective(
  catalogs: Catalogs,
  lng: Language,
  key: string,
): string | undefined {
  const [namespace, subKey] = splitKey(key);
  const value = (
    catalogs as Readonly<
      Record<string, Record<string, Record<string, string>> | undefined>
    >
  )[lng]?.[namespace]?.[subKey];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// ─────────────────────────────────────────────────────────────────────────
// Property 9
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: resolución i18n con fallback determinista", () => {
  it(
    "Feature: frontend-b2c-portal, Property 9: Resolución i18n con fallback " +
      "determinista — para toda clave namespace:key y todo par de catálogos, " +
      "resolve(key, activeLng, catalogs) devuelve el valor del idioma activo " +
      "si existe; en su defecto el valor del idioma de respaldo es si existe; " +
      "en su defecto la clave literal; y nunca devuelve una cadena vacía " +
      "(los valores vacíos del catálogo se tratan como ausentes). " +
      "**Validates: Requirements 19.4, 19.5, 3.9, 7.5**",
    () => {
      fc.assert(
        fc.property(scenario, (s) => {
          const catalogs = buildCatalogs(s);
          const result = resolve(s.key, s.activeLng, catalogs);

          // (Invariante global R19.5/R3.9/R7.5) nunca cadena vacía.
          expect(result).not.toBe("");

          // Valores efectivos leídos del catálogo ya construido (regla: cadena
          // vacía = ausente). Robusto ante el alias activeLng === "es".
          const effectiveActive = readEffective(catalogs, s.activeLng, s.key);
          const effectiveFallback = readEffective(
            catalogs,
            FALLBACK_LANGUAGE,
            s.key,
          );

          if (effectiveActive !== undefined) {
            // (R19.4) precedencia 1: idioma activo.
            expect(result).toBe(effectiveActive);
          } else if (effectiveFallback !== undefined) {
            // (R19.4) precedencia 2: idioma de respaldo `es`.
            expect(result).toBe(effectiveFallback);
          } else {
            // (R19.5) precedencia 3: clave literal.
            expect(result).toBe(s.key);
          }
        }),
        { numRuns: 200 },
      );
    },
  );
});
