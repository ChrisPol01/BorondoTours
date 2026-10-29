---
role: product-manager
agent: sdlc-product-manager
feature: b2c-funcional-con-datos-simulados-y
updatedAt: 2026-10-24T13:00:00.000Z
lastEventId: (ver events.jsonl, publicación prd@v3)
---

## Estado

prd@v3 publicado (modo contract, discovery.review iteración 3). Corrige R2-03 de `reviews/discovery.review-2.json`. Faltan las firmas de business-analyst, compliance-officer y solutions-architect sobre v3.

## Hecho

- R2-03 (low): AC-009-6 ahora dice que, cuando todos los participantes vigentes pagaron su % de reserva, la reserva pasa a payment_status PARTIAL_PAID, muestra la etiqueta "Reserva confirmada con saldo pendiente" y aparece en Por pagar. Cuando todos los vigentes (sin contar FORFEITED ni SLOT_RELEASED) pagan su saldo, pasa a CONFIRMED y a Próximas. La exclusión de FORFEITED y SLOT_RELEASED coincide con el cambio que R2-01 pide en el guard de EdgeCases.
- No cambió nada más del PRD.

## Pendiente

- Firmas de prd@v3.
- Cofirmar edge-cases y compliance-requirements cuando se republiquen (modo sign). En EdgeCases, verificar que R2-01 deje el guard PARTIAL_PAID→CONFIRMED contando solo a los vigentes, igual que AC-009-6.

## Decisiones y supuestos

- Siguen vigentes los supuestos del handoff anterior: Spec-C RF-C06 prevalece sobre el resumen del steering 05, y el redondeo lo fija domain-rules.
- Q-01 a Q-06 y las pendingDecisions (#1, #2 y dep:qrcode) siguen igual, sin bloqueo.

## Bloqueos

- Ninguno.

## Siguiente paso

- business-analyst corrige R2-01 y R2-02 y republica; compliance-officer revisa su dependsOn. Después viene la revisión final (iteración 3).

## Artefactos tocados

- prd@v3
