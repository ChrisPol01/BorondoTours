---
inclusion: auto
name: factory-agents
description: Agentes sdlc-*, recetas factory-*, comandos humanos y puertas de la Megafábrica SDLC en este proyecto. Úsalo al lanzar o continuar una feature, al operar el bus o al resolver una disputa.
---
# Megafábrica SDLC en este proyecto

## Agentes
Un agente por rol activo: sdlc-api-contract, sdlc-architecture-lead, sdlc-artifact-reviewer, sdlc-backend, sdlc-business-analyst, sdlc-compliance-officer, sdlc-conductor, sdlc-content-seo, sdlc-cto, sdlc-data-modeler, sdlc-dba-prod, sdlc-devops-sre, sdlc-domain-rules, sdlc-dpo, sdlc-engineering-lead, sdlc-engineering-manager, sdlc-finops, sdlc-frontend, sdlc-integrations, sdlc-on-call-engineer, sdlc-operations-lead, sdlc-peer-reviewer, sdlc-platform-lead, sdlc-product-lead, sdlc-product-manager, sdlc-qa-e2e, sdlc-quality-lead, sdlc-release-manager, sdlc-resilience-engineer, sdlc-security-architect, sdlc-security-auditor, sdlc-security-lead, sdlc-service-desk-l1, sdlc-service-owner, sdlc-solutions-architect, sdlc-sre, sdlc-support-l2, sdlc-tech-writer, sdlc-uiux-a11y. El conductor recibe la tarea, la delega por el bus (request open --kind delegate) y reporta; cada área tiene su supervisor cuando su agente existe; los bloqueos suben ejecutor → par → supervisor del área → conductor → usuario, y al usuario solo llega lo reservado.

## Recetas
Recetas de Kiro (.kiro/workflows/): bt-factory-adopt-brownfield, bt-factory-audit, bt-factory-build, bt-factory-change, bt-factory-contract-dispute, bt-factory-contracts, bt-factory-discovery, bt-factory-feature-e2e, bt-factory-incident, bt-factory-migration, bt-factory-ops-review, bt-factory-postmortem, bt-factory-quality-gates, bt-factory-release, bt-factory-resilience-drill, bt-factory-vulnerability, bt-factory-vulnerability-close. Task con title:, feature: <id> (opcional) y el requerimiento. Desde el chat o fuera de Kiro, el conductor la corre en chat-run con factory.mjs recipe next.

## Comandos
- Estado del ítem: node .megafactory/bin/factory.mjs status --feature <ítem>.
- Puerta de fase: node .megafactory/bin/factory.mjs gate --feature <ítem> --phase <fase>.
- Verificación del registro: node .megafactory/bin/factory.mjs registry check.
- Registro de una verificación: node .megafactory/bin/factory.mjs observe --cmd "<comando>" --exit <n>.
- Humanos, nunca delegables: approve, waive, request resolve y feedback (--by human:<nombre>) y mf.mjs unlink; por costumbre: mf.mjs link|status|doctor, salvo delegación en registry/project.json#autonomy.

## Dónde está cada cosa
- Protocolo: .megafactory/core/engine/PROTOCOL.md. Índices: .megafactory/core/library/{skills,methods,humans}/INDEX.md.
- Registro del proyecto: .megafactory/registry/ (agentes, recetas, kits, grafo, MCP, métodos, herramientas).
- Vistas regenerables: .megafactory/views/ (kits por área, herramientas, RACI, catálogo MCP).
- Resultados: .megafactory/bus/<ítem>/; memoria por memory add; hallazgos y actividades por el CLI.
