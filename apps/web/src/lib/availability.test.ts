/**
 * Property test del semáforo de disponibilidad (`lib/availability.ts`, R5).
 *
 * Property 2: `availabilityStatus` asigna EXACTAMENTE un estado según la
 * precedencia y los umbrales definidos (R5.1–R5.7). El oráculo se deriva
 * directamente de las reglas de aceptación (no de la implementación) para no
 * tautologizar el test, y los generadores cubren deliberadamente los casos
 * límite: `total=0`, `total`/`available` NaN o no finitos, `available` negativo
 * o mayor que `total`, y todas las combinaciones de `isPast`/`isOffered`.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { availabilityStatus } from './availability'
import type { AvailabilityStatus, DateAvailability } from './types'

const ALL_STATUSES: readonly AvailabilityStatus[] = ['green', 'yellow', 'red', 'gray']

/**
 * Oráculo independiente de la implementación: codifica la precedencia de las
 * reglas de aceptación (R5.1–R5.7) directamente.
 *
 *   1. !isOffered || isPast              → gray  (R5.5)
 *   2. total no finito o total <= 0      → gray  (R5.6)
 *   3. available no finito o <= 0        → red   (R5.4)
 *   4. available/total >= 0.5            → green (R5.2)
 *   5. resto (0 < ratio < 0.5)           → yellow (R5.3)
 */
function expectedStatus(d: DateAvailability): AvailabilityStatus {
  if (!d.isOffered || d.isPast) return 'gray'
  if (!Number.isFinite(d.total) || d.total <= 0) return 'gray'
  if (!Number.isFinite(d.available) || d.available <= 0) return 'red'
  return d.available / d.total >= 0.5 ? 'green' : 'yellow'
}

// Generador de números que incluye enteros, fraccionarios, negativos y valores
// no finitos (NaN, +Inf, -Inf) para ejercitar las ramas de validación.
const anyNumber = fc.oneof(
  fc.integer({ min: -1000, max: 1000 }),
  fc.double({ min: -1000, max: 1000, noNaN: true }),
  fc.constantFrom<number>(0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
)

// Generador de `DateAvailability` que constriñe al espacio de entrada e incluye
// explícitamente: total=0, NaN/no finito, available negativo o > total, y todas
// las combinaciones de isPast/isOffered.
const dateAvailability: fc.Arbitrary<DateAvailability> = fc.record({
  available: anyNumber,
  total: anyNumber,
  isPast: fc.boolean(),
  isOffered: fc.boolean(),
})

describe('availabilityStatus', () => {
  // Property 2: El semáforo asigna exactamente un estado según precedencia y umbrales.
  // Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
  it('Feature: frontend-b2c-portal, Property 2: para toda DateAvailability devuelve exactamente uno de {green,yellow,red,gray} respetando la precedencia !isOffered||isPast→gray, total<=0/no-finito→gray, available<=0/no-finito→red, ratio>=0.5→green, 0<ratio<0.5→yellow', () => {
    fc.assert(
      fc.property(dateAvailability, (d) => {
        const result = availabilityStatus(d)

        // Codominio: exactamente uno de los cuatro estados.
        expect(ALL_STATUSES).toContain(result)

        // Coincide con el oráculo derivado de las reglas de aceptación.
        expect(result).toBe(expectedStatus(d))

        // Precedencia explícita, regla por regla.
        if (!d.isOffered || d.isPast) {
          expect(result).toBe('gray') // R5.5
        } else if (!Number.isFinite(d.total) || d.total <= 0) {
          expect(result).toBe('gray') // R5.6
        } else if (!Number.isFinite(d.available) || d.available <= 0) {
          expect(result).toBe('red') // R5.4
        } else if (d.available / d.total >= 0.5) {
          expect(result).toBe('green') // R5.2
        } else {
          expect(result).toBe('yellow') // R5.3
        }
      }),
      { numRuns: 300 },
    )
  })

  // Casos límite explícitos, independientes del muestreo aleatorio.
  it('resuelve los casos límite de precedencia y umbral', () => {
    // No ofrecida o pasada → gris, aun con cupos abundantes (R5.5).
    expect(availabilityStatus({ available: 20, total: 20, isPast: false, isOffered: false })).toBe('gray')
    expect(availabilityStatus({ available: 20, total: 20, isPast: true, isOffered: true })).toBe('gray')

    // total = 0 o no finito → gris (R5.6), con prioridad sobre available.
    expect(availabilityStatus({ available: 5, total: 0, isPast: false, isOffered: true })).toBe('gray')
    expect(availabilityStatus({ available: 5, total: Number.NaN, isPast: false, isOffered: true })).toBe('gray')

    // available <= 0 o no finito → rojo (R5.4).
    expect(availabilityStatus({ available: 0, total: 20, isPast: false, isOffered: true })).toBe('red')
    expect(availabilityStatus({ available: -3, total: 20, isPast: false, isOffered: true })).toBe('red')
    expect(availabilityStatus({ available: Number.NaN, total: 20, isPast: false, isOffered: true })).toBe('red')

    // Frontera 50% → verde (R5.2).
    expect(availabilityStatus({ available: 10, total: 20, isPast: false, isOffered: true })).toBe('green')
    // Justo por debajo del 50% → amarillo (R5.3).
    expect(availabilityStatus({ available: 9, total: 20, isPast: false, isOffered: true })).toBe('yellow')

    // available > total (dato inconsistente) → ratio > 1 → verde (R5.2).
    expect(availabilityStatus({ available: 30, total: 20, isPast: false, isOffered: true })).toBe('green')
  })
})
