---
tags: [adr, fiscal, impuestos, siigo, facturacion, orquestacion]
created: 2026-07-05
updated: 2026-07-05
status: Aceptado
fase: "1→2"
---

# ADR-010 — Orquestación de Impuestos con Siigo

## Estado
**Aceptado** — Complementa [[ADR-004-Siigo-Facturacion]] y [[ADR-009-Retenciones-Fiscales]].

## Contexto

Se analizó un sistema contable de referencia (documentado en `../03-Knowledge/Referencia-Sistema-Impuestos-EVA.md`) que resolvió la facturación con impuestos en Colombia de forma robusta. Su principio central es aplicable a BorondoTours:

> El sistema propio **no calcula** los valores tributarios. Decide **QUÉ** impuestos aplican y delega el **CUÁNTO** al sistema contable (Siigo), que retorna los montos oficiales.

BorondoTours factura varios servicios (venta de tours con IVA 19%/0%, penalidades, comisiones, liquidaciones a operadores con retenciones). Calcular impuestos internamente es frágil y propenso a errores fiscales.

## Decisión

Adoptar el patrón de **orquestación**:

1. **Catálogo de impuestos (`Taxes`)**: tarifas + código Siigo, centralizado (reemplaza tarifas dispersas).
2. **Mapeo servicio → impuestos (`ServiceTaxes`)**: cada `service_kind` (TOUR_SALE, PENALTY, OPERATOR_PAYOUT, etc.) declara qué impuestos aplican. Configuración por servicio, no por cliente.
3. **BorondoTours envía los IDs de impuesto a Siigo**; Siigo calcula y retorna la factura con los montos definitivos.
4. **BorondoTours persiste el resultado (`Invoices`)** para trazabilidad: subtotal, tax_value, total, balance.

**Reglas derivadas del patrón:**
- **ReteICA no se calcula en BorondoTours.** Se controla con un flag en el tipo de documento de Siigo; Siigo aplica la tarifa según la actividad económica y municipio del tercero (territorialidad — ADR-009). Los campos `reteica_pct`/`applies_reteica` en `Operators` sirven como configuración/estimación de Fase 1 y para determinar el flag del documento.
- **Idempotencia obligatoria:** cada creación de documento usa un `idempotency_key` (`Invoices.idempotency_key` UNIQUE) para evitar duplicados en reintentos.
- **Exclusiones legales documentadas:** cuando un servicio está exento/excluido de un impuesto (ej. IVA 0% a extranjeros con pasaporte, RF-C04), se registra la referencia legal en `Invoices.observations`.
- **Retry con backoff** ante errores 5xx/429 de Siigo (patrón Step Function / BullMQ).

## Relación con Fases

| Fase | Cálculo de impuestos | Documento |
|---|---|---|
| Fase 1 | Estimación interna de referencia (IVA en checkout, retención estimada en payout) | Sin Siigo (manual) |
| Fase 2 | **Siigo es autoritativo** — retorna montos oficiales; BorondoTours persiste en `Invoices` | Factura electrónica DIAN, Nota Crédito, Documento Soporte, Nota de Liquidación |

> **Reconciliación con ADR-009:** los campos `retefuente_amount`/`reteica_amount`/`reteiva_amount` en
> `OperatorPayouts` almacenan, en Fase 2, el valor **devuelto por Siigo**. En Fase 1 son estimaciones.

## Consecuencias

- **Positivas:** cumplimiento fiscal delegado al sistema especialista; tarifas centralizadas y editables sin recompilar; trazabilidad completa de documentos; se evita reimplementar reglas DIAN.
- **Negativas:** dependencia de disponibilidad de Siigo (mitigada con retry + conciliación); requiere mantener el catálogo `Taxes` y el mapeo `ServiceTaxes` sincronizados con Siigo.
- **Datos nuevos:** `Taxes` (§49), `ServiceTaxes` (§50), `Invoices` (§51) en Modelo-Datos-Core.

## Referencias
- [[../03-Knowledge/Referencia-Sistema-Impuestos-EVA]] (sistema de referencia analizado)
- [[ADR-004-Siigo-Facturacion]] · [[ADR-009-Retenciones-Fiscales]]
- [[../03-Knowledge/Modelo-Datos-Core]] §49–51
- [[../01-Specs/Spec-C-Checkout]] RF-C04 (IVA/exención)
