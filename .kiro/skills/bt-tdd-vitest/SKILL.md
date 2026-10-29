---
name: bt-tdd-vitest
description: >
  Desarrollo guiado por pruebas con vitest para BorondoTours: tests antes del código, cobertura ≥80%,
  tests obligatorios en finanzas, RBAC y máquinas de estado, fixtures sin PII y vectores de DomainRules.
  Para los roles developer de la fábrica (sin Jest ni Supabase).
---

# bt-tdd-vitest

Toda feature se construye con TDD usando vitest (el runner del producto). Los tests son obligatorios
en cálculos financieros, guards RBAC y máquinas de estado; cobertura objetivo ≥ 80%.

## Cuándo se activa

- Escribir una feature, corregir un bug o refactorizar.
- Añadir un endpoint, un caso de uso o una regla de dominio.

## Flujo TDD

1. Escribir los casos de prueba a partir de los `EdgeCases` y los vectores de `DomainRules`.
2. Correr los tests: deben fallar (aún no hay implementación).
3. Implementar lo mínimo para pasar.
4. Volver a correr: en verde.
5. Refactorizar manteniendo los tests verdes.
6. Verificar cobertura.

```powershell
pnpm --filter <pkg> run test
pnpm --filter <pkg> exec vitest run --coverage   # solo si COVERAGE=yes
```

En `@borondo/web` usar `run test:run`, nunca `run test` (modo watch).

## Tests obligatorios

- **Finanzas**: comisión de operador (% contractual inmutable), comisión de agente
  (`borondo_amount × rate`), IVA 19%/0%, penalidades de cancelación, Split Fare, retenciones.
  Montos en enteros COP; comparar valores exactos, nunca flotantes.
- **RBAC**: por cada guard, un caso permitido y uno denegado (prueba negativa por operación).
- **Máquinas de estado**: transiciones válidas e inválidas (reserva confirmada no se borra, solo se cancela).

## Patrón de test (vitest)

```typescript
import { describe, it, expect } from 'vitest'
import { commissionForOperator } from '../src/commission'

describe('comisión de operador', () => {
  it('aplica el porcentaje contractual sobre el monto en COP', () => {
    expect(commissionForOperator({ amountCop: 100_000, rate: 0.15 })).toBe(15_000)
  })

  it('rechaza una tasa fuera de [0,1]', () => {
    expect(() => commissionForOperator({ amountCop: 100_000, rate: 1.5 })).toThrow()
  })
})
```

## Fixtures y aislamiento

- Fixtures sin PII real: usar placeholders (`<email>`, `<documento>`).
- Cada test prepara sus propios datos; nada de dependencias entre tests ni efectos secundarios.
- Funciones puras en `packages/domain` que reciben dependencias (reloj, repos) por parámetro.
- Nombres de test descriptivos; estructura Arrange-Act-Assert.

## Property-based (opcional)

`fast-check` ya está en el monorepo; usarlo para reglas financieras solo con aprobación humana
(`pnpm add` es `ask`). No introducir Jest ni librerías fuera del stack.

## Errores comunes a evitar

- Probar detalles internos en lugar de comportamiento observable.
- Selectores frágiles en tests de componentes.
- Tests dependientes entre sí.
- Dinero en `float`.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/tdd-workflow` y `.kiro/agents/tdd-guide`, MIT,
Copyright (c) 2026 Affaan Mustafa. Ver `.kiro/factory/THIRD_PARTY.md`. Reescrito para vitest y
`packages/domain` de BorondoTours (sin Jest ni Supabase; tests obligatorios en finanzas, RBAC y estados).
