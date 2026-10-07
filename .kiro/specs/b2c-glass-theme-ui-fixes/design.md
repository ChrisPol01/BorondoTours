# B2C Glass, Theme and UI Fixes — Bugfix Design

## Overview

Las tareas 12 (vidrio "gota de agua" sin blur) y 13 (píldora deslizante del navbar) introdujeron un vidrio genérico aplicado en runtime (`initGlass` + tokens `--bt-drop-*`). Ese vidrio se aplica a cualquier elemento con `backdrop-filter: blur`. Por eso cambian de diseño TourCard, chips y hero, el navbar del Home se ve distinto y el rail pierde sus colores de marca. Además hay defectos de layout acumulados: indicador que recorta bordes, chips recortados, cortes duros entre secciones, rail superpuesto a las pestañas laterales, vitrina de una sola fila y tarjetas que no llevan a reserva.

Estrategia del arreglo:

1. Extraer de Figma el vidrio oficial por tema (capas `body-colorido`, `body-claro` y `body-oscuro` del TourCard Default, set `166:104691`) y volcarlo en un único set de tokens `--bt-glass-*` por tema, aplicado a una sola clase `.bt-glass-std`.
2. Reemplazar el marcado indiscriminado de `initGlass` por una lista explícita de superficies (navbar, sidebar, rail, modal, menú, chip, vitrina). TourCard, hero y pestañas laterales quedan excluidos y recuperan su diseño propio.
3. Corregir cada defecto de layout en el punto mínimo: CSS en `fig-runtime.css`, lógica en el runtime y arreglos estáticos del markup en `postprocess.mjs`. El markup generado por fig2astro no se edita a mano.

## Glossary

- **Bug_Condition (C)**: un elemento X del B2C, renderizado en el tema T, que cae en alguno de los casos a–j de `bugfix.md`.
- **Property (P)**: el comportamiento correcto para X según `bugfix.md` §2 (2.1–2.15).
- **`cardState(tour)`**: función pura que devuelve `"available" | "low" | "soldout"` a partir de los datos del tour (`soldOut` o cupos). Decide la variante visual de la TourCard.
- **Estado Agotado**: tarjeta atenuada (`.bt-card--soldout`) con etiqueta "Agotado" (icono + texto), sin pill "Reservar", que sigue enlazando a `tourHref(slug)`.
- **Preservation**: comportamientos ¬C(X) que deben quedar idénticos (`bugfix.md` §3, 3.1–3.11).
- **F / F'**: runtime y CSS actuales (sin arreglo) / runtime y CSS corregidos.
- **Vidrio estándar**: estilo de la capa `body-{tema}` del TourCard Default en Figma, expresado con `--bt-glass-fill`, `--bt-glass-stroke`, `--bt-glass-shadow`, `--bt-glass-blur` y `--bt-glass-text`.
- **`initGlass`** (`apps/web/src/lib/fig/runtime/glass.ts`): hoy marca `.bt-drop` y `.bt-drop-strong` en todo `div`, `a` o `button` con `backdrop-filter: blur`.
- **`setupIndicator`** (`chrome.ts`): crea `.bt-nav-indicator` dentro de la cápsula de enlaces y mueve `.is-indicated`.
- **`initFixedChrome`** (`fixed.ts`): fija el chrome con `.bt-nav-fixed`, `.bt-nav-glass`, `.bt-nav-capsule`, `.bt-rail`, `.bt-rail-link` y `.bt-fab`.
- **`fillCard`** (`catalog.ts`): clona la primera tarjeta de la grilla y la rellena con un `CatalogTour`.
- **`showcase` y `card`** (`home.ts`): panel `.bt-glass` con carrusel `.bt-carousel` de tarjetas `.bt-card`.
- **Pestañas laterales**: `a.p0_13` (Promociones), `a.p0_17` (Más vendidos) y `a.p0_18` (Ver todos), posicionadas con `placeSideTab`.
- **`fitBlock`, `growWithContent`, `stretchGlass`** (`layout.ts`): ajustan altos de bloques absolutos tras inyectar contenido.
- **Auditor de contraste**: `otros/infra/fig2astro/contrast.mjs`. Línea base actual: Claro 3, Colorido 2, Oscuro 2.

## Bug Details

### Bug Condition

El bug aparece cuando un elemento del B2C cae en un caso a–j en cualquiera de los temas. La causa común es que el runtime aplica un vidrio aproximado y genérico, con `!important`, en lugar del vidrio oficial y de los estilos propios de cada componente. A eso se suman defectos de layout puntuales.

**Formal Specification:**
```
FUNCTION isBugCondition(X, T)
  INPUT: X = elemento renderizado del B2C, T IN {colorido, claro, oscuro, sistema}
  OUTPUT: boolean

  RETURN
       (usesGlass(X)            AND glassStyle(X, T) != figmaGlass(T))          // a
    OR (isTourCard(X)           AND (renderedStyle(X) != figmaTourCard.Default
                                     OR hoverStyle(X) != figmaTourCard.Hover
                                     OR NOT hasStates(X, [focus, skeleton, reducedMotion])
                                     OR NOT contentVariantsOk(X)
                                     OR (cardState(X.tour) = "soldout"
                                         AND NOT showsSoldOut(X))))           // b
    OR (isHomeNavbar(X)         AND hasSolidBackdropBehindCapsules(X))         // c
    OR (isNavIndicator(X)       AND hovered(X) != "Explorar"
                                AND clippedBorder(anyCapsule(X)))              // d
    OR (isFilterChip(X)         AND (clipped(X) OR glassStyle(X,T) != figmaGlass(T)
                                     OR hitArea(X) < 44))                      // e
    OR (isSectionSeam(X)        AND hardEdgeVisible(X))                        // f
    OR (isSocialRail(X)         AND (overlaps(X, sideTabs)
                                     OR networks(X) != [instagram, facebook, tiktok]
                                     OR anyLink(X).logo != officialLogo(network)
                                     OR NOT accessibleName(anyLink(X))))      // g
    OR (isSideTab(X)            AND (background(X) = transparent
                                     OR textOrientation(X) = vertical
                                     OR NOT readableAtRest(X)))                // h
    OR (isShowcaseModal(X)      AND (rows(X) != 2 OR cols(X) != 2
                                     OR pageStep(X) != 4))                     // i
    OR (isTourCardClick(X)      AND destination(X) != tourHref(X.slug))        // j
END FUNCTION
```

`showsSoldOut(X)` exige: clase `.bt-card--soldout`, etiqueta "Agotado" con icono (no solo color), sin pill "Reservar", `href = tourHref(slug)` y texto de la tarjeta en AA pese a la atenuación. `hasStates` y `contentVariantsOk` aplican a toda tarjeta en cualquier vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa y estados).

Donde `figmaGlass(T)` es el resultado de extraer la capa `body-{T}` (el tema `sistema` resuelve a `claro` u `oscuro` según `prefers-color-scheme`) y `tourHref(slug) = "/tour?tour=" + encodeURIComponent(slug)`. La reserva se inicia desde el detalle del tour; ninguna tarjeta lleva directo al checkout.

### Examples

- **a.** En Claro, el navbar usa `#ffffff` al 72 % y el resto de superficies usan `--bt-drop-fill` al 38 %. Ninguno coincide con `body-claro`. Esperado: un solo vidrio `body-claro` en todas.
- **b.** En /explorar, la TourCard queda con `.bt-drop` porque su panel de información tiene `backdrop-filter: blur`. Se pierde el blur y el tinte de Figma, y el borde pasa a `--bt-drop-rim !important`. Esperado: TourCard Default de Figma.
- **b.** Al pasar el mouse sobre una `.bt-card` de vitrina solo sube 4 px. Esperado: variante Hover del set `166:104691`.
- **b.** Una TourCard con foco de teclado no muestra anillo; mientras carga el catálogo no hay skeleton con la forma de la tarjeta. Esperado: anillo 2 px `--semantic-focus` con `:focus-visible` y skeleton `.bt-card--loading` con `aria-busy="true"`.
- **b.** Un tour sin cupos se ve igual que uno disponible, con pill "Reservar". Esperado: `.bt-card--soldout`, etiqueta "Agotado" con icono, sin "Reservar", y clic al detalle `/tour?tour={slug}`.
- **c.** En el Home se ve una franja azul sólida detrás de las cápsulas del navbar. En /explorar no aparece. Esperado: el mismo navbar en ambas.
- **d.** Con hover en "Blog", la píldora se mueve y el contorno de la cápsula "Explorar" queda cortado. Esperado: píldora limpia y retorno a "Explorar" al salir.
- **e.** Los chips "Sol y Playa" y "Deportes extremos" se ven con el contorno recortado arriba y abajo. Esperado: chip completo, vidrio estándar y al menos 44 px de alto.
- **f.** Entre el hero del Home y el bloque `p0_50` se ve una línea horizontal dura. Esperado: degradado sin corte.
- **g.** El rail de redes (`bottom: 221px`) tapa la pestaña "Ver todos". Esperado: rail más abajo, sin solaparse.
- **g.** Los botones del rail se ven translúcidos, sin logo ni color de red, y la tercera red es X. Esperado: cápsula de vidrio estándar con Instagram, Facebook y TikTok (X se elimina), cada uno con su logo oficial SVG a color completo: Instagram con degradado oficial y glifo blanco, Facebook `#1877F2` con la "f" blanca, TikTok fondo `#000` con la nota en `#25F4EE` y `#FE2C55` desplazados más blanco.
- **h.** Promociones, Más vendidos y Ver todos se ven transparentes, con texto vertical y cortado. Esperado: los colores del export de Figma (`index.astro`): Promociones `--semantic-action-cta` (#FDB813), Más vendidos `--semantic-status-danger` (#F97066) y Ver todos `--semantic-focus` (#00B7C7), con texto e icono `--semantic-text-on-action`; en reposo, icono o pestaña compacta; con hover o foco, nombre en horizontal.
- **i.** El modal Promociones muestra 2 tarjetas en una fila y un hueco grande abajo. Esperado: 2×2, con flechas de 4 en 4.
- **j.** Una tarjeta de vitrina navega a `catalogUrl({ region, featured })`, es decir a /explorar, y no al tour. Esperado: `/tour?tour={slug}`, igual que cualquier otra tarjeta (catálogo, Home, relacionados, blog, favoritos, mapa y estados).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Auth demo: iniciar y cerrar sesión, chrome con sesión (sidebar) y Auth Gate al pagar (3.1).
- Filtros del catálogo: categoría, búsqueda, orden y "Cargar más", con los mismos resultados y el mismo orden (3.2). Solo cambia el aspecto de los chips, no su lógica de selección (`chip()` y `setupCategories`).
- Formulario de contacto: validación y envío (`contact.ts`) (3.3).
- Centro legal: documentos y navegación (`legal.ts`) (3.4).
- i18n: `translateTree` y `i18n-dom.ts` traducen los textos, incluidos los de las tarjetas nuevas y de las pestañas desplegadas (3.5).
- Corrector de contraste: `contrast.ts` sigue corriendo y el auditor `contrast.mjs` no empeora la línea base (Claro ≤ 3, Colorido ≤ 2, Oscuro ≤ 2) (3.6).
- Chrome fijo: navbar, rail y FAB fijos al hacer scroll, con el cambio `.bt-nav-scrolled` y el ascenso del FAB sobre el colofón (3.7).
- Temas: Colorido, Claro, Oscuro y Sistema con sus tokens semánticos (3.8).
- fig2astro: regenerar no requiere editar el markup. Los arreglos estáticos van en `postprocess.mjs` (3.9).
- Accesibilidad: foco visible, área táctil de al menos 44 px y nombres accesibles (3.10). FAB, vitrina y menús con Escape, focus trap y retorno de foco (`panel.ts`, `menu.ts`) (3.11).

**Scope:**
Todo elemento que no cumple `isBugCondition` debe renderizarse y comportarse igual. Esto incluye:
- Textos, iconos e imágenes fuera de las superficies listadas.
- Lógica de datos de catálogo, Home, tour, contacto, legal y asistente.
- Overlays (`.bt-overlay`), el diálogo de auth y sus campos. Estos últimos solo cambian de token (`--bt-drop-text` pasa a `--bt-glass-text`) con el mismo valor resuelto o uno validado por contraste.

## Hypothesized Root Cause

1. **(a, b, e) `initGlass` es indiscriminado y gana por `!important`.** Marca `.bt-drop` en todo elemento con blur, incluidos el panel de información de la TourCard, el hero y los chips. Luego `.fig-stage .bt-drop { background-color; border; box-shadow; backdrop-filter: none } !important` pisa el estilo exportado de Figma. Los tokens `--bt-drop-*` son aproximaciones a mano (4 %, 38 %, 22 %), no valores extraídos de `body-{tema}`. El override de Claro al 72 % en navbar y rail crea un segundo vidrio distinto.
2. **(c) Capa de fondo propia del navbar en el Home.** El frame del Home exporta, detrás de las cápsulas, una franja o capa "Cristal" con relleno `surface/strong` o el azul Inmersivo. `setupNav` solo neutraliza esa capa en las pantallas donde la encuentra con el selector actual. Hay que validar con DOM: buscar el primer `div:empty` de ancho completo bajo `.bt-nav-row` en el Home y comparar con /explorar.
3. **(d) Recorte por overflow y apilamiento.** La píldora se inserta en la cápsula de enlaces (`.bt-nav-links`), que hereda `overflow: hidden` o `clip` del frame exportado ("Clip content"). El outline o borde del enlace activo dibuja fuera de su caja y se recorta. Además, `.bt-nav-links > a > div:empty` pierde `box-shadow` pero no su borde: queda medio borde visible bajo la píldora.
4. **(e) Chips con alto fijo.** El chip exportado tiene `height` fija (32 px) dentro de un contenedor con `overflow: hidden` y sin padding vertical. Al añadir `border: 1px` de `.bt-chip`, el contenido desborda 2 px y se recorta.
5. **(f) Fondos sólidos contiguos.** El hero termina en un bloque de imagen o velo y `p0_50` empieza con `surface/page` sólido, sin máscara ni degradado entre ambos.
6. **(g) Posición fija compartida.** `.bt-rail` (`bottom: 221px`, `right: -2px`) y las pestañas (`placeSideTab`, `--bt-peek-x`, `--bt-full-x`) ocupan la misma franja vertical derecha. No hay un sistema de "carril" que reserve espacio.
7. **(h) Pestañas laterales sin color y rotadas.** Las pestañas tienen `backdrop-filter`, así que `initGlass` las marca `.bt-drop` y su relleno de marca pasa a transparente. El diseño exportado las rota −90°, por eso el texto queda vertical. `placeSideTab` solo asoma el 60 %. Los colores ya están confirmados en el export de Figma (`index.astro`): `p0_13` = `--semantic-action-cta` (#FDB813, Promociones), `p0_17` = `--semantic-status-danger` (#F97066, Más vendidos) y `p0_18` = `--semantic-focus` (#00B7C7, Ver todos), con texto e icono `--semantic-text-on-action`. No hace falta recuperarlos de git. Lo mismo pasa con los botones del rail de redes: `initGlass` los marca porque heredan el blur de la cápsula y pierden su color de red. Además, `SOCIAL` en `fixed.ts` usa iconos genéricos monocromos y lista X en lugar de TikTok.
10. **(b) Sin modelo de disponibilidad en la tarjeta.** `CatalogTour` (`catalog.ts`) no tiene campo de agotado ni de cupos, y `fillCard` siempre pinta "Disponible" o "Quedan pocos" y la pill "Reservar". Tampoco hay CSS para foco, carga ni movimiento reducido en `.bt-card`.
8. **(i) Carrusel de una fila.** `showcase` usa `.bt-carousel` (flex horizontal con scroll-snap) y avanza un ancho de tarjeta por clic.
9. **(j) Destinos inconsistentes.** `home.ts card()` usa `catalogUrl({ region, featured })`. Hay tarjetas del Home, de relacionados y del blog que no pasan por `fillCard` y conservan el `href` del markup. Solo `fillCard` construye `/tour?tour=slug`.

## Correctness Properties

Property 1: Bug Condition - Vidrio estándar por tema

_For any_ superficie de vidrio X (navbar, sidebar, rail, modal, menú, chip o vitrina) renderizada en el tema T, el sistema corregido SHALL resolver relleno, borde, sombras, blur y color de texto de X a los valores de `figmaGlass(T)` extraídos de la capa `body-{T}`. Ningún selector `.bt-drop*` ni override por tema distinto de `--bt-glass-*` SHALL afectar a X.

**Validates: Requirements 2.1, 2.5, 2.7**

Property 2: Bug Condition - TourCard fiel a Figma con estados

_For any_ TourCard renderizada en cualquier vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa o estados), en cualquier tema, el sistema corregido SHALL mostrar el estilo de la variante Default del set `166:104691` y, con hover, la variante Hover. Además SHALL:
- con `:focus-visible`, mostrar el aspecto Hover más un anillo de 2 px `--semantic-focus`;
- mientras carga, mostrar el skeleton `.bt-card--loading` con la forma real (imagen 16:9, líneas de texto y precio) y el contenedor con `aria-busy="true"`, sin spinner;
- con `prefers-reduced-motion`, no animar elevación ni transición en hover o foco;
- mostrar correctamente las variantes de contenido: "Quedan pocos" (punto dorado), "Disponible", sin descuento (sin precio tachado) y con descuento (badge -N %);
- _for any_ tour con `cardState(tour) = "soldout"`, mostrar `.bt-card--soldout` atenuada con etiqueta "Agotado" (icono + texto traducido), sin pill "Reservar", con `href = tourHref(slug)` y con el texto de la tarjeta y la etiqueta en contraste WCAG 2.1 AA.

**Validates: Requirements 2.2, 2.3, 2.4, 2.15**

Property 3: Bug Condition - Navbar uniforme e indicador limpio

_For any_ pantalla con navbar (incluido el Home) y _for any_ opción del navbar con hover o foco, el sistema corregido SHALL renderizar las cápsulas sin capa de fondo sólida detrás y SHALL mover la píldora sin recortar el borde ni el outline de ninguna cápsula. Al salir del grupo, la píldora SHALL volver a "Explorar".

**Validates: Requirements 2.5, 2.6**

Property 4: Bug Condition - Chips, uniones de sección y carriles laterales

_For any_ chip de filtro superior, el sistema corregido SHALL mostrar el chip completo (sin recorte) con área táctil de al menos 44 px. _For any_ unión hero o imagen con fondo de sección SHALL fusionarlas con un degradado sin borde duro. _For any_ viewport de escritorio, el rail de redes y las pestañas laterales SHALL no intersectarse. El rail SHALL contener exactamente Instagram, Facebook y TikTok (sin X), cada botón con su logo oficial SVG a color completo, área táctil de al menos 44 px, `aria-label` con el nombre de la red y enlace a `instagram.com/borondotours`, `facebook.com/borondotours` y `tiktok.com/@borondotours`.

**Validates: Requirements 2.7, 2.8, 2.9**

Property 5: Bug Condition - Pestañas laterales de marca

_For any_ pestaña lateral (Promociones, Más vendidos, Ver todos), el sistema corregido SHALL pintarla con el token del export de Figma: Promociones `--semantic-action-cta`, Más vendidos `--semantic-status-danger` y Ver todos `--semantic-focus`. Texto e icono SHALL usar `--semantic-text-on-action` y cumplir AA. En reposo SHALL mostrar solo icono o pestaña compacta. Con hover o foco SHALL desplegar el nombre completo en horizontal, sin animación si `prefers-reduced-motion` está activo.

**Validates: Requirements 2.10, 2.11, 2.12**

Property 6: Bug Condition - Vitrina 2×2 paginada de 4 en 4

_For any_ lista de N tours de una vitrina y _for any_ índice de página p, la página p SHALL contener los tours `[4p, min(4p+4, N))` en una grilla de 2 filas por 2 columnas. "Siguiente" SHALL pasar a p+1 (deshabilitado si 4(p+1) ≥ N) y "Anterior" a p−1 (deshabilitado si p = 0).

**Validates: Requirements 2.13**

Property 7: Bug Condition - Toda tarjeta lleva al flujo de reserva

_For any_ tarjeta de tour con slug s, en cualquier vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa y estados), el `href` resuelto SHALL ser `tourHref(s)` = `/tour?tour={encodeURIComponent(s)}`. Ninguna tarjeta SHALL apuntar a /explorar, al checkout ni a `#`.

**Validates: Requirements 2.14**

Property 8: Preservation - Comportamiento fuera de la condición

_For any_ elemento o interacción donde `isBugCondition` es falso, el sistema corregido SHALL producir el mismo resultado que el original. Esto incluye: auth demo, resultados y orden de los filtros, contacto, centro legal, traducción, chrome fijo con `.bt-nav-scrolled`, temas, regeneración con fig2astro sin edición manual, accesibilidad de teclado y diálogos. El auditor `contrast.mjs` SHALL quedar en Claro ≤ 3, Colorido ≤ 2 y Oscuro ≤ 2.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11**

## Fix Implementation

### Paso 0 — Extraer el vidrio oficial de Figma (Antigravity Bridge)

Respetar `.kiro/steering/13-figma-bridge-safety.md`: `capture: false`, sin `getCSSAsync`, un nodo pequeño por llamada, `maxDepth` ≤ 3, devolver objetos mínimos y nada de `findAll` sobre la página.

1. Con `figma_execute_code`, cambiar a la página "Design System" y ubicar el set `166:104691`. Leer su variante **Default** y, dentro, las capas `body-colorido`, `body-claro` y `body-oscuro`. Leer también la variante **Hover** (diferencias de sombra, borde, escala y elevación).
2. Por cada capa, leer propiedades nativas, síncronas: `fills` (tipo, color, `opacity`, stops de gradiente), `strokes`, `strokeWeight`, `strokeAlign`, `effects` (DROP_SHADOW, INNER_SHADOW, BACKGROUND_BLUR con radio, offset, spread y color), `cornerRadius` / `rectangleCornerRadii`, `opacity`, `blendMode` y `boundVariables`. Resolver cada variable a su nombre de token (`glass/fill`, `glass/rim-hi`, …). Usar la opacidad del paint, porque Figma ignora el alfa de la variable.
3. Leer también la tipografía y el color del texto dentro de cada `body-*` (rol `text/*`), el radio de la tarjeta, la imagen 16:9, los badges y el precio, para reconstruir la TourCard.
4. Guardar el volcado en `otros/design/b2c/css-dump/tourcard-glass.md`, con una tabla por tema y la traducción a CSS. Así no hay que volver a extraer.

### Paso 1 — Tokens únicos de vidrio

**File**: `apps/web/src/styles/fig-runtime.css` (o `tokens.css` si los valores son semánticos de marca)

- Definir por tema (`:root` para Colorido, `[data-theme="claro"]`, `[data-theme="oscuro"]`, y `[data-theme="sistema"]` en las dos media queries): `--bt-glass-fill`, `--bt-glass-fill-strong`, `--bt-glass-stroke` (puede ser un gradiente para el borde con mask), `--bt-glass-shadow` (lista completa de sombras exteriores e interiores), `--bt-glass-blur` y `--bt-glass-text`. Todos con los valores del Paso 0.
- Una sola clase `.bt-glass-std` (y el modificador `.bt-glass-std--strong` para modales y menús) que aplica los tokens. El borde degradado se resuelve con pseudo-elemento y `mask`.
- Eliminar `--bt-drop-*`, `.bt-drop` y `.bt-drop-strong`, y el override Claro al 72 % de `.bt-nav-glass` / `.bt-rail`. Los usos de `--bt-drop-text` (auth, chips, filtros, rango, switch) pasan a `--bt-glass-text`.
- Si en Claro el auditor empeora sobre la franja del encabezado, ajustar `--bt-glass-fill` del tema dentro de los valores de Figma y documentar la desviación en el volcado. No reintroducir overrides por elemento.

### Paso 2 — `initGlass` con lista explícita

**File**: `apps/web/src/lib/fig/runtime/glass.ts`

- Reemplazar el barrido por blur por selectores explícitos: `.bt-nav-glass`, `.bt-nav-capsule`, sidebar (`findSidebar`), `.bt-rail` (solo la cápsula), `.bt-glass` (paneles), `.bt-menu`, `.bt-chip` y `[role="dialog"]` (strong).
- Excluir de forma explícita las TourCard (grilla del catálogo, `.bt-card`), el hero (`setupHero`), las pestañas laterales `a.p0_13`, `a.p0_17` y `a.p0_18`, y los botones internos del rail (`.bt-rail-link`).
- Exportar una función pura `glassTargetKind(el): "std" | "strong" | null` para probarla en vitest.

### Paso 3 — Navbar del Home e indicador

**Files**: `fixed.ts` (`setupNav`), `chrome.ts` (`setupIndicator`), `fig-runtime.css`, `postprocess.mjs`

- Identificar la capa de fondo propia del navbar del Home (franja o "Cristal" de ancho completo bajo `.bt-nav-row`). Si es estática, neutralizarla en `postprocess.mjs` para el frame del Home. Si no, hacerlo en `setupNav` con la misma regla que en /explorar.
- Indicador: `overflow: visible` en `.bt-nav-links` y sus ancestros de cápsula, con el recorte trasladado a la capa de vidrio `::before` si hace falta. Quitar `border` y `outline` de `.bt-nav-links > a > div:empty`. El borde del activo lo dibuja solo la píldora. La píldora usa `inset` calculado dentro del padding de la cápsula, para no tocar su borde.

### Paso 4 — Chips

**File**: `fig-runtime.css` (y `postprocess.mjs` si el alto fijo viene del markup)

- `.bt-chip`: `min-height: 44px`, `height: auto`, `box-sizing: border-box`, padding vertical, y el borde vía `.bt-glass-std`. El contenedor de la fila de chips: `overflow: visible` vertical (scroll-x si hace falta) y padding vertical para el foco.

### Paso 5 — Uniones entre secciones

**Files**: `postprocess.mjs` (marca `data-bt-seam` en los bloques contiguos detectados, por ejemplo hero → `p0_50`) y `fig-runtime.css`

- Aplicar `mask-image: linear-gradient(to bottom, #000 80%, transparent)` a la imagen o velo superior, o un `::before` en la sección inferior con `linear-gradient(to bottom, transparent, var(--semantic-surface-page))`. Usar tokens; nada de hex.

### Paso 6 — Carril derecho: rail y pestañas

**Files**: `fixed.ts` (`ensureRail`), `home.ts` (`placeSideTab`, `setupSideTabs`), `fig-runtime.css`

- Definir un carril derecho con tokens `--bt-lane-tabs-top` y `--bt-lane-rail-bottom`. Las pestañas ocupan la franja superior y el rail se baja (sobre el FAB, respetando `.bt-colophon-visible`).
- Pestañas: sacarlas del marcado `.bt-drop` (Paso 2) y quitar la rotación −90° (con `postprocess.mjs` si la rotación viene del markup, o con CSS `transform: none` sobre `.bt-side-tab`). Restaurar el color por pestaña con los tokens semánticos que ya usa el export de Figma, sin crear tokens nuevos: `a.p0_13` (Promociones) → `--semantic-action-cta`, `a.p0_17` (Más vendidos) → `--semantic-status-danger`, `a.p0_18` (Ver todos) → `--semantic-focus`. Texto e icono con `--semantic-text-on-action`. En reposo: icono o pestaña compacta. Con `:hover` / `:focus-visible`: se despliega en horizontal con `max-width` y `transform`, y sin transición bajo `prefers-reduced-motion`. `placeSideTab` deja de calcular peek y full en función de la rotación.
- Rail de redes: la cápsula `.bt-rail` usa `.bt-glass-std`; los botones internos (`.bt-rail-link`) no son vidrio. Las redes son Instagram, Facebook y TikTok; **X se elimina** de `SOCIAL` en `fixed.ts`.
  - Tokens en `fig-runtime.css`:
    - `--bt-social-instagram-gradient`: degradado oficial `#FEDA75 → #FA7E1E → #D62976 → #962FBF → #4F5BD5`.
    - `--bt-social-facebook`: `#1877F2`.
    - `--bt-social-tiktok`: `#000`.
  - Logos oficiales como SVG inline en `SOCIAL` (`fixed.ts`), a color completo:
    - Instagram: fondo con el degradado oficial y glifo blanco. El `<linearGradient>`/`<radialGradient>` usa un `id` único por instancia (por ejemplo con sufijo generado) para no colisionar si el rail se monta más de una vez.
    - Facebook: círculo `#1877F2` con la "f" blanca.
    - TikTok: fondo `#000` con la nota en `#25F4EE` y `#FE2C55` desplazados, más la nota blanca encima.
  - Cada enlace conserva su URL (`instagram.com/borondotours`, `facebook.com/borondotours`, `tiktok.com/@borondotours`), lleva `aria-label` con el nombre de la red y el SVG va con `aria-hidden="true"`. Área táctil ≥ 44 px.
  - **Excepción documentada:** estos colores son de marcas de terceros, no tokens de BorondoTours. Se permiten solo dentro de los logos del rail y no se usan en otros componentes. El corrector de contraste (`contrast.ts`) no debe recolorear estos SVG.

### Paso 7 — Vitrina 2×2

**File**: `home.ts` (`showcase`), CSS de `.bt-carousel`

- Extraer la función pura `pageOf(list, page, size = 4)` y `pageCount(n, size = 4)` (por ejemplo en `apps/web/src/lib/fig/runtime/paging.ts`).
- Reemplazar el scroll horizontal por `.bt-showcase-grid` (CSS grid `repeat(2, 1fr)` en 2 filas). Las flechas cambian la página, actualizan `disabled` y el contador "Página x de y", con `aria-live="polite"`. Se conserva el focus trap y Escape de `createPanel`.

### Paso 8 — TourCard única y `href` de reserva

**Files**: `apps/web/src/lib/fig/catalog.ts` (`CatalogTour`, dataset demo, `fillCard`, `cardState`), `home.ts` (`card`), `tour.ts` (relacionados), `i18n-content.ts`, `fig-runtime.css` y los módulos de blog, favoritos, mapa y estados que pinten tarjetas

- Extraer la función pura `tourHref(slug)`, que siempre devuelve `/tour?tour=${encodeURIComponent(slug)}`, sin modos ni variante de checkout. Usarla en toda tarjeta de cualquier vista: catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa y estados. `home.ts card()` deja de usar `catalogUrl`.
- Las tarjetas de vitrina y las del markup que no pasan por `fillCard` reciben la misma estructura y las mismas clases de la TourCard reconstruida en el Paso 0: Default y Hover. Los `<a>` del markup con slug conocido se normalizan con `tourHref`.
- Estados estándar en toda tarjeta de cualquier vista (Property 2, 2.4), en `fig-runtime.css` y en el módulo que pinta la tarjeta:
  - `:focus-visible`: estilo Hover más anillo de 2 px `--semantic-focus` (outline con offset, sin recortarse por `overflow` del contenedor).
  - Skeleton `.bt-card--loading`: bloque de imagen 16:9, líneas de título y metadatos y bloque de precio con la forma real; el contenedor de la grilla o carrusel lleva `aria-busy="true"` mientras carga y lo quita al terminar. Sin spinner.
  - `@media (prefers-reduced-motion: reduce)`: sin `transform` ni `transition` en hover y foco.
  - Variantes de contenido: "Quedan pocos" (punto dorado), "Disponible", sin descuento (oculta el precio tachado) y con descuento (badge -N %).
- Estado Agotado (2.15):
  - **Datos:** `CatalogTour` (`apps/web/src/lib/fig/catalog.ts`) gana el campo `soldOut?: boolean` (o se deriva de cupos si el tour los trae). El dataset demo incluye al menos un tour agotado.
  - **Función pura** `cardState(tour): "available" | "low" | "soldout"`: `soldout` si `soldOut` es verdadero o los cupos son 0; `low` si aplica "Quedan pocos"; si no, `available`. `fillCard`, `home.ts card()` y demás pintores la usan para decidir la variante.
  - **Visual:** clase `.bt-card--soldout`, atenuada (por ejemplo imagen desaturada y opacidad solo en la imagen) sin bajar el texto de AA; etiqueta "Agotado" con icono, no solo color; sin pill "Reservar". La tarjeta sigue siendo `<a href={tourHref(slug)}>`, donde el viajero elige otra fecha o se une a la lista de espera (Spec-B RF-B05b).
  - **i18n:** clave para "Agotado" en `i18n-content.ts` (es y en como mínimo).

## Testing Strategy

### Validation Approach

Primero se demuestran los defectos sobre el código sin arreglar (contraejemplos que confirmen o refuten las hipótesis 1–10). Después se verifica el arreglo (fix checking) y que lo demás no cambió (preservation checking). Por último, se compara visualmente contra Figma en los 3 temas.

### Exploratory Bug Condition Checking

**Goal**: obtener contraejemplos antes del arreglo (hipótesis 1–10). Si una hipótesis se refuta, se vuelve a formular antes de seguir.

**Test Plan**: con Playwright contra el build local (`pnpm --filter @borondo/web build` + preview), en Colorido, Claro y Oscuro:

1. **Vidrio TourCard**: en /explorar, verificar que el panel de la primera tarjeta tiene `.bt-drop` y `backdrop-filter: none` (confirma la hipótesis 1).
2. **Navbar Home**: comparar el `background-color` computado y el primer `div:empty` bajo `.bt-nav-row` entre el Home y /explorar (hipótesis 2).
3. **Indicador**: hover en "Blog" y medir el `overflow` computado de `.bt-nav-links` y sus ancestros. Captura del nodo de la cápsula con `scale ≤ 1` (hipótesis 3).
4. **Chips**: comparar `getBoundingClientRect` del chip contra el `scrollHeight` del contenido y el `overflow` del contenedor (hipótesis 4).
5. **Rail**: calcular la intersección del rect de `.bt-rail` con el de `a.p0_13`, `a.p0_17` y `a.p0_18` en 1440×900 (hipótesis 6).
6. **Pestañas**: leer `classList` (`.bt-drop`), el `background-color` computado y la rotación de `transform` (hipótesis 7).
7. **Vitrina**: abrir Promociones y contar filas distintas por `offsetTop` (hipótesis 8).
8. **Hrefs**: recolectar todos los `a` de tarjetas en Home, vitrinas, /explorar, tour (relacionados), blog, favoritos, mapa y estados, y listar los que no cumplen `/tour?tour=` (hipótesis 9).
9. **Rail**: leer `classList` y `background-color` computado de cada `.bt-rail-link`; confirmar que heredan `.bt-drop`, no tienen logo a color y que la tercera red es X (hipótesis 7).
10. **Estados de tarjeta**: enfocar una tarjeta con Tab y leer el `outline` computado; recargar /explorar con red lenta y buscar `.bt-card--loading` y `aria-busy`; marcar un tour como agotado y verificar que la tarjeta se ve igual a una disponible (hipótesis 10).

**Expected Counterexamples**: `.bt-drop` en las TourCard; fondo sólido solo en el Home; `overflow: hidden` en la cápsula; chip con `scrollHeight` mayor que `clientHeight`; intersección rail–pestaña distinta de vacía; pestañas y botones del rail transparentes, y pestañas rotadas; rail con X y sin logos a color; una sola fila en la vitrina; `href` hacia /explorar; tarjeta sin anillo de foco ni skeleton, y tour agotado idéntico a uno disponible.

### Fix Checking

**Pseudocode:**
```
FOR ALL (X, T) WHERE isBugCondition(X, T) DO
  result := render_fixed(X, T)
  ASSERT expectedBehavior(result)   // Properties 1–7
END FOR
```

### Preservation Checking

**Pseudocode:**
```
FOR ALL (X, T) WHERE NOT isBugCondition(X, T) DO
  ASSERT render_original(X, T) = render_fixed(X, T)
END FOR
```

**Testing Approach**: se usan pruebas basadas en propiedades (fast-check en vitest) para la lógica pura y para los filtros, porque generan muchas combinaciones automáticamente. Antes del arreglo se registran los resultados del código actual (filtros, auth, chrome) y luego se exige igualdad.

**Test Cases**:
1. **Filtros**: para combinaciones aleatorias de categoría, búsqueda, orden y página, la lista resultante (slugs y orden) es igual antes y después.
2. **Auth demo**: login y logout, sidebar visible con sesión y Auth Gate al pagar (Playwright).
3. **Chrome fijo**: tras scroll, navbar, rail y FAB conservan `position: fixed`, aparece `.bt-nav-scrolled` y el FAB sube sobre el colofón.
4. **Contacto, legal e i18n**: las pruebas existentes de vitest siguen en verde. Cambiar de idioma traduce los textos de las pestañas desplegadas y de las tarjetas nuevas.
5. **Teclado y diálogos**: Tab recorre navbar, chips, tarjetas y pestañas con foco visible. Vitrina, FAB y menús cierran con Escape y devuelven el foco.
6. **Contraste**: `node otros/infra/fig2astro/contrast.mjs` en los 3 temas da Claro ≤ 3, Colorido ≤ 2 y Oscuro ≤ 2.
7. **fig2astro**: regenerar y aplicar `postprocess.mjs` sin diffs manuales en las páginas generadas.

### Unit Tests (vitest, `vitest --run`)

- `pageOf` / `pageCount`: listas de 0, 1, 3, 4, 5, 8 y 9 tours; límites de "Anterior" y "Siguiente".
- `tourHref`: slugs con tildes, espacios y caracteres reservados; siempre devuelve `/tour?tour=…`.
- `glassTargetKind`: devuelve `null` para TourCard, hero, pestañas laterales y botones internos del rail; `"strong"` para diálogos y menús; `"std"` para navbar, cápsula del rail y chips.
- `cardState`: `soldOut: true` → `"soldout"`; cupos 0 → `"soldout"`; caso "Quedan pocos" → `"low"`; resto → `"available"`. El dataset demo contiene al menos un tour con `cardState = "soldout"`.
- `fillCard` con tour agotado: agrega `.bt-card--soldout`, muestra la etiqueta "Agotado" con icono, no renderiza la pill "Reservar" y deja `href = tourHref(slug)`. "Agotado" tiene traducción en `i18n-content.ts`.
- `SOCIAL` (`fixed.ts`): exactamente Instagram, Facebook y TikTok, cada uno con `aria-label`, URL esperada y SVG inline; los `id` de gradiente son únicos al renderizar el rail dos veces.
- Utilidad del carril derecho: rectángulos de rail y pestañas sin intersección para los altos de viewport soportados.

### Property-Based Tests (fast-check)

- Property 6: para todo N en [0, 60] y toda página válida p, la concatenación de páginas reproduce la lista sin repetidos y cada página tiene como máximo 4 elementos.
- Property 7: para todo slug generado, `tourHref` produce una URL con ruta `/tour` que, parseada, devuelve el mismo slug en `tour` y ningún otro parámetro.
- Property 2: para todo `CatalogTour` generado, `cardState` devuelve exactamente uno de `"available" | "low" | "soldout"`; es `"soldout"` si y solo si `soldOut` es verdadero o los cupos son 0; y la tarjeta pintada nunca tiene pill "Reservar" cuando es `"soldout"`, pero su `href` sigue siendo `tourHref(slug)`.
- Property 8: para filtros aleatorios, el resultado del filtrado es idéntico al del código original.

### Integration Tests (Playwright)

- **Indicador**: hover sucesivo en cada opción. La píldora cubre la opción y ninguna cápsula se recorta (`overflow` visible y borde de la cápsula intacto en captura del nodo). Al salir, la píldora vuelve a "Explorar".
- **Vitrina 2×2**: 4 tarjetas en 2 filas distintas y 2 columnas. "Siguiente" muestra las 4 siguientes.
- **Solapamiento**: intersección vacía entre el rail y las pestañas en 1440×900 y 1280×720.
- **Pestañas**: el fondo resuelve a `--semantic-action-cta`, `--semantic-status-danger` y `--semantic-focus` respectivamente, y el texto a `--semantic-text-on-action`. `writing-mode` horizontal y sin rotación. Con hover o foco el nombre se ve completo.
- **Rail**: la cápsula usa el vidrio estándar; hay 3 enlaces (Instagram, Facebook, TikTok) y ninguno de X; cada uno contiene su SVG oficial a color (degradado de Instagram, `#1877F2` de Facebook, fondo `#000` con `#25F4EE`/`#FE2C55` de TikTok), `aria-label` con el nombre de la red y área ≥ 44 px.
- **Estados de tarjeta (toda vista)**: con Tab, la tarjeta enfocada muestra anillo de 2 px `--semantic-focus` y aspecto Hover; durante la carga el contenedor tiene `aria-busy="true"` y tarjetas `.bt-card--loading`; con `reducedMotion: 'reduce'`, hover y foco no tienen `transition` ni `transform`; las variantes "Quedan pocos", "Disponible", con y sin descuento se ven correctas.
- **Agotado**: la tarjeta del tour agotado tiene `.bt-card--soldout`, etiqueta "Agotado" visible con icono, sin pill "Reservar"; el clic lleva a `/tour?tour={slug}`; el texto de la tarjeta y la etiqueta cumplen AA (Axe sin errores de contraste) en los 3 temas.
- **Clic en tarjeta**: desde cada vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa y estados), la navegación termina en `/tour?tour={slug}` y nunca en el checkout.
- **Navbar Home vs /explorar**: mismos estilos computados del vidrio de las cápsulas.

### Visual Verification (Figma, 3 temas)

- Comparar la TourCard (Default y Hover), navbar, chips, rail, vitrina y pestañas contra Figma en Colorido, Claro y Oscuro. Usar el volcado del Paso 0 como referencia numérica (relleno, borde, sombras, radio).
- Capturas de Figma solo de nodos pequeños con `capture_node_ids` y `scale ≤ 1`. Capturas del navegador por componente, no de página completa.
- Criterio de salida: valores computados iguales a los del volcado (con tolerancia de redondeo de color de ±1 en 8 bits) y auditor de contraste sin empeorar la línea base.
