# Registro de método: five-whys

Plantilla del tipo `method-record` (§22.8). El slug empieza por el id del método (`five-whys-<tema>`). Los encabezados `##` son los `requiredHeadings` del método; el bloque `json mf-method` lleva el resultado estructurado, con `trigger` igual al `eventId` del disparador que lo pidió (o `null` si nadie lo pidió).

## Problema

Describe el efecto observado con hechos verificables: qué falló, dónde y desde cuándo.

## Porqués

1. ¿Por qué ocurrió? Primera causa directa.
2. ¿Por qué ocurrió esa causa? Segunda capa.
3. ¿Por qué ocurrió esa? Tercera capa, hasta llegar a algo que el equipo puede cambiar.

## Causa raíz

La causa sobre la que se actúa, en una frase.

## Contramedidas

Qué se cambia para que no se repita; cada contramedida con dueño y fecha va en `actions`.

## Lecciones

Lo que otro rol debería saber antes de su siguiente tarea; cada lección va en `lessons` y el CLI la escribe en la memoria al publicar.

```json mf-method
{
  "method": "five-whys",
  "trigger": null,
  "actors": ["backend", "qa-e2e"],
  "data": { "whys": ["Primera causa", "Segunda causa", "Tercera causa"], "rootCause": "Causa raíz en una frase" },
  "lessons": [
    { "kind": "lesson", "scope": "role", "title": "Validar el contrato antes de construir", "body": "Comparar el contrato firmado con la implementación antes de publicar el informe de build evita retrabajo." }
  ],
  "actions": []
}
```
