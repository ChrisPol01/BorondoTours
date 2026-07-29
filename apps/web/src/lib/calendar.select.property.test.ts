/**
 * Property test (tarea 4.13 / Property 10) — selección del calendario
 * (`lib/calendar.ts` → `selectDate`).
 *
 * Property 10: Para toda selección previa y toda fecha candidata con su estado,
 * `selectDate(current, candidate, status)` reemplaza la selección por
 * `candidate` cuando `status ∈ {green, yellow}` y conserva `current` cuando
 * `status ∈ {red, gray}`; en todos los casos el resultado contiene A LO SUMO
 * una fecha seleccionada (un único valor o `null`).
 *
 * **Validates: Requirements 17.4, 17.5**
 *
 * Los ejemplos concretos y casos límite viven en `calendar.test.ts`; este
 * archivo cubre únicamente la propiedad universal con fast-check.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { selectDate } from "./calendar";
import type { AvailabilityStatus } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// Generadores
// ─────────────────────────────────────────────────────────────────────────

/** Estados en los que una fecha es seleccionable (reemplaza la previa, R17.4). */
const SELECTABLE: readonly AvailabilityStatus[] = ["green", "yellow"];

/** Todos los estados del semáforo (R5). */
const STATUSES: readonly AvailabilityStatus[] = [
  "green",
  "yellow",
  "red",
  "gray",
];

/** Fecha ISO `yyyy-mm-dd` bien formada dentro de un rango de calendario real. */
const isoDateArb: fc.Arbitrary<string> = fc
  .date({ min: new Date("2000-01-01"), max: new Date("2100-12-31") })
  .map((d) => d.toISOString().slice(0, 10));

/** Selección previa: `null` o una fecha ISO arbitraria. */
const currentArb: fc.Arbitrary<string | null> = fc.oneof(
  fc.constant<string | null>(null),
  isoDateArb,
);

const statusArb: fc.Arbitrary<AvailabilityStatus> =
  fc.constantFrom(...STATUSES);

// ─────────────────────────────────────────────────────────────────────────
// Property 10
// ─────────────────────────────────────────────────────────────────────────

describe("Feature: frontend-b2c-portal, Property 10: Selección del calendario mantiene a lo sumo una fecha", () => {
  it("reemplaza con la candidata (green/yellow) o conserva la previa (red/gray), siempre a lo sumo una fecha", () => {
    fc.assert(
      fc.property(currentArb, isoDateArb, statusArb, (current, candidate, status) => {
        const result = selectDate(current, candidate, status);

        // Invariante estructural: A LO SUMO una fecha (un valor o null).
        expect(result === null || typeof result === "string").toBe(true);

        if (SELECTABLE.includes(status)) {
          // Verde/Amarillo → la candidata reemplaza a la previa (R17.4).
          expect(result).toBe(candidate);
        } else {
          // Rojo/Gris → selección impedida, se conserva la previa (R17.5).
          expect(result).toBe(current);
        }
      }),
      { numRuns: 200 },
    );
  });
});
