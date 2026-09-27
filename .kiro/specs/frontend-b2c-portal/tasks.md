# Implementation Plan: Frontend Portal B2C (Fase 1)

## Overview

Este plan convierte el diseño del Portal B2C (`apps/web`, Astro 5 SSG + islands React 19) en pasos de código incrementales. Se construye de adentro hacia afuera: primero la base de tokens y las **funciones puras de `src/lib/`** (objetivo del property-based testing con fast-check), luego la UI Library, el layout, y finalmente las tres vistas (Landing, Discovery, Tour Detail) que integran todo. Cada tarea se apoya en las anteriores y termina cableando componentes en páginas Astro, sin dejar código huérfano.

Convenciones aplicadas de los steering: TypeScript strict sin `any`, nombres en inglés, textos vía `t('namespace:key')`, HTML del backend solo vía `SafeHtml` (DOMPurify), access token solo en memoria (nanostores), Tailwind CSS 4 con tokens de marca BorondoTours (colibrí barbudo del páramo, _Oxypogon guerinii_), cobertura ≥ 80% en `src/lib/` y componentes modificados. Las sub-tareas marcadas con `*` son de testing y opcionales para un MVP más rápido.

## Tasks

- [x] 1. Estructura del proyecto y base de testing
  - [x] 1.1 Configurar frameworks de testing y estructura de carpetas
    - Configurar Vitest + fast-check (unit/property), Testing Library (component), Playwright + axe (E2E/a11y) en `apps/web`
    - Crear el árbol `src/lib/`, `src/components/{ui,layout,landing,discovery,detail}/`, `src/stores/`, `src/layouts/`, `src/styles/` según el diseño
    - Añadir scripts `test`, `test:run`, `lint`, `build` y config de cobertura (≥80% en `src/lib/`)
    - _Requirements: 21.7_
  - [x] 1.2 Definir modelos de datos y tipos de API en TypeScript
    - Crear tipos `ApiResponse<T>`, `Region`, `DurationBucket`, `Difficulty`, `TourSummary`, `TourDetail`, `GalleryPhoto`, `AddOn`, `TourInstance`, `TourPageData`, `CatalogState`, `SearchCriteria`, `DateAvailability`, `AvailabilityStatus`
    - Sin `any`; mapeo `snake_case` (API) ↔ `camelCase` (código) documentado
    - _Requirements: 11.4, 14.2, 15.2, 16.5, 17.2_

- [x] 2. Sistema de diseño (tokens, tema Tailwind, fuentes)
  - [x] 2.1 Crear design tokens de marca (`styles/tokens.css`)
    - Definir los 8 colores de marca, fondo/texto por defecto, tokens del semáforo, familias/tamaños/alturas de línea tipográficas y los 2 degradados como CSS custom properties
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 5.8_
  - [x] 2.2 Mapear tokens a Tailwind CSS 4 (`@theme`) y validación de build
    - Exponer colores y tokens tipográficos como utilidades Tailwind vía `@theme`
    - Añadir paso de validación en `astro build` que falle indicando el token faltante si un componente referencia un token no definido
    - _Requirements: 1.8, 1.9, 1.10_
  - [x] 2.3 Configurar fuentes web (`styles/fonts.css`)
    - `@font-face` para Sora (800/700/600) e Inter (400/600) únicamente, con `font-display: swap` y respaldo `system-ui` explícito
    - `<link rel="preload">` y `size-adjust`/`ascent-override` para mantener CLS < 0.1
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.4 Implementar `typographyMultiplier` (`lib/typography.ts`)
    - Función pura que devuelve 0.85 (<768), 0.95 (768–1024), 1 (>1024)
    - _Requirements: 1.6_
  - [x]* 2.5 Property test — escalado tipográfico
    - **Property 1: Multiplicador tipográfico por rango de viewport**
    - **Validates: Requirements 1.6**
    - Incluir fronteras 767/768/1024/1025 en el generador; ≥100 iteraciones

- [x] 3. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 4. Funciones puras de dominio (`src/lib/`) y property tests
  - [x] 4.1 Implementar `availabilityStatus` (`lib/availability.ts`)
    - Semáforo puro con precedencia: `!isOffered||isPast`→gray; `total<=0`/inválido→gray; `available<=0`→red; `>=0.5`→green; `1%–49%`→yellow; exactamente un estado por fecha
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x]* 4.2 Property test — semáforo de disponibilidad
    - **Property 2: El semáforo asigna exactamente un estado según precedencia y umbrales**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**
    - Generar `total=0`, NaN/no finito, `available` negativo o > `total`, combinaciones `isPast`/`isOffered`; ≥100 iteraciones
  - [x] 4.3 Implementar `formatPriceCop` y `formatDuration` (`lib/format.ts`)
    - Precio "Desde $X COP por persona" con separador de miles y sin depender del locale del entorno; duración "N días / M noches" o "N horas"
    - _Requirements: 15.2_
  - [x]* 4.4 Property test — formateo de precio COP
    - **Property 5: Formateo de precio en COP**
    - **Validates: Requirements 15.2**
  - [x]* 4.5 Property test — formateo de duración
    - **Property 6: Formateo de duración según campos presentes**
    - **Validates: Requirements 15.2**
  - [x] 4.6 Implementar `parseCatalogState`/`serializeCatalogState` (`lib/queryParams.ts`)
    - Serializar/parsear el estado del catálogo desde/hacia `URLSearchParams`; normalizar `q` (trim), rango de precio `0<=min<=max<=999_999_999`, `sort` default "popular", `view` default "list"
    - _Requirements: 12.3, 13.3, 13.8, 13.9, 13.10_
  - [x]* 4.7 Property test — round-trip del estado del catálogo
    - **Property 3: Round-trip de serialización del estado del catálogo**
    - **Validates: Requirements 9.4, 12.4, 13.8, 13.10**
  - [x]* 4.8 Property test — invariantes de normalización del estado
    - **Property 4: Invariantes de normalización del estado del catálogo**
    - **Validates: Requirements 12.3, 13.3, 13.9**
  - [x] 4.9 Implementar geo (haversine + filtro 50 km) (`lib/geo.ts`)
    - Distancia haversine y selección de tours cercanos: excluye el actual, `<=50km`, orden ascendente por distancia, longitud `<=6`
    - _Requirements: 18.1, 18.2_
  - [x]* 4.10 Property test — selección de tours cercanos
    - **Property 7: Resultado de tours cercanos (filtro geográfico 50 km)**
    - **Validates: Requirements 18.1, 18.2**
  - [x]* 4.11 Property test — métrica de distancia
    - **Property 8: La distancia geográfica es una métrica bien formada**
    - **Validates: Requirements 18.1**
    - Incluir antípodas y punto idéntico en el generador
  - [x] 4.12 Implementar `initialMonth`/`selectDate` (`lib/calendar.ts`)
    - `selectDate` reemplaza selección solo para green/yellow y conserva para red/gray (máx. 1 fecha); `initialMonth` = primer mes con fecha verde/amarilla, con default determinista (mes actual)
    - _Requirements: 17.3, 17.4, 17.5_
  - [x]* 4.13 Property test — selección del calendario
    - **Property 10: La selección del calendario mantiene a lo sumo una fecha**
    - **Validates: Requirements 17.4, 17.5**
  - [x]* 4.14 Property test — mes inicial del calendario
    - **Property 11: Mes inicial del calendario**
    - **Validates: Requirements 17.3**
  - [x] 4.15 Implementar `sanitizeHtml` (`lib/sanitize.ts`)
    - DOMPurify con allowlist estricta `{p,strong,em,ul,ol,li,a,br,h2,h3}`, `a` solo con `href`; elimina `script/iframe/form/input/style` y todo atributo `on*`; contenido no sanitizable → vacío
    - _Requirements: 16.7, 20.6, 20.7_
  - [x]* 4.16 Property test — allowlist de sanitización
    - **Property 12: La sanitización de HTML solo deja pasar la allowlist**
    - **Validates: Requirements 16.7, 20.6**
    - Generar payloads con `script/iframe/form/input/style`, `on*` y atributos arbitrarios; parsear el DOM resultante
  - [x]* 4.17 Property test — idempotencia de la sanitización
    - **Property 13: La sanitización de HTML es idempotente**
    - **Validates: Requirements 16.7, 20.6, 20.7**
  - [x]* 4.18 Unit tests — casos límite de `lib/`
    - Fronteras 49%/50%, `total=0`, `priceMin>priceMax`, `q` con espacios, mínimo 2 caracteres, valores exactos de marca
    - _Requirements: 1.6, 5.2, 5.3, 12.3, 13.3, 15.2_

- [x] 5. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 6. Internacionalización (i18n)
  - [x] 6.1 Implementar resolución de claves (`lib/i18n/resolve.ts`)
    - `resolve(key, activeLng, catalogs)`: idioma activo → fallback `es` → clave literal; nunca cadena vacía; log de desarrollo si falta en ambos
    - _Requirements: 19.4, 19.5, 3.9, 7.5_
  - [x]* 6.2 Property test — resolución i18n con fallback
    - **Property 9: Resolución i18n con fallback determinista**
    - **Validates: Requirements 19.4, 19.5, 3.9, 7.5**
    - Generar claves ausentes en idioma activo y en `es`
  - [x] 6.3 Configurar i18next y proveedor compartido entre islands (`lib/i18n/index.ts`)
    - `lng: 'es'`, `fallbackLng: 'es'`, namespaces `common/nav/footer/home/discovery/detail`; provider + store para reaccionar a cambio de idioma sin tocar componentes
    - _Requirements: 19.1, 19.2, 19.3, 19.6_

- [x] 7. Estado de sesión y capa de datos
  - [x] 7.1 Implementar `sessionStore` (`stores/session.ts`)
    - Access token solo en memoria (nanostores); nunca en `localStorage`/`sessionStorage`; logout limpia memoria; recarga/cierre descarta el token
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  - [x]* 7.2 Unit tests — seguridad del session store
    - Verificar ausencia de escritura en almacenamiento persistente y limpieza en logout
    - _Requirements: 20.1, 20.2, 20.3_
  - [x] 7.3 Implementar capa de fetch + configuración TanStack Query
    - Cliente que consume `{ data, error, meta }`: `error!=null`/no-2xx → estado error; `data=null,error=null` → vacío; mensajes de usuario vía `t('common:error.*')`, nunca `error.message` crudo; `staleTime: 300s` para catálogo; timeout 10s con reintento sin layout shift
    - _Requirements: 21.3, 21.6_

- [x] 8. UI Library
  - [x] 8.1 Implementar `Button`
    - Variantes primary (Turquesa/blanco, contraste ≥4.5:1; hover→Verde ≤300ms), cta (Dorado/Negro), secondary (borde ≥3:1, texto ≥4.5:1); foco visible ≥3:1; disabled `opacity<=0.5` + `aria-disabled` + bloqueo de `onClick`; etiqueta vía i18n con fallback de clave
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [x]* 8.2 Component tests — Button
    - Variantes/estados, bloqueo de `onClick` deshabilitado, render de etiqueta i18n y fallback de clave
    - _Requirements: 3.2, 3.6, 3.7, 3.8, 3.9_
  - [x] 8.3 Implementar `GlassSurface`
    - `backdrop-filter: blur` + borde 1px opacidad ≤30%; overlay con contraste ≥4.5:1; `@supports not` → fondo sólido opaco ≥4.5:1; uso solo sobre imagen
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 8.4 Implementar `Card` y `TourCard`
    - `Card` con radio/espaciado según tokens; `TourCard` con foto+`alt` no vacío (decorativa `alt=""`), nombre, duración, precio base y badge de operador como elementos visibles distintos; variante glass; foco visible ≥3:1 y activación Enter/Espacio cuando es interactiva
    - _Requirements: 4.1, 4.6, 4.7, 4.8, 22.5_
  - [x]* 8.5 Component tests — GlassSurface y TourCard
    - Elementos visibles distintos, `alt` no vacío, activación con Enter/Espacio, fallback de fondo sólido
    - _Requirements: 4.5, 4.6, 4.7, 4.8_
  - [x] 8.6 Implementar `Image` (wrapper `@unpic/react`)
    - `srcset` 400/800/1200w; `loading` configurable (eager above-the-fold / lazy con margen 200px); placeholder con `alt` en fallo de carga sin bloquear el render
    - _Requirements: 21.1, 21.4, 21.5_
  - [x] 8.7 Implementar `Skeleton`
    - Placeholder animado usado en toda carga asíncrona en lugar de spinner
    - _Requirements: 21.2_
  - [x] 8.8 Implementar componente `SafeHtml`
    - Único punto de render de HTML del backend usando `sanitizeHtml`; ante contenido no procesable renderiza vacío/`fallbackKey` sin insertar el original
    - _Requirements: 16.1, 16.3, 20.5, 20.7_
  - [x]* 8.9 Component tests — SafeHtml
    - Render de allowlist y fallback ante contenido no sanitizable
    - _Requirements: 16.3, 20.7_
  - [x] 8.10 Implementar `useFocusTrap` y utilidades de teclado
    - Hook de focus trap (Tab/Shift+Tab dentro del contenedor), cierre con Escape y retorno de foco al disparador; reutilizable por menú móvil, drawer y modales
    - _Requirements: 22.6, 22.7, 22.8_

- [x] 9. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 10. Layout base y navegación
  - [x] 10.1 Implementar `Base.astro` con skip-link
    - `<html lang>`, `<head>` (metadatos, preloads), skip-link como primer elemento tabulable que mueve foco a `#main`, montaje de Navbar y Footer
    - _Requirements: 22.1_
  - [x] 10.2 Implementar `Navbar` (island `client:idle`)
    - Enlaces Destinos/Experiencias/Nosotros/Blog/Contacto, CTA Dorado "Planifica tu viaje"; glass sobre hero (≥4.5:1) y sólido al salir del hero vía IntersectionObserver; ≥768px en línea, <768px menú móvil con `aria-label`/`aria-expanded`, Escape devuelve foco (usa `useFocusTrap`); logo horizontal ≥160px con `alt`; textos vía i18n
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  - [x]* 10.3 Component tests — Navbar
    - Glass vs. sólido al scroll, menú móvil (`aria-expanded`, Escape devuelve foco)
    - _Requirements: 6.4, 6.5, 6.7_
  - [x] 10.4 Implementar `Footer`
    - Cuatro promesas en orden fijo con título, texto e icono Lucide (Hoja/Cámara/Escudo/Personas); textos vía i18n con fallback `es` sin mostrar clave cruda; presente en Landing/Discovery/Detail
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x]* 10.5 Component tests — Footer
    - Orden fijo de promesas, iconos correctos, fallback i18n sin clave cruda
    - _Requirements: 7.1, 7.3, 7.5_

- [x] 11. Landing page
  - [x] 11.1 Implementar `Hero`
    - Imagen de paisaje 100% ancho con overlay oscuro (contraste ≥4.5:1); H1 y subtítulo de marca en Sora; imagen `loading="eager"` y `alt=""`; fallback a fondo oscuro sólido; sin recorte ni scroll horizontal <768px; textos vía i18n
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_
  - [x] 11.2 Implementar `SearchWidget` (island `client:idle`)
    - `GlassSurface` sobre el hero con campos Destino (0–120), Fechas (no pasada al enviar), Viajeros (1–99, inicial 1) y botón Dorado "Buscar aventura"; envío válido → navega a Discovery con query params; inválido → cancela, muestra error asociado al campo (`aria-describedby`) y preserva valores; labels/placeholders vía i18n
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 22.4, 22.9_
  - [x]* 11.3 Component tests — SearchWidget
    - Validación con mensaje asociado al campo y preservación de valores; navegación con query params correctos
    - _Requirements: 9.4, 9.5, 9.6_
  - [x] 11.4 Implementar `DestinationsSection` y trust badges
    - 3–8 `TourCard` glass sobre foto; sección de trust badges con las 4 promesas + iconos; click navega a `/tours/:slug`; imágenes below-the-fold con lazy a 200px; `Skeleton` durante carga; error con reintento preservando el resto de la página
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [x] 11.5 Cablear `index.astro`
    - Componer Base + Hero + SearchWidget + DestinationsSection + trust badges + Footer con las directivas de cliente mínimas
    - _Requirements: 8.1, 9.1, 10.1, 10.2, 7.6_
  - [x]* 11.6 Component tests — estados de la landing
    - Skeleton en lugar de spinner, estado de error con reintento preservando contenido
    - _Requirements: 10.5, 10.6_

- [x] 12. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 13. Catálogo Discovery
  - [x] 13.1 Implementar `discovery.astro` y `CatalogController`
    - URL como fuente de verdad: leer estado al montar (hidratar `filtersStore`), disparar `QUERY /tours/search`, reflejar cambios en URL ≤500ms, conservar filtros entre vistas; componer con Base y Footer
    - _Requirements: 13.6, 13.8, 13.10, 13.11, 14.5, 7.6_
  - [x] 13.2 Implementar `CatalogGrid`
    - 3 col ≥1025px / 2 col 768–1024px / 1 col ≤767px; `TourCard` con foto+`alt`/nombre/duración/precio/badge; 12 skeletons en primera carga; estado vacío con "limpiar filtros"; error con reintento conservando filtros; paginación de 12
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_
  - [x] 13.3 Implementar `SearchBar`
    - 0–100 chars, mínimo 2 para disparar; debounce 300ms; escribe `q` normalizado (trim) en URL; hidrata desde `q`; sin resultados conservando texto; error conservando último catálogo; limpiar elimina `q`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  - [x] 13.4 Implementar `FilterPanel` y `SortSelect`
    - Filtros Destino (7 regiones), Duración (4), Precio (rango `min<=max`), Dificultad (4), "Incluye pasaporte" (IVA exento) con combinación AND; "Limpiar filtros" visible con ≥1 filtro; orden con 4 opciones (default "Más popular"); hidrata desde URL; limpiar resetea filtros+orden+URL; <768px en drawer lateral sin colapsar el grid (usa `useFocusTrap`)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7, 13.9, 13.12, 13.13_
  - [x] 13.5 Implementar `MapView` (island `client:visible`, Mapbox GL JS)
    - Toggle Lista/Mapa (Lista por defecto, indicación visual); render ≤3s con un marcador por tour con coordenadas válidas según filtros; centro `[-74.2973, 4.5709]` zoom 5; un solo popup a la vez (foto/nombre/precio/"Ver detalle"); estado vacío sin coordenadas; fallback a lista si no carga en 3s conservando filtros; token desde env var
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6, 14.7, 14.8_
  - [x]* 13.6 Component tests — estados de Discovery
    - Estado vacío, error conservando último catálogo, drawer de filtros <768px, hidratación desde URL
    - _Requirements: 11.6, 12.5, 12.6, 13.10, 13.13_
  - [x]* 13.7 E2E — flujo de Discovery
    - Búsqueda (debounce, mínimo 2 chars), filtros/orden con URL como fuente de verdad y recarga que hidrata; toggle Lista/Mapa conservando filtros
    - _Requirements: 12.2, 13.8, 13.10, 14.5_

- [x] 14. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 15. Tour Detail
  - [x] 15.1 Implementar `tours/[slug].astro` y fetch de `page-data`
    - Consumir `GET /tours/:slug/page-data` (tour, instancias, semilla de cercanos); componer Base + islands + Footer
    - _Requirements: 7.6_
  - [x] 15.2 Implementar `Gallery` (island `client:visible`)
    - Slider 1–20 fotos con thumbnails y controles; `alt` descriptivo por foto informativa / `alt=""` decorativa; placeholder si no hay fotos; fallback por foto que no carga
    - _Requirements: 15.1, 15.8, 15.9, 15.10_
  - [x] 15.3 Implementar `TourInfo` y elemento sticky de precio/CTA
    - Nombre como único H1, destino/región, duración formateada, precio "Desde $X COP por persona"; badge operador + badge dificultad con colores de token; "IVA exento disponible" si aplica; card lateral sticky ≥1024px / barra inferior fija <1024px visible durante scroll
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  - [x] 15.4 Implementar descripción larga y add-ons
    - Descripción (≤20.000 chars) vía `SafeHtml`; omitir bloque si vacía/ausente; si no procesa, omitir y mostrar "contenido no disponible" sin HTML crudo; secciones "¿Qué incluye/NO incluye/llevar?" solo con datos; 1–50 add-ons con nombre/descripción/precio; omitir sección sin add-ons
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  - [x] 15.5 Implementar `AvailabilityCalendar` (island `client:visible`, react-day-picker)
    - Colores del semáforo por token vía `availabilityStatus`; posiciona en `initialMonth`; selección con `selectDate` (green/yellow reemplaza, red/gray bloquea e indica); 2 meses ≥1024px / 1 mes <1024px; `aria-label` por fecha con cupos entero ≥0; al seleccionar fecha con cupos actualiza precio del CTA ≤1s; si falla el precio conserva el previo e indica el error
    - _Requirements: 17.1, 17.2, 17.6, 17.7, 17.8, 17.9, 17.10_
  - [x] 15.6 Implementar `NearbyTours`
    - Carrusel ≤6 tours dentro de 50km (vía `lib/geo.ts`) ordenados por distancia, excluye el actual; skeleton mientras carga; oculta la sección si falla/no responde en ≤3s o si no hay tours en 50km
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  - [x]* 15.7 Component tests — Tour Detail
    - `aria-label` por fecha del calendario con cupos ≥0, indicación visual de bloqueo, fallback de galería/descripción
    - _Requirements: 15.9, 15.10, 16.3, 17.5, 17.8_
  - [x]* 15.8 E2E — flujo de Tour Detail
    - Galería, calendario (selección verde/amarillo, bloqueo rojo/gris, actualización de precio del CTA), tours cercanos (aparición/ocultamiento)
    - _Requirements: 15.1, 17.4, 17.5, 17.9, 18.1, 18.3_

- [x] 16. Verificación de accesibilidad e integración
  - [x]* 16.1 axe — accesibilidad en Landing, Discovery y Tour Detail
    - Sin violaciones A/AA; contraste ≥4.5:1 (texto)/≥3:1 (grande, componentes, foco); no depender solo del color (semáforo con texto/iconografía)
    - Verificar que todo control de entrada tiene `label`/`aria-label` y que toda imagen de contenido tiene `alt` no vacío (decorativas `alt=""`)
    - _Requirements: 22.2, 22.3, 22.4, 22.5, 22.10, 5.9_
  - [x]* 16.2 E2E — teclado y foco
    - Skip-link como primer tabulable que mueve foco a `#main`; recorrido Tab/Shift+Tab/Enter/Escape; focus trap y retorno de foco en menú móvil, drawer y modales
    - _Requirements: 22.1, 22.6, 22.7, 22.8_
  - [x]* 16.3 E2E — flujo end-to-end y fallbacks
    - Landing → SearchWidget → Discovery con query params correctos; fallback de Mapbox a lista y de imágenes a placeholder
    - _Requirements: 9.4, 14.7, 21.5_

- [x] 17. Checkpoint final — Ensure all tests pass, ask the user if questions arise.

## Notes

- Las sub-tareas marcadas con `*` son de testing (property, unit, component, E2E, axe) y opcionales para un MVP más rápido; las tareas de implementación núcleo nunca son opcionales.
- Cada property test usa **fast-check** con **≥100 iteraciones** y se etiqueta con el formato: **Feature: frontend-b2c-portal, Property {number}: {property_text}**.
- Toda la lógica computable vive en `src/lib/` como funciones puras, separadas de la UI, para ser property-tested; los componentes/islands se cubren con Testing Library, y los flujos con Playwright + axe.
- Cero valores hardcodeados: colores/tipografía vía tokens (R1.9), textos vía i18n (R19.1), HTML del backend solo vía `SafeHtml`, token de Mapbox solo por env var.
- Cobertura objetivo ≥ 80% en `src/lib/` y componentes modificados; CI verde (lint + test + build) como condición de merge.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.4", "4.1", "4.3", "4.6", "4.9", "4.12", "4.15", "6.1", "7.1", "7.3"] },
    { "id": 2, "tasks": ["2.2", "2.5", "4.2", "4.4", "4.5", "4.7", "4.8", "4.10", "4.11", "4.13", "4.14", "4.16", "4.17", "4.18", "6.2", "6.3", "7.2"] },
    { "id": 3, "tasks": ["8.1", "8.3", "8.4", "8.6", "8.7", "8.8", "8.10"] },
    { "id": 4, "tasks": ["8.2", "8.5", "8.9", "10.2", "10.4"] },
    { "id": 5, "tasks": ["10.1", "10.3", "10.5", "11.1", "11.2", "11.4", "13.2", "13.3", "13.4", "13.5", "15.2", "15.3", "15.4", "15.5", "15.6"] },
    { "id": 6, "tasks": ["11.5", "13.1", "15.1"] },
    { "id": 7, "tasks": ["11.3", "11.6", "13.6", "13.7", "15.7", "15.8", "16.1", "16.2", "16.3"] }
  ]
}
```
