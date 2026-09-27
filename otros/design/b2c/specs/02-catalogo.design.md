# Design Spec — Catálogo página web

- **Fuente:** 2-Catalogo pagina web.png
- **Ruta:** /catalogo
- **Viewport del mockup:** desktop ~1440
- **Resumen:** Pantalla de catálogo B2C para explorar experiencias turísticas mediante búsqueda, filtros, ordenamiento y visualización en lista. Hero fotográfico con controles Liquid Glass, layout de filtros laterales y grilla de seis tours.

## 1. Estructura general (secciones de arriba a abajo)
1. Navbar — barra horizontal superior con navegación, favoritos/carrito y CTA — alto ~88px (= spacing-header-desktop)
2. Hero / buscador de catálogo — imagen full-width con controles Liquid Glass — alto ~144px
3. Contenido del catálogo — sidebar de filtros (~296px) + grilla de resultados (1fr), gap ~24px
4. Filtros — panel vertical: destinos, duración, precio, dificultad, opciones adicionales — alto ~694px
5. Resultados — contador + grilla 3 columnas × 2 filas de TourCard
6. Paginación — navegación centrada debajo de las tarjetas

## 2. Detalle por sección

### Sección: Navbar
- **Layout:** flex horizontal, logo izquierda, navegación centrada, acciones derecha. Gutter ~32px.
- **Fondo:** bg-surface-strong / apariencia oscura; radio exterior en esquinas superiores.
- **Elementos:**
  - Branding — "Borondo Tours" — branding gráfico [confirmar] — dorado del logotipo — i18n: brand:name
  - Links — "Destinos", "Experiencias", "Nosotros", "Blog", "Contacto" — text-body2 font-body — text-on-strong — i18n: nav:destinos, nav:experiencias, nav:nosotros, nav:blog, nav:contacto
  - Icono — favoritos — lucide: Heart
  - Icono — carrito/bolsa — lucide: ShoppingBag; badge numérico "2"
  - Botón — "Planifica tu viaje" — CTA dorado — datos: visual-only
- **Componente:** Reutiliza `Navbar` existente.
- **Isla React:** No (Astro estático), salvo que el contador de carrito/favoritos requiera datos runtime.
- **Estados:** default; hover/focus links; CTA hover; badge cantidad.
- **Notas de medida:** alto ~88px; nav separada ~32px; CTA rounded-control alto mínimo 44px.

### Sección: Hero / buscador
- **Layout:** imagen full-width, superficie Liquid Glass horizontal centrada. Buscador a la izquierda, controles de vista/orden a la derecha.
- **Fondo:** fotografía de paisaje montañoso con palmeras; overlay oscuro/translúcido.
- **Elementos:**
  - Input — placeholder "Busca por nombre, destino o experiencia" — text-body2 font-body — text-on-strong — i18n: catalogo:hero.searchPlaceholder — a11y: "Buscar experiencias"
  - Icono — búsqueda — lucide: Search
  - Toggle — "Lista" — primario turquesa seleccionado — datos: contract-backed — lucide: List
  - Toggle — "Mapa" — secundario outline — datos: contract-backed — lucide: Map
  - Control — "Ordenar por" — text-body2 font-body — text-on-strong — i18n: catalogo:sort.label — lucide: ChevronDown
- **Componente:** Reutiliza `LiquidGlassSurface`; controles con `Button` y control de formulario [confirmar].
- **Isla React:** Sí — `CatalogControlsIsland client:idle` — búsqueda, cambio Lista/Mapa y orden requieren estado.
- **Estados:** búsqueda vacía/con texto/foco, Lista seleccionada, Mapa seleccionado, menú orden abierto, cargando, error.
- **Notas de medida:** superficie rounded-panel; padding ~16px; separación interna ~12–16px; buscador ~60% del ancho del panel.

### Sección: Resultados y filtros
- **Layout:** grid dos columnas: sidebar filtros (~296px) + resultados (1fr), gap ~24px.
- **Fondo:** bg-surface-page.
- **Elementos:**
  - Contador — "Mostrando 48 experiencias" — text-body1 font-body — text-text-muted — i18n: catalogo:results.count
- **Componente:** Layout Astro estático; `TourCard` por experiencia.
- **Isla React:** Sí — `CatalogControlsIsland client:idle` para filtros/búsqueda/orden; grilla Astro estática con datos iniciales.
- **Estados:** normales, cargando, vacío, error.
- **Notas de medida:** separación superior ~32px; grid de cards gap ~16px.

### Sección: Panel de filtros
- **Layout:** columna vertical dentro de Card, separadores entre grupos.
- **Fondo:** bg-surface-page; superficie blanca con shadow-card.
- **Elementos:**
  - Título — "Filtros" — text-h4 font-heading semibold — text-text-primary — i18n: catalogo:filters.title — lucide: SlidersHorizontal
  - Grupo "Destino" (i18n: catalogo:filters.destination) — lucide: ChevronDown — checkboxes: Eje Cafetero (23), Caribe (18), Amazonas (15), Andes (31), Pacífico (12), Llanos Orientales (8), Santanderes (14). Conteos text-label, datos contract-backed.
  - Grupo "Duración" (catalogo:filters.duration) — chips: "Medio día", "1 día" (seleccionado, primario turquesa), "2-3 días", "+3 días".
  - Grupo "Precio por persona (COP)" (catalogo:filters.price) — rango "$100.000" a "$2.500.000+"; texto "Rango seleccionado" + "$100.000 - $2.500.000+". Datos contract-backed.
  - Grupo "Dificultad" (catalogo:filters.difficulty) — chips: Familiar (verde), Moderado (dorado), Aventurero (naranja [fuera de paleta, confirmar]), Extremo (rojo [fuera de paleta, confirmar]).
  - Grupo "Incluye pasaporte" (catalogo:filters.passport) y "IVA exento" (catalogo:filters.taxExempt) — toggle IVA exento activado, datos contract-backed.
  - Botón — "Limpiar filtros" — secundario/acción textual — datos: contract-backed — lucide: RotateCcw
- **Componente:** Reutiliza `Card`; controles internos parte de `CatalogControlsIsland`. No recrear TourCard.
- **Isla React:** Sí — `CatalogControlsIsland client:idle`.
- **Estados:** default, seleccionado, hover, focus, filtros activos, sin resultados, cargando, error.
- **Notas de medida:** rounded-card; padding ~16px; grupos separados ~16–24px; controles táctiles mínimo 44px; slider con targets accesibles.

### Sección: Grilla de experiencias
- **Layout:** grid 3 columnas, 2 filas visibles, gap ~16px.
- **Fondo:** bg-surface-page.
- **Elementos (6 TourCard):**
  - "Valle del Cocora" — Salento, Quindío — Desde $250.000 COP — 4.9 (128) — 1 día
  - "Parque Tayrona" — Santa Marta, Magdalena — Desde $890.000 COP — 4.8 (96) — 3 días
  - "Amazonas" — Leticia, Amazonas — Desde $1.250.000 COP — 4.9 (74) — 4 días
  - "Cartagena Histórica" — Cartagena, Bolívar — Desde $560.000 COP — 4.7 (110) — 2 días
  - "Laguna de Otún" — Pereira, Risaralda — Desde $320.000 COP — 4.6 (84) — 1 día
  - "Cascada La Chorrera" — Choachí, Cundinamarca — Desde $750.000 COP — 4.8 (63) — 3 días
  - Icono favorito (lucide: Heart), rating (lucide: Star), badge duración (rounded-pill, bg-action-primary), verificado por BorondoTours (lucide: BadgeCheck turquesa). **Marca blanca:** el cliente nunca ve qué operador ejecuta el tour; todo se presenta bajo BorondoTours.
- **Componente:** Reutiliza `TourCard` obligatoriamente. Props: tour, href, glass?.
- **Isla React:** Sí — `FavoriteToggleIsland client:idle` si el corazón cambia estado; estructura de cards Astro estática.
- **Estados:** default, hover, focus, favorito/no, cargando, vacío, error.
- **Notas de medida:** imagen ~mitad superior de cada tarjeta; contenido inferior blanco. Mockup usa imagen horizontal; TourCard canónica es 3/4 → [confirmar variante]. rounded-card + shadow-card.

### Sección: Paginación
- **Layout:** flex horizontal centrado, gap ~8–12px.
- **Fondo:** bg-surface-page.
- **Elementos:** ChevronLeft, "1" (seleccionado primario turquesa), "2", "3", "4", "5", "..." (no interactivo), "16", ChevronRight.
- **Componente:** Nuevo `CatalogPagination` o paginación existente [confirmar].
- **Isla React:** Sí — `CatalogPaginationIsland client:idle`.
- **Estados:** página activa, hover, focus, primera/última, cargando.
- **Notas de medida:** targets mínimo 44×44px; separación ~8px.

## 3. Componentes nuevos requeridos
| Componente | Tipo | Props sugeridas | Reusa |
|---|---|---|---|
| CatalogControlsIsland | Island React client:idle | initialQuery, initialFilters, initialSort, initialView | LiquidGlassSurface, Button |
| FavoriteToggleIsland | Island React client:idle | tourId, initialFavorite | Heart, Button |
| CatalogPaginationIsland | Island React client:idle | currentPage, totalPages | Button |

## 4. Tokens usados
- **Colores:** bg-surface-page, bg-surface-strong, text-text-primary, text-text-muted, text-on-strong, bg-action-primary, hover:bg-action-primary-hover, bg-action-cta, border-border-subtle, ring-focus, border-focus, dorado, verde
- **Tipografía:** text-h4/text-h3 font-heading, text-body1/text-body2/text-button/text-label font-body
- **Radios/elevación/glass:** rounded-control, rounded-card, rounded-panel, rounded-pill, shadow-card, glass-surface, LiquidGlassSurface
- **Degradados:** ninguno

## 5. Iconografía
Search (buscador), Heart (navbar + TourCard), ShoppingBag (navbar), CalendarDays (CTA), List (vista lista), Map (vista mapa), ChevronDown (orden/filtros), SlidersHorizontal (filtros), RotateCcw (limpiar), Star (rating), BadgeCheck (proveedor verificado), ChevronLeft/ChevronRight (paginación).

## 6. Estados globales
- Default: 48 experiencias, filtros visibles, página 1.
- Cargando: Skeleton para contador, filtros y TourCard.
- Vacío: StatusMessage tone="empty" + acción limpiar filtros.
- Error: StatusMessage tone="error"; sin datos simulados.
- Filtros activos: controles seleccionados + resultados actualizados.
- Vista mapa: estado alternativo; mockup no lo muestra → [confirmar].
- Autenticación: favoritos requieren confirmación de contrato.

## 7. Responsive (INFERIDO)
- Navbar → hamburguesa móvil. Grid 3 col → 1 col. Filtros laterales → drawer/modal (AccessibleDialog). Buscador Liquid Glass → vertical. Controles Lista/Mapa/Orden → ancho completo. Paginación conserva 44×44px. TourCard conserva jerarquía imagen/título/ubicación/precio/rating.

## 8. Accesibilidad — checklist específico
- [ ] Input de búsqueda con label accesible aunque no haya label visual.
- [ ] Cada checkbox de destino con nombre accesible.
- [ ] Rango de precio con labels/valores accesibles en ambos extremos.
- [ ] Toggles "Incluye pasaporte"/"IVA exento" anuncian su estado.
- [ ] Botones Lista/Mapa comunican cuál está seleccionado (aria-pressed).
- [ ] "Ordenar por" navegable por teclado y anuncia estado.
- [ ] Corazones de favoritos con label "Agregar/Quitar X de favoritos".
- [ ] Imágenes de tours con alt descriptivo; iconos decorativos alt="".
- [ ] Targets táctiles ≥44×44px.
- [ ] Orden de foco: Navbar → buscador → vista/orden → filtros → resultados → paginación.
- [ ] Contraste de texto blanco sobre foto del hero y sobre Liquid Glass.
- [ ] Contraste de textos secundarios y conteos en filtros.
- [ ] Drawer de filtros móvil con AccessibleDialog (focus trap, Escape, retorno de foco).

## 9. Clasificación de datos
- **contract-backed:** listado de experiencias; contador; búsqueda; filtros (destino, duración, precio, dificultad, toggles); orden; paginación; vista Lista/Mapa; datos de cada TourCard.
- **visual-only:** "Planifica tu viaje" (definido así por el sistema). Persistencia de favoritos si no hay contrato aprobado.

## 10. Gaps y preguntas para confirmar
1. TourCard del mockup usa imagen horizontal; el sistema define TourCard 3/4. Confirmar variante canónica para catálogo.
2. Estado de vista "Mapa" no mostrado; confirmar composición/componente.
3. Comportamiento de favoritos autenticado/no autenticado sin contrato.
4. Colores de chips "Aventurero" (naranja) y "Extremo" (rojo) no mapean claro a tokens; confirmar.
5. Estado abierto del selector "Ordenar por" no mostrado; confirmar opciones.
6. Drawer móvil de filtros (INFERIDO).
7. Footer no visible en el viewport.
8. Origen/contrato del contador "2" del carrito no especificado.
