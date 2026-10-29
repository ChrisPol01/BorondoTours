---
tipo: tech-design
ultima_revision: 2026-10-28
---
# Fábrica de agentes SDLC

> Documentación en estilo [Diátaxis](https://diataxis.fr): explicación, referencia y cómo-hacer. Desde el 2026-10-28 la fábrica vive en su propio repo, la Megafábrica SDLC (`C:\Users\Administrador\megafabrica-sdlc`, privado `ChrisPol01/megafabrica-sdlc`), y BorondoTours la usa enlazada con `mf link`. La fuente de verdad del diseño y el manual están en la central (`manual/00-indice.md`, `.agents/tasks/megafabrica-v1/design.md`); la historia de la v0 sigue en `.agents/tasks/sdlc-factory-2026-10-12/`. Ver también el steering 20 y [[Mapa-Repositorio]] §7.

## Explicación (qué es y por qué)

La fábrica es una infraestructura de agentes que lleva una *feature* de requisito a release por fases, con artefactos tipados y puertas verificables. No reemplaza a los specs ni al código del producto: lo orquesta. La idea central es un **Context Bus**: una carpeta de artefactos versionados (`.megafactory/bus/<ítem>/`) con un manifiesto de estado y una cadena de eventos encadenada por hash, de modo que el estado vive en archivos y no en el chat. Así cualquier agente con el mismo contrato de entrada y salida puede retomar el trabajo de otro.

Por qué puertas: cada fase solo avanza cuando su puerta pasa, y las puertas son acumulativas (vuelven a verificar las anteriores). La Fase 3 (build) no arranca si la puerta de contracts no está firmada por sus cofirmantes. Esto hace cumplir, con un control real y no solo documental, reglas críticas de BorondoTours: contratos congelados antes de implementar, producción solo humana (steering 10) y sin PII ni secretos en el bus (Ley 1581/2012).

## Referencia (piezas)

| Pieza | Dónde | Qué |
|---|---|---|
| Central (motor, prompts, skills genéricas, recetas, métodos, catálogos, manual) | `.megafactory/core/` (enlace a la central) | Solo lectura; se actualiza con `git pull` en la central y `mf link --update` |
| Contexto del proyecto | `.megafactory/` | `profile.json`, `bus/`, `memory/`, `findings/`, `activities/`, `registry/` renderizado, lanzadores `bin/` |
| CLI del proyecto | `node .megafactory/bin/factory.mjs` | Único escritor del control del bus |
| Agentes | `.kiro/agents/sdlc-*.json` | 39 agentes de los packs `core`, `web-app` y `ops-day2` (CTO, conductor, líderes de área y ejecutores) |
| Recetas | `.kiro/workflows/factory-*.workflow.json` | Fases, `feature-e2e`, `contract-dispute`, cambio, incidente, postmortem y vulnerabilidad |
| Skills del proyecto | `.kiro/skills/bt-*/SKILL.md` | Conocimiento del stack, cargadas como overlays por rol (perfil `skills.overlays`) |
| Hooks | `.kiro/hooks/factory-*.json` | Deshabilitados |
| Steering | `.kiro/steering/factory-context.md`, `factory-agents.md` y el bloque de `AGENTS.md` | Contrato común y operación |

## Cómo-hacer (operar la fábrica)

1. **Estado del enlace**: `node .megafactory/bin/mf.mjs status --verify`.
2. **Lanzar una receta** desde el panel Workflows con un `task` por líneas: `feature-id: <id>`, `title:`, `spec:`, y el requerimiento en lenguaje natural; o hablar con `sdlc-cto` o `sdlc-conductor`.
3. **Seguir el estado**: `node .megafactory/bin/factory.mjs status --feature <id> --json`.
4. **Comandos humanos** (solo en tu terminal): `approve --by human:<nombre>`, `waive`, `feature --status`, `dispute resolve --by human:`, `verify --rechain`, `run start --takeover`. Los agentes los proponen en `PENDING_HUMAN_COMMAND`; no los ejecutan.
5. **Actualizar la fábrica**: `git -C <central> pull` y `node .megafactory/bin/mf.mjs link --update`.
6. **Antes de borrar `.megafactory/`**: `node .megafactory/bin/mf.mjs unlink` (el enlace apunta a la central).

## Estado y pendientes

Migrada de la v0 el 2026-10-28 con `mf migrate --from v0` (el ítem `b2c-funcional-con-datos-simulados-y` pasó a `.megafactory/bus/` y su cadena de eventos verifica). Las propuestas #16-#32 se trasladaron a `DECISIONS.md` de la central (ver [[../DECISIONES-PENDIENTES|DECISIONES-PENDIENTES]]). Atribuciones de terceros en `THIRD_PARTY.md` de la central.
