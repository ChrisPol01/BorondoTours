---
inclusion: always
---

# Stack Técnico — BorondoTours

## Frontend — TODAS las apps (B2C, ERP, B2B) con Astro + React islands
- **Astro** (SSG + React islands + server islands) — las 3 apps
- React 19 (islands interactivas: mapa, calendario, checkout, kanban, radar, filtros)
- TanStack Query (server state dentro de islands)
- Nanostores (estado compartido entre islands: auth, cart, modales)
- Zustand 5 (solo si una isla necesita store complejo internamente)
- Tailwind CSS 4 + Shadcn/UI + Lucide React
- Mapbox GL JS (island `client:visible`)
- GSAP ScrollTrigger (scrollytelling, island `client:idle`)
- Three.js (experiencias inmersivas, island lazy — fuera del path crítico)
- Framer Motion (transiciones, island)
- react-day-picker (calendario semáforo, island)
- WebSocket nativo (chat/real-time contra API Gateway WebSocket API, island)
- i18next (i18n, island)
- DOMPurify (sanitización HTML obligatoria via SafeHtml, island)
- Vitest + Testing Library (unit) + Playwright (E2E)
- JSON-LD schema.org (TouristTrip/Offer — B2C público, desde Fase 1)
- Hosting: S3 + CloudFront (estático, mínimo costo)

# Arquitectura: serverless-first sobre AWS Lambda. Fuente de verdad: ADR-011. Región: us-east-1.

## Monorepo (Turborepo + pnpm workspaces)
- `packages/contracts` — Zod schemas + enums (fuente de verdad de tipos FE/BE)
- `packages/domain` — Funciones puras de negocio (IVA, comisiones, penalidades, sin deps)
- `packages/db` — Drizzle ORM schema + migrations + seeds (54 tablas, ownership por servicio)
- `services/1-core` — Auth, Users, RBAC, health (Lambda LWA)
- `services/2-tours` — Catálogo, búsqueda pg_trgm, instancias (Lambda LWA)
- `services/3-bookings` — Checkout, estados, cupos, pasajeros (Lambda LWA)
- `services/4-payments` — OnePay webhooks, split, dispersión (Lambda LWA)
- `services/5-operators` — CRUD operadores, contratos, payouts, retenciones (Lambda LWA)
- `services/6-notifications` — Email SES, Push Expo, WhatsApp (Lambda event-driven)
- `services/7-chat` — API Gateway WebSocket handlers + DynamoDB (Lambda)
- `services/8-jobs` — EventBridge/SQS/Step Functions handlers (Lambda Bun)
- `services/9-ads` — Banners, rewarded ads, tracking (Lambda LWA)
- `apps/web` — Astro B2C público (SSG + React islands + JSON-LD)
- `apps/erp` — Astro ERP agencia (islands: kanban, dashboard, comisiones)
- `apps/b2b` — Astro B2B operadores (islands: tours, manifiesto, radar)
- `infra/` — AWS SAM + CloudFormation (nested stacks por dominio)

## Patrón de datos: Shared Database, Separate Ownership
- 1 PostgreSQL compartida (RDS + RDS Proxy) — todos los servicios se conectan
- Cada servicio ESCRIBE solo en sus tablas (ownership)
- Cada servicio puede LEER cualquier tabla (queries compartidas en `packages/db`)
- Comunicación síncrona entre servicios: lectura cruzada de BD (mismo Proxy, misma transacción)
- Comunicación asíncrona: SQS/EventBridge para no-atómicos (notificaciones, alertas)
- ESLint boundaries: enforce de ownership (impide write en tablas ajenas)
- Code reviews: ningún PR viola ownership de escritura

## Gobernanza
- ESLint `eslint-plugin-boundaries`: última línea de defensa contra violación de ownership
- Code reviews implacables: PRs que escriban en tablas de otro servicio = BLOQUEADOS
- `packages/domain` y `packages/db`: todo cálculo y query cruzada pasa por ahí
- Un solo lenguaje backend (TypeScript/Bun): cero duplicación de lógica entre servicios y workers

## Frontend — B2C Público (SEO/GEO/AEO crítico)
- Astro (SSG + islands architecture + server islands)
- React islands (components interactivos: mapa, calendario, checkout, filtros)
- TanStack Query (dentro de islands, server state)
- Nanostores (estado compartido entre islands: auth, cart)
- Tailwind CSS 4 + Shadcn/UI + Lucide React
- Mapbox GL JS (island `client:visible`)
- GSAP ScrollTrigger (island `client:idle`)
- Framer Motion (islands)
- Three.js (island lazy, fuera del path crítico — experiencias inmersivas específicas)
- react-day-picker (island checkout)
- JSON-LD schema.org (TouristTrip/Offer/AggregateRating) — desde Fase 1
- Hosting: S3 + CloudFront (estático, mínimo costo)

## Frontend — ERP y B2B (apps privadas, sin SEO)
- React 19 + Vite 6 (SPA)
- TanStack Router (type-safe routing)
- TanStack Query + Zustand 5
- Tailwind CSS 4 + Shadcn/UI
- WebSocket nativo (chat real-time contra API Gateway WebSocket API)
- Hosting: S3 + CloudFront

## Backend
- **Hono** (framework ultraligero ~14KB, Web Standards, cold start ~14-50ms) — reemplaza NestJS
- **Bun** (runtime, local dev y empaquetado) + Node.js 22 compatible en Lambda
- **Lambda Web Adapter (LWA)** (AWS Labs, v1.0.0) — proxea HTTP a Hono sin adapter custom. Misma imagen corre en Lambda, Fargate y local.
- Drizzle ORM (type-safe, migrations, PostGIS) — conexión vía RDS Proxy
- PostgreSQL 16 + PostGIS 3 (geoespacial)
- pg_trgm (búsqueda tolerante a typos — Fase 1-2)
- API Gateway WebSocket API (chat tripartito — Lambda stateless recibe POST)
- EventBridge Scheduler + SQS + Step Functions (jobs/colas/flujos)
- Passport (JWT propio + Google OAuth2) validado por middleware auth de Hono
- Zod contratos compartidos (`packages/contracts`)
- OpenAPIHono + @hono/zod-openapi (documentación auto-generada)

## Patrones internos del backend (DDD pragmático sobre Hono)
- DI: contexto tipado (`c.get('db')`) — sin librerías de DI
- RBAC: Higher-Order Functions `requireRoles(...roles)` como middleware
- Interceptors: middleware before/after con `await next()`
- Validación: `@hono/zod-validator` + schemas de `@borondo/contracts`
- Errores: `app.onError()` centralizado → formato `{data, error, meta}`
- Módulos: carpetas por dominio + sub-routers Hono → montaje centralizado
- Fronteras: ESLint import boundaries (módulo A no importa internals de B)
- Domain puro: `packages/domain` sin deps de framework/BD (testeable en aislamiento)

## Servicios AWS (serverless-first, región us-east-1)
- AWS Lambda + API Gateway (HTTP API + WebSocket API) — compute, todos los stages
- Lambda Web Adapter (LWA) — portabilidad Lambda/Fargate/local
- RDS PostgreSQL 16 + PostGIS + RDS Proxy (Fase 1: t4g.micro Single-AZ, Fase 3: Aurora Serverless v2 + Global DB)
- DynamoDB (chat, conexiones WS, contadores diarios TTL, idempotencia) — desde Fase 1
- EventBridge + SQS (+ DLQ) + Step Functions (jobs asíncronos) — desde Fase 1
- S3 + CloudFront + OAC (frontend Astro + SPAs + media + docs legales) — desde Fase 1
- AWS SES (emails transaccionales, OTP)
- AWS Secrets Manager (secretos — todas las fases)
- Route 53 + ACM (DNS + TLS automatico)
- CloudWatch Logs + Metrics + Alarms + Budgets (observabilidad desde Fase 1)
- OpenSearch Serverless (búsqueda avanzada) — Fase 3+ si el volumen lo exige
- S3 Glacier Deep Archive (docs fiscales 5 anos) — Fase 2
- AWS WAF + X-Ray — Fase 3 (diferidos de Fase 1 por costo, riesgo aceptado)
- NO se usa: ECS Fargate, ElastiCache Redis, NestJS, Socket.io, BullMQ

## Servicios Externos (no AWS, inevitables)
- Onepayla API (pagos Colombia, Split Fare links)
- Google OAuth2 (autenticacion social)
- Mapbox GL JS (mapas, token en frontend)
- Siigo API (facturacion electronica DIAN) — Fase 2
- Expo Push Notifications (mobile) — Fase 3

## Infraestructura (IaC: AWS SAM + CloudFormation)
- Fase 1: Lambda + API Gateway + RDS t4g.micro + RDS Proxy + DynamoDB + SQS/EventBridge + S3/CloudFront (~$45-60/mes)
- Fase 2: + RDS t4g.small Multi-AZ + más funciones/flujos (~$150-250/mes)
- Fase 3: + Aurora Serverless v2 (+ Global DB para DR) + WAF + X-Ray + OpenSearch (según tráfico)

## Disaster Recovery (RTO/RPO) — ver ADR-011 Parte D
- Fase 1: Backup & Restore single-región (RTO 1-4h, RPO ≤24h). No sobrevive caída de región (asumido).
- Fase 2: Pilot Light (RTO 30-60min).
- Fase 3: Aurora Global Database (RTO <1-2min) cuando la facturación lo justifique.

## Convenciones Clave
- UUIDs v4 para todas las PKs (no auto-increment)
- Timestamps en UTC (frontend convierte a America/Bogota)
- snake_case en BD y API, camelCase en código TypeScript
- Enums como PostgreSQL ENUM types (no strings)
- JSONB para datos semi-estructurados sin JOINs frecuentes
- Access token en memoria (Zustand), NUNCA en localStorage
- Refresh token en cookie HttpOnly
