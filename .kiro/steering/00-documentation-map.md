---
inclusion: always
---
# Mapa de documentación

Toda la documentación vive en `docs/` (vault Obsidian, config en `docs/.obsidian`). Wikilinks relativos.

| Carpeta | Contenido |
|---|---|
| `docs/00-Inicio/` | Visión, stack, inventario MVP, resúmenes APP1-4, `Contexto-Para-IA.md` |
| `docs/01-Specs/` | Spec-A..L (códigos RF) |
| `docs/02-ADRs/` | Decisiones (`ADR-Index.md`) |
| `docs/03-Knowledge/` | Modelo de datos, comisiones, trazabilidad, datos personales, contable |
| `docs/04-Tech-Design/` | Arquitectura, frontend, DESIGN, servicios |
| `docs/05-Dev-Log/` | Bitácora y handoffs |
| `docs/06-Operaciones/` | AWS SSO, inventario AWS, runbook Figma |
| `docs/DECISIONES-PENDIENTES.md` | Contradicciones abiertas |
| `docs/04-Tech-Design/Mapa-Repositorio.md` | Árbol real, comandos, ownership, integraciones |
| `.kiro/specs/` | Specs de features B2C y planificación operativa |
| `.kiro/hooks/` | Hooks de agente (calidad, PII, RBAC, a11y) |
| `.kiro/factory/` | Fábrica SDLC multi-agente: Context Bus, registro de agentes sdlc-*, esquemas y CLI; recetas en .kiro/workflows/ (steering 19) |
| `.claude/` | Plantillas claude-flow; no son fuente de verdad |
| `otros/design/` | Diseño, marca y herramientas Figma; fuera del producto |

Fuentes de verdad: datos = `03-Knowledge/Modelo-Datos-Core.md`; infra/stack = ADR-011 (salvo pendientes); roles = `00-Inicio/Stack-Tecnologico.md` §RBAC; funcional = `01-Specs/`.

Regla: antes de implementar, lee el Spec/doc relevante bajo demanda; no asumas ni cargues docs completos. Si hay conflicto, consulta `docs/DECISIONES-PENDIENTES.md` y pregunta al usuario.
Comandos de build/test/lint: steering 16. Qué existe en código vs sólo en docs: steering 17. Mapa del repo: Mapa-Repositorio.

> ⚠️ **Ruta canónica de documentación: `docs/`** (relativa a la raíz del repo). NO existe ni debe crearse `.obsidian/docs/`: `.obsidian/` es solo configuración de Obsidian, no contenido. Al crear o editar documentos (incluida la doc contable en `docs/03-Knowledge/`), escribe siempre bajo `docs/`. Un error histórico asumió `.obsidian/docs/` como destino; no repetirlo.
