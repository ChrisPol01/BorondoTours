---
inclusion: always
---
# Reglas de negocio críticas (resumen)

Detalle: `docs/03-Knowledge/Reglas-Negocio-Detalle.md`, `Modelo-Comisiones.md`, ADR-007.

- Reserva confirmada nunca se borra, solo se cancela. Precio se congela al crear el booking. Cotización vigente 72h.
- El webhook de OnePay.la es la única fuente de verdad del pago; idempotente por `webhook_event_id`.
- Split Fare: `HOLD_GROUP` hasta 100% pagado; cuota de reserva no reembolsable si no se paga el saldo.
- IVA 19% residentes; extranjeros 0% con pasaporte en S3 privado (5 años).
- Comisión operador = % contractual inmutable (historial). Comisión agente = `borondo_amount` × rate.
- Cancelación: ≥10 días penalidad 40%; 5-9 días 60%; <5 días y No Show 100%; fuerza mayor con soporte reduce. Saldo a favor como crédito interno; reembolso bancario solo retracto, fuerza mayor del operador u orden judicial.
- Borondo Coins/niveles: EN PAUSA (Spec-E); no mostrar Coins en el B2C.
- Tours nuevos: PENDING_REVIEW → PUBLISHED; cambios vía TourEditRequest.
- Cupos con `SELECT FOR UPDATE`; sin overbooking.
- Retenciones (ReteFuente/ICA/IVA) en payouts: ADR-009/010. Contabilidad: BorondoTours es principal (NIIF 15), ver `docs/03-Knowledge/Estructura-Contable.md`.
- Yield score interno, invisible al público.