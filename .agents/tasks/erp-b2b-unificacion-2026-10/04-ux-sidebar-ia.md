# 04 · UX/A11y — Arquitectura de información y sidebar de la app de gestión unificada (Agencia + Operador)

Rol: uiux-a11y (fábrica SDLC). Investigación de solo lectura. Fecha: 2026-10. Sin PII.

## 0. Respuesta corta

1. **La IA cabe en 3 grupos visibles para clientes (Común, Agencia, Operador) y 1 interno (Plataforma, solo BorondoTours).** Son 19 módulos en total. Cada uno sale de un RF ya escrito (Spec-G/H/I/K), salvo 3 que son supuestos y van marcados (Clientes, Bandeja, Reservas de agencia).
2. **El sidebar que pide el dueño es el patrón _disclosure navigation_ del WAI-ARIA APG**: un `<button aria-expanded>` por grupo con una lista de enlaces debajo. No se usa `role="menu"` ni `role="tree"`. Los grupos son independientes (los dos pueden estar abiertos), el grupo de la ruta activa se abre solo y el estado se recuerda. Con un solo grupo **no se dibuja el botón de grupo** y los ítems quedan planos.
3. **Módulo no contratado = oculto**. El candado se usa solo cuando el módulo está contratado pero bloqueado por el estado del tenant (PENDING_REVIEW, SUSPENDED). El catálogo de módulos para activar vive en Ajustes → Módulos.
4. **Hay un fallo de contraste en el estado activo que define DESIGN §18** (pill Blanco Niebla 16 % + icono Turquesa). Estimo unos 2,9:1 en Colorido y unos 2,3:1 en Claro. Eso no pasa WCAG 1.4.11 cuando el icono es el único indicador, que es lo que pasa en el riel colapsado. La solución reutiliza un patrón que ya existe: la pill Turquesa sólida con texto `--semantic-text-on-action` del navbar público (`.bt-nav-indicator`, `fig-runtime.css` l. 401-422). Da unos 7,7:1 y funciona igual en los 3 temas.
5. **Riesgo de "melcocha":** hoy conviven dos sistemas de componentes. Uno es el kit vanilla `ui-kit.ts`, limitado a `.fig-stage` y pensado para el runtime B2C exportado de Figma. El otro es `@borondo/ui`, en React con Tailwind. La app de gestión (Astro + islands React) debe consumir **solo `@borondo/ui`**. Las piezas del kit que necesita (sectionHead, statCard, emptyState, vidrio) se portan a `@borondo/ui` con la misma especificación visual, no se vuelven a inventar. `AppSidebar` ya figura en el Catálogo como componente compartido pero no existe en código.
6. **Ctrl+K sí conviene.** Con ~20 módulos y usuarios que trabajan como agencia y como operador, el buscador de módulos y acciones es lo que usan Linear, Zoho (QuickNav) y HubSpot para que la navegación escale. En F1 solo navega; las acciones llegan en F2.
7. **Bastan 7 plantillas de pantalla** (lista, tablero, calendario, detalle, formulario/wizard, panel, en vivo) para cubrir los 19 módulos sin diseñar pantalla por pantalla.

---

## 1. Evidencia del repositorio

| Hallazgo | Fuente |
|---|---|
| ERP y B2B son scaffold: solo `Base.astro` con skip link y `index.astro`. No hay navegación. | `apps/erp/src/layouts/Base.astro`, `apps/b2b/src/layouts/Base.astro`; steering 17 |
| `AppSidebar` (280 px, fijo) está previsto como compartido ("ERP y B2B reutilizan `AppSidebar` con otra navegación por rol"), pero no está en `@borondo/ui`. | `docs/04-Tech-Design/Catalogo-Componentes-UI.md` §Layout; `packages/ui/src/index.ts` (no lo exporta) |
| El sidebar privado del B2C no es un componente: `chrome.ts` lo detecta en el HTML exportado de Figma (texto "Ver perfil", ancho ≤ 320 px). Solo lo fija con `bt-sidebar-fixed` y, si no cabe, lo deja de fijar. No tiene `aria-current` ni disclosure. | `apps/web/src/lib/fig/runtime/chrome.ts` `findSidebar`/`setupSidebar` (l. 146-169); `fig-runtime.css` l. 505 |
| Ancho del sidebar: DESIGN dice 280 + 24 de separación (contenido en x=328); el comentario del export dice 272. | `DESIGN.md` §19; `chrome.ts` l. 150 |
| Sidebar con sesión: riel colapsable a iconos en 3 zonas (logo · navegación · perfil con menú). En móvil, barra superior más barra inferior de 5. | `DESIGN.md` §13 |
| Estado activo actual: pill Blanco Niebla 16 % + icono Turquesa; cápsulas Azul Profundo 92 % + blur. | `DESIGN.md` §18 |
| Indicador del navbar público: pill `--semantic-action-primary` con texto `--semantic-text-on-action`. | `fig-runtime.css` `.bt-nav-indicator` l. 401-411, `.is-indicated` l. 414-422 |
| Disclosure ya implementado en el runtime (`aria-expanded`, `aria-controls`, Escape devuelve el foco, flechas). | `apps/web/src/lib/fig/runtime/menu.ts` `bindDropdown` |
| Kit vanilla limitado a `.fig-stage`/`.bt-overlay`: `bt-btn` (primary/glass/link), `bt-section-head`, `bt-stat`, `bt-empty`, `bt-glass-std`, `bt-on-strong`, `bt-review-*`. | `ui-kit.ts`; `fig-runtime.css` bloque "KIT DE COMPONENTES" (l. 1243+) |
| `@borondo/ui` (React) ya tiene Button (primary/cta/secondary/ghost/danger; sm/md/lg, 44 px de área táctil en sm), Badge (7 tonos), Tabs (con `counts`), Chip (`aria-current` si es enlace), AccessibleDialog (dialog/drawer), Toast/Banner, Skeleton, StatusMessage, Card/GlassSurface, `useFocusTrap`. | `packages/ui/src/index.ts`, `primitives/Button.tsx`, `primitives/Badge.tsx` |
| Tokens por tema: foco Turquesa (Colorido/Oscuro) y `#007aff` (Claro); `sold-out` `#f97066` (Colorido/Oscuro) y `--derived-danger` (Claro), con `text-on-danger` propio. | `packages/ui/src/styles/tokens.css` l. 28-63, 210, 212 |
| No hay modelo de "tenant con módulos": `Operators` no tiene tipo ni módulos activables. | `docs/03-Knowledge/Modelo-Datos-Core.md` §2 |
| Roles: `OPERATOR_AGENT` es soporte de solo lectura. AGENT y GERENTE son internos de BorondoTours. No hay roles de ventas para un operador que vende como agencia. | `Spec-I` RF-I01; `Spec-H` RF-H01 |
| Rutas actuales por app: `/erp/*` y `/operador/*`, más el destino post-login por rol. | `Spec-H` RF-H01; `APP2` Flujo A |
| El sidebar del ERP está pensado con un widget Top 3 del leaderboard. | `APP2` Flujo D |
| El Radar pide tarjetas de urgencia que "parpadean" con alerta sonora. | `APP3` Flujo E; `Spec-I` RF-I13 |
| El Kanban del CRM usa arrastrar y soltar. | `Spec-H` RF-H02 |
| Los operadores no tienen canal directo con los clientes B2C (solo el chat tripartito). | `APP3` Flujo F |

---

## 2. Investigación externa (resumen y fuentes)

- **WAI-ARIA APG, disclosure navigation:** para navegación de sitio, botones disclosure con listas de enlaces, sin el rol `menu`, porque la navegación típica no necesita el teclado de menú/menubar. Tab recorre botones y enlaces. Enter/Espacio abre o cierra el grupo. Escape cierra y devuelve el foco al botón. Flechas, Home y End son opcionales y no reemplazan a Tab. `aria-current="page"` va en el enlace activo. Escape es necesario para cumplir 1.4.13. [APG Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/). El APG también considera el patrón disclosure más adecuado que `tree` para la mayoría de los sitios: [APG Navigation Treeview](http://www.w3.org/TR/wai-aria-practices-1.1/examples/treeview/treeview-2/treeview-2a.html). Variante enlace + botón: [Adrian Roselli](https://adrianroselli.com/2019/06/link-disclosure-widget-navigation.html).
- **Shopify Polaris:** la navegación principal es una lista de enlaces en el sidebar del frame de la app ([Navigation](https://polaris-react.shopify.com/components/deprecated/navigation)). El detalle de un recurso va en dos columnas, la principal a la izquierda y la secundaria a la derecha ([Resource details layout](https://polaris-react.shopify.com/patterns/resource-details-layout)). El estado vacío de página completa explica y guía al siguiente paso ([Empty state](https://polaris.shopify.com/components/empty-state)).
- **Linear:** el sidebar se colapsa con un atajo o desde la paleta de comandos ([changelog](https://linear.app/changelog/unpublished-collapsible-sidebar)) y se personaliza (ocultar u ordenar ítems) ([changelog 2024-12](https://linear.app/changelog/2024-12-18-personalized-sidebar)).
- **Notion:** cada sección del sidebar se colapsa al pulsar su nombre, y el sidebar entero se muestra u oculta con Ctrl+\ ([ayuda](https://www.notion.com/help/navigate-with-the-sidebar), [guía](https://www.notion.com/help/guides/the-best-way-to-set-up-your-teams-sidebar-for-clear-organization)).
- **HubSpot:** pasó la navegación global a un sidebar izquierdo para poder crecer en módulos. La comunidad reporta molestia cuando se despliega solo al pasar el mouse ([blog de producto](https://product.hubspot.com/blog/new-hubspot-nav), [comunidad](https://community.hubspot.com/t/tool-bar-on-the-left-side-of-the-screen/120632)). Conclusión para nosotros: **nada se abre solo al pasar el mouse.**
- **Odoo:** el núcleo usa una cuadrícula de apps y un menú superior por app. Los módulos de la comunidad que agregan sidebar ofrecen versión grande, pequeña u oculta, y navegación de 3 niveles ([muk_web_appsbar](https://apps.odoo.com/apps/modules/17.0/muk_web_appsbar), [navbar_reborn](https://apps.odoo.com/apps/modules/19.0/navbar_reborn)).
- **Zoho One:** un sidebar universal para cambiar de app y ver las recientes ([video](https://www.zoho.com/one/videos/save-time-with-the-zoho-one-universal-sidebar.html)), más QuickNav por atajo para saltar entre apps ([blog](https://prewww.zoho.com/blog/one/why-navigation-breaks-down-in-unified-software-and-how-quicknav-fixes-it.html)).
- **WCAG 2.2:** [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (24 px AA; el proyecto exige 44), [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [3.2.6 Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), [2.1.4 Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [2.3.1 Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

> El contenido de las fuentes se reformuló para cumplir las restricciones de licencia.

**Qué tomamos de cada referencia:** de Odoo, Zoho y HubSpot, módulos agrupados en un sidebar izquierdo y un buscador global. De Notion y Linear, secciones colapsables por nombre, un atajo de colapso y la preferencia recordada. De Polaris, una plantilla de recurso con lista, detalle de 2/3 + 1/3 y estado vacío. Ninguna de ellas abre secciones al pasar el mouse.

---

## 3. Arquitectura de información

### 3.1 Reglas de visibilidad (una sola fuente)

- Un ítem se ve si se cumplen las tres condiciones: `tenant.modules ∋ grupo` (agencia/operador), el módulo está habilitado para el tenant y el rol tiene el permiso del módulo.
- Un grupo se ve si tiene al menos un ítem visible.
- La navegación se arma desde un **registro declarativo único** (`nav-registry`): `id`, `group`, `icon` (lucide), `route`, `i18nKey`, `requires: {module, permission}`, `counter?`. Ese mismo registro alimenta el sidebar, el riel, la hoja móvil, la barra inferior y Ctrl+K. Nada se escribe por rol en el JSX.
- **Dependencias que no resuelve este rol:** hace falta un modelo de tenant con módulos (no existe en `Modelo-Datos-Core`, va para data-modeler) y roles de ventas por tenant para operadores que venden (hoy AGENT y GERENTE son internos, va para el RBAC). El sidebar solo consume permisos ya resueltos.

### 3.2 Grupos y módulos

Leyenda: **[S]** = supuesto, no está en las specs.

**Común** (sin botón de grupo, siempre arriba y abajo)
| Módulo | Contenido | RF |
|---|---|---|
| Inicio | Panel con widgets según los grupos activos: KPIs de agencia (H15), KPIs de operador (I02), checklist de activación (I18a), metas (H14) | H15, I02, I03, I18a, H14 |
| Reportes | Pestañas por grupo: comercial, operativo (K-RF11), finanzas del operador (I23-I24), consolidado de Plataforma (H22) | K-RF11, H22, I23, I24 |
| Ajustes (abajo) | Perfil de empresa y documentos (I21), usuarios y roles (I18), regiones (K-RF12), privacidad GPS (I20), **Módulos** (catálogo para activar) [S], integraciones | I18, I20, I21, K-RF12 |
| Ayuda (abajo) | Soporte en la misma posición en toda la app (3.2.6) | — |

**Agencia** (si el tenant vende)
| Módulo | Contenido | RF |
|---|---|---|
| CRM | Pipeline kanban (mi pipeline / equipo), propiedad del lead, venta colaborativa | H02-H05, H16 |
| Cotizaciones | Lista, nueva cotización, aprobación de descuentos, link mágico y envío | H06, H06b, H07, H08 |
| Clientes [S] | Contactos del tenant (no los clientes B2C de BorondoTours), importación CSV (estructura de vocero-crm). Ley 1581: datos mínimos y cifrados | H06 (buscar/crear cliente) |
| Reservas [S] | Reservas vendidas por la agencia (`source: AGENT_QUOTE`), con estado | H09 |
| Comisiones | Mis comisiones (H11); liquidación del período (H17, GERENTE) | H10, H11, H17 |
| Rendimiento | Metas y ranking del equipo (H13, H14) | H13, H14 |
| Bandeja [S, F2] | Conversaciones WhatsApp con sus propios leads (vocero-crm). **Nunca** con clientes B2C de BorondoTours: el canal con ellos es el chat tripartito (APP3 F) | — |

"Venta rápida" (H24) **no es un ítem del menú**. Es la acción principal en la cabecera de CRM y Cotizaciones y una acción de Ctrl+K, para que el menú no crezca.

**Operador** (si el tenant opera tours)
| Módulo | Contenido | RF |
|---|---|---|
| Radar | Tours del día, manifiesto en vivo, mapa GPS, timeline, fuerza mayor | I13-I17, G08, G09 |
| Tours | Inventario, wizard de 4 pasos, PENDING_REVIEW → PUBLISHED, solicitudes de cambio | I04, I05, G01 |
| Salidas y cupos | Instancias, creación en lote, calendario de ocupación, cupos premium | I06, I07, I03, G02 |
| Manifiestos | Por salida, exportar, confirmar pago de agencia; pestaña **Links de agencia** | I08-I12 |
| Planificación | Pestañas: Calendario unificado · Guías · Conductores · Disponibilidad · Alistamiento · Cierres; acciones en lote | K-RF01-04, 09, 10, 13, 14 |
| Equipo | Miembros y roles OPERATOR_*, asignaciones | I01, I18, I19b, G03 |
| Flota | Vehículos y documentos con vencimiento | I19, G04 |
| Proveedores | Directorio por región y acuerdos | K-RF05 |
| Finanzas | Liquidaciones ("Te debemos…"), ingresos por canal, proyección | I22-I24, G07 |
| Reseñas | Solo lectura; reportar | I24b |

**Plataforma** (solo roles internos de BorondoTours: SUPER_ADMIN, GERENTE, COORD según el permiso)
| Módulo | Contenido | RF |
|---|---|---|
| Tenants | Operadores y agencias, contratos de comisión inmutables, módulos activos [S], `featured_boost` (yield, interno) | H19, G06, H23 |
| Revisión de tours | Cola PENDING_REVIEW y TourEditRequest | I04, I05 |
| Radar global | Radar con filtro por operador (COORD interno) | G, K-RF03 |
| Publicidad | Ads Manager | H20 |
| (Loyalty) | **Oculto**: Spec-E en pausa | H21 |

Ghost Login (H18) es una acción dentro de Tenants. Mientras está activo se muestra el `Banner` (danger) fijo de `@borondo/ui`, sin crear un componente nuevo.

**Total:** 4 comunes + 7 de agencia + 10 de operador + 4 de plataforma = 25 entradas. Un cliente típico ve como máximo **21** (Común + Agencia + Operador). Un operador que no vende ve **14**.

### 3.3 Rutas y destino por rol (propuesta)

Una sola base: `/gestion/{grupo}/{módulo}` (`/gestion/agencia/crm`, `/gestion/operador/radar`, `/gestion/plataforma/tenants`, `/gestion/inicio`). Las rutas `/erp/*` y `/operador/*` de Spec-H RF-H01 redirigen a las nuevas.

Destinos: AGENT → CRM, GERENTE → Inicio, COORD → Plataforma/Radar global, SUPER_ADMIN → Plataforma/Tenants, OPERATOR_ADMIN → Inicio, OPERATOR_COORD → Radar, OPERATOR_AGENT → Manifiestos.

**Hay que actualizar RF-H01 en Spec-H.** El mecanismo de routing depende de la decisión pendiente **#2 (Astro vs Vite)**. La IA no cambia con esa decisión; el manejo del foco sí (§5.3).

---

## 4. Especificación del sidebar (`AppSidebar`)

### 4.1 Anatomía (escritorio)

Tres zonas, igual que el B2C (DESIGN §13):

1. **Cabecera fija:** logo, botón para colapsar y botón "Buscar · Ctrl K".
2. **Navegación con scroll interno** (`overflow-y: auto`): Inicio, los grupos y Reportes. A diferencia de `setupSidebar` del B2C, el sidebar **nunca deja de estar fijo** por falta de alto.
3. **Pie fijo:** Ajustes, Ayuda, avisos y perfil (avatar con inicial + nombre del tenant + menú: tema, idioma, cerrar sesión).

Superficie: vidrio del tema (`--bt-nav-fill` / `GlassSurface`), radio de panel y 16 px de margen, como `bt-sidebar-fixed`.

### 4.2 Estados

| Estado | Comportamiento |
|---|---|
| **Expandido** (280 px; por defecto en ≥ 1280 px) | Icono + texto. Cabecera de grupo = botón con chevron y nombre ("Agencia", "Operador", "Plataforma"). |
| **Colapsado a iconos** (72 px; por defecto en 1024-1279 px) | Se ven Inicio, **un icono por grupo**, Reportes y el pie. Al pulsar el icono de un grupo se abre un **flyout** (popover sin velo, vidrio strong, patrón `menu.ts`) con los módulos del grupo. Si la ruta activa pertenece al grupo, el icono del grupo lleva el estado activo. El tooltip con el nombre aparece al pasar el mouse **y** al enfocar, y se cierra con Escape (1.4.13). El nombre accesible es texto `bt-sr-only`, no `title`. |
| **Grupo abierto / cerrado** | Grupos independientes (no acordeón exclusivo): quien trabaja como agencia y operador alterna mucho. Al cargar, el grupo de la ruta activa se abre siempre; los demás toman el estado guardado. Un grupo cerrado muestra la **suma de sus pendientes** junto al nombre, para que no se oculten. |
| **Ítem activo** | Pill `--semantic-action-primary` con texto e icono `--semantic-text-on-action` y peso 600 (mismo tratamiento que `.bt-nav-indicator`/`.is-indicated`). `aria-current="page"` en la ruta exacta y `aria-current="true"` en el módulo padre cuando se está en un detalle (p. ej. una cotización). |
| **Hover / foco** | Hover: fondo `--glass-hover-background`. Foco: outline 2 px `--semantic-focus`, offset 2 px. Nada se abre al pasar el mouse. |
| **Módulo no contratado** | **Oculto** en el menú y en Ctrl+K. Se ofrece en Ajustes → Módulos ("Solicitar activación"). |
| **Contratado pero bloqueado** | Visible con candado e `aria-describedby` que explica el motivo. Ejemplos: tenant PENDING_REVIEW (Tours abre, pero "Enviar a revisión" queda deshabilitado hasta completar el perfil) o SUSPENDED (todo en solo lectura). La pantalla usa el estado "Bloqueado / solo lectura" de DESIGN §14. |
| **Sin permiso de rol** | Oculto. No se dibujan ítems deshabilitados por rol. |
| **Un solo grupo** | No se dibuja el botón de grupo: los ítems quedan planos bajo un rótulo no interactivo (`<h2>` visual, Inter 12, eyebrow). Se ahorra un clic y desaparece un control sin función. En el riel colapsado se muestran los iconos de los módulos directamente, sin flyout. |
| **Ghost Login** | El Banner danger va arriba del contenido y el sidebar muestra el nombre del tenant impersonado. |
| **Carga** | Skeleton con la forma de los ítems; `aria-busy` en la `<nav>` mientras se resuelven los permisos. |

### 4.3 Persistencia

- Se guarda `localStorage["bt.nav.v1"] = { rail: "expanded"|"collapsed", open: ["agencia", ...] }`. Es preferencia de interfaz, sin PII ni tokens; el access token sigue en memoria (steering 04). Si el ancho de pantalla obliga a colapsar, se ignora la preferencia sin borrarla.
- Más adelante podría guardarse en el perfil del usuario (servidor) para usarla en varios dispositivos [S].

### 4.4 Tablet y móvil (patrón del proyecto: hoja inferior o pantalla completa)

- **768-1023 px:** barra superior (logo, buscar, avisos, botón "Menú" con `aria-expanded`). El botón abre `AccessibleDialog variant="drawer" drawerEdge="left"` (85vw, máximo 24 rem) con el mismo árbol de grupos.
- **< 768 px:** barra superior más **barra inferior de 4 accesos según el rol y un 5.º "Menú"** (como el B2C). "Menú" abre la navegación completa en pantalla completa (`AccessibleDialog`, trampa de foco, Escape, el foco vuelve al botón). Ejemplos de accesos: OPERATOR_COORD = Radar, Manifiestos, Planificación, Inicio; AGENT = CRM, Cotizaciones, Clientes, Inicio.
- Guías y conductores siguen en `/field` (App 4) y no usan esta app.

### 4.5 Contador de pendientes por módulo

| Módulo | Qué cuenta | Tono |
|---|---|---|
| CRM | Leads con > 48 h sin respuesta (H03) | warning |
| Cotizaciones | PENDING_APPROVAL (solo GERENTE, H06b) | warning |
| Manifiestos | HOLD_AGENCY por confirmar (I12) | warning |
| Radar | Urgencias abiertas (I13) | danger + icono |
| Planificación | Salidas no LISTO a < 48 h (K-RF09) | warning |
| Flota / Proveedores | Documentos o acuerdos por vencer en 30 días (I19, K-RF05) | neutral |
| Revisión de tours | PENDING_REVIEW + TourEditRequest (Plataforma) | neutral |

- El número va dentro del enlace y el nombre accesible es completo: "CRM, 3 pendientes" (texto `bt-sr-only`). Desde 100 se muestra "99+". El color nunca va solo: lleva número y, si es urgente, icono.
- La `<nav>` no tiene `aria-live`, para no anunciar cada cambio. Las urgencias se anuncian una vez con `Toast role="alert"`.
- Actualización por el canal en tiempo real (API Gateway WebSocket, ADR-011) o por polling de TanStack Query cada 60 s como respaldo.

### 4.6 Buscador de módulos y comandos (Ctrl/⌘ + K)

- Se abre con Ctrl/⌘+K o con el botón "Buscar" de la cabecera.
- Es un `AccessibleDialog` con un combobox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`) y un `listbox` agrupado por sección (Ir a · Acciones · Recientes).
- **F1:** solo módulos visibles y últimos visitados. **F2:** acciones ("Nueva cotización", "Venta rápida", "Nuevo tour", "Crear salidas en lote") y búsqueda de registros vía API con permisos.
- Atajos: Ctrl+K abre la paleta y Ctrl+\ colapsa o expande el riel (precedente Notion). **No hay atajos de una sola tecla** (2.1.4). La lista de atajos está en Ayuda.

---

## 5. Accesibilidad WCAG 2.2 AA concreta

### 5.1 Estructura y roles

```html
<nav aria-label="{t('nav:main')}">
  <ul>
    <li><a href="/gestion/inicio" aria-current="page">…Inicio</a></li>
    <li>
      <button type="button" aria-expanded="true" aria-controls="nav-g-agencia">Agencia <span class="bt-sr-only">, 4 pendientes</span></button>
      <ul id="nav-g-agencia">
        <li><a href="/gestion/agencia/crm">CRM <span class="bt-count" aria-hidden="true">3</span><span class="bt-sr-only">, 3 pendientes</span></a></li>
      </ul>
    </li>
  </ul>
</nav>
```

- La lista cerrada lleva `hidden` (no solo `display:none` animado), para que el lector de pantalla no la lea.
- El botón de colapsar el riel tiene etiqueta fija ("Barra lateral") con `aria-expanded` y `aria-controls`. No se cambian a la vez la etiqueta y el estado.
- El skip link "Saltar al contenido principal" ya existe en `Base.astro`: debe ser el primer elemento enfocable y apuntar a `<main id="main" tabindex="-1">`.
- Hay un solo `<h1>` por pantalla, en el `PageHeader`. El sidebar no usa encabezados `h1`/`h2` reales, salvo el rótulo del caso de un solo grupo.

### 5.2 Teclado

| Tecla | Efecto |
|---|---|
| Tab / Shift+Tab | Recorre los botones de grupo y los enlaces visibles |
| Enter / Espacio | Abre o cierra el grupo; activa el enlace |
| Escape | Cierra el flyout del riel o la hoja móvil y devuelve el foco al disparador |
| ↑ ↓ Home End (opcional, APG) | Mueven entre ítems de la `<nav>`; no reemplazan a Tab |
| Ctrl/⌘+K, Ctrl+\ | Paleta de comandos, colapsar el riel |

### 5.3 Foco

- Si la navegación es MPA (Astro), el foco arranca arriba de la página y el skip link resuelve el salto.
- Si hay transiciones de cliente (view transitions o SPA, según la decisión **#2**), al cambiar de ruta el foco va al `<h1>` del `main` y se anuncia el título.
- **2.4.11:** la barra superior y la inferior en móvil, y la barra de acciones fija de los formularios, no deben tapar el foco. Se usa `scroll-padding-top/bottom` igual a su alto.
- Al colapsar el riel con el foco dentro de un grupo, el foco pasa al icono de ese grupo.

### 5.4 Contraste en los 3 temas

Son estimaciones mías con la luminancia relativa sRGB de los tokens. Hay que confirmarlas con `btq.contrast` en Figma y con axe en Playwright.

| Par | Colorido | Claro | Oscuro |
|---|---|---|---|
| Texto del ítem sobre vidrio del sidebar | Blanco Niebla sobre ≈Azul Profundo ≈ 11:1 ✅ | `#1c1c1e`/Negro Volcánico sobre Blanco Niebla 72 % ≈ 16:1 ✅ | `#ededed` sobre `#0b2238` 70 % ≈ 13:1 ✅ |
| Texto secundario (contador neutral, rótulo de grupo) | `#bae6fd` sobre ≈`#103B66` ≈ 8,6:1 ✅ | `#515156` sobre claro ≈ 7,5:1 ✅ | `#a1a1aa` sobre `#161618` ≈ 7:1 ✅ |
| **Activo DESIGN §18:** icono Turquesa sobre pill Blanco Niebla 16 % | **≈ 2,9:1 ❌** (1.4.11 en el riel colapsado) | Turquesa sobre claro **≈ 2,3:1 ❌** | ≈ 4:1 ✅ |
| **Activo propuesto:** Negro Volcánico sobre Turquesa sólido | ≈ 7,7:1 ✅ | ≈ 7,7:1 ✅ | ≈ 7,7:1 ✅ |
| Anillo de foco sobre el fondo (1.4.11 ≥ 3:1) | Turquesa sobre `#0a1a2b` ≈ 7:1 ✅ | `#007aff` sobre blanco ≈ 4:1 ✅ | Turquesa sobre `#0b0b0c` ≈ 8:1 ✅ |
| Contador danger | Negro Volcánico sobre `#f97066` ≈ 6,8:1 ✅ | Blanco Niebla sobre `#B42318` ≈ 6,3:1 ✅ | Igual que Colorido ✅ |

**Acción:** actualizar DESIGN §18 y el componente de Figma del sidebar con el activo propuesto. Los acentos no cambian entre temas (DESIGN §15), así que un solo estilo sirve para los tres.

### 5.5 Objetivos táctiles y movimiento

- Ítems, botones de grupo e iconos del riel de **44 × 44 px como mínimo** (el proyecto supera el mínimo AA de 24 px de 2.5.8). Entre ítems hay 4 px; el área de pulsación cubre toda la fila.
- `prefers-reduced-motion: reduce`: sin animación de alto al abrir un grupo, sin transición de ancho del riel y sin desplazamiento del indicador (mismo patrón que `.bt-nav-indicator { transition: none }` y `transition-duration: 1ms` del kit).

### 5.6 Hallazgos de a11y en las specs actuales (corregir antes de diseñar)

1. **Radar "parpadea"** (RF-I13): riesgo de 2.3.1 y 2.2.2. Mejor así: la tarjeta sube a la fila 1 y lleva borde danger con icono y un solo pulso (ninguno con reduced-motion), más `Toast role="alert"`. Si suena, el sonido se puede silenciar (ya está previsto para Ka-ching, H12).
2. **Kanban con arrastrar** (RF-H02): 2.5.7 exige alternativa de un solo puntero. Cada tarjeta lleva un botón de menú "Mover a…" con las columnas permitidas y el resultado se anuncia por `aria-live="polite"`.
3. **Leaderboard en el sidebar** (APP2 Flujo D): mezcla contenido que cambia en vivo con la navegación. Propongo moverlo a Inicio/Rendimiento. **Es un cambio respecto al documento y necesita el visto bueno del dueño.**
4. **Semáforos** (ocupación, Radar, alistamiento): siempre con texto o icono además del color (DESIGN §11, ya está en la regla).

---

## 6. Piezas: qué se reutiliza y qué falta

### 6.1 Regla de unificación (evita la "melcocha")

La app de gestión usa **`@borondo/ui`** (React, Tailwind con tokens). El kit `ui-kit.ts` es del runtime B2C exportado de Figma y está limitado a `.fig-stage`. No se copia a la app. Cada pieza del kit que se necesite se **porta una sola vez** a `@borondo/ui` con la misma especificación, y Figma queda con un único componente.

Equivalencias que hay que fijar:

| Kit B2C (`ui-kit.ts`) | `@borondo/ui` | Decisión |
|---|---|---|
| `bt-btn--primary` | `Button variant="primary"` | Ya equivalen |
| `bt-btn--glass` | `Button variant="secondary"` (glass-surface) | Igualar el hover de `bt-btn--glass` en Figma; un solo componente "Botón · Vidrio" |
| `bt-btn--link` | `Button variant="ghost"` | Agregar la variante `link` (subrayado) a Button en lugar de una clase nueva |
| `bt-btn--block` | `fullWidth` | Ya equivalen |
| `emptyState()` / `bt-empty` | `StatusMessage` | Agregar a `StatusMessage` las opciones `glass` y `align` del kit; no crear EmptyState aparte |
| `sectionHead()` | `Eyebrow` + `Heading` | Nuevo `PageHeader` y `SectionHeader` en `@borondo/ui` con la misma anatomía (eyebrow, título, acciones) |
| `statCard()` / `bt-stat` | — | Portar como `StatCard` (KPIs de H15, I02) |
| `bt-glass-std` | `GlassSurface` / `Card variant="glass"` | Ya equivalen; mantener un solo vidrio por tema (`--bt-glass-*`) |
| `menu.ts` (disclosure) | — | Base del flyout del riel y del menú de perfil (`Popover/Menu` del Catálogo) |
| `panel.ts` (panel lateral) | `AccessibleDialog variant="drawer"` | Usar el de `@borondo/ui` |

### 6.2 Piezas que se reutilizan tal cual

`Button`, `Badge` (base del contador), `Tabs` (con `counts`, para las vistas guardadas de listas y las pestañas de Planificación y Reportes), `Chip` (filtros), `Input`, `Checkbox`, `RadioGroup`, `AccessibleDialog` (drawer, hoja móvil, paleta, modales de razón), `Toast`/`Banner` (alertas, Ghost), `Skeleton`, `StatusMessage`, `Card`/`GlassSurface`, `useFocusTrap`, `Typography`.

### 6.3 Piezas nuevas (sin duplicar)

| Componente (`@borondo/ui`) | Clase | Variantes / props | Nota |
|---|---|---|---|
| `AppShell` | `bt-app-shell` | `sidebar`, `topbar`, `tabbar`, `banner` | Rejilla 280/72 + 24 de separación + main |
| `AppSidebar` | `bt-sidebar` | `state: expanded \| collapsed`, `items` (de `nav-registry`) | Ya está en el Catálogo; sustituye a futuro al sidebar del B2C |
| `NavGroup` | `bt-nav-group` | `open`, `single` (rótulo plano), `count` | Botón disclosure |
| `NavItem` | `bt-nav-item` | `active`, `locked`, `count`, `tone`, `collapsed` | Enlace con `aria-current` |
| `CountBadge` | — | Variante `count` de `Badge` (`tone: neutral \| warning \| danger`, máx. "99+") | **No es componente nuevo**: variante de Badge |
| `NavFlyout` | `bt-nav-flyout` | — | Popover del riel colapsado (base `menu.ts`) |
| `Tooltip` | `bt-tooltip` | `side` | Hover y foco, Escape (1.4.13) |
| `CommandPalette` | `bt-command` | `sections` | Dialog + combobox/listbox |
| `AppTopBar` | `bt-topbar` | `mobile \| tablet` | |
| `MobileTabBar` | `bt-tabbar` | `items` (4 + Menú) | Ya está en el Catálogo; mismo componente que el B2C |
| `PageHeader` | `bt-page-head` | `eyebrow`, `title (h1)`, `meta`, `actions`, `breadcrumbs?` | Variante h1 del `sectionHead` del kit |
| `FilterBar` | `bt-filter-bar` | `search`, `chips`, `savedViews (Tabs)` | |
| `DataTable` | `bt-table` | `sortable`, `selectable`, `rowHref`, `density`, `cursor` | Ya está en el Catálogo; en móvil, lista de tarjetas |
| `BulkActionBar` | `bt-bulk-bar` | — | K-RF14; fija abajo con `shadow-sticky` |
| `KanbanBoard` / `KanbanColumn` / `KanbanCard` | `bt-kanban-*` | `column.tone`, `card.urgent` | Con "Mover a…" (2.5.7) |
| `ResourceCalendar` | `bt-res-cal` | `view: day \| week \| month`, `rows: guides \| drivers \| vehicles \| tours` | K-RF01-03, I03 |
| `FormSection` + `ActionBar` | `bt-form-section`, `bt-action-bar` | `sticky` | Formularios y wizard (`Stepper` del Catálogo) |
| `StatCard` | `bt-stat` | `trend?` | Port de `statCard()` |
| `Timeline` | `bt-timeline` | `tone` por evento | Historial de lead (H03), timeline del Radar (I16) |
| Variante `wide` de `AccessibleDialog drawer` | — | `size: md (24rem) \| wide (40rem)` | Detalle de lead y manifiesto en vivo |

---

## 7. Plantillas de pantalla (para no diseñar pantalla por pantalla)

Todas usan `AppShell` y `PageHeader` (h1, total, acción principal), y cubren los estados de DESIGN §14: carga (skeleton), vacío (`StatusMessage` con CTA), error recuperable, bloqueado/solo lectura y sin permiso.

| Plantilla | Anatomía | Módulos | Móvil |
|---|---|---|---|
| **T1 Lista** | `FilterBar` (búsqueda, chips, vistas guardadas con conteo) → `DataTable` (orden `aria-sort`, selección y `BulkActionBar`, fila enlazada al detalle, "Cargar más" por cursor) | Cotizaciones, Clientes, Reservas, Tours, Salidas, Equipo, Flota, Proveedores, Finanzas, Reseñas, Tenants, Revisión | Lista de tarjetas y filtros en hoja inferior |
| **T2 Tablero** | Columnas `<section aria-labelledby>` con contador y total de la columna; tarjetas como `<article>` con enlace y "Mover a…"; modal de razón al pasar a Perdido | CRM | Una columna a la vez con `Tabs` |
| **T3 Calendario de recursos** | `ResourceCalendar` (filas = recurso, columnas = días), filtros AND, leyenda con texto, panel de asignación rápida | Planificación, Salidas (ocupación) | Agenda por día |
| **T4 Detalle** | (a) **Vistazo** en drawer `wide` para revisar o hacer acciones rápidas (lead, manifiesto en vivo); (b) **página** de 2/3 + 1/3 (contenido + Timeline/resumen) para editar a fondo (Polaris) | Todos los recursos | Pantalla completa |
| **T5 Formulario / wizard** | `Stepper` + `FormSection`s + `ActionBar` fija; resumen de errores arriba con foco y `aria-describedby` por campo; no se vuelven a pedir datos ya dados (3.3.7) | Nueva cotización, wizard de tour (4 pasos), alta de vehículo o proveedor, Ajustes | Igual, en una columna |
| **T6 Panel** | Rejilla de `StatCard` y gráficos, cada gráfico con su tabla alternativa ("Ver datos") | Inicio, Reportes, Finanzas, Rendimiento | Una columna |
| **T7 En vivo** | Rejilla de tarjetas de estado más columna fija de `Timeline`; urgencias arriba; mapa como sección aparte con alternativa en lista | Radar, Radar global | Tarjetas, y Timeline en una pestaña |

---

## 8. Para el agente `figma-sync` (sección 00 y tableros Colorido/Claro/Oscuro)

**Antes de crear:** unificar en Figma los duplicados de §6.1 (un solo "Botón · Vidrio", `StatusMessage` con variante vidrio, `PageHeader` = sectionHead h1). Cambiar el **estado activo** del componente Sidebar existente al de §4.2 (pill Turquesa con texto on-action).

**Sección 00 · componentes (con variantes y estados reposo/hover/foco/deshabilitado):**
1. `AppSidebar`: expandido / colapsado × {dos grupos, un grupo, con Plataforma}.
2. `NavGroup`: abierto / cerrado × {con contador, sin contador}, más la variante `single` (rótulo plano).
3. `NavItem`: reposo / hover / foco / activo / activo-padre / bloqueado (candado) × expandido / colapsado × {sin contador, contador neutral, warning, danger, 99+}.
4. `Badge` variante `count` (neutral / warning / danger; 1, 2 y 3 dígitos; 99+).
5. `NavFlyout` (riel colapsado) y `Tooltip`.
6. `CommandPalette`: vacía / con resultados / sin resultados / con acción resaltada.
7. `AppTopBar` (tablet, móvil), `MobileTabBar` de gestión (4 + Menú) y hoja de navegación a pantalla completa.
8. `PageHeader`, `FilterBar`, `DataTable` (cabecera con orden asc/desc/ninguno, fila reposo/hover/seleccionada, densidad), `BulkActionBar`.
9. `KanbanColumn` (normal / Perdido), `KanbanCard` (normal / urgente / propiedad de otro / arrastrando) y menú "Mover a…".
10. `ResourceCalendar` (bloque por estado + libre + conflicto + fatiga) con leyenda de texto.
11. `AccessibleDialog drawer` `wide`, `Timeline`, `FormSection` + `ActionBar`, `StatCard`, `Banner` Ghost.
12. Estado "Módulo bloqueado / solo lectura" y estado "Sin permiso".

**Tableros (canónico Colorido; regenerar Claro y Oscuro con btreg/btregen2):**
- Shell: (a) Agencia + Operador expandido, (b) colapsado con flyout abierto, (c) operador sin agencia (un grupo), (d) agencia sin operador, (e) interno con Plataforma + Ghost activo, (f) tablet con drawer, (g) móvil con barra inferior y hoja de menú, (h) paleta Ctrl+K abierta.
- Plantillas T1-T7 con datos de ejemplo ficticios: CRM (T2), Cotizaciones (T1), detalle de lead en drawer (T4a), wizard de tour (T5), Inicio (T6), Planificación (T3), Radar (T7).
- Página "Flujo del frontend": nuevo carril **Gestión** en `DATA` de `btflow` y `BUILD`.
- Criterio de salida: `btq.contrast` / `btvis.audit` = 0 en las 3 columnas, y revisar en especial el estado activo del riel colapsado y los contadores.

---

## 9. Conclusiones y recomendaciones

1. Adoptar la IA de §3. Las decisiones del dueño que quedan abiertas son: el grupo **Plataforma** (no lo mencionó, pero BorondoTours lo necesita), los supuestos **Clientes, Reservas y Bandeja**, y mover el **leaderboard** fuera del sidebar.
2. Implementar el sidebar como **disclosure APG** con grupos independientes, ocultar lo no contratado y aplanar cuando hay un solo grupo, todo desde un `nav-registry` único que también alimente la paleta y la navegación móvil.
3. **Corregir el estado activo** de DESIGN §18 (contraste) reutilizando el indicador del navbar público, en código y en Figma.
4. **Una sola librería para la app de gestión: `@borondo/ui`.** Portar a ella `StatCard`, `PageHeader` y las opciones de `StatusMessage`, y agregar la variante `link` a Button. No importar el kit `.fig-stage`. Más adelante, migrar el sidebar del B2C a `AppSidebar`.
5. Corregir en las specs, antes de construir, el parpadeo del Radar (2.3.1/2.2.2) y la alternativa al arrastre del Kanban (2.5.7).
6. **Dependencias para otros roles:** data-modeler (tenant con módulos), RBAC (roles de ventas por tenant), api-contract (endpoint de capacidades y contadores de la navegación), y la actualización de RF-H01 a `/gestion/*`. La decisión pendiente **#2** afecta al manejo del foco al navegar, no a la IA. Las decisiones #1 y #15 no afectan este informe.
7. Lo que no pude verificar: los contrastes son cálculos sobre los tokens, no medidas en pantalla. No revisé Figma en vivo (sin captura, steering 13). La validación WCAG completa requiere pruebas manuales con tecnologías de apoyo y una revisión experta.
