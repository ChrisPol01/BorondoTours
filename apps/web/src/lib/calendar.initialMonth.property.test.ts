/**
 * Property test (tarea 4.14 / Property 11) — mes inicial del calendario
 * (`lib/calendar.ts` → `initialMonth`).
 *
 * Property 11: Para toda lista de instancias con disponibilidad,
 * `initialMonth(instances, today)` devuelve el primer mes (cronológicamente)
 * que contiene al menos una fecha en estado Verde o Amarillo; si no existe
 * ninguna, aplica el comportamiento por defecto definido (el mes de `today`)
 * de forma determinista.
 *
 * **Validates: Requirements 17.3**
 *
 * Los ejemplos concretos y casos límite viven en `calendar.test.ts`; este
 * archivo cubre únicamente la propiedad universal con fast-check. El oráculo
 * (valor esperado) se deriva de forma independiente reutilizando la función
 * pura `availabilityStatus` (R5), tal como lo hace la implementación bajo
 * prueba, pero recalculando el mínimo cronológico a mano.
 *
 * Determinismo: se inyecta una referencia `today` fija por corrida (nunca se
 * usa `new Date()` implícito), de modo que la propiedad es reproducible.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { availabilityStatus } from "./availability";
import { initialMonth } from "./calendar";
import type { TourInstance } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// Oráculo independiente (no llama a initialMonth)
// ─────────────────────────────────────────────────────────────────────────

interface YmD {
  year: number;
  month: number; // base 1
  day: number;
}

/** Parseo estricto de ISO `yyyy-mm-dd` — refleja el parseo de calendar.ts. */
function parseIso(iso: string): YmD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/** Orden cronológico por (año, mes, día). */
function compareYmD(a: YmD, b: YmD): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Calcula el mes inicial esperado a partir de las instancias y la referencia
 * `today`, sin usar la implementación bajo prueba. Devuelve `{year, month}`
 * en base 1 (el día siempre es 1 en el resultado del calendario).
 */
function expectedMonth(
  instances: readonly TourInstance[],
  today: YmD,
): { year: number; month: number } {
  let earliest: YmD | null = null;

  for (const instance of instances) {
    const parts = parseIso(instance.date);
    if (parts === null) continue;

    const isPast = compareYmD(parts, today) < 0;
    const status = availabilityStatus({
      available: instance.available,
      total: instance.total,
      isPast,
      isOffered: instance.isOffered,
    });

    if (status !== "green" && status !== "yellow") continue;

    if (earliest === null || compareYmD(parts, earliest) < 0) {
      earliest = parts;
    }
  }

  if (earliest !== null) {
    return { year: earliest.year, month: earliest.month };
  }
  // Sin fechas Verde/Amarillo → mes de `today` (default determinista).
  return { year: today.year, month: today.month };
}

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Fecha ISO `yyyy-mm-dd` válida. Se limita el día a 1..28 para evitar fechas
 * inexistentes (p. ej. 31 de febrero), manteniendo un rango de años que mezcla
 * pasado y futuro respecto a la referencia `today` generada más abajo.
 */
const isoDate: fc.Arbitrary<string> = fc
  .record({
    year: fc.integer({ min: 2023, max: 2027 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
  })
  .map(
    ({ year, month, day }) =>
      `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(
        day,
      ).padStart(2, "0")}`,
  );

/**
 * `TourInstance` arbitrario que mezcla los cuatro estados del semáforo:
 *   - `isOffered = false` o fecha pasada → gris
 *   - `total <= 0` → gris
 *   - `available <= 0` → rojo
 *   - `available/total >= 0.5` → verde; `< 0.5` → amarillo
 * Se generan cupos que cubren estos rangos (incluyendo ceros y negativos) para
 * ejercitar la derivación de estado sin sesgo.
 */
const tourInstance: fc.Arbitrary<TourInstance> = fc.record({
  date: isoDate,
  available: fc.integer({ min: -5, max: 50 }),
  total: fc.integer({ min: -5, max: 50 }),
  currentPriceCop: fc.integer({ min: 0, max: 5_000_000 }),
  isOffered: fc.boolean(),
});

/** Lista de instancias (posiblemente vacía) del tour. */
const instances: fc.Arbitrary<TourInstance[]> = fc.array(tourInstance, {
  maxLength: 30,
});

/** Referencia `today` como componentes de calendario dentro del rango. */
const todayYmD: fc.Arbitrary<YmD> = fc.record({
  year: fc.integer({ min: 2023, max: 2027 }),
  month: fc.integer({ min: 1, max: 12 }),
  day: fc.integer({ min: 1, max: 28 }),
});

// ─────────────────────────────────────────────────────────────────────────
// Property 11
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: mes inicial del calendario", () => {
  it(
    "Feature: frontend-b2c-portal, Property 11: Para toda lista de instancias " +
      "con disponibilidad, initialMonth(instances, today) devuelve el primer " +
      "mes (cronológicamente) que contiene al menos una fecha en estado Verde " +
      "o Amarillo; si no existe ninguna, aplica el comportamiento por defecto " +
      "definido (el mes de today) de forma determinista. " +
      "**Validates: Requirements 17.3**",
    () => {
      fc.assert(
        fc.property(instances, todayYmD, (list, today) => {
          // Referencia `today` construida como Date local en el día indicado.
          const todayDate = new Date(today.year, today.month - 1, today.day);

          const result = initialMonth(list, todayDate);
          const expected = expectedMonth(list, today);

          // El resultado es siempre el día 1 del mes esperado (Date local).
          expect(result.getFullYear()).toBe(expected.year);
          expect(result.getMonth()).toBe(expected.month - 1);
          expect(result.getDate()).toBe(1);
        }),
        { numRuns: 200 },
      );
    },
  );
});
