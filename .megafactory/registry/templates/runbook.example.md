# Runbook: latencia alta en la consulta de préstamos (ejemplo)

## Síntoma

La alarma de consumo rápido del presupuesto de error se dispara y el p95 supera 400 ms.

## Diagnóstico

1. Revisar el tablero de latencia por consulta.
2. Comprobar si hubo un despliegue en la última hora.

## Mitigación

Revertir el último despliegue con el comando del plan de release; lo ejecuta la persona de guardia.

## Verificación

El p95 vuelve bajo 400 ms durante 15 minutos y la alarma se apaga.

## Escalamiento

Si no se recupera en 30 minutos, avisar al comandante del incidente y al dueño del servicio.

## Riesgos

Revertir puede descartar una migración de datos ya aplicada: confirmar el plan de vuelta atrás antes.
