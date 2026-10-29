---
role: business-analyst
agent: sdlc-business-analyst
feature: b2c-funcional-con-datos-simulados-y
updatedAt: 2026-10-24T13:20:00.000Z
lastEventId: (ver events.jsonl, publicacion edge-cases@v3)
---

## Estado

`edge-cases@v3` publicado (modo contract, discovery.review iteracion 3). Corrige R2-01 (medium) y R2-02 (low) de `reviews/discovery.review-2.json`. Faltan las firmas de product-manager y solutions-architect sobre v3. La firma de prd@v3 por business-analyst va en el modo sign.

## Hecho

- R2-01 (a): split-participant ya no declara SLOT_RELEASED como terminal (terminal: BALANCE_PAID y FORFEITED). Se agrego una nota a la maquina. participant_new_link solo es valido con el booking en IN_PAID, PARTIAL_PAID o EXPIRED_PAID, lifecycle ACTIVE, con cupo y antes de balance_due_date. Nuevas invalidTransitions: without_slot (sold_out), after_balance_due_date (balance_due_date_passed), on_confirmed_booking (invalid_state) y FORFEITED con participant_new_link (invalid_state).
- R2-01 (b): se eligio la opcion de reabrir. booking-payment tiene PARTIAL_PAID->IN_PAID con el evento split_participant_reopened (guard: Divide tu cuenta, participante reabierto y hoy no posterior a balance_due_date; idempotencyKey participant_link_id). Asi se mantiene la regla de AC-009-6 y AC-009-7: PARTIAL_PAID solo si todos los vigentes pagaron la reserva. split_all_reservations_paid ahora usa como idempotencyKey el id del evento que cierra la fase, no booking_reference, para que la fase se pueda cerrar una segunda vez (EC-085).
- R2-01 (c): nuevo evento split_all_balances_paid (PARTIAL_PAID->CONFIRMED). Exige al menos un vigente y todos los vigentes en BALANCE_PAID, sin contar FORFEITED ni SLOT_RELEASED. Coincide con AC-009-6 de prd@v3. balance_paid y el balance_due_date_passed de lifecycle quedan solo para reservas individuales. Nuevo split_all_participants_forfeited (ACTIVE->CANCELED) para el caso en que no queda ningun vigente (EC-084).
- Conventions nuevas: splitVigentes; splitGroupRecalc, que fija el orden en que recalcular_fase_del_grupo dispara a lo sumo un evento del booking; bookingTabsPrecedence.
- R2-02: bookingTabs queda ordenado (oculta, canceladas, completadas, por-pagar, proximas) y gana la primera regla que se cumple. IN_PAID, PAYMENT_FAILED y EXPIRED_PAID con fecha pasada van a Canceladas con la etiqueta Vencida. CONFIRMED y SETTLED pasadas sin cierre van a Completadas con la etiqueta En cierre y sin calificar. Nueva clave bookingTabsUnreachable: PARTIAL_PAID pasada, TOUR_CANCELLED_ONSITE y cierre operativo sin pago, cada una con su razon, y el validador de la semilla las rechaza. EC-080 cubre todo esto.
- EC-031, EC-051, EC-080, EC-081 y EC-083 se reescribieron. Nuevos: EC-084 (todos los vigentes FORFEITED) y EC-085 (idempotencia del segundo cierre de HOLD_GROUP). Hay 85 EC, cada uno con storyRef, testLevel y ownerRole.

## Pendiente

- Firmas de edge-cases@v3: product-manager y solutions-architect.
- compliance-officer: revisar su dependsOn (edge-cases paso a v3).
- domain-rules suma como vectores EC-084 y EC-085, ademas de la lista anterior.
- Iteracion 3 (final) de discovery.review.

## Decisiones y supuestos

- R2-01: se eligio reabrir el booking (PARTIAL_PAID->IN_PAID) en lugar de dejarlo en PARTIAL_PAID con un participante sin reserva pagada, porque asi se cumple AC-009-6.
- Las etiquetas Vencida y En cierre son textos propuestos y los confirma product-manager. Siguen vigentes OQ-EC-01 a OQ-EC-04.
- Los estados de split-participant y reschedule-request siguen siendo propuestos y los formaliza data-modeler en contracts.
- No se tocaron las decisiones #1, #2 ni #15. No hay PII.

## Bloqueos

- Ninguno. Nota de motor: status --mode contract devolvio skippable:true aunque R2-01 y R2-02 estaban abiertos (el mismo defecto que esta en debt[] de la revision 2). Se trabajo igual porque el bucle de revision lo exige.

## Siguiente paso

- discovery.review iteracion 3 sobre prd@v3, edge-cases@v3 y compliance-requirements.

## Artefactos tocados

- edge-cases@v3
