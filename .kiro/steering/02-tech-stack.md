---
inclusion: always
---
# Stack real verificado (2026-10-07)

Serverless-first en AWS us-east-1 (ADR-011). Detalle: `docs/04-Tech-Design/Mapa-Repositorio.md`.

- **Monorepo**: pnpm 9.15.0 + Turborepo, Node >=22. `apps/{web,erp,b2b}`, `services/1-core..9-ads`, `packages/{contracts,db,domain,ui}`, `infra/`.
- **Frontend**: Astro + `@astrojs/react` en las 3 apps, React 19, Tailwind 4, TanStack Query, Nanostores, Mapbox GL, i18next, DOMPurify (SafeHtml). Tests: vitest y Playwright.
- **Backend**: Hono sobre Bun (`bun --hot`, `bun build --target node`), Lambda Web Adapter. Drizzle + postgres (PostgreSQL 16, PostGIS, pg_trgm, RDS Proxy), Zod en `packages/contracts`, lógica financiera pura en `packages/domain`.
- **AWS**: Lambda + API Gateway, DynamoDB (chat, contadores TTL), EventBridge/SQS/Step Functions, S3 + CloudFront, SES, Secrets Manager. Sin ECS, Redis, BullMQ ni Socket.io.
- **IaC**: SAM en `infra/template.yaml` (scripts raíz) y CDK en `infra/lib`; sin decidir (#15).
- **Local**: `docker-compose.yml` (postgres + dynamodb-local).
- **Pagos**: OnePay.la (sin split nativo; split interno vía OperatorPayouts). Siigo en F2.
- **Datos**: shared DB, cada servicio escribe solo sus tablas.

DECISIÓN PENDIENTE: la doc histórica (ADR-011, Stack-Tecnologico, Estructura-Proyecto, Frontend-Architecture) dice NestJS y Vite SPA; el código usa Hono y Astro. Hasta que el usuario decida, este steering refleja el código. No crear ADR-012. Ver DECISIONES-PENDIENTES #1 y #2.