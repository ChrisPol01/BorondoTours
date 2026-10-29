# Investigación Fase A — Fábrica SDLC agéntica para BorondoTours

Fecha: 2026-10-12. Alcance: solo investigación, sin cambios de código.
Fuentes verificadas: archivos locales (lectura, sin ejecutar nada de terceros), `gh api` / `gh repo view` / `gh search repos` (metadatos y contenido remoto, sin clonar), y la doc oficial de Kiro descargada en `$env:TEMP` (`https://kiro.dev/llms.txt` y las páginas `.md`), ya borrada.

Restricciones que condicionan todo el informe:
- Stack real (steering 02/04/16/17): pnpm + Turborepo, Astro + React 19 + Tailwind 4, Hono sobre Bun en Lambda, Drizzle + PostgreSQL 16, Zod en `packages/contracts`, SAM + CDK (#15 sin decidir), AWS serverless, sin ECS, Kubernetes ni Redis. Las librerías fuera del stack necesitan discusión.
- Normativa local: Ley 1581/2012 y Decreto 1377/2013 (habeas data), Ley 1480 (retracto y consumidor), Ley 2300, DIAN/Siigo (steering 07). El protocolo del usuario cita GDPR/CCPA/SOC 2/ISO 27701, que sirven como marco de referencia, pero la ley que aplica es la colombiana.
- Hooks ya existentes en `.kiro/hooks/` (19 activos, formato v1 `.json` más copias heredadas `.kiro.hook` y dos archivos `* copy.hook` duplicados): guards de API, RBAC, finanzas, PII, máquinas de estado, a11y/i18n, infra, realtime, servicios externos, docs, shell, plan-before-execute, pre/post task, session-summary, test-completeness y update-data-model-docs.
- Servidores MCP disponibles (solo nombres, de `~/.kiro/settings/mcp.json`; no hay `mcp.json` de workspace). Habilitados: `figma-bridge`, `clickup`, `playwright`, `google_workspace-gfourmis`, `power-postman-postman`, `github-mcp-servergf`, `power-saas-builder-aws-knowledge-mcp-server`, `power-saas-builder-awslabs.aws-serverless-mcp`, `power-saas-builder-playwright`, `power-cloud-architect-awspricing`, `power-cloud-architect-awsapi`, `power-cloud-architect-context7` y `power-aws-agentcore-agentcore-mcp-server`. Sin flag `disabled` (cuentan como activos): `obsidiandos`, `mcp-obsidian` y `aws-mcp`. Deshabilitados pero útiles para la fábrica: `power-aws-cost-optimization-*` (billing, pricing, cloudwatch), `power-aws-sam-*`, `power-aws-infrastructure-as-code-*`, `chrome-devtools-mcpbtours` y `github-mcp-serverbtours`.
- Skills globales ya instaladas en `~/.kiro/skills/`: aws-serverless, aws-deployment, aws-cdk, aws-cloudformation, aws-observability, aws-security, aws-iam, aws-database, aws-billing-and-cost-management, aws-auth, aws-messaging-and-streaming, entre otras. Cubren buena parte de DevOps, FinOps y SRE sin escribir nada nuevo.

---

## A1. Evaluación de `C:\Users\Administrador\affaann\ECC-main\ECC-main` (ECC)

Identidad y licencia:
- Corresponde a `affaan-m/ECC` (antes `everything-claude-code`; GitHub redirige el nombre viejo). MIT, Copyright (c) 2026 Affaan Mustafa (LICENSE en la raíz; `.kiro/` no trae LICENSE propio). Versión local `2.0.0-rc.1`. Según la API de GitHub: 277k estrellas y push el 2026-10-12.
- El `.kiro/README.md` enlaza el proyecto a una URL de `anthropics/courses/...` que no corresponde al repo real. Es una señal más para tratar el contenido como no confiable.
- Los scripts no se ejecutaron. Se revisaron `install.sh`, `scripts/quality-gate.sh` y `scripts/format.sh`. Son benignos (copian archivos sin sobrescribir; corren build, tsc, lint y test, o prettier/biome), pero están en bash, el host es Windows/PowerShell, y usan `npx <herramienta>`, que puede descargar paquetes del registry sin fijar versión.
- Riesgo de cadena de suministro en el contenido: `agents/e2e-runner.md` pide `npm install -g agent-browser`, y varios agentes recomiendan `npx knip|ts-prune|depcheck|madge|jsdoc2md|prisma`, herramientas fuera del stack.

Compatibilidad de formato con Kiro (contrastada con la doc oficial, ver A3):
- Los agentes `.json` están en formato CLI 2.x: `allowedTools` sin bloque `permissions`, nombres viejos `fs_read`/`shell` y `tools: ["@builtin"]` (todas las herramientas). La doc dice que CLI V3 omite esos perfiles hasta pasar `/upgrade-agent`. Además todos incluyen `"hooks": {}`. Según la página "Agent config changes" del IDE 1.0, el campo `hooks` es solo de CLI y el IDE ignora los agentes que lo contienen. No se probó si un objeto vacío basta para que los ignore. Queda como riesgo y conviene no copiarlo.
- Los agentes `.md` usan frontmatter `name/description/allowedTools`. El formato Markdown es válido en IDE 1.0, pero `allowedTools` es un campo heredado.
- Las skills (`SKILL.md` con `name` y `description`) siguen el estándar Agent Skills que Kiro soporta en `.kiro/skills/`.
- La steering usa `inclusion: auto|fileMatch|manual`, que es compatible.
- Los hooks están en el formato heredado `.kiro.hook` (`when`/`then`). BorondoTours ya migró al v1 `.json`. `userTriggered` no tiene equivalente al crear hooks nuevos en el IDE 1.0.
- El contenido es genérico y en inglés, con ejemplos de Next.js, Supabase, Redis, Vercel, Express, Prisma y Docker. No menciona Hono ni Astro.

### Tabla pieza de ECC → veredicto

| Pieza ECC | Veredicto | Razón |
|---|---|---|
| agents/architect | Adaptar | Buen esqueleto (trade-offs, plantilla de ADR, checklist de NFR). Su ejemplo de ADR usa Redis y su "arquitectura del proyecto" es Next/Supabase/Cloud Run. Hay que cambiarlo a C4 en Mermaid, Well-Architected serverless lens y `docs/02-ADRs/ADR-001-Plantilla.md`. Base del Solutions Architect. |
| agents/build-error-resolver | Adaptar | Útil como agente de soporte (tsc, turbo, Astro). Quitar los ejemplos de Next.js y fusionarlo con react-build-resolver. |
| agents/chief-of-staff | Descartar | Triaje de email, Slack, LINE y Messenger. No tiene que ver con el SDLC. |
| agents/code-reviewer | Adaptar | Base del Peer Reviewer. Agregar las reglas de BT (funciones de 50 líneas o menos, sin `any`, sin `console.log`, `t('ns:key')`, SafeHtml, tenant isolation por `operator_id`) y la regla `complexity` de ESLint. |
| agents/database-reviewer | Adaptar | Base del DBA (índices, Postgres). Usa RLS y patrones de Supabase y paginación offset. BT usa Drizzle, snake_case, UUID v4, sin soft delete y paginación por cursor. |
| agents/doc-updater | Adaptar | Base del Technical Writer. Hace referencia a comandos `/update-codemaps` que no existen, y le faltan Diátaxis y las reglas del vault Obsidian (wikilinks, `docs/` según steering 00). |
| agents/e2e-runner | Adaptar | Base del QA. Hay que quitar "Vercel Agent Browser" y su `npm install -g`, y usar Playwright (`apps/web/playwright.config.ts`) más el MCP `playwright`. |
| agents/go-build-resolver, go-reviewer, python-reviewer | Descartar | Lenguajes fuera del stack. |
| agents/harness-optimizer | Adaptar (opcional) | Pequeño (unos 0,9 KB). Sirve como inspiración del rol "Factory Steward" (mantener agentes, steering y costos). |
| agents/loop-operator | Adaptar | Idea útil para vigilar loops estancados. En Kiro se implementa con `repeat` + `maxIterations` + `onMaxIterations: pause` de los workflows. |
| agents/planner | Adaptar parcial | Se solapa con los specs de Kiro y con `wf-planner`. Aporta al PM y al Conductor la descomposición en fases y riesgos. |
| agents/react-build-resolver | Adaptar parcial | Fusionarlo con build-error-resolver (Vite/Astro islands). Quitar CRA, Next y webpack. |
| agents/react-reviewer | Adaptar | Checklist de hooks y render que sirve al Peer Reviewer de FE. Quitar RSC y Next. |
| agents/refactor-cleaner | Adaptar (opcional) | Depende de knip/ts-prune/depcheck, que están fuera del stack (requiere discusión). Se puede dejar como revisión manual. |
| agents/security-reviewer | Adaptar | Base del Security Auditor (OWASP Top 10, secretos, SSRF). Agregar Ley 1581, PII en logs, SafeHtml, idempotencia del webhook de OnePay y `pnpm audit`. |
| agents/tdd-guide | Adaptar | Base de TDD para Backend y Frontend. Cambiar los ejemplos de Jest/Supabase/Redis por vitest y fijar la cobertura de 80% o más (steering 04). |
| skills/agentic-engineering | Adaptar | Ejecución eval-first y enrutamiento de modelo según costo. Útil para el Conductor. |
| skills/api-design | Adaptar | Base del API Contract Manager. Solo menciona OpenAPI una vez. Faltan OpenAPI 3.1, `{data,error,meta}`, cursor pagination, QUERY (RFC 10008) y `/api/v1/`. |
| skills/backend-patterns | Adaptar (reescritura fuerte) | Escrito para Express y rutas API de Next. Hay que reescribirlo para sub-routers de Hono, middleware RBAC, `onError` y Lambda Web Adapter. |
| skills/coding-standards | Descartar | Se solapa con el steering 04, que manda. |
| skills/database-migrations | Adaptar | Ya trae una sección de Drizzle. Hay que quitar Prisma, Django y golang-migrate. |
| skills/deployment-patterns | Descartar | Centrado en Docker y K8s. Lo cubren mejor las skills globales `aws-deployment`, `aws-serverless` y `aws-cdk`. |
| skills/docker-patterns | Descartar | Sin ECS. Docker solo se usa para el `docker-compose.yml` local. |
| skills/e2e-testing | Adaptar | Playwright con Page Object Model y manejo de tests flaky. Base del QA. |
| skills/frontend-patterns | Adaptar | Escrito para React y Next. Hay que llevarlo a Astro islands, Nanostores, TanStack Query y el kit `bt-*` (steering 18). |
| skills/golang-*, python-* | Descartar | Fuera del stack. |
| skills/postgres-patterns | Adaptar | Referencia útil de índices y tipos. Quitar lo específico de Supabase. |
| skills/search-first | Adaptar leve | Genérica. Hay que agregar que no entra ninguna librería fuera del stack sin discusión y que las versiones van fijadas. |
| skills/security-review | Adaptar | Checklist para el Security Auditor y el Security Architect, más PII colombiana. |
| skills/tdd-workflow | Adaptar | vitest y cobertura de 80%. Se solapa en parte con tdd-guide; conviene una sola fuente. |
| skills/verification-loop | Adaptar | Mapear a los comandos del steering 16 (`pnpm lint && pnpm typecheck && pnpm test`, más `test:e2e` en web). |
| hooks/auto-format | Descartar | Pide al agente formatear en cada guardado, lo que consume tokens. Si hace falta, se hace con un hook `command` de prettier o eslint `--fix` (verificar config). |
| hooks/code-review-on-write | Descartar | Se solapa con `pre-write-quality-check` y los guards por dominio. Revisar en cada escritura es caro. |
| hooks/console-log-check | Adaptar | Ya es regla (steering 06). Mejor como hook v1 `command` (grep no bloqueante) o como parte del quality gate. |
| hooks/doc-file-warning | Descartar | Choca con el Technical Writer y se solapa con `bt-docs-new-file-check`. |
| hooks/extract-patterns | Adaptar | Que en `Stop` proponga lecciones al archivo de lecciones del Context Bus. Se solapa en parte con `session-summary`. |
| hooks/git-push-review | Descartar | Se solapa con `shell-safety-check`. |
| hooks/quality-gate (+ scripts/quality-gate.sh) | Adaptar | El IDE 1.0 no permite crear hooks `userTriggered` nuevos. Convertirlo en steering manual (slash command) o skill que corra el script. Reescribir el script en PowerShell con `pnpm` (sin `npx eslint .` en la raíz). |
| hooks/session-summary | Descartar | BT ya tiene uno mejor (incluye handoff). |
| hooks/tdd-reminder | Adaptar (opcional) | Complementa a `test-completeness-check`: el de ECC se dispara al crear código fuente, el de BT al crear tests. |
| hooks/typecheck-on-edit | Descartar | Se solapa con `post-task-verification`. Correr typecheck en cada guardado es caro en un monorepo. |
| steering/coding-style, development-workflow, git-workflow, testing, security, patterns | Descartar | Se solapan con los steering 03, 04 y 06. `patterns` propone otro formato de respuesta de API, que contradice `{data,error,meta}`. |
| steering/dev-mode, research-mode, review-mode (manual) | Adaptar (opcional) | Como modos manuales por fase de la fábrica. |
| steering/lessons-learned | Adaptar | Como memoria persistente de la fábrica (`.kiro/factory/`). |
| steering/performance | Adaptar parcial | Solo la parte de selección de modelo y manejo de contexto, para el Conductor. |
| steering/typescript-patterns, typescript-security | Adaptar | Como `fileMatch` en `services/**` y `apps/**`, fusionados con las reglas de seguridad de BT. |
| steering/golang-patterns, python-patterns, swift-patterns | Descartar | Fuera del stack. |
| settings/mcp.json.example | Descartar | Servidores bedrock-agentcore, strands, cdk y react-docs. El usuario ya tiene equivalentes; un MCP de CDK solo tendría sentido si #15 se decide por CDK. |
| install.sh / scripts/format.sh | Descartar (no ejecutar) | Copiaría más de 30 piezas en bloque, entre ellas steering `auto` que contradice la de BT. Lo que se tome se copia a mano, pieza por pieza. |
| docs/ (shortform, longform, security-guide) | Solo referencia | Lectura de fondo, no se instala. |

Veredicto global de ECC: sirve como cantera MIT de prompts y checklists (sobre todo architect, code-reviewer, security-reviewer, e2e-runner, tdd-guide, doc-updater y las skills api-design, database-migrations, e2e-testing y security-review). No sirve tal cual para la fábrica: no cubre 9 de los 17 roles (PM, BA, Compliance, FinOps, API Contract, Security Architect, UI/UX a11y, DevOps y Release), está en formato heredado y no tiene noción de artefactos tipados ni de bloqueo entre fases.

---

## A2. Repos de GitHub evaluados

Licencia según `gh api repos/<r>/license`; estrellas y fecha de último push según `gh repo view` (2026-10-12).

| Repo | Licencia | Estrellas | Último push | Formato | Encaje con la fábrica |
|---|---|---|---|---|---|
| affaan-m/ECC (antes everything-claude-code) | MIT | 277k | 2026-10-12 | Kiro `.kiro/` (CLI 2.x + IDE 0.x) + Claude/Codex/etc. | Medio. Ver A1. |
| awslabs/aidlc-workflows (AI-DLC) | MIT-0 | 5.1k | 2026-10-12 | Multiplataforma; soporta Kiro IDE ≥1.1.70 y CLI v3 de forma nativa. `core/agents` con 14 agentes (product, architect, design, developer, devsecops, compliance, quality, operations, pipeline-deploy, aws-platform…), hooks de estado en TS | Alto, el más cercano conceptualmente: ciclo de vida por fases con estado, compliance y devsecops. MIT-0 permite adaptarlo sin atribución obligatoria. Su runtime (hooks TS, CLI `aidlc`) no se instala; se toman prompts y diseño. |
| aws-samples/sample-kiro-cli-multiagent-development | MIT-0 | 41 | 2026-09-09 | Kiro nativo (agents `.md`, hooks v1 `.json`, skills, steering) | Alto en patrones: 9 agentes (product-strategist, technical-lead, software-engineer, test-engineer, security-reviewer, quality-reviewer, platform-engineer, technical-writer, experience-designer), steering `artifact-locations.md` (estado del flujo en `.kiro/`, entregables en `docs/`) y hooks v1 de secretos y comandos destructivos. Ojo: sus agentes traen MCP con `uvx …@latest`, sin versión fijada; hay que fijarla. |
| VoltAgent/awesome-claude-code-subagents | MIT | 25.7k | 2026-10-11 | Claude Code `.md` (frontmatter `name/description/tools`) | Alto para roles: product-manager, business-analyst, gdpr-ccpa-compliance, compliance-auditor, api-designer, backend-developer, frontend-developer, typescript-pro, postgres-pro, database-administrator, devops-engineer, sre-engineer, security-auditor, penetration-tester, accessibility-tester, qa-expert, technical-writer, documentation-engineer, payment-integration, webhook-engineer, multi-agent-coordinator, context-manager. Hay que traducir el campo `tools` de Claude a tags de Kiro. |
| wshobson/agents | MIT | 40.4k | 2026-10-12 | Marketplace de plugins multi-harness (`plugins/<p>/agents/*.md`) | Alto para roles técnicos: c4-architecture (c4-context, container, component y code), threat-modeling-expert (STRIDE), security-auditor, database-architect, backend-architect, accessibility-expert, design-system-architect, deployment-engineer, cloud-architect, docs-architect, tdd-orchestrator, agent-teams. Muchos fijan `model: opus|sonnet`, que hay que quitar. |
| msitarzewski/agency-agents | MIT | 159k | 2026-10-07 | `.md` con frontmatter (name, description, color, emoji) por división | Alto para roles de nicho: engineering-finops-engineer, engineering-privacy-engineer, security-architect, security-compliance-auditor, engineering-sre, engineering-technical-writer, engineering-i18n-engineer, engineering-payments-billing-engineer, design-ux-architect, testing-accessibility-auditor, product-manager. Son prompts largos (150 a 300 líneas) y hay que recortarlos. |
| bmad-code-org/BMAD-METHOD | MIT (GitHub lo reporta como NOASSERTION por el aviso de marca) | 54k | 2026-10-12 | Skills (`skills/bmad-agent-pm`, `-analyst`, `-architect`, `-ux-designer`, `-dev`, `bmad-prd`, `bmad-qa-generate-e2e-tests`, `bmad-correct-course`…) | Medio-alto como metodología (PRD, análisis, cambio de rumbo, que se parece a CONTRACT_DISPUTE). Restricción: "BMad" y "BMAD-METHOD" son marcas, así que se adapta el contenido sin usar el nombre. |
| github/spec-kit | MIT | 141k | 2026-10-10 | Plantillas (spec, plan, tasks, constitution, checklist) y comandos (specify, clarify, plan, tasks, analyze, implement) | Medio. Kiro ya trae specs nativas (`.kiro/specs/`). Sirven como ideas para `clarify` y `analyze` (consistencia entre artefactos) en el PM y el BA. |
| awslabs/cli-agent-orchestrator | Apache-2.0 | 1.4k | 2026-10-12 | Orquestador Python + tmux para CLIs (Kiro CLI por defecto) | Bajo. Es runtime externo (tmux, Python); los workflows nativos de Kiro cubren la orquestación. Solo referencia. |
| requix/kiro-team | MIT | 42 | 2026-05-06 | Kiro CLI con worktrees | Bajo-medio. Referencia del patrón de aislamiento por worktree. |
| aws-samples/sample-kiro-flock | Apache-2.0 | 22 | 2026-09-10 | Clústeres de agentes Kiro + MCP | Bajo. Experimental; solo referencia. |
| kirodotdev/powers | Sin LICENSE en la raíz | 385 | 2026-10-01 | Powers oficiales (aws-sam, aws-observability, aws-step-functions, cloud-architect, terraform, postman, datadog, localstack…) | Alto como capacidad, pero se instalan por el mecanismo oficial de powers, no se copian. El usuario ya tiene instalados cloud-architect, saas-builder, aws-sam y aws-cost-optimization. |
| kirodotdev-labs/awesome-kiro | Licencia "other" | 66 | 2026-05-10 | Lista curada | Índice útil (llevó a AI-DLC y al sample multiagente). No se copia contenido. |
| mikeartee/kiro-steering-docs, mikeartee/kiro-hooks-docs | MIT | 33 / 1 | 2026-06 / 2026-05 | Steering y hooks comunitarios | Bajo. Genéricos; los de BT ya son más específicos. |
| Theadd/kiro-agents | NOASSERTION | 30 | 2026-04-20 | Paquete npm con powers y agentes para Kiro IDE | Descartar: licencia no clara y sería otra dependencia de runtime. |
| contains-studio/agents | Sin LICENSE | 12.4k | 2025-07-28 | Claude Code `.md` | Descartar: sin licencia (todos los derechos reservados) e inactivo. |
| 0xfurai/claude-code-subagents | MIT | 1k | 2025-10-15 | Claude Code `.md` | Bajo. Redundante con VoltAgent y wshobson, y menos activo. |
| lst97/claude-code-sub-agents | MIT | 1.7k | 2025-08-15 | Claude Code `.md` | Bajo. Redundante e inactivo. |
| ruvnet/ruflo (antes claude-flow) | MIT | 74k | 2026-10-12 | Runtime de swarms (npm) | Descartar como dependencia. El `.claude/` del repo ya tiene plantillas claude-flow que no son fuente de verdad (steering 00). |
| anthropics/skills | Mixta (muchas skills Apache-2.0; docx, pdf, pptx y xlsx son solo de código fuente visible) | 181k | 2026-10-09 | Agent Skills (`SKILL.md`) | Referencia del formato SKILL.md. Solo se adaptan las skills Apache-2.0 y nunca las de documentos. Ninguna cubre un rol SDLC concreto. |
| FoundationAgents/MetaGPT | MIT | 70.8k | 2026-01-21 | Framework Python | Solo conceptual: SOP de "empresa de software" con roles PM, Architect y Engineer y artefactos tipados, que es exactamente la idea del Context Bus. No se reutiliza en Kiro. |
| OpenBMB/ChatDev | Apache-2.0 | 34.5k | 2026-07-24 | Framework Python | Solo conceptual (cadena de chat por fases, revisión cruzada). |
| OWASP/threat-dragon | Apache-2.0 | 1.6k | 2026-10-07 | App de modelado de amenazas con modelo JSON | Referencia del esquema para `ThreatModel.json` (STRIDE por elemento y flujo). Se puede abrir el JSON en Threat Dragon si se adopta su esquema. |
| OWASP/pytm | MIT (GitHub lo reporta como NOASSERTION) | 1.2k | 2026-10-05 | Threat modeling como código en Python | Referencia. Python no está en el stack; no se instala. |
| infracost/infracost | Apache-2.0 | 12.6k | 2026-10-09 | CLI de costos para IaC | Bajo. Su soporte principal es Terraform; no verifiqué soporte de SAM/CloudFormation. Para FinOps se prefiere el MCP `power-cloud-architect-awspricing` (ya habilitado) y la skill global `aws-billing-and-cost-management`. |
| awslabs/mcp | Apache-2.0 | 9.8k | 2026-10-09 | Servidores MCP de AWS | Ya en uso vía powers (pricing, serverless, cloudwatch, billing, IaC). |

Las búsquedas `gh search repos` ("claude code sdlc agents", "STRIDE threat modeling LLM") no devolvieron resultados. Para "kiro agents/steering/subagents/hooks/powers" solo aparecen repos pequeños (menos de 70 estrellas) salvo los ya listados. No existe un repo que implemente los 17 roles del protocolo con artefactos tipados y bloqueo entre fases en Kiro. La combinación más cercana es AI-DLC (fases y estado) + sample-kiro-cli-multiagent-development (formato Kiro y artefactos en carpeta) + VoltAgent, wshobson y agency-agents (prompts por rol).

### Atribución para `.kiro/factory/THIRD_PARTY.md`
Solo licencias permisivas. Formato propuesto: repo, ruta de origen, licencia, titular y "adaptado" o "inspirado".
- affaan-m/ECC: MIT, Copyright (c) 2026 Affaan Mustafa.
- VoltAgent/awesome-claude-code-subagents: MIT, Copyright (c) 2025 VoltAgent.
- wshobson/agents: MIT, Copyright (c) 2024 Seth Hobson.
- msitarzewski/agency-agents: MIT, Copyright (c) 2025 AgentLand Contributors.
- bmad-code-org/BMAD-METHOD: MIT, Copyright (c) 2025 BMad Code, LLC. Aviso de marca: no usar el nombre "BMad" ni sus variantes.
- github/spec-kit: MIT, Copyright GitHub, Inc.
- awslabs/aidlc-workflows y aws-samples/sample-kiro-cli-multiagent-development: MIT-0, Copyright Amazon.com, Inc. or its affiliates. No exige atribución; se registra por trazabilidad.
- OWASP/threat-dragon: Apache-2.0. Solo se toma como referencia de esquema; si se copia algo, incluir el aviso NOTICE.
- Sin licencia o con licencia no permisiva, no se copia nada: contains-studio/agents, kirodotdev/powers (se instala por el mecanismo oficial), Theadd/kiro-agents y las skills de documentos de anthropics/skills.

---

## A3. Hallazgos de la documentación oficial de Kiro

Fuentes: kiro.dev/docs `custom-agents/configuration-reference`, `custom-agents/creating`, `custom-agents/subagents`, `ide/whats-new-v1/agent-config`, `ide/whats-new-v1/hooks`, `hooks/types`, `skills`, `steering`, `permissions`, `powers`, `tools`, `workflows` y `workflows/authoring`.

### Formato de agente (IDE 1.0 / CLI V3)
- Ubicación: `.kiro/agents/` (workspace, gana) y `~/.kiro/agents/` (global). Se admite JSON o Markdown (frontmatter para la configuración y cuerpo como prompt) y se pueden mezclar.
- Campos vigentes:
  - `name`, `description` (el agente principal elige subagentes por `description`).
  - `prompt` (inline o `file://./ruta.md`, relativa al archivo del agente).
  - `model`, `mcpServers`.
  - `tools`: IDs (`read_file`, `fs_write`…), tags `read|write|shell|web|subagent`, `@builtin`, `@mcp`, `@<servidor>`, `@<servidor>/<tool>` o `*`.
  - `excludedTools`.
  - `permissions.rules[]` con `capability` (fs_read, fs_write, shell, web_fetch, web_search, mcp, subagent, skill, power, context…), `match`, `effect` (allow, ask o deny) y `exclude`.
  - `resources[]`: `file://…` (se carga al inicio), `skill://…` (carga progresiva) y objeto `{type:"knowledgeBase", source, name, description, indexType, autoUpdate}`.
  - `includeMcpJson`, `includePowers`, `welcomeMessage`.
- Campos heredados: `allowedTools` (un perfil JSON con `allowedTools` y sin `permissions` lo omite CLI V3), `toolsSettings` (obsoleto para reglas de shell y fs, pero sigue vigente para `toolsSettings.subagent.availableAgents/trustedAgents`), `toolAliases` y `keyboardShortcut`.
- `hooks` inline: solo CLI. La página de cambios del IDE 1.0 dice que el IDE ignora los agentes que contienen este campo, así que los agentes de la fábrica no deben llevarlo.
- `figma-sync.json` es válido: usa IDs de herramienta y `@figma-bridge`. Le falta `resources`.
- Contradicción en la doc: la referencia de configuración dice que los agentes custom heredan los recursos por defecto (steering, skills, AGENTS.md) salvo con `chat.disableInheritingDefaultResources`, y la página de skills dice que los agentes custom no cargan skills por defecto. Recomendación: declarar siempre `resources` de forma explícita (`file://.kiro/steering/**/*.md`, `file://.kiro/factory/…`, `skill://.kiro/skills/**/SKILL.md`).
- `knowledgeBase` figura en la referencia general (IDE 1.0/CLI V3), pero la página del IDE 1.0 solo lista `file://` y `skill://`. Sin confirmar en el IDE.
- Subagentes: comparten steering, MCP, archivos del workspace y permisos; no comparten historial, ventana de contexto, estado del spec ni disparos de hooks. En la práctica, los hooks de BT no protegen lo que escribe un subagente, así que las reglas críticas deben estar también en el prompt del agente o en un paso de verificación del workflow. Un orquestador custom necesita el tag `subagent` en `tools`. Los subagentes no interactivos fallan si una herramienta pide aprobación; se resuelve con `trustedAgents`. El DAG de subagentes se planifica de antemano y no admite ciclos.

### Skills
- Hay skills de workspace en `.kiro/skills/<nombre>/SKILL.md` (IDE, CLI y Web) y globales en `~/.kiro/skills/` (IDE y CLI). Si tienen el mismo nombre, gana la de workspace.
- Frontmatter obligatorio: `name` y `description`. Se activan por coincidencia de descripción o como slash command `/nombre`.
- Los agentes custom las reciben vía `resources: ["skill://.kiro/skills/*/SKILL.md"]`. Se pueden importar desde el panel (URL de GitHub de una subcarpeta).

### Hooks
- El formato v1 vive en `.kiro/hooks/*.json`: `{ "version": "v1", "hooks": [ { name, trigger, matcher?, action: { type: "command"|"agent", command|prompt }, timeout? } ] }`. BT ya lo usa.
- Triggers: `SessionStart`, `Stop`, `UserPromptSubmit`, `PreTaskExec`, `PostTaskExec`, `PreToolUse`, `PostToolUse`, `PostFileCreate`, `PostFileSave` y `PostFileDelete` (más `SessionEnd` y Manual, solo en CLI V3).
- Un hook `command` que sale con código 2 bloquea en `PreToolUse`, `UserPromptSubmit` y `PreTaskExec`.
- Los triggers de archivo solo reaccionan a cambios hechos por el agente.
- En el IDE 1.0 no se pueden crear hooks manuales; la alternativa documentada es steering con `inclusion: manual`, que funciona como slash command.

### Workflows (`.kiro/workflows/*.workflow.json|yaml|yml`)
- Campos raíz:
  - `name` (obligatorio).
  - `description`.
  - `inputs`: mapa de nombre a tipo orientativo (`prompt`, `file`, `string`), no validado en runtime.
  - `modelId` (`auto` o vacío hereda).
  - `effortLevel`.
  - `steps` (obligatorio): arreglo de nodos que forma una secuencia implícita.
- Tipos de nodo:
  - `step`: `id`, `agent`, `prompt`, más `artifacts`, `captureOutput`, `completion`, `modelId` y `effortLevel`.
  - `sequence`: `id`, `steps`.
  - `repeat`: `id`, `steps`, `maxIterations`, `onMaxIterations` (abort, continue o pause) y `stopCondition` o `stopWhen`.
  - `parallel`: `id`, `branches`, `joinPolicy` (all, allSettled o any).
  - `watch`: `id`, `handler` (`github-pr` o `command`), `config` e `idleTimeoutSec`.
- Límites: 50 nodos `step`, profundidad 8 e IDs únicos. Los pasos interactivos con `completion` no pueden ir dentro de `parallel`.
- `stopCondition` admite `containsText`, `completionSignal` (success, need_input o error) y `fileCheck {path, jsonPath, value}` sobre un JSON del workspace. Este último es el mecanismo natural para la puerta "Fase 3 bloqueada hasta que la Fase 2 firme".
- Plantillas confirmadas: `{{task}}` (inputs), `{{previous.output}}` y `{{<id>.output}}`. La forma exacta para referenciar artefactos no se pudo leer (el renderizado de la página borró las llaves). Hay que validarla con `validate_workflow` antes de lanzar.
- `agent` debe ser un agente apto para workflows: los incluidos (`wf-planner`, `wf-coder`, `wf-design`, `wf-design-reviewer`, `wf-review-aggregator`, `semantic_reviewer`…) o uno de `.kiro/agents/`. Un subagente built-in no vale.
- Las salidas capturadas se insertan con delimitadores a prueba de manipulación.
- Se habilitan con `kiroAgent.workflows.enabled` (IDE) o `chat.enableWorkflows` (CLI).

### Permisos y powers
- Los permisos de workspace se guardan fuera del repo (`~/.kiro/workspace-roots/<hash>/permissions.yaml`), así que un repo no puede inyectarlos. Los `permissions` de cada agente sí viven en el repo. Siempre gana deny.
- Los powers (plugin.json, steering/skills y mcp.json) se activan por palabras clave. Se instalan desde un catálogo o desde GitHub.

### Cómo cubrir el Context Bus y los eventos del protocolo con Kiro (sin confirmar en uso real)
- Kiro no trae una base vectorial con suscripciones. El equivalente viable es una carpeta de artefactos tipados versionada en git, por ejemplo `.kiro/factory/bus/<feature>/{PRD.json, EdgeCases.yml, Compliance_Requirements.json, …}`, más:
  - Un manifiesto JSON de estado y firmas que lean los `fileCheck`.
  - `resources: file://` para que cada agente "se suscriba" a los artefactos que consume.
  - Opcionalmente `knowledgeBase` (sin confirmar en el IDE).
- Reemplazo de agentes: el estado vive en archivos, no en el chat, así que cualquier agente con el mismo contrato de entrada y salida puede retomar el trabajo.
- `CONTRACT_DISPUTE` → el agente escribe un evento en `bus/<feature>/events/` y señala `send_message` con `warning`. Una rama `repeat` de renegociación (API Contract + DBA + Backend) corre hasta que `fileCheck` vea `contract.status = "agreed"`. `CONTRACT_UPDATED` → un paso posterior del Frontend lee `{{<id>.output}}` y el openapi.yaml actualizado.

---

## Desajustes del protocolo con el stack (a resolver en el diseño)

| Pide el protocolo | En BT | Propuesta |
|---|---|---|
| Migraciones Prisma o Flyway | Drizzle Kit (`pnpm db:generate|db:migrate`) | Drizzle. `schema.dbml` escrito a mano o generado (un generador DBML es librería nueva y requiere discusión). |
| Terraform, Pulumi, K8s, Dockerfiles | SAM + CDK (#15), sin K8s ni ECS | SAM o CDK según #15. Sin K8s. Dockerfile solo para local. |
| Datadog o New Relic | AWS | CloudWatch, X-Ray y Application Signals (skill `aws-observability`). |
| Cypress | Playwright | Playwright + MCP `playwright`. |
| Storybook | No existe en el repo | Requiere discusión. Alternativa: el kit `bt-*` + tests de `packages/ui` + Figma (figma-sync). |
| SonarQube | ESLint (`apps/web/eslint.config.js`) + tsc | ESLint con regla `complexity`, más el Peer Reviewer. |
| Trivy o Snyk | Nada configurado | `pnpm audit` y búsqueda de secretos (hook v1 tipo `check-secrets`). Trivy o gitleaks requieren discusión. |
| GDPR, CCPA, SOC 2, ISO 27701 | Ley 1581, Ley 1480, Ley 2300, DIAN; PCI DSS por OnePay | La ley colombiana es la obligatoria; los marcos internacionales son referencia. |
| WCAG 2.2 AA | El steering 06 dice WCAG 2.1 AA | Decidir si se sube a 2.2 (2.2 incluye 2.1). |
| OpenAPI 3.1 estricto | Zod en `packages/contracts`, sin OpenAPI en el repo | Generar OpenAPI desde Zod (zod-openapi o @hono/zod-openapi requiere discusión) o escribir `openapi.yaml` como contrato fuente y validarlo contra Zod. |
| Feature flags y canary/blue-green | Lambda | Lambda alias + `DeploymentPreference` de SAM (CodeDeploy canary/linear); flags con AWS AppConfig. |

Otras inconsistencias internas detectadas que afectan al agente de UI:
- `steering/14-ui-ux-skill.md` describe Vite, TanStack Router, Shadcn y Fraunces/Instrument Sans, pero los steering 02 y 18 y figma-sync usan Astro con Sora/Inter.
- `.github/workflows/ci.yml` hace referencia a `packages/api`, que no existe (#13).

---

## TABLA FINAL: rol → fuente elegida → qué se adapta

| # | Rol | Fuente elegida | Qué se adapta |
|---|---|---|---|
| 1 | Product Manager | VoltAgent `08-business-product/product-manager.md` (MIT) + BMAD `bmad-agent-pm`/`bmad-prd` (MIT, sin la marca) + AI-DLC `aidlc-product-agent` (MIT-0) | Esquema `PRD.json` nuevo (historias INVEST, criterios Given/When/Then, trazabilidad a `docs/01-Specs/` y códigos RF). Lee steering 01, 05 y 17. |
| 2 | Business Analyst (casos borde) | VoltAgent `business-analyst.md` (MIT) + crear desde cero | `EdgeCases.yml` (estados, transiciones y errores) anclado a las máquinas de estado de BT: booking, Split Fare `HOLD_GROUP`, cancelación escalonada y webhook idempotente. |
| 3 | Compliance & Privacy Officer | AI-DLC `aidlc-compliance-agent` (MIT-0) + VoltAgent `gdpr-ccpa-compliance` (MIT) + agency `engineering-privacy-engineer` (MIT) | `Compliance_Requirements.json` con Ley 1581 y Decreto 1377 primero, más Ley 1480, Ley 2300, DIAN y PCI DSS; GDPR/CCPA/ISO 27701 como referencia. Usa steering 07, ADR-006 y `Politica-Datos-Personales.md`. |
| 4 | Solutions Architect | ECC `architect` (MIT) + wshobson `c4-architecture/*` (MIT) + AI-DLC `aidlc-architect-agent` | C4 en Mermaid, ADR con la plantilla de BT (sin crear ADR-012, regla 02), Well-Architected serverless lens y skills globales `aws-serverless`/`aws-cdk`. Respeta los pendientes #1, #2 y #15. |
| 5 | FinOps & Cloud Cost | agency `engineering-finops-engineer` (MIT) + MCP `power-cloud-architect-awspricing` + skill `aws-billing-and-cost-management` | `Cost_Estimate.json` nuevo (servicio, unidad, volumen, costo mensual y supuestos), comparación DynamoDB vs RDS, us-east-1. |
| 6 | API Contract Manager | ECC skill `api-design` (MIT) + VoltAgent `api-designer` (MIT) | `openapi.yaml` 3.1 alineado con Zod (`packages/contracts`), `/api/v1/`, `{data,error,meta}`, cursor y QUERY. Es el dueño de CONTRACT_UPDATED. |
| 7 | DBA / Data Modeler | ECC `database-reviewer` + skills `postgres-patterns`/`database-migrations` (MIT) + wshobson `database-architect` (MIT) | `schema.dbml` + migración Drizzle, 3NF, índices, snake_case, UUID v4, `status` en vez de soft delete, `created_by` en tablas financieras, `SELECT FOR UPDATE` en cupos. Actualiza `Modelo-Datos-Core.md`. |
| 8 | Security Architect | wshobson `threat-modeling-expert` (MIT) + agency `security-architect` (MIT) + AI-DLC `aidlc-devsecops-agent` (MIT-0); esquema de referencia de OWASP Threat Dragon | `ThreatModel.json` STRIDE por flujo y frontera de confianza: RBAC de 10 roles, tenant `operator_id`, webhook OnePay, PII cifrada (KMS). Mapeo a OWASP Top 10 y NIST CSF. |
| 9 | UI/UX & a11y Designer | wshobson `ui-design/accessibility-expert` + `design-system-architect` (MIT) + agency `design-ux-architect`/`testing-accessibility-auditor` (MIT) | `DesignTokens.json` derivado de `DESIGN.md`, Tailwind 4 y variables de Figma (sin inventar). `a11y_rules.json` con WCAG 2.2 AA. Usa steering 12, 15 y 18 y delega en `figma-sync`. Antes hay que corregir el steering 14. |
| 10 | Backend Developer | ECC `tdd-guide` + skill `backend-patterns` (MIT, reescritura) + VoltAgent `backend-developer`/`typescript-pro` (MIT) | Hono con sub-routers, validación Zod, middleware RBAC, `onError`, Drizzle, vitest con cobertura de 80% o más, lógica financiera en `packages/domain`. Puede emitir CONTRACT_DISPUTE. |
| 11 | Frontend Developer | ECC `react-reviewer` + skill `frontend-patterns` (MIT) + VoltAgent `frontend-developer` (MIT) | Astro + React 19 islands, Nanostores, TanStack Query, kit `bt-*` (steering 18), `t('ns:key')`, SafeHtml, mocks desde `openapi.yaml`. Storybook queda pendiente de decisión. |
| 12 | Technical Writer | ECC `doc-updater` (MIT) + VoltAgent `technical-writer`/`documentation-engineer` (MIT) + agency `engineering-technical-writer` | Diátaxis sobre el vault Obsidian `docs/` (wikilinks, mapa del steering 00) y Swagger por endpoint. Coordina con los hooks `bt-docs-*`. |
| 13 | Peer Reviewer | ECC `code-reviewer` + `react-reviewer` (MIT) + `semantic_reviewer` built-in de Kiro | Reporte estructurado con archivo y línea, ESLint, tsc, `complexity`, funciones de 50 líneas o menos, anidación de 3 niveles o menos, sin `any` ni `console.log`. |
| 14 | Security Auditor (SAST/DAST) | ECC `security-reviewer` + skill `security-review` + steering `typescript-security` (MIT) + hook `check-secrets` de aws-samples (MIT-0) | `pnpm audit`, secretos, inyección, PII en logs, verificación contra `ThreatModel.json`. Escáneres externos sujetos a discusión. |
| 15 | QA Automation (E2E) | ECC `e2e-runner` + skill `e2e-testing` (MIT, sin agent-browser) | Playwright (`apps/web`) + MCP `playwright`; un test por fila de `EdgeCases.yml`; reporte en el bus. |
| 16 | DevOps / SRE | VoltAgent `devops-engineer`/`sre-engineer` (MIT) + agency `engineering-sre` (MIT) + skills globales `aws-serverless`, `aws-deployment`, `aws-cloudformation`, `aws-cdk`, `aws-observability` | SAM o CDK (#15), corrección de `ci.yml` (#13), cero ClickOps, perfiles SSO (steering 10), alarmas de CloudWatch. Sin K8s ni Docker en producción. |
| 17 | Release Manager | Crear desde cero (referencia: wshobson `deployment-strategies/deployment-engineer`, MIT) | Canary/linear con alias de Lambda + `DeploymentPreference`, flags con AppConfig, telemetría inicial en CloudWatch, plan de rollback y release notes. Producción siempre con confirmación humana. |
| + | Factory Conductor / Context Bus steward | Crear desde cero (inspirado en AI-DLC, `artifact-locations.md` de aws-samples, ECC `loop-operator` y workflows de Kiro) | Manifiesto de estado y firmas, puertas `fileCheck` entre fases, convocatoria de renegociación, registro de eventos. Tools con el tag `subagent`. |
| + | Contract Arbiter (CONTRACT_DISPUTE) | Crear desde cero (idea de BMAD `bmad-correct-course`) | Sub-flujo `repeat` con API Contract + DBA + Backend hasta `contract.status = agreed`; dispara CONTRACT_UPDATED. Puede vivir dentro del Conductor. |
| + | Domain & Financial Rules Engineer | Crear desde cero (específico de BT) | Comisiones, IVA, cancelación, Split Fare y payouts en `packages/domain`, con tests obligatorios (reglas 05 y 06; ADR-007, 009 y 010). Se apoya en el hook `financial-logic-guard`. |
| + | Integrations Engineer (OnePay, Siigo, SES) | VoltAgent `payment-integration`/`webhook-engineer` (MIT) + agency `engineering-payments-billing-engineer` (MIT) | Webhook como única fuente de verdad, idempotencia por `webhook_event_id`, reintentos con SQS. Se apoya en el hook `external-service-guard`. |
| + | Build & CI Fixer | ECC `build-error-resolver` + `react-build-resolver` (MIT, fusionados) | Errores de turbo, tsc, Astro y Bun build; comandos del steering 16. |
| + | i18n & Content | agency `engineering-i18n-engineer` (MIT) | Namespaces de i18next, sin textos sueltos, tono de marca (steering 12). |
| + | Design ↔ Figma Sync | Ya existe: `.kiro/agents/figma-sync.json` | Agregarle `resources` y conectarlo como suscriptor de `DesignTokens.json`. |
| + | Factory Steward (memoria y lecciones) | ECC `harness-optimizer` + hook `extract-patterns` (MIT) | Lecciones y deuda en el bus; propone cambios de steering sin aplicarlos solo. |

Fuera de alcance por ahora (steering 17): móvil Expo (F3) y Borondo Coins (en pausa).
