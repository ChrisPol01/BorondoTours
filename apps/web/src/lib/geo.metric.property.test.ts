/**
 * Property test (tarea 4.11 / Property 8) — la distancia geográfica es una
 * métrica bien formada (`lib/geo.ts`, `haversineDistanceKm`).
 *
 * Property 8: Para todo par de coordenadas `a` y `b`, la distancia haversine
 * cumple:
 *   · `d(a, b) >= 0`      (no negatividad)
 *   · `d(a, a) = 0`       (identidad)
 *   · `d(a, b) = d(b, a)` (simetría, dentro de una tolerancia de punto flotante)
 *
 * **Validates: Requirements 18.1**
 *
 * Los generadores incluyen explícitamente puntos idénticos y antípodas, que son
 * los casos límite de la métrica (distancia 0 y distancia máxima ~medio arco).
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { haversineDistanceKm } from "./geo";

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries)
// ─────────────────────────────────────────────────────────────────────────

/** Longitud válida en grados: -180..180. */
const lng: fc.Arbitrary<number> = fc.double({
  min: -180,
  max: 180,
  noNaN: true,
});

/** Latitud válida en grados: -90..90. */
const lat: fc.Arbitrary<number> = fc.double({
  min: -90,
  max: 90,
  noNaN: true,
});

/** Coordenada `[lng, lat]` arbitraria dentro del dominio geográfico válido. */
const coordinate: fc.Arbitrary<[number, number]> = fc.tuple(lng, lat);

/**
 * Antípoda de una coordenada `[lng, lat]`: el punto diametralmente opuesto en
 * la esfera. La longitud se desplaza 180° (normalizada a -180..180) y la latitud
 * se invierte de signo.
 */
function antipode([lo, la]: [number, number]): [number, number] {
  let oppLng = lo + 180;
  if (oppLng > 180) {
    oppLng -= 360;
  }
  return [oppLng, -la];
}

/**
 * Par de coordenadas `[a, b]` que cubre tres regímenes del espacio de entrada:
 *   - puntos arbitrarios distintos,
 *   - puntos idénticos (`a === b`), para ejercitar `d(a, a) = 0`,
 *   - antípodas (`b = antipode(a)`), para ejercitar la distancia máxima.
 */
const coordinatePair: fc.Arbitrary<[[number, number], [number, number]]> =
  fc.oneof(
    // Par arbitrario.
    fc.tuple(coordinate, coordinate),
    // Punto idéntico: mismo objeto de coordenadas para ambos extremos.
    coordinate.map((c) => [c, [...c] as [number, number]]),
    // Antípodas.
    coordinate.map((c) => [c, antipode(c)]),
  );

// ─────────────────────────────────────────────────────────────────────────
// Property 8
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: la distancia geográfica es una métrica bien formada", () => {
  it(
    "Feature: frontend-b2c-portal, Property 8: La distancia geográfica es una " +
      "métrica bien formada. Para todo par de coordenadas a y b, la distancia " +
      "haversine cumple d(a, b) >= 0, d(a, a) = 0 y simetría d(a, b) = d(b, a) " +
      "(dentro de una tolerancia de punto flotante). " +
      "**Validates: Requirements 18.1**",
    () => {
      fc.assert(
        fc.property(coordinatePair, ([a, b]) => {
          const dAB = haversineDistanceKm(a, b);
          const dBA = haversineDistanceKm(b, a);
          const dAA = haversineDistanceKm(a, a);

          // (1) No negatividad: d(a, b) >= 0.
          expect(dAB).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(dAB)).toBe(true);

          // (2) Identidad: d(a, a) = 0 exactamente (diferencias nulas → 0).
          expect(dAA).toBe(0);

          // (3) Simetría: d(a, b) = d(b, a) dentro de tolerancia de punto flotante.
          //     Tolerancia relativa al arco máximo terrestre (~20015 km).
          expect(dAB).toBeCloseTo(dBA, 9);
        }),
        { numRuns: 200 },
      );
    },
  );
});
