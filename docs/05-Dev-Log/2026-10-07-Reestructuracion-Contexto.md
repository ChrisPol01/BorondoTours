# 2026-10-07 — Reestructuración de contexto (docs + steering)

## Qué se movió
- `.kiro/steering/.obsidian/docs/*` → `docs/*` (git mv; 04-Tech-Design archivo por archivo por bloqueo de carpeta). Config Obsidian → `docs/.obsidian`.
- `.obsidian/docs-2/03-Knowledge` (4 docs contables) → `docs/03-Knowledge/`. `Estructura-Contable.md`: se conservó la del vault (35 KB > 32 KB).
- Detalle largo de steering → `docs/06-Operaciones/` (AWS-Multi-Account-SSO, Inventario-AWS, Figma-Bridge-Runbook), `docs/03-Knowledge/Reglas-Negocio-Detalle.md`, `docs/04-Tech-Design/Brand-Identity-Resumen.md`.
- Nuevos: `00-documentation-map` (steering), `15-frontend-ux`, `Contexto-Para-IA.md`, `DECISIONES-PENDIENTES.md`, `06-Operaciones/README.md`.
- Rutas corregidas: Handoff-Contabilidad, MCP-Setup-Guide, y 2 archivos de apps/web (solo literales `.obsidian/docs/` → `docs/` en `tests/fixtures/evidence.ts` y `src/lib/redesignManifests.test.ts`; no se ejecutó la suite).
- READMEs: raíz, 02-ADRs (ADR-011 vigente, 005/008 superados, 009-012), 03-Knowledge (54 tablas), 04-Tech-Design, 00-Inicio. Banners de desactualización (Hono/Astro/Redis) en Stack, Estructura, Frontend-Arch, Arquitectura, ADR-011, ADR-006, Specs D/F/G/H/I/J.

## Steering antes → después
| Archivo | Antes | Después (inclusión, bytes) |
|---|---|---|
| 00-documentation-map | — | always, 1101 |
| 01-project-identity | always | always, 879 |
| 02-tech-stack | always 8464 | always, 1224 |
| 03-roles-and-workflow + 08 + 09 | always ~8.2 KB | 03-workflow always, 935 |
| 04-coding-standards | always 3806 | always, 1164 |
| 05-business-rules | always 4877 | always, 1294 |
| 06-quality-gates | always 2399 | always, 615 |
| 07-legal-compliance | always 2942 | fileMatch, 949 |
| 10-aws-multi-account-sso | sin front matter 3670 | auto, 884 |
| 11-inventario-tecnico-aws | sin FM (always) 7036 | fileMatch, 720 |
| 12-brand-identity | sin FM 14578 | auto, 1023 |
| 13-figma-bridge-safety | sin FM 14775 | manual, 846 |
| 13-ui-ux-skill → 14 | manual 2736 | manual, 2736 |
| 15-frontend-ux | — | fileMatch, 784 |

Total `always`: ~73 KB → **7212 bytes** (7 archivos).

## Contradicciones pendientes
Ver `docs/DECISIONES-PENDIENTES.md` (12 ítems): NestJS vs Hono, Vite vs Astro, residuos Redis/BullMQ/Socket.io, Coins en pausa, etc. El steering 02 las marca "DECISION PENDIENTE".

## Seguridad
`docs/.obsidian/plugins/obsidian-local-rest-api/data.json` contenía apiKey/clave privada y estaba versionado: retirado del árbol (`git rm`) y añadido a `docs/.obsidian/.gitignore`. **Rotar la API key**; sigue en el historial git (incl. commit de respaldo).

## Verificación
- `.kiro/steering` sin `.obsidian` ni docs; todos los steering con front matter válido (tabla arriba).
- `.obsidian/docs` solo aparece en `docs/05-Dev-Log/plan.md` (el plan, citas históricas).
- Wikilinks de READMEs/índices: 1 roto preexistente (`Dev-Log-Index` → `2025-01-01`, placeholder).
- Mojibake: no encontrado (falso positivo de consola).
- Sin commits; cambios en índice/árbol (ver `git status`).

## Revertir
Respaldo: commit `a76b808` ("backup: estado previo a reestructuracion..."). 
`git -C c:\Users\Administrador\BorondoTours restore --source=a76b808 --staged --worktree .kiro docs apps/web .obsidian` y borrar `docs/` nuevo con `git clean -fd docs` (revisar antes).