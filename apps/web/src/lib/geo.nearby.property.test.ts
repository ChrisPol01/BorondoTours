/**
 * Property test (tarea 4.10 / Property 7) — selección de tours cercanos
 * (`lib/geo.ts` → `nearbyTours`).
 *
 * Property 7: Para todo tour de origen y toda lista de candidatos con
 * coordenadas válidas, el resultado de `nearbyTours`: (a) excluye el tour
 * actual (por `slug`), (b) contiene solo tours cuya distancia al origen es
 * `<= 50 km`, (c) está ordenado por distancia ascendente, y (d) tiene longitud
 * `<= 6`.
 *
 * **Validates: Requirements 18.1, 18.2**
 *
 * Los ejemplos concretos y casos límite viven (o vivirán) en `geo.test.ts`;
 * este archivo cubre únicamente la propiedad universal con fast-check.
 * Se usa un nombre de archivo distinto (`geo.nearby.property.test.ts`) para
 * evitar colisión con la Property 8 (métrica haversine, tarea 4.11).
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type {
  Difficulty,
  Region,
  TourSummary,
} from "./types";
import {
  NEARBY_MAX_RESULTS,
  NEARBY_RADIUS_KM,
  haversineDistanceKm,
  nearbyTours,
  type NearbyOrigin,
} from "./geo";

// ─────────────────────────────────────────────────────────────────────────
// Dominio auxiliar (uniones de `types.ts`)
// ─────────────────────────────────────────────────────────────────────────

const REGIONS: readonly Region[] = [
  "eje_cafetero",
  "llanos",
  "amazonia",
  "costa_caribe",
  "costa_pacifico",
  "andes",
  "bogota_dc",
];

const DIFFICULTIES: readonly Difficulty[] = [
  "familiar",
  "moderado",
  "aventurero",
  "extremo",
];

/**
 * Tolerancia de punto flotante para comparar distancias recalculadas contra el
 * umbral y contra el orden. El haversine acumula error en operaciones
 * trigonométricas; 1e-6 km (1 mm) es holgado para los rangos usados.
 */
const EPSILON_KM = 1e-6;

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries)
// ─────────────────────────────────────────────────────────────────────────

/** Longitud válida: -180..180. */
const lng: fc.Arbitrary<number> = fc.double({
  min: -180,
  max: 180,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Latitud válida: -90..90. */
const lat: fc.Arbitrary<number> = fc.double({
  min: -90,
  max: 90,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Coordenada `[lng, lat]` con rangos geográficos válidos. */
const coordinates: fc.Arbitrary<[number, number]> = fc.tuple(lng, lat);

/**
 * Slug arbitrario. Se restringe a un alfabeto pequeño para maximizar la
 * probabilidad de colisión con el slug del origen (y así ejercitar la
 * exclusión del tour actual, R18.2) sin depender solo del slug inyectado.
 */
const slug: fc.Arbitrary<string> = fc.stringMatching(/^[a-e]{1,4}$/);

/**
 * `TourSummary` arbitrario. Las coordenadas son válidas o `null` (los
 * candidatos sin coordenadas deben descartarse por `nearbyTours`).
 */
function tourSummaryArb(
  slugArb: fc.Arbitrary<string>,
): fc.Arbitrary<TourSummary> {
  return fc.record({
    slug: slugArb,
    name: fc.string({ maxLength: 30 }),
    operatorName: fc.string({ maxLength: 30 }),
    region: fc.constantFrom(...REGIONS),
    durationLabel: fc.string({ maxLength: 20 }),
    basePriceCop: fc.integer({ min: 0, max: 999_999_999 }),
    photoUrl: fc.webUrl(),
    photoAlt: fc.string({ maxLength: 30 }),
    coordinates: fc.option(coordinates, { nil: null }),
    difficulty: fc.constantFrom(...DIFFICULTIES),
    ivaExemptAvailable: fc.boolean(),
  });
}

describe("Property-based: selección de tours cercanos (nearbyTours)", () => {
  it(
    "Feature: frontend-b2c-portal, Property 7: Para todo tour de origen y " +
      "toda lista de candidatos con coordenadas válidas, el resultado de la " +
      "selección de tours cercanos: (a) excluye el tour actual, (b) contiene " +
      "solo tours cuya distancia al origen es <= 50 km, (c) está ordenado por " +
      "distancia ascendente, y (d) tiene longitud <= 6. " +
      "**Validates: Requirements 18.1, 18.2**",
    () => {
      fc.assert(
        fc.property(
          // Origen: slug del alfabeto compartido + coordenadas válidas.
          fc.record<NearbyOrigin>({
            slug,
            coordinates,
          }),
          // Candidatos: mezcla de slugs del mismo alfabeto (posible colisión
          // con el origen) y algunos que reusan explícitamente el slug del
          // origen, además de coordenadas nulas.
          fc.array(tourSummaryArb(slug), { maxLength: 40 }),
          (origin, candidates) => {
            // Inyectar candidatos que reutilizan el slug del origen para
            // garantizar que la exclusión (R18.2) se ejercita de forma frecuente.
            const withOriginSlug = candidates.map((tour, index) =>
              index % 3 === 0 ? { ...tour, slug: origin.slug } : tour,
            );

            const result = nearbyTours(origin, withOriginSlug);

            // (d) Longitud <= 6.
            expect(result.length).toBeLessThanOrEqual(NEARBY_MAX_RESULTS);

            // (a) Excluye el tour actual (por slug).
            for (const tour of result) {
              expect(tour.slug).not.toBe(origin.slug);
            }

            // Distancias del resultado (todas con coordenadas no nulas: la
            // función descarta las nulas, así que esto siempre debe cumplirse).
            const distances = result.map((tour) => {
              expect(tour.coordinates).not.toBeNull();
              return haversineDistanceKm(
                origin.coordinates,
                tour.coordinates as [number, number],
              );
            });

            // (b) Solo tours dentro del radio de 50 km.
            for (const d of distances) {
              expect(d).toBeLessThanOrEqual(NEARBY_RADIUS_KM + EPSILON_KM);
            }

            // (c) Orden ascendente por distancia.
            for (let i = 1; i < distances.length; i += 1) {
              expect(distances[i]).toBeGreaterThanOrEqual(
                distances[i - 1] - EPSILON_KM,
              );
            }

            // Coherencia adicional: el resultado es el prefijo (≤6) de todos
            // los candidatos elegibles ordenados por distancia; en particular,
            // ningún candidato elegible descartado está más cerca que el último
            // incluido cuando el resultado no está lleno.
            const eligible = withOriginSlug.filter(
              (tour) =>
                tour.coordinates !== null && tour.slug !== origin.slug,
            );
            // Se usa exactamente el mismo umbral que la implementación
            // (sin epsilon) para que el conteo coincida de forma determinista.
            const eligibleWithin = eligible.filter(
              (tour) =>
                haversineDistanceKm(
                  origin.coordinates,
                  tour.coordinates as [number, number],
                ) <= NEARBY_RADIUS_KM,
            );
            expect(result.length).toBe(
              Math.min(eligibleWithin.length, NEARBY_MAX_RESULTS),
            );
          },
        ),
        { numRuns: 200 },
      );
    },
  );
});
