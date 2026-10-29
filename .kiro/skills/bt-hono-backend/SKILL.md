---
name: bt-hono-backend
description: >
  Patrones de backend con Hono sobre Bun (Lambda Web Adapter) para BorondoTours: sub-routers por
  dominio, router delgado + caso de uso + repositorio Drizzle, DI por fábricas de funciones,
  validación Zod, RBAC por middleware, onError con {data,error,meta} y logging estructurado sin PII.
---

# bt-hono-backend

Patrones para los servicios Hono en `services/*`. La arquitectura es por capas: router delgado, caso
de uso (función pura con dependencias inyectadas) y repositorio Drizzle. Sin contenedor de DI ni librería.

## Cuándo se activa

- Implementar endpoints de un servicio Hono.
- Añadir middleware (auth, RBAC, logging) o manejo de errores.
- Conectar el servicio con la BD vía repositorios Drizzle.

## Estructura por dominio

- Un sub-router de Hono por dominio, montado en la app del servicio.
- Router delgado: valida con Zod, invoca el caso de uso, formatea la respuesta.
- Caso de uso: función pura que recibe sus dependencias.
- Repositorio: única capa que habla con Drizzle; filtra por `operator_id`.

```typescript
// Inyección por fábricas de funciones (sin contenedor)
export function createBookingService({ repo, clock }: BookingDeps) {
  return {
    async confirm(input: ConfirmBookingInput) {
      // regla de negocio: el precio se congela al crear el booking
      // ...
    },
  }
}
```

## Validación con Zod

- Esquemas en `packages/contracts` (reutilizar `ApiResponseSchema` y `PaginationSchema`).
- El router valida el cuerpo y los parámetros antes de llamar al caso de uso; 422 ante fallo semántico.

## RBAC por middleware

```typescript
const requireRole = (...roles: Role[]) => async (c, next) => {
  const user = c.get('user')
  if (!user || !roles.includes(user.role)) {
    return c.json({ error: { code: 'forbidden', message: 'sin permiso' } }, 403)
  }
  await next()
}
```

Autorización a nivel de objeto: comprobar `operator_id` del recurso contra el del usuario (evita BOLA/cross-tenant).

## Manejo de errores (onError)

```typescript
app.onError((err, c) => {
  if (err instanceof z.ZodError) {
    return c.json({ error: { code: 'validation_error', message: 'datos inválidos', details: err.issues } }, 422)
  }
  // no exponer detalles internos
  return c.json({ error: { code: 'internal_error', message: 'error interno' } }, 500)
})
```

Toda respuesta usa el sobre `{data, error, meta}`.

## Cupos y transacciones

- Reservar cupo con `SELECT FOR UPDATE` dentro de `db.transaction` (sin overbooking).
- El webhook de OnePay.la es la única fuente de verdad del pago: idempotente por `webhook_event_id`,
  firma verificada, reintentos con SQS y DLQ.

## Logging estructurado

- JSON con `requestId`, `method`, `path`, actor y marca de tiempo. Nunca PII, tokens ni datos de tarjeta en logs.

## Lambda Web Adapter

- El servicio corre con `bun --hot` en local y `bun build --target node` para Lambda detrás del Web Adapter.
- Sin ECS, Redis, BullMQ ni Socket.io: trabajos asíncronos con EventBridge/SQS/Step Functions.

## Verificación (PowerShell)

```powershell
node .kiro/factory/scripts/factory.mjs toolcheck --path services/<svc>
pnpm --filter @borondo/service-<svc> run typecheck
pnpm --filter @borondo/service-<svc> run test
```

Los servicios hoy no tienen config ESLint ni tests: lint queda `available:false` y, si la feature no
agrega tests, `pnpm --filter <svc> exec vitest run --passWithNoTests`.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/backend-patterns` (reescritura), MIT,
Copyright (c) 2026 Affaan Mustafa. Ver `.kiro/factory/THIRD_PARTY.md`. Reescrito para Hono sobre Bun
con Lambda Web Adapter, Drizzle y Zod de BorondoTours (sin Express, Next.js ni Supabase).
