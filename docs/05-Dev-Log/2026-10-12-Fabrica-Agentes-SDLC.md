---
tipo: dev-log
fecha: 2026-10-12
---
# Fábrica de agentes SDLC — FEAT-004 (2026-10-12)

> Nota (2026-10-28): la fábrica v0 se extrajo a la Megafábrica SDLC (`C:\Users\Administrador\megafabrica-sdlc`) y BorondoTours la usa con `mf link`; `.kiro/factory/` y los scripts `pnpm factory*` ya no existen. Las rutas de esta entrada son históricas (ver [[../04-Tech-Design/Fabrica-Agentes-SDLC]]).

## Qué se hizo
PR 4 del diseño de la fábrica SDLC (`.agents/tasks/sdlc-factory-2026-10-12/`). Cierra la implementación de código de la fábrica tras FEAT-001 (bus y CLI), FEAT-002 y FEAT-003 (22 agentes y 10 skills).

- **7 recetas de workflow** en `.kiro/workflows/factory-*.workflow.json`: discovery, contracts, build, quality-gates, release, feature-e2e (49 pasos) y contract-dispute. Primer nodo `init`; el revisor (`sdlc-artifact-reviewer`) es el último paso de cada bucle `repeat`; el último nodo de cada receta es el conductor con "Cierra corrida: sí"; `stopCondition.fileCheck` bajo `.kiro/factory/state/`; `joinPolicy: allSettled` en los `parallel`.
- **2 hooks** `factory-*` (v1, `PostFileSave`, `enabled: false`): `factory-contract-advisory.json` (comando `advise`) y `factory-bus-guard.json` (dos entradas: `guard-bus` y `registry check --advisory`). Nacen deshabilitados; se activan tras la validación V3 del orquestador.
- **Steering 19** (`19-fabrica-agentes.md`, inclusion auto, 49 líneas) y ediciones mínimas en el steering 00 (una fila), el steering 17 (fila + pendientes #16-#32 + fecha) y `Mapa-Repositorio.md` §7 (un bullet).
- **Docs**: `docs/04-Tech-Design/Fabrica-Agentes-SDLC.md` (Diátaxis) y las filas #16-#32 al final de `docs/DECISIONES-PENDIENTES.md`.
- **Tests nuevos**: `workflows.test.mjs` y `hooks.test.mjs` en `.kiro/factory/scripts/tests/`, para que `pnpm factory:test` valide las recetas y los hooks.
- **Portabilidad**: `.kiro/factory/profile.json` (perfil de BorondoTours), `.kiro/factory/PORTING.md` y `.kiro/factory/ADAPT-PROMPT.md`.

## Pendiente de validación del orquestador (V1)
El esquema de nodo de workflow de Kiro (`type`, forma de `branches`/`sequence` dentro de `repeat`, y la evaluación de `stopCondition.fileCheck`) no está confirmado en el IDE. Las 7 recetas usan la mejor aproximación de research A3 y lo declaran así en su `description`. Los hooks quedan deshabilitados hasta V3.

## Verificación
`pnpm factory:test`, `node .kiro/factory/scripts/factory.mjs registry check` y `pnpm factory:typecheck` en verde; `JSON.parse` sobre todos los `.json` nuevos sin errores. Detalle en `FEAT-004.json` (findings).
