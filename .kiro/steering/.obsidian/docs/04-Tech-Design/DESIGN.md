---
tags: [design-system, frontend, UI, branding, identidad-visual]
created: 2026-06-25
updated: 2026-09-25
status: canónico
---

# BorondoTours Design System — Oxypogon guerinii

> Category: Travel & Marketplace
> Marketplace de tours en Colombia. Elegante, confiable, inspirado en el
> páramo colombiano. Glassmorphism sobre fotografía inmersiva, tipografía
> con carácter (Sora + Inter), paleta turquesa / verde / azul / dorado.

> ⚠️ **Fuente de verdad y alineación (2026-09-25):** Este documento describe la
> marca oficial de BorondoTours (isotipo **Oxypogon guerinii** — colibrí barbudo del páramo,
> apodo "Chivito") — la misma del brand board `otros/design/marca/borondo tours brand v1.png`,
> del manual `otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md`, del steering
> `12-brand-identity.md`, del `otros/design/b2c/design.md` y del código implementado en
> `apps/web/src/styles/tokens.css`. Los valores canónicos vienen de **`tokens.css`**; si algo
> aquí difiere de `tokens.css`, gana `tokens.css`.
>
> La versión anterior de este archivo describía una paleta y tipografía (Fraunces/Instrument Sans,
> verde `#00B88A`, morado, doble modo claro/oscuro) que **NO corresponden** a la marca oficial y
> quedaron descartadas.

## 1. Visual Theme & Atmosphere

BorondoTours se siente como hojear una revista de viajes de lujo que también te
deja reservar en dos clics. La interfaz desaparece para que la fotografía
colombiana sea protagonista — páramos, selvas, playas, pueblos coloniales —
mientras módulos glassmorphism flotan sobre las imágenes con elegancia contenida.

El tono es moderno pero no frío, premium pero no inaccesible, natural pero no
rústico.

**Identidad visual clave:**
- Isotipo: **Oxypogon guerinii** (colibrí barbudo del páramo, apodo "Chivito"): cresta beige/marrón, plumas de pecho iridiscentes verde → turquesa → azul → morado, ojos ámbar. Es "el rostro de la marca".
- Wordmark: **"Borondo Tours"** (dos palabras, tipografía display propia del logo — NO reescribir como "BorondoTours" en el logo).
- Slogan: **EXPLORA DONDE NACE LA NATURALEZA**.
- Fotografía full-bleed como superficie principal.
- Glassmorphism (backdrop-blur + transparencia) en cards e inputs sobre foto.
- Patrón de marca: líneas topográficas (curvas de nivel) sutiles.

**Pilares gráficos (5):**
1. Naturaleza Protagonista (icono: montaña)
2. Espacios Amplios (icono: flechas de expansión)
3. Experiencias Auténticas (icono: cámara)
4. Aventura Consciente (icono: hoja)
5. Conexión Humana (icono: personas)

**Atmósfera:** Confiable · Elegante · Natural · Premium · Fresco.

---

## 2. Color Palette & Roles

> Primitivas canónicas (de `tokens.css` → `--brand-*`). NO inventar hex fuera de esta tabla.

### Primitivas de marca

| Token CSS | Nombre | Hex | Rol |
|---|---|---|---|
| `--brand-azul-profundo` | Azul Profundo | `#103B66` | Fondos oscuros, superficie glass, focus ring, texto muted-strong |
| `--brand-azul-condor` | Azul Cóndor | `#2364AA` | Texto secundario/muted, acentos sobrios |
| `--brand-turquesa-laguna` | Turquesa Laguna | `#00B7C7` | **Botón primario (default)**, badges, links de acción |
| `--brand-verde-frailejon` | Verde Frailejón | `#79C142` | **Botón primario (hover)**, estado "disponible" |
| `--brand-arena` | Arena | `#F3E8D1` | Fondos de sección cálidos, hover suave |
| `--brand-dorado` | Dorado | `#FDB813` | **CTA principal** ("Planifica tu viaje"), ratings, "cupos limitados" |
| `--brand-blanco-niebla` | Blanco Niebla | `#F9FBFC` | Fondo de página, texto sobre oscuro |
| `--brand-negro-volcanico` | Negro Volcánico | `#101010` | Texto principal, overlays |

### Derivados de accesibilidad (documentados; nunca copiar el hex en componentes — usar el token)

| Token CSS | Hex | Rol |
|---|---|---|
| `--derived-danger` | `#B42318` | Error, "agotado" (sold-out) |
| `--derived-neutral` | `#667085` | "No disponible" (unavailable), placeholders |
| `--derived-adventure` | `#9A3D08` | Dificultad "aventura/extremo" |

### Semánticos (usar SIEMPRE estos en componentes, no las primitivas directas)

| Token CSS | Resuelve a | Uso |
|---|---|---|
| `--semantic-surface-page` | Blanco Niebla | Fondo de página |
| `--semantic-surface-warm` | Arena | Superficie cálida de sección |
| `--semantic-surface-strong` | Azul Profundo | Superficie oscura/fuerte |
| `--semantic-text-primary` | Negro Volcánico | Texto principal |
| `--semantic-text-muted` | Azul Cóndor | Texto secundario |
| `--semantic-text-on-strong` | Blanco Niebla | Texto sobre superficie oscura |
| `--semantic-text-on-action` | Negro Volcánico | Texto sobre CTA dorado |
| `--semantic-action-primary` | Turquesa Laguna | Acción primaria (default) |
| `--semantic-action-primary-hover` | Verde Frailejón | Acción primaria (hover) |
| `--semantic-action-cta` | Dorado | CTA principal |
| `--semantic-focus` | Azul Profundo | Anillo de foco |
| `--semantic-border-subtle` | Azul Profundo 18% | Bordes sutiles |
| `--semantic-available` | Verde Frailejón | Semáforo: disponible (≥50%) |
| `--semantic-limited` | Dorado | Semáforo: quedan pocos (1–49%) |
| `--semantic-sold-out` | Danger | Semáforo: agotado |
| `--semantic-unavailable` | Neutral | Semáforo: fecha no disponible |

### Gradientes aprobados

| Token | Definición | Uso |
|---|---|---|
| `--gradient-nature` | `135deg, #00B7C7 → #79C142` | Tarjetas/badges destacados |
| `--gradient-depth` | `135deg, #103B66 → #00B7C7` | Fondos de sección, banners |

### Proporción de color
Neutros (blanco-niebla / azul-profundo) dominan como fondo. Turquesa/verde para
acciones. Dorado **solo** como CTA principal y acentos puntuales — nunca como
fondo grande. La firma interactiva de la marca es **turquesa → verde en hover**.

---

## 3. Typography Rules

### Font Families
- **Headings:** `Sora` (`--type-heading`) — ExtraBold / Bold / SemiBold.
- **Body / UI:** `Inter` (`--type-body`) — Regular / SemiBold.

### Type Scale (desktop 1x; ver escalado responsivo)

| Rol | Font | Size (1x) | Weight | Line-height |
|-----|------|-----------|--------|-------------|
| H1 | Sora | 56px / 3.5rem | ExtraBold (800) | 1.12 |
| H2 | Sora | 40px / 2.5rem | Bold (700) | 1.2 |
| H3 | Sora | 28px / 1.75rem | SemiBold (600) | 1.28 |
| H4 | Sora | 20px / 1.25rem | SemiBold (600) | 1.32 |
| Body 1 | Inter | 16px / 1rem | Regular (400) | 1.6 |
| Body 2 | Inter | 14px / 0.875rem | Regular (400) | 1.6 |
| Botón | Inter | 16px / 1rem | SemiBold (600) | 1.0 |
| Etiqueta | Inter | 12px / 0.75rem | Regular (400) | 1.5 |

### Escalado responsivo (multiplicador `--type-scale`)
- Mobile (<768px): **0.85x**
- Tablet (768–1024px): **0.95x**
- Desktop (≥1025px): **1x**

### Principios
- Sora solo para headings (H1–H4); Inter para todo el cuerpo, botones y etiquetas.
- Headings en sentence case (no ALL CAPS), salvo overlines/badges pequeños.
- Precios siempre con contexto ("por persona" / "total").

---

## 4. Spacing & Layout

### Contenedores (de `tokens.css`)
- Público (B2C): `--layout-container-public` = 80rem (1280px).
- Lectura: `--layout-container-reading` = 48rem.
- Cuenta/ERP: `--layout-container-account` = 90rem.
- Gutter de página: 1rem (mobile) → 1.5rem (tablet) → 2rem (desktop).
- Separación de sección: `--layout-section-gap` = `clamp(3rem, 7vw, 7rem)`.

### Header
- Altura: 4.5rem (mobile) / 5.5rem (desktop).

### Media
- Aspect ratio de tarjeta de tour: **16:9** (`--layout-tour-media-aspect`).
- Hero: 60vh (mobile) / 70vh (tablet) / 80vh (desktop).

---

## 5. Forma, Elevación y Glass (valores canónicos)

### Radios (`--shape-*`)
| Token | Valor | Uso |
|---|---|---|
| `--radius-control` | 0.75rem | Botones, inputs |
| `--radius-card` | 1.25rem | Tarjetas |
| `--radius-panel` | 2rem | Paneles / modales |
| `--radius-pill` | 9999px | Pills, navbar flotante, badges |

### Sombras / Elevación (`--elevation-*`)
| Token | Valor | Uso |
|---|---|---|
| `--shadow-card` | `0 0.5rem 1.5rem` azul-profundo 12% | Tarjetas en reposo |
| `--shadow-floating` | `0 1rem 3rem` azul-profundo 24% | Elementos flotantes, hover de tarjeta, glass |
| `--shadow-sticky` | `0 -0.125rem 0.5rem` negro 8% | Barras sticky inferiores |

### Glass (glassmorphism) — dos superficies canónicas

**Card / Panel Glass** (`.glass-surface`)
```css
background: color-mix(in srgb, var(--brand-azul-profundo) 82%, transparent);
border: 1px solid color-mix(in srgb, var(--brand-blanco-niebla) 30%, transparent);
box-shadow: inset 0 1px 0 rgba(249,251,252,0.24), var(--elevation-floating);
backdrop-filter: blur(1rem);
```
Fallback sin `backdrop-filter`: fondo sólido `--brand-azul-profundo`.

**Header Glass** (`.glass-header`, estilo iOS — casi invisible)
```css
background: transparent;
border: 1px solid color-mix(in srgb, var(--brand-blanco-niebla) 20%, transparent);
backdrop-filter: blur(0.5rem) saturate(1.8);
```
Fallback: `color-mix(in srgb, var(--brand-negro-volcanico) 40%, transparent)`.

> **Regla de legibilidad:** el texto del header cambia de color según posición —
> `text-blanco-niebla` sobre el hero, `text-negro-volcanico` fuera de él — para
> mantener contraste ≥4.5:1 en ambos estados.

---

## 6. Componentes

> Todos los componentes usan los tokens semánticos. Mínimo táctil 44×44px.
> Focus visible obligatorio (`:focus-visible` → outline 2px `--semantic-focus`, offset 2px).

### 6.1 Botones

| Variante | Fondo | Texto | Radio | Notas |
|---|---|---|---|---|
| **Primario (default)** | `--semantic-action-primary` (turquesa) | Blanco Niebla | control | icono opcional + flecha |
| **Primario (hover)** | `--semantic-action-primary-hover` (verde) | Blanco Niebla | control | transición firma turquesa→verde |
| **CTA Principal** | `--semantic-action-cta` (dorado) | Negro Volcánico; hover → verde + texto blanco | pill | "Planifica tu viaje" + icono calendario |
| **Secundario / Glass** | translúcido + blur, borde sutil | según fondo | control | "Conocer más" |
| **Ghost / terciario** | transparente, sin borde | Azul Cóndor | control | hover: subrayado |

**Estados (aplican a todas las variantes):**
- **Default:** color base de la variante.
- **Hover:** primario → verde; CTA → verde + texto blanco; secundario → fondo arena/blanco 10%.
- **Focus-visible:** outline 2px `--semantic-focus` (azul profundo), offset 2px. Sobre hero, offset transparente.
- **Active / pressed:** `scale(0.98)`, transición 100ms.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, sin hover/active.
- **Loading:** spinner + texto atenuado, botón no interactivo (`aria-busy="true"`), conserva ancho.

Transición estándar: `--motion-duration-standard` (200ms) con `--motion-ease-standard`.

### 6.2 Inputs

**Text / Select Input (sólido)**
- Fondo: Blanco Niebla; borde 1px `--semantic-border-subtle`; radio `control` (0.75rem); padding 12px 16px.
- Label visible (Inter 12–14px, `--semantic-text-muted`), 6px margin-bottom.
- Focus: borde azul-profundo + ring de foco.
- Error: borde `--derived-danger` + mensaje con `aria-describedby`.
- Disabled: fondo arena, texto atenuado, `cursor: not-allowed`.

**Input Glass (hero / sobre foto)**
- Superficie translúcida con blur (misma familia que `.glass-surface`), radio `control`.
- Usado en el buscador del hero (Destino / Fechas / Viajeros).

### 6.3 Tarjeta de Tour (catálogo)
- Contenedor: superficie de página; radio `card` (1.25rem); sombra `--shadow-card`.
- Imagen superior 16:9 (`--layout-tour-media-aspect`), `object-fit: cover`.
- Cuerpo: título H4 (Sora), metadata (ubicación/duración) Body 2, precio con contexto.
- Badge de disponibilidad usando semáforo (verde/dorado/danger/neutral) — nunca color solo, siempre con texto/icono.
- Hover: `translate-y(-4px)` + sombra `--shadow-floating`, 200ms.

### 6.4 Tarjeta Glass (destacada, ej. "Laguna del Otún")
- `.glass-surface` (blur 1rem, fondo azul-profundo 82%, borde blanco 30%).
- Título Sora, descripción Inter sobre texto claro; enlace "Ver más →".
- Radio `card` o `panel` según tamaño.

### 6.5 Modal / Dialog (`AccessibleDialog`)

> Componente accesible ya implementado en `apps/web/src/components/ui/AccessibleDialog.tsx`.
> Soporta variante **`dialog`** (modal centrado) y **`drawer`** (lateral). Toda ventana modal o
> drawer debe usar este componente, no una implementación ad-hoc.

**Anatomía:**
- **Overlay:** fondo `bg-negro-volcanico/60` que cubre el viewport; clic en el overlay cierra (salvo modales bloqueantes de feedback).
- **Contenedor:** superficie sólida (`bg-surface-page`) con `p-6`, texto `text-text-primary` y sombra `shadow-floating`. Modal (`dialog`): `rounded-panel`, `max-w-2xl`, `w-[calc(100%-2rem)]`, `max-h-[calc(100vh-2rem)]`. Drawer: `w-drawer-mobile max-w-drawer-max`, con `rounded-l-panel` (borde derecho) o `rounded-r-panel` (borde izquierdo).
- **Header:** título (H3/H4 Sora) + botón cerrar (icono X, ≥44×44px, `aria-label`).
- **Body:** contenido con scroll interno si excede la altura; padding según spacing del proyecto.
- **Footer (opcional):** acciones alineadas a la derecha (secundario + primario/CTA).

**Comportamiento accesible (obligatorio):**
- `role="dialog"` + `aria-modal="true"` + `aria-label`/`aria-labelledby`.
- **Focus trap** al abrir; foco inicial al primer control o al contenedor.
- **Escape** cierra y **devuelve el foco al disparador** (`triggerRef`).
- Bloqueo de scroll del `body` mientras está abierto.
- Animación: overlay fade-in + contenedor `scale(0.95 → 1)`, ~200–300ms; respeta `prefers-reduced-motion`.

**Variantes (prop `variant`):**
- **`dialog` (modal centrado):** `max-w-2xl`, centrado con `m-auto`. Usos: Auth Gate, confirmaciones, feedback post-tour.
- **`drawer`:** entra desde un borde (prop `drawerEdge`: `"left"` | `"right"`, default `"right"`), ancho `--layout-drawer-mobile` (85vw) con máx `--layout-drawer-max` (24rem). Usos: menú móvil, filtros, manifiesto lateral.

**API (props):** `open`, `onClose`, `triggerRef`, `ariaLabel`, `closeLabel`, `children`, `variant?`, `drawerEdge?`, `describedBy?`, `id?`, `className?`.

### 6.6 Navbar
- Barra flotante `rounded-full` (pill), fija arriba con márgenes laterales.
- Sobre hero: `.glass-header` (transparente + blur) con texto Blanco Niebla.
- Fuera del hero: sólido/`glass-header-solid` con texto Negro Volcánico (detección por `IntersectionObserver` sobre `[data-hero-sentinel]`).
- Enlaces: Destinos · Experiencias · Nosotros · Blog · Contacto.
- CTA dorado "Planifica tu viaje" con icono calendario.
- Logo horizontal ancho ≥160px (`--logo-horizontal-min-width`) con `alt` descriptivo.
- <768px: hamburguesa → `AccessibleDialog` variante drawer (derecha).

### 6.7 Badges / Pills
- Semáforo de disponibilidad: color semántico + **texto/icono** (nunca color solo, por accesibilidad).
- Badge de sección (ej. "EXPLORA COLOMBIA"): pill turquesa translúcido con texto turquesa en mayúsculas espaciadas.

---

## 7. Iconografía
- Estilo: trazo **2px** (`--icon-stroke`), esquinas redondeadas, minimalista lineal.
- Librería: `lucide-react` (Mountain, MapPin, Camera, Calendar, Users, Leaf, Backpack, Shield, Search, Ticket).

---

## 8. Motion & Interaction
- Duración estándar: `--motion-duration-standard` = 200ms; reducida: 100ms.
- Easing estándar: `--motion-ease-standard` = `cubic-bezier(0.2, 0, 0, 1)`.
- Hover de tarjeta: `translate-y(-4px)` + sombra.
- Press de botón: `scale(0.98)`.
- Modal: overlay fade + contenedor `scale(0.95 → 1)`.
- Navbar: transición color glass ↔ sólido al salir del hero.
- **Siempre** respetar `prefers-reduced-motion: reduce`.

---

## 9. Voz y Tono
- Cercano, experto, inspirador. Segunda persona (de tú a tú).
- **Sí:** "Descubre lugares que te cambian por dentro." · "Viaja consciente, vive experiencias auténticas." · "Tu aventura está confirmada."
- **No:** "Las mejores vacaciones de tu vida." · "Viajes baratos." · "¡Promociones imperdibles!!!"
- Emojis: solo en notificaciones push, nunca en la UI core. Idioma base ES-CO (i18next).

---

## 10. Trust Badges (Footer)
Cada promesa con su icono lineal:
1. **Turismo Responsable** (hoja) — Cuidamos los lugares que visitas.
2. **Experiencias Únicas** (cámara) — Diseñamos viajes auténticos y memorables.
3. **Seguridad Garantizada** (escudo) — Tu tranquilidad es nuestra prioridad.
4. **Atención Personalizada** (personas) — Estamos contigo en cada paso.

---

## 11. Accesibilidad (WCAG 2.1 AA)
- Contraste texto ≥ 4.5:1 (verificar Blanco Niebla sobre Azul Profundo, y texto sobre glass con overlay).
- Todos los inputs con label o `aria-label`; errores con `aria-describedby`.
- Focus ring visible en todo interactivo; targets táctiles ≥ 44×44px.
- Modales/drawers: `role="dialog"`, `aria-modal`, focus trap, Escape, retorno de foco.
- Semáforo de disponibilidad nunca comunica solo por color: siempre texto o icono.

---

## 12. Anti-patrones
- No inventar hex fuera de la paleta (usar tokens semánticos, no primitivas sueltas).
- No usar Sora para cuerpo/UI (solo headings).
- No usar el Dorado como fondo grande (solo CTA/acento).
- No texto sobre fotografía sin overlay o glass.
- No color como único indicador de estado (accesibilidad).
- No modales ad-hoc: usar `AccessibleDialog`.
- No mezclar radios arbitrarios: usar la escala `--shape-*`.
- No sombras agresivas: usar la escala `--elevation-*`.

---

## Fuentes y trazabilidad

### Código (fuente de verdad de valores)
- Tokens: `apps/web/src/styles/tokens.css`
- Proyección Tailwind + clases glass: `apps/web/src/styles/global.css`
- Manifiesto de tokens derivados: `apps/web/src/lib/designTokenManifest.ts`
- Componentes de referencia: `Navbar.tsx`, `Hero.tsx`, `ui/AccessibleDialog.tsx`

### Documentación de marca
- Manual completo: `otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md`
- Design System B2C: `otros/design/b2c/design.md`
- Steering de marca: `.kiro/steering/12-brand-identity.md`
- Brand board: `otros/design/marca/borondo tours brand v1.png`
