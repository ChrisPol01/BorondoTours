# Implementation Plan: B2C Pixel-Perfect Redesign

## Overview

Implementar en TypeScript el rediseño de `apps/web` siguiendo estrictamente las 15 etapas `1 → 2 → 2-1 → 3 → 4 → 5 → 6 → 20 → 21 → 21-1 → 21-2 → 22 → 23 → 24 → 25`. Cada etapa adapta primero componentes existentes, mantiene Astro SSG y React 19 islands mínimas, y queda bloqueada hasta superar su gate automatizado independiente. Spec A gobierna Discovery y Spec B gobierna Tour Detail; los mockups gobiernan composición, mientras la marca BorondoTours (colibrí barbudo del páramo, _Oxypogon guerinii_) gobierna identidad.

Las capacidades con requisito y contrato aprobados se implementan como comportamiento contract-backed mediante adapters Zod existentes. Las capacidades sin contrato o `Product_Approval` se implementan solo como `Visual_Only_State`, sin requests, persistencia, uploads, WebSocket, éxito simulado ni efectos de negocio. Este plan no autoriza endpoints, esquemas, cálculos, reglas, roles, transiciones, migraciones ni recursos AWS nuevos.

## Tasks

- [ ] 1. Preparar foundations, trazabilidad y harness de verificación
  - [x] 1.1 Crear manifests ejecutables de etapas, contratos y regresión
    - Crear tipos y fixtures versionados para `StageManifest`, `VisualBaselineManifest`, `BehavioralRegressionMatrix`, `EvaluationEntry`, `ContractReadiness` e `IslandRegistry` bajo `apps/web/src/lib` y `apps/web/tests/fixtures`.
    - Registrar rutas, dependencias compartidas, anclas, diferencias aprobadas y evidencia de Spec A/Spec B sin convertir huecos contractuales en APIs nuevas.
    - Hacer que el estado de etapa solo permita iniciar la siguiente cuando el gate anterior esté aprobado.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.8, 24.1–24.12, 29.13, 31.1, 31.2, 31.9–31.11_

  - [x] 1.2 Consolidar el sistema visual Borondo Tours en Tailwind CSS 4
    - Adaptar `tokens.css`/`@theme` con Sora, Inter, colores canónicos, degradados, geometría responsive, elevación, glass y fallback opaco WCAG.
    - Implementar procedencia de tokens derivados y eliminar literales de marca duplicados en componentes; preservar proporción, área de respeto y tamaño del logo.
    - Excluir GSAP y Three.js mientras no exista storyboard o geometría 3D aprobada; aplicar reduced motion con CSS/nativo.
    - _Requirements: 2.1–2.11, 25.1–25.7, 27.2, 27.10_

  - [x] 1.3 Implementar layouts y primitives compartidos accesibles
    - Adaptar `Base.astro` hacia `PublicLayout.astro` y crear `AccountLayout.astro` sin PII, con skip link, landmarks, encabezados, compensación del header y slots estáticos.
    - Crear/adaptar `ResponsiveImage`, `LiquidGlassSurface`, `StatusMessage`, skeletons y dialog/drawer canónicos con foco, Escape y retorno al disparador.
    - Mantener regiones estáticas en Astro y registrar solo islands React con la directiva mínima aprobada.
    - _Requirements: 3.1–3.7, 4.1–4.12, 5.1–5.9, 6.1–6.8, 27.1–27.12, 28.1–28.10_

  - [ ] 1.4 Implementar view models, adapters tipados y capability gate
    - Crear `RemoteViewState`, `CapabilityController`, `resolveCapability` y adapters Zod snake_case→camelCase sin `any`.
    - Asegurar que `visual_only` y `contract_dependent` no monten clientes API ni handlers de efecto y que solo contratos aprobados habiliten conducta.
    - Estandarizar timeout, cancelación, stale response, retry y errores públicos sin recalcular reglas financieras en UI.
    - _Requirements: 4.8, 24.10–24.12, 28.5, 28.6, 31.3, 31.6, 31.8, 31.10, 31.11_

  - [ ] 1.5 Implementar foundations de i18n, SEO, contenido seguro y privacidad
    - Unificar catálogos Astro/React con español por defecto/fallback, pseudo-locale 130%, formatos `Intl` y publicación exclusiva de locales completos.
    - Implementar `SeoDescriptor`, canonical, Open Graph, robots, sitemap, hreflang y JSON-LD veraz para Organization, WebSite, TouristTrip, Offer y BreadcrumbList.
    - Endurecer `SafeHtml_Renderer`, redacción de sinks y configuración pública para impedir secretos, tokens o PII en HTML, URLs, storage, logs, telemetría y errores.
    - _Requirements: 26.1–26.9, 30.6, 30.7, 32.1–32.14, 33.1–33.10_

  - [ ] 1.6 Crear el harness determinista de tests y gates por etapa
    - Configurar Vitest/Testing Library/fast-check, MSW, Playwright/axe, Chromium, fuentes locales, reloj fijo, fixtures sintéticos, mapas stub y animaciones deshabilitadas.
    - Implementar comparación `maxDiffPixelRatio: 0.005`, aserciones de anclas ±2px, selección transitiva de rutas por componente y reportes de bytes gzip por ruta/island.
    - Crear comandos de una sola ejecución para lint sin warnings, typecheck, cobertura ≥80%, tests, build Astro estático y auditorías de bundle/secretos.
    - _Requirements: 28.11–28.14, 29.1–29.13, 30.1–30.8_

  - [ ]* 1.7 Escribir property test del prefijo secuencial de etapas
    - **Property 1: Stage history is a valid gated prefix**
    - Usar fast-check con mínimo 100 ejecuciones y comentario `Feature: b2c-pixel-perfect-redesign, Property 1: Stage history is a valid gated prefix`.
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 1.8 Escribir property test de redacción de valores sensibles
    - **Property 17: Sensitive values do not reach forbidden sinks**
    - Generar marcadores de PII, documentos, salud, tokens, pagos y mensajes para comprobar URLs, storage, logs, telemetría, bundles y errores.
    - **Validates: Requirements 20.6, 23.7, 26.9**

  - [ ]* 1.9 Escribir property test del gate de aprobación
    - **Property 20: Approval status controls effect capability**
    - Comprobar que solo requisitos, contratos y aprobación completos habilitan efectos.
    - **Validates: Requirements 24.11, 24.12, 31.10, 31.11**

  - [ ]* 1.10 Escribir property test del fallback i18n
    - **Property 21: i18n fallback is deterministic**
    - **Validates: Requirements 26.3, 26.4, 33.7**

  - [ ]* 1.11 Escribir property test de sanitización HTML
    - **Property 22: HTML sanitization enforces the allowlist**
    - Verificar protocolos seguros, eliminación de elementos/atributos prohibidos e idempotencia.
    - **Validates: Requirements 26.5, 26.6**

  - [ ]* 1.12 Escribir property test de impacto de componentes compartidos
    - **Property 23: Shared-component impact selection is complete**
    - **Validates: Requirements 1.6, 29.5**

  - [ ]* 1.13 Escribir property test de publicación canónica
    - **Property 25: Canonical publication excludes private and user-filtered routes**
    - **Validates: Requirements 32.2, 32.4, 32.6**

  - [ ]* 1.14 Escribir property test de reciprocidad hreflang
    - **Property 26: Hreflang links are reciprocal**
    - **Validates: Requirements 32.3**

  - [ ]* 1.15 Escribir property test de datos estructurados veraces
    - **Property 27: Structured data is a truthful projection**
    - **Validates: Requirements 32.9, 32.10, 32.12**

  - [ ]* 1.16 Escribir property test de completitud de locales
    - **Property 28: Locale publication requires completeness**
    - **Validates: Requirements 33.2, 33.10**

  - [ ]* 1.17 Escribir property test de cambio de locale sin pérdida de estado
    - **Property 29: Locale changes preserve compatible navigation state**
    - **Validates: Requirements 33.3, 33.4**

  - [ ]* 1.18 Escribir property test de formatos regionales
    - **Property 30: Regional formatting preserves source values**
    - **Validates: Requirements 33.5**

  - [ ]* 1.19 Escribir property test de integridad de tokens de marca (Ave_Azul_Tokens)
    - **Property 31: Ave Azul token integrity**
    - **Validates: Requirements 2.2, 2.5, 2.10**

  - [ ]* 1.20 Escribir property test de geometría responsive operable
    - **Property 32: Responsive interaction geometry remains operable**
    - Generar anchos 375–1440px y labels de hasta 130% para detectar overflow, intersección y targets menores de 44×44px.
    - **Validates: Requirements 3.4, 3.5, 3.7, 6.3, 6.8, 33.8**

  - [ ]* 1.21 Escribir property test de completitud del Evaluation Inventory
    - **Property 33: Evaluation entries are complete and safely gated**
    - **Validates: Requirements 24.10, 24.11, 24.12**

  - [ ]* 1.22 Escribir property test de imágenes responsive
    - **Property 34: Responsive image descriptors preserve semantics and geometry**
    - **Validates: Requirements 27.5, 28.1, 28.7**

  - [ ]* 1.23 Escribir property test de aislamiento de hidratación
    - **Property 35: Route hydration dependencies are isolated**
    - **Validates: Requirements 4.6, 5.9, 28.8, 28.9**

- [ ] 2. Etapa 1 — Implementar Mockup 1: Home
  - [ ] 2.1 Adaptar Header, Footer y CanonicalTourCard compartidos
    - Implementar navegación desktop/mobile sin solapamientos, focus trap/return, trust badges de marca BorondoTours y tarjeta canónica con slots sin markup duplicado.
    - Mantener acciones contract-backed existentes; representar “Planifica tu viaje” como `Visual_Only_State` mientras no tenga aprobación.
    - _Requirements: 2.8, 2.9, 6.1–6.8, 7.1–7.7, 8.5, 8.6, 24.1_

  - [ ] 2.2 Implementar la composición Home estática y su búsqueda mínima
    - Adaptar `/`, hero prioritario Astro, copy, buscador glass, destinos, destacados y footer para 1440 y 375; usar `HomeSearchIsland client:idle` solo para estado y validación.
    - Preservar navegación a `/discovery`, query params e inputs después de error; no agregar scrollytelling no aprobado.
    - _Requirements: 3.1–3.7, 5.1, 5.4, 8.1–8.7, 25.3, 31.3–31.5_

  - [ ]* 2.3 Escribir property test de opcionales de CanonicalTourCard
    - **Property 2: Optional TourCard data creates no phantom content**
    - **Validates: Requirements 7.4**

  - [ ]* 2.4 Escribir property test de búsqueda no destructiva
    - **Property 4: Search validation is non-destructive**
    - **Validates: Requirements 8.3, 8.4, 31.5**

  - [ ]* 2.5 Verificar independientemente la etapa Home
    - Añadir component/E2E para header, drawer, búsqueda, tarjeta, teclado, reduced motion, i18n 130%, SEO/JSON-LD, WCAG/axe y regresión funcional Home→Catálogo.
    - Capturar `/` a 1440×900 y 375×812, comprobar ≤0.5% diff, anclas ±2px, LCP/INP/CLS, bundle e hidratación; ejecutar lint, typecheck, cobertura, tests y build estático.
    - Actualizar manifests ejecutables de etapa, regresión, islands, tokens, diferencias y baseline solo con aprobación registrada.
    - _Requirements: 1.3, 1.4, 1.6, 27.1–27.12, 28.11–28.14, 29.1–29.13, 30.1–30.5_

- [ ] 3. Checkpoint — Etapa 1 aprobada
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Etapa 2 — Implementar Mockup 2: Catálogo
  - [ ] 4.1 Adaptar CatalogController al baseline contract-backed de Spec A
    - Implementar búsqueda, filtros acumulativos, chips, orden, paginación, lista/mapa y estados remotos usando URL canónica como fuente de verdad y `CanonicalTourCard`.
    - Alinear request con `TourSearchSchema` o mantener el adapter contract-dependent; conservar slugs/query params y no crear endpoints de búsqueda o nearby.
    - Implementar drawer mobile accesible, debounce ≤500ms, clear filters, empty/error/retry y último resultado válido.
    - _Requirements: 9.1–9.5, 9.8–9.13, 31.3, 31.4, 31.8; Spec A RF-A04–RF-A07_

  - [ ] 4.2 Aislar CatalogMapIsland y cross-selling aprobado
    - Separar Mapbox en `client:visible`, importar dinámicamente, proyectar solo coordenadas válidas y ofrecer fallback lista sin perder filtros.
    - Reutilizar únicamente contratos aprobados de Spec A para marcadores/nearby; cualquier falta contractual permanece contract-dependent sin inventar backend.
    - _Requirements: 5.3, 5.5, 9.6, 9.7, 28.8, 28.9; Spec A RF-A08, RF-A09_

  - [ ]* 4.3 Escribir property test del round trip de URL del catálogo
    - **Property 3: Catalog URL canonical round trip**
    - **Validates: Requirements 9.2, 9.4, 9.11, 9.12, 9.13, 31.4**

  - [ ]* 4.4 Escribir property test del modelo de marcadores
    - **Property 6: Map marker model matches valid filtered tours**
    - **Validates: Requirements 9.6**

  - [ ]* 4.5 Escribir property test de estados asíncronos recuperables
    - **Property 24: Async state machines preserve recoverable context**
    - **Validates: Requirements 9.10, 10.8, 28.6, 31.8**

  - [ ]* 4.6 Verificar independientemente la etapa Catálogo
    - Añadir MSW/component/E2E para URL, filtros, sort, paginación, list/map, drawer/foco, empty/error/timeout/stale y compatibilidad Spec A.
    - Capturar `/discovery` a ambos viewports con axe, teclado, anclas y diff; repetir Home y TourCard por blast radius.
    - Ejecutar Core Web Vitals, bundle isolation, lint, typecheck, cobertura, tests y build; actualizar matrices/manifests sin aprobar contratos ausentes.
    - _Requirements: 1.4, 1.6, 9.1–9.13, 27.1–27.12, 28.11–28.14, 29.1–29.13, 30.1–30.5, 31.1–31.4_

- [ ] 5. Checkpoint — Etapa 2 aprobada
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Etapa 3 — Implementar Mockup 2-1: Tour seleccionado
  - [ ] 6.1 Adaptar la ruta de tour y sus regiones Astro
    - Implementar `/tours/[slug]` con galería shell, breadcrumbs, H1, datos, descripción segura, incluidos/no incluidos, recomendaciones, add-ons, precio base y cercanos según Spec B.
    - Mantener contenido estático fuera de React, `CanonicalTourCard` para cercanos, SafeHtml para HTML remoto y datos estructurados veraces sin inventar ratings/ofertas.
    - _Requirements: 5.4, 7.2, 10.1, 10.2, 10.14, 26.5–26.7, 32.9, 32.10, 32.12; Spec B RF-B01–RF-B04, RF-B08, RF-B09_

  - [ ] 6.2 Implementar GalleryIsland, BookingCalendarIsland e intención protegida
    - Usar `client:visible`; limitar calendario a mes, fecha, disponibilidad, precio y mensajes, con dos meses ≥1024px y uno debajo.
    - Preservar selección/precio válido ante fecha inválida o error; comunicar disponibilidad sin depender del color y pasar solo contexto permitido al Auth Gate/checkout.
    - Mantener waitlist, reviews, favoritos, pax/add-ons o precio remoto contract-dependent si falta contrato; no crear endpoints, jobs ni persistencia.
    - _Requirements: 10.3–10.13, 15.1–15.5, 24.11, 31.6, 31.7; Spec B RF-B01, RF-B04–RF-B07_

  - [ ]* 6.3 Escribir property test de selección segura de calendario
    - **Property 7: Calendar selection transition is single-valued and safe**
    - **Validates: Requirements 10.5, 10.7**

  - [ ]* 6.4 Escribir property test de intención protegida mínima
    - **Property 8: Protected intent preserves only allowed purchase context**
    - **Validates: Requirements 10.12, 15.1, 15.5, 31.7**

  - [ ]* 6.5 Verificar independientemente la etapa Tour Detail
    - Añadir contract/component/E2E para galería diferida, calendario teclado, disponibilidad, cambio/error de precio, Auth Gate, SafeHtml y date→auth→checkout sin PII.
    - Capturar `/tours/[slug]` a ambos viewports con axe/anclas/diff; repetir Home, Catálogo y TourCard.
    - Validar JSON-LD, CWV, chunks de galería/calendario, lint, typecheck, cobertura, tests y build estático; reconciliar Spec B vs `Visual_Only_State` en manifests.
    - _Requirements: 1.4, 1.6, 10.1–10.14, 27.1–27.12, 28.8–28.14, 29.1–29.13, 30.1–30.5, 31.1–31.11_

- [ ] 7. Checkpoint — Etapas públicas contract-backed aprobadas
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Etapa 4 — Implementar Mockup 3: Destinos
  - [ ] 8.1 Crear `/destinations` como composición Astro
    - Implementar hero, métricas, mosaico regional, conteos, estados vacíos, CTA y footer; usar enlaces nativos a `/discovery` con región canónica.
    - Mantener recomendador en `Visual_Only_State` y registrar su contrato/owner pendiente sin handler.
    - _Requirements: 5.4, 11.1–11.5, 24.1, 31.4, 31.10_

  - [ ]* 8.2 Verificar independientemente la etapa Destinos
    - Probar enlaces/empty state, SEO, i18n 130%, teclado, axe y capturas 1440×900/375×812; repetir Header/Footer/Home si cambian compartidos.
    - Ejecutar lint, typecheck, cobertura, tests, build, CWV y manifest de etapa.
    - _Requirements: 1.4, 1.6, 11.1–11.5, 27.1–27.12, 29.1–29.13, 30.1–30.5_

- [ ] 9. Etapa 5 — Implementar Mockup 4: Experiencias
  - [ ] 9.1 Crear `/experiences` como composición Astro
    - Implementar categorías, métricas y promesas de confianza con enlaces nativos canónicos; conservar categoría en el estado vacío del catálogo.
    - _Requirements: 5.4, 12.1–12.5, 31.4_

  - [ ]* 9.2 Escribir property test de enlaces nativos de discovery
    - **Property 5: Native discovery links project exactly one intended filter**
    - Cubrir regiones de Destinos y categorías de Experiencias sin alterar defaults ajenos.
    - **Validates: Requirements 11.2, 12.2**

  - [ ]* 9.3 Verificar independientemente la etapa Experiencias
    - Probar navegación/empty state, SEO, i18n, teclado, axe y capturas en ambos viewports; repetir Header/Footer/Home cuando aplique.
    - Ejecutar lint, typecheck, cobertura, tests, build, CWV y manifest de etapa.
    - _Requirements: 1.4, 1.6, 12.1–12.5, 27.1–27.12, 29.1–29.13, 30.1–30.5_

- [ ] 10. Checkpoint — Etapas 3 y 4 aprobadas
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Etapa 6 — Implementar Mockup 5: Blog
  - [ ] 11.1 Crear `/blog` y `/blog/[slug]` con publicación SSG segura
    - Implementar hero, destacado, filtros visuales, categorías, orden, grid, populares y newsletter; generar artículos solo desde contenido publicado aprobado.
    - Reflejar criterios en URL cuando exista fuente aprobada; mantener CMS, búsqueda remota y newsletter en `Visual_Only_State` sin suscripción ni éxito simulado si faltan contratos.
    - Renderizar HTML editorial solo mediante SafeHtml y producir metadata/structured data únicamente con campos reales.
    - _Requirements: 13.1–13.7, 24.2, 26.5–26.7, 31.4, 31.10, 32.1–32.14_

  - [ ]* 11.2 Verificar independientemente la etapa Blog
    - Probar SSG, URL/empty state, SafeHtml, capability gate, SEO/social, locale, teclado, axe y capturas de listado/artículo en ambos viewports.
    - Ejecutar source-failure gate, lint, typecheck, cobertura, tests, build, CWV y regresión de Header/Footer/cards tipográficas.
    - _Requirements: 1.4, 1.6, 13.1–13.7, 27.1–27.12, 28.11–28.14, 29.1–29.13, 30.1–30.5_

- [ ] 12. Etapa 7 — Implementar Mockup 6: Nosotros y Contacto
  - [ ] 12.1 Crear `/about` con regiones estáticas de marca BorondoTours
    - Implementar historia, métricas, valores, equipo y CTA con fotografía, iconografía y jerarquía del mockup sin hidratación innecesaria.
    - _Requirements: 2.1–2.11, 5.4, 14.1_

  - [ ] 12.2 Crear `/contact` con enlaces seguros y capabilities gated
    - Implementar datos configurables, horarios, CTA WhatsApp, fallback de dirección y `OfficeMapIsland client:visible`.
    - Habilitar `ContactFormIsland` solo ante endpoint aprobado; de lo contrario renderizar formulario accesible `Visual_Only_State` sin request ni captura de PII.
    - _Requirements: 14.1–14.7, 24.2, 26.8, 26.9, 31.10, 31.11_

  - [ ]* 12.3 Escribir property test de enlaces externos configurados
    - **Property 9: Configured external links are safe**
    - **Validates: Requirements 14.2, 14.7, 26.8, 26.9**

  - [ ]* 12.4 Verificar independientemente la etapa About/Contact
    - Probar configuración, allowlist HTTPS, mapa visible/fallback, formulario enabled/visual-only, teclado, axe, SEO y capturas de ambas rutas en ambos viewports.
    - Ejecutar lint, typecheck, cobertura, tests, build, CWV y regresión de todas las rutas públicas aprobadas.
    - _Requirements: 1.4, 1.6, 14.1–14.7, 27.1–27.12, 28.11–28.14, 29.1–29.13, 30.1–30.5_

- [ ] 13. Checkpoint — Todas las etapas públicas aprobadas
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Etapa 8 — Implementar Mockup 20: Panel de usuario
  - [ ] 14.1 Implementar AccountShellIsland y seguridad de sesión
    - Crear shells estáticos `AccountLayout`/`AccountShellIsland client:load` con skeleton reservado, `noindex,nofollow` y cero PII en HTML.
    - Implementar bootstrap/refresh coordinado desde cookie HttpOnly, access token solo en memoria, gates CLIENT, 401/403 y logout con limpieza completa de caches/stores.
    - No crear contratos de auth faltantes; mantener adapters contract-dependent hasta disponer de schemas aprobados.
    - _Requirements: 4.2, 15.6–15.10, 26.9, 30.8, 32.6, 32.7_

  - [ ] 14.2 Crear `/mi-cuenta` y DashboardIsland
    - Reproducir saludo, próximo tour/empty, métricas, Coins, XP/nivel, actividad, recomendaciones, ayuda y navegación lateral después del gate.
    - Usar `CanonicalTourCard`; separar datos contract-backed de feed/countdown/recomendaciones `Visual_Only_State` sin aparentar datos reales.
    - _Requirements: 16.1–16.6, 24.3, 31.3, 31.10_

  - [ ]* 14.3 Escribir property test de confidencialidad de sesión
    - **Property 10: Session transitions preserve confidentiality**
    - **Validates: Requirements 15.7, 15.8, 15.10**

  - [ ]* 14.4 Verificar independientemente la etapa Dashboard
    - Probar direct navigation, bootstrap, 401→refresh→retry, refresh failure, 403, logout, noindex, ausencia de PII y login→`/mis-reservas`/dashboard.
    - Capturar `/mi-cuenta` en ambos viewports con fixtures sintéticos, axe y teclado; ejecutar lint, typecheck, cobertura, tests, build y regresión Header/account nav.
    - _Requirements: 15.1–15.10, 16.1–16.6, 27.1–27.12, 29.1–29.13, 30.1–30.8_

- [ ] 15. Etapa 9 — Implementar Mockup 21: Mis Tours
  - [ ] 15.1 Crear `/mis-reservas` y LifecycleView contract-gated
    - Implementar categorías mutuamente excluyentes, filtros por año/destino, estados vacíos y acciones voucher/reseña solo según capability aprobada.
    - Renderizar itinerario en vivo, ubicación, emergencia y contacto anticipado como `Visual_Only_State` cuando carezcan de contrato.
    - _Requirements: 17.1–17.9, 24.4, 31.3, 31.6, 31.10_

  - [ ]* 15.2 Escribir property test de clasificación lifecycle
    - **Property 12: Lifecycle classification is total and mutually exclusive**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

  - [ ]* 15.3 Escribir property test de filtros y acciones lifecycle
    - **Property 13: Lifecycle filters and actions are capability-derived**
    - **Validates: Requirements 17.5, 17.6, 17.7**

  - [ ]* 15.4 Verificar independientemente la etapa Mis Tours
    - Probar clasificación con reloj fijo, filtros, empty states, capabilities y recorrido login→mis reservas; no duplicar reglas de estado no aprobadas.
    - Capturar `/mis-reservas` en ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión Dashboard/AccountShell.
    - _Requirements: 17.1–17.9, 27.1–27.12, 29.1–29.13, 30.1–30.8, 31.1–31.11_

- [ ] 16. Checkpoint — Shell privado y lifecycle aprobados
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Etapa 10 — Implementar Mockup 21-1: Detalle de reserva
  - [ ] 17.1 Crear `/mis-reservas/[reference]` y acciones protegidas
    - Implementar resumen, itinerario, viajeros, pagos proyectados, contactos, mapa diferido, voucher, soporte y cancelación dentro del shell gated.
    - Consumir solo preview/voucher/cancelación contract-backed; mostrar penalidad/Coins del contrato sin recalcular, exigir OTP antes de efecto y evitar PII en URLs.
    - Mantener documentos, pagos de saldo y demás gaps como `Visual_Only_State`; no inferir deep links o endpoints.
    - _Requirements: 18.1–18.8, 24.5, 26.9, 31.6, 31.10, 31.11_

  - [ ]* 17.2 Verificar independientemente la etapa Detalle de reserva
    - Probar autorización, malformed contract, voucher, canal seguro, preview/OTP, no-refundable, mapa/fallback y que visual-only no emita efectos.
    - Capturar la ruta a ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión AccountShell/Lifecycle.
    - _Requirements: 18.1–18.8, 27.1–27.12, 29.1–29.13, 30.1–30.8, 31.1–31.11_

- [ ] 18. Etapa 11 — Implementar Mockup 21-2: Proceso de reserva
  - [ ] 18.1 Crear `/checkout` y BookingWizardIsland
    - Implementar pasos, progress semantics, drafts, validación por paso, pasajeros, add-ons, resumen, pago y confirmación bajo `client:load`.
    - Conservar intención protegida y valores tras errores; mantener Split Fare/alternativas sin aprobación como `Visual_Only_State` sin request.
    - _Requirements: 19.1–19.4, 19.12, 24.5, 27.4, 27.9, 31.5, 31.7, 31.10_

  - [ ] 18.2 Conectar quote y pago solo a oráculos contract-backed
    - Proyectar subtotal, Coins, IVA y total desde `packages/domain` o quote aprobado, sin fórmula frontend paralela.
    - Enviar mutación idempotente solo a endpoint aprobado; distinguir confirmación con referencia, pendiente y fallo con retry seguro.
    - _Requirements: 19.5–19.11, 31.6, 31.8, 31.11_

  - [ ]* 18.3 Escribir property test de proyección del quote
    - **Property 15: Checkout quote projection follows the approved oracle**
    - **Validates: Requirements 19.5, 19.6, 19.7, 31.6**

  - [ ]* 18.4 Escribir property test de estados de pago no confirmados
    - **Property 16: Non-confirmed payments never become confirmed UI**
    - **Validates: Requirements 19.9, 19.10, 19.11**

  - [ ]* 18.5 Verificar independientemente la etapa Checkout
    - Añadir component/MSW/E2E para validación/foco, quote oracle, Coins limitados, idempotencia, 409/422/429/timeout, pending/failure y date→Auth Gate→checkout.
    - Capturar `/checkout` a ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión Auth/Calendar/AccountShell.
    - _Requirements: 19.1–19.12, 27.1–27.12, 29.1–29.13, 30.1–30.8, 31.1–31.11_

- [ ] 19. Checkpoint — Reserva y checkout aprobados
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Etapa 12 — Implementar Mockup 22: Perfil
  - [ ] 20.1 Crear `/perfil` y ProfileControlsIsland
    - Reproducir portada, avatar, datos, preferencias, salud, documentos, seguridad, sesiones, notificaciones y eliminación dentro del shell privado.
    - Implementar validación contract-backed, consentimientos separados, OTP y explicaciones de anonimización/retención sin inventar reglas o persistencia.
    - _Requirements: 20.1–20.9, 26.9, 31.5_

  - [ ] 20.2 Aislar capacidades sensibles no aprobadas
    - Habilitar upload solo con contrato y URL prefirmada en memoria; validar tipo/tamaño y descartar URL tras completar/fallar/navegar/logout.
    - Mantener salud, dietas, documentos, sesiones, 2FA y canales como `Visual_Only_State` cuando falte contrato, sin capturar PII ni mostrar éxito.
    - _Requirements: 20.4–20.11, 24.6, 31.10, 31.11_

  - [ ]* 20.3 Escribir property test de validación previa a mutación
    - **Property 14: Form transitions validate before mutation**
    - Generar drafts de checkout y perfil; conservar draft/issues cuando falle el schema aprobado.
    - **Validates: Requirements 19.3, 19.4, 20.2, 31.5**

  - [ ]* 20.4 Verificar independientemente la etapa Perfil
    - Probar validación, consentimiento sensible no preseleccionado, OTP, upload memory-only, sesiones/eliminación gated, redacción y visual-only sin efecto.
    - Capturar `/perfil` en ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión de todas las rutas privadas/Auth.
    - _Requirements: 20.1–20.11, 26.9, 27.1–27.12, 29.1–29.13, 30.1–30.8_

- [ ] 21. Etapa 13 — Implementar Mockup 23: Borondo Coins
  - [ ] 21.1 Crear `/coins` y CoinsHistoryIsland
    - Implementar balance, equivalencia, XP/nivel, progreso, beneficios, historial, resumen y formas de ganar desde contratos aprobados.
    - Mantener Coins y XP separados; no hardcodear ratio/umbrales y representar recompensas futuras como `Visual_Only_State`.
    - _Requirements: 21.1–21.7, 24.7, 31.6, 31.9, 31.10_

  - [ ]* 21.2 Escribir property test de independencia Coins/XP/historial
    - **Property 11: Coins, XP and filtered history remain independent**
    - **Validates: Requirements 16.5, 21.2, 21.4**

  - [ ]* 21.3 Verificar independientemente la etapa Coins
    - Probar filtros sin alterar balance/XP, ratio contractual, contradicción visual registrada, empty/error y recompensas visual-only.
    - Capturar `/coins` a ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión Dashboard/Checkout.
    - _Requirements: 21.1–21.7, 27.1–27.12, 29.1–29.13, 30.1–30.8, 31.1–31.11_

- [ ] 22. Checkpoint — Perfil y Coins aprobados
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Etapa 14 — Implementar Mockup 24: Favoritos
  - [ ] 23.1 Crear `/favoritos` y FavoritesIsland
    - Renderizar favoritos con `CanonicalTourCard`, orden, disponibilidad, empty state y exploración.
    - Implementar mutación optimista reversible solo con contrato aprobado; mantener colecciones y compartir lista como `Visual_Only_State` sin persistencia/enlaces.
    - _Requirements: 7.2, 22.1–22.8, 24.8, 31.10, 31.11_

  - [ ]* 23.2 Escribir property test de favoritos optimistas reversibles
    - **Property 18: Favorite optimistic updates are reversible**
    - **Validates: Requirements 22.3, 22.4**

  - [ ]* 23.3 Verificar independientemente la etapa Favoritos
    - Probar commit/rollback/anuncio, empty state, capability gate y ausencia de requests para colecciones/share visual-only.
    - Capturar `/favoritos` a ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión de todos los consumidores de CanonicalTourCard.
    - _Requirements: 22.1–22.8, 27.1–27.12, 29.1–29.13, 30.1–30.8_

- [ ] 24. Etapa 15 — Implementar Mockup 25: Mensajes
  - [ ] 24.1 Crear `/mensajes` y MessagingIsland gated
    - Reproducir inbox, búsqueda, no leídas, conversación, contexto, presencia, adjuntos y opciones con patrón de teclado documentado.
    - Habilitar lectura/envío/upload/WebSocket solo con contratos, autorización y ventana aprobados; de lo contrario usar read-only o `Visual_Only_State` sin conexiones ni efectos.
    - Mantener PII, IDs sensibles, contenido y URLs prefirmadas fuera de URLs/logs/storage.
    - _Requirements: 23.1–23.8, 24.9, 26.9, 31.10, 31.11_

  - [ ]* 24.2 Escribir property test de mensajería fuera de ventana
    - **Property 19: Out-of-window messaging is read-only**
    - **Validates: Requirements 23.4**

  - [ ]* 24.3 Verificar independientemente la etapa Mensajes
    - Probar autorización por reserva, ventana enabled/read-only, teclado sin puntero, attachments gated, ausencia de WebSocket en visual-only y redacción.
    - Capturar `/mensajes` a ambos viewports con axe/teclado y ejecutar lint, typecheck, cobertura, tests, build y regresión de todas las rutas privadas/shell responsive.
    - _Requirements: 23.1–23.8, 27.1–27.12, 28.9, 29.1–29.13, 30.1–30.8_

- [ ] 25. Integrar y cerrar los gates transversales del rediseño
  - [ ] 25.1 Completar publicación, localización y manifests de las 15 etapas
    - Cablear metadata única, canonical, social, sitemap/robots, hreflang solo para locales completos, JSON-LD validado y `noindex,nofollow` privado en todas las rutas.
    - Completar Island Registry, Behavioral Regression Matrix, Evaluation Inventory, route dependency manifest y baseline manifests sin añadir contratos ni infraestructura.
    - _Requirements: 5.8, 24.1–24.12, 26.1–26.9, 31.1–31.11, 32.1–32.14, 33.1–33.10_

  - [ ]* 25.2 Ejecutar la suite funcional de no regresión completa
    - Automatizar Home→Catálogo, Catálogo→Tour, fecha→Auth Gate→checkout, login→mis reservas, lifecycle→detalle, perfil, Coins, favoritos y mensajería.
    - Validar adapters Zod y MSW para success/empty/401-refresh/403/409/422/429/timeout/malformed, compatibilidad Spec A/B y ausencia de efectos en `Visual_Only_State`.
    - _Requirements: 29.6–29.8, 29.11, 29.12, 31.1–31.11_

  - [ ]* 25.3 Ejecutar matriz visual, responsive, i18n y WCAG completa
    - Capturar cada ruta de las 15 etapas a 1440×900 y 375×812 con ≤0.5% diff, anclas ±2px, Chromium, reloj/fuentes/fixtures deterministas y baselines no autoactualizables.
    - Ejecutar axe en todas las rutas, cero serious/critical, navegación por teclado, focus traps, live regions, contraste, reduced motion y pseudo-locale 130% sin overflow.
    - _Requirements: 3.1–3.7, 27.1–27.12, 29.1–29.5, 29.9–29.13, 33.8_

  - [ ]* 25.4 Ejecutar gates de rendimiento, seguridad y privacidad
    - Medir rutas públicas clave en 375×812, 4G, CPU 4×, caché fría: LCP ≤2.5s, INP ≤200ms y CLS ≤0.1; verificar srcset/sizes, prioridades, lazy loading y skeleton geometry.
    - Auditar chunks por ruta, bytes gzip, Mapbox/galería/calendario/checkout/mensajería aislados, HTML/bundles/source maps/storage/URLs/telemetría sin secretos ni PII, y shells privados sin datos.
    - _Requirements: 15.7–15.10, 26.8, 26.9, 28.1–28.14, 30.6–30.8_

  - [ ]* 25.5 Ejecutar gate final de calidad y artefacto estático
    - Ejecutar lint sin warnings, typecheck, unit/property/component/contract/E2E/axe/visual tests, cobertura ≥80% y `astro build` sin adaptador SSR.
    - Verificar rutas/fallbacks y assets con hash compatibles con S3/CloudFront sin crear o modificar recursos AWS; fallar si falta una aprobación de etapa o baseline.
    - _Requirements: 1.4, 29.1–29.13, 30.1–30.8_

- [ ] 26. Final checkpoint — Las 15 etapas están aprobadas
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP visual, pero representan la cobertura automatizada aprobada del diseño.
- Cada property test usa fast-check con mínimo 100 ejecuciones, un archivo dedicado y el comentario exacto `Feature: b2c-pixel-perfect-redesign, Property N: <property title>`; CI conserva seed, path y contraejemplo minimizado.
- Ninguna tarea autoriza contratos, endpoints, persistencia, reglas financieras, roles, transiciones, migraciones, jobs ni recursos AWS nuevos. Ante un hueco, implementar solo fixture determinista y `Visual_Only_State`/contract-dependent.
- Un gate fallido bloquea la etapa siguiente. Cambiar un componente compartido obliga a repetir visual regression de todas sus rutas consumidoras ya aprobadas.
- Los baselines solo cambian mediante aprobación explícita; los fixtures privados contienen únicamente PII sintética.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["1.4"] },
    { "id": 4, "tasks": ["1.5"] },
    { "id": 5, "tasks": ["1.6"] },
    { "id": 6, "tasks": ["1.7", "1.8", "1.9", "1.10", "1.11", "1.12", "1.13", "1.14", "1.15", "1.16", "1.17", "1.18", "1.19", "1.20", "1.21", "1.22", "1.23"] },
    { "id": 7, "tasks": ["2.1"] },
    { "id": 8, "tasks": ["2.2"] },
    { "id": 9, "tasks": ["2.3", "2.4"] },
    { "id": 10, "tasks": ["2.5"] },
    { "id": 11, "tasks": ["4.1"] },
    { "id": 12, "tasks": ["4.2"] },
    { "id": 13, "tasks": ["4.3", "4.4", "4.5"] },
    { "id": 14, "tasks": ["4.6"] },
    { "id": 15, "tasks": ["6.1"] },
    { "id": 16, "tasks": ["6.2"] },
    { "id": 17, "tasks": ["6.3", "6.4"] },
    { "id": 18, "tasks": ["6.5"] },
    { "id": 19, "tasks": ["8.1"] },
    { "id": 20, "tasks": ["8.2"] },
    { "id": 21, "tasks": ["9.1"] },
    { "id": 22, "tasks": ["9.2"] },
    { "id": 23, "tasks": ["9.3"] },
    { "id": 24, "tasks": ["11.1"] },
    { "id": 25, "tasks": ["11.2"] },
    { "id": 26, "tasks": ["12.1"] },
    { "id": 27, "tasks": ["12.2"] },
    { "id": 28, "tasks": ["12.3"] },
    { "id": 29, "tasks": ["12.4"] },
    { "id": 30, "tasks": ["14.1"] },
    { "id": 31, "tasks": ["14.2"] },
    { "id": 32, "tasks": ["14.3"] },
    { "id": 33, "tasks": ["14.4"] },
    { "id": 34, "tasks": ["15.1"] },
    { "id": 35, "tasks": ["15.2", "15.3"] },
    { "id": 36, "tasks": ["15.4"] },
    { "id": 37, "tasks": ["17.1"] },
    { "id": 38, "tasks": ["17.2"] },
    { "id": 39, "tasks": ["18.1"] },
    { "id": 40, "tasks": ["18.2"] },
    { "id": 41, "tasks": ["18.3", "18.4"] },
    { "id": 42, "tasks": ["18.5"] },
    { "id": 43, "tasks": ["20.1"] },
    { "id": 44, "tasks": ["20.2"] },
    { "id": 45, "tasks": ["20.3"] },
    { "id": 46, "tasks": ["20.4"] },
    { "id": 47, "tasks": ["21.1"] },
    { "id": 48, "tasks": ["21.2"] },
    { "id": 49, "tasks": ["21.3"] },
    { "id": 50, "tasks": ["23.1"] },
    { "id": 51, "tasks": ["23.2"] },
    { "id": 52, "tasks": ["23.3"] },
    { "id": 53, "tasks": ["24.1"] },
    { "id": 54, "tasks": ["24.2"] },
    { "id": 55, "tasks": ["24.3"] },
    { "id": 56, "tasks": ["25.1"] },
    { "id": 57, "tasks": ["25.2"] },
    { "id": 58, "tasks": ["25.3"] },
    { "id": 59, "tasks": ["25.4"] },
    { "id": 60, "tasks": ["25.5"] }
  ]
}
```
