<!-- >>> megafactory (administrado por mf link; no editar dentro del bloque) -->
## Megafábrica SDLC
Este repo usa la Megafábrica SDLC 1.0.0 (packs: core, web-app, ops-day2; carriles: delivery, operate, govern). Lo pesado vive en la fábrica central; aquí solo hay contexto y resultados.
- Central: .megafactory/core/ (enlace a MF_HOME). Si no existe, resuelve MF_HOME en este orden: variable MF_HOME, .megafactory/local.json, .megafactory/profile.json#factory.home, ../megafabrica-sdlc, ~/megafabrica-sdlc. Sin central: pide al humano node .megafactory/bin/mf.mjs link.
- Qué leer, solo cuando lo necesites: protocolo core/engine/PROTOCOL.md; tu rol core/library/roles/<rol>/prompt.md y card.md; skills core/library/skills/INDEX.md; métodos core/library/methods/INDEX.md; manual core/manual/00-indice.md; registro del proyecto .megafactory/registry/.
- Dónde escribir: artefactos en .megafactory/bus/<ítem>/; borradores de memoria en bus/<ítem>/memory-drafts/; fuentes convertidas en bus/<ítem>/sources/ (cuarentena local, no versionada).
- Reglas: (1) solo node .megafactory/bin/factory.mjs escribe control (manifest, eventos, firmas, inbox, memoria, hallazgos, actividades, estado); (2) nunca escribas en .megafactory/core/, registry/, *.lock.json ni link.manifest.json; (3) sin PII ni secretos en el bus, la memoria ni los logs; (4) producción, publicar, borrar, gastos, credenciales y firmas legales solo los confirma el humano: deja PENDING_HUMAN_COMMAND= con el comando exacto; (5) un comando por invocación, sin encadenar; (6) las decisiones de registry/project.json#openDecisions no se resuelven aquí.
- Tras cada verificación (tests, lint, typecheck) regístrala: node .megafactory/bin/factory.mjs observe --cmd "<comando>" --exit <n>.
- Agentes sdlc-<rol> (registry/agents.json); recetas factory-<receta> (Kiro) o el modo chat-run del conductor.
- Sin Node: modo lectura (lee la central por ruta, produce artefactos en el bus, no escribas control y deja el comando para el humano).
- Si una skill del proyecto menciona node .kiro/factory/scripts/factory.mjs, usa node .megafactory/bin/factory.mjs con los mismos argumentos.
<!-- <<< megafactory -->
