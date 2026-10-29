---
name: bt-api-contract-openapi
description: >
  Diseño de contratos OpenAPI 3.1 para la API REST de BorondoTours: prefijo /api/v1/,
  sobre {data,error,meta}, paginación por cursor, extensiones x-bt-rbac/x-bt-zod/x-bt-query,
  idempotencia en POST de pagos y códigos de error. Para el rol api-contract de la fábrica.
---

# bt-api-contract-openapi

Convenciones para redactar `openapi.yaml` del bus en el YAML canónico de la fábrica. El contrato
es la fuente de verdad entre frontend y backend: los `examples` de cada respuesta sirven de mock al
frontend sin esperar al backend.

## Cuándo se activa

- Diseñar o revisar endpoints de la API (`services/*`).
- Añadir paginación, filtros o búsqueda compleja.
- Definir el formato de error y los nombres Zod del contrato.

## Estructura de URL

- Recursos en plural, kebab-case, bajo `/api/v1/`: `/api/v1/bookings`, `/api/v1/bookings/{id}`.
- Sub-recursos para pertenencia: `/api/v1/operators/{id}/tours`.
- Acciones que no son CRUD, como verbo escaso: `POST /api/v1/bookings/{id}/cancel`.
- Nunca verbos en la ruta (`/getBookings`), ni singular, ni snake_case en la URL.

## Métodos y verbo QUERY

- `GET` lecturas simples; `POST` escrituras; `PUT` reemplazo; `PATCH` parcial; `DELETE` baja lógica (nunca borra: cambia `status`).
- Búsquedas complejas: verbo `QUERY` (RFC 10008) con cuerpo, documentado con `x-bt-query`.

## Códigos de estado

| Código | Uso |
|---|---|
| 200 | GET/PUT/PATCH con cuerpo |
| 201 | POST que crea (incluir `Location`) |
| 204 | DELETE o acción sin cuerpo |
| 400 | JSON mal formado |
| 401 | sin autenticación |
| 403 | autenticado sin permiso (RBAC) |
| 404 | recurso inexistente |
| 409 | conflicto de estado o duplicado |
| 422 | validación semántica (Zod) |
| 429 | límite de tasa |

Nunca devolver 200 con `success:false`: el código HTTP comunica el resultado.

## Sobre de respuesta

Todo endpoint responde con el sobre `{data, error, meta}` (coherente con `onError` del backend):

```yaml
components:
  schemas:
    ApiError:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code: { type: string }
            message: { type: string }
            details:
              type: array
              items:
                type: object
                properties:
                  field: { type: string }
                  message: { type: string }
```

## Paginación por cursor

- Parámetro `limit` entre 1 y 100, por defecto 12 (coherente con el catálogo B2C).
- `meta.nextCursor` opaco; sin OFFSET (lento y frágil con inserciones concurrentes).
- `GET /api/v1/tours?limit=12&cursor=<opaco>` → `{ data: [...], meta: { nextCursor, hasNext } }`.

## Extensiones x-bt-*

- `x-bt-rbac`: roles permitidos por operación (los 10 roles + ANONYMOUS) y `tenantScope` por `operator_id`.
- `x-bt-zod`: nombre del esquema Zod en `packages/contracts` (`ApiEnvelope<Name>Schema`).
- `x-bt-query`: para operaciones `QUERY`, el esquema del cuerpo de búsqueda.
- `x-bt-compliance`: lista de `CR-*` que la operación implementa (dueño `api-contract`).

## Idempotencia en pagos

- Todo `POST` de pagos (confirmar reserva, segundo cobro Split Fare) exige cabecera `Idempotency-Key`.
- El webhook de OnePay.la es idempotente por `webhook_event_id` (regla de negocio, steering 05); el contrato lo refleja en el endpoint del webhook.

## Verificación (PowerShell)

```powershell
node .kiro/factory/scripts/factory.mjs publish --feature <id> --type openapi
```

El CLI valida el subconjunto de reglas (prefijo `/api/v1/`, sobre, cursor). El esquema Zod se crea
luego en modo `zod` y se verifica con:

```powershell
pnpm --filter @borondo/contracts run typecheck
pnpm --filter @borondo/contracts run test
```

## Lista de verificación

- [ ] Ruta en plural, kebab-case, bajo `/api/v1/`, sin verbos.
- [ ] Método correcto; `QUERY` para búsquedas complejas.
- [ ] Código HTTP semántico, nunca 200 para todo.
- [ ] Sobre `{data,error,meta}` en toda respuesta.
- [ ] Paginación por cursor (`limit` 1-100, por defecto 12).
- [ ] `x-bt-rbac`, `x-bt-zod` y `x-bt-compliance` por operación.
- [ ] `Idempotency-Key` en POST de pagos.
- [ ] `examples` por respuesta (mock del frontend).

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/api-design`, MIT, Copyright (c) 2026 Affaan Mustafa.
Ver `.kiro/factory/THIRD_PARTY.md`. Contenido reescrito para el stack de BorondoTours
(Hono, Zod en `packages/contracts`, sobre `{data,error,meta}`, cursor, `x-bt-*`).
