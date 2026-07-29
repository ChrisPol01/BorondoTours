---
tags: [tech-design, estructura, carpetas, setup, monorepo]
created: 2026-06-07
updated: 2026-06-07
status: aprobado
---

# Estructura del Proyecto — BorondoTours

> Monorepo con 2 aplicaciones principales (backend + frontend) + documentación.
> El backend es un monolito modular NestJS (no microservicios).
> El frontend es un SPA React que sirve las 3 apps web (B2C, ERP, B2B) desde un solo build.

---

## 1. Estructura Raíz (Monorepo)

```
borondotours/
|-- backend/                    <- Bun + NestJS (API + Workers)
|-- frontend/                   <- React 19 + Vite 6 (SPA multi-app)
|-- mobile/                     <- React Native + Expo (Fase 3)
|-- docs/                       <- Documentación del proyecto
|-- .github/workflows/          <- CI/CD pipelines
|-- docker-compose.yml          <- PostgreSQL + Redis (dev local)
|-- .env.example
|-- .gitignore
|-- README.md
```

---

## 2. Backend — Estructura Detallada

```
backend/
|-- src/
|   |-- main.ts                          <- Entry point (Bun + NestJS bootstrap)
|   |-- app.module.ts                    <- Root module
|   |
|   |-- config/                          <- Configuración por entorno
|   |   |-- app.config.ts
|   |   |-- database.config.ts
|   |   |-- redis.config.ts
|   |   |-- s3.config.ts
|   |   |-- ses.config.ts
|   |   |-- onepay.config.ts
|   |
|   |-- database/
|   |   |-- schema/                      <- Drizzle schema (1 archivo por tabla, 41 total)
|   |   |   |-- users.schema.ts
|   |   |   |-- operators.schema.ts
|   |   |   |-- tours.schema.ts
|   |   |   |-- tour-instances.schema.ts
|   |   |   |-- bookings.schema.ts
|   |   |   |-- booking-passengers.schema.ts
|   |   |   |-- wallets.schema.ts
|   |   |   |-- wallet-transactions.schema.ts
|   |   |   |-- user-stats.schema.ts
|   |   |   |-- loyalty-config.schema.ts
|   |   |   |-- loyalty-levels.schema.ts
|   |   |   |-- coin-reward-config.schema.ts
|   |   |   |-- operator-contracts.schema.ts
|   |   |   |-- operator-payouts.schema.ts
|   |   |   |-- agent-commissions.schema.ts
|   |   |   |-- quotations.schema.ts
|   |   |   |-- ads.schema.ts
|   |   |   |-- reviews.schema.ts
|   |   |   |-- vehicles.schema.ts
|   |   |   |-- index.ts                 <- Re-exporta todos los schemas
|   |   |-- migrations/                  <- Versionadas (drizzle-kit generate)
|   |   |-- seeds/                       <- Datos iniciales
|   |   |-- drizzle.provider.ts
|   |
|   |-- shared/                          <- Código compartido entre módulos
|   |   |-- guards/
|   |   |   |-- roles.guard.ts
|   |   |   |-- tenant.guard.ts
|   |   |   |-- throttle.guard.ts
|   |   |-- interceptors/
|   |   |   |-- response.interceptor.ts
|   |   |   |-- logging.interceptor.ts
|   |   |-- decorators/
|   |   |   |-- roles.decorator.ts
|   |   |   |-- current-user.decorator.ts
|   |   |   |-- tenant-isolated.decorator.ts
|   |   |-- filters/
|   |   |   |-- http-exception.filter.ts
|   |   |   |-- validation.filter.ts
|   |   |-- pipes/
|   |   |   |-- validation.pipe.ts
|   |   |-- interfaces/
|   |   |   |-- pagination.interface.ts
|   |   |   |-- api-response.interface.ts
|   |   |-- utils/
|   |       |-- slug.util.ts
|   |       |-- currency.util.ts
|   |       |-- date.util.ts
|   |       |-- crypto.util.ts
|   |
|   |-- modules/                         <- Feature modules (20 módulos)
|   |   |-- auth/                        <- Login, registro, JWT, OAuth, OTP
|   |   |-- users/                       <- CRUD usuarios, perfil
|   |   |-- tours/                       <- CRUD tours, instancias, búsqueda
|   |   |-- bookings/                    <- Checkout, cancelación, voucher
|   |   |-- payments/                    <- Webhook, Split Fare, conciliación
|   |   |-- wallet/                      <- Coins, XP, transacciones
|   |   |-- loyalty/                     <- Config niveles, rewards, challenges
|   |   |-- operators/                   <- CRUD operadores, onboarding
|   |   |-- payouts/                     <- Liquidaciones, chargebacks
|   |   |-- commissions/                 <- Comisiones agentes
|   |   |-- crm/                         <- Quotations, Kanban, leads
|   |   |-- manifest/                    <- Manifiesto, check-in, agency links
|   |   |-- ads/                         <- Banners, rewarded ads
|   |   |-- reviews/                     <- Reseñas tour + guía
|   |   |-- incidents/                   <- Log incidentes, alertas
|   |   |-- vehicles/                    <- Flota, SOAT
|   |   |-- notifications/               <- Email (SES), Push (Expo)
|   |   |-- chat/                        <- API Gateway WebSocket handlers + DynamoDB
|   |   |-- reports/                     <- Dashboards, PDF/CSV
|   |   |-- admin/                       <- Ghost login, audit
|   |
|   |-- jobs/                            <- Handlers de jobs (EventBridge/SQS/Step Functions — 12 jobs)
|       |-- jobs.module.ts
|       |-- reconcile-payments.processor.ts
|       |-- split-fare-balance.processor.ts
|       |-- tour-reminder.processor.ts
|       |-- ads-daily-reset.processor.ts
|       |-- xp-monthly-ads.processor.ts
|       |-- operator-docs-cleanup.processor.ts
|       |-- glacier-transition.processor.ts
|       |-- refund-expiry.processor.ts
|       |-- premium-cupo-release.processor.ts
|       |-- lead-expiry-check.processor.ts
|       |-- soat-expiry-alert.processor.ts
|       |-- review-request.processor.ts
|
|-- test/
|   |-- unit/                            <- Tests unitarios por módulo
|   |-- integration/                     <- Tests de integración (TestContainers)
|   |-- fixtures/                        <- Datos de prueba
|
|-- drizzle.config.ts
|-- tsconfig.json
|-- package.json
|-- Dockerfile
|-- .env.example
|-- nest-cli.json
```

### Estructura interna de cada módulo (ejemplo: bookings)

```
modules/bookings/
|-- bookings.module.ts           <- NestJS module definition
|-- bookings.controller.ts       <- HTTP routes + Swagger decorators
|-- bookings.service.ts          <- Lógica de negocio
|-- bookings.repository.ts       <- Queries Drizzle
|-- cancellation/
|   |-- cancellation.service.ts  <- Strategy por franja
|   |-- cancellation.strategy.ts <- Interface + implementaciones
|-- voucher/
|   |-- voucher.service.ts       <- PDF generation (pdf-lib)
|-- dto/
|   |-- create-booking.dto.ts    <- class-validator
|   |-- cancel-booking.dto.ts
|-- interfaces/
    |-- booking-status.enum.ts
```

---

## 3. Frontend — Estructura (resumen)

> Detalle completo en Frontend-Architecture.md

```
frontend/src/
|-- features/                    <- 8 feature modules
|-- shared/                      <- Components, hooks, stores, lib
|-- apps/                        <- Entry points por app (B2C, ERP, B2B)
|-- styles/                      <- Design tokens CSS
|-- main.tsx + router.tsx
```

---

## 4. Setup del Proyecto — Qué Conlleva

### 4.1 Prerequisitos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Bun | >= 1.1 | Runtime backend |
| Node.js | >= 20 | Frontend build (Vite) |
| Docker + Docker Compose | Latest | PostgreSQL + Redis local |
| Git | >= 2.40 | Control de versiones |

### 4.2 Pasos del Setup

```
PASO 1: Infraestructura local
  docker-compose up -d
  -> PostgreSQL 16 + PostGIS 3 (puerto 5432)
  -> Redis 7 (puerto 6379)

PASO 2: Backend
  cd backend
  bun install
  cp .env.example .env         <- configurar keys
  bun run db:generate          <- genera migraciones Drizzle
  bun run db:migrate           <- aplica schema a PostgreSQL
  bun run db:seed              <- datos iniciales (niveles, rewards)
  bun run start:dev            <- NestJS watch mode
  -> http://localhost:3000

PASO 3: Frontend
  cd frontend
  bun install
  cp .env.example .env         <- VITE_API_URL=http://localhost:3000/api/v1
  bun run dev                  <- Vite dev server
  -> http://localhost:5173

PASO 4: Verificación
  GET http://localhost:3000/health -> {status: ok}
  GET http://localhost:3000/api/docs -> Swagger UI
```

### 4.3 Variables de Entorno Requeridas

| Variable | Descripción | Dónde obtener |
|----------|-------------|---------------|
| DATABASE_URL | PostgreSQL connection string | docker-compose local |
| REDIS_URL | Redis connection | docker-compose local |
| JWT_PRIVATE_KEY | RSA private key PEM | Generar con openssl |
| JWT_PUBLIC_KEY | RSA public key PEM | Par del private |
| GOOGLE_CLIENT_ID | OAuth2 client | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | OAuth2 secret | Google Cloud Console |
| AWS_ACCESS_KEY_ID | AWS IAM user | AWS Console |
| AWS_SECRET_ACCESS_KEY | AWS IAM secret | AWS Console |
| S3_BUCKET_PUBLIC | Bucket para media | AWS S3 |
| S3_BUCKET_PRIVATE | Bucket para docs legales | AWS S3 |
| ONEPAY_API_KEY | API key sandbox | OnePay.la dashboard |
| ONEPAY_WEBHOOK_SECRET | HMAC secret | OnePay.la dashboard |
| FRONTEND_URL | URL del frontend | localhost:5173 en dev |

### 4.4 Qué produce el Setup

| Componente | Resultado |
|-----------|-----------|
| NestJS bootstrap | main.ts (Lambda-lith con serverless-express), Helmet, CORS, Pipes, Guards globales |
| Drizzle conectado | Provider inyectable (vía RDS Proxy), 54 tablas creadas |
| Seeds | LoyaltyLevels (0-5), CoinRewardConfig (7 acciones), LoyaltyConfig (ratio 100:500) |
| Jobs | EventBridge/SQS/Step Functions listos para 12 jobs (sin Redis/BullMQ) |
| Health check | GET /health con status DB + DynamoDB + S3 |
| Swagger | Auto-generado en /api/docs |
| Guards | RolesGuard + ThrottleGuard globales |
| Interceptors | ResponseInterceptor (wrap {data, error, meta}) |
| Logger | Pino structured JSON |

### 4.5 Tiempo Estimado

| Tarea | Horas |
|-------|-------|
| Docker + instalar dependencias | 0.5h |
| Configurar .env + generar JWT keys | 1h |
| Escribir schema Drizzle (41 tablas) | 6-8h |
| Generar + aplicar migración | 0.5h |
| Seeds | 1h |
| NestJS bootstrap (main, app.module, shared) | 2-3h |
| Guards + Interceptors + Filters | 2h |
| Health check + Swagger | 1h |
| Verificación | 1h |
| **TOTAL** | **16-18h (~2-3 días)** |

---

## 5. Monolito Modular vs Microservicios

### Justificación de monolito modular:
- 1 desarrollador en Fase 1 (microservicios requiere equipo)
- BD compartida con JOINs frecuentes entre tablas
- Transacciones atómicas (checkout: Booking + Wallet + Payout)
- Deploy simple (1 container)
- Debugging sin tracing distribuido

### Topología serverless (ADR-011):

```
API Gateway HTTP API      -> Lambda-lith (NestJS completo)
API Gateway WebSocket API -> Lambdas de ruta ($connect/$disconnect/sendMessage)
EventBridge + SQS         -> Lambdas worker (jobs)
Step Functions            -> flujos multi-paso (Split Fare, conciliación)
```

Mismo código NestJS empaquetado: el handler de API Gateway enruta al router de NestJS;
los jobs se exponen como handlers Lambda que reutilizan los mismos services.

### Cuándo aislar una función (post-inversión):

| Candidato | Trigger | Beneficio |
|-----------|---------|-----------|
| Jobs pesados | Duración >30s o memoria alta | Lambda dedicada con más memoria / Step Functions |
| Chat WebSocket | >10k conexiones concurrentes | Ya es serverless (API GW), escala solo |
| Notifications | >10K emails/día | Cola SQS dedicada con retry/DLQ |
| Search | Volumen alto de catálogo | Activar OpenSearch Serverless (F3+) |

---

## Links relacionados
- [[Arquitectura-Sistema]] (patrones, MER, no funcionales)
- [[Frontend-Architecture]] (frontend detallado)
- [[../00-Inicio/Stack-Tecnologico]]
- [[../02-ADRs/ADR-005-Infra-MVP]]
