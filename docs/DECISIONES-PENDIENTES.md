---
tipo: decisiones
ultima_revision: 2026-10-07
---
# Decisiones pendientes y contradicciones

| # | Tema | Evidencia | Archivos afectados | Opciones | Estado |
|---|---|---|---|---|---|
| 1 | Backend NestJS vs Hono | `services/1-core` y `3-bookings` usan hono; ningún paquete usa `@nestjs/core`. Docs dicen NestJS | ADR-011, Stack-Tecnologico, Estructura-Proyecto, Arquitectura-Sistema, Frontend-Architecture, Spec-F/G, Domain-Financiero | (a) Hono vigente + ADR-012 que supere la parte NestJS de ADR-011; (b) volver a NestJS | Pendiente: confirmar con el usuario |
| 2 | Frontend Vite SPA vs Astro | apps web/erp/b2b dependen de astro + @astrojs/react. ADR-011 SW4 y Frontend-Architecture dicen Vite SPA, sin Astro; steering previo 02 era contradictorio (Astro y Vite) | ADR-011, Frontend-Architecture, Stack-Tecnologico, 04-coding-standards (TanStack Router) | (a) Astro en las 3 apps; (b) Astro solo B2C, SPA para ERP/B2B | Pendiente |
| 3 | Residuos Redis/BullMQ/Socket.io | ADR-011 los reemplaza; los Specs aún los citan | Spec-D/F/G/H/I/J, ADR-006, ADR-002/003 | Banners de equivalencia (hecho); reescribir RF más adelante | Mitigado, reescritura pendiente |
| 4 | Borondo Coins / Spec-E en pausa (2026-09-27) | Decisión del usuario, temas legales/comerciales | Spec-E, Spec-C, Spec-D, UI B2C | Reanudar tras cierre legal | En pausa |
| 5 | WAF/X-Ray | ADR-006 los activa; ADR-011 los difiere a F3 | ADR-006, Spec-F RF-F11 | ADR-011 gana (nota añadida) | Resuelto por ADR-011, confirmar |
| 6 | Conteo de tablas | Core tiene 54; Arquitectura-Sistema listaba 41 | Arquitectura-Sistema, Estructura-Proyecto | Corregido a 54 en índices | Resuelto |
| 7 | Docs contables fuera del vault | `.obsidian/docs-2` | 03-Knowledge | Fusionados en `docs/03-Knowledge/` | Resuelto |
| 8 | Naming Onepayla vs OnePay.la | Mezcla en docs/ADRs | ADR-001, Spec-C, Stack | Normalizar a OnePay.la | Pendiente (bajo) |
| 9 | Infra "vigente" ADR-008 | README raíz y 02-ADRs/README decían ADR-008 | READMEs | ADR-011 | Resuelto |
| 10 | Tests de app con rutas a docs | `apps/web/tests/fixtures/evidence.ts`, `redesignManifests.test.ts` apuntaban a `.obsidian/docs` | apps/web | Cambio mecánico a `docs/` (hecho) | Resuelto, verificar tests |
| 11 | Secreto en repo | `docs/.obsidian/plugins/obsidian-local-rest-api/data.json` tenía apiKey/clave privada y estaba versionado | Historial git | Retirado del árbol; rotar la API key del plugin y valorar limpiar historial | Pendiente: rotar |
| 12 | AGENTS.md | No existe | raíz | Opcional; no creado | Opcional |
| 13 | CI/CD desalineado | `ci.yml` usa bun y `packages/api` (no existe); `deploy-staging.yml` apunta a Railway/Render | .github/workflows | Alinear a pnpm/AWS | Pendiente |
| 14 | Scripts db:* | La raíz invoca `db:generate`/`db:migrate`; `@borondo/db` expone `generate`/`migrate` | package.json raíz, packages/db | Renombrar scripts o ajustar turbo | Pendiente |
| 15 | IaC SAM vs CDK | `infra/template.yaml` (SAM, scripts raíz) y `infra/lib` (CDK) conviven | infra/ | Elegir uno | Pendiente |
