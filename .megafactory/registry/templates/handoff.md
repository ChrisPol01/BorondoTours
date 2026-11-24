---
role: <role>
agent: <agent>
feature: <feature>
updatedAt: <iso>
lastEventId: <evt_...>
---

<!-- Plantilla de handoff/<rol>.md. Copia este archivo a .megafactory/bus/<ítem>/handoff/<rol>.md, rellena las
secciones y ejecuta: node .megafactory/bin/factory.mjs handoff --feature <ítem> --role <rol> --agent <agente>
- Las cinco secciones "## …" de abajo son obligatorias, con este texto exacto, y todo su contenido va en viñetas
  ("- "). Tope: kit.base.json#tokenBudgets.handoffMaxTokens (300 tokens sin contar el front-matter ni este
  comentario). Si falta una sección, una sección no tiene viñetas o se pasa del tope: E_SCHEMA.
- El formato de siete secciones (## Estado, ## Hecho, ## Decisiones y supuestos, ## Bloqueos, ## Siguiente paso,
  ## Artefactos tocados) se acepta por una versión con el aviso W_HANDOFF_LEGACY; no lo uses en handoffs nuevos.
- updatedAt y lastEventId los escribe el CLI con los datos del evento AGENT_HANDOFF: déjalos como <iso> y
  <evt_...>. Un valor inventado (una fecha fuera de la vida del ítem o un id que no está en el bus) es E_SCHEMA.
- Sin PII ni secretos: usa marcadores como <email> o <documento>.
- ## Lecciones y ## Propuestas son opcionales (una viñeta por lección); el conductor las cosecha. -->

## Contexto

- Qué recibiste (artefacto@versión) y qué punteros JSON leíste (por ejemplo prd /stories/2).

## Logrado

- <tipo>@v<n> publicado: comando ejecutado y código de salida.

## Pendiente

- Qué falta y qué rol debe tomarlo.

## A decidir

- Opciones con su recomendación (o "ninguna").
- [RESERVADO HUMANO] PENDING_HUMAN_COMMAND=<comando exacto>, solo si hace falta una acción humana.

## Dependencias técnicas

- Lo que necesita el siguiente rol: contrato, migración, variable de entorno, token de diseño o cofirma.
