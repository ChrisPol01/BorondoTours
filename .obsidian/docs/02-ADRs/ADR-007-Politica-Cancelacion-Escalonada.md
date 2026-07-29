---
tags: [adr, cancelacion, penalidades, coins, contabilidad]
created: 2026-06-06
status: aceptada
---

# ADR-007 — Política de Cancelación Escalonada y Tratamiento de Penalidades

## Contexto

El Spec-C original definía una política binaria de cancelación:
- ≥5 días → reembolso 100% en Coins (incluyendo "Coins restringidos")
- <5 días → penalidad 100%

Tras validación con la socia experta en turismo (junio 2026), se confirmó que la realidad del negocio tiene **3 franjas escalonadas** con penalidades graduales, además de un tratamiento especial para fuerza mayor con documento médico (EPS).

## Decisión

### Política de cancelación escalonada (por defecto)

| Ventana temporal | Cancelación normal | Fuerza mayor (doc EPS) |
|------------------|-------------------|------------------------|
| ≥10 días | Reprogramar gratis. Reembolso: penalidad 40% | Penalidad 10% |
| 5–9 días | Penalidad 60% | Penalidad 30% (transporte) |
| <5 días | Penalidad 100% | Caso por caso (COORD decide) |
| No Show | Penalidad 100% | N/A |

### Eliminación de Coins Restringidos

La socia confirmó que los Coins NO deben restringirse por operador. El cliente puede usar sus Coins con cualquier operador de la plataforma. Esto simplifica:
- Se elimina el campo `restricted_operator_id` de `WalletTransactions`
- Se elimina la tabla `RestrictedCoinBalances`
- Se eliminan los BullMQ jobs de expiración de Coins
- La tabla `Wallets` solo necesita un campo `balance` único

### Cuota inicial no reembolsable

La cuota de reserva (% definido por el operador) NO se devuelve si el cliente no completa el saldo. Se registra como ingreso por penalidad.

### Configuración por operador

La mayoría de operadores usan la misma política. Se implementa como:
- Política por defecto global (hardcoded en servicio, configurable desde SUPER_ADMIN)
- Para operadores con política diferente: tabla `CancellationPolicies` vinculada a `OperatorContracts`

### Tratamiento contable

Bajo NIIF 15, la penalidad por cancelación se reconoce como **ingreso ordinario** en el momento en que el contrato se termina. Se clasifica en la cuenta PUC 4135 (Servicios de agencia de viajes). Se factura electrónicamente vía Siigo en Fase 2.

## Opciones evaluadas

1. **Política binaria simple (original)** — Descartada por no reflejar la realidad del negocio
2. **Política 100% configurable por operador** — Complejidad innecesaria para el MVP (la mayoría usa la misma)
3. **Política por defecto + override por operador** — Seleccionada

## Consecuencias

- Se debe actualizar Spec-C (hecho), Spec-D, Spec-E, Modelo-Datos-Core
- La tabla `Wallets` se simplifica (solo `balance`, sin `balance_free`/`balance_restricted`)
- Se agrega tabla `PenaltyIncome` para trazabilidad contable
- Se agrega `amount_paid`/`amount_due` a `Bookings` para soportar pagos parciales
- Los tests de cálculo de penalidades son OBLIGATORIOS (lógica financiera)

## Links

- Spec-C-Checkout §9b
- Modelo-Comisiones
- Spec-D-Client-Portal
- Spec-E-Loyalty
