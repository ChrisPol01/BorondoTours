<!-- >>> megafactory (administrado por mf link; no editar dentro del bloque) -->
## Megafábrica SDLC
Este repo usa la Megafábrica SDLC 1.0.0 (packs: core, web-app, ops-day2; carriles: delivery, operate, govern); lo pesado vive en la central.
- Central: .megafactory/core/ (enlace a MF_HOME). Si no existe, resuelve MF_HOME en este orden: variable MF_HOME, .megafactory/local.json, .megafactory/profile.json#factory.home, ../megafabrica-sdlc, ~/megafabrica-sdlc. Sin central: node .megafactory/bin/mf.mjs link (regla 4).
- Qué leer, solo cuando lo necesites: protocolo core/engine/PROTOCOL.md; tu rol core/library/roles/<rol>/prompt.md y card.md; skills core/library/skills/INDEX.md; métodos core/library/methods/INDEX.md; manual core/manual/00-indice.md; registro .megafactory/registry/.
- Dónde escribir: artefactos en .megafactory/bus/<ítem>/; borradores de memoria en bus/<ítem>/memory-drafts/; fuentes convertidas en bus/<ítem>/sources/ (cuarentena local).
- Reglas: (1) solo node .megafactory/bin/factory.mjs escribe control (bus, memoria, hallazgos, actividades y estado); (2) nunca escribas en .megafactory/core/, registry/, *.lock.json ni link.manifest.json; (3) sin PII ni secretos en el bus, la memoria ni los logs; (4) solo el humano confirma (PENDING_HUMAN_COMMAND= con el comando exacto): por riesgo, nunca delegable, producción, publicar, borrar, gastos, credenciales, firmas legales, approve y waive; por costumbre mf link, status y doctor, salvo delegación en registry/project.json#autonomy; (5) un comando por invocación, sin encadenar; (6) las decisiones de registry/project.json#openDecisions no se resuelven aquí.
- Registra cada verificación (tests, lint, typecheck): node .megafactory/bin/factory.mjs observe --cmd "<comando>" --exit <n>.
- Agentes sdlc-<rol> (registry/agents.json); recetas factory-<receta> (Kiro) o el modo chat-run del conductor.
- Sin Node: solo lectura y artefactos en el bus; el comando de control queda para el humano.
- Si una skill cita node .kiro/factory/scripts/factory.mjs, usa node .megafactory/bin/factory.mjs (mismos argumentos).
<!-- <<< megafactory -->
