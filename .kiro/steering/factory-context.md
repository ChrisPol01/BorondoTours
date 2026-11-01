---
inclusion: always
---
# Megafábrica SDLC 1.0.0

Packs: core, web-app, ops-day2. Contrato común: bloque Megafábrica SDLC de AGENTS.md (léelo si no está en tu contexto).
- Solo node .megafactory/bin/factory.mjs escribe control (bus, memoria, hallazgos, actividades y estado).
- Sin PII ni secretos en el bus, la memoria ni los logs.
- Solo el humano confirma (deja PENDING_HUMAN_COMMAND=) lo nunca delegable: producción, publicar, borrar, gastos, credenciales, firmas legales, approve y waive; y mf link, status y doctor salvo delegación en registry/project.json#autonomy.

Agentes, recetas, comandos humanos y puertas: factory-agents.md.
