/**
 * Cálculo geoespacial para la sección "Tours cercanos" (R18).
 *
 * Funciones puras, sin dependencias de UI ni framework, para poder probarse de
 * forma aislada (unit + property testing):
 *
 *   - `haversineDistanceKm`: distancia del gran círculo entre dos coordenadas
 *     `[lng, lat]`, en kilómetros. Es una métrica bien formada:
 *       · `d(a, b) >= 0`      (no negatividad)
 *       · `d(a, a) = 0`       (identidad)
 *       · `d(a, b) = d(b, a)` (simetría)
 *   - `nearbyTours`: selección de tours cercanos a un tour de origen, aplicando
 *     el filtro de radio de 50 km, la exclusión del tour actual, el orden
 *     ascendente por distancia y el límite de 6 resultados.
 *
 * Fuente: design.md §"NearbyTours" / estructura `lib/geo.ts`.
 */

import type { TourSummary } from "./types";

/** Radio medio de la Tierra en kilómetros (esfera de referencia). */
const EARTH_RADIUS_KM = 6371;

/** Radio máximo (km) para considerar un tour como "cercano" (R18.1). */
export const NEARBY_RADIUS_KM = 50;

/** Número máximo de tours cercanos que se muestran en el carrusel (R18.1). */
export const NEARBY_MAX_RESULTS = 6;

/**
 * Origen del cálculo de cercanía: el tour actualmente visualizado.
 *
 * Se modela con lo mínimo necesario (slug para excluirse a sí mismo y
 * coordenadas válidas para medir distancias), de modo que tanto un `TourDetail`
 * como un `TourSummary` con coordenadas no nulas puedan usarse como origen.
 */
export interface NearbyOrigin {
  /** Slug del tour actual; se excluye del resultado (R18.2). */
  slug: string;
  /** Coordenadas `[lng, lat]` del tour actual. */
  coordinates: [number, number];
}

/** Convierte grados sexagesimales a radianes. */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Distancia haversine (del gran círculo) entre dos coordenadas `[lng, lat]`,
 * expresada en kilómetros.
 *
 * La fórmula usa `atan2` para estabilidad numérica cerca de puntos antípodas.
 * Por construcción es no negativa, simétrica (`a`/`b` intervienen solo mediante
 * diferencias al cuadrado y productos conmutativos de cosenos) y vale 0 cuando
 * ambas coordenadas coinciden.
 */
export function haversineDistanceKm(
  a: readonly [number, number],
  b: readonly [number, number],
): number {
  const [lngA, latA] = a;
  const [lngB, latB] = b;

  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);

  const lat1 = toRadians(latA);
  const lat2 = toRadians(latB);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

/**
 * Selecciona los tours cercanos a un tour de origen para el carrusel de
 * "Tours cercanos" (R18.1, R18.2).
 *
 * Garantías del resultado:
 *   (a) excluye el tour actual (por `slug`) (R18.2);
 *   (b) contiene solo tours cuya distancia al origen es `<= 50 km` (R18.1);
 *   (c) está ordenado por distancia ascendente (R18.1);
 *   (d) tiene longitud `<= 6` (R18.1).
 *
 * Los candidatos sin coordenadas (`coordinates === null`) se descartan, ya que
 * no es posible medir su distancia.
 */
export function nearbyTours(
  origin: NearbyOrigin,
  candidates: readonly TourSummary[],
): TourSummary[] {
  const withDistance: Array<{ tour: TourSummary; distanceKm: number }> = [];

  for (const candidate of candidates) {
    // Descartar candidatos sin coordenadas: no se puede medir distancia.
    if (candidate.coordinates === null) {
      continue;
    }

    // (a) Excluir el tour actual (R18.2).
    if (candidate.slug === origin.slug) {
      continue;
    }

    const distanceKm = haversineDistanceKm(
      origin.coordinates,
      candidate.coordinates,
    );

    // (b) Conservar solo los que están dentro del radio de 50 km (R18.1).
    if (distanceKm <= NEARBY_RADIUS_KM) {
      withDistance.push({ tour: candidate, distanceKm });
    }
  }

  // (c) Ordenar por distancia ascendente (R18.1).
  withDistance.sort((x, y) => x.distanceKm - y.distanceKm);

  // (d) Limitar a 6 resultados (R18.1).
  return withDistance.slice(0, NEARBY_MAX_RESULTS).map((entry) => entry.tour);
}
