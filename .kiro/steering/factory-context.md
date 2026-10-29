---
inclusion: always
---
# Megafábrica SDLC 1.0.0

Packs: core, web-app, ops-day2. El contrato común está en el bloque Megafábrica SDLC de AGENTS.md; si no está en tu contexto, léelo.
- Solo node .megafactory/bin/factory.mjs escribe control (manifest, eventos, firmas, inbox, memoria, hallazgos, actividades, estado).
- Sin PII ni secretos en el bus, la memoria ni los logs.
- Producción, publicar, borrar, gastos, credenciales y firmas legales solo los confirma el humano: deja PENDING_HUMAN_COMMAND= con el comando exacto.

Agentes, recetas, comandos humanos y puertas: factory-agents.md.
