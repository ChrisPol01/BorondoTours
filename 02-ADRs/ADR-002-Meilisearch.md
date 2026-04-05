---
tags: [adr, busqueda, meilisearch, elasticsearch, postgresql]
id: ADR-002
titulo: Motor de búsqueda — Meilisearch vs Elasticsearch vs PostgreSQL ILIKE
estado: Aceptado
fecha: 2025-07-14
autores: [BorondoTours CTO]
---

# ADR-002 — Motor de búsqueda: Meilisearch vs Elasticsearch

## Estado
`Aceptado`

## Contexto

BorondoTours necesita un motor de búsqueda de tours que soporte:
- **Tolerancia a errores de tipeo** (ej: "cofetero" → Eje Cafetero)
- **Búsqueda instantánea** (< 50ms de respuesta para demo de inversionista)
- **Filtros combinados** (destino, duración, precio, dificultad)
- **Relevancia contextual** (tours más populares primero)
- **Faceting** para conteos de filtros ("12 tours en Eje Cafetero")

En Fase 1 (MVP) el catálogo es pequeño (< 100 tours) y el tiempo de implementación es crítico. En Fase 2+, el catálogo puede crecer a miles de tours con operadores externos onboardeados.

---

## Opciones evaluadas

### Opción A: PostgreSQL ILIKE (seleccionado para Fase 1)
```sql
WHERE nombre ILIKE '%:q%' OR destino ILIKE '%:q%' OR tags @> ARRAY[:q]
```
**Pros:**
- Cero infraestructura adicional (ya está en el stack)
- Implementación en 1 hora
- Suficiente para < 100 tours con demo de inversionista

**Contras:**
- Sin typo-tolerance
- Sin relevancia (resultados en orden de inserción por defecto)
- Performance degrada linealmente con el volumen
- Sin faceting nativo

### Opción B: Meilisearch (seleccionado para Fase 2)
**Pros:**
- Typo-tolerance nativa y configurable (1 typo para palabras 4–7 chars, 2 para 8+)
- Búsqueda instantánea < 50ms garantizado hasta 1M documentos
- Filtros y faceting con sintaxis simple
- Open source, self-hosted como Docker container
- SDKs oficiales para TypeScript y NestJS
- Configuración de sinónimos (ej: "cafetero" = "Eje Cafetero")
- Typos en español funcionan bien sin configuración extra

**Contras:**
- Requiere un container adicional y sincronización BD → índice
- Complejidad operativa (Fase 2 tiene ECS Fargate, aceptable)

### Opción C: Elasticsearch / OpenSearch
**Pros:**
- Estándar de la industria, muy maduro

**Contras:**
- Overhead operativo alto (cluster mínimo recomendado, JVM)
- Curva de aprendizaje alta para 1 CTO en Fase 1
- Costo de infraestructura 5–10x mayor que Meilisearch
- Over-engineered para el volumen de BorondoTours en cualquier fase cercana
- Descartado

---

## Decisión

> **PostgreSQL ILIKE en Fase 1. Migración a Meilisearch en Fase 2, sin cambiar los contratos de API del frontend.**

### Plan de migración transparente:

```
Fase 1:
  GET /api/v1/tours?q=cofetero
  → TourService → PostgreSQL ILIKE query

Fase 2 (sin cambio en el contrato del endpoint):
  GET /api/v1/tours?q=cofetero
  → TourService → MeilisearchService.search()
  → Resultados con typo-tolerance + ranking por bookings_count
```

### Índice Meilisearch (Fase 2 — configuración anticipada):

```typescript
// Campos indexables
const indexableFields = ['nombre', 'descripcion', 'destino', 'region', 'tags', 'operador_nombre']

// Campos filtrables (no afectan el ranking)
const filterableAttributes = ['destino', 'region', 'duracion_categoria', 'dificultad', 'precio_base', 'iva_exempt_available']

// Campos de ranking (ordenamiento)
const sortableAttributes = ['bookings_count', 'precio_base', 'created_at']

// Sinónimos Colombia-específicos
const synonyms = {
  'cafetero': ['eje cafetero', 'café'],
  'llanos': ['llanos orientales', 'orinoquía'],
  'amazonia': ['amazonas', 'selva'],
}
```

### Sincronización BD → Meilisearch:
- Al crear/actualizar/eliminar un Tour en ERP → BullMQ job `sync-tour-to-meilisearch`
- Reindex completo diario a las 3AM (cron job BullMQ) como fallback
- Campos sincronizados: solo los indexables (no se sincroniza passport_s3_key, operator contracts, etc.)

---

## Consecuencias

### Positivas
- Fase 1 se entrega sin overhead de infraestructura
- La API del frontend no cambia entre Fase 1 y Fase 2 (cambio trasparente)
- Meilisearch es apropiado para el volumen de BorondoTours por varios años
- Self-hosted elimina costos de SaaS de búsqueda

### Negativas / Trade-offs
- Fase 1 tiene búsqueda sin typo-tolerance (usuarios con typos no encuentran resultados)
- La sincronización BD → Meilisearch debe ser robusta (riesgo de inconsistencia)
- En Fase 2, un fallo de Meilisearch requiere fallback a ILIKE (implementar circuit breaker)

### Acciones derivadas
- [ ] (Fase 1) Implementar ILIKE con debounce en frontend y URL persistence
- [ ] (Fase 2) Agregar container Meilisearch al docker-compose y luego a ECS
- [ ] (Fase 2) Implementar BullMQ job `sync-tour-to-meilisearch`
- [ ] (Fase 2) Configurar sinónimos Colombia-específicos en el índice
- [ ] (Fase 2) Implementar circuit breaker: si Meilisearch no responde en 200ms → fallback a ILIKE

---

## Links relacionados
- [[ADR-Index]]
- [[../01-Specs/Spec-A-Discovery]]
- [[../00-Inicio/Stack-Tecnologico]]
