# 18. Kit de componentes del frontend (runtime de Figma)

## Regla
No hay diseño por pantalla para cosas que ya existen. Si dos piezas se ven y se comportan igual, son
UN componente. Antes de escribir un elemento nuevo, revisar el kit.

- Código: `apps/web/src/lib/fig/runtime/ui-kit.ts` (constructores) y el bloque
  "KIT DE COMPONENTES" de `apps/web/src/styles/fig-runtime.css` (estilos; carga en todas las páginas).
- El CSS de una pantalla (p. ej. `fig-home.css`) solo coloca piezas (left/top/ancho/rejilla).
  No define colores, tipografía, vidrio ni hover propios.

## Piezas actuales
| Pieza | Constructor | Clase |
|---|---|---|
| Botón primario / vidrio / enlace, ancho completo | `button({ variant, block })` | `bt-btn bt-btn--primary|glass|link` + `bt-btn--block` |
| Interacción estándar (sube, brilla, se hunde) | `lift(...)` | `bt-lift` |
| Encabezado de sección (eyebrow + título + acciones) | `sectionHead()` | `bt-section-head`, `bt-eyebrow`, `bt-section-title` |
| Zona oscura (surface-strong) | `onStrong(node)` | `bt-on-strong` |
| Sello (píldora de vidrio con icono) | `seal()` | `bt-seal` |
| Tarjeta de cifra | `statCard()` | `bt-stat`, `bt-stat-grid` |
| Estrellas | `stars()` | `bt-stars` |
| Estado vacío (centrado o --start, con vidrio opcional) | `emptyState()` | `bt-empty` |
| Luz ambiental detrás del vidrio | `ambientGlow()` | `bt-ambient-glow` |
| Reseña y resumen de calificación | `reviewCard()`, `ratingSummary()` | `bt-review-card`, `bt-rating-summary` |
| Funcionalidad (fila enlace en vidrio) y su grupo con CTA | `featureCard()`, `featureGroup()` | `bt-feature`, `bt-feature-group` |
| Línea divisoria | — | `bt-rule` |
| Vidrio | — | `bt-glass-std` (única clase de vidrio) |

Otras piezas compartidas que ya existían: tarjeta de tour (`tour-card.ts`), panel/vitrina
(`panel.ts`), menús (`menu.ts`), `bt-icon-btn`.

## Figma
Toda pieza nueva, o variante que no exista en Figma, se replica en Figma (sección 00 y pantallas
afectadas) invocando el subagente **`figma-sync`** (`.kiro/agents/figma-sync.json`) al terminar el
cambio. Figma sigue siendo la fuente de verdad del diseño.
