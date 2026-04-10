---
tags: [adr, arquitectura]
created: 2025-07-14
updated: 2026-04-06
---

# 📐 Índice de ADRs — BorondoTours

---

## Registro

| ID | Título | Estado | Fase | Fecha |
|---|---|---|---|---|
| [[ADR-001-Onepayla-Split-Marketplace]] | Arquitectura de pagos: OnePay.la (antes Onepayla) + Split interno | Aceptado | 1 | 2025-07-14 |
| [[ADR-002-Meilisearch]] | Motor de búsqueda: Meilisearch vs Elasticsearch | Aceptado | 2 | 2025-07-14 |
| [[ADR-003-DynamoDB-Chat]] | Chat: DynamoDB vs PostgreSQL | Aceptado | 2 | 2025-07-14 |
| [[ADR-004-Siigo-Facturacion]] | Facturación electrónica: Siigo API vs Onepayla POS | Aceptado | 2 | 2025-07-14 |
| [[ADR-005-Infra-MVP]] | Infra MVP: Railway/Render vs AWS ECS Fargate | Aceptado | 1→3 | 2025-07-14 |
| [[ADR-006-Seguridad-PII]] | Seguridad PII, WAF, Rate Limiting, Encriptación | Aceptado | 1 | 2026-04-06 |

---

## Resumen de decisiones por área

### Pagos y Fiscal
- **ADR-001**: OnePay.la (antes Onepayla) recibe el 100% del pago. BorondoTours gestiona el split al operador internamente vía `OperatorPayouts`. No existe split nativo en la pasarela.
- **ADR-004**: Siigo API en Fase 2 para facturación electrónica DIAN. Incluye Notas Crédito automáticas para reembolsos.

### Búsqueda
- **ADR-002**: PostgreSQL ILIKE en Fase 1 (suficiente para el MVP). Migración a Meilisearch en Fase 2, con la misma interfaz de API para el frontend (cambio transparente).

### Mensajería y Tiempo Real
- **ADR-003**: DynamoDB para historial de mensajes del chat tripartito (PK = booking_id). Socket.io (NestJS Gateway) para tiempo real. PostgreSQL no absorbe la carga del chat.

### Infraestructura
- **ADR-005**: Railway o Render con Docker en Fase 1 (velocidad de deploy). Migración a AWS ECS Fargate + Aurora PostgreSQL en Fase 3 (escala y disponibilidad).

### Seguridad y Datos Personales
- **ADR-006**: Encriptación AES-256 para campos PII, AWS WAF, rate limiting (100/30 req/min), JWT RS256, audit logging completo. Cumple Ley 1581 de 2012.

---

## Decisiones pendientes de validar

| Tema | Pregunta abierta | Responsable |
|---|---|---|
| OnePay.la split nativo | Confirmar con soporte OnePay.la si hay algún producto de marketplace no documentado | CTO |
| Siigo API | Validar que la API permite crear liquidaciones a proveedores y Notas Crédito | CTO |
| % de reserva Split Fare | Definir el % por defecto que usan los primeros operadores al onboardear | OPERATOR_ADMIN |
| LocalStack local | Confirmar que LocalStack replica fielmente DynamoDB TTL para tests de chat | CTO |
| Meilisearch sinónimos | Revisar y ampliar la lista de sinónimos Colombia-específicos antes de Fase 2 | CTO + Ops |
| OnePay.la Refund API | Validar si OnePay.la tiene API de reembolso automático | CTO |

---

## Cómo crear un nuevo ADR

1. Copia la plantilla `../Templates/ADR-Nuevo.md`
2. Asigna el siguiente ID secuencial (ADR-006, ADR-007…)
3. Documenta el contexto antes de tomar la decisión
4. Registra las opciones evaluadas con pros/contras
5. Escribe la decisión en una oración clara
6. Actualiza este índice

> Un ADR en estado `Propuesto` no requiere aprobación del equipo completo, pero sí debe discutirse antes de pasar a `Aceptado`.
