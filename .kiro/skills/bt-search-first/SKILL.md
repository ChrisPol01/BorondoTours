---
name: bt-search-first
description: >
  Investigar antes de escribir código en BorondoTours: primero buscar en el repo (kit bt-*,
  packages/*, helpers), luego en el stack ya aprobado, y solo entonces proponer. No agregar
  dependencias ni cambiar convenciones sin aprobación humana (pnpm add es ask; decisiones #1/#2/#15).
  Para los roles backend y frontend.
---

# bt-search-first

Antes de escribir una utilidad, un componente o un adaptador, buscar lo que ya existe. El objetivo es
no reinventar piezas del repo ni meter dependencias nuevas sin discusión (steering 03: "patrón
repetido 3+ veces → helper"; steering 02: "sin librerías fuera del stack sin discusión").

## Cuándo se activa

- Al empezar un modo `build` o `fix` que podría necesitar una pieza nueva.
- Cuando el contrato pide una funcionalidad que probablemente ya exista (componente, validación, cliente HTTP).
- Antes de proponer `pnpm add` (es `ask`: lo aprueba el humano).

## Orden de búsqueda (de dentro hacia fuera)

### 1. ¿Ya existe en el repo?

Buscar primero en el código antes que en npm. Puntos típicos:

- **Frontend**: el kit `bt-*` (`apps/web/src/lib/fig/runtime/ui-kit.ts` y el bloque KIT de
  `fig-runtime.css`), `tour-card.ts`, `panel.ts`, `menu.ts` (steering 18: si dos piezas se ven y se
  comportan igual, son un componente). i18n en `apps/web/src/lib/i18n/`. Cliente de API en
  `apps/web/src/lib/api/`.
- **Backend**: sub-routers por dominio en `services/*`, repositorios Drizzle, casos de uso puros.
- **Contratos y validación**: Zod en `packages/contracts` (`ApiResponseSchema`, `PaginationSchema`).
- **Reglas de negocio**: funciones puras en `packages/domain`.
- **Datos**: schema Drizzle y tablas del Core en `packages/db` y `Modelo-Datos-Core.md`.

```powershell
node .kiro/factory/scripts/factory.mjs toolcheck --path <paquete>
```

### 2. ¿Está en el stack aprobado?

El stack real está en el steering 02. Si la necesidad la cubre algo ya presente (TanStack Query,
Nanostores, DOMPurify/SafeHtml, `Intl.NumberFormat('es-CO')`, SQS/EventBridge, SES), usar eso. No
introducir Redis, BullMQ, Socket.io, Storybook (#16) ni un contenedor de DI: no están en el stack.

### 3. ¿Hace falta algo nuevo?

Solo si no existe en el repo ni en el stack. Entonces:

- Preferir una pieza del stack antes que una dependencia nueva.
- `pnpm add` es `ask`: dejar la propuesta y el comando exacto, y esperar aprobación humana. No instalar
  por cuenta propia.
- Si la decisión toca #1 (Hono vs NestJS), #2 (Astro vs Vite) o #15 (SAM vs CDK), **no** resolverla:
  dejarla como `pendingDecisions` con `blocking` y `reason`.

## Matriz de decisión

| Señal | Acción |
|---|---|
| Ya existe en el repo (kit, helper, schema) | Reusar; si falta una variante, extender la pieza existente (steering 18) |
| Lo cubre el stack aprobado | Usar la pieza del stack; sin dependencia nueva |
| No existe pero es común | Proponer la pieza del stack o, si falta, un `pnpm add` con aprobación (`ask`) |
| Toca una decisión pendiente | No resolver; dejar `pendingDecisions` y seguir con lo que ya hay en código |

## Modo investigación con subagente

Para una necesidad no trivial, backend y frontend no tienen `subagent` propio: la investigación se
hace leyendo el repo y el steering, y se deja el resumen en el handoff (`## Propuestas`) para que el
conductor lo recoja. No se delega a un subagente ni se hace búsqueda web (el perfil `developer` no
tiene `web`).

## Anti-patrones

- Escribir una utilidad sin comprobar si ya está en `packages/*` o en el kit.
- Duplicar un componente que ya existe con otro nombre (rompe el steering 18).
- Agregar una dependencia pesada para una pieza pequeña.
- Resolver en silencio una decisión pendiente (#1/#2/#15) eligiendo una librería fuera del stack.

## Reglas

- Primero el repo, luego el stack, al final la propuesta.
- `pnpm add` nunca se ejecuta sin aprobación; dejar el comando y señalar.
- No cambiar convenciones del proyecto sin discusión (steering 03/04).

## Atribución

Inspirado en wshobson/agents y adaptado de affaan-m/ECC `.kiro/skills/search-first`, MIT, Copyright
(c) 2026 Affaan Mustafa. Ver `.kiro/factory/THIRD_PARTY.md`. Reescrito para el repo y el stack de
BorondoTours (kit `bt-*`, `packages/*`, decisiones pendientes #1/#2/#15 y `pnpm add` como `ask`).
