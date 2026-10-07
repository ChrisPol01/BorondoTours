# Implementation Plan

> Orden: exploración del bug (código sin arreglar) → preservación → Paso 0 (Figma) → Pasos 1–8 → verificación → checkpoint.
> No editar a mano el markup generado por fig2astro: los arreglos estáticos van en `otros/infra/fig2astro/postprocess.mjs` (Req. 3.9).
> Figma: respetar `.kiro/steering/13-figma-bridge-safety.md` (`capture: false`, sin `getCSSAsync`, un nodo por llamada, `maxDepth` ≤ 3).

- [x] 1. Escribir la prueba exploratoria de la condición del bug (Playwright, código sin arreglar)
  - **Property 1: Bug Condition** - Regresiones de vidrio, TourCard, navbar, chips, uniones, carril, pestañas, vitrina, hrefs y estados de tarjeta (casos a–k)
  - **CRITICAL**: Esta prueba DEBE FALLAR sobre el código sin arreglar; el fallo confirma que el bug existe
  - **NO intentar arreglar la prueba ni el código cuando falle**
  - **NOTE**: La prueba codifica el comportamiento esperado (Properties 1–7 del design); validará el arreglo cuando pase
  - **GOAL**: Obtener contraejemplos que confirmen o refuten las hipótesis 1–9 del design (§Hypothesized Root Cause)
  - **Scoped PBT Approach**: bugs deterministas → parametrizar sobre los 3 temas (Colorido, Claro, Oscuro) y los casos concretos de `isBugCondition(X, T)`
  - Archivo sugerido: `apps/web/e2e/glass-theme-ui.bug.spec.ts`, contra `pnpm --filter @borondo/web build` + preview, viewport 1440×900
  - Casos y aserciones (esperado según design):
    - Hip. 1 (a, b): el panel de la primera TourCard de /explorar NO tiene `.bt-drop` ni `backdrop-filter: none` (Req. 2.1, 2.2)
    - Hip. 2 (c): `background-color` computado y primer `div:empty` bajo `.bt-nav-row` iguales entre Home y /explorar, sin fondo sólido (Req. 2.5)
    - Hip. 3 (d): con hover en "Blog", `overflow` de `.bt-nav-links` y ancestros de cápsula es `visible`; borde de "Explorar" intacto; al salir la píldora vuelve a "Explorar" (Req. 2.6)
    - Hip. 4 (e): cada chip superior tiene `scrollHeight <= clientHeight`, contenedor sin recorte vertical y alto ≥ 44 px (Req. 2.7)
    - Hip. 5 (f): la unión hero → `p0_50` tiene máscara o degradado (no hay borde duro) (Req. 2.8)
    - Hip. 6 (g): intersección vacía entre el rect de `.bt-rail` y los de `a.p0_13`, `a.p0_17`, `a.p0_18` (Req. 2.9)
    - Hip. 7 (h): pestañas sin `.bt-drop`, sin rotación −90° y texto horizontal; `background-color` computado igual al token: Promociones (`a.p0_13`) = `--semantic-action-cta`, Más vendidos (`a.p0_17`) = `--semantic-status-danger`, Ver todos (`a.p0_18`) = `--semantic-focus`; texto e icono = `--semantic-text-on-action`. Rail de redes dentro de una cápsula `.bt-glass-std`, con exactamente 3 botones (Instagram, Facebook, TikTok; sin X), cada uno con SVG inline a color completo: Instagram con degradado oficial (relleno `url(#...)` o `linearGradient` presente), Facebook con fondo `--bt-social-facebook` (#1877F2), TikTok con fondo negro y trazos `#25F4EE` y `#FE2C55`; `aria-label` con el nombre de la red, área ≥ 44×44 px y `href` a `instagram.com/borondotours`, `facebook.com/borondotours`, `tiktok.com/@borondotours` (Req. 2.9, 2.10, 2.11)
    - Estados de tarjeta (k): en cualquier vista, `:focus-visible` muestra anillo de 2 px `--semantic-focus`; durante la carga el contenedor tiene `aria-busy="true"` y skeleton `.bt-card--loading` (sin spinner); con `prefers-reduced-motion` no hay `transition` ni elevación animada; el tour demo agotado se ve con `.bt-card--soldout`, etiqueta "Agotado" con icono, sin pill Reservar, y su enlace es `/tour?tour={slug}` (Req. 2.4, 2.15)
    - Hip. 8 (i): el modal Promociones muestra 4 tarjetas en 2 filas distintas (`offsetTop`) y 2 columnas (Req. 2.13)
    - Hip. 9 (j): todos los `a` de tarjeta en catálogo (/explorar), vitrinas, Home, relacionados, blog, favoritos, mapa y estados cumplen `/tour?tour={slug}`; ninguno apunta a /explorar ni a /checkout (Req. 2.14)
  - Ejecutar sobre el código SIN arreglar
  - **EXPECTED OUTCOME**: La prueba FALLA (correcto: prueba que el bug existe)
  - Documentar los contraejemplos (p. ej. `.bt-drop` en TourCard, `overflow: hidden` en la cápsula, rail ∩ "Ver todos" ≠ ∅, href a /explorar) y anotar qué hipótesis se confirma o se refuta; si alguna se refuta, reformularla en design.md antes de seguir
  - Marcar como completa cuando la prueba esté escrita, ejecutada y el fallo documentado
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14_
  - **Resultado (ejecutada):** `apps/web/e2e/glass-theme-ui.bug.spec.ts` → 33/33 fallan (11 casos × 3 temas). Detalle y contraejemplos en `exploration-results.md`.
    - Confirmadas: 1 (TourCard), 4 (la fila de chips recorta), 5, 7 (pestañas y rail sin logos a color, 40×40), 8, 9 (27 tarjetas sin enlace o hacia /explorar), 10 (sin skeleton, transición, Agotado).
    - Reformuladas: 2 (el fondo sólido está en el contenedor de cada cápsula del Home, no en una franja), 3 (sin recorte por overflow; solo borde residual de 1 px), 6 (solape solo con viewport bajo, p. ej. 1440×720).
    - Refutado en parte: ya no hay X en el rail y el foco de la tarjeta ya cumple.
    - Pendiente de decisión: los tokens de las pestañas en Claro no resuelven a los hex de Req. 2.10.

- [ ] 2. Escribir las pruebas de preservación (ANTES del arreglo)
  - **Property 2: Preservation** - Comportamiento fuera de la condición del bug (Property 8 del design)
  - **IMPORTANT**: Metodología observar primero: registrar el comportamiento del código SIN arreglar para entradas donde `isBugCondition` es falso
  - Filtros del catálogo (vitest + fast-check): para combinaciones aleatorias de categoría, búsqueda, orden y página, registrar la lista de slugs y su orden en el código actual y afirmar igualdad (Req. 3.2)
  - Auth demo (Playwright): login y logout, sidebar visible con sesión y Auth Gate al pulsar "Pagar" (Req. 3.1)
  - Chrome fijo (Playwright): tras scroll, navbar, rail y FAB con `position: fixed`, aparece `.bt-nav-scrolled` y el FAB sube sobre el colofón (`initFixedChrome`) (Req. 3.7)
  - Contacto, centro legal e i18n: las pruebas vitest existentes (`contact.ts`, `legal.ts`, `i18n-dom.ts`) siguen en verde; cambiar de idioma traduce los textos (Req. 3.3, 3.4, 3.5)
  - Temas: Colorido, Claro, Oscuro y Sistema aplican sus tokens semánticos (Req. 3.8)
  - Teclado y diálogos (Playwright): Tab con foco visible en navbar, chips, tarjetas y pestañas; FAB, vitrina y menús cierran con Escape y devuelven el foco (Req. 3.10, 3.11)
  - Contraste: registrar la línea base con `node otros/infra/fig2astro/contrast.mjs` en los 3 temas: Claro ≤ 3, Colorido ≤ 2, Oscuro ≤ 2 (Req. 3.6)
  - Ejecutar sobre el código SIN arreglar
  - **EXPECTED OUTCOME**: Las pruebas PASAN (confirman la línea base a preservar)
  - Marcar como completa cuando las pruebas estén escritas, ejecutadas y en verde sobre el código sin arreglar
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 3.11_

- [ ] 3. Paso 0 — Extraer de Figma el vidrio oficial y la TourCard (Antigravity Bridge)
  - [ ] 3.1 Volcar las capas `body-colorido`, `body-claro` y `body-oscuro`
    - En la página "Design System", set `166:104691`, variante Default: leer propiedades nativas (`fills` con `opacity` del paint, `strokes`, `strokeWeight`, `strokeAlign`, `effects` DROP/INNER/BACKGROUND_BLUR, `cornerRadius`, `opacity`, `blendMode`, `boundVariables` resueltas a nombre de token)
    - Un nodo por llamada, `maxDepth` ≤ 3, resultado mínimo, sin `findAll` sobre la página ni `getCSSAsync`
    - Leer también el color y la tipografía del texto dentro de cada `body-*` (rol `text/*`)
    - _Requirements: 2.1_
  - [ ] 3.2 Volcar la TourCard Default y Hover
    - Radio, imagen 16:9, badges, precio, y diferencias de la variante Hover (sombra, borde, escala, elevación)
    - _Requirements: 2.2, 2.3_
  - [ ] 3.3 Guardar el volcado en `otros/design/b2c/css-dump/tourcard-glass.md`
    - Una tabla por tema con la traducción a CSS y a tokens `--bt-glass-*`; sección TourCard Default/Hover
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 3.4 Registrar los colores confirmados de pestañas laterales y rail de redes
    - Ya no se recuperan de git: los colores están confirmados en bugfix.md (Req. 2.9, 2.10)
    - Pestañas, en el volcado `tourcard-glass.md`: Promociones (`p0_13`) → `--semantic-action-cta` (Dorado `#FDB813`); Más vendidos (`p0_17`) → `--semantic-status-danger` (Coral `#F97066`); Ver todos (`p0_18`) → `--semantic-focus` (Turquesa `#00B7C7`); texto e icono `--semantic-text-on-action`
    - Rail de redes: tres redes, Instagram, Facebook y TikTok (sin X), en cápsula `.bt-glass-std`. Logos oficiales SVG a color completo, registrados como tokens propios del rail (marcas de terceros, sin hex sueltos en componentes):
      - Instagram: `--bt-social-instagram` = degradado oficial (amarillo → naranja → magenta → morado), logo blanco
      - Facebook: `--bt-social-facebook` = `#1877F2`, "f" blanca
      - TikTok: `--bt-social-tiktok` = negro, con `--bt-social-tiktok-cyan` (`#25F4EE`) y `--bt-social-tiktok-red` (`#FE2C55`) desplazados sobre la nota blanca
    - Enlaces: `instagram.com/borondotours`, `facebook.com/borondotours`, `tiktok.com/@borondotours`
    - Verificar en Figma con una lectura nativa del frame Home (un nodo, `maxDepth` ≤ 2, `capture: false`) solo si es barato; si no, dejar los valores de bugfix.md como fuente
    - _Requirements: 2.9, 2.10_

- [ ] 4. Arreglo de las regresiones de vidrio, tema y UI del B2C

  - [ ] 4.1 Paso 1 — Tokens únicos de vidrio
    - En `apps/web/src/styles/fig-runtime.css` (o `tokens.css` si son semánticos): definir `--bt-glass-fill`, `--bt-glass-fill-strong`, `--bt-glass-stroke`, `--bt-glass-shadow`, `--bt-glass-blur`, `--bt-glass-text` para `:root` (Colorido), `[data-theme="claro"]`, `[data-theme="oscuro"]` y `[data-theme="sistema"]` en ambas media queries, con los valores del volcado
    - Clase única `.bt-glass-std` y modificador `.bt-glass-std--strong`; borde degradado con pseudo-elemento y `mask`
    - Eliminar `--bt-drop-*`, `.bt-drop`, `.bt-drop-strong` y el override Claro al 72 % de `.bt-nav-glass` / `.bt-rail`; los usos de `--bt-drop-text` pasan a `--bt-glass-text`
    - Sin hex sueltos; si Claro empeora el auditor, ajustar `--bt-glass-fill` dentro de los valores de Figma y documentarlo en el volcado
    - _Bug_Condition: isBugCondition caso a (usesGlass(X) AND glassStyle(X,T) != figmaGlass(T))_
    - _Expected_Behavior: Property 1 — vidrio resuelto a figmaGlass(T)_
    - _Preservation: Property 8 — overlays y auth solo cambian de token con el mismo valor o uno validado por contraste_
    - _Requirements: 2.1, 2.5, 3.6, 3.8_

  - [ ] 4.2 Paso 2 — `initGlass` con lista explícita y función pura `glassTargetKind`
    - En `apps/web/src/lib/fig/runtime/glass.ts`: reemplazar el barrido por blur por selectores explícitos (`.bt-nav-glass`, `.bt-nav-capsule`, sidebar, `.bt-rail`, `.bt-glass`, `.bt-menu`, `.bt-chip`, `[role="dialog"]` strong)
    - Excluir TourCard (grilla de catálogo y `.bt-card`), hero y pestañas `a.p0_13`, `a.p0_17`, `a.p0_18`
    - Exportar `glassTargetKind(el): "std" | "strong" | null`
    - Tests vitest: `null` para TourCard, hero y pestañas; `"strong"` para diálogos y menús; `"std"` para navbar, rail y chips
    - _Bug_Condition: casos a, b, e, h_
    - _Expected_Behavior: Property 1 y Property 2_
    - _Preservation: elementos fuera de la lista no cambian (Property 8)_
    - _Requirements: 2.1, 2.2, 2.7, 2.10_

  - [ ] 4.3 Paso 3 — Navbar del Home e indicador limpio
    - Neutralizar la capa de fondo propia del navbar del Home: en `postprocess.mjs` si es estática, si no en `setupNav` (`fixed.ts`) con la misma regla que en /explorar
    - `setupIndicator` (`chrome.ts`) y CSS: `overflow: visible` en `.bt-nav-links` y ancestros de cápsula; quitar `border` y `outline` de `.bt-nav-links > a > div:empty`; píldora con `inset` dentro del padding de la cápsula; retorno a "Explorar" al salir del grupo
    - _Bug_Condition: casos c y d_
    - _Expected_Behavior: Property 3_
    - _Preservation: chrome fijo y `.bt-nav-scrolled` sin cambios (Req. 3.7)_
    - _Requirements: 2.5, 2.6, 3.7, 3.10_

  - [ ] 4.4 Paso 4 — Chips completos con vidrio estándar
    - `.bt-chip`: `min-height: 44px`, `height: auto`, `box-sizing: border-box`, padding vertical, borde vía `.bt-glass-std`
    - Fila de chips: `overflow` vertical visible (scroll-x si hace falta) y padding para el foco; alto fijo del markup corregido en `postprocess.mjs` si aplica
    - No tocar la lógica de selección (`chip()`, `setupCategories`)
    - _Bug_Condition: caso e_
    - _Expected_Behavior: Property 4 (chips) y Property 1_
    - _Preservation: resultados de filtros idénticos (Req. 3.2)_
    - _Requirements: 2.7, 3.2, 3.10_

  - [ ] 4.5 Paso 5 — Uniones entre secciones sin corte
    - `postprocess.mjs`: marcar `data-bt-seam` en bloques contiguos (p. ej. hero → `p0_50`)
    - `fig-runtime.css`: `mask-image` con degradado en el bloque superior o `::before` con `linear-gradient(to bottom, transparent, var(--semantic-surface-page))` en el inferior; solo tokens
    - _Bug_Condition: caso f_
    - _Expected_Behavior: Property 4 (uniones)_
    - _Preservation: regeneración fig2astro sin edición manual (Req. 3.9)_
    - _Requirements: 2.8, 3.8, 3.9_

  - [ ] 4.6 Paso 6 — Carril derecho: rail y pestañas laterales de marca
    - Tokens `--bt-lane-tabs-top` y `--bt-lane-rail-bottom`; bajar el rail (`ensureRail` en `fixed.ts`) respetando el FAB y `.bt-colophon-visible`
    - Pestañas (`placeSideTab`, `setupSideTabs` en `home.ts`): quitar la rotación −90° (`postprocess.mjs` o `transform: none` en `.bt-side-tab`); fondo con los tokens de la tarea 3.4: Promociones `--semantic-action-cta`, Más vendidos `--semantic-status-danger`, Ver todos `--semantic-focus`; texto e icono `--semantic-text-on-action` en los tres
    - Rail de redes: cápsula de vidrio estándar (`.bt-glass-std`); los botones `.bt-rail-link` no son vidrio. Tres redes: Instagram, Facebook y TikTok (se quita X)
    - En `ensureRail` (`fixed.ts`): SVG inline de cada logo oficial a color completo, con colores desde los tokens `--bt-social-*` de la tarea 3.4 (Instagram con `linearGradient` oficial, Facebook `#1877F2`, TikTok negro con `#25F4EE` y `#FE2C55`); SVG con `aria-hidden="true"` y `focusable="false"`
    - Cada enlace con `aria-label` traducible por red ("Instagram de BorondoTours", etc.), área táctil ≥ 44×44 px, `target="_blank"` con `rel="noopener noreferrer"` y foco visible
    - Reposo: icono o pestaña compacta. `:hover` / `:focus-visible`: despliegue horizontal con nombre completo; sin transición con `prefers-reduced-motion`
    - Extraer una utilidad pura del carril (rects de rail y pestañas) con test vitest de no intersección para los altos de viewport soportados
    - _Bug_Condition: casos g y h_
    - _Expected_Behavior: Property 4 (carril) y Property 5_
    - _Preservation: chrome fijo, i18n de las pestañas desplegadas y foco visible (Req. 3.5, 3.7, 3.10)_
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 3.5, 3.7, 3.10_

  - [ ] 4.7 Paso 7 — Vitrina 2×2 paginada de 4 en 4 con `pageOf` / `pageCount`
    - Crear `apps/web/src/lib/fig/runtime/paging.ts` con `pageOf(list, page, size = 4)` y `pageCount(n, size = 4)`
    - `showcase` (`home.ts`): reemplazar `.bt-carousel` por `.bt-showcase-grid` (grid 2×2); flechas cambian de página, actualizan `disabled` y el contador "Página x de y" con `aria-live="polite"`; conservar focus trap y Escape de `createPanel`
    - Tests vitest: listas de 0, 1, 3, 4, 5, 8 y 9 tours; límites de "Anterior" y "Siguiente"
    - Test fast-check (Property 6): para todo N en [0, 60] y toda página válida, la concatenación de páginas reproduce la lista sin repetidos y cada página tiene ≤ 4 elementos
    - _Bug_Condition: caso i_
    - _Expected_Behavior: Property 6_
    - _Preservation: Escape, focus trap y retorno de foco (Req. 3.11)_
    - _Requirements: 2.13, 3.11_

  - [ ] 4.8 Paso 8 — TourCard única y `tourHref` al detalle
    - Función pura `tourHref(slug)` → siempre `/tour?tour=${encodeURIComponent(slug)}`, sin modo checkout (Req. 2.14: el viajero elige fecha, viajeros y adicionales en el detalle)
    - Usarla en todas las vistas con tarjetas: catálogo (`fillCard` en `catalog.ts`), vitrinas y Home (`card()` en `home.ts`, deja de usar `catalogUrl`), relacionados (`tour.ts`), blog, favoritos, mapa y estados; normalizar los `<a>` del markup con slug conocido
    - Tarjetas de vitrina y del markup que no pasan por `fillCard`: misma estructura y clases de la TourCard del volcado (Default y Hover); transición nula con `prefers-reduced-motion`
    - Estados estándar en toda tarjeta de cualquier vista (Req. 2.4):
      - Foco: `:focus-visible` con el aspecto de Hover más anillo de 2 px `--semantic-focus` (solo teclado)
      - Cargando: skeleton `.bt-card--loading` con la forma real (imagen 16:9, líneas de texto y precio) y contenedor con `aria-busy="true"`; sin spinner
      - `prefers-reduced-motion`: hover y foco sin elevación animada ni transición
      - Variantes de contenido correctas con el vidrio nuevo: "Quedan pocos" (punto dorado), "Disponible", sin descuento (oculta el precio tachado) y con descuento (badge -N %)
    - Tests vitest: slugs con tildes, espacios y caracteres reservados; nunca devuelve una ruta de checkout
    - Test fast-check (Property 7): para todo slug generado, `tourHref` produce una URL que, parseada, devuelve el mismo slug en `tour`
    - _Bug_Condition: casos b y j_
    - _Expected_Behavior: Property 2 y Property 7_
    - _Preservation: i18n de tarjetas nuevas y filtros sin cambios (Req. 3.2, 3.5)_
    - _Requirements: 2.2, 2.3, 2.4, 2.14, 3.2, 3.5, 3.10_

  - [ ] 4.8b Estado Agotado de la TourCard
    - Agregar el campo `soldOut: boolean` a `CatalogTour` y marcar al menos un tour demo como agotado
    - Función pura `cardState(tour)` → `"soldout" | "few" | "available"` (agotado tiene prioridad sobre "Quedan pocos")
    - Tests vitest de `cardState`: agotado, quedan pocos, disponible y agotado con descuento (gana "soldout")
    - `.bt-card--soldout`: tarjeta atenuada sin bajar el texto de AA; etiqueta "Agotado" con texto e icono (no solo color) con contraste AA; sin pill Reservar
    - La tarjeta sigue siendo enlace a `tourHref(slug)` (el detalle ofrece otra fecha o lista de espera, Spec-B RF-B05b)
    - Traducir "Agotado" en `i18n-content.ts`
    - _Bug_Condition: tarjeta de un tour con `soldOut = true` sin estado Agotado (Req. 1.14)_
    - _Expected_Behavior: Req. 2.15_
    - _Preservation: tarjetas con cupos sin cambios; filtros e i18n intactos (Req. 3.2, 3.5)_
    - _Requirements: 1.14, 2.15, 3.2, 3.5_

  - [ ] 4.9 Verificar que la prueba exploratoria ahora pasa
    - **Property 1: Expected Behavior** - Regresiones de vidrio, TourCard, navbar, chips, uniones, carril, pestañas, vitrina y hrefs
    - **IMPORTANT**: Re-ejecutar la MISMA prueba de la tarea 1; NO escribir una nueva
    - **EXPECTED OUTCOME**: La prueba PASA en los 3 temas (confirma que el bug está corregido)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15_

  - [ ] 4.10 Verificar que las pruebas de preservación siguen pasando
    - **Property 2: Preservation** - Comportamiento fuera de la condición del bug
    - **IMPORTANT**: Re-ejecutar las MISMAS pruebas de la tarea 2; NO escribir nuevas
    - **EXPECTED OUTCOME**: Las pruebas PASAN (sin regresiones)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 3.11_

- [ ] 5. Verificación completa
  - [ ] 5.1 Typecheck, lint, tests y build
    - `pnpm --filter @borondo/web typecheck`, `lint`, `vitest --run` y `build` sin errores
    - _Requirements: 3.9_
  - [ ] 5.2 Auditor de contraste en los 3 temas
    - `node otros/infra/fig2astro/contrast.mjs`: Claro ≤ 3, Colorido ≤ 2, Oscuro ≤ 2 (no empeora la línea base)
    - _Requirements: 3.6, 2.10_
  - [ ] 5.3 Regeneración fig2astro sin diffs manuales
    - Regenerar y aplicar `postprocess.mjs`; confirmar que las páginas generadas no requieren edición a mano
    - _Requirements: 3.9_
  - [ ] 5.4 Playwright de integración
    - Indicador (hover sucesivo, sin recorte, retorno a "Explorar"), vitrina 2×2 con "Siguiente", no solapamiento rail/pestañas en 1440×900 y 1280×720, pestañas con los tokens de color (`--semantic-action-cta`, `--semantic-status-danger`, `--semantic-focus`) y texto horizontal, rail de redes en cápsula de vidrio con 3 botones (Instagram degradado oficial, Facebook `#1877F2`, TikTok negro con `#25F4EE` y `#FE2C55`), sin X, con `aria-label` por red, área ≥ 44 px y enlaces correctos; estados de tarjeta (foco con anillo 2 px, skeleton con `aria-busy`, sin transición con `prefers-reduced-motion`, Agotado con etiqueta e icono y sin Reservar); clic en tarjeta desde cada vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa, estados), incluida la agotada → `/tour?tour={slug}`, nunca checkout; navbar del Home igual a /explorar
    - _Requirements: 2.4, 2.5, 2.6, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15_
  - [ ] 5.5 Comparación visual con Figma en Colorido, Claro y Oscuro
    - TourCard (Default y Hover), navbar, chips, rail, vitrina y pestañas contra el volcado `tourcard-glass.md`
    - Estados de tarjeta: foco, skeleton, variantes de contenido (Quedan pocos, Disponible, con y sin descuento) y Agotado (atenuación y etiqueta legibles en AA)
    - Rail con los logos oficiales a color completo en los 3 temas, dentro de la cápsula de vidrio
    - Capturas de Figma solo de nodos pequeños con `capture_node_ids` y `scale` ≤ 1; capturas del navegador por componente
    - Criterio de salida: valores computados iguales al volcado (tolerancia ±1 en 8 bits por canal)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.9, 2.10, 2.15_

- [ ] 6. Checkpoint — Asegurar que todas las pruebas pasan
  - Confirmar en verde: prueba exploratoria (tarea 1), preservación (tarea 2), tests unitarios (incluido `cardState`) y fast-check (Properties 6 y 7), Playwright, auditor de contraste y build
  - Actualizar `otros/design/b2c/css-dump/tourcard-glass.md` si hubo desviaciones documentadas y el Dev-Log
  - Preguntar al usuario si surgen dudas
