---
inclusion: fileMatch
fileMatchPattern: ["package.json","**/package.json","turbo.json","docker-compose.yml",".env.example",".github/workflows/**","scripts/**","infra/**","**/vitest.config.*","**/playwright.config.*"]
---
# Comandos y entorno (leídos de package.json, 2026-10-07)

Si difieren, manda el `package.json`. Mapa completo: `docs/04-Tech-Design/Mapa-Repositorio.md`.

- Requisitos: Node >=22, pnpm 9.15.0, Bun (servicios), Docker (postgres + dynamodb-local), SAM CLI.
- Raíz: `pnpm dev|build|lint|typecheck|test` (turbo); `pnpm db:generate|db:migrate` (drift #14); `pnpm infra:build|infra:deploy:dev|infra:deploy:prod|infra:local`.
- Web: `pnpm --filter @borondo/web` + `lint | typecheck | test:run | test:coverage | test:e2e`.
- Servicios: `pnpm --filter @borondo/service-core` (o tours, bookings, payments, operators, notifications, chat, jobs, ads) + `dev | build | lint | typecheck | test`.
- Paquetes: `contracts` (lint, test, typecheck); `domain` (test, typecheck); `ui` (typecheck, test); `db` (generate, migrate, seed, typecheck).
- Sin lint/typecheck/test: `erp` y `b2b` (puertos 3001/3002); `domain` sin lint; `db` sin test.
- Variables: solo nombres en `.env.example`; nunca valores en docs ni logs; `.env` fuera de git.
- CI: `ci.yml` con pnpm 9.15.0 y Node 22: `pnpm lint`, `pnpm typecheck`, `pnpm test` y build de `apps/*` (sin servicios, que usan `bun build`); docs y `*.md` en paths-ignore. `deploy-staging.yml` obsoleto (solo manual); despliegue B2C manual a S3/CloudFront.
- Node 25+ local: los tests web con `localStorage` fallan por el Web Storage nativo; usar `NODE_OPTIONS=--no-experimental-webstorage` o Node 22.
- Antes de terminar: `pnpm lint && pnpm typecheck && pnpm test`; en web, `test:e2e` cuando aplique.