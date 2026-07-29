import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { typographyMultiplier } from './typography'

// Fronteras significativas del escalado responsivo (R1.6):
//   767  → Mobile  (< 768)          → 0.85
//   768  → Tablet  (768 <= w <= 1024) → 0.95
//   1024 → Tablet  (límite superior)   → 0.95
//   1025 → Desktop (> 1024)            → 1
const BOUNDARIES = [767, 768, 1024, 1025] as const

// Oráculo independiente de la implementación: define el comportamiento esperado
// directamente desde el manual de marca, para no tautologizar el test.
function expectedMultiplier(w: number): 0.85 | 0.95 | 1 {
  if (w < 768) return 0.85
  if (w <= 1024) return 0.95
  return 1
}

describe('typographyMultiplier', () => {
  // Property 1: Multiplicador tipográfico por rango de viewport.
  // Validates: Requirements 1.6
  it('Feature: frontend-b2c-portal, Property 1: para todo w>0 devuelve exactamente uno de {0.85,0.95,1}, 0.85 cuando w<768, 0.95 cuando 768<=w<=1024, y 1 cuando w>1024', () => {
    // Generador que constriñe al espacio de entrada (anchos de viewport w>0)
    // e incluye explícitamente las fronteras 767/768/1024/1025.
    const viewportWidth = fc.oneof(
      // Enteros positivos en un rango realista de anchos de viewport.
      fc.integer({ min: 1, max: 5000 }),
      // Anchos fraccionarios (CSS px pueden ser no enteros por zoom/DPR).
      fc.double({ min: Number.MIN_VALUE, max: 5000, noNaN: true }),
      // Fronteras críticas mezcladas para garantizar su presencia.
      fc.constantFrom<number>(...BOUNDARIES),
    )

    fc.assert(
      fc.property(viewportWidth, (w) => {
        const result = typographyMultiplier(w)

        // Codominio: exactamente uno de {0.85, 0.95, 1}.
        expect([0.85, 0.95, 1]).toContain(result)

        // Coincide con el oráculo por rango.
        expect(result).toBe(expectedMultiplier(w))

        // Reglas por rango explícitas.
        if (w < 768) expect(result).toBe(0.85)
        else if (w <= 1024) expect(result).toBe(0.95)
        else expect(result).toBe(1)
      }),
      { numRuns: 300 },
    )
  })

  // Aserciones explícitas sobre las fronteras, independientes del muestreo aleatorio.
  it('resuelve correctamente las fronteras 767/768/1024/1025', () => {
    expect(typographyMultiplier(767)).toBe(0.85)
    expect(typographyMultiplier(768)).toBe(0.95)
    expect(typographyMultiplier(1024)).toBe(0.95)
    expect(typographyMultiplier(1025)).toBe(1)
  })
})
