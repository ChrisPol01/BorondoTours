---
name: bt-drizzle-postgres
description: >
  Patrones de persistencia con Drizzle y PostgreSQL 16 para BorondoTours: snake_case, UUID v4,
  status en lugar de soft delete, created_by y operator_id, SELECT FOR UPDATE para cupos,
  índices justificados, pg_trgm/PostGIS y migraciones versionadas. Para data-modeler y backend.
---

# bt-drizzle-postgres

Referencia rápida para el modelo de datos (`DataModel.json`) y el esquema Drizzle en `packages/db`.
La base es compartida: cada servicio escribe solo sus tablas y aísla por `operator_id`.

## Cuándo se activa

- Diseñar tablas o escribir el esquema Drizzle.
- Justificar índices o diagnosticar consultas lentas.
- Implementar cupos sin overbooking o retenciones financieras.

## Convenciones obligatorias

- `snake_case` en tablas y columnas; identificadores en inglés.
- Clave primaria `uuid` v4 (`gen_random_uuid()` o generado en app).
- Sin soft delete: estado de ciclo de vida en una columna `status` (enum), nunca `deleted_at`.
- Tablas financieras con `created_by` y marca de tiempo; montos en enteros COP (nunca `float`).
- Multi-tenant: `operator_id` en toda tabla con alcance de operador; las consultas lo filtran siempre.
- `timestamptz` para fechas; `numeric` para dinero si se guarda con decimales (preferir enteros COP).

## Tipos de dato

| Uso | Tipo correcto | Evitar |
|---|---|---|
| Identificadores | `uuid` | `serial`, UUID aleatorio sin v4 |
| Cadenas | `text` | `varchar(255)` |
| Fechas | `timestamptz` | `timestamp` |
| Dinero | entero COP (`integer`/`bigint`) | `float`, `real` |
| Banderas | `boolean` | `varchar`, `int` |

## Índices (justificar cada uno)

| Patrón de consulta | Índice | Ejemplo |
|---|---|---|
| `WHERE col = v` | B-tree | `CREATE INDEX ON t (col)` |
| `WHERE a = x AND b > y` | compuesto (igualdad primero) | `CREATE INDEX ON t (a, b)` |
| `WHERE jsonb @> '{}'` | GIN | `USING gin (col)` |
| búsqueda textual | `pg_trgm` + GIN | `USING gin (col gin_trgm_ops)` |
| geografía (tours) | PostGIS GiST | `USING gist (geom)` |

`pg_trgm` y PostGIS solo cuando la feature los necesita; no por defecto.

## Cupos sin overbooking

Reservar cupo bajo bloqueo de fila (regla de negocio, steering 05):

```sql
SELECT available_seats FROM tour_schedules
WHERE id = $1
FOR UPDATE;
-- validar y descontar en la misma transacción
```

En Drizzle, dentro de `db.transaction(async (tx) => { ... })` con `.for('update')`.

## Migraciones

- Versionadas en `packages/db/drizzle/`. Reversibles cuando sea posible.
- Generar con el script del paquete, nunca con los de la raíz (drift #14).
- No aplicar migraciones ni seed: `migrate`/`seed` están negados para los agentes; es decisión humana.

```powershell
node .kiro/factory/scripts/factory.mjs toolcheck --path packages/db
pnpm --filter @borondo/db run generate   # solo si DRIZZLE_CONFIG=yes
pnpm --filter @borondo/db run typecheck
```

Si no hay `drizzle.config` (hoy, #32), no se ejecuta `generate`: se registra `available:false` y el
esquema Drizzle sigue siendo la entrega, verificada por `typecheck`.

## complianceRefs

Cada tabla o columna que implementa un `CR-*` con `ownerRole: data-modeler` lo anota en
`complianceRefs` del `DataModel.json` (pasaporte de extranjeros en S3 privado, retención, etc.).

## Antipatrones a evitar

- Clave foránea sin índice.
- `SELECT *` cuando bastan columnas concretas.
- Paginación por OFFSET en listados grandes (usar cursor con `WHERE id > $cursor`).
- Dinero en `float`; soft delete; falta de `operator_id` en tabla multi-tenant.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/postgres-patterns` y `.kiro/skills/database-migrations`
(sección Drizzle), MIT, Copyright (c) 2026 Affaan Mustafa. Ver `.kiro/factory/THIRD_PARTY.md`.
Reescrito para Drizzle + PostgreSQL 16 de BorondoTours (sin Prisma ni Supabase; UUID v4, `status`,
`created_by`, `operator_id`, enteros COP).
