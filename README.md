# BorondoTours

> Marketplace gestionado B2C de tours en Colombia.  
> "No vendemos tours. Abrimos senderos."

## Estructura del Monorepo

```
borondotours/
├── packages/              # Librerías compartidas
│   ├── contracts/         # Zod schemas + enums (fuente de verdad de tipos)
│   ├── domain/            # Funciones puras de negocio (IVA, comisiones, penalidades)
│   └── db/                # Drizzle ORM schema + migrations + seeds
│
├── services/              # Backend — Hono + Lambda Web Adapter
│   ├── 1-core/            # Auth, Users, RBAC, health
│   ├── 2-tours/           # Catálogo, búsqueda pg_trgm, instancias
│   ├── 3-bookings/        # Checkout, estados, cupos, pasajeros
│   ├── 4-payments/        # Onepayla webhooks, split fare, dispersión
│   ├── 5-operators/       # CRUD operadores, contratos, payouts
│   ├── 6-notifications/   # Email SES, Push Expo (event-driven)
│   ├── 7-chat/            # API Gateway WebSocket + DynamoDB
│   ├── 8-jobs/            # EventBridge/SQS/Step Functions handlers
│   └── 9-ads/             # Banners, rewarded ads, tracking
│
├── apps/                  # Frontend — Astro + React islands
│   ├── web/               # B2C público (SSG, SEO, JSON-LD)
│   ├── erp/               # ERP agencia (CRM kanban, comisiones)
│   └── b2b/               # B2B operadores (tours, manifiesto, radar)
│
├── infra/                 # AWS CDK (TypeScript)
│   ├── bin/               # Entry point CDK app
│   └── lib/stacks/        # Network, Database, Services, Frontend
│
├── docs/                  # Documentación del proyecto
│   ├── 00-Inicio/         # Visión, stack, inventario
│   ├── 01-Specs/          # Especificaciones (Spec-A a Spec-J)
│   ├── 02-ADRs/           # Decisiones de arquitectura
│   ├── 03-Knowledge/      # Modelo de datos, comisiones, políticas
│   └── 04-Tech-Design/    # Arquitectura, diseño técnico
│
└── open-design/           # Design system, assets, Figma tokens
```

## Stack Técnico

| Capa | Tecnología |
|------|------------|
| Runtime | Bun (dev) + Node.js 22 (Lambda) |
| Backend | Hono + Lambda Web Adapter (LWA) |
| Frontend | Astro 5 (SSG) + React 19 (islands) |
| Base de datos | PostgreSQL 16 + PostGIS + Drizzle ORM |
| Real-time | API Gateway WebSocket + DynamoDB |
| Jobs | EventBridge + SQS + Step Functions |
| Infraestructura | AWS CDK (TypeScript) |
| Monorepo | Turborepo + pnpm workspaces |

## Desarrollo Local

```bash
# Prerequisitos: Node.js 22+, pnpm 9+, Bun, Docker

# 1. Instalar dependencias
pnpm install

# 2. Levantar infraestructura local (PostgreSQL + DynamoDB)
docker compose up -d

# 3. Correr migraciones
pnpm db:migrate

# 4. Levantar todos los servicios en dev
pnpm dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Levanta todos los servicios y apps en modo dev |
| `pnpm build` | Build de producción (todos los packages) |
| `pnpm lint` | ESLint en todos los packages |
| `pnpm typecheck` | TypeScript check en todos los packages |
| `pnpm test` | Ejecuta todos los tests |
| `pnpm db:generate` | Genera migraciones Drizzle |
| `pnpm db:migrate` | Aplica migraciones a la BD |

## Arquitectura

- **Serverless-first**: Todo corre en AWS Lambda desde Fase 1.
- **Shared Database, Separate Ownership**: 1 PostgreSQL, cada servicio escribe solo en sus tablas.
- **Event-driven**: SQS/EventBridge para comunicación asíncrona entre servicios.
- **Lambda Web Adapter**: Misma app Hono corre en Lambda, Fargate y local sin cambios.

Más detalles en `docs/04-Tech-Design/Arquitectura-Sistema.md`.
