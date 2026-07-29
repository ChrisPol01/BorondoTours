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
| [[ADR-002-Meilisearch]] | Motor de búsqueda: pg_trgm (F1-2) → OpenSearch (F3+) | Aceptado (refinado por ADR-011) | 1→3 | 2025-07-14 |
| [[ADR-003-DynamoDB-Chat]] | Chat: DynamoDB + API Gateway WebSocket | Aceptado (refinado por ADR-011) | 1 | 2025-07-14 |
| [[ADR-004-Siigo-Facturacion]] | Facturación electrónica: Siigo API vs Onepayla POS | Aceptado | 2 | 2025-07-14 |
| [[ADR-005-Infra-MVP]] | Infra MVP: Railway/Render vs AWS ECS Fargate | **Superado por ADR-011** | 1→3 | 2025-07-14 |
| [[ADR-006-Seguridad-PII]] | Seguridad PII, WAF, Rate Limiting, Encriptación | Aceptado | 1 | 2026-04-06 |
| [[ADR-007-Politica-Cancelacion-Escalonada]] | Política de cancelación escalonada + Coins libres | Aceptado | 1 | 2026-04-06 |
| [[ADR-008-Infra-AWS-First]] | Infraestructura AWS-first desde Fase 1 (revisa ADR-005) | **Superado por ADR-011** | 1→3 | 2026-07-05 |
| [[ADR-009-Retenciones-Fiscales]] | Retenciones (ReteFuente/ReteICA/ReteIVA) en payouts a operadores | Aceptado | 1→2 | 2026-07-05 |
| [[ADR-010-Orquestacion-Impuestos-Siigo]] | Orquestación de impuestos: BorondoTours decide QUÉ, Siigo calcula CUÁNTO | Aceptado | 1→2 | 2026-07-05 |
| [[ADR-011-Arquitectura-Consolidada]] | **Arquitectura consolidada: Serverless-first (Lambda) + Monolito Modular** | **Aceptado (fuente de verdad)** | 1→3 | 2026-07-10 |

---

## Resumen de decisiones por área

### Pagos y Fiscal
- **ADR-001**: OnePay.la (antes Onepayla) recibe el 100% del pago. BorondoTours gestiona el split al operador internamente vía `OperatorPayouts`. No existe split nativo en la pasarela.
- **ADR-004**: Siigo API en Fase 2 para facturación electrónica DIAN. Incluye Notas Crédito automáticas para reembolsos.
- **ADR-009**: BorondoTours (S.A.S., responsable de IVA, NO autorretenedor) actúa como agente de retención. Aplica ReteFuente/ReteICA/ReteIVA sobre el bruto del operador al liquidar el payout. ReteICA territorial y configurable por municipio.
- **ADR-010**: Orquestación de impuestos. BorondoTours decide QUÉ impuestos aplican (catálogo `Taxes` + mapeo `ServiceTaxes`); Siigo calcula CUÁNTO y retorna el documento; se persiste en `Invoices` con idempotencia. ReteICA vía flag del documento.

### Búsqueda
- **ADR-002 (refinado por ADR-011)**: **PostgreSQL `pg_trgm`** cubre typo-tolerance en Fase 1 y 2. OpenSearch Serverless se difiere a Fase 3+ y solo si el volumen lo exige.

### Mensajería y Tiempo Real
- **ADR-003 (refinado por ADR-011)**: DynamoDB para historial (PK = booking_id) + tabla `Connections`. Tiempo real vía **API Gateway WebSocket API** (NO Socket.io, que no corre en Lambda).

### Infraestructura
- **ADR-005 (Superado por ADR-011)**: Proponía Railway/Render + Neon en Fase 1.
- **ADR-008 (Superado por ADR-011)**: AWS-first sobre **ECS Fargate**. El principio AWS-first sigue vigente, pero la plataforma de cómputo cambió a Lambda.
- **ADR-011 (fuente de verdad vigente)**: **Serverless-first sobre AWS Lambda** (Lambda-lith + API Gateway HTTP/WebSocket + RDS t4g.micro + RDS Proxy + DynamoDB + EventBridge/SQS/Step Functions + S3/CloudFront). Región us-east-1. Sin WAF/X-Ray/ElastiCache en Fase 1 (diferidos por costo). Incluye la arquitectura de software (monolito modular, dominio financiero puro, contratos Zod, REST, JWT propio, WatermelonDB) y la estrategia de DR por fases.

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
