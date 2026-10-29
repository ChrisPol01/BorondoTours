# Postmortem sin culpables: errores en la consulta de vencidos (ejemplo)

## Resumen

Un cambio en la consulta de préstamos vencidos perdió el índice y la base de datos respondió con tiempos de espera durante 75 minutos.

## Impacto

Una parte de los miembros no vio sus préstamos vencidos; no hubo pérdida de datos.

## Línea de tiempo

- 10:00 se dispara la alarma de errores.
- 10:30 la persona de guardia revierte el despliegue y los errores bajan.
- 11:15 se confirma la recuperación contra el objetivo de nivel de servicio.

## Causas contribuyentes

La prueba de rendimiento no cubría la consulta de vencidos y el plan de la base de datos no se revisó en la puerta de calidad.

## Qué funcionó

La alarma avisó en menos de un minuto y la reversión estaba documentada en el runbook.

## Qué no funcionó

El tablero no mostraba la latencia por consulta, así que el diagnóstico tomó 20 minutos.

## Acciones

```json mf-actions
[
  {
    "id": "PM1",
    "title": "Agregar la consulta de vencidos a la prueba de rendimiento",
    "entryType": "change",
    "owner": "platform-engineer",
    "due": "2026-11-20",
    "changeClassHint": "normal"
  },
  {
    "id": "PM2",
    "title": "Panel de latencia por consulta en el tablero del servicio",
    "entryType": "change",
    "owner": "sre",
    "due": "2026-11-27"
  }
]
```
