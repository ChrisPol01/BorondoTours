# SKILL — Design System BorondoTours (colibrí barbudo del páramo · Oxypogon guerinii) · Base de Conocimiento

> **Qué es esto:** referencia canónica del sistema de diseño y de los componentes ya construidos en `apps/web`.
> **Cómo usarla:** al analizar un mockup, NO inventes nombres de color, clase ni componente. Busca aquí el equivalente
> y úsalo textualmente. Si algo del mockup no existe aquí, márcalo como "componente nuevo" y descríbelo, pero primero
> confirma que ninguno de los existentes ya cubre ese caso.
> **Fuente de verdad:** extraída de `src/styles/tokens.css`, `src/styles/global.css` y `src/components/`. Última sync: 2026-09-06.

---

## 1. Colores → clases Tailwind exactas

Cada token de marca está proyectado como clase Tailwind vía `@theme`. Usa el nombre de la columna "Clase base".
Para texto usa `text-*`, fondo `bg-*`, borde `border-*`. Opacidad estilo Tailwind: `bg-negro-volcanico/40`.

| Nombre marca | Hex | Clase base | Uso canónico |
|---|---|---|---|
| Azul Profundo | `#103B66` | `azul-profundo` | Fondos oscuros, superficies fuertes |
| Azul Cóndor | `#2364AA` | `azul-condor` | Texto muted, acentos sobrios |
| Turquesa Laguna | `#00B7C7` | `turquesa` | Botón primario default, badges |
| Verde Frailejón | `#79C142` | `verde` | Botón primario hover, "disponible" |
| Arena | `#F3E8D1` | `arena` | Fondos de sección cálidos |
| Dorado | `#FDB813` | `dorado` | CTA principal, ratings, "limitado" |
| Blanco Niebla | `#F9FBFC` | `blanco-niebla` | Fondo página, texto sobre oscuro |
| Negro Volcánico | `#101010` | `negro-volcanico` | Texto principal, overlays |

### Clases semánticas (preferir estas cuando apliquen)
`bg-surface-page` (fondo página), `bg-surface-warm` (arena), `bg-surface-strong` (azul profundo),
`text-text-primary` (negro), `text-text-muted` (azul cóndor), `text-on-strong` (blanco sobre oscuro),
`bg-action-primary` (turquesa) / `hover:bg-action-primary-hover` (verde), `bg-action-cta` (dorado),
`border-border-subtle`, `ring-focus` / `border-focus` (azul profundo para foco).

### Semántica de disponibilidad (SIEMPRE acompañar de texto/icono, nunca solo color)
`available` (verde), `limited` (dorado), `sold-out` (rojo `#B42318`), `unavailable` (gris `#667085`).

### Degradados aprobados (únicos permitidos)
- `gradient-nature`: turquesa → verde-frailejón (`linear-gradient(135deg,#00B7C7,#79C142)`).
- `gradient-depth`: azul-profundo → turquesa (`linear-gradient(135deg,#103B66,#00B7C7)`).
- Overlay de imágenes: usar `bg-negro-volcanico/NN` (no un degradado inventado), salvo el gradient inferior de `TourCard`.

---

## 2. Tipografía → clases exactas

- **Títulos (Sora):** clase `font-heading`. **Texto/botones (Inter):** clase `font-body`.
- Tamaños como clases: `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-body1`, `text-body2`, `text-button`, `text-label`.
  (Ya incluyen su `line-height` correcto y escalan solos por breakpoint; NO uses `text-4xl` etc. para texto de marca.)

| Rol | Clase | px desktop | Peso típico | Uso |
|---|---|---|---|---|
| H1 | `text-h1` | 56 | ExtraBold (`font-extrabold`) | Hero / título principal |
| H2 | `text-h2` | 40 | Bold (`font-bold`) | Título de sección |
| H3 | `text-h3` | 28 | SemiBold (`font-semibold`) | Subtítulo importante |
| H4 | `text-h4` | 20 | SemiBold | Título de card/bloque |
| Body 1 | `text-body1` | 16 | Regular | Texto general |
| Body 2 | `text-body2` | 14 | Regular | Texto secundario |
| Botón | `text-button` | 16 | SemiBold | CTAs |
| Label | `text-label` | 12 | Regular | Notas, captions, badges |

Escala responsive automática: mobile 0.85x (<768px), tablet 0.95x (768–1024px), desktop 1x (>1024px).

---

## 3. Geometría, radios, sombras, glass → clases exactas

- **Contenedores:** `max-w-public` (80rem/1280px, páginas públicas), `max-w-reading` (48rem, artículos), `max-w-account` (90rem, área privada).
- **Gutter de página:** `px-page-gutter` (1rem→1.5rem→2rem por breakpoint).
- **Separación entre secciones:** `py-section-gap` (clamp 3rem–7rem).
- **Header:** alto `spacing-header-mobile` (4.5rem) / `spacing-header-desktop` (5.5rem).
- **Radios:** `rounded-control` (0.75rem, inputs/botones), `rounded-card` (1.25rem, tarjetas), `rounded-panel` (2rem, paneles), `rounded-pill` (9999px, chips/badges).
- **Sombras:** `shadow-card` (elevación tarjeta), `shadow-floating` (flotante/modal), `shadow-sticky` (barra pegada).
- **Grid detalle de tour:** utilidad `grid-cols-tour-detail` (contenido 1fr + sidebar 20rem).
- **Aspect ratio media de tour:** `aspect-tour-media` (16/9).
- **Hero:** `min-h-[85vh]` en mobile actual (tokens definen 60/70/80vh como referencia).

### Glass (glassmorphism) — clases CSS existentes
- `.glass-surface` → superficie translúcida azul-profundo + blur + fallback opaco WCAG. Se usa vía componente `LiquidGlassSurface`/`GlassSurface`.
- `.glass-header` → header ultra-transparente estilo iOS (sobre hero).
- `.glass-header-solid` → header blanco translúcido pill (cuando sale del hero).
- Al ver un buscador/tarjeta/modal translúcido sobre foto → nómbralo "Liquid Glass" y referencia `LiquidGlassSurface`.

---

## 4. Componentes YA EXISTENTES (reutilizar, no recrear)

> Regla de oro: si el mockup muestra algo equivalente, referencia el componente por su nombre y describe qué props/slots
> necesita. Solo propón un componente nuevo si ninguno encaja.

### Layout (`components/layout/`)
- **`Navbar`** — barra superior con efecto glass, detecta si está sobre el hero. Links: Destinos, Experiencias, Nosotros, Blog, Contacto + botón CTA "Planifica tu viaje" (dorado, `visual-only`).
- **`Footer`** — pie con trust badges de marca.
- **`PublicLayout`** (`layouts/`) — layout de páginas públicas (skip link, landmarks, compensación de header).

### UI Library (`components/ui/`)
- **`Button`** — props: `variant: "primary" | "cta" | "secondary"`, `labelKey` (clave i18n), `disabled?`, `onClick?`, `type?`.
  - `primary` = fondo turquesa, hover verde. `cta` = fondo dorado, texto negro. `secondary` = transparente + borde azul-profundo.
  - Alto mínimo `min-h-11` (44px, táctil). Texto vía i18n.
- **`TourCard`** — tarjeta canónica de tour. Props: `tour: TourSummary`, `href: string`, `glass?`. 
  - Aspecto 3/4, imagen full-bleed, overlay inferior negro, nombre (H3), "duración • tipo", precio "Desde" formateado COP, rating estrella dorada + reviewCount, botón corazón favorito arriba-derecha. **Úsala para CUALQUIER grilla/carrusel de tours.**
- **`Card`** — contenedor base. Props: `variant?: "default" | "glass"`, `children`, `className?`. `default` = blanco + `shadow-card`; `glass` = delega en `GlassSurface`.
- **`GlassSurface` / `LiquidGlassSurface`** — superficie translúcida sobre imagen. Prop `overImage: true` obligatoria, `as?`, `className?`.
- **`AccessibleDialog`** — modal/diálogo con focus trap + cierre con Escape + retorno de foco. Úsalo para cualquier modal/drawer.
- **`ResponsiveImage`** (`.astro`) / **`Image`** — imagen con srcset. Úsalos en vez de `<img>` crudo para contenido.
- **`Skeleton`** / **`StaticSkeleton`** (`.astro`) — placeholders de carga (preferir skeleton sobre spinner).
- **`StatusMessage`** — estados vacío/error/success/info. Props: `tone: "error" | "empty" | "success" | "info"`, `title?`, `children`, `action?`. Úsalo para empty states y errores.
- **`SafeHtml`** — render de HTML remoto saneado (DOMPurify). Úsalo para descripciones que vienen del backend.
- **`WhatsAppButton`** — botón de contacto WhatsApp.
- **`useFocusTrap`** — hook para atrapar foco (lo usan diálogos/drawers).

### Iconos
Librería: **`lucide-react`** (trazo 2px). Ya se usan `Heart`, `Star`. Al identificar un icono, sugiere el nombre lucide (MapPin, Calendar, Users, Search, ArrowRight, Leaf, Camera, Mountain, Shield, Backpack, Ticket…).

---

## 5. i18n (obligatorio)

- Cero strings hardcodeados en JSX. Todo texto va vía `translate("namespace:key")` (Astro) o `t("namespace:key")` (React, hook `useTranslation`).
- Al reportar copy, transcríbelo literal **y** sugiere una clave i18n en formato `namespace:seccion.elemento` (ej. `home:hero.title`).

---

## 6. Reglas que el análisis debe respetar

- No hex crudos si el color cae en la paleta → usa la clase base.
- No `text-4xl`/`text-lg` para texto de marca → usa `text-h1..text-label`.
- No inventar componentes si existe uno equivalente arriba.
- No degradados fuera de `gradient-nature` / `gradient-depth`.
- Disponibilidad/estado nunca solo por color → siempre texto o icono.
