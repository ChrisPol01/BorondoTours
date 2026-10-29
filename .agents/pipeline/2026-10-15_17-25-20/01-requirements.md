# 01 · Requisitos — Frontend de `apps/gestion` (fusión ERP + B2B), con datos simulados

Fecha: 2026-10-15. Tamaño: XL (dividir en PRs en el diseño). Fuentes: `.agents/tasks/erp-b2b-unificacion-2026-10/`
(`06-decisiones-dueno.md` manda), `04-ux-sidebar-ia.md`, `02-dominio-agencia-operador.md` §4,
`03-arquitectura-tenancy-rbac.md` §2.3/§3.4, steering 02/04/12/15/16/18 y `docs/04-Tech-Design/DESIGN.md`.

## 1. Resumen

Construir solo el frontend de la nueva app de gestión `apps/gestion` (`@borondo/gestion`), que reemplaza a
`apps/erp` y `apps/b2b` (hoy scaffolds idénticos de 7 archivos). Todo funciona con datos simulados en el
cliente: no hay backend, base de datos, autenticación real ni integraciones. La app muestra un shell con
`AppSidebar` accesible y grupos Agencia / Operador / Común / Plataforma, cuyo contenido se calcula con
**módulos habilitados de la organización ∩ permisos del usuario ∩ preferencia de vista del usuario**. Cada
módulo MVP tiene una pantalla base construida con plantillas reutilizables. Las piezas visuales que falten se
agregan una sola vez a `packages/ui` (con tests) para que Figma las replique después con `figma-sync`.
`apps/web` (B2C) no se modifica.

Orden del dueño (D8): frontend → MER → backend → AWS. Este trabajo es el primer paso; sus tipos y datos
simulados deben servir de insumo al MER.

## 2. Supuestos (a validar en la revisión de diseño)

- **S1. Rutas.** Se usan exactamente las del pedido: `/inicio`, `/agencia/{modulo}`, `/operador/{modulo}`,
  `/comun/{modulo}`, `/plataforma/{modulo}`, sin prefijo `/gestion` (la app vive en su propio host). Esto
  reemplaza la variante "comunes en la raíz" de `03` §2.3 y la de `/gestion/...` de `04` §3.3. `/` redirige a la
  ruta de aterrizaje del usuario simulado.
- **S2. Astro estático (D7, decisión #2 opción a).** `output: 'static'`, una página `.astro` por módulo con
  island React. El detalle de un registro se abre en panel lateral o con `?id=` en query string; no se generan
  rutas dinámicas por registro.
- **S3. i18n.** `apps/web` no usa el paquete `i18next`: tiene un resolvedor propio con la forma de i18next
  (`apps/web/src/lib/i18n/{index,resolve}.ts`, claves `ns:key`, store de idioma con nanostores). La gestión
  sigue el mismo enfoque sin añadir dependencias. No se modifica `apps/web`; si se reutiliza el código, se
  extrae o se replica según decida el diseño, sin tocar el B2C.
- **S4. Plantillas.** El pedido habla de "7 plantillas"; `04` §7 define T1 Lista, T2 Tablero, T3 Calendario,
  T4 Detalle (panel lateral / página), T5 Formulario/wizard, T6 Panel (KPIs) y T7 En vivo. El MVP usa T1–T6.
  T7 (Radar) queda fuera porque Operación en campo no está en el MVP.
- **S5. Común siempre está.** Notificaciones y Mi vista son para todos los usuarios con acceso a la app, y
  Mi vista no se puede ocultar (si no, el usuario no podría deshacer su preferencia). Por eso el caso "un solo
  grupo visible → aplanar" se da cuando el usuario oculta, desde Mi vista, todos los módulos de los demás
  grupos menos uno, o en un usuario simulado definido para eso. La lógica se prueba con tests unitarios en
  cualquier caso.
- **S6. Ocultar no es quitar permiso.** Un módulo que el usuario ocultó en Mi vista no aparece en el sidebar
  ni en Ctrl/Cmd+K, pero su URL sigue funcionando si tiene permiso. Un módulo sin permiso o no contratado
  muestra el estado "sin permiso" con enlace a su ruta de aterrizaje.
- **S7. Datos de ejemplo.** Organizaciones simuladas:
  - **BorondoTours** (`is_platform_owner = true`; módulos Común, Agencia, Operador y Plataforma) con **2
    companies** ficticias para ejercitar el selector (p. ej. la empresa colombiana y una filial ficticia).
  - **Un operador de ejemplo** (solo Común + Operador, 1 company, sin Plataforma).
  - Nombres, NIT, RNT, teléfonos y correos son ficticios y evidentemente de prueba. Sin datos reales.
- **S8. Usuarios simulados.** Como mínimo: en BorondoTours, SUPER_ADMIN, GERENTE, AGENT y COORD; en el
  operador de ejemplo, OPERATOR_ADMIN, OPERATOR_COORD y OPERATOR_AGENT. Sus permisos por defecto salen de la
  matriz de `03` §3.4, adaptada a los módulos MVP de este documento. OPERATOR_GUIDE, OPERATOR_DRIVER y CLIENT no
  usan esta app: si se simulan, ven un aviso que los remite a App 4 (`/field`) o al B2C.
- **S9. Modo demo.** El selector de usuario simulado solo existe cuando el modo demo está activo (variable de
  entorno pública o equivalente que defina el diseño). En la demo está activo por defecto. No hay tokens.
- **S10. Persistencia local.** Solo preferencias de interfaz en `localStorage`: estado del sidebar
  (riel y grupos abiertos), Mi vista (módulos ocultos y orden), usuario simulado activo, company activa, tema e
  idioma. Nunca PII ni tokens. Las claves llevan versión y si su contenido es inválido se ignoran sin romper.
- **S11. Interacciones simuladas.** Las acciones (mover lead, crear cotización, subir documento, aprobar tour,
  activar módulo) cambian el estado en memoria y se pierden al recargar, salvo las preferencias de S10. La carga
  de datos pasa por TanStack Query sobre funciones simuladas con la misma forma que tendrá la API
  (`{data,error,meta}`), para poder cambiar a la API real sin tocar las pantallas.

## 3. Requisitos funcionales

### RF-1. Paquete y workspace
1. Crear `apps/gestion` con nombre `@borondo/gestion`, incluido en el workspace (`apps/*` ya lo cubre).
2. Scripts: `dev` (Astro en el puerto **3003**), `build`, `lint` (ESLint, `--max-warnings 0`), `typecheck`
   (`astro check`) y `test:run` (vitest). También `test` en modo watch, como en `apps/web`.
3. Stack: Astro 5, `@astrojs/react`, React 19, Tailwind 4 (`@tailwindcss/vite`), Nanostores
   (`@nanostores/react`), TanStack Query, `lucide-react`, `@borondo/ui`, TypeScript estricto. Las dependencias
   de desarrollo (ESLint, `eslint-plugin-jsx-a11y`, vitest, Testing Library, jsdom, fast-check) ya están
   aprobadas en `apps/web`/`packages/ui` y se usan con las mismas versiones. Cualquier otra dependencia se
   justifica en el informe final.
4. `apps/erp` y `apps/b2b` no se borran ni se modifican. `apps/web` no se modifica.
5. Todas las páginas llevan `noindex` y el skip link "Saltar al contenido principal" como primer elemento
   enfocable, apuntando a `<main id="main" tabindex="-1">`.

### RF-2. Modelo de tenant simulado (D10, D11)
1. Tipos TypeScript para `Organization` (id, nombre comercial, `is_platform_owner`, plan, módulos habilitados
   con estado), `Company` (empresa legal: nombre, NIT, RNT, país, estado de cumplimiento) con relación 1..N, y
   `User` simulado (organización, rol de los 10, companies con acceso, permisos `recurso:accion`).
2. Módulos por defecto de toda organización: Común, Agencia y Operador. Plataforma solo si
   `is_platform_owner = true`; el código nunca compara con el nombre "BorondoTours".
3. Un módulo puede estar habilitado, no habilitado o suspendido (solo lectura) para una organización.
4. **Selector de company activa** en la cabecera o el pie del sidebar, visible solo si el usuario tiene acceso a
   más de una company. Cambiarla actualiza los datos de las pantallas que dependen de la company.

### RF-3. Registro declarativo de módulos
1. Un solo archivo define cada módulo: `id`, grupo (`agencia | operador | comun | plataforma`), ruta, icono
   (lucide), clave i18n, permiso requerido y, si aplica, la fuente del contador de pendientes.
2. Ese registro alimenta el sidebar (expandido, riel, drawer móvil), Ctrl/Cmd+K, Mi vista, la guarda de rutas y
   la página de aterrizaje. No hay lógica por rol en el JSX.

### RF-4. Lógica de visibilidad (función pura y probada)
1. `visible(módulo) = habilitado en la organización ∧ permitido al usuario ∧ no oculto en su preferencia`.
   El orden dentro de cada grupo sigue la preferencia del usuario y, si no hay, el del registro.
2. Un grupo se muestra si tiene al menos un módulo visible.
3. Plataforma nunca es visible si la organización no es dueña de la plataforma, aunque el usuario tenga
   permisos de plataforma o la preferencia lo pida.
4. La preferencia solo resta: nunca muestra un módulo no habilitado o no permitido.
5. Módulo suspendido: visible con candado y motivo accesible; su pantalla se muestra en solo lectura.
6. Ruta de aterrizaje por usuario (adaptación de `03` §3.4 `landingFor`) y caída a `/inicio` si la ruta
   prevista no es visible.

### RF-5. `AppSidebar` y shell (componentes nuevos en `packages/ui`)
1. **Disclosure WAI-ARIA**: cada grupo es un `<button type="button" aria-expanded aria-controls>`; la lista
   cerrada lleva `hidden`; enlaces con `aria-current="page"` en la ruta exacta (y `aria-current="true"` en el
   módulo padre cuando se está en un detalle). Sin rol `menu`. `<nav>` con `aria-label` traducido.
2. Grupos independientes (no acordeón exclusivo). Al cargar se abre siempre el grupo de la ruta activa; los
   demás toman el estado guardado (S10).
3. Con un solo grupo visible no se dibuja el botón: los ítems quedan planos bajo un rótulo no interactivo.
4. Módulo no contratado o sin permiso: oculto (no se dibujan ítems deshabilitados por rol).
5. **Riel colapsado a iconos** (botón con etiqueta fija y `aria-expanded`; atajo Ctrl+\). En el riel, cada
   grupo es un icono que abre un flyout con sus módulos; Escape lo cierra y devuelve el foco. Nombre accesible
   por texto oculto visualmente, no por `title`. Tooltip en hover y foco, descartable con Escape (1.4.13).
6. **Móvil y tablet (< 1024 px)**: barra superior con botón "Menú" (`aria-expanded`) que abre el mismo árbol en
   `AccessibleDialog` tipo drawer (trampa de foco, Escape, el foco vuelve al botón).
7. **Contador de pendientes** por módulo (datos simulados): número dentro del enlace, nombre accesible completo
   ("CRM, 3 pendientes"), "99+" desde 100, tono neutral/warning/danger con número (nunca solo color). Un grupo
   cerrado muestra la suma de sus pendientes. Se implementa como variante de `Badge`, no componente aparte.
8. **Buscador Ctrl/Cmd+K** (y botón "Buscar"): `AccessibleDialog` con combobox + listbox
   (`aria-activedescendant`), que lista solo módulos visibles y los últimos visitados; Enter navega. No hay
   atajos de una sola tecla.
9. **Ítem activo**: pill sólida `--semantic-action-primary` (turquesa) con texto e icono
   `--semantic-text-on-action`, peso 600, contraste ≥ 3:1 para el indicador y ≥ 4.5:1 para el texto en los 3 temas.
10. Hover con fondo de vidrio; foco con outline 2 px `--semantic-focus` y offset 2 px. Nada se abre al pasar el mouse.
11. Objetivos táctiles ≥ 44 × 44 px. Con `prefers-reduced-motion: reduce` no hay animación de alto, de ancho del
    riel ni del indicador.
12. Estado de carga: skeleton con la forma de los ítems y `aria-busy` en la `<nav>`.
13. Pie: perfil (inicial + nombre de organización), selector de tema (Colorido, Claro, Oscuro), idioma (es/en) y,
    en modo demo, selector de usuario simulado.
14. El componente recibe los ítems ya resueltos y los textos ya traducidos (regla de `packages/ui/src/index.ts`):
    no conoce roles, organizaciones ni i18n.

### RF-6. Piezas de `packages/ui` (sin duplicar)
1. Reutilizar tal cual lo existente: `Button`, `Badge`, `Tabs`, `Chip`, `Input`, `Checkbox`, `RadioGroup`,
   `AccessibleDialog`, `Banner`/`Toast`, `Skeleton`, `Spinner`, `StatusMessage`, `Card`/`GlassSurface`,
   `Eyebrow`/`Heading`/`Text`, `useFocusTrap`.
2. Agregar solo lo que falta (lista mínima; el diseño fija nombres y props): `AppShell`, `AppSidebar` (con
   `NavGroup`/`NavItem` internos o exportados), `PageHeader`/`SectionHeader` (eyebrow + título + acciones;
   equivale a `sectionHead()` del kit B2C), `StatCard` (equivale a `statCard()`), `DataTable` (orden con
   `aria-sort`, "Cargar más" por cursor, tarjetas en móvil), `FilterBar`, `KanbanBoard` (columnas y tarjetas con
   acción "Mover a…"), calendario de recursos/ocupación, y la variante `count` de `Badge`.
3. **Estado vacío**: se resuelve ampliando `StatusMessage` (opciones vidrio y alineación del kit B2C), no con un
   componente `EmptyState` nuevo. El drawer ancho del panel lateral es una variante de `AccessibleDialog`.
4. Cada pieza nueva: exportada desde `packages/ui/src/index.ts`, solo tokens semánticos (sin hex), vidrio
   estándar, funciona en los 3 temas, con tests (render, roles/atributos ARIA, teclado donde aplique).
5. Los cambios en `packages/ui` no deben romper `apps/web` (sigue en 0 errores de typecheck).

### RF-7. Plantillas de pantalla
Plantillas reutilizables (componentes de composición en `apps/gestion`, o en `packages/ui` si el diseño lo
justifica) que todas las pantallas usan, con `PageHeader` (un único `<h1>`), y los estados de DESIGN §14:
carga (skeleton), vacío (`StatusMessage` con acción), error recuperable (reintentar), solo lectura y sin
permiso. Mínimo: T1 Lista con filtros, T2 Tablero kanban, T3 Calendario, T4 Detalle en panel lateral,
T5 Formulario/wizard, T6 Panel de KPIs.

### RF-8. Módulos MVP (pantalla base con datos simulados)

| Grupo | Módulo | Plantilla | Contenido mínimo |
|---|---|---|---|
| — | Inicio (`/inicio`) | T6 | Widgets según los grupos visibles: KPIs de agencia, KPIs de operador, alertas de cumplimiento |
| Agencia | Inicio agencia | T6 | Ventas, conversión, leads activos, comisión pendiente |
| Agencia | CRM | T2 + T4 | Kanban de etapas (incluye Perdido); tarjeta con "Mover a…"; arrastrar es opcional; cambio anunciado con `aria-live="polite"`; detalle del lead en panel lateral con timeline |
| Agencia | Clientes | T1 + T4 | Lista con búsqueda/filtros y ficha en panel lateral |
| Agencia | Cotizaciones y ventas | T1 + T5 | Lista por estado; wizard de nueva cotización; acción "Venta rápida" en la cabecera; link de pago simulado (sin OnePay.la real) |
| Agencia | Catálogo | T1 | Tours propios y de operadores con contrato; cupos disponibles; tarifa neta vs pública |
| Agencia | Comisiones | T1 + T6 | Mis comisiones / del equipo según permiso; estado de liquidación |
| Agencia | Bandeja multicanal | Maqueta 3 columnas | Conversaciones (con filtro por canal) · hilo · ficha de contacto/lead; canales WhatsApp e Instagram con icono y texto; acción "Agendar en calendario" y "Vincular a lead" simuladas; envío solo local |
| Operador | Inicio operador | T6 | Ocupación, próximas salidas, liquidación pendiente |
| Operador | Inventario | T1 + T3 + T4 | Tours (con estado PENDING_REVIEW/PUBLISHED) e instancias con cupos (calendario de ocupación); indicador de tour administrado por BorondoTours en nombre del operador (D3) |
| Operador | Manifiesto | T1 | Pasajeros por instancia; confirmar pago de agencia (simulado); exportar deshabilitado o simulado |
| Operador | Distribución | T1 | AgencyLinks y agencias aliadas con % fijo de reventa del operador (D2) |
| Operador | Planificación mínima | T3 | Asignar guía/conductor/vehículo a una salida con aviso de conflicto |
| Operador | Flota | T1 | Vehículos con documentos y vencimientos |
| Operador | Finanzas | T1 + T6 | Liquidaciones en solo lectura; `collection_mode` (PLATFORM_GATEWAY / OWN_GATEWAY) visible (D1.1) |
| Común | Perfil de empresa | T5 | Datos de la organización y sus companies; datos fiscales bloqueados en solo lectura |
| Común | Equipo y permisos | T1 + T4 | Miembros, rol, companies con acceso y permisos por módulo (edición simulada, solo para admins) |
| Común | Documentos y cumplimiento | T1 | Documentos por company (RNT, Cámara de Comercio, pólizas…); subida simulada; estados de validación por IA: Pendiente · En validación IA · Validado · Rechazado · Requiere revisión humana; vigencia; alerta y aviso de que sin RNT validado no se puede enviar tours a revisión (D6) |
| Común | Notificaciones | T1 | Bandeja con leídas/no leídas |
| Común | Mi vista | T5 | Ocultar/mostrar y ordenar los módulos permitidos por grupo (con botones, no solo arrastrar); restablecer; vista previa del sidebar |
| Plataforma | Revisión de tours | T1 + T4 | Cola PENDING_REVIEW y solicitudes de edición; aprobar/rechazar con razón (simulado) |
| Plataforma | Organizaciones y módulos | T1 + T4 | Organizaciones con plan, companies y módulos habilitados; activar/suspender módulos (simulado) y efecto inmediato en el sidebar si se cambia a un usuario de esa organización |

### RF-9. Modo demo y guarda de rutas
1. Selector de usuario simulado (RF-5.13) que cambia organización, rol y permisos; el sidebar, Ctrl/Cmd+K, las
   pantallas y la company activa se recalculan sin recargar o tras una recarga controlada.
2. Si el usuario activo no puede ver la ruta actual: estado "sin permiso" con enlace a su aterrizaje.
3. Las guardas son solo de UX; el informe debe decir que la autorización real será del backend.

### RF-10. i18n, temas y marca
1. Ningún texto visible suelto: todo por clave `ns:key`, con catálogos `es` (base) y `en` completos para lo
   construido. Clave faltante: cae a `es` y luego a la clave (mismo criterio que `apps/web`).
2. Tres temas (Colorido, Claro, Oscuro) con los tokens de `packages/ui/src/styles/{tokens,theme}.css`; Sora en
   títulos e Inter en cuerpo; vidrio estándar; sin hex en componentes ni pantallas.
3. Copy según el tono de voz de steering 12 (español claro, sin Borondo Coins: Spec-E en pausa).

## 4. Requisitos no funcionales

- **Accesibilidad WCAG 2.2 AA**: teclado completo, foco visible y no tapado por barras fijas (2.4.11),
  objetivos ≥ 44 px, `prefers-reduced-motion`, alternativa de un solo puntero al arrastrar (2.5.7), contraste
  ≥ 4.5:1 en texto y ≥ 3:1 en componentes, estados nunca solo por color, modales con trampa de foco.
- **Seguridad y privacidad**: sin PII real ni secretos en código, datos simulados ni `localStorage`; sin
  `console.log`; HTML solo vía SafeHtml (no se espera HTML del backend en esta fase).
- **Código**: TypeScript strict sin `any`, funciones ≤ 50 líneas, identificadores en inglés, comentarios de
  reglas de negocio en español, un archivo una responsabilidad.
- **Rendimiento**: un island por página; el JS de un grupo no se carga en las páginas de otro grupo.
- **Sustituibilidad**: las pantallas consumen datos solo por hooks de TanStack Query sobre una capa de datos
  simulada; reemplazarla por la API no debe tocar los componentes.

## 5. Criterios de aceptación

1. `apps/gestion` existe como `@borondo/gestion`, `pnpm --filter @borondo/gestion dev` sirve en el puerto 3003 y
   `apps/erp`, `apps/b2b` y `apps/web` no tienen cambios en git.
2. `pnpm --filter @borondo/gestion typecheck`, `lint`, `test:run` y `build` terminan con código 0 (lint con
   0 warnings).
3. `pnpm --filter @borondo/ui typecheck` y `pnpm --filter @borondo/ui test` terminan con código 0.
4. `pnpm --filter @borondo/web typecheck` sigue con 0 errores.
5. Existe un único archivo de registro de módulos y el sidebar, Ctrl/Cmd+K, Mi vista y la guarda lo consumen
   (verificable por búsqueda: ninguna lista de módulos duplicada).
6. Tests unitarios de la visibilidad cubren, como mínimo: (a) módulo habilitado + permitido + no oculto →
   visible; (b) no habilitado → oculto aunque haya permiso; (c) sin permiso → oculto aunque esté habilitado;
   (d) oculto por preferencia → no visible, pero su ruta sigue accesible; (e) Plataforma oculta si
   `is_platform_owner = false` aunque haya permiso y preferencia; (f) preferencia que pide un módulo no
   permitido no lo muestra; (g) orden de la preferencia respetado; (h) grupo sin ítems no se dibuja;
   (i) suspendido → visible en solo lectura; (j) ruta de aterrizaje cae a `/inicio` si no es visible.
7. Un test property-based (fast-check) verifica que, para cualquier combinación de módulos, permisos y
   preferencias, el conjunto visible ⊆ habilitados ∩ permitidos.
8. Tests de accesibilidad de `AppSidebar` comprueban: botón por grupo con `aria-expanded` que cambia con
   Enter/Espacio y `aria-controls` hacia una lista con `hidden` cuando está cerrada; `aria-current="page"` en el
   enlace activo y solo en uno; el grupo de la ruta activa abierto al montar; con un solo grupo no hay botón de
   grupo; nombre accesible del contador ("…, N pendientes" y "99+"); Escape cierra el flyout/drawer y devuelve
   el foco al disparador; el estado guardado en `localStorage` no contiene PII y se ignora si es inválido.
9. Tests de `packages/ui` para cada pieza nueva (render, ARIA y teclado donde aplique); `KanbanBoard` mueve una
   tarjeta con "Mover a…" sin arrastrar y anuncia el cambio.
10. Con el usuario SUPER_ADMIN de BorondoTours se ven los grupos Agencia, Operador, Común y Plataforma, y
    aparece el selector de company (2 companies). Con OPERATOR_ADMIN del operador de ejemplo se ven solo
    Operador y Común, sin Plataforma ni Agencia, y sin selector de company.
11. Desactivar un módulo de una organización en Plataforma › Organizaciones (simulado) lo oculta del sidebar y
    de Ctrl/Cmd+K para los usuarios de esa organización.
12. Ocultar y reordenar módulos en Común › Mi vista cambia el sidebar, persiste tras recargar y "Restablecer"
    vuelve al orden del registro.
13. Cada módulo de la tabla RF-8 tiene ruta propia, `<h1>` único, datos simulados y al menos los estados cargando
    y vacío alcanzables; la Bandeja muestra 3 columnas en escritorio con conversaciones de WhatsApp e Instagram.
14. Documentos y cumplimiento muestra los 5 estados de validación por IA con texto e icono (no solo color).
15. No hay hex sueltos en `apps/gestion/src` ni en las piezas nuevas de `packages/ui` (búsqueda de `#[0-9a-f]{3,8}`
    en archivos de componentes, salvo comentarios), ni strings visibles sin clave i18n, ni `any`, ni `console.log`.
16. Cambiar entre los 3 temas y entre es/en desde el pie del sidebar actualiza toda la interfaz.
17. El informe final lista las dependencias añadidas (con justificación si alguna no estaba ya en el monorepo) y
    las piezas nuevas o variantes de `packages/ui` para `figma-sync`, y dice qué se verificó y qué no (p. ej.
    contraste real en navegador y prueba con lector de pantalla quedan como verificación manual).

## 6. Fuera de alcance

- Backend, MER/Drizzle, API, autenticación y RBAC reales, despliegue en AWS (siguientes fases según D8).
- Integraciones reales: OnePay.la, WhatsApp Cloud API, Meta Graph, Textract/Bedrock, RNT/RUES, Siigo.
- Planes, suscripción y facturación de BorondoTech (D5) más allá de mostrar el plan de la organización.
- Liquidación real y fee transaccional (D1); solo se muestra `collection_mode`.
- Transferencia real de un tour de BorondoTours al operador (D3); solo el indicador.
- Operación en campo (Radar, GPS, check-in), Spec-K completo, Proveedores, PQRS, gamificación, Ghost Login, Ads,
  Borondo Coins, reportes consolidados, plantilla T7.
- Tests E2E con Playwright y axe en navegador (se recomiendan como paso siguiente).
- Ejecutar `figma-sync` (solo se entrega la lista de piezas), crear ADR-013 o Spec-M, actualizar steering 17/18.
- Retirar `apps/erp` y `apps/b2b`; cualquier cambio en `apps/web`; commits y push.
