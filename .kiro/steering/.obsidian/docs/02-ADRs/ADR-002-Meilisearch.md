---
tags: [adr, busqueda, postgresql, pg_trgm, opensearch]
id: ADR-002
titulo: Motor de busqueda — PostgreSQL pg_trgm (Fase 1-2) y OpenSearch Serverless (Fase 3+)
estado: Aceptado
fecha: 2026-06-09
updated: 2026-07-10
autores: [BorondoTours CTO]
supersede: ADR-002 (2025-07-14) — version anterior seleccionaba Meilisearch para Fase 2
---

# ADR-002 — Motor de busqueda: PostgreSQL pg_trgm y OpenSearch Serverless

## Estado
`Aceptado` — Refinado por [[ADR-011-Arquitectura-Consolidada]] (2026-07-10).

> **⚠️ ACTUALIZACIÓN 2026-07-10 (ADR-011):** La typo-tolerance se cubre en **Fase 1 Y Fase 2** con la extensión **`pg_trgm` de PostgreSQL** (búsqueda por similitud/trigramas + `tsvector` para relevancia en español), sin infraestructura adicional. **OpenSearch Serverless se difiere a Fase 3+** y solo si el volumen lo exige (su piso de costo por OCU no se justifica antes). Donde el texto abajo diga "OpenSearch en Fase 2", léase "`pg_trgm` en Fase 1-2, OpenSearch en Fase 3+". La sincronización a OpenSearch, cuando aplique, se hará vía EventBridge/SQS (no BullMQ).

## Contexto

BorondoTours necesita un motor de busqueda de tours que soporte:
- Tolerancia a errores de tipeo (ej: "cofetero" -> Eje Cafetero)
- Busqueda instantanea menor a 50ms de respuesta
- Filtros combinados (destino, duracion, precio, dificultad)
- Relevancia contextual (tours mas populares primero)
- Faceting para conteos de filtros ("12 tours en Eje Cafetero")

La arquitectura paso a ser AWS-first desde Fase 1 (ver ADR-005). Esto cambia la decision
de Fase 2: Meilisearch self-hosted requiere un container adicional en ECS con gestion operativa,
mientras que OpenSearch Serverless es managed por AWS sin instancias que gestionar.

---

## Opciones evaluadas

### Opcion A: PostgreSQL ILIKE (seleccionado para Fase 1)

Pros:
- Cero infraestructura adicional (ya esta en el stack)
- Implementacion en 1 hora
- Suficiente para menos de 100 tours con la demo de inversionista

Contras:
- Sin typo-tolerance
- Sin relevancia (resultados en orden de insercion por defecto)
- Performance degrada linealmente con el volumen
- Sin faceting nativo

### Opcion B: Meilisearch self-hosted (descartada)

Pros:
- Typo-tolerance nativa y configurable
- Busqueda instantanea garantizada
- Open source

Contras:
- Container adicional en ECS con gestion operativa (patching, volumen persistente)
- Vendor externo sin integracion nativa con IAM, CloudWatch ni VPC
- Con arquitectura AWS-first agrega complejidad operativa sin beneficio adicional
- Sincronizacion BD -> indice puede generar inconsistencias

### Opcion C: OpenSearch Serverless (seleccionado para Fase 2)

Pros:
- Managed por AWS: sin instancias, sin patching, sin escalado manual
- Integrado nativamente con IAM (control de acceso por rol AWS)
- Logs automaticos hacia CloudWatch
- Dentro del VPC, sin egress publico adicional
- Full-text search con typo-tolerance y faceting
- Facturacion por OCU (OpenSearch Compute Units) segun uso real, sin instancias minimas fijas

Contras:
- Costo variable segun OCU consumidas (monitorear con CloudWatch Alarm)
- API diferente a Meilisearch (cliente opensearch-js en lugar de meilisearch-js)

### Opcion D: Elasticsearch / OpenSearch clasico con instancias

Descartado: overhead operativo alto, cluster minimo recomendado, costo 5-10x mayor
que OpenSearch Serverless, over-engineered para el volumen de BorondoTours.

---

## Decision

> PostgreSQL ILIKE en Fase 1.
> Migracion a OpenSearch Serverless en Fase 2, sin cambiar los contratos de API del frontend.

### Migracion transparente para el frontend

```
Fase 1:
  GET /api/v1/tours?q=cofetero
  -> TourService -> PostgreSQL ILIKE query

Fase 2 (sin cambio en el contrato del endpoint):
  GET /api/v1/tours?q=cofetero
  -> TourService -> OpenSearchService.search()
  -> Resultados con typo-tolerance + ranking por bookings_count
```

### Configuracion del indice OpenSearch Serverless (Fase 2)

Campos indexables: nombre, descripcion, destino, region, tags, operador_nombre

Campos filtrables (sin impacto en ranking):
destino, region, duracion_categoria, dificultad, precio_base, iva_exempt_available

Campos de ordenamiento: bookings_count, precio_base, created_at, yield_score

Sinonimos Colombia-especificos:
- cafetero -> eje cafetero, cafe
- llanos -> llanos orientales, orinoquia
- amazonia -> amazonas, selva
- paisa -> antioquia, medellin
- caribe -> costa atlantica, santa marta, cartagena

### Sincronizacion RDS -> OpenSearch

- Al crear/actualizar/eliminar un Tour en ERP: BullMQ job sync-tour-to-opensearch
- Reindex completo diario a las 3AM (cron BullMQ) como fallback de consistencia
- Solo se sincronizan campos indexables (no campos sensibles del operador ni contratos)

### Circuit breaker

Si OpenSearch no responde en 300ms -> fallback automatico a PostgreSQL ILIKE.
Garantiza que la busqueda nunca deja de funcionar aunque OpenSearch este degradado.

---

## Consecuencias

### Positivas
- Fase 1 se entrega sin overhead de infraestructura de busqueda
- La API del frontend no cambia entre Fase 1 y Fase 2 (cambio transparente)
- OpenSearch Serverless es apropiado para el volumen de BorondoTours por varios anos
- Sin gestion de instancias ni patching
- IAM nativo + CloudWatch + mismo VPC que el resto de la infraestructura AWS

### Negativas / Trade-offs
- Fase 1 tiene busqueda sin typo-tolerance (typos no encuentran resultados)
- La sincronizacion RDS -> OpenSearch debe ser robusta para evitar inconsistencias de indice
- Costo variable de OCU: monitorear con CloudWatch Alarms para detectar picos

### Acciones derivadas
- [ ] (Fase 1) Implementar ILIKE con debounce en frontend y URL persistence
- [ ] (Fase 2) Crear OpenSearch Serverless collection en VPC us-east-1
- [ ] (Fase 2) Configurar IAM policy para que ECS task pueda escribir y leer la collection
- [ ] (Fase 2) Implementar BullMQ job sync-tour-to-opensearch
- [ ] (Fase 2) Configurar sinonimos Colombia-especificos en el indice
- [ ] (Fase 2) Implementar circuit breaker: si OpenSearch no responde en 300ms -> fallback a ILIKE
- [ ] (Fase 2) CloudWatch Alarm para OCU por encima de umbral definido

---

## Links relacionados
- [[ADR-Index]]
- [[../01-Specs/Spec-A-Discovery]]
- [[../00-Inicio/Stack-Tecnologico]]
- [[ADR-005-Infra-MVP]] -- Decision AWS-first que motivo este cambio
