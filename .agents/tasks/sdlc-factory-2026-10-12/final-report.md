---
title: Reporte final de la puerta de validación — Fábrica SDLC
feature: sdlc-factory-2026-10-12
rol: gate-review (puerta que falla cerrada)
iteracion: 1 (primera; no existía gate-review.json)
fecha_verificacion: 2026-10-12
---

# Veredicto global: **PASA** ✅

La fábrica SDLC de BorondoTours (`.kiro/factory/` + agentes `sdlc-*` + recetas `factory-*` + hooks `factory-*` + skills `bt-*` + steering 18/19 + portabilidad) supera la puerta de validación integral. Las 7 comprobaciones salieron en verde sin necesidad de corregir nada. Esta puerta falla cerrada: si algo hubiera fallado, el veredicto sería FALLA; no fue el caso.

Esta es la **primera iteración**: no existía `gate-review.json`, así que NO se reimplementaron FEAT-003/FEAT-004; el trabajo fue verificación cruzada y la redacción de este reporte. No se tocó código de producto; las únicas escrituras de este paso fueron dentro de `.agents/tasks/sdlc-factory-2026-10-12/` (este reporte y un script temporal ya borrado). La copia temporal rota del bus (`_tmp_broken_gate`) se creó y se borró.

---

## 1. Comandos ejecutados y resultados (para el revisor)

| # | Comprobación | Comando | Resultado |
|---|---|---|---|
| 1 | JSON.parse de todos los `.json` nuevos | `node` recorriendo `.kiro/factory/**`, `.kiro/agents/sdlc-*.json`, los 2 hooks `factory-*` y las 7 `*.workflow.json` | **81 archivos, 0 errores** |
| 2a | Suite de la fábrica | `pnpm factory:test` | **156 tests, 156 pass, 0 fail** |
| 2b | Cobertura ≥80% | `node .kiro/factory/scripts/tests/run.mjs --coverage` (`--test-coverage-lines=80`) | **exit 0**; líneas **96.70%**, ramas **81.72%**, funciones **96.12%** (todas ≥80%) |
| 2c | Typecheck | `pnpm factory:typecheck` (`tsc -p .kiro/factory/scripts/tsconfig.json`) | **exit 0** |
| 3 | Registry check | `node .kiro/factory/scripts/factory.mjs registry check` | `registry: OK`, **exit 0**, sin `missing-agent` |
| 4a | CLI sobre el bus de ejemplo | `… verify --feature _example` | `verify: OK`, **exit 0** |
| 4b | CLI sobre copia TEMPORAL rota (hash de `prd` alterado) | `… verify --feature _tmp_broken_gate` | **falla con `E_STALE: modificados: prd`, exit 1** (mensaje claro). Copia borrada; `_example` vuelve a `verify: OK` |
| 5a | Hook advise (contract-advisory) | `'' \| … advise` y `'services/4-payments/src/foo.ts' \| … advise` | **exit 0** en ambos (no rompe sin features) |
| 5b | Hook guard-bus (bus-guard #1) | `'' \| … guard-bus` y `'…/bus/_example/manifest.json' \| … guard-bus` | **exit 0** en ambos |
| 5c | Hook registry advisory (bus-guard #2) | `… registry check --advisory` | `registry: OK`, **exit 0** |
| 6 | Coherencia del grafo | script Node sobre registry + recetas | **0 problemas** (ver §4) |
| 7 | `git status --short` | `git status --short` + categorización | solo rutas permitidas de la fábrica cambian por este paso; resto es trabajo previo o ruido ajeno (ver §8) |

Nota sobre los hooks (paso 5): `advise` y `guard-bus` leen la ruta editada por **stdin** (así los invoca `PostFileSave`). Lanzados sin stdin en una terminal interactiva se quedan esperando entrada (no es un fallo); por eso la verificación se hizo canalizando stdin (vacío = sin features, y con una ruta real). Se valida el **comando**, no el estado `enabled` (los tres nacen deshabilitados por diseño).

---

## 2. Los 22 agentes `sdlc-*` (+ figma-sync)

El `registry/agents.json` declara **23 roles activos** (22 agentes `sdlc-*` + `figma-sync`) y 1 **dormant** (`mobile-expo`, Fase 3). En disco hay exactamente 22 archivos `.kiro/agents/sdlc-*.json`. Todo `primaryAgent`, `backupAgent` y `roleCard` existe.

| # | Rol | Agente primario | Backup | Protocolo | Fase |
|---|---|---|---|---|---|
| 1 | conductor | sdlc-conductor | sdlc-artifact-reviewer | 0 | all |
| 2 | artifact-reviewer | sdlc-artifact-reviewer | sdlc-conductor | 0 | all |
| 3 | product-manager | sdlc-product-manager | sdlc-business-analyst | 1 | discovery |
| 4 | business-analyst | sdlc-business-analyst | sdlc-product-manager | 2 | discovery |
| 5 | compliance-officer | sdlc-compliance-officer | sdlc-security-architect | 3 | discovery |
| 6 | solutions-architect | sdlc-solutions-architect | sdlc-security-architect | 4 | contracts |
| 7 | finops | sdlc-finops | sdlc-solutions-architect | 5 | contracts |
| 8 | api-contract | sdlc-api-contract | sdlc-backend | 6 | contracts |
| 9 | data-modeler | sdlc-data-modeler | sdlc-backend | 7 | contracts |
| 10 | security-architect | sdlc-security-architect | sdlc-security-auditor | 8 | contracts |
| 11 | uiux-a11y | sdlc-uiux-a11y | sdlc-frontend | 9 | contracts |
| 12 | domain-rules | sdlc-domain-rules | sdlc-backend | 0 | contracts |
| 13 | integrations | sdlc-integrations | sdlc-backend | 0 | contracts |
| 14 | backend | sdlc-backend | sdlc-integrations | 10 | build |
| 15 | frontend | sdlc-frontend | sdlc-content-seo | 11 | build |
| 16 | content-seo | sdlc-content-seo | sdlc-frontend | 0 | build |
| 17 | tech-writer | sdlc-tech-writer | sdlc-content-seo | 12 | build |
| 18 | peer-reviewer | sdlc-peer-reviewer | sdlc-security-auditor | 13 | quality |
| 19 | security-auditor | sdlc-security-auditor | sdlc-peer-reviewer | 14 | quality |
| 20 | qa-e2e | sdlc-qa-e2e | sdlc-frontend | 15 | quality |
| 21 | devops-sre | sdlc-devops-sre | sdlc-release-manager | 16 | release |
| 22 | release-manager | sdlc-release-manager | sdlc-devops-sre | 17 | release |
| — | figma-sync | figma-sync | (sin backup, `noInbox`) | 0 | contracts |

Dormant: `mobile-expo` (se activa con Spec-J aprobado y decisión de stack móvil).

Todos tienen `active: true`. Cada rol (salvo `figma-sync`) tiene backup; cada backup existe como agente.

---

## 3. Estructura del Context Bus

- **Único escritor del control**: el CLI `scripts/factory.mjs` (Node ESM, sin dependencias nuevas). Los agentes nunca editan a mano `manifest.json`, `events.jsonl`, `inbox/`, `disputes/*` ni `state/` (los permisos lo niegan).
- **Un directorio por feature** bajo `.kiro/factory/bus/<feature>/` con:
  - `manifest.json` — estado, artefactos (versión, status, hash sha256, firmas, dependsOn, consumers, requiredSigners), gates por fase, assignments, claims, disputes, approvals y `lastEvent`.
  - `events.jsonl` — bitácora append-only **encadenada por hash** (cada evento referencia el hash del anterior; `verify` valida la cadena y los hashes en disco).
  - carpetas de fase `01-discovery/ … 05-release/`, `inbox/`, `handoff/`.
- **`bus/_example/`** — feature de ejemplo (Split Fare, fase discovery) que usa `registry check` y la verificación; se mantiene y vuelve a `verify: OK` tras la prueba.
- **`state/`** — índice derivado, locks y estado de corridas; ignorado por git.
- **`registry/`** — `agents.json`, `recipes.json`, `artifact-types.json`, `profiles.json` (grafo neutro del motor).
- **`schemas/`** (31) — JSON Schema (subconjunto 2020-12) de cada artefacto y archivo de control.
- **`templates/`** — ejemplos válidos usados como fixtures por los tests.
- **`memory/`** — `lessons/` y `proposals/` (deja el conductor).

Mecanismos verificados por la suite: firma parcial/completa, idempotencia de firma, `E_SIGNER` (el productor del hash no cofirma con otro rol; agente no válido para el rol), rechazo sobre draft, lock corto en `verify`, y las transiciones de estado válidas/ inválidas (`E_TRANSITION`).

---

## 4. Coherencia del grafo (paso 6) — 0 problemas

- **Cada agente del registry existe como archivo**: 22/22 `primaryAgent` + todos los `backupAgent` presentes en `.kiro/agents/`.
- **Cada `roleCard` existe**: 21 fichas en `.kiro/factory/roles/` (figma-sync tiene `roleCard: null` por diseño).
- **Cada agente referenciado en las 7 recetas existe**: todos son `sdlc-*` (integrados `wf-*`/`semantic_reviewer` admitidos; no se usan agentes inexistentes).
- **Cada artefacto consumido tiene productor**: 20 tipos de artefacto producidos; ningún `consumes` ni `cosigns` apunta a un tipo sin productor.
- **Cada rol tiene respaldo**: todos los roles salvo `figma-sync` declaran `backupAgent` válido.

La suite además verifica, en `workflows.test.mjs`, propiedades estructurales de las recetas: primer nodo `init` (conductor), ids únicos, ≤50 pasos, profundidad ≤8, el revisor es el último paso de cada `repeat`, el último nodo es el conductor con "Cierra corrida: sí", `fileCheck` bajo `state/` y declarado en `recipes.json`, ningún paso interactivo dentro de un `parallel`, y los órdenes de fase (qa-e2e antes de peer/security en quality; integrations tras api-contract en contracts; release-signoff de dos ramas; contract-dispute de 20 pasos sin modos zod/build/fix).

---

## 5. Las 7 recetas (`.kiro/workflows/factory-*.workflow.json`)

| Receta | Workflow | requiresGate → producesGate | Último nodo (modo) | Loops |
|---|---|---|---|---|
| discovery | factory-discovery.workflow.json | — → discovery | gate-discovery (gate) | discovery.review (umbral medium) |
| contracts | factory-contracts.workflow.json | discovery → contracts | gate-contracts (gate) | contracts.review (medium) |
| build | factory-build.workflow.json | contracts → build | checkpoint-build (checkpoint) | — |
| quality-gates | factory-quality-gates.workflow.json | build → quality | gate-quality (gate) | quality.review (umbral **high**) |
| release | factory-release.workflow.json | quality → release | close (close) | release.review (medium) |
| feature-e2e | factory-feature-e2e.workflow.json | — → quality | q-gate-quality-close (gate) | discovery/contracts/quality (49 pasos) |
| contract-dispute | factory-contract-dispute.workflow.json | — → — (slot `dispute`, no exclusivo) | close (close) | dispute.negotiation (20 pasos) |

> ⚠️ **Requieren validación del orquestador V1**: el esquema exacto de los nodos de Kiro (`type`, forma de `branches`/`stopCondition.fileCheck`), la precedencia de permisos de agente y el disparo de hooks se validan en el IDE (ver `design.md` §15, V1–V8). Hasta entonces las recetas usan la mejor aproximación documentada; es un pendiente del motor, igual en cualquier repo. Esto NO afecta el veredicto de esta puerta (la lógica, el parseo y la coherencia están verificados).

---

## 6. Los 2 hooks (nacen deshabilitados)

| Archivo | Entrada(s) | Trigger | Comando | enabled |
|---|---|---|---|---|
| `factory-contract-advisory.json` | Factory Contract Advisory | PostFileSave en `apps\|services\|packages\|infra` | `factory.mjs advise` | **false** |
| `factory-bus-guard.json` | Factory Bus Guard | PostFileSave en `.kiro/factory/bus/**` | `factory.mjs guard-bus` | **false** |
| `factory-bus-guard.json` | Factory Registry Guard | PostFileSave en `.kiro/{agents,workflows,skills,factory/registry,factory/roles}` | `factory.mjs registry check --advisory` | **false** |

Los tres son **avisos no bloqueantes** (nunca bloquean ni modifican archivos), con `timeout: 10`. Se activarán tras V3 (validación en el IDE). La suite (`hooks.test.mjs`) confirma `version: v1`, `trigger: PostFileSave`, `action.type: command`, ausencia de `PreToolUse` y `enabled: false` en todas las entradas, más la presencia de los comandos `guard-bus`, `registry check --advisory` y `advise`.

---

## 7. Portabilidad (otro repo/proyecto)

El **motor es neutro** y lo específico de BorondoTours se concentra para hacerla portable:

- **`profile.json`** (schemaVersion 1): único archivo que concentra `project`, `stack`, `paths`, `commands` (incluye `available{}` para config ausente), `factory`, `compliance` (jurisdicción Colombia: Ley 1581, Decreto 1377, Ley 1480/2300, DIAN, PCI DSS, WCAG 2.2 AA), `steeringToRead`, `mcpServers` (SOLO nombres), `productionGuard` (perfil AWS dev, cuentas prod/root negadas, comandos solo-humano) y `openDecisions`.
- **`PORTING.md`**: qué copiar (motor neutro: `scripts/`, `schemas/`, `registry/artifact-types.json`, recetas, hooks) vs qué reescribir (`profile.json`, `registry/profiles.json`, `agents.json`, skills `bt-*`, steering 19); qué NO copiar (`bus/`, `state/`, código de producto, steering 00–18 ajenos); esquema de `profile.json`; búsquedas sugeridas (`borondo`, `OnePay`, `Siigo`, `Ley 1581`, `@borondo/`, IDs de cuenta AWS); checklist "quedó neutra".
- **`ADAPT-PROMPT.md`**: prompt listo para pegar en Kiro del repo nuevo; guía a la IA a inventariar el repo, identificar normativa, reescribir `profile.json`, señalar/arreglar referencias al origen y verificar con `registry check` + `factory:test` + `factory:typecheck`, sin instalar, sin commits, sin despliegues, con los hooks en `enabled: false`.
- Alcance declarado: **Kiro IDE**. claude-flow y otros runtimes quedan fuera (la fábrica no depende de ellos). Atribuciones de terceros en `THIRD_PARTY.md`.

Las 10 skills `bt-*` están presentes: `bt-api-contract-openapi`, `bt-astro-frontend`, `bt-drizzle-postgres`, `bt-e2e-playwright`, `bt-hono-backend`, `bt-search-first`, `bt-security-review`, `bt-tdd-vitest`, `bt-threat-modeling-stride`, `bt-verification-loop`.

---

## 8. `git status --short`: qué cambia (paso 7)

Clasificación de los cambios del árbol de trabajo:

- **Permitidas de la fábrica (este trabajo)**: `.kiro/factory/`, `.kiro/agents/`, `.kiro/workflows/`, `.kiro/skills/`, `.kiro/hooks/factory-bus-guard.json`, `.kiro/hooks/factory-contract-advisory.json`, `.kiro/settings/`, `.kiro/steering/18-kit-componentes.md`, `.kiro/steering/19-fabrica-agentes.md`, los steering 00/17 actualizados, `docs/04-Tech-Design/Fabrica-Agentes-SDLC.md`, `docs/05-Dev-Log/2026-10-12-Fabrica-Agentes-SDLC.md`, `.agents/`. También la fábrica aporta: `package.json` (añade solo `factory`, `factory:test`, `factory:typecheck`) y `.gitignore`/`.gitattributes` (ignora `state/`, `.lock`, `.aws-sam/`). Verificado con `git diff`.
- **Ruido ajeno de `.claude` (264 entradas, borrado no commiteado)**: se ignora según la instrucción.
- **Trabajo previo NO de este paso (~110 entradas)**: reorganización del vault Obsidian (`.obsidian/docs-2` → `docs/`), Specs/ADRs/Knowledge, `apps/web/src/lib/fig/*` y estilos (redesign del runtime), limpieza de `tmp-*` en `apps/web`, `docs/.obsidian/*`. Son cambios de features anteriores (FEAT-001/002 y trabajo de producto), ya presentes antes de esta puerta; **este paso no los introdujo**.

**Conclusión del paso 7**: aparte del ruido de `.claude`, lo que este paso añade al árbol son exclusivamente rutas permitidas de la fábrica. El resto es trabajo previo preexistente, no generado por la validación.

---

## 9. Decisiones pendientes del usuario

Ninguna la resuelve la fábrica; se registran en `docs/DECISIONES-PENDIENTES.md`.

**Propuestas de la fábrica SDLC (#16–#32)**:
- #16 Storybook (vs kit `bt-*` + tests de `packages/ui` + Figma, actual).
- #17 Fuente del OpenAPI (YAML a mano + `x-bt-zod`, vs generar desde Zod).
- #18 Lint de OpenAPI/QUERY (revisión del agente vs Redocly/Spectral vs OpenAPI 3.2).
- #19 Escáneres SAST/DAST (semgrep, trivy, gitleaks, SonarQube, OWASP ZAP).
- #20 cfn-lint / cfn-guard (herramientas fuera de npm).
- #21 Feature flags (parámetros SAM interino vs AWS AppConfig).
- #22 Despliegue canary/linear (`DeploymentPreference`, depende de #15).
- #23 Versión WCAG (2.2 AA en la fábrica vs 2.1 AA en steering 06/15).
- #24 Steering 14 contradictorio (corregir o retirar; la fábrica no lo carga).
- #25 Memoria vectorial del bus (`knowledgeBase` de Kiro o MCP; MCP Obsidian solo tras #11).
- #26 Puerta de la fábrica en CI (job que corra `pnpm factory gate …` en PRs).
- #27 Config de ESLint fuera de `apps/web` y reglas de complejidad.
- #28 Umbral de cobertura y tests en servicios.
- #29 DBML (manual vs `drizzle-dbml-generator`).
- #30 Publicación externa automática (GitHub/ClickUp/Postman; elegir cuenta `servergf` o `serverbtours`).
- #31 Analítica y performance (Lighthouse CI, k6).
- #32 Config de drizzle-kit (`packages/db/drizzle.config.ts`; relacionado con #14).

**Previas que siguen abiertas** y afectan a la fábrica: #1 (Hono vs NestJS), #2 (Astro vs Vite), #11 (rotar la API key del plugin Obsidian — acción del usuario; condiciona #25), #13 (CI), #14/#32 (scripts db / drizzle config), #15 (SAM vs CDK; condiciona #22).

**Worktree `flamboyant-noether`**: era `.claude/worktrees/flamboyant-noether`, parte del `.claude` ya borrado por el usuario (aparece como `D` en git). No forma parte de la fábrica; no hay que recrearlo ni versionarlo. Decisión del usuario: confirmar el borrado al hacer commit.

**Propuestas de MCP**: `profile.json#mcpServers.enabled` solo lista **nombres** de servidores disponibles (figma-bridge, clickup, playwright, google_workspace, postman, github, aws-*, obsidian, context7, agentcore…). "Disponible" no implica "tier B operativo": habilitar publicación externa por rol (#30) y la memoria vectorial por MCP (#25) son decisiones del usuario, pendientes de validación en el IDE (V2).

---

## 10. Cómo lanzar la primera feature por la fábrica

El humano opera siempre con `pnpm factory …` (las acciones humanas están negadas a los agentes). Dos caminos:

**A. Manual, paso a paso con el CLI** (control total):
```powershell
# 1. Crear la feature (crea bus/<id>/)
node .kiro/factory/scripts/factory.mjs init --feature mi-feature --title "Mi feature"
# 2. A medida que cada rol produce su artefacto
node .kiro/factory/scripts/factory.mjs publish --feature mi-feature --type prd --role product-manager --agent sdlc-product-manager
node .kiro/factory/scripts/factory.mjs sign    --feature mi-feature --artifact prd --role business-analyst --agent sdlc-business-analyst
# 3. Cerrar cada fase por su puerta
node .kiro/factory/scripts/factory.mjs gate     --feature mi-feature --phase discovery
# 4. Estado e integridad en cualquier momento
node .kiro/factory/scripts/factory.mjs status   --feature mi-feature --json
node .kiro/factory/scripts/factory.mjs verify    --feature mi-feature
```

**B. Orquestado por receta** (recomendado una vez validado el orquestador, V1): lanzar el workflow `bt-factory-discovery` (o `bt-factory-feature-e2e` para el ciclo completo discovery→contracts→quality). El primer nodo es `sdlc-conductor` en modo `init`, que ejecuta `init` + `run start` e imprime `FEATURE_ID`, `RUN_ID` y `PHASE`; cada fase termina en su puerta y el conductor cierra la corrida con `run finish` y la lección.

Antes de confiar en el camino B conviene cerrar V1 (esquema de nodos de Kiro) y activar los hooks `factory-*` tras V3.

---

## Resumen

Puerta **PASA**. 81 JSON válidos, 156 tests verdes con cobertura ≥80% (líneas 96.70%, ramas 81.72%, funciones 96.12%), typecheck limpio, `registry check` OK, el CLI acepta el bus bueno y rechaza el roto con mensaje claro, los 3 comandos de hook corren sin romper y nacen deshabilitados, el grafo es coherente (0 problemas) y el `git status` solo suma rutas permitidas de la fábrica aparte del ruido ajeno de `.claude`. La fábrica es portable vía `profile.json` + `PORTING.md` + `ADAPT-PROMPT.md`. Quedan pendientes del usuario #16–#32 (y #1/#2/#11/#13/#14/#15), el borrado del worktree `flamboyant-noether` y las propuestas de MCP, además de la validación del orquestador en el IDE (V1–V8) que no bloquea esta puerta.
