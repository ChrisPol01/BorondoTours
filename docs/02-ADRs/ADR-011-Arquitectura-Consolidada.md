---
tags: [adr, arquitectura, consolidada, serverless, lambda, aws, software, infraestructura]
id: ADR-011
titulo: Arquitectura Consolidada — Serverless-first (Lambda) + Monolito Modular
estado: Aceptado
created: 2026-07-10
updated: 2026-07-10
autores: [BorondoTours CTO]
supersedes: [ADR-005, ADR-008]
---

# ADR-011 — Arquitectura Consolidada: Serverless-first + Monolito Modular

## Estado
**Aceptado** — Supera a [[ADR-005-Infra-MVP]] y [[ADR-008-Infra-AWS-First]] (ambos quedan `Superados`).
Refina a [[ADR-002-Meilisearch]] (búsqueda) y [[ADR-003-DynamoDB-Chat]] (tiempo real).

## Contexto

Los ADR-005 y ADR-008 establecieron una arquitectura **AWS-first sobre ECS Fargate + RDS + ElastiCache**. Tras una revisión de arquitectura (software + infraestructura) se decidió migrar a un enfoque **serverless-first con AWS Lambda** para maximizar el modelo pago-por-uso y la elasticidad, aceptando conscientemente las reescrituras que esto implica (chat y jobs).

Este ADR consolida en un solo documento **todas** las decisiones de arquitectura de software e infraestructura, y pasa a ser la **fuente de verdad** para el stack. Donde otros documentos contradigan este ADR, este gana.

---

## PARTE A — Decisiones de Arquitectura de Software

| # | Decisión | Detalle |
|---|---|---|
| SW1 | **Monolito Modular** (no microservicios) | NestJS con módulos por dominio y fronteras estrictas. Un módulo se comunica con otro solo vía su service público o eventos, nunca tocando su repositorio/tablas. |
| SW2 | **Dominio financiero como funciones puras** | IVA, comisiones, penalidades escalonadas, Coins y Split Fare viven en funciones puras (sin framework ni BD) bajo `/domain/`. Máxima testabilidad. |
| SW3 | **API REST** (no GraphQL) | Formato `{ data, error, meta }`, paginación cursor-based, versionado `/api/v1/`. |
| SW4 | **Frontend React + Vite (SPA)** | 3 apps (B2C/ERP/B2B) en monorepo feature-based. NO Next.js. SEO público vía SSR selectivo en Fase 4. |
| SW5 | **Estado: Zustand + TanStack Query** | Zustand = estado de cliente (auth en memoria, cart, modales). TanStack Query = estado de servidor. Nunca mezclar. |
| SW6 | **Auth propio: JWT + Passport** (NO Cognito) | JWT RS256 stateless — modelo que escala barato a millones de usuarios (costo marginal ~$0/usuario). Cognito descartado por costo per-MAU a escala nacional. |
| SW7 | **Contratos Zod compartidos** | Paquete `/packages/contracts` con schemas Zod → tipos derivados, consumidos por backend (validación), frontend (tipos + forms) y mobile. Una sola fuente de verdad del contrato de API. |
| SW8 | **Mobile offline-first real** | React Native + Expo con **WatermelonDB** + sync engine (outbox + Last-Write-Wins). No AsyncStorage plano. |
| SW9 | **Patrones de dominio** | Máquina de estados explícita para Booking; Strategy para penalidades; idempotencia de webhooks; tenant isolation automático por `operator_id`. |

---

## PARTE B — Decisiones de Arquitectura de Infraestructura (Serverless-first)

| # | Capa | Decisión Fase 1 | Evolución |
|---|---|---|---|
| INF1 | **Región** | **us-east-1** (Norte de Virginia) | Multi-región solo en Fase 3+ (ver Parte D) |
| INF2 | **Compute API** | **AWS Lambda "Lambda-lith"** (NestJS completo con adaptador `serverless-express`) + **API Gateway HTTP API** | Sin cambio de plataforma al escalar |
| INF3 | **Base de datos** | **RDS PostgreSQL t4g.micro** (Graviton, Single-AZ, PostGIS) + **RDS Proxy** (connection pooling Lambda↔RDS) | t4g.small Multi-AZ (F2) → Aurora Serverless v2 (F3) |
| INF4 | **Tiempo real / Chat** | **API Gateway WebSocket API** + Lambdas (`$connect`/`$disconnect`/`sendMessage`) + DynamoDB (`Connections` + `ChatMessages` TTL 90d) | igual |
| INF5 | **Jobs / Asíncrono** | **EventBridge Scheduler** (cron) + **SQS** (colas + DLQ) + **Step Functions** (flujos multi-paso) | igual |
| INF6 | **Caché / Rate-limit / Contadores** | Sin ElastiCache. Rate-limit → **API Gateway throttling**; contadores diarios (`ads_viewed_today`) e idempotencia → **DynamoDB con TTL**; caché de lectura → **CloudFront + TanStack Query staleTime** | ElastiCache Serverless solo si se justifica en F3 |
| INF7 | **Búsqueda** | **PostgreSQL + `pg_trgm`** (typo-tolerance nativa) | OpenSearch Serverless solo en Fase 3+ si el volumen lo exige |
| INF8 | **Frontend hosting** | **S3 privado + CloudFront + OAC** | igual |
| INF9 | **Auth infra** | **Lambda Authorizer** en API Gateway valida el JWT propio | igual |
| INF10 | **Archivos** | **S3 privado + presigned URLs** (pasaportes, docs, media); SSE-KMS | Glacier Deep Archive docs fiscales 5 años |
| INF11 | **Secretos** | **AWS Secrets Manager** (inyectados a Lambda) | igual |
| INF12 | **Email / Push** | **AWS SES** (email/OTP) + **Expo Push** (mobile) | + SMS (AWS SNS) en F2 |
| INF13 | **DNS / TLS** | **Route 53 + ACM** | + Health Checks (F3) |
| INF14 | **Observabilidad** | **CloudWatch Logs** (JSON + request_id) + **CloudWatch Alarms → SNS → email** + **AWS Budgets + Cost Anomaly Detection** + **SQS DLQ** | + X-Ray y Container Insights en F3 |
| INF15 | **IaC** | **AWS SAM + CloudFormation** — nested stacks por dominio, separados por ambiente (dev/staging/prod) | igual |
| INF16 | **CI/CD** | **GitHub Actions** → tests → `sam deploy`. Frontend: build Astro → `s3 sync` → invalidación CloudFront | igual |

### Servicios explícitamente NO incluidos en Fase 1 (por costo — riesgo aceptado)
- **AWS WAF** — la API pública B2C queda sin protección L7 gestionada en Fase 1. Se reintroduce cuando haya tráfico real. Mitigación temporal: API Gateway throttling + Lambda Authorizer.
- **AWS X-Ray** — tracing distribuido diferido a Fase 3.
- **ElastiCache Redis** — eliminado (ya no hay BullMQ que lo requiera).
- **ECS Fargate** — reemplazado por Lambda (ver Parte C).

---

## PARTE C — Alternativas evaluadas y descartadas

### C1. ECS Fargate (era la decisión de ADR-005/008) — DESCARTADA
- **Pros:** mantiene Socket.io y BullMQ sin reescritura; sin cold starts; costo fijo predecible (~$9/mes compute).
- **Contras:** paga cómputo 24/7 aunque no haya tráfico; NAT Gateway + ALB dominan el costo (~$53/mes).
- **Razón del descarte:** se priorizó el modelo pago-por-uso y la elasticidad de Lambda para un producto con tráfico esporádico en fase temprana (demos).

### C2. Aurora Serverless v2 desde Fase 1 — DESCARTADA para F1
- Más cara que RDS t4g.micro para tráfico bajo constante (~$43 vs ~$12/mes). Se adopta en Fase 3.

### C3. Cognito — DESCARTADA
- Gratis hasta 10k MAU, pero $0.015/MAU escala mal a nivel nacional. El JWT propio (SW6) es el modelo de costo marginal ~$0.

### C4. GraphQL / AppSync — DESCARTADA
- No aporta sobre REST con 4 clientes controlados. Añade complejidad (resolvers, N+1, caché). AppSync además tiene costo innecesario para el volumen actual.

### C5. OpenSearch Serverless en Fase 1-2 — DIFERIDA
- Piso de costo por OCU no se justifica en MVP. `pg_trgm` cubre typo-tolerance gratis hasta Fase 3+.

---

## PARTE D — Disaster Recovery (RTO/RPO) por fase

> **Nota:** Los RTO agresivos (B2B < 1 min, supervivencia a caída de región) fueron una exploración interna, NO un requisito del inversionista. El DR multi-región es costoso y se difiere hasta que el volumen de facturación lo justifique.

| Fase | Estrategia DR | RTO | RPO | Mecanismo |
|---|---|---|---|---|
| **Fase 1 (MVP)** | Backup & Restore, single-región | 1-4 h | ≤24 h | RDS PITR (7d) + snapshots + S3 versioning. **No sobrevive a caída de región** (asumido). |
| **Fase 2** | Pilot Light | 30-60 min | minutos | RDS con read replica cross-región (apagada), SAM listo para desplegar Lambda en 2ª región |
| **Fase 3** | Aurora Global Database + (opcional) activo-activo | < 1-2 min | ~1 s | Aurora Global (replicación cross-región), Route 53 failover, DynamoDB Global Tables para chat/contadores |

**Cuello de botella conocido:** el estado transaccional vive en RDS/Aurora. El RTO < 1-2 min cross-región **solo** es alcanzable con **Aurora Global Database** (Fase 3). Las capas stateless (Lambda, API Gateway, S3/CloudFront) son fáciles de multi-región y no son el limitante.

---

## PARTE E — Cascada de reescrituras que introduce esta decisión

La migración de ECS a Lambda arrastra trabajo real que debe planificarse:

| Elemento | Antes (ECS) | Ahora (Lambda) | Impacto |
|---|---|---|---|
| Chat tripartito | Socket.io (NestJS Gateway) | API Gateway WebSocket + Lambda + DynamoDB `Connections` | Reescritura backend + hook `useSocket` frontend |
| Ka-ching / Leaderboard ERP | Socket.io | API Gateway WebSocket | Reescritura |
| Radar en vivo (F3) | Socket.io | API Gateway WebSocket | Reescritura |
| Jobs (conciliación, Split Fare, recordatorios, SOAT, reseñas) | BullMQ + Redis | EventBridge Scheduler + SQS + Step Functions | Reescritura de todos los jobs |
| Rate limiting | nestjs/throttler + Redis | API Gateway throttling | Config |
| Contador `ads_viewed_today` | Redis TTL | DynamoDB TTL + `UpdateItem ADD` | Cambio de implementación |
| Conexión a BD | Pool directo | RDS Proxy | Config + IAM |

---

## Costo estimado Fase 1 (Lambda-first)

| Servicio | ~USD/mes |
|---|---|
| Lambda + API Gateway (HTTP + WS) | 0-10 (pago por uso) |
| RDS t4g.micro | 12 |
| RDS Proxy | 15 |
| DynamoDB (chat + contadores + conexiones) | 1-5 |
| SQS + EventBridge + Step Functions | 0-3 |
| S3 + CloudFront | 5 |
| Secrets Manager + VPC endpoints | 8 |
| **Total** | **~45-60/mes** |

> El cómputo escala a casi-cero en inactividad (ventaja Lambda). El costo no es dramáticamente menor que ECS, pero es elástico y pago-por-uso.

---

## Consecuencias

### Positivas
- Modelo pago-por-uso; cómputo a casi-cero en inactividad.
- Un solo target de IaC (SAM + CloudFormation) y coherencia total de documentación.
- Auth propio y monolito modular = escalabilidad de costo y de código sin re-arquitectura.

### Negativas / Trade-offs
- Reescritura de chat (Socket.io → API GW WebSocket) y jobs (BullMQ → EventBridge/SQS/Step Functions).
- Cold start ~2-4s en Lambda-lith en VPC tras inactividad (aceptado en Fase 1, sin Provisioned Concurrency).
- Sin WAF ni X-Ray en Fase 1 (riesgo de seguridad/observabilidad aceptado conscientemente).
- RDS Proxy + VPC endpoints acercan el costo al de ECS (el ahorro real es la elasticidad, no el precio absoluto).

### Acciones derivadas
- [ ] Crear IaC SAM: VPC, Lambda (Hono+LWA), API Gateway (HTTP + WebSocket), RDS t4g.micro + RDS Proxy, DynamoDB, SQS, EventBridge, Step Functions, S3, CloudFront, Secrets Manager
- [ ] Definir paquete `/packages/contracts` (Zod compartido)
- [ ] Migrar diseño de chat a API Gateway WebSocket (actualizar ADR-003)
- [ ] Migrar diseño de jobs a EventBridge/SQS/Step Functions
- [ ] Actualizar steering `02-tech-stack` y `11-inventario-tecnico-aws`

## Referencias
- [[ADR-005-Infra-MVP]] (superado)
- [[ADR-008-Infra-AWS-First]] (superado)
- [[ADR-002-Meilisearch]] (refinado: pg_trgm F1-2)
- [[ADR-003-DynamoDB-Chat]] (refinado: API GW WebSocket)
- [[../04-Tech-Design/Arquitectura-Sistema]]
- [[../00-Inicio/Stack-Tecnologico]]
