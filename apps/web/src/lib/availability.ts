/**
 * Semáforo de disponibilidad (R5).
 *
 * Función pura que asigna EXACTAMENTE un estado de color a una fecha del tour a
 * partir de sus cupos, capacidad y contexto (fecha pasada / ofrecida). Es la
 * lógica central reutilizada por el catálogo (Discovery) y por el calendario
 * del detalle de tour. No depende de la UI ni de ningún framework para poder
 * probarse de forma aislada (unit + property testing).
 *
 * Fuente: design.md §"Semáforo de disponibilidad".
 */

import type { AvailabilityStatus, DateAvailability } from "./types";

/**
 * Calcula el estado del semáforo de una fecha.
 *
 * Las reglas se evalúan en ESTE orden de precedencia (el primero que se cumple
 * determina el estado; garantiza exactamente un estado por fecha — R5.7):
 *
 *   1. `!isOffered || isPast`                → gray  (R5.5)
 *      La fecha no se ofrece o ya pasó: no es seleccionable.
 *   2. `total <= 0` o `total` inválido       → gray  (R5.6)
 *      Capacidad total cero, desconocida, NaN o no finita: dato no confiable.
 *   3. `available <= 0` o `available` inválido → red  (R5.4)
 *      Sin cupos confirmados (o dato de cupos no confiable).
 *   4. `available / total >= 0.5`            → green (R5.2)
 *      Al menos el 50% de la capacidad disponible.
 *   5. resto (`0 < available/total < 0.5`)   → yellow (R5.3)
 *      Disponibilidad parcial por debajo del 50% (incluye el rango 1%–49% y la
 *      franja 49%–50%, que también es "menos del 50%").
 */
export function availabilityStatus(d: DateAvailability): AvailabilityStatus {
  const { available, total, isPast, isOffered } = d;

  // 1. Fecha no ofrecida o pasada → gris (R5.5).
  if (!isOffered || isPast) {
    return "gray";
  }

  // 2. Capacidad total inválida (cero, negativa, NaN o no finita) → gris (R5.6).
  if (!Number.isFinite(total) || total <= 0) {
    return "gray";
  }

  // 3. Sin cupos (o cupos inválidos) → rojo (R5.4).
  if (!Number.isFinite(available) || available <= 0) {
    return "red";
  }

  // A partir de aquí `available` y `total` son finitos y positivos.
  const ratio = available / total;

  // 4. Disponibilidad >= 50% → verde (R5.2).
  if (ratio >= 0.5) {
    return "green";
  }

  // 5. Disponibilidad parcial < 50% → amarillo (R5.3).
  return "yellow";
}
