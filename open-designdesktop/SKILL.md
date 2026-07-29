---
od:
  mode: prototype
  platform: web
  scenario: design
  design_system:
    requires: borondotours
  fidelity: high
  example_prompt: "Landing page para marketplace de tours en Colombia con glassmorphism y fotografía inmersiva"
---

# BorondoTours Web Prototype

Genera prototipos HTML de alta fidelidad para BorondoTours — marketplace
de tours en Colombia. Aplica el design system de la marca: glassmorphism
sobre fotografía, tipografía editorial (Fraunces + Instrument Sans), y
paleta inspirada en el páramo colombiano.

## Output Contract

Produce un único archivo HTML autocontenido con:
- Google Fonts: Fraunces (italic 500) + Instrument Sans (400, 500, 600)
- Tailwind CSS via CDN para utility classes
- CSS custom properties con los tokens de marca
- Imágenes placeholder via Unsplash (tours Colombia, naturaleza)
- Responsive: mobile-first, breakpoints 768px y 1280px
- Dark mode toggle funcional via prefers-color-scheme + JS toggle

## Design Tokens (CSS Variables)

```css
:root {
  --bg: #F8F5F0;
  --surface: #FFFFFF;
  --fg: #1A1A1A;
  --fg-muted: #5C5C5C;
  --border: #E8E3DC;
  --primary: #1B6B4A;
  --primary-hover: #145A3D;
  --primary-light: #E6F5EE;
  --secondary: #2E7D9B;
  --accent: #7B4FA2;
  --gold: #C8922A;
  --gold-light: #FDF6E8;
  --success: #198754;
  --warning: #D4940A;
  --danger: #CC3D3D;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

[data-theme="dark"] {
  --bg: #0F1410;
  --surface: #1A211C;
  --fg: #F0EDE8;
  --fg-muted: #A8A29E;
  --border: #2D3630;
  --primary: #4AE89B;
  --secondary: #5BC5E0;
  --accent: #B088D4;
  --gold: #E8B44A;
}
```

## Typography Scale

| Role | Font | Size | Weight | Style |
|------|------|------|--------|-------|
| H1 | Fraunces | 80px | 500 | Italic |
| H2 | Fraunces | 56px | 500 | Italic |
| H3 | Instrument Sans | 32px | 600 | Normal |
| H4 | Instrument Sans | 22px | 600 | Normal |
| Body | Instrument Sans | 16px | 400 | Normal |
| Small | Instrument Sans | 12px | 500 | Normal |
| Button | Instrument Sans | 14px | 600 | Normal |

## Glassmorphism Rules

- Light glass card: `background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.4);`
- Dark glass card: `background: rgba(26,33,28,0.78); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1);`
- ONLY use glassmorphism over photography backgrounds
- Never on solid color backgrounds

## Component Patterns

### Hero Section
- Full-bleed background image (Unsplash Colombia landscape)
- Overlay: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))
- H1 in Fraunces italic, white, centered
- Search bar with glass effect, centered, radius 16px
- Min-height: 70vh desktop, 50vh mobile

### Tour Cards
- Glass card over thumbnail background
- Image 16:9 aspect ratio with radius-lg corners
- Title in H4, location in small muted text
- Price badge in gold-light background
- Hover: translateY(-4px) + shadow increase

### Navigation
- Transparent over hero, glass on scroll
- Logo: isotipo + "BorondoTours" in Fraunces 20px italic
- Mobile: bottom tab bar with glass background

### Buttons
- Primary: bg primary, white text, radius-md, hover scale(1.02)
- Secondary: border primary, transparent bg, radius-md
- Glass: rgba(255,255,255,0.2) + blur, white text

## Voice & Microcopy
- Tone: narrativo, cercano, natural
- CTAs: verbos infinitivo ("Reservar", "Explorar", "Descubrir")
- No lenguaje comercial forzado
- Mascota "Borondo" (ave) en estados vacíos

## Page Templates

### Landing Page
1. Hero (imagen páramo + título + búsqueda glass)
2. Categorías (grid horizontal con iconos)
3. Tours destacados (grid 3-4 cols, glass cards)
4. Testimonios (avatar + texto + estrellas)
5. CTA final (fondo foto + overlay + H2 + botón)
6. Footer (links + logo + redes)

### Tour Detail
1. Galería (1 grande + 4 thumbs)
2. Info principal (título, ubicación, rating)
3. Booking panel sticky (glass, derecha desktop)
4. Itinerario (timeline vertical)
5. Incluye/Excluye (two-column check/cross)
6. Reviews + Mapa + Operador
7. Mobile: CTA fijo bottom bar

### Dashboard (ERP)
- Sidebar fija + contenido principal
- Cards sólidas (sin glass) sobre fondo crema
- Tablas con border sutil
- Charts con paleta de marca
