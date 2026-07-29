/**
 * Tests de `lib/format.ts` — formateo de precio en COP (R15.2).
 *
 * Incluye ejemplos concretos/casos límite (unit) y la propiedad universal de
 * formateo de precio (property-based con fast-check, tarea 4.4 / Property 5).
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { formatPriceCop, formatDuration, type DurationParts } from "./format";

const PREFIX = "Desde $";
const SUFFIX = " COP por persona";

/** Extrae la parte numérica formateada entre el prefijo y el sufijo. */
function extractGroupedNumber(formatted: string): string {
  return formatted.slice(PREFIX.length, formatted.length - SUFFIX.length);
}

// ─────────────────────────────────────────────────────────────────────────
// Unit tests (ejemplos concretos y casos límite)
// ─────────────────────────────────────────────────────────────────────────

describe("formatPriceCop (R15.2) — ejemplos", () => {
  it("formatea un precio típico con separador de miles de punto", () => {
    expect(formatPriceCop(1_250_000)).toBe("Desde $1.250.000 COP por persona");
  });

  it("no agrupa números menores a mil", () => {
    expect(formatPriceCop(0)).toBe("Desde $0 COP por persona");
    expect(formatPriceCop(999)).toBe("Desde $999 COP por persona");
  });

  it("agrupa exactamente en la frontera de los miles", () => {
    expect(formatPriceCop(1000)).toBe("Desde $1.000 COP por persona");
  });

  it("normaliza valores negativos a 0", () => {
    expect(formatPriceCop(-5000)).toBe("Desde $0 COP por persona");
  });

  it("redondea decimales al entero más cercano (sin decimales en salida)", () => {
    expect(formatPriceCop(1000.4)).toBe("Desde $1.000 COP por persona");
    expect(formatPriceCop(1000.6)).toBe("Desde $1.001 COP por persona");
  });

  it("trata valores no finitos como 0", () => {
    expect(formatPriceCop(Number.NaN)).toBe("Desde $0 COP por persona");
    expect(formatPriceCop(Number.POSITIVE_INFINITY)).toBe("Desde $0 COP por persona");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Property-based test
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: formateo de precio COP", () => {
  it(
    "Feature: frontend-b2c-portal, Property 5: Para todo entero v >= 0, " +
      "formatPriceCop(v) produce una cadena con el valor agrupado con separador " +
      "de miles (punto), prefijo 'Desde $' y sufijo 'COP por persona', sin " +
      "decimales y sin depender del locale del entorno. " +
      "**Validates: Requirements 15.2**",
    () => {
      fc.assert(
        fc.property(
          // Enteros no negativos, cubriendo un rango amplio (incluye 0 y valores grandes).
          fc.integer({ min: 0, max: 999_999_999_999 }),
          (v) => {
            const result = formatPriceCop(v);

            // Prefijo y sufijo exactos (R15.2).
            expect(result.startsWith(PREFIX)).toBe(true);
            expect(result.endsWith(SUFFIX)).toBe(true);

            const grouped = extractGroupedNumber(result);

            // Sin decimales: solo dígitos y puntos de agrupación.
            expect(grouped).toMatch(/^\d{1,3}(\.\d{3})*$/);

            // Reconstrucción: al quitar los puntos se recupera el valor exacto
            // (verifica que la agrupación se hizo con puntos y sin pérdida).
            const reconstructed = grouped.replace(/\./g, "");
            expect(reconstructed).toBe(String(v));
            expect(Number(reconstructed)).toBe(v);

            // Independencia del locale: la agrupación es determinista en grupos
            // de 3 dígitos de derecha a izquierda separados por punto.
            const digits = String(v);
            const expectedGrouped = digits.replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ".",
            );
            expect(grouped).toBe(expectedGrouped);
          },
        ),
        { numRuns: 200 },
      );
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────
// Property-based test — Property 6 (tarea 4.5): formateo de duración
//
// Feature: frontend-b2c-portal, Property 6: Formateo de duración según campos
// presentes. Para toda combinación válida de {days, nights, hours},
// formatDuration produce "N días / M noches" cuando hay días/noches y
// "N horas" cuando la duración se expresa en horas, seleccionando el formato
// según qué campos están presentes y sin emitir números negativos ni campos
// nulos en la salida.
//
// Validates: Requirements 15.2
// ─────────────────────────────────────────────────────────────────────────

/**
 * Generador de un único campo de duración: cubre presente/ausente/nulo/negativo/
 * cero, así como valores no finitos y decimales, para explorar todo el espacio
 * de entrada de `formatDuration`.
 */
const durationField = (): fc.Arbitrary<number | null | undefined> =>
  fc.oneof(
    fc.constant(undefined), // campo ausente
    fc.constant(null), // campo nulo
    fc.constant(0), // cero (no se emite)
    fc.integer({ min: -1000, max: -1 }), // negativos (no se emiten)
    fc.integer({ min: 1, max: 1000 }), // enteros positivos válidos
    fc.double({ min: 0.1, max: 1000, noNaN: true }), // decimales positivos
    fc.constant(Number.NaN), // no finito
    fc.constant(Number.POSITIVE_INFINITY),
    fc.constant(Number.NEGATIVE_INFINITY),
  );

const durationParts = (): fc.Arbitrary<DurationParts> =>
  fc.record({
    days: durationField(),
    nights: durationField(),
    hours: durationField(),
  });

/** Replica la normalización esperada: entero > 0, o null si inválido. */
function expectedDurationCount(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  const whole = Math.floor(value);
  return whole > 0 ? whole : null;
}

describe("Property-based: formateo de duración", () => {
  it(
    "Feature: frontend-b2c-portal, Property 6: Para toda combinación válida de " +
      "{days, nights, hours}, formatDuration produce 'N días / M noches' cuando " +
      "hay días/noches y 'N horas' cuando la duración se expresa en horas, " +
      "seleccionando el formato según qué campos están presentes y sin emitir " +
      "números negativos ni campos nulos en la salida. " +
      "**Validates: Requirements 15.2**",
    () => {
      fc.assert(
        fc.property(durationParts(), (parts) => {
          const result = formatDuration(parts);

          const days = expectedDurationCount(parts.days);
          const nights = expectedDurationCount(parts.nights);
          const hours = expectedDurationCount(parts.hours);

          // Nunca aparecen "null"/"undefined"/"NaN" ni signos negativos.
          expect(result).not.toMatch(/null|undefined|NaN|-\d/);

          if (days !== null || nights !== null) {
            // Formato multi-día: días/noches tienen precedencia sobre horas.
            const segments: string[] = [];
            if (days !== null) {
              segments.push(`${days} ${days === 1 ? "día" : "días"}`);
            }
            if (nights !== null) {
              segments.push(`${nights} ${nights === 1 ? "noche" : "noches"}`);
            }
            expect(result).toBe(segments.join(" / "));
            // Nunca aparece "hora(s)" cuando hay días/noches.
            expect(result).not.toMatch(/hora/);
          } else if (hours !== null) {
            // Formato en horas cuando no hay días ni noches.
            expect(result).toBe(`${hours} ${hours === 1 ? "hora" : "horas"}`);
          } else {
            // Ningún campo válido → cadena vacía.
            expect(result).toBe("");
          }
        }),
        { numRuns: 300 },
      );
    },
  );
});
