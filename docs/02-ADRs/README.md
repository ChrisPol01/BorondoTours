# 📐 02-ADRs — Architecture Decision Records

Registro de decisiones de arquitectura con su contexto, opciones evaluadas y consecuencias.

| Archivo | Decisión | Estado |
|---|---|---|
| `ADR-Index.md` | Índice maestro de todos los ADRs y decisiones pendientes | — |
| `ADR-001-Onepayla-Split-Marketplace.md` | Pagos: OnePay.la recibe el 100%, split al operador interno vía OperatorPayouts | Aceptado |
| `ADR-002-Meilisearch.md` | Búsqueda: PostgreSQL ILIKE (Fase 1) → pg_trgm (F1-2) → OpenSearch (F3+) | Aceptado (refinado por ADR-011) |
| `ADR-003-DynamoDB-Chat.md` | Chat tripartito: DynamoDB con TTL + API Gateway WebSocket (ADR-011) | Aceptado (refinado por ADR-011) |
| `ADR-004-Siigo-Facturacion.md` | Facturación electrónica DIAN vía Siigo API (Fase 2) | Aceptado |
| `ADR-005-Infra-MVP.md` | Infra MVP en Railway/Neon | **Superado por ADR-011** |
| `ADR-006-Seguridad-PII.md` | Encriptación AES-256 PII, WAF, rate limiting, JWT RS256, audit log | Aceptado |
| `ADR-007-Politica-Cancelacion-Escalonada.md` | Cancelación en 3 franjas + Coins libres (sin restricción por operador) | Aceptado |
| `ADR-008-Infra-AWS-First.md` | Infraestructura AWS-first desde Fase 1 (revisa ADR-005) | **Superado por ADR-011** |
| `ADR-009-Retenciones-Fiscales.md` | ReteFuente/ReteICA/ReteIVA en payouts | Aceptado |
| `ADR-010-Orquestacion-Impuestos-Siigo.md` | BorondoTours decide qué impuestos, Siigo calcula cuánto | Aceptado |
| `ADR-011-Arquitectura-Consolidada.md` | Serverless-first (Lambda) + monolito modular. **Fuente de verdad** | Aceptado |
| `ADR-012` (por crear) | Hono + Astro vs NestJS + Vite: ver DECISIONES-PENDIENTES #1/#2 | Pendiente |
| `ADR-001-Plantilla.md` | Plantilla base de ADR | Referencia |

> Para crear un ADR nuevo: copiar `../Templates/ADR-Nuevo.md`, asignar el siguiente ID y actualizar `ADR-Index.md`.
> **Decisión de infra vigente:** ADR-011 (serverless-first sobre Lambda; ver `ADR-Index.md`). **Retenciones fiscales:** ADR-009.

