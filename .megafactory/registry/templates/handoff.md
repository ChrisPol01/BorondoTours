---
role: <role>
agent: <agent>
feature: <feature>
updatedAt: <iso>
lastEventId: <evt_...>
---

<!-- Plantilla de handoff/<rol>.md. Copia este archivo a .megafactory/bus/<ítem>/handoff/<rol>.md, rellena las
secciones y ejecuta: node .megafactory/bin/factory.mjs handoff --feature <ítem> --role <rol> --agent <agente>
- Los siete encabezados "## …" de abajo son obligatorios, con este texto exacto (si falta uno: E_SCHEMA).
- updatedAt y lastEventId los escribe el CLI con los datos del evento AGENT_HANDOFF: déjalos como <iso> y
  <evt_...>. Un valor inventado (una fecha fuera de la vida del ítem o un id que no está en el bus) es E_SCHEMA.
- Sin PII ni secretos: usa marcadores como <email> o <documento>.
- ## Lecciones y ## Propuestas son opcionales (una viñeta por lección); el conductor las cosecha. -->

## Estado

Resumen breve del estado del trabajo del rol (una o dos líneas).

## Hecho

- Lo que se completó en esta sesión, con los artefactos y versiones publicados (<tipo>@v<n>).

## Pendiente

- Lo que falta por hacer.

## Decisiones y supuestos

- Decisiones tomadas y supuestos asumidos; cita los ids de memoria aplicados (mem_…).

## Bloqueos

- Bloqueos encontrados, o "ninguno".

## Siguiente paso

- La acción concreta que debe seguir y quién la hace.

## Artefactos tocados

- <tipo>@v<n>, firmas emitidas y archivos del bus escritos.
