# Design Spec — Home[cite: 1]

- **Fuente:** 1-Inicio de pagina web.png[cite: 1]
- **Ruta:** /[cite: 1]
- **Viewport del mockup:** desktop ~1440 | mobile ~375[cite: 1]
- **Resumen:** Pantalla principal (Landing) orientada a la conversión y descubrimiento. Presenta un Hero inmersivo con buscador complejo, seguido de una grilla de destinos destacados, propuesta de valor (trust badges) y pie de página.

## 1. Estructura general (secciones de arriba a abajo)
1. Navbar (glass sobre hero) — flex centrado horizontal — alto ~88px (= header)
2. Hero — layout apilado (texto + buscador glass) centrado — alto `min-h-[85vh]`
3. Destinos Destacados — grid 4 columnas — alto (INFERIDO) ~600px
4. Propuesta de Valor (Trust Badges) — grid 4 columnas — alto ~160px
5. Footer — grid 4 columnas + bottom bar — alto (INFERIDO) ~400px

## 2. Detalle por sección

### Sección: Navbar
- **Layout:** flex distribuido (logo izq, links centro, CTA der), padding `px-page-gutter`
- **Fondo:** `.glass-header` transparente sobre la imagen
- **Elementos:**
  - Links navegación — texto: "Destinos", "Experiencias", "Nosotros", "Blog", "Contacto" — tipografía: Body2 (`text-body2`) `font-body` — color: `blanco-niebla`
  - Botón CTA — label: "Planifica tu viaje" — estilo: CTA dorado (`bg-action-cta`) `text-button` — etiqueta datos: visual-only
  - Icono CTA — significado: calendario — lucide sugerido: Calendar
- **Componente:** Reutiliza `Navbar` existente
- **Isla React:** Sí — `MobileMenuIsland` client:idle — motivo: toggle de menú hamburguesa en mobile
- **Estados:** default sobre hero (glass); hover en links
- **Notas de medida:** alto ~88px desktop, ~72px mobile

### Sección: Hero
- **Layout:** flex centrado (columna), contenido alineado al centro y fondo
- **Fondo:** imagen de palmeras y paisaje + overlay `bg-negro-volcanico/40`
- **Elementos (Texto):**
  - Badge superior — texto: "EXPLORA COLOMBIA" — tipografía: Label (`text-label`) `font-heading` — color: `turquesa`
  - Título — texto: "Viajes que transforman tu manera de ver el mundo." — tipografía: H1 (`text-h1`) `font-heading` ExtraBold — color: `blanco-niebla`
  - Subtítulo — texto: "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza." — tipografía: Body1 (`text-body1`) `font-body` — color: `blanco-niebla`
- **Elementos (Buscador):**
  - Contenedor — componente `LiquidGlassSurface`
  - Input Destino — placeholder: "¿A dónde quieres ir?" / "Ej. Eje Cafetero, Tayrona, Amazonas" — label a11y sugerido: "Destino"
  - Input Fecha — placeholder: "Fecha de viaje" / "Selecciona fechas" — label a11y sugerido: "Fechas"
  - Input Viajeros — placeholder: "2 viajeros" / "Adultos" — label a11y sugerido: "Cantidad de viajeros"
  - Botón Buscar — label: "Buscar aventura" — estilo: CTA dorado (`bg-action-cta`)
- **Componente:** HTML estático para texto + `ResponsiveImage`; `LiquidGlassSurface` para tarjeta buscadora
- **Isla React:** Sí — `HomeSearchIsland` client:idle — motivo: manejo de inputs complejos, datepicker y popover de pasajeros
- **Estados:** default, focus en inputs (`ring-focus` turquesa o azul-profundo)
- **Notas de medida:** padding lateral `px-page-gutter`, gap interno buscador ~16px, contenedor buscador max-w ~900px (INFERIDO)

### Sección: Destinos Destacados
- **Layout:** grid 4 columnas, gap ~24px (gap-6), ancho `max-w-public`
- **Fondo:** `bg-surface-page` (`blanco-niebla`)
- **Elementos:**
  - Kicker superior — texto: "DESTINOS DESTACADOS" — tipografía: Label (`text-label`) — color: `turquesa`
  - Título — texto: "Destinos que inspiran" — tipografía: H2 (`text-h2`) `font-heading` Bold — color: `negro-volcanico`
  - Link ver todos — texto: "Ver todos los destinos ->" — tipografía: Body2 (`text-body2`) — color: `turquesa`
  - Tarjetas (x4) — `TourCard` con imagen 3/4. Datos visibles:
    - Valle del Cocora / Parque Tayrona / Amazonas / Cartagena (H3)
    - "1 día • Excursión" (Label)
    - "Desde $250.000 COP" (Body2 Bold)
    - Rating "4.9 (128)" (Label)
- **Componente:** Reutiliza `TourCard`
- **Isla React:** Sí — `FavoriteToggleIsland` client:idle — motivo: interacción de guardar destino (icono corazón)
- **Estados:** default, hover en tarjeta (escala imagen)
- **Notas de medida:** cards ~1/4 del contenedor desktop, ratio 3/4 `aspect-tour-media`

### Sección: Propuesta de Valor (Trust Badges)
- **Layout:** grid 4 columnas, gap ~32px (gap-8), ancho `max-w-public` centrado, padding vertical `py-section-gap`
- **Fondo:** `arena` (`bg-surface-warm`)
- **Elementos (x4):**
  - Iconos — Leaf, Camera, Shield, Users (trazo 2px `turquesa`/`verde-frailejon`)
  - Títulos — texto: "Turismo Responsable", "Experiencias Únicas", "Seguridad Garantizada", "Atención Personalizada" — tipografía: Body1 (`text-body1`) Bold — color: `negro-volcanico`
  - Subtítulos — texto: "Cuidamos los lugares que visitas.", etc. — tipografía: Body2 (`text-body2`) — color: `azul-condor`
- **Componente:** HTML estático (Astro)
- **Isla React:** No (Astro estático)
- **Estados:** default
- **Notas de medida:** iconos de tamaño ~40px, alineación flex row (desktop) o column (mobile)

### Sección: Footer
- **Layout:** grid 5 columnas principal, fila inferior de copyright
- **Fondo:** `azul-profundo` (`bg-surface-strong`)
- **Elementos:**
  - Logo + tag — texto: "Explora donde nace la naturaleza." — color: `blanco-niebla`
  - Redes Sociales — iconos: Instagram, Facebook, YouTube, TikTok (botones secondary glass)
  - Enlaces de columnas (Destinos, Experiencias, Información, Contacto) — tipografía: Body2 (`text-body2`) — color: `blanco-niebla`
  - Copyright — texto: "© Borondo Tours. Todos los derechos reservados." / "Hecho con <Heart> en Colombia"
- **Componente:** Reutiliza `Footer` existente
- **Isla React:** No (Astro estático)
- **Estados:** default, hover en links (subrayado o cambio opacidad)
- **Notas de medida:** padding vertical superior ~64px (py-16), inferior ~24px (py-6)

## 3. Componentes nuevos requeridos
| Componente | Tipo (Astro/Island) | Props sugeridas | Reusa |
|---|---|---|---|
| HomeSearchIsland | Island (React) | destinations: Array, onSearch: function | LiquidGlassSurface, Button |

## 4. Tokens usados (solo los que aparecen)
- **Colores:** `blanco-niebla`, `negro-volcanico`, `azul-profundo`, `turquesa`, `arena`, `dorado`, `azul-condor`
- **Tipografía:** H1, H2, H3, Body1, Body2, Label, Button
- **Radios/elevación/glass:** `rounded-card` (Tarjetas), `rounded-control` (Inputs Buscador y Botones), `.glass-header`, `.glass-surface` (LiquidGlassSurface buscador)
- **Degradados:** `gradient-nature` (implícito en elementos gráficos/iconos si aplica, pero aquí mayormente colores sólidos y `.glass-surface`)

## 5. Iconografía
| Significado | lucide-react sugerido | Dónde aparece |
|---|---|---|
| botón planificar | Calendar | Navbar CTA |
| explorar colombia | Compass | Eyebrow Hero |
| destino | MapPin | Buscador Hero |
| fecha | Calendar | Buscador Hero |
| viajeros | User | Buscador Hero |
| buscar | Search | Botón Buscador |
| ver todos | ArrowRight | Título Destinos |
| favorito | Heart | TourCard |
| rating | Star | TourCard |
| naturaleza | Leaf | Trust Badges |
| experiencias | Camera | Trust Badges |
| seguridad | Shield | Trust Badges |
| soporte | Users | Trust Badges |

## 6. Estados globales de la pantalla
- default (carga estática inicial)
- autenticado vs no autenticado (implícito en el icono de sesión del Navbar, si aplica)

## 7. Responsive (INFERIDO salvo que el mockup muestre ambos)
- **Desktop → Mobile:**
  - Navbar: links desaparecen, aparece menú hamburguesa[cite: 1].
  - Hero: Buscador glass pasa de layout horizontal flex a apilado vertical (`flex-col`) 1 columna[cite: 1].
  - Destinos Destacados: Grid de 4 columnas pasa a 1 columna (scroll vertical) o carrusel horizontal[cite: 1].
  - Trust Badges: De flex horizontal a apilado vertical (texto centrado)[cite: 1].
  - Footer: Grid multicolumna pasa a 1 columna (acordeón o lista apilada)[cite: 1].

## 8. Accesibilidad — checklist específico de esta pantalla
- [ ] Inputs del buscador en el hero con `aria-label` descriptivos.
- [ ] Imagen de hero declarada decorativa `alt=""` para no interferir con el H1.
- [ ] Orden de foco de teclado: Navbar -> Hero Buscador -> "Ver todos" -> Tarjetas de Destinos.
- [ ] Contraste a revisar: Asegurar que el texto blanco sobre el `bg-negro-volcanico/40` cumple 4.5:1.
- [ ] Modales/drawers con focus trap: Menú mobile (`AccessibleDialog` o `useFocusTrap`).

## 9. Clasificación de datos
- **contract-backed:** Tarjetas de Destinos Destacados (lectura de precio, rating, título).
- **visual-only:** Botón "Planifica tu viaje" del Navbar, inputs de fecha/viajeros en buscador (si el endpoint unificado de búsqueda no está listo).

## 10. Gaps y preguntas para confirmar (NO inventado)
1. El mockup muestra un pequeño avatar (cara de guía o usuario) junto a la estrella de rating en la `TourCard`, pero la Base 1 no lista esta prop en el componente canónico. ¿Se debe añadir esta prop visual al componente global? [confirmar]
2. ¿Los botones de redes sociales en el footer dirigen a URLs externas directamente (estático) o requieren tracking particular?