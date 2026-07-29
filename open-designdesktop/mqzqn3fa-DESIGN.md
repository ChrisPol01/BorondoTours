---
tags: [design-system, frontend, UI, branding, identidad-visual]
created: 2026-06-25
updated: 2026-06-25
status: borrador
---

# BorondoTours Design System

> Category: Travel & Marketplace
> Marketplace de tours en Colombia. Elegante, confiable, inspirado en el
> páramo colombiano. Glassmorphism sobre fotografía inmersiva, tipografía
> editorial con carácter, paleta que transmite naturaleza, paz y aventura.

## 1. Visual Theme & Atmosphere

BorondoTours se siente como hojear una revista de viajes de lujo que
también te deja reservar en dos clics. La interfaz desaparece para que
la fotografía colombiana sea protagonista — páramos, selvas, playas,
pueblos coloniales — mientras módulos glassmorphism flotan sobre las
imágenes con elegancia contenida.

El tono es moderno pero no frío, premium pero no inaccesible, natural
pero no rústico. Piensa en un lodge boutique en el Cocora: sofisticado,
respetuoso con el entorno, materiales nobles.

**Identidad visual clave:**
- Isotipo: ave con barbilla morada estilizada (silueta geométrica)
- Logotipo: "BorondoTours" en Fraunces Semibold Italic
- Mascota: "Borondo" — el ave guía que acompaña al viajero
- Fotografía full-bleed como superficie principal
- Glassmorphism (backdrop-blur + transparencia) en cards sobre foto
- Dos modos: Light (default, cálido-crema) + Dark (inmersivo, toggle)
- Tipografía editorial: Fraunces display + Instrument Sans UI

**Atmósfera:** Confiable · Elegante · Eficaz · Natural · Premium · Fresco

## 2. Color Palette & Roles

Paleta inspirada en el ecosistema del páramo colombiano: verdes profundos
de frailejón, cremas cálidos de niebla al amanecer, azules de laguna
glaciar, dorados de atardecer andino, y el morado distintivo del ave
barbilla morada como acento de marca.

### Light Mode (Default)

| Token | Hex | Rol |
|-------|-----|-----|
| **Background** | `#F8F5F0` | Crema cálido — lienzo principal |
| **Surface** | `#FFFFFF` | Cards, modales, paneles |
| **Surface Glass** | `rgba(255, 255, 255, 0.72)` | Cards glassmorphism sobre foto |
| **Foreground** | `#1A1A1A` | Texto principal (casi negro cálido) |
| **Foreground Muted** | `#5C5C5C` | Texto secundario, captions |
| **Foreground Subtle** | `#8A8A8A` | Placeholders, metadata |
| **Border** | `#E8E3DC` | Bordes de cards y separadores |
| **Border Subtle** | `#F0EBE4` | Divisores sutiles internos |

### Brand Colors

| Token | Hex | Rol |
|-------|-----|-----|
| **Primary (Páramo Green)** | `#1B6B4A` | CTA principal, links, activos |
| **Primary Hover** | `#145A3D` | Hover sobre primary |
| **Primary Light** | `#E6F5EE` | Backgrounds de badges, chips |
| **Secondary (Laguna Blue)** | `#2E7D9B` | Acciones secundarias, info |
| **Secondary Light** | `#E8F4F8` | Backgrounds informativos |
| **Accent (Barbilla Purple)** | `#7B4FA2` | Acento de marca, mascota, premium |
| **Accent Light** | `#F3EDF8` | Highlights de lealtad/coins |
| **Warm Gold** | `#C8922A` | Precios, urgencia, badges premium |
| **Warm Gold Light** | `#FDF6E8` | Backgrounds de precio/oferta |

### Semantic Colors

| Token | Hex | Rol |
|-------|-----|-----|
| **Success** | `#198754` | Confirmaciones, pagos exitosos |
| **Warning** | `#D4940A` | Alertas, vigencias próximas |
| **Danger** | `#CC3D3D` | Errores, cancelaciones |
| **Info** | `#2E7D9B` | Informativo (alias de Secondary) |

### Dark Mode

| Token | Hex | Rol |
|-------|-----|-----|
| **Background Dark** | `#0F1410` | Fondo oscuro profundo (verde-negro) |
| **Surface Dark** | `#1A211C` | Cards en dark mode |
| **Surface Glass Dark** | `rgba(26, 33, 28, 0.78)` | Glassmorphism dark |
| **Foreground Dark** | `#F0EDE8` | Texto principal en dark |
| **Foreground Muted Dark** | `#A8A29E` | Texto secundario en dark |
| **Border Dark** | `#2D3630` | Bordes en dark |

En dark mode, Primary se aclara a `#4AE89B`, Secondary a `#5BC5E0`,
Accent a `#B088D4`, y Warm Gold a `#E8B44A` para mantener contraste.


---

## 3. Typography Rules

### Font Families
- **Display / Headings:** `'Fraunces', Georgia, serif` — Semibold Italic
- **Body / UI:** `'Instrument Sans', -apple-system, system-ui, sans-serif`
- **Mono:** `'JetBrains Mono', ui-monospace, monospace`

### Type Scale

| Role | Font | Size | Weight | Style | Line Height |
|------|------|------|--------|-------|-------------|
| H1 | Fraunces | 80px | 500 | Italic | 1.1 |
| H2 | Fraunces | 56px | 500 | Italic | 1.15 |
| H3 | Instrument Sans | 32px | 600 | Normal | 1.25 |
| H4 | Instrument Sans | 22px | 600 | Normal | 1.3 |
| Body | Instrument Sans | 16px | 400 | Normal | 1.6 |
| Small | Instrument Sans | 12px | 500 | Normal | 1.4 |
| Button | Instrument Sans | 14px | 600 | Normal | 1.0 |
| Caption | Instrument Sans | 13px | 400 | Normal | 1.4 |
| Overline | Instrument Sans | 11px | 600 | Normal | 1.2 |

### Typography Principles
- Fraunces Italic solo para H1 y H2 — es el "momento editorial"
- Instrument Sans para toda la UI funcional (H3 en adelante)
- Nunca mezclar más de 2 tamaños de Fraunces en una misma pantalla
- Letter-spacing: -0.02em en H1/H2, 0 en body, +0.08em en Overline
- Headings Fraunces van en sentence case (no ALL CAPS)
- En dark mode, peso de body puede subir a 450 para legibilidad

---

## 4. Spacing & Grid

### Spacing Scale (px)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 120`

### Grid System
- **Desktop (>=1280px):** 12 columnas, max-width 1440px, gutters 24px
- **Tablet (768-1279px):** 8 columnas, gutters 20px
- **Mobile (<768px):** 4 columnas, gutters 16px
- Padding lateral del contenedor: 24px desktop, 20px tablet, 16px mobile

### Vertical Rhythm
- Secciones principales: 80px separacion desktop, 48px mobile
- Entre cards de un grid: 24px desktop, 16px mobile
- Dentro de una card: 20px padding, 12px entre elementos
- Entre texto heading y body: 12px
- Entre parrafos: 16px

## 5. Layout & Composition

### Principios de Layout
- Fotografia primero: el hero siempre es imagen full-bleed (100vw)
- Modulos flotantes: cards glassmorphism superpuestas sobre la foto
- Jerarquia clara: Hero > Busqueda > Categorias > Tours > CTA
- Asimetrico con proposito: columnas 60/40 o 55/45 para detalles
- Scroll narrativo: la pagina cuenta una historia de arriba a abajo

### Composicion por Pagina

**Landing / Catalogo B2C:**
- Hero full-screen con titulo Fraunces + barra busqueda glass
- Grid categorias (iconos + labels) en franja horizontal
- Grid tours 3-4 columnas con cards glass sobre thumbnail
- Seccion testimonios con avatar + texto
- CTA final con fondo fotografico + overlay oscuro

**Detalle de Tour:**
- Galeria fotos (hero grande + 4 thumbs) con rounded corners
- Panel booking sticky a la derecha (glass card)
- Info: itinerario, incluye/excluye, reviews, mapa, operador
- CTA fijo en mobile (barra inferior glass con precio + boton)

**Dashboard / ERP (areas logueadas):**
- Sidebar fija + contenido principal en white surface
- Sin glassmorphism en areas administrativas (claridad operativa)
- Cards con border sutil sobre background crema

## 6. Components

### Buttons

**Primary CTA** (Reservar, Buscar, Confirmar)
- Background: Primary `#1B6B4A`
- Text: `#FFFFFF`, Instrument Sans 14px/600
- Padding: 12px 24px
- Radius: 12px
- Hover: `#145A3D` + subtle scale(1.02)
- Active: scale(0.98)
- Shadow: `0 2px 8px rgba(27, 107, 74, 0.25)`

**Secondary Button** (Ver mas, Compartir)
- Background: transparent
- Text: Primary `#1B6B4A`, 14px/600
- Border: 1.5px solid `#1B6B4A`
- Radius: 12px
- Hover: background `#E6F5EE`

**Ghost Button** (acciones terciarias)
- Background: transparent, no border
- Text: Foreground Muted `#5C5C5C`, 14px/500
- Hover: text Primary, underline

**Glass Button** (sobre fotografias)
- Background: `rgba(255, 255, 255, 0.2)`
- Backdrop-filter: blur(12px)
- Border: 1px solid `rgba(255, 255, 255, 0.3)`
- Text: `#FFFFFF`, 14px/600
- Radius: 12px

**Disabled State** (aplica a todos los botones)
- Opacity: 0.5
- Cursor: not-allowed
- No hover/active transitions

**Focus-visible** (aplica a todos los botones)
- Outline: 2px solid `#1B6B4A`, offset 2px
- Ring: `0 0 0 3px #E6F5EE`

### Cards

**Tour Card (catalogo)**
- Background: `rgba(255, 255, 255, 0.72)`
- Backdrop-filter: blur(16px) saturate(1.2)
- Border: 1px solid `rgba(255, 255, 255, 0.4)`
- Radius: 16px
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.08)`
- Contenido: imagen 16:9 arriba, metadata abajo
- Hover: translate-y(-4px) + shadow mas pronunciado

**Booking Panel (detalle tour)**
- Background: `rgba(255, 255, 255, 0.85)`
- Backdrop-filter: blur(20px)
- Border: 1px solid `#E8E3DC`
- Radius: 20px
- Padding: 24px
- Shadow: `0 12px 40px rgba(0, 0, 0, 0.1)`
- Sticky en desktop (top: 100px)

**Info Card (dashboard/ERP)**
- Background: `#FFFFFF`
- Border: 1px solid `#E8E3DC`
- Radius: 12px
- Padding: 20px
- Shadow: none (flat, funcional)

### Inputs

**Text Input**
- Background: `#FFFFFF`
- Border: 1.5px solid `#E8E3DC`
- Radius: 10px
- Padding: 12px 16px
- Focus: border `#1B6B4A`, ring `0 0 0 3px #E6F5EE`
- Error: border `#CC3D3D`, ring `0 0 0 3px #FDEAEA`
- Disabled: background `#F5F3F0`, border `#E8E3DC`, text `#8A8A8A`, cursor not-allowed
- Label: 13px/500 color `#5C5C5C`, 6px margin-bottom

**Search Bar (hero, glass)**
- Background: `rgba(255, 255, 255, 0.8)`
- Backdrop-filter: blur(16px)
- Border: 1px solid `rgba(255, 255, 255, 0.5)`
- Radius: 16px
- Padding: 16px 24px
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.12)`

### Navigation

**Top Nav (desktop)**
- Height: 72px
- Background: transparent sobre hero, white on scroll
- Logo: isotipo ave 40px + "BorondoTours" Fraunces 20px italic
- Links: Instrument Sans 14px/500
- Transicion: glassmorphism al scroll (blur background)

**Mobile Bottom Nav**
- Background: `rgba(255, 255, 255, 0.9)` + blur(16px)
- Iconos: 24px, color `#5C5C5C`
- Activo: icono + label en `#1B6B4A`

### Badges

**Category Chip:** bg `#E6F5EE`, text `#1B6B4A`, 12px/500, radius 8px
**Price Badge:** bg `#FDF6E8`, text `#C8922A`, 13px/600, radius 8px
**Loyalty Badge:** bg `#F3EDF8`, text `#7B4FA2`, 12px/600, radius 8px

---

## Links Relacionados

- Stack frontend: `docs/04-Tech-Design/Arquitectura-Sistema.md` §4 (Patrones Frontend)
- Tipografías y UI: Tailwind CSS 4 + Shadcn/UI (ver steering `02-tech-stack.md`)
- Identidad del proyecto: `docs/00-Inicio/` — Visión y Objetivos

## 7. Motion & Interaction

### Timing Tokens
- **Fast:** 150ms — hover states, color transitions
- **Base:** 250ms — card hover lifts, menu open/close
- **Slow:** 400ms — page transitions, modals, hero reveals
- **Dramatic:** 600ms — onboarding, animaciones de mascota

### Easing
- **Default:** cubic-bezier(0.4, 0, 0.2, 1)
- **Enter:** cubic-bezier(0, 0, 0.2, 1)
- **Exit:** cubic-bezier(0.4, 0, 1, 1)
- **Bounce:** cubic-bezier(0.34, 1.56, 0.64, 1) — mascota Borondo

### Interacciones Clave
- Card hover: translate-y(-4px) + shadow grow, 250ms
- Button press: scale(0.98), 100ms
- Nav scroll: transparent to glass, 300ms
- Page transitions: fade + slide-up 20px, 400ms
- Modal: backdrop fade-in + scale(0.95 to 1), 300ms
- Skeleton loaders: pulse shimmer left-to-right
- Mascota Borondo: bounce easing en micro-interacciones

### Scroll (GSAP ScrollTrigger)
- Hero parallax: imagen a 0.5x velocidad scroll
- Cards catalogo: fade-in + translate-y(20px) staggered
- Respetar prefers-reduced-motion siempre

## 8. Voice & Brand

### Tono de Comunicacion
- Serio pero cercano — usa "tu" de forma natural
- Narrativo — cuenta mini-historias, no vende directamente
- Confiable — datos precisos, sin hiperboles
- Natural — fluye como conversacion, no como copy forzado

### Ejemplos de Voz

| Contexto | Mal | Bien |
|----------|-----|------|
| CTA | "COMPRA AHORA!!!" | "Reservar este tour" |
| Card | "El mejor tour" | "Paramo de Sumapaz · 2 dias" |
| Vacio | "No hay resultados" | "Borondo no encontro tours aqui" |
| Exito | "Compra exitosa" | "Tu aventura esta confirmada" |
| Error | "Error 500" | "Algo salio mal. Intenta de nuevo" |

### Microcopy
- Botones: verbos infinitivo ("Reservar", "Explorar")
- Labels: sustantivos concisos ("Destino", "Fecha")
- Errores: que paso + como solucionarlo
- Mascota Borondo habla en estados vacios y onboarding
- Emojis: solo en push notifications, nunca en UI core
- Idiomas: ES-CO default, EN segundo (via i18next)

## 9. Anti-patterns

### NO hacer
- No usar colores fuera de la paleta (no inventar hex nuevos)
- No poner texto sobre fotos sin overlay o glass
- No usar Fraunces para body/UI (solo H1, H2)
- No usar ALL CAPS excepto Overline (11px/600)
- No abusar glassmorphism en areas admin/ERP
- No usar gradientes de color como fondo (la foto ES el fondo)
- No mezclar border-radius (12px cards, 16px hero, 10px inputs)
- No sombras agresivas — elevation sutil
- No forzar mascota Borondo en cada pantalla
- No lenguaje imperativo/urgente
- No mostrar precios sin contexto ("por persona" o "total")
- No mas de 3 colores de marca en una misma vista

### SI hacer
- Dejar que la fotografia hable
- Whitespace generoso entre secciones
- Consistencia de radius por nivel
- Contrast ratio min 4.5:1 texto, 3:1 UI en ambos modos
- Animar solo con proposito
- Mascota Borondo en estados vacios/errores/onboarding
- Mobile-first para B2C, desktop-first para ERP
- Fotos 16:9 cards, 3:2 heros, 1:1 avatares

## Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Paramo Green `#1B6B4A`
- Background light: Warm Cream `#F8F5F0`
- Surface: White `#FFFFFF`
- Glass: `rgba(255, 255, 255, 0.72)` + blur(16px)
- Text: Near Black `#1A1A1A`
- Text muted: `#5C5C5C`
- Borders: `#E8E3DC`
- Accent: Barbilla Purple `#7B4FA2`
- Prices: Warm Gold `#C8922A`
- Secondary: Laguna Blue `#2E7D9B`
- Success `#198754` / Warning `#D4940A` / Danger `#CC3D3D`
- Dark bg: `#0F1410` / Dark surface: `#1A211C`

### Component Prompts
- "Tour card glass: bg rgba(255,255,255,0.72), blur 16px, border
  rgba(255,255,255,0.4), radius 16px, shadow 0 8px 32px rgba(0,0,0,0.08).
  Imagen 16:9, titulo H4, precio Warm Gold, CTA Primary."
- "Hero: full-bleed min-h-70vh, overlay from-black/40, H1 Fraunces
  80px italic white, search bar glass center radius 16px."
- "Booking panel: glass 0.85 blur 20px, radius 20px, padding 24px,
  shadow 0 12px 40px rgba(0,0,0,0.1), sticky top 100px."

### Iteration Guide
1. Colores por nombre + hex de este doc
2. Glass solo sobre fotografia, nunca fondos solidos
3. Fraunces solo H1/H2 — todo mas es Instrument Sans
4. Mascota: onboarding, vacios, confirmaciones, lealtad
5. Desktop-first ERP, mobile-first B2C
6. Color no documentado: usa el mas cercano existente
