# Plan de implementación — Fábrica SDLC multi-agente

Fuente: `design.md` (iteración 4, APPROVED en `design-review.md`), `research.md`, `protocolo-usuario.md`.
Se trabaja directo en `c:\Users\Administrador\BorondoTours` (SIN worktree; los `.kiro` deben estar en la raíz para que Kiro los cargue).

Rutas de ESCRITURA permitidas: `.kiro/agents/` (solo nuevos `sdlc-*`), `.kiro/factory/` (nuevo), `.kiro/workflows/` (nuevo), `.kiro/hooks/` (solo nuevos `factory-*`), `.kiro/skills/` (nuevo), `.kiro/steering/19-fabrica-agentes.md` (nuevo) + edición mínima de `00-documentation-map.md` y `17-estado-del-proyecto.md`, `docs/04-Tech-Design/Fabrica-Agentes-SDLC.md` (nuevo), `docs/05-Dev-Log/` (nuevo), `docs/DECISIONES-PENDIENTES.md` (solo agregar al final), `docs/04-Tech-Design/Mapa-Repositorio.md` (edición mínima §7), `package.json` raíz (solo agregar 3 scripts), `.gitignore`/`.gitattributes` (agregar reglas), `.agents/tasks/sdlc-factory-2026-10-12/`, y edición mínima de `.kiro/agents/figma-sync.json`.
NO tocar: `apps/`, `services/`, `packages/`, `infra/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, `mcp.json`, hooks/steering existentes (salvo 00 y 17), `figma-sync.json` (salvo edición mínima). NO git add/commit/stash/reset/checkout. NO instalar dependencias. CLI en Node ESM puro sin dependencias nuevas; si YAML exigiera dependencia, usar JSON. De `mcp.json` leer SOLO nombres de servidores.

Esta tarea se descompuso en artefactos FEAT bajo `.agents/tasks/sdlc-factory-2026-10-12/features/`. Este `plan.md` es el respaldo legible y refleja el mismo orden. Las features son estrictamente secuenciales (comparten una sola copia de trabajo y el índice/staging de git).

## FEAT-001 — Bus y CLI (PR 1 del diseño §19)

- [ ] 1. Crear la estructura base de `.kiro/factory/` con los documentos para humanos.
      Archivos: `.kiro/factory/README.md`, `.kiro/factory/PROTOCOL.md` (≤200 líneas, español; §8 del diseño: arranque, paso 2b de la puerta de Fase 3, trabajo/publicación, cierre, señal por RESULT §8.3, YAML canónico §6.5, reglas no negociables §8.4), `.kiro/factory/THIRD_PARTY.md` (atribuciones MIT/MIT-0 §12/research A2: ECC, VoltAgent, wshobson, agency-agents, BMAD sin la marca, spec-kit, AI-DLC, aws-samples, OWASP Threat Dragon; texto completo de licencia MIT una vez por titular adaptado).
      Verificar: los tres archivos existen y `PROTOCOL.md` tiene los encabezados que exige `handoff.mjs`/`registry check` (se valida al final de la FEAT con `registry check`).

- [ ] 2. Crear los registros `.kiro/factory/registry/` (JSON, sin YAML).
      Archivos: `registry/agents.json` (22 roles con `primaryAgent`/`backupAgent`, `profile`, `profileExtras`, `modes {<mode>:{artifacts,doneWhen}}`, `produces`/`consumes`/`subscribes`/`cosigns`, `mcp` con `tier`, `steering`, `skills`, `active`; más `dormant[]` con `mobile-expo`), `registry/artifact-types.json` (grafo `dependsOnTypes` acíclico + `feedbackFrom`, `applicableWhen`, `producerBySlug` para múltiples), `registry/profiles.json` (perfiles por capability: conductor, analyst, contract, developer, writer, auditor, ops; deny obligatorios de la base §4.6), `registry/recipes.json` (7 recetas con `approvalThreshold`, `allowedOwnerRoles`, puerta requerida/producida, exclusividad).
      Verificar: al final de la FEAT, `node .kiro/factory/scripts/factory.mjs registry check` sin errores de grafo (acíclico) ni de perfiles.

- [ ] 3. Crear los esquemas JSON Schema 2020-12 (subconjunto §2) en `.kiro/factory/schemas/`.
      Archivos: los ~30 esquemas listados en §3.1 (manifest, event, index, dispute, review, loop-state, los 4 registry-*, y uno por tipo de artefacto: prd, compliance-requirements, cost-estimate, data-model, threat-model, design-tokens, a11y-rules, domain-rules, integrations, build-report, quality-report, quality-verdict, ops-plan, release-plan, release-report).
      Verificar: `validate.test.mjs` carga cada esquema sin keyword fuera del subconjunto soportado.

- [ ] 4. Crear las plantillas de ejemplo válidas en `.kiro/factory/templates/` y el ejemplo completo del bus `.kiro/factory/bus/_example/`.
      Archivos: los ~20 `*.example.*`/`*.template.*` de §3.1 (incluidos `EdgeCases.example.yml` y `openapi.example.yaml` en YAML canónico, y `C4-Model.template.md`, `ADR-DRAFT.template.md`, `handoff.template.md`, `dispute-position.template.md`); y `bus/_example/` COMPLETO y válido: `manifest.json`, `events.jsonl` (cadena por hash desde GENESIS), `inbox/<role>.md`, `handoff/<role>.md`.
      Verificar: `templates.test.mjs` valida cada plantilla contra su tipo; el `_example/` pasa `verify`.

- [ ] 5. Implementar el CLI `factory.mjs` y sus módulos `lib/` (una responsabilidad por archivo, funciones ≤50 líneas).
      Archivos: `.kiro/factory/scripts/factory.mjs` (despachador), `scripts/tsconfig.json`, y los ~35 módulos de §6.4 (args, paths, ids, hash, lock, fsx, registry, permissions, manifest, transitions, deps, plan, modes, scope, events, inbox, handoff, validate, yaml-lite, rules, trace, gates, disputes, runs, loops, index, lifecycle, fingerprint, toolcheck, e2e, scan, advise, guard, output). Comandos: init/run/status/claim/publish/sign/dispute/loop/notify/inbox/handoff/reassign/waive/feature/supersede/approve/gate/fingerprint/toolcheck/run-e2e/scan/verify/registry/advise/guard-bus (§6.1). Códigos `E_*` y exits de §6.2. Lock por feature, orden append→manifest de §6.3. Identidad por agente y deny de acciones humanas en `permissions.mjs` (§4.6, F-02).
      Verificar: `node .kiro/factory/scripts/factory.mjs --help` responde; `pnpm factory:typecheck` en verde.

- [ ] 6. Escribir los tests del CLI con `node:test` y el runner.
      Archivos: `scripts/tests/run.mjs` (lista `*.test.mjs` con `readdirSync`, lanza `process.execPath --test`; con `--coverage` agrega `--experimental-test-coverage --test-coverage-lines=80`), los ~30 `*.test.mjs` de §14 y `fixtures/playwright-report.example.json`.
      Verificar: `pnpm factory:test` en verde; `node .kiro/factory/scripts/tests/run.mjs --coverage` ≥80% de líneas.

- [ ] 7. Agregar los scaffolds de memoria, los cambios de raíz y las reglas de git.
      Archivos: `.kiro/factory/memory/lessons/.gitkeep`, `.kiro/factory/memory/proposals/.gitkeep`; en `package.json` raíz, agregar solo `factory`, `factory:test`, `factory:typecheck` (§6.6, sin tocar turbo.json); en `.gitignore` agregar `.kiro/factory/state/`, `.kiro/factory/bus/**/.lock`, `.kiro/factory/**/*.tmp-*` y `.aws-sam/`; crear `.gitattributes` con `.kiro/factory/** text eol=lf`.
      Verificar: `pnpm factory:test`, `pnpm factory:typecheck` y `node .kiro/factory/scripts/factory.mjs registry check` en verde; `pnpm typecheck` del producto igual que antes.

## FEAT-002 — Agentes de Fases 1-2 + reviewer + conductor + 8 skills (PR 2 del diseño §19)

- [ ] 8. Crear las 8 skills que usan los agentes de Fases 1-2 en `.kiro/skills/bt-*/SKILL.md`.
      Archivos: `bt-api-contract-openapi`, `bt-drizzle-postgres`, `bt-threat-modeling-stride`, `bt-astro-frontend`, `bt-verification-loop`, `bt-tdd-vitest`, `bt-hono-backend`, `bt-security-review` (§11; frontmatter `name`/`description` español, ≤250 líneas, comandos del steering 16 en PowerShell, `## Atribución` MIT). Copiar texto literal solo de la copia local de ECC; el resto redactado desde cero.
      Verificar: cada `SKILL.md` tiene frontmatter `name` y `description`.

- [ ] 9. Crear 13 fichas de rol en `.kiro/factory/roles/` y 13 agentes JSON en `.kiro/agents/sdlc-*.json`.
      Archivos (fichas + JSON): conductor, artifact-reviewer, product-manager, business-analyst, compliance-officer, solutions-architect, finops, api-contract, data-modeler, security-architect, uiux-a11y, domain-rules, integrations. Fichas con los encabezados obligatorios de §9.2. JSON en el formato de §9.3 (sin campo `hooks`, `resources` explícitos, `permissions` = `renderPermissions(agentName, profile, profileExtras)`, `tools ⊆ perfil ∪ extras`). Editar `.kiro/agents/figma-sync.json` de forma mínima: agregar `resources` (steering 12, 13, 18) y la frase de §8.4.
      Verificar: `permissions.test.mjs` en verde; `registry.test.mjs` en verde salvo los `missing-agent` esperados de los 9 agentes de FEAT-003 (declararlos como esperados en el test).

## FEAT-003 — Agentes de Fases 3-5 + 2 skills (PR 3 del diseño §19)

- [ ] 10. Crear las 2 skills restantes y 9 fichas + 9 agentes JSON.
      Archivos: `.kiro/skills/bt-e2e-playwright/SKILL.md`, `.kiro/skills/bt-search-first/SKILL.md`; fichas `roles/<role>.md` y `.kiro/agents/sdlc-<role>.json` para backend, frontend, content-seo, tech-writer, peer-reviewer, security-auditor, qa-e2e, devops-sre, release-manager (mismos criterios de §9.2/§9.3; perfiles developer/writer/auditor/ops; extras de qa-e2e `apps/web/e2e/**`).
      Verificar: `registry.test.mjs` en verde (incluida la compatibilidad de respaldos entre FEAT-002 y FEAT-003) y `permissions.test.mjs` en verde.

## FEAT-004 — Recetas, hooks, steering y docs (PR 4 del diseño §19)

- [ ] 11. Crear las 7 recetas de workflow en `.kiro/workflows/factory-*.workflow.json`.
      Archivos: factory-discovery, factory-contracts, factory-build, factory-quality-gates, factory-release, factory-feature-e2e, factory-contract-dispute (estructura de §9.6; primer nodo `init`, revisor último de cada `repeat`, último nodo del conductor con `Cierra corrida: sí`, `fileCheck` bajo `state/`, `joinPolicy: allSettled`). Usar el esquema de nodo (`type`, `steps`, `repeat`, `parallel`, `stopCondition.fileCheck`) de research A3; marcar como "pendiente de validación por el orquestador (V1)" lo ambiguo.
      Verificar: `workflows.test.mjs` en verde (ids únicos, ≤50 pasos, agentes existentes, cada `{{<id>.output}}` a nodo anterior, revisor al final de cada repeat).

- [ ] 12. Crear los 2 hooks `factory-*` (v2, `PostFileSave`, `enabled: false`).
      Archivos: `.kiro/hooks/factory-contract-advisory.json` (matcher sobre apps|services|packages|infra, comando `advise`), `.kiro/hooks/factory-bus-guard.json` (dos entradas: guard-bus con matcher sobre `\.kiro[\\/]factory[\\/]bus[\\/]`, y registry check `--advisory`). Comandos salen con 0 aunque no haya features.
      Verificar: `hooks.test.mjs` en verde (v1/v2 shape, `trigger: PostFileSave`, `action.type: command`, sin `PreToolUse`).

- [ ] 13. Crear el steering 19 y las ediciones mínimas de steering y docs.
      Archivos: `.kiro/steering/19-fabrica-agentes.md` (inclusion auto, ≤60 líneas, §12); una fila nueva en `.kiro/steering/00-documentation-map.md` (después de la fila `.kiro/hooks/`); fila nueva + línea de pendientes `#16-#32` + fecha de verificación en `.kiro/steering/17-estado-del-proyecto.md`; bullet en `docs/04-Tech-Design/Mapa-Repositorio.md` §7; `docs/04-Tech-Design/Fabrica-Agentes-SDLC.md` (Diátaxis); entrada en `docs/05-Dev-Log/`; filas #16-#32 al FINAL de `docs/DECISIONES-PENDIENTES.md` (sin reescribir lo existente).
      Verificar: `node .kiro/factory/scripts/factory.mjs registry check` en verde; los archivos existentes solo tienen filas agregadas (diff mínimo).

## Verificación por FEAT (quality gates)

Cada FEAT ejecuta, antes de darse por terminada: `pnpm factory:test`, `pnpm factory:typecheck` y `node .kiro/factory/scripts/factory.mjs registry check`. El estado del producto debe quedar igual (la fábrica no toca código del producto); comparar con `pnpm typecheck` y `pnpm --filter @borondo/web run lint` / `run test:run` / `pnpm --filter @borondo/ui run test` antes y después. Sin `any` ni `console.log` nuevos; español en comentarios de reglas, inglés en identificadores.

## Fuera del plan de código: validación del orquestador (PR 5 del diseño §19)

V1–V8 de §15 (esquema de workflow, permisos de agente, hooks, skills, señales de paso, herramientas `ask`, cobertura en Windows/Linux) y la corrida de humo con `factory-smoke-test` requieren el IDE de Kiro y las decide el humano/orquestador. Quedan documentadas en el README y el steering 19; los hooks se activan solo tras V3. No forman parte de la implementación de código.
