# 03 — Arquitectura, tenancy y RBAC de la app de gestión unificada (ERP + B2B)

Rol: solutions-architect + security-architect. Fecha: 2026-10. Solo lectura sobre el repo. Sin PII.

## 0. Respuesta corta

1. Unificar cuesta poco en código: `apps/erp` y `apps/b2b` son scaffolds idénticos de 7 archivos (una página "en construcción" cada una). Lo que se rompe es documentación y contratos: Spec-F RF-F01/RF-F01b/RF-F05/RF-F09, Spec-H §2 y §11, Spec-I §2 y §endpoints, Stack-Tecnologico §RBAC, el Modelo-Datos-Core (Quotations y AgentCommissions no tienen tenant) y 6 steering.
2. La auth y el RBAC aún no existen en código: `authMiddleware` no valida el JWT y `requireRoles` deja pasar todo (`services/1-core/src/middleware/{auth,rbac}.ts`, ambos con TODO). Los esquemas Drizzle están vacíos (`packages/db/src/schema/index.ts` es `export {}`). Así que el modelo de tenancy se puede diseñar bien desde el principio, sin migrar nada.
3. Propuesta: una sola app `apps/gestion` (`@borondo/gestion`) en `gestion.borondotours.com`, con 4 grupos de navegación: **Agencia** (`/agencia/*`), **Operador** (`/operador/*`), **Plataforma** (`/plataforma/*`, solo personal de BorondoTours) y rutas comunes en la raíz (`/inicio`, `/mensajes`, `/equipo`, `/perfil`). El sidebar muestra solo los grupos para los que el tenant tiene el módulo activo **y** el usuario tiene permiso.
4. Tenancy y permisos: recomiendo la **opción (b)**: módulos activables por tenant (tabla nueva `TenantModules`) + matriz fija "rol base × módulo → permisos" en `packages/domain`, refinada por `CustomRoles` (§23) con alcance por tenant. Se mantienen los 10 roles base y la regla de "un usuario = 1 rol". `operator_id` sigue siendo la clave de tenant (ADR-011 SW9). BorondoTours pasa a ser un tenant más (`BORONDO_INTERNAL_ID`, que ya contempla Spec-G RF-G01), y además tiene el grupo Plataforma.
5. Antes de construir el módulo Agencia para operadores hay que resolver 4 decisiones de negocio nuevas. La más importante: cómo se cobra y liquida una venta interna de un operador (¿por la cuenta OnePay.la de BorondoTours? ¿con comisión?). La regla vigente "comisión del agente = `borondo_amount` × rate" no tiene sentido para el agente de otro tenant.
6. Dependencia de #2 (Astro vs Vite): solo afecta a la capa de shell/enrutamiento (~5% del código). Si los módulos se escriben como componentes React de `packages/ui`, sirven con cualquiera de las dos opciones. Mi recomendación técnica, sin resolver la decisión: la app de gestión encaja mejor con la opción (b) de #2 ("Astro solo B2C, SPA para la app de gestión"). Hay que decidirlo antes del PR 2.
7. Riesgo de "melcocha" de componentes que ya existe: hoy conviven dos sistemas de vidrio y de botón. `packages/ui` usa `glass-surface` y variantes `primary|cta|secondary|ghost|danger`; el kit del B2C usa `bt-glass-std` y `bt-btn--primary|glass|link` (steering 18 dice que `bt-glass-std` es la *única* clase de vidrio). Hay que unificarlos antes de que la app de gestión consuma `packages/ui`.

ADR propuesto: **ADR-013**. El índice deja libre el ADR-012, pero el steering 02 y DECISIONES-PENDIENTES #1(a) lo reservan para la decisión Hono/NestJS ("No crear ADR-012").

---

## 1. Estado actual real

### 1.1 apps/erp y apps/b2b

| Elemento | apps/erp | apps/b2b |
|---|---|---|
| Archivos | `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/layouts/Base.astro`, `src/pages/index.astro`, `src/styles/global.css`, `src/islands/.gitkeep` | Mismos 7, contenido idéntico salvo textos |
| Paquete / puerto | `@borondo/erp`, `astro dev --port 3001` | `@borondo/b2b`, `--port 3002` |
| Dependencias | astro ^5, @astrojs/react ^4, react 19, nanostores, @borondo/ui, @borondo/contracts, Tailwind 4 vía `@tailwindcss/vite` | Idénticas |
| Config | `output: 'static'`, sin i18n, sin integración `validateDesignTokens` (la tiene `apps/web`) | Idéntica |
| Contenido | Un `<h1>` "ERP — Panel de Agencia" + párrafo "en construcción" | Un `<h1>` "Portal de Operadores" + párrafo |
| Scripts | dev/build/preview; sin lint/typecheck/test (steering 16) | Igual |
| Tema | `global.css` importa `@borondo/ui/styles/theme.css` y `@source` de `packages/ui/src` | Igual |

Conclusión: son 14 archivos sin lógica y duplicados. Unificarlos no rompe código. Borrarlos es una acción destructiva menor que requiere confirmación humana.

Otras referencias en código/infra:
- `infra/lib/cdn-stack.ts` (comentario, TODO): `erp.borondotours.com → apps/erp`, `b2b.borondotours.com → apps/b2b`. Esto contradice los docs, que usan rutas `/erp/*` y `/operador/*`.
- `infra/stacks/cdn.yaml` `FrontendDistribution`: un solo origen S3 con `CustomErrorResponses` 403/404 → `/index.html` (fallback de SPA). Con varias apps Astro estáticas en la misma distribución, ese fallback rompe el 404 propio del B2C y cualquier página de otra app. La app de gestión necesita su propia distribución o un comportamiento por ruta.
- `.kiro/factory/profile.json` `paths.apps: ["apps/web","apps/erp","apps/b2b"]`.
- `.github/workflows/ci.yml` L143-145 apunta a `apps/web-erp/dist`, `apps/web-b2b/dist` (no existen; ya registrado en #13).
- `.github/ISSUE_TEMPLATE/{feature_request,bug_report}.md`: casillas App 2 ERP / App 3 B2B.

### 1.2 Autenticación y RBAC

| Pieza | Estado real | Evidencia |
|---|---|---|
| Roles | Enum de 10 roles en contracts | `packages/contracts/src/enums/roles.ts` (`ROLES`, `Role`) |
| Esquemas auth | `RegisterSchema`, `LoginSchema` (sin campos de tenant) | `packages/contracts/src/schemas/auth.ts` |
| Middleware JWT | No valida: solo comprueba el prefijo `Bearer ` y llama a `next()` | `services/1-core/src/middleware/auth.ts` (TODO RS256) |
| RBAC | `requireRoles(...roles)` no comprueba nada | `services/1-core/src/middleware/rbac.ts` (TODO) |
| Rutas auth | Duplicadas: `routes/auth.ts` (501, la que monta `app.ts`) y `routes/auth.router.ts` (stub que devuelve `accessToken: '...'`) | `services/1-core/src/app.ts`, `routes/*` |
| Tenant isolation | No existe; `5-operators` devuelve `[]` | `services/5-operators/src/app.ts` |
| BD | Esquema Drizzle vacío; el comentario de ownership asigna `users, refreshTokens, customRoles` a 1-core | `packages/db/src/schema/index.ts` |
| `onError` | Hace `console.error` con `err.stack` y devuelve `err.message` al cliente (fuga de información; contradice steering 04/06) | `services/1-core/src/app.ts` |
| CORS | `cors()` sin origen (comodín) | `services/1-core/src/app.ts`, `5-operators/src/app.ts` |
| Sesión B2C (real) | Access token solo en memoria (nanostores), correcto según RF-F05 | `apps/web/src/stores/session.ts` |
| Sesión B2C (demo) | El runtime de Figma guarda una sesión demo, usuarios demo con hash y contadores de intentos en `localStorage`/`sessionStorage`. Redirige siempre a `/mis-reservas` | `apps/web/src/lib/fig/runtime/auth.ts` (`getSession`, `saveSession`, `finish(..., "/mis-reservas")`) |

Lo que está documentado (y no implementado):
- Spec-F RF-F01: 10 roles "mutuamente excluyentes (un usuario = 1 rol)"; `OPERATOR_*` siempre con `operator_id`.
- RF-F05: payload JWT `{ sub, role, email, level, operator_id | null }`, access token de 1 h, refresh opaco en cookie HttpOnly SameSite=Strict, rotación.
- RF-F09: dos matrices separadas (internos / operador). Los criterios citan `@Roles()` de NestJS y `RolesGuard` (afectado por #1).
- Modelo-Datos-Core §1 `Users.custom_role_id` y §23 `CustomRoles` (`base_role`, `permissions: {allow[], deny[]}` con formato `recurso:accion`; permiso efectivo = base ∪ allow − deny; `name UNIQUE` global; los crea SUPER_ADMIN).
- Arquitectura-Sistema §3.4: decorator que agrega `WHERE operator_id = jwt.operator_id` en endpoints de operador.
- Politica-Datos-Personales §3.3: el operador es **Encargado** del tratamiento de los pasajeros que recibe por manifiesto. §5.2: datos de operador solo visibles con el mismo `operator_id`; el SUPER_ADMIN ve todo con `AdminAuditLog`.

Contradicciones que afectan a esta unificación:
- `OPERATOR_AGENT`: Stack-Tecnologico y Spec-F lo describen como "Agente de ventas del operador (manifiesto manual, AgencyLinks)" con edición de manifiesto. Spec-I RF-I01 lo define como "Soporte — personal de apoyo (lectura)". Con un módulo Agencia, este rol es el candidato natural a vendedor del operador. Hay que fijar su significado.
- Quotations (§25), AgentCommissions (§16) y AgentCommissionHistory (§17) **no tienen `operator_id`**. Asumen que la única agencia es BorondoTours (`agent_id → Users (role = AGENT)`).
- Bookings (§8) tiene `agent_id` y `source (WEB_B2C, AGENT_QUOTE, AGENCY_LINK, QUICK_SALE)`, pero no registra qué tenant vendió.
- `CustomRoles.name UNIQUE` es global: no admite roles con el mismo nombre en dos tenants.

### 1.3 Kit de componentes y packages/ui

- `apps/web` tiene dos capas. (1) Páginas generadas desde Figma por `otros/infra/fig2astro` (capas absolutas, escenario de 1440 px escalado con `zoom`, `layouts/FigmaPage.astro`), con un runtime vanilla encima (`src/lib/fig/runtime/*`, kit en `ui-kit.ts` + bloque "KIT DE COMPONENTES" de `src/styles/fig-runtime.css`, ~L497-1243). (2) Islands React y `packages/ui`.
- `packages/ui` (README: "compartida por las 3 apps web") exporta Button, Input, Checkbox, RadioGroup, Chip, Tabs, Badge, tipografía, AccessibleDialog, Toast/Banner, Skeleton, Spinner, StatusMessage, GlassSurface, Card y useFocusTrap. Tiene tests (6 archivos). Le faltan piezas que la gestión necesita: Select, EmptyState, Popover, useDisclosure, tabla, sidebar, kanban.
- Duplicación detectada:
  - Vidrio: `packages/ui/src/surfaces/GlassSurface.tsx` usa `.glass-surface` y obliga a `overImage: true`. El kit usa `bt-glass-std`, que steering 18 declara "única clase de vidrio".
  - Botón: `packages/ui/src/primitives/Button.tsx` (variantes `primary|cta|secondary|ghost|danger`, `secondary = glass-surface`) frente a `ui-kit.ts button()` (`primary|glass|link`, `bt-btn`).
  - Estado vacío: `emptyState()` existe en el kit y el README de ui lo promete en `feedback/`, pero no existe en ui.
- El patrón fig2astro (escenario de ancho fijo, posiciones absolutas) **no sirve** para pantallas densas de gestión (tablas, kanban, formularios largos). La gestión debe construirse con componentes React de `packages/ui` sobre tokens, y Figma debe seguir siendo la fuente del diseño de esas piezas (agente `figma-sync`).

---

## 2. Propuesta de app unificada

### 2.1 Nombre, ruta y dominio
- Carpeta `apps/gestion`, paquete `@borondo/gestion`, puerto local 3001 (el de erp). Se retiran `apps/erp` y `apps/b2b` cuando el shell nuevo compile (con confirmación humana).
- Dominio: `gestion.borondotours.com` (dev: `gestion.dev.borondotours.com`). Razón: es un subdominio del mismo sitio registrable que el B2C, así que la cookie de refresh `SameSite=Strict` sigue funcionando (same-site). La app queda aislada del B2C en CSP y caché, y tiene su propia distribución CloudFront sin el fallback SPA que rompería el B2C.
- `noindex` en todo (ya está en los `Base.astro` actuales). Sin páginas públicas en esta app; los links públicos de agencia (`/api/v1/public/agency/{token}`, RF-I10) se sirven desde el B2C o una página pública aparte, nunca desde el shell autenticado.

### 2.2 Estructura de carpetas

```
apps/gestion/
  src/
    shell/                  # depende de #2: layout, router/páginas, guardas de UX
      AppShell.tsx          # sidebar + topbar + <main id="main">, skip link
      Sidebar.tsx           # grupos colapsables (disclosure accesible)
      guards.ts             # canSee(module, permission) solo para UX
    modules/                # NO depende de #2: componentes React puros + hooks TanStack Query
      registry.ts           # manifiesto declarativo: id, group, path, entitlement, permission, i18nKey, icon
      agencia/{crm,cotizaciones,ventas,comisiones,metas,reportes,bandeja}/
      operador/{tablero,inventario,cupos,manifiesto,links-agencia,radar,planificacion,equipo-campo,flota,proveedores,finanzas,configuracion}/
      plataforma/{tenants,revision-tours,contratos,liquidaciones,radar-global,anuncios,reportes,auditoria}/
      comun/{inicio,mensajes,notificaciones,calendario,equipo,perfil}/
    stores/                 # nanostores: session (copia del patrón apps/web/src/stores/session.ts), workspace (tenant, módulos, permisos)
    api/                    # cliente fetch + interceptor 401 → refresh → reintento (RF-F05)
    i18n/                   # namespaces agencia, operador, plataforma, comun (reemplazan erp.json/b2b.json)
    styles/global.css       # tailwind + @borondo/ui theme + kit.css
```

Regla: `modules/*` no importa nada de `shell/` ni de Astro. Un módulo es una lista de pantallas React que reciben `TenantContext` del store.

### 2.3 Enrutamiento

| Grupo | Prefijo | Visible si |
|---|---|---|
| Común | raíz: `/inicio`, `/mensajes`, `/notificaciones`, `/calendario`, `/equipo`, `/perfil` | cualquier rol de gestión |
| Agencia | `/agencia/*` (`/agencia/crm`, `/agencia/cotizaciones`, `/agencia/ventas`, `/agencia/comisiones`, `/agencia/tablero`…) | tenant con módulo `AGENCY` + permiso |
| Operador | `/operador/*` (`/operador/tablero`, `/operador/tours`, `/operador/manifiestos`, `/operador/radar`, `/operador/planificacion`…) | tenant con módulo `OPERATOR` + permiso |
| Plataforma | `/plataforma/*` (`/plataforma/tenants`, `/plataforma/revision`, `/plataforma/radar`…) | solo tenant BorondoTours y rol interno |

Decidí no usar el prefijo `/comun/*` porque las rutas transversales no son de un grupo y la URL queda más limpia. `Plataforma` se separa de `Agencia` a propósito: las funciones de SUPER_ADMIN (RF-H18 a RF-H23: Ghost Login, tenants, contratos, ads, yield) no pueden quedar dentro de un módulo que se vende a operadores.

API, con el mismo criterio: `/api/v1/agency/*`, `/api/v1/operator/*`, `/api/v1/platform/*`. Reemplazan `/api/v1/erp/*` (Spec-H §11) y `/api/v1/b2b/*` (Spec-I). El tenant sale **siempre** del token verificado, nunca del path ni del body. Solo `/platform/tenants/:id/...` acepta un tenant explícito, y queda auditado.

### 2.4 Carga de módulos según el tenant
1. Al abrir la app no hay token en memoria (vino del B2C o hubo recarga). El shell hace `POST /api/v1/auth/refresh` con la cookie HttpOnly y obtiene el access token.
2. `GET /api/v1/me/workspace` devuelve `{ tenant: {id, tradeName, kind}, modules: ["AGENCY","OPERATOR"], permissions: [...], landing: "/operador/tablero" }`. Se guarda en el store `workspace` (en memoria).
3. El sidebar se construye filtrando `modules/registry.ts` con `modules ∩ permissions`. Los grupos sin ítems no se pintan.
4. Las islands de cada módulo se cargan por página o ruta (code splitting natural). Un tenant sin módulo Agencia nunca descarga su JS.
5. Las guardas del frontend son solo de UX. La autorización real es del backend (sección 3.4).

Sidebar: dos o tres botones de grupo con `aria-expanded`/`aria-controls`, uno o varios abiertos a la vez, con teclado completo. El estado abierto/cerrado se puede recordar en `localStorage` porque es una preferencia no sensible (nunca tokens). Mobile: hoja lateral con focus trap (`useFocusTrap` de `packages/ui`).

### 2.5 Reutilización del kit y de packages/ui
- La gestión consume **solo** `@borondo/ui` (React) y tokens. No usa fig2astro ni el runtime vanilla.
- Prerrequisito (PR 1): un solo sistema visual.
  - Mover el bloque "KIT DE COMPONENTES" de `apps/web/src/styles/fig-runtime.css` a `packages/ui/src/styles/kit.css`, que importan `apps/web` y `apps/gestion`.
  - `GlassSurface` y `Button` de `packages/ui` emiten las clases del kit (`bt-glass-std`, `bt-btn bt-btn--primary|glass|link`, `bt-btn--block`) en lugar de `glass-surface`.
  - Las variantes que solo existen en ui (`cta`, `ghost`, `danger`) se mapean a variantes nuevas del kit y se replican en Figma con `figma-sync`. Si no, se eliminan.
  - `ui-kit.ts button()` y `<Button>` comparten la tabla de clases (exportar `buttonClasses` como única fuente).
- Piezas nuevas para gestión (en `packages/ui`, cada una replicada en Figma sección 00): `Sidebar`/`NavGroup`, `PageHeader` (equivalente React de `sectionHead`), `StatCard` (de `statCard`), `EmptyState` (de `emptyState`), `DataTable` (cursor pagination), `FilterBar`, `KanbanBoard`/`KanbanColumn`, `Select`, `Popover`, `useDisclosure`, `Drawer` (sobre `AccessibleDialog`).
- Steering 18 se amplía con una columna "React (`packages/ui`)" por pieza para que haya una única tabla de equivalencias.

### 2.6 Dependencia de DECISIONES-PENDIENTES #2
- (a) Astro en todas: funciona con `output: 'static'`, una página `.astro` por pantalla con island React, ids en query string (`/operador/tours/detalle?id=`) porque el estático no genera rutas dinámicas sin `getStaticPaths`, y una distribución CloudFront sin fallback SPA.
- (b) Astro solo B2C, SPA para gestión: un solo `index.html` con router cliente, rutas dinámicas reales, fallback SPA en su propia distribución. Esto es lo que ya asume ADR-011 SW4/INF8 y `cdn.yaml`. Implica una librería de router (Frontend-Architecture cita TanStack Router, que no está en `package.json`), así que es una dependencia nueva que hay que aprobar.
- Recomendación sin resolver: (b) encaja mejor con una app autenticada, sin SEO y con navegación densa. (a) es viable y reduce la heterogeneidad del monorepo. Como `modules/*` es agnóstico, la elección solo cambia `shell/`. **Debe decidirse antes del PR 2.**

---

## 3. Modelo de tenancy y permisos

### 3.1 Opciones

| | (a) Roles nuevos | (b) Módulos por tenant + rol por módulo | (c) Solo CustomRoles (§23) |
|---|---|---|---|
| Idea | Añadir `OPERATOR_SALES`, `OPERATOR_SALES_MANAGER`… | `TenantModules` activa grupos; matriz fija rol base × módulo; CustomRoles refina | El SUPER_ADMIN crea un CustomRole por operador con `allow: quote:*` |
| 10 roles inmutables (Spec-F §1) | Se rompe | Se respeta | Se respeta |
| Activar/desactivar Agencia a un tenant | No lo expresa (rol ≠ contrato) | Una fila en `TenantModules` | No lo expresa; hay que editar roles de cada usuario |
| Riesgo de fuga | Alto: un rol de ventas sin módulo contratado ve pantallas | Bajo: permiso efectivo = rol ∩ módulos del tenant | Medio: `name UNIQUE` global y sin `operator_id`, así que un CustomRole puede asignarse a otro tenant |
| Escala | Explosión combinatoria con cada módulo | Lineal | Necesita al SUPER_ADMIN para cada tenant |
| Esfuerzo | Migración de enum + todas las matrices | Una tabla + una función pura + tests | Bajo hoy, deuda alta |

**Decisión recomendada: (b), usando el vocabulario de (c).** Los permisos siguen el formato `recurso:accion` de §23. `CustomRoles` gana `operator_id` (null = global, creado por SUPER_ADMIN; con valor = rol del tenant) y `UNIQUE(operator_id, name)`. En F1 solo SUPER_ADMIN crea CustomRoles; que OPERATOR_ADMIN pueda crearlos en su tenant queda para F2.

### 3.2 Modelo de datos propuesto (para Modelo-Datos-Core)
- `Operators` se mantiene como tabla de tenants. `operator_id` = tenant id en todo el modelo (ADR-011 SW9). En contracts se agrega el alias `TenantId` para que el código diga lo que significa. No se renombra para no reescribir 54 tablas documentadas.
- BorondoTours = fila `Operators` con `id = BORONDO_INTERNAL_ID` (ya prevista en Spec-G RF-G01). Los usuarios internos (SUPER_ADMIN, GERENTE, AGENT, COORD) pasan a tener `operator_id = BORONDO_INTERNAL_ID` (hoy `null`). `CLIENT` sigue con `null`.
- Nueva tabla `TenantModules`: `id, operator_id FK, module enum (AGENCY, OPERATOR), status enum (ACTIVE, SUSPENDED), enabled_by FK, enabled_at, disabled_at | null, created_at`. `UNIQUE(operator_id, module)`. Sin borrado: se usa `status` (steering 04).
- `Quotations`, `QuoteActions`, `AgentCommissions`, `AgentCommissionHistory`: + `operator_id NOT NULL` (tenant que vende) + `INDEX(operator_id, …)`. `agent_id` → Users de un rol con permiso `quote:create` en ese tenant (deja de ser solo `role = AGENT`).
- `Bookings`: + `selling_operator_id` (tenant que vendió; distinto del dueño del tour, que se obtiene vía `tour_instance → tour.operator_id`). Al enum `source` se suma `TENANT_QUOTE` / `TENANT_DIRECT`, sujeto a la decisión de negocio del §4.3.
- Tablas CRM nuevas (inspiradas en vocero-crm, ver informe de CRM): `Contacts`, `PipelineStages`, `Leads` (o reutilizar Quotations como tarjeta), `Conversations`/`Messages` (bandeja, F2; DynamoDB según ADR-003). Todas con `operator_id NOT NULL` y PII cifrada (ADR-006).
- `CustomRoles`: + `operator_id | null`, `UNIQUE(operator_id, name)`.

### 3.3 Cálculo del permiso efectivo (función pura en `packages/domain`)

```
effective(user, tenant) =
  ( ⋃_{m ∈ tenant.activeModules ∪ {COMMON} ∪ (tenant = BORONDO ? {PLATFORM} : ∅)} BASE[user.role][m] )
  ∪ customRole.allow − customRole.deny
  ∩ PERMISSIONS_OF(tenant.activeModules ∪ {COMMON} ∪ platform?)   ← el allow nunca abre un módulo no contratado
```

Tests obligatorios (RBAC, steering 04/06): tabla completa de vectores rol × módulos y property-based con `fast-check` (ya está en ui/web): "para cualquier rol y CustomRole, ningún permiso fuera de los módulos activos".

### 3.4 Matriz de permisos resultante (por defecto, antes de CustomRoles)

Leyenda: ✅ total · 📝 operar (crear/editar lo propio) · 👁 lectura · — sin acceso. "Propio tenant" en todas las celdas salvo Plataforma.

| Módulo / recurso | SUPER_ADMIN | GERENTE | AGENT | COORD | OP_ADMIN | OP_COORD | OP_AGENT | OP_GUIDE / OP_DRIVER | CLIENT |
|---|---|---|---|---|---|---|---|---|---|
| **Común** inicio, mensajes, perfil | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — (App 4 `/field`) | — |
| Común: equipo del tenant (`team:*`) | ✅ | 👁 | — | — | ✅ | 👁 | — | — | — |
| **Agencia** CRM/pipeline (`lead:*`) | ✅ (Borondo) | ✅ equipo, reasigna | 📝 propio | — | ✅ equipo* | — | 📝 propio* | — | — |
| Agencia: cotizaciones + link de pago (`quote:*`) | ✅ | ✅ + `approve` descuento >10% | 📝 | — | ✅ + `approve`* | — | 📝* | — | — |
| Agencia: venta rápida (`booking:create` canal tenant) | ✅ | ✅ | 📝 | — | ✅* | — | 📝* | — | — |
| Agencia: comisiones (`commission:*`) | ✅ | ✅ liquida | 👁 propias | — | ✅ liquida* | — | 👁 propias* | — | — |
| Agencia: metas/leaderboard/reportes | ✅ | ✅ | 👁 | — | ✅* | — | 👁* | — | — |
| **Operador** tablero/KPIs | ✅ (Borondo F2) | — | — | 👁 | ✅ | — | — | — | — |
| Operador: tours/instancias (`tour:*`, `instance:*`) | ✅ | — | — | ✅ (tours propios F2) | ✅ (publicar = solicitud) | 👁 | 👁 | — | — |
| Operador: cupos premium | ✅ | — | — | ✅ | ✅ | ✅ | — | — | — |
| Operador: manifiesto (`manifest:*`) | ✅ | — | — | ✅ | ✅ | ✅ | 👁 o 📝 (ver #36) | 👁 asignados (App 4) | — |
| Operador: links de agencia | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Operador: radar, planificación, contingencias (Spec-K) | ✅ | — | — | ✅ | ✅ | ✅ | — | — | — |
| Operador: flota, proveedores, regiones | ✅ | — | — | ✅ | ✅ | 📝 asignar | — | — | — |
| Operador: finanzas (payouts, chargebacks, tasa vigente) | ✅ | — | — | — | 👁 | — | — | — | — |
| **Plataforma** tenants/onboarding (RF-H19, RF-F02b) | ✅ | — | — | — | — | — | — | — | — |
| Plataforma: revisión de tours / TourEditRequest | ✅ | — | — | ✅ | — | — | — | — | — |
| Plataforma: contratos de comisión, payouts globales | ✅ | — | — | — | — | — | — | — | — |
| Plataforma: radar global e incidentes cross-tenant (Spec-G) | ✅ | — | — | ✅ (auditado) | — | — | — | — | — |
| Plataforma: ads, reportes consolidados (RF-H20/H22) | ✅ | 👁 reportes | — | — | — | — | — | — | — |
| Plataforma: Ghost Login (RF-H18) | ✅ (auditado, sin pagos) | — | — | — | — | — | — | — | — |

\* Solo si el tenant tiene `AGENCY` activo. Para BorondoTours, Agencia la operan GERENTE/AGENT. Para un operador, OP_ADMIN (equivale a GERENTE) y OP_AGENT (equivale a AGENT).

Redirección post-login (reemplaza RF-F01b / RF-H01), función pura `landingFor(role, modules)`:
- CLIENT → `/mis-reservas` (B2C, sin cambio). OPERATOR_GUIDE/DRIVER → `/field` (sin cambio).
- SUPER_ADMIN → `gestion…/plataforma/tenants`. GERENTE → `/agencia/tablero`. AGENT → `/agencia/crm`. COORD → `/plataforma/radar`.
- OPERATOR_ADMIN → `/operador/tablero` si tiene OPERATOR; si no, `/agencia/tablero`.
- OPERATOR_COORD → `/operador/radar`. OPERATOR_AGENT → `/agencia/crm` si tiene AGENCY; si no, `/operador/manifiestos`.
- Ruta de otro grupo sin permiso → 403 + redirección a `landing`. Un CLIENT en la app de gestión → B2C.

### 3.5 Aplicación en backend (tenant isolation)
1. Lambda Authorizer (INF9) verifica el JWT RS256. El payload se amplía a `{ sub, role, tid (= operator_id), mods, perm_v, level }`. `mods` sirve solo para la UX.
2. Middleware Hono: `requireAuth` → `loadTenantContext` (lee `TenantModules` y CustomRole de la BD con caché en memoria ≤60 s por instancia, para que una suspensión surta efecto sin esperar a que caduque el token de 1 h) → `requireModule('AGENCY')` → `requirePermission('quote:create')`.
3. Repositorios Drizzle con `TenantContext` obligatorio en la firma. No existe un repositorio sin tenant salvo los de `platform/*`, que exigen `PLATFORM` y escriben en `AdminAuditLog`. Esto reemplaza el "decorator" NestJS de Arquitectura-Sistema §3.4.
4. Defensa en profundidad opcional: RLS de PostgreSQL con `set_config('app.tenant_id', …, true)` por transacción. **No verificado**: el efecto de *pinning* de sesiones en RDS Proxy con `SET`/`set_config`. Hay que medirlo antes de adoptarlo.
5. Al desactivar un módulo o suspender un tenant: revocar los refresh tokens de sus usuarios y subir `perm_v`.
6. Errores 403/404 indistinguibles para recursos de otro tenant (evita enumeración/IDOR): un recurso ajeno devuelve 404.
7. Corregir de paso, en `services/*/app.ts`: `onError` no debe devolver `err.message` ni loguear stack con datos, y `cors()` debe tener lista de orígenes (`borondotours.com`, `gestion.borondotours.com`).

### 3.6 Riesgos de tenant isolation

| Riesgo | Escenario | Mitigación |
|---|---|---|
| Cross-tenant entre operadores | Operador A ve leads, manifiestos o finanzas de B por un id en la URL | Tenant solo desde el token; repos con `TenantContext`; 404 en recursos ajenos; tests property-based cross-tenant por repositorio |
| **BorondoTours viendo datos de operadores** | Si el operador vende como agencia, su CRM compite con la agencia de BorondoTours. GERENTE/AGENT podrían ver leads o clientes de un operador; el yield (RF-H23) podría usar esos datos | GERENTE/AGENT/COORD tienen alcance de **su** tenant (Borondo). Solo SUPER_ADMIN cruza tenants, por `platform/*`, con motivo obligatorio y `AdminAuditLog`/`GhostLoginAuditLog`. Prohibir por contrato y código que el yield o el marketing lean tablas CRM de otros tenants. Ghost Login a un tenant con CRM: solo lectura y auditado |
| Rol de Ley 1581 invertido | En el CRM del operador, sus clientes son de él: el operador pasa a **Responsable** y BorondoTours a **Encargado** (al revés que en el manifiesto, §3.3 de la Política) | Actualizar Politica-Datos-Personales §1, §2.2, §3.3 y §5.2; contrato de transmisión de datos (DPA) en los T&C del módulo; exportación y borrado por tenant; la importación CSV exige que el tenant declare la autorización de los titulares |
| Agencias externas | Hoy registran pasajeros por link público sin login (RF-I10). Si en el futuro una agencia externa entra a la app, sería un tenant con solo AGENCY | Mantener los links públicos fuera del shell autenticado; token del link con alcance a una instancia, expiración y rate limit; no exponer el manifiesto completo; si una agencia externa se vuelve tenant, se crea `Operators` con solo `AGENCY` (mismo modelo, sin caso especial) |
| Tenant con dos funciones | Un usuario de operador con ambos módulos mezcla venta propia y manifiesto de terceros | Los permisos son por recurso, no por grupo; el manifiesto muestra pasajeros de otras agencias como Encargado, con los campos mínimos (RF-G10, §5.2 de la Política) |
| Usuario en varios tenants | Un guía freelance que trabaja para dos operadores (`Users.operator_id` es único) | Fuera de alcance F1; registrar como decisión (#37). Si se aprueba: tabla `Memberships` y selector de tenant |
| Tokens en el cambio B2C → gestión | Copiar el patrón demo de `fig/runtime/auth.ts` (localStorage) | En gestión solo se usa el patrón de `stores/session.ts` + refresh silencioso; test que falle si se escribe `localStorage` con claves de sesión |
| Auth no implementada | `authMiddleware`/`requireRoles` no hacen nada | Ningún endpoint de gestión puede desplegarse antes del PR 3 (auth + tenant context con tests) |

---

## 4. Impacto

### 4.1 Archivos y secciones que cambian

| Archivo | Sección | Cambio |
|---|---|---|
| `docs/01-Specs/Spec-F-Auth.md` | §1 objetivos, RF-F01 (tablas "Accede a"), RF-F01b, RF-F05 (payload), RF-F09 (matriz única por módulo), §8 endpoints (`/me/workspace`), §9 modelo (Users.operator_id para internos, TenantModules) | Reescribir con la matriz del §3.4 |
| `docs/01-Specs/Spec-H-ERP-Agencia.md` | §2 RF-H01, RF-H02…H17 (agente = rol de ventas del tenant), RF-H10 (base de comisión por tenant), RF-H18…H23 (pasan a Plataforma), §11 endpoints `/erp` → `/agency` y `/platform` | Renombrar a "Módulo Agencia" |
| `docs/01-Specs/Spec-I-B2B-Portal-Operadores.md` | Encabezado "App 3", RF-I01 (OPERATOR_AGENT), RF-I02 (revenue por canal + "ventas internas"), endpoints `/b2b` → `/operator` | Renombrar a "Módulo Operador"; las funciones se mantienen |
| `docs/01-Specs/Spec-G-ERP-Operativo.md` | RF-G01 (`BORONDO_INTERNAL_ID`), RF-G10 (vista limitada → módulo Operador), §7 endpoints | Ajuste de rutas y de grupos |
| `docs/01-Specs/Spec-K-Planificacion-Operativa.md` | Historias COORD/OPERATOR_COORD | Nota: viven en Operador → Planificación |
| `docs/01-Specs/Spec-J-…App-Movil.md` | Login/redirect | Sin cambios funcionales; verificar referencias a App 3 |
| `docs/03-Knowledge/Modelo-Datos-Core.md` | §1 Users, §8 Bookings, §16-17 AgentCommissions*, §23 CustomRoles, §25 Quotations, §33 QuoteActions; tablas nuevas TenantModules y CRM | Ver §3.2 |
| `docs/03-Knowledge/Modelo-Comisiones.md` | Comisión de agente | Regla para agentes de tenants distintos de Borondo |
| `docs/03-Knowledge/Politica-Datos-Personales.md` | §1, §2.2, §3.3, §5.2 | Responsable/Encargado en CRM de tenant |
| `docs/00-Inicio/Stack-Tecnologico.md` | §RBAC (columna "App principal") | Rutas nuevas y nota de módulos |
| `docs/00-Inicio/Stack-de requerimientos resumido.md` | Tabla de roles L32-48 | Rutas nuevas |
| `docs/00-Inicio/APP2-ERP-Agencia.md`, `APP3-B2B-Operadores.md` | Todo | Fusionar en `APP2-Gestion.md`; APP3 queda como redirección |
| `docs/00-Inicio/Contexto-Para-IA.md`, `Vision-y-Objetivos.md`, `Inventario-Funcionalidades-MVP.md` | "4 apps" | 3 apps (B2C, Gestión, Móvil) |
| `docs/04-Tech-Design/Frontend-Architecture.md` | Árbol `/features/erp`, `/b2b`, `/apps/erp`, `/b2b`; i18n `erp.json`/`b2b.json`; deploy SPA | Estructura del §2.2 |
| `docs/04-Tech-Design/Arquitectura-Sistema.md` | §3.4 Tenant Isolation, §4 code splitting | Patrón del §3.5 |
| `docs/04-Tech-Design/Mapa-Repositorio.md` | Tabla de apps, comandos `@borondo/erp|b2b` | `@borondo/gestion` |
| `docs/04-Tech-Design/Catalogo-Componentes-UI.md` | Piezas | Sidebar, DataTable, Kanban, etc. |
| `docs/02-ADRs/ADR-011-Arquitectura-Consolidada.md` | SW4 "3 apps (B2C/ERP/B2B)" | Nota "ver ADR-013" |
| `docs/02-ADRs/ADR-Index.md` | Registro | Añadir ADR-013 |
| `docs/DECISIONES-PENDIENTES.md` | #2 (texto "erp/b2b"), nuevas #33-#40 | Ver §4.3 |
| `docs/06-Operaciones/Inventario-AWS.md` | Hosting | Cuando exista `gestion.*` (steering 11) |
| `.kiro/steering/01-project-identity.md` | "4 apps" | 3 apps |
| `.kiro/steering/02-tech-stack.md` | `apps/{web,erp,b2b}`, "las 3 apps" | `apps/{web,gestion}` |
| `.kiro/steering/16-comandos-y-entorno.md` | "erp y b2b (puertos 3001/3002)" | `gestion` (3001) con lint/typecheck/test |
| `.kiro/steering/17-estado-del-proyecto.md` | Fila "ERP / B2B" | "Gestión (Agencia + Operador)" |
| `.kiro/steering/18-kit-componentes.md` | Tabla de piezas | Columna React y `kit.css` en `packages/ui` |
| `.kiro/factory/profile.json` | `paths.apps` | `["apps/web","apps/gestion"]` |
| `packages/ui/README.md`, `src/index.ts` (comentario) | "3 apps" | B2C y Gestión |
| `infra/lib/cdn-stack.ts`, `infra/stacks/cdn.yaml` | Subdominios erp/b2b; fallback SPA global | Distribución `gestion.*` (depende de #15) |
| `.github/ISSUE_TEMPLATE/*.md`, `.github/workflows/ci.yml` | Apps | Gestión (ci.yml dentro de #13) |

### 4.2 Qué se rompe o se reemplaza
- RF-F01b / RF-H01: todos los destinos `/erp/*` y `/operador/*` cambian de host (`gestion.*`) y de ruta. Solo afecta a docs: ninguna redirección está en código (el login demo del B2C va siempre a `/mis-reservas`).
- RF-F01 "un usuario = 1 rol" **se mantiene**. Cambia "Accede a": ya no depende solo del rol, sino de rol × módulos del tenant.
- RF-F05: payload JWT nuevo (`tid`, `mods`, `perm_v`). El interceptor de TanStack Query y el refresh silencioso pasan a ser obligatorios al entrar a la app de gestión.
- Prefijos de API `/api/v1/erp/*` y `/api/v1/b2b/*` (solo docs).
- Paquetes `@borondo/erp`, `@borondo/b2b`, puerto 3002, namespaces i18n `erp`/`b2b`, subdominios `erp.`/`b2b.` del comentario de CDK.
- Supuesto de datos "la única agencia es BorondoTours" (Quotations, AgentCommissions, regla 05 de comisión de agente).
- Usuarios internos con `operator_id = null` → `BORONDO_INTERNAL_ID`.

### 4.3 A resolver antes (DECISIONES-PENDIENTES)

| # | Tema | Bloquea | Por qué |
|---|---|---|---|
| 2 | Astro vs Vite | PR 2 (shell) | Define el router y el despliegue de `apps/gestion` |
| 1 | Hono vs NestJS | PR 3 (auth/RBAC) | Spec-F cita `@Roles`/`RolesGuard` de NestJS; el código es Hono |
| 15 | SAM vs CDK | PR de despliegue | Nueva distribución `gestion.*` |
| 13 | CI | Merge seguro | Sin CI no hay puerta para tests RBAC |
| 33 (nueva) | Unificación ERP+B2B y modelo de módulos | Todo | Registrar la decisión (ADR-013) |
| 34 (nueva) | Economía de la venta interna del operador | Módulo Agencia para operadores | ¿Cobra con OnePay.la de BorondoTours (entonces payout y comisión) o con su propia pasarela (solo registro)? ¿Comisión, tarifa SaaS o ninguna? ¿Factura Siigo de quién? Afecta a Bookings, OperatorPayouts, ADR-001/009/010 y al webhook |
| 35 (nueva) | Base de la comisión de agentes de un tenant | AgentCommissions | La regla 05 ("`borondo_amount` × rate") no aplica a agentes del operador |
| 36 (nueva) | Significado de OPERATOR_AGENT | Matriz | Vendedor (Stack/Spec-F) vs soporte de lectura (Spec-I RF-I01) |
| 37 (nueva) | Usuario en varios tenants | Diferible | `Users.operator_id` único |
| 38 (nueva) | CustomRoles por tenant (quién los crea) | F2 | SUPER_ADMIN (F1) vs OPERATOR_ADMIN |
| 39 (nueva) | Roles Ley 1581 en el CRM del tenant | Módulo CRM con PII | Responsable/Encargado, DPA, importación CSV |
| 40 (nueva) | ¿El operador-agencia revende tours de otros operadores? | Alcance de Agencia | Si sí, se apoya en el pool de cupos / premium (RF-I07) como canal; si no, solo vende lo propio |
| — | Unificar vidrio/botón (`glass-surface` vs `bt-glass-std`) | PR 1 | Evita dos sistemas visuales en gestión |

---

## 5. Borrador de ADR (no creado como archivo)

```markdown
---
tags: [adr, arquitectura, frontend, rbac, tenancy]
created: 2026-10
---
# ADR-013 — App de gestión unificada (Agencia + Operador) con módulos por tenant

## Estado
Propuesto. Supera la parte "3 apps (B2C/ERP/B2B)" de ADR-011 SW4. No resuelve DECISIONES-PENDIENTES #1, #2 ni #15.
(ADR-012 queda reservado para la decisión #1.)

## Contexto
- App 2 (ERP agencia) y App 3 (portal de operadores) eran apps separadas (`apps/erp`, `apps/b2b`), hoy scaffolds sin lógica.
- Varios operadores también venden directamente (actúan como agencia) y piden gestionar ambas cosas en un solo lugar. Algunos ya tienen sistemas propios.
- BorondoTours es agencia y, desde F2, operador con tours propios (`BORONDO_INTERNAL_ID`).
- El RBAC define 10 roles excluyentes. Los OPERATOR_* llevan `operator_id`. Las tablas de agencia (Quotations, AgentCommissions) asumen una sola agencia.
- Plazo corto: hay que reutilizar `packages/ui`, contracts y el diseño existente.

## Opciones
1. Mantener dos apps y dar acceso cruzado: duplica shell, auth, i18n y despliegue, y el operador-agencia salta entre apps.
2. Una app + roles nuevos (OPERATOR_SALES…): rompe los 10 roles inmutables y no expresa qué módulos contrató cada tenant.
3. Una app + módulos por tenant (TenantModules) + matriz rol × módulo + CustomRoles por tenant. **Elegida.**
4. Una app + solo CustomRoles globales: no modela la activación por tenant y depende del SUPER_ADMIN.

## Decisión
- `apps/gestion` (`@borondo/gestion`) en `gestion.borondotours.com` reemplaza a `apps/erp` y `apps/b2b`.
- Grupos de navegación: Agencia (`/agencia/*`), Operador (`/operador/*`), Plataforma (`/plataforma/*`, solo BorondoTours) y rutas comunes. API: `/api/v1/agency|operator|platform/*`.
- `Operators` es la tabla de tenants; `operator_id` = tenant id. BorondoTours es un tenant.
- `TenantModules (AGENCY, OPERATOR)` activa módulos. Permiso efectivo = (⋃ matriz[rol][módulo activo] ∪ allow − deny) ∩ permisos de los módulos activos. Función pura en `packages/domain` con tests obligatorios.
- El tenant sale siempre del token. Repositorios con TenantContext obligatorio. El acceso cross-tenant solo pasa por `/platform/*`, auditado.
- La UI se construye con `@borondo/ui` (React) sobre un único kit (`kit.css` en packages/ui) replicado en Figma. No se usan páginas fig2astro en gestión.

## Consecuencias
Positivas: un shell, una auth, un despliegue. Un operador-agencia usa una sola app. Activar un módulo es un dato, no un rol. El modelo sirve igual para agencias externas.
Negativas: hay que reescribir Spec-F/H/I, Stack §RBAC, Modelo-Datos-Core (tenant en tablas de agencia) y Política de datos. Abre decisiones de negocio (#34-#40). Riesgo de fuga cross-tenant que obliga a tests de aislamiento antes de desplegar. Las funciones de Plataforma deben quedar separadas del módulo Agencia.
Acciones: ver plan de PRs del informe 03; actualizar ADR-Index, ADR-011 (nota en SW4) y steering 01/02/16/17/18.
```

---

## 6. Riesgos y plan incremental

### 6.1 Riesgos principales
1. Fuga entre tenants por implementar la gestión antes que auth/RBAC real (hoy son no-ops). Alto. Mitigación: el PR 3 es una puerta dura.
2. Decisión económica #34 sin resolver: el módulo Agencia para operadores no puede cobrar. Alto. Mitigación: lanzar primero Agencia solo para BorondoTours y Operador para todos.
3. #2 sin resolver retrasa el shell. Medio. Mitigación: los PR 1 y 3 no dependen de #2.
4. Dos sistemas visuales (`glass-surface` vs `bt-glass-std`). Medio. Mitigación: PR 1.
5. Conflicto de interés BorondoTours-agencia vs operador-agencia (datos CRM). Alto reputacional/legal. Mitigación: §3.6 y DPA.
6. Alcance "tipo Odoo" desbordado. Medio. Mitigación: el registry de módulos permite entregar por partes; el informe funcional define el MVP.
7. Fallback SPA de `cdn.yaml` en la distribución compartida rompe Astro estático. Medio. Mitigación: distribución propia para `gestion.*`.

### 6.2 Plan en PRs

| PR | Contenido | Tamaño | Depende de |
|---|---|---|---|
| 0 | ADR-013 (Propuesto), DECISIONES-PENDIENTES #33-#40, nota en ADR-011 SW4, ADR-Index | S | — |
| 1 | Kit único: `packages/ui/src/styles/kit.css` (mover bloque KIT de `fig-runtime.css`), `Button`/`GlassSurface` alineados a `bt-*`, tests de `packages/ui` y `apps/web` en verde, `figma-sync` | M | 0 |
| 2 | `apps/gestion` shell: layout, Sidebar con grupos colapsables (a11y), registry de módulos vacío, i18n, store session/workspace, lint/typecheck/test; retirar `apps/erp` y `apps/b2b` (con confirmación) | M | #2 |
| 3 | Auth y RBAC reales en `services/1-core`: JWT RS256, refresh rotativo, `loadTenantContext`, `requireModule`/`requirePermission`, `effectivePermissions` + `landingFor` en `packages/domain` con tests exhaustivos y property-based; `/me/workspace`; arreglar `onError` y CORS; eliminar las rutas auth duplicadas | L | #1 |
| 4 | Datos: Drizzle `users`, `operators`, `tenant_modules`, `custom_roles` (con `operator_id`) + `drizzle.config.ts` (#32) + migración + seed del tenant Borondo; tests de repositorio cross-tenant | M | 3, #14/#32 |
| 5 | Docs: Spec-F (RF-F01/F01b/F05/F09/§9), Stack §RBAC, APP2/APP3 → APP2-Gestion, Modelo-Datos-Core, Política de datos, steering 01/02/16/17/18, profile.json | M | 0-3 |
| 6 | Módulo Operador F1 (tablero, tours/instancias con PENDING_REVIEW, manifiesto, links de agencia, equipo) sobre `/api/v1/operator/*` | XL → dividir en 3-4 PRs L | 2-4 |
| 7 | Módulo Agencia para tenant Borondo (CRM kanban, cotizaciones, link de pago, comisiones) con `operator_id` en Quotations/AgentCommissions | XL → dividir | 2-4, #35 |
| 8 | Activar Agencia para operadores (`TenantModules`), DPA y política, pantallas de Plataforma para activar módulos | L | 7, #34, #36, #39 |
| 9 | Despliegue `gestion.dev.borondotours.com` (distribución propia), inventario AWS | M | #15, #13 |
| 10 | Bandeja WhatsApp / laboratorio IA (inspiración vocero-crm), Spec-K completo, radar en vivo | F2 | 7-8 |

---

## 7. Qué verifiqué y qué no
- Verificado leyendo archivos: contenido completo de `apps/erp` y `apps/b2b`, middlewares y rutas de `services/1-core`, `services/5-operators/src/app.ts`, `packages/{contracts,db,ui}` (exports, roles, esquemas), `apps/web/src/stores/session.ts`, `apps/web/src/lib/fig/runtime/{auth,ui-kit}.ts` (parcial), `layouts/FigmaPage.astro`, `infra/stacks/cdn.yaml`, `infra/lib/cdn-stack.ts`, `.kiro/factory/profile.json`, Spec-F (RF-F01, F01b, F05, F09, §9), Spec-H §2/§11, Spec-I RF-I01/§endpoints, Spec-G, Spec-K, Modelo-Datos-Core §1/2/8/16/17/23/25, Politica-Datos-Personales, ADR-011, ADR-Index, DECISIONES-PENDIENTES.
- No verificado: comportamiento de RDS Proxy con `set_config` (pinning); el contenido completo de `Frontend-Architecture.md`, `Inventario-Funcionalidades-MVP.md` y `Vision-y-Objetivos.md` (los listé por grep de "4 apps"/erp/b2b, sin leerlos completos); no ejecuté builds ni tests (investigación de solo lectura).
