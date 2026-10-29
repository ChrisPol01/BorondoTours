---
tipo: mapa
ultima_revision: 2026-10-07
---
# Mapa del repositorio (estado real)

> Refleja el código real. Ante conflicto con la doc histórica (NestJS/Vite) manda el código hasta que el usuario decida (DECISIONES-PENDIENTES #1 y #2). Comandos leídos de cada `package.json` el 2026-10-07; si difieren, manda el `package.json`.

## 1. Árbol anotado
| Ruta | Qué es | Estado |
|---|---|---|
| `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` | pnpm 9.15.0, Node >=22, Turborepo | Real |
| `docker-compose.yml`, `.env.example`, `.mcp.json`, `.npmrc` | Postgres + dynamodb-local; claves de entorno (solo nombres); MCP claude-flow | Real |
| `apps/web` | Portal B2C, Astro + React; vitest, eslint, playwright | Implementado |
| `apps/erp`, `apps/b2b` | ERP agencia / portal operadores, Astro | Scaffold (puertos 3001/3002) |
| App móvil Expo | Guías y conductores (Fase 3) | No existe (solo docs APP4) |
| `services/1-core` | Auth/usuarios, Hono + Bun | Parcial, 0 tests |
| `services/2-tours` ... `9-ads` | tours, bookings, payments, operators, notifications, chat, jobs, ads | Scaffold |
| `packages/contracts` | Zod, enums (roles, booking-status) | Inicial |
| `packages/db` | Drizzle + postgres (cliente, schema inicial) | Inicial, tablas del Core sin volcar |
| `packages/domain` | Lógica financiera pura (`pricing/`) | Inicial |
| `packages/ui` | Componentes compartidos | Implementado (6 tests) |
| `infra/` | SAM (`template.yaml`, `stacks/`, `parameters/`) y CDK (`lib/`) | Existe, doble enfoque (#15) |
| `scripts/deploy.sh` | Despliegue | Real |
| `.github/workflows` | `ci.yml`, `deploy-staging.yml` | Desalineados (ver 6) |
| `.kiro/steering`, `.kiro/specs`, `.kiro/hooks` | Reglas, specs de features, hooks de agente | Real (ver 7) |
| `.claude/` | Plantillas claude-flow, no son fuente de verdad | Real |
| `otros/` | Diseño/marca/Figma (`design`), artefactos infra manuales, operativa contable | Fuera del producto |
| `docs/` | Vault Obsidian (00-Inicio..06-Operaciones, Templates) | Real |

## 2. Comandos (raíz y por paquete)
Raíz: `pnpm dev|build|lint|typecheck|test` (turbo); `pnpm db:generate|db:migrate`; `pnpm infra:build|infra:deploy:dev|infra:deploy:prod|infra:local` (SAM); `pnpm clean`.
| Paquete | Scripts |
|---|---|
| `@borondo/web` | dev, build, preview, lint, typecheck (`astro check`), test, test:run, test:coverage, test:e2e |
| `@borondo/erp`, `@borondo/b2b` | dev, build, preview (sin lint/typecheck/test) |
| `@borondo/service-*` (core, tours, bookings, payments, operators, notifications, chat, jobs, ads) | dev (`bun --hot`), build (`bun build`), lint, typecheck, test |
| `@borondo/contracts` | lint, test, typecheck |
| `@borondo/db` | generate, migrate, seed, typecheck |
| `@borondo/domain` | test, typecheck |
| `@borondo/ui` | typecheck, test |
Ejemplo: `pnpm --filter @borondo/web test:run`. Drift: la raíz invoca `db:generate`/`db:migrate` pero `@borondo/db` expone `generate`/`migrate` (#14).

## 3. Ownership
- Shared DB: cada servicio escribe solo sus tablas. Mapeo servicio -> tablas: pendiente de definir (no hay mapeo explícito en `03-Knowledge/Modelo-Datos-Core.md`).
- `packages/db`: único dueño de schema y migraciones Drizzle (snake_case, UUID v4, sin soft delete, `created_by` en financieras).
- `packages/domain`: lógica financiera pura, sin I/O. `packages/contracts`: Zod y enums compartidos front/back. `packages/ui`: componentes con tokens semánticos.

## 4. Entornos y cuentas AWS (sin secretos)
Región us-east-1. Cuentas dev/prod/root y perfiles SSO: `docs/06-Operaciones/AWS-Multi-Account-SSO.md`; recursos: `docs/06-Operaciones/Inventario-AWS.md`. Parámetros: `infra/parameters/{dev,staging,prod}.json`. Local: `docker-compose.yml`. Variables: solo nombres en `.env.example`; nunca valores en docs.

## 5. Integraciones externas
| Integración | Fuente | Estado |
|---|---|---|
| OnePay.la (webhook idempotente) | ADR-001, Spec-C | Solo docs |
| Siigo | ADR-004, ADR-010 | Solo docs (F2) |
| DynamoDB chat | ADR-003 | Solo docs |
| Mapbox, SES, Google OAuth | `.env.example`, ADR-011 | Claves previstas |

## 6. CI/CD y drift
`ci.yml` usa bun y llama `packages/api` (no existe). `deploy-staging.yml` apunta a Railway/Render, contradice AWS. No modificados (#13). DR: ADR-011 Parte D (Fase 1: RTO 1-4 h, RPO <=24 h).

## 7. Automatización de agentes
- `.kiro/specs/`: b2c-glass-theme-ui-fixes, b2c-pixel-perfect-redesign, frontend-b2c-portal, operational-planning-module.
- `.kiro/hooks/`: ~20 hooks (calidad, PII, RBAC, a11y, docs); hay duplicados `* copy.hook`.
- Megafábrica SDLC enlazada con `mf link` (central `C:\Users\Administrador\megafabrica-sdlc`): `.megafactory/` (perfil, bus, memoria, CLI `node .megafactory/bin/factory.mjs`), `.kiro/agents/sdlc-*` (39 agentes), `.kiro/workflows/factory-*` (recetas), `.kiro/skills/bt-*` (10 skills del proyecto); ver steering 20 y `AGENTS.md`.
- Steering: `.kiro/steering/` (ver tabla 8).

## 8. Tema -> fuente de verdad -> steering
| Tema | Fuente | Steering |
|---|---|---|
| Identidad, roles, fases | `00-Inicio/Contexto-Para-IA.md` | 01 |
| Stack | ADR-011, `Stack-Tecnologico.md`, este mapa | 02 |
| Comandos y entorno | `package.json` | 16 |
| Estado por fase | steering 17 | 17 |
| Docs | `docs/README.md` | 00 |
| Reglas de negocio | `Reglas-Negocio-Detalle.md`, ADR-007 | 05 |
| Estándares / gates | - | 03, 04, 06 |
| Legal/PII | `Politica-Datos-Personales.md` | 07 |
| AWS | `06-Operaciones/*` | 10, 11 |
| Marca/UI | `DESIGN.md`, `Brand-Identity-Resumen.md` | 12, 14, 15 |
| Figma | `Figma-Bridge-Runbook.md` | 13 |

## 9. Higiene pendiente (sin borrar sin confirmar)
`tmp-*.json`, `__preview.log` en raíz; hooks `copy`; sin `AGENTS.md` (#12).
