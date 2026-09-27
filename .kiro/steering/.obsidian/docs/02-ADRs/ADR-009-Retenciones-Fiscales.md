---
tags: [adr, fiscal, retenciones, dian, ica, payouts, colombia]
created: 2026-07-05
updated: 2026-07-05
status: Aceptado
fase: "1→2"
---

# ADR-009 — Retenciones Fiscales en Liquidaciones a Operadores

## Estado
**Aceptado**

## Contexto

BorondoTours es una **S.A.S. formalizada**, por lo tanto:
- **Responsable de IVA (Régimen Común):** debe cobrar y declarar IVA.
- **NO es autorretenedor de renta:** esa calidad la otorga la DIAN por resolución especial. Cuando BorondoTours venda a una empresa grande, esa empresa le retendrá a BorondoTours (flujo entrante, no modelado aquí).
- **SÍ es agente de retención:** por ser persona jurídica, la ley obliga a retener impuestos al pagar a proveedores/operadores.

Las liquidaciones (`OperatorPayouts`) calculaban `bruto − comisión − chargebacks` pero **no modelaban retenciones**, lo que es un incumplimiento fiscal al pagar a operadores.

## Decisión

Modelar **tres retenciones configurables** que se aplican SOBRE el monto bruto del operador (nunca sobre la comisión de BorondoTours) al liquidar el payout:

| Retención | Regla | Configuración |
|---|---|---|
| **ReteFuente** | Servicios: 4% (declarante de renta) / 6% (no declarante). Honorarios: 10%–11% | Derivada de `Operators.is_income_tax_declarant`; override en `retefuente_pct` |
| **ReteICA** | Territorial: la tarifa depende del municipio donde se **presta el servicio** (principio de territorialidad), no de la sede de BorondoTours (Cali) | `Operators.reteica_pct` (por mil) + `applies_reteica` — configurable por operador/municipio |
| **ReteIVA** | 15% del IVA. Uso acotado (régimen simplificado, entidades extranjeras). Se deja programada como blindaje futuro | `OperatorPayouts.reteiva_amount` |

**Flujo de cálculo en el payout:**
```
Base del operador (bruto)        = $100
− ReteFuente (ej. 4%)            = $4
− ReteICA (ej. 10 por mil = 1%)  = $1
− ReteIVA (si aplica)            = $0
= total_withholdings             = $5   → pasivo por impuestos ante la DIAN
Payout real transferido          = gross − commission − chargebacks − total_withholdings
```

**Campos añadidos:**
- `Operators`: `operator_class` (CORPORATE | LOCAL_MICRO), `tax_regime` (RESPONSABLE_IVA | NO_RESPONSABLE_IVA), `is_income_tax_declarant`, `retefuente_pct`, `reteica_pct`, `applies_reteica`.
- `OperatorPayouts`: `retefuente_amount`, `reteica_amount`, `reteiva_amount`, `total_withholdings`; `net_payout` recalculado.

## Justificación de la territorialidad del ICA

El ICA se causa donde se presta efectivamente el servicio. Un tour en Buenaventura o Calima El Darién puede tener obligación y tarifa distintas a Cali. Algunos municipios obligan a retener a empresas foráneas; otros no lo permiten si no hay establecimiento físico. Por eso **la tarifa ReteICA NO se hardcodea**: es un parámetro por operador (o por ubicación del tour) que el contador ajusta por municipio. Si un municipio no aplica, el parámetro queda en 0%.

## Consecuencias

- **Positivas:** cumplimiento fiscal desde el diseño; automatiza ~80% del trabajo contable; escalable a cualquier municipio sin recompilar.
- **Negativas:** requiere que el contador mantenga las tarifas ICA por operador/municipio; la lógica de derivación de ReteFuente debe cubrir servicios vs honorarios.
- **Relacionado:** Documento Soporte Electrónico para operadores NO_RESPONSABLE_IVA (Siigo, Fase 2 — ADR-004).

> **Actualización (ADR-010):** conforme a la orquestación con Siigo, en Fase 2 los montos de retención
> los **calcula Siigo** (BorondoTours solo indica qué impuestos aplican vía el catálogo `Taxes` y el tipo
> de documento). Los campos `*_amount` de `OperatorPayouts` persisten el valor devuelto por Siigo; en
> Fase 1 son estimaciones. El ReteICA se controla con el flag del tipo de documento, no se computa aquí.

## Referencias
- [[../03-Knowledge/Modelo-Datos-Core]] (Operators §2, OperatorPayouts §14, Taxes §49)
- [[../03-Knowledge/Modelo-Comisiones]]
- [[ADR-004-Siigo-Facturacion]] · [[ADR-010-Orquestacion-Impuestos-Siigo]]
