# Plan de auditoría y ajuste de steering (2026-10-07)

Alcance: investigación hecha leyendo listados, `package.json` y configs (no código de app). Decisión de workflow: **no se descompone**; es un trabajo de un solo hilo (≈6 archivos de steering + 1 doc nuevo + ajustes menores), el loop existente lo implementa. Sin ADR-012 ni resolución de pendientes.

## A. Inventario real (con evidencia)

Raíz: `package.json` (pnpm@9.15.0, node>=22, turbo), `pnpm-workspace.yaml` (`packages/*`, `services/*`, `apps/*`), `turbo.json` (tasks: build, dev, lint, typecheck, test, db:generate, db:migrate; `lint/typecheck/test` dependen de `^build`), `tsconfig.base.json`, `docker-compose.yml` (servicios `postgres`, `dynamodb-local`), `.env.example`, `.mcp.json` (un MCP: `claude-flow`), `.npmrc`, `scripts/deploy.sh` (`./scripts/deploy.sh [1-core|web|...]`).
Scripts raíz leídos: `dev`, `build`, `lint`, `typecheck`, `test` (todos `turbo ...`); `db:generate`/`db:migrate` (`turbo --filter=@borondo/db`); `infra:build|deploy:dev|deploy:prod|local` (SAM sobre `infra/template.yaml`); `clean`.
Basura en raíz sin documentar: `tmp-bucket-policy*.json`, `tmp-cf-config.json`, `tmp-dns-*.json`, `__preview.log` (candidatos a limpiar o ignorar; **no borrar sin confirmar**).

| Pieza | Qué es | Estado real | Comandos (package.json) |
|---|---|---|---|
| `apps/web` (@borondo/web) | Portal B2C, Astro + React islands | **Implementado**: 356 archivos, 52 tests; vitest.config, eslint.config.js, playwright.config.ts, dirs `e2e/ tests/ test/ integrations/` | dev `astro dev`; build `astro build`; lint `eslint . --max-warnings 0`; typecheck `astro check`; test `vitest`; `test:run`; `test:coverage`; `test:e2e` (playwright) |
| `apps/erp` | ERP agencia, Astro | **Scaffold**: 5 archivos (`Base.astro`, `index.astro`, `global.css`, `islands/.gitkeep`) | dev `astro dev --port 3001`; build; preview. Sin lint/typecheck/test |
| `apps/b2b` | Portal operadores, Astro | **Scaffold**: 5 archivos | dev `--port 3002`; build; preview. Sin lint/typecheck/test |
| App móvil (Expo) | Guías/conductores | **No existe** en el repo (Fase 3, solo docs: APP4, Spec-J) | — |
| `services/1-core` | Auth/usuarios, Hono + Bun | Parcial: 17 archivos, 0 tests | dev `bun --hot src/index.ts`; build `bun build src/index.ts --outdir dist --target node`; lint `eslint src/`; typecheck `tsc --noEmit`; test `vitest run` |
| `services/2-tours`…`9-ads` (tours, bookings, payments, operators, notifications, chat, jobs, ads) | Servicios Hono | **Scaffold**: 4–8 archivos c/u (`app.ts`/`index.ts`), 0 tests | Idénticos a 1-core |
| `packages/contracts` | Zod schemas/enums (`auth`, `bookings`, `tours`, `shared`, `roles`, `booking-status`) | Inicial: 12 archivos, 0 tests | lint, test, typecheck (sin build) |
| `packages/db` | Drizzle + postgres | Inicial: `client.ts`, `schema/index.ts` (**tablas Core aún no volcadas**: el Core tiene 54 en docs) | `generate`/`migrate` (drizzle-kit), `seed` (`bun run src/seeds/index.ts`), typecheck. **Ojo:** raíz invoca `db:generate`/`db:migrate` pero el paquete expone `generate`/`migrate` → el filtro de turbo no encuentra la tarea (verificar y reportar; no corregir en este plan) |
| `packages/domain` | Lógica financiera pura | Inicial: `pricing/calculate-booking-total.ts` | test `vitest run`, typecheck |
| `packages/ui` | Componentes compartidos | 32 archivos, 6 tests | typecheck, test (vitest.config) |
| `infra/` | **Dos enfoques conviven**: SAM (`template.yaml` con 7 `AWS::CloudFormation::Stack`, `samconfig.toml`, `stacks/*.yaml`: cdn, database, events, monitoring, network, services, storage; `parameters/{dev,staging,prod}.json`) y CDK (`lib/{cdn,gateway,jobs,shared}-stack.ts`, `package.json` con `cdk synth/deploy`) | Existe; sin verificar despliegue | Raíz `infra:*` (SAM). `infra/package.json`: synth, deploy, deploy:shared, deploy:service, destroy, typecheck |
| `integrations/` raíz | **No existe**. `apps/web/integrations` es otra cosa (dir de app) | — | — |
| `otros/design` | `b2c/` (design.md, INVENTARIO-PANTALLAS, STITCH-brief), `marca/` (brand guidelines v2, logos), `tools/{fig2astro, figma-bridge-plugin}`, `web/`, `mobile/`, `skills/`, `specs/`, `tramos/`, `assets/`, `css-dump/`, `fotos-test/` | Existe | — |
| `otros/infra` | JSON de bucket policy, CloudFront y Route53 dev/prod | Existe (artefactos manuales) | — |
| `otros/cotizaciones`, `otros/recibo_caja` | Cotización HTML; script Python `generar_recibo.py` + `config.py`, PDF ejemplo | Existe; operativa contable, fuera del producto | — |
| `.kiro/steering` | 14 archivos: 7 `always` (00–06), fileMatch (07, 11, 15), auto (10, 12), manual (13, 14) | Verificado en front-matter | — |
| `.kiro/specs` | `b2c-glass-theme-ui-fixes`, `b2c-pixel-perfect-redesign`, `frontend-b2c-portal` (requirements/design/tasks) | Existen, todos B2C | — |
| `.kiro/hooks` | 20 hooks (`*.json` + `*.kiro.hook`; 2 duplicados `* copy.hook`): api-design, auth-rbac, bt-docs-excellence/new-file-check, external-service, financial-logic, frontend-a11y-i18n, infra-security, pii, plan-before-execute, post-task-verification, pre-task-context-load, pre-write-quality, realtime-security, session-summary, shell-safety, state-machine, test-completeness, update-data-model-docs | Existen (40 archivos) | — |
| `.claude/` | `agents`, `commands`, `skills` (agentdb, github, sparc, swarm, v3…), `helpers`, `settings*.json` — plantillas claude-flow, no específicas del producto | Existe | — |
| `.github/workflows` | `ci.yml` (lint/test/build con **bun**; el job de test llama `bun run --cwd packages/api db:migrate` y `packages/api` **no existe**); `deploy-staging.yml` (placeholder Railway/Render, contradice AWS) | **Desalineado con el repo real** | — |
| `.worktrees/` | Vacío | — | — |
| `.agents/` | Artefactos de workflows | — | — |
| Entorno | `.env.example` claves (sin valores): DATABASE_URL, DATABASE_POOL_SIZE, JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, GOOGLE_CLIENT_ID/SECRET, AWS_REGION/ACCESS_KEY_ID/SECRET_ACCESS_KEY, SES_FROM_EMAIL, ONEPAYLA_API_KEY/WEBHOOK_SECRET, BUN_PUBLIC_MAPBOX_TOKEN/API_URL/WS_URL, PORT_CORE…PORT_ADS | Existe | — |

Seguridad: `docs/.obsidian/plugins/obsidian-local-rest-api/data.json` **no existe** en el árbol y `docs/.obsidian/.gitignore` lo ignora (`git check-ignore` confirma). `git grep` de patrones `AKIA…`/`BEGIN … PRIVATE` fuera del lockfile: sin coincidencias. Sigue pendiente la rotación de la API key (DECISIONES #11). No reproducir su contenido. Existe una cadena de `.kiro/steering/.obsidian/...` borrada (staged `D`) → confirmar que no queda carpeta.

## B. Tabla tema → fuente de verdad → steering → estado

| Tema | Fuente de verdad | Steering que lo cubre | Estado |
|---|---|---|---|
| Identidad, apps, roles, fases | `00-Inicio/Contexto-Para-IA.md`, `Stack-Tecnologico.md` §RBAC | 01-project-identity | Cubierto (falta decir que ERP/B2B son scaffold y móvil no existe) |
| Stack | ADR-011, `Stack-Tecnologico.md` | 02-tech-stack | Parcial: sin versiones/gestor (pnpm, node>=22, bun), sin nota de CDK vs SAM |
| Comandos dev/build/test/lint por paquete | `package.json` de cada paquete | ninguno | **Hueco** |
| Estructura real del monorepo | `04-Tech-Design/Estructura-Proyecto.md` (11 KB, parte NestJS/histórica) | 02 (resumen) | **Hueco** (no hay mapa verificado) |
| Estado de implementación por fase | ninguno | ninguno | **Hueco** |
| Mapa de documentación | `docs/README.md` | 00-documentation-map | Cubierto; falta enlazar Mapa-Repositorio, DECISIONES, estado, `.kiro/specs`, hooks |
| Reglas de negocio | `Reglas-Negocio-Detalle.md`, ADR-007 | 05 | Cubierto |
| Estándares de código | — | 04 | Cubierto; incoherencia: menciona "TanStack Router" en docs (pendiente #2) |
| Flujo y quality gates | — | 03, 06 | Cubierto |
| Legal/PII | `Politica-Datos-Personales.md`, ADR-006 | 07 (fileMatch) | Cubierto |
| AWS SSO/cuentas/inventario | `06-Operaciones/*` | 10 (auto), 11 (fileMatch) | Cubierto; verificar que no hay IDs sensibles |
| Marca/UI | `04-Tech-Design/DESIGN.md`, `Brand-Identity-Resumen.md`, `otros/design/marca` | 12, 14, 15 | Cubierto |
| Figma bridge | `06-Operaciones/Figma-Bridge-Runbook.md`, `otros/design/tools/figma-bridge-plugin` | 13 (manual) | Cubierto; no menciona `fig2astro` ni el MCP `figma-bridge` |
| `.kiro/specs` | `.kiro/specs/*` | ninguno | **Hueco** |
| `.kiro/hooks` (20 hooks, 2 duplicados) | `.kiro/hooks/*` | ninguno | **Hueco** |
| `.claude/` | `.claude/*` | ninguno | **Hueco menor** (anotar que son plantillas claude-flow) |
| Integraciones externas OnePay.la/Siigo/Mapbox/SES/Google OAuth | ADR-001/004/009/010, Specs C/F, `.env.example` | 05 (solo OnePay/Siigo en frases) | Parcial |
| Variables de entorno (solo claves) | `.env.example` | ninguno | **Hueco** |
| Testing (vitest, playwright, cobertura) | `apps/web` configs, 04-coding-standards | 04 (≥80%) | Parcial: sin cómo correr ni estado real (0 tests en servicios) |
| CI/CD real | `.github/workflows/*` | ninguno | **Hueco** + drift (bun vs pnpm, `packages/api`, Railway) |
| IaC (SAM vs CDK) | ADR-011, `infra/README.md` | 11 (fileMatch) | Parcial: doble enfoque sin decidir |
| DR / backups | ADR-005/008/011, `Inventario-AWS.md` | ninguno | Por verificar al implementar: abrir ADR-011 y `Inventario-AWS.md` y buscar RPO/RTO; si no existen, **hueco documental** (solo anotarlo en DECISIONES-PENDIENTES) |
| ADR-009/010/011 | `02-ADRs/` (existen; **ADR-012 no existe**, no crearlo) | 05 cita 009/010 | Cubierto; añadir ADR-011 en 02 ya está |
| Pendientes y contradicciones | `docs/DECISIONES-PENDIENTES.md` | 02 (parcial) | Parcial |
| Higiene raíz (tmp-*.json, `copy.hook`, `AGENTS.md` ausente) | — | ninguno | **Hueco** (solo documentar) |

## C. Huecos priorizados y acción

1. Comandos y entorno (P1): crear steering nuevo 16 (sección E1) y la tabla de comandos en Mapa-Repositorio.
2. Estado del proyecto (P1): crear steering 17 (E2).
3. Mapa real del repo (P1): crear `docs/04-Tech-Design/Mapa-Repositorio.md` (F) y enlazarlo desde 00-documentation-map.
4. CI/CD desalineado (P1): documentar el drift en Mapa y en DECISIONES-PENDIENTES (#13 nuevo: CI usa bun/`packages/api`; deploy-staging apunta a Railway). **No modificar workflows** salvo petición.
5. Drift de scripts raíz `db:*` vs `generate/migrate` de `@borondo/db` (P2): añadir como #14 en DECISIONES-PENDIENTES; no corregir en este paso.
6. Doble IaC SAM/CDK (P2): #15 pendiente; steering lo refleja como "SAM es lo que usan los scripts raíz; `infra/lib` es CDK; sin decidir".
7. `.kiro/specs`, hooks (20, 2 copias), `.claude` (P2): una sección en Mapa-Repositorio y una línea en 00-documentation-map.
8. Variables de entorno (P2): lista de claves sin valores en steering 16 (resumida) y Mapa.
9. Integraciones externas (P3): tabla de 5 filas en Mapa (OnePay.la, Siigo, Mapbox, SES, Google OAuth) con ADR/Spec fuente.
10. DR (P3): verificar (ver B) y registrar.
11. Higiene raíz y `AGENTS.md` (P3): listar en Mapa; no crear `AGENTS.md` (opcional, #12).
12. Rotación de API key del plugin (P1 seguridad, acción del usuario): recordarlo en estado-del-proyecto como pendiente, sin reproducir valores.

## D. Cambios en steering existentes

Reglas: no cambiar el sentido de reglas de negocio; solo reflejar lo verificado. Los `always` hoy suman ≈7.2 KB; objetivo ≤15 KB.

- **00-documentation-map**: añadir filas `04-Tech-Design/Mapa-Repositorio.md`, `docs/DECISIONES-PENDIENTES.md` (ya), `.kiro/specs/`, `.kiro/hooks/`, `.claude/` (plantillas claude-flow, no son fuente de verdad), `otros/design` (diseño/marca/Figma). Añadir "Comandos → steering 16; estado → steering 17".
- **01-project-identity**: añadir línea de estado: B2C implementado; ERP y B2B scaffold; móvil no existe; servicios 2–9 scaffold, 1-core parcial. Remitir a steering 17 para detalle.
- **02-tech-stack**: reemplazar por lo REAL verificado: pnpm 9.15 + Turborepo, Node ≥22, Bun para servicios (`bun --hot`, `bun build --target node`), Hono (+ `@hono/zod-validator`), Drizzle + `postgres`, Zod en `packages/contracts`, Astro + `@astrojs/react` en las 3 apps, TanStack Query, Nanostores, Mapbox GL, DOMPurify, vitest, Playwright, `docker-compose` (postgres + dynamodb-local). IaC: SAM en `infra/template.yaml` (scripts raíz) y CDK en `infra/lib` (sin decidir). Mantener el bloque: "DECISIÓN PENDIENTE: la doc histórica (ADR-011, Stack-Tecnologico, Estructura-Proyecto, Frontend-Architecture) dice NestJS y Vite SPA; el código usa Hono y Astro. Hasta que el usuario decida, el steering refleja el código. No crear ADR-012. Ver DECISIONES #1 y #2." Quitar "TanStack Router" de 04 si aparece; anotar "routing: según pendiente #2".
- **03-workflow**, **05-business-rules**, **06-quality-gates**, **07-legal-compliance**: sin cambios de fondo. Solo 03: añadir paso 0 "consultar steering 17 para saber qué existe en código vs sólo en docs".
- **04-coding-standards**: sustituir referencias a TanStack Router si las hay; añadir "comandos de verificación → steering 16". Funciones ≤50 líneas ya está.
- **10, 11, 12, 13, 14, 15**: sin cambios, salvo 11: añadir una línea "doble enfoque SAM/CDK sin decidir (DECISIONES #15)" y 13: mencionar `otros/design/tools/fig2astro`.
- Presupuesto final `always`: 7 existentes (~8.5 KB tras ajustes) + 17 estado (≤3 KB) = ≤12 KB. El 16 (comandos) va `fileMatch`, no `always`.

## E. Nuevos steering

**E1. `.kiro/steering/16-comandos-y-entorno.md`**, `inclusion: fileMatch`, `fileMatchPattern: ["package.json","**/package.json","turbo.json","docker-compose.yml",".env.example",".github/workflows/**","scripts/**","infra/**","**/vitest.config.*","**/playwright.config.*"]`. ≤3.5 KB. Contenido:
- Prerrequisitos: Node ≥22, pnpm 9.15.0, Bun (servicios), Docker (postgres + dynamodb-local), SAM CLI.
- Desde raíz: `pnpm dev|build|lint|typecheck|test` (turbo); `pnpm db:generate|db:migrate` (con nota de drift #14); `pnpm infra:build|deploy:dev|deploy:prod|local`.
- Por paquete: `pnpm --filter @borondo/web test:run | test:coverage | test:e2e | typecheck | lint`; `pnpm --filter @borondo/service-core dev|test|lint|typecheck`; `@borondo/contracts|domain|ui` test/typecheck; `@borondo/db` generate/migrate/seed.
- Qué paquetes NO tienen lint/typecheck/test (erp, b2b; domain sin lint; db sin test).
- Puertos: erp 3001, b2b 3002; servicios `PORT_*` en `.env.example`.
- Variables de entorno: solo nombres, nunca valores; `.env` fuera de git.
- CI: ver drift (bun, `packages/api`) y que `docs/**`/`*.md` están en paths-ignore.
- Antes de dar por terminado: `pnpm lint && pnpm typecheck && pnpm test` y, si toca web, `test:e2e` cuando aplique. Comandos son los leídos de package.json el 2026-10-07; si difieren, manda el package.json.

**E2. `.kiro/steering/17-estado-del-proyecto.md`**, `inclusion: always`, ≤3 KB, encabezado "Verificado: 2026-10-07". Tabla corta con tres columnas (Pieza | En código | Sólo en docs):
- En código: B2C (`apps/web`, 52 tests), `1-core` parcial, `contracts`, `domain` (pricing), `db` (cliente, schema vacío/inicial), `ui` (6 tests), infra SAM/CDK.
- Scaffold: erp, b2b, servicios 2–9.
- Sólo docs: móvil Expo, ERP funcional, Split Fare, OnePay.la, Siigo, Borondo Coins (en pausa), publicidad, chat, jobs, notificaciones, 54 tablas del Core.
- Tests: solo web y ui tienen tests; servicios/contracts/db/domain: 0 aunque las reglas los exigen para finanzas/RBAC.
- Pendientes abiertos: #1, #2, #11 (rotar key), #13–#15. Remite a `DECISIONES-PENDIENTES.md`.
- Regla de mantenimiento: actualizar al cerrar cada Spec/feature; si la fecha tiene >30 días, re-verificar listando directorios.

## F. Contenido planeado de `docs/04-Tech-Design/Mapa-Repositorio.md` (≤8 KB)

Front-matter: `tipo: mapa`, `ultima_revision: 2026-10-07`, nota "Reflejo del código real; ante conflicto con docs históricas (NestJS/Vite) manda el código hasta decisión del usuario (DECISIONES #1, #2)". Secciones:
1. **Árbol anotado** (raíz, apps, services 1–9, packages, infra, otros, `.kiro`, `.claude`, `.github`, `scripts`, `docs`) con estado (implementado/scaffold/no existe) según tabla A.
2. **Comandos por paquete** (tabla de A, sin inventar).
3. **Ownership**: "shared DB, cada servicio escribe solo sus tablas". Mapeo servicio → tablas se toma de `Modelo-Datos-Core.md` (el implementador debe abrirlo y copiar el mapeo real; si no existe, escribir "pendiente de definir"). `packages/db`: único dueño de schema/migraciones Drizzle (snake_case, UUID v4, sin soft delete, `created_by` en financieras). `packages/domain`: lógica financiera pura, sin I/O. `packages/contracts`: Zod + enums (roles, booking-status) compartidos front/back. `packages/ui`: componentes compartidos, tokens semánticos.
4. **Entornos y cuentas AWS sin secretos**: us-east-1, perfiles dev/prod/root según `06-Operaciones/AWS-Multi-Account-SSO.md` (referenciar, no copiar IDs de cuenta); `infra/parameters/{dev,staging,prod}.json`; `docker-compose` local; variables `.env.example` (solo nombres).
5. **Integraciones externas**: OnePay.la (ADR-001, webhook idempotente), Siigo (ADR-004/010), Mapbox, SES, Google OAuth, DynamoDB chat (ADR-003); cada una con su doc fuente y estado (solo docs/placeholder).
6. **CI/CD real y drift** (workflows actuales vs repo).
7. **Automatización de agentes**: `.kiro/specs` (3 B2C), `.kiro/hooks` (20, duplicados `copy`), `.claude` (plantillas claude-flow), `.mcp.json`.
8. **Tabla tema → doc fuente de verdad → steering → estado** (copia compacta de B).
9. **Higiene pendiente**: `tmp-*.json`, `__preview.log`, hooks `copy`, ausencia de `AGENTS.md`.

## G. Pasos para el implementador (orden)

- [ ] 1. Releer `package.json` raíz y de `apps/*`, `services/*`, `packages/*` (comandos pueden haber cambiado) y verificar B/DR abriendo `ADR-011` e `Inventario-AWS.md` (buscar RPO/RTO/backup). Verify: coincidencia con la sección A; anotar diferencias.
- [ ] 2. Crear `docs/04-Tech-Design/Mapa-Repositorio.md` según F (≤8 KB). Verify: `(Get-Item ...).Length -le 8192`; todas las rutas citadas existen (`Test-Path`).
- [ ] 3. Añadir #13–#15 en `docs/DECISIONES-PENDIENTES.md` (CI/deploy desalineado, scripts `db:*`, SAM vs CDK) y enlazar el Mapa en `docs/README.md` y `docs/04-Tech-Design/README.md`.
- [ ] 4. Editar steering 00, 01, 02, 03, 04, 11, 13 según D. Verify: front-matter `inclusion: always` intacto; suma de `always` ≤15 KB.
- [ ] 5. Crear steering 16 (fileMatch) y 17 (always ≤3 KB) según E. Verify: tamaños y front-matter válidos; ninguna ruta `#[[file:...]]` a docs grandes.
- [ ] 6. Comprobación final: `Get-ChildItem .kiro/steering | select Name,Length` y suma de always; `git grep` de patrones de secretos sin coincidencias; `docs/.obsidian/plugins/obsidian-local-rest-api/data.json` no existe; no se citó ningún secreto. Escribir `review.json` solo lo hace el revisor.
- [ ] 7. Registrar en `docs/05-Dev-Log/` una entrada breve (fecha 2026-10-07) con lo cambiado. Verify: enlace desde `Dev-Log-Index.md`.

Cumplimiento de reglas: sin ADR-012, sin resolver NestJS/Vite, sin editar workflows ni infra, sin borrar archivos de la raíz sin confirmación.
