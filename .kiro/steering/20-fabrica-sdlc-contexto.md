# 20. Fábrica SDLC — puntero (leer siempre)

La fábrica v0 que vivía en `.kiro/factory/` se extrajo a la Megafábrica SDLC, repo central
`C:\Users\Administrador\megafabrica-sdlc` (privado: `ChrisPol01/megafabrica-sdlc`). BorondoTours la usa
enlazada con `mf link` (packs `core`, `web-app`, `ops-day2`; herramientas `agents-md`, `kiro`).

- Ya no existen `.kiro/factory/`, el steering 19 ni los scripts `pnpm factory*`. No los busques.
- Contexto del proyecto en `.megafactory/` (perfil, bus, memoria, hallazgos, actividades); la central se lee
  por el enlace `.megafactory/core/`. Contrato común: bloque "Megafábrica SDLC" de `AGENTS.md`; operación:
  steering `factory-context.md` y `factory-agents.md`.
- CLI del proyecto: `node .megafactory/bin/factory.mjs …`. Si una skill `bt-*` cita
  `node .kiro/factory/scripts/factory.mjs`, usa el CLI nuevo con los mismos argumentos.
- Las skills `bt-*` siguen siendo el conocimiento del stack. `figma-sync` y `oss-scout` son agentes propios.
- Comandos humanos: `node .megafactory/bin/mf.mjs status|link|doctor`. Antes de borrar `.megafactory/`,
  `mf unlink` (el enlace apunta a la central).
- Las decisiones #1, #2 y #15 no se resuelven dentro de la fábrica. Las propuestas #16-#32 se trasladaron
  a `DECISIONS.md` de la central.
