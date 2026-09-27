# 🎨 Design System — Borondo Tours (B2C)

> **Fuente de verdad visual para diseñadores y frontend.**
> Fusiona el manual de marca (`otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md`)
> con el tablero visual `web/1-1-Marca.png`. Los valores de esta guía son los canónicos para
> implementar la web pública B2C (Astro + React islands + Tailwind CSS 4).
>
> **Slogan principal:** EXPLORA DONDE NACE LA NATURALEZA

---

## 1. Concepto Visual y Atmósfera

Borondo Tours transmite **naturaleza imponente, confianza y aventura consciente**. La interfaz
combina fotografía full-bleed de paisajes colombianos (páramos, lagunas, montañas) con módulos
**glassmorphism** (fondos translúcidos + blur) que flotan sobre las imágenes. El resultado es
premium pero cercano, natural pero moderno.

**Pilares gráficos (5):**
1. Naturaleza Protagonista (icono: montaña)
2. Espacios Amplios (icono: flechas de expansión)
3. Experiencias Auténticas (icono: cámara)
4. Aventura Consciente (icono: hoja)
5. Conexión Humana (icono: personas)

---

## 2. Paleta de Color

> Muestreada del tablero `1-1-Marca.png` y confirmada contra el manual de marca.

| Token | Nombre | Hex | Rol / Uso |
|---|---|---|---|
| `azul-profundo` | Azul Profundo (Primary Dark) | `#103B66` | Fondos oscuros principales, superficies glass |
| `azul-condor` | Azul Cóndor (Primary) | `#2364AA` | Acentos sobrios, detalles, texto muted |
| `turquesa` | Turquesa Laguna (Secondary) | `#00B7C7` | Botón primario (estado default), badges |
| `verde-frailejon` | Verde Frailejón (Accent) | `#79C142` | Botón primario (hover), disponible |
| `arena` | Arena (Light Accent) | `#F3E8D1` | Fondos de sección cálidos |
| `dorado` | Dorado (CTA) | `#FDB813` | CTA principal, ratings, energía |
| `blanco-niebla` | Blanco Niebla (Background) | `#F9FBFC` | Fondo de página, texto sobre oscuro |
| `negro-volcanico` | Negro Volcánico (Text Dark) | `#101010` | Texto principal, overlays |

### Gradientes Aprobados
| Nombre | Definición | Uso |
|---|---|---|
| `gradient-nature` (Naturaleza) | `#00B7C7 → #79C142` | Tarjetas destacadas, badges de naturaleza |
| `gradient-depth` (Profundidad) | `#103B66 → #00B7C7` | Fondos de sección, banners |

### Proporción de color
- Neutros (blanco-niebla, azul-profundo) dominan como fondo.
- Turquesa/verde para acciones.
- Dorado SOLO como CTA principal y acentos puntuales (no como fondo grande).

---

## 3. Tipografía

| Familia | Rol Tailwind | Uso |
|---|---|---|
| **Sora** | `font-heading` | Títulos H1–H4 y subtítulos (ExtraBold/Bold/SemiBold) |
| **Inter** | `font-body` | Cuerpo, botones, etiquetas (Regular/SemiBold) |

### Escala tipográfica (desktop 1x)

| Elemento | Familia | Peso | Tamaño | Line-height |
|---|---|---|---|---|
| H1 | Sora | ExtraBold | 56px / 3.5rem | 112% |
| H2 | Sora | Bold | 40px / 2.5rem | 120% |
| H3 | Sora | SemiBold | 28px / 1.75rem | 128% |
| H4 | Sora | SemiBold | 20px / 1.25rem | 132% |
| Body 1 | Inter | Regular | 16px / 1rem | 160% |
| Body 2 | Inter | Regular | 14px / 0.875rem | 160% |
| Botón | Inter | SemiBold | 16px / 1rem | 100% |
| Etiqueta | Inter | Regular | 12px / 0.75rem | 150% |

### Escalado responsivo (multiplicador)
- Mobile (<768px): **0.85x**
- Tablet (768–1024px): **0.95x**
- Desktop (>1024px): **1x**

---

## 3b. Spacing, Grid y Contenedores

> Geometría medida de las composiciones 375px / 1440px (de `apps/web/src/styles/tokens.css`).

### Escala de spacing (Tailwind base 4px)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96` px.

### Contenedores
| Token | Valor | Uso |
|---|---|---|
| `--layout-container-public` | 80rem (1280px) | Contenedor público B2C (`max-w-public`) |
| `--layout-container-reading` | 48rem | Contenido de lectura (blog, legal) |
| `--layout-container-account` | 90rem | Área de cuenta / ERP |

### Gutter y ritmo
- Gutter de página (`--layout-page-gutter`): **1rem** (mobile) → **1.5rem** (≥768px) → **2rem** (≥1025px).
- Separación entre secciones (`--layout-section-gap`): `clamp(3rem, 7vw, 7rem)`.
- Header: 4.5rem (mobile) / 5.5rem (desktop).
- Aspect ratio de media de tour: **16:9** (`--layout-tour-media-aspect`).

### Breakpoints (multiplicador tipográfico `--type-scale`)
- Mobile `<768px` → 0.85x · Tablet `768–1024px` → 0.95x · Desktop `≥1025px` → 1x.

---

## 4. Iconografía

- **Estilo:** trazo 2px, esquinas redondeadas, minimalista (lineal).
- **Set principal:** montaña, pin de ubicación, cámara, calendario/tiquete, personas (hiking), hoja, mochila, escudo.
- **Librería sugerida:** `lucide-react` (Mountain, MapPin, Camera, Calendar, Users, Leaf, Backpack, Shield).

---

## 5. Botones (variantes y estados)

| Variante | Fondo | Texto | Estado / Copy ejemplo |
|---|---|---|---|
| Primario (default) | `turquesa` `#00B7C7` | Blanco | "Explorar destinos" + flecha |
| Primario (hover) | `verde-frailejon` `#79C142` | Blanco | "Explorar destinos" + flecha |
| CTA Principal | `dorado` `#FDB813` | Negro/oscuro | "Planifica tu viaje" + icono calendario |
| Secundario (Glass) | Translúcido + blur, borde sutil | Oscuro/blanco | "Conocer más" (con icono lupa) |

- Radio de botón: usar el radio de control del proyecto (`0.75rem`).
- Transición turquesa → verde en hover es la firma interactiva de la marca.

---

## 6. Elementos Glass (Glassmorphism) — valores exactos

> Especificación tomada directamente del tablero `1-1-Marca.png`. Estos son los valores
> canónicos para superficies translúcidas (tarjetas e inputs sobre fotografía).

### Card Glass
```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.15);
border: 1px solid rgba(255, 255, 255, 0.25);
border-radius: 16px;
```

### Input Glass
```css
backdrop-filter: blur(16px);
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.20);
border-radius: 12px;
```

> **Regla de legibilidad:** cuando el glass va sobre fotografía, aplicar overlay oscuro
> (`bg-negro-volcanico/40`) a la imagen de fondo para asegurar contraste del texto.

---

## 7. Design Tokens (CSS listos para Tailwind 4)

```css
:root {
  /* Marca */
  --azul-profundo: #103B66;
  --azul-condor: #2364AA;
  --turquesa: #00B7C7;
  --verde-frailejon: #79C142;
  --arena: #F3E8D1;
  --dorado: #FDB813;
  --blanco-niebla: #F9FBFC;
  --negro-volcanico: #101010;

  /* Gradientes */
  --gradient-nature: linear-gradient(135deg, #00B7C7 0%, #79C142 100%);
  --gradient-depth: linear-gradient(135deg, #103B66 0%, #00B7C7 100%);

  /* Radios */
  --radius-control: 0.75rem;   /* botones, inputs */
  --radius-card: 1.25rem;      /* tarjetas */
  --radius-panel: 2rem;        /* paneles/modales */
  --radius-pill: 9999px;

  /* Glass */
  --glass-card-blur: 20px;
  --glass-card-bg: rgba(255, 255, 255, 0.15);
  --glass-card-border: rgba(255, 255, 255, 0.25);
  --glass-input-blur: 16px;
  --glass-input-bg: rgba(255, 255, 255, 0.08);
  --glass-input-border: rgba(255, 255, 255, 0.20);
}
```

---

## 8. UI Web — Navbar y Hero

### Navbar
- Enlaces: `Destinos` · `Experiencias` · `Nosotros` · `Blog` · `Contacto`.
- Fondo glass/transparente sobre el hero (se solidifica al hacer scroll).
- Botón navbar: sólido **Dorado** `#FDB813`, texto "Planifica tu viaje".

### Hero
- Fondo: fotografía full-bleed de paisaje + overlay oscuro.
- H1 (Sora ExtraBold): "Viajes que transforman tu manera de ver el mundo."
- Subtítulo (Inter): "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza."
- Buscador Glass superpuesto: campos `Destino` ("¿A dónde quieres ir?"), `Fechas` ("Fecha de viaje"), `Viajeros` ("2 viajeros") + botón dorado "Buscar aventura".

---

## 8b. Sombras / Elevación

> Escala de elevación canónica (de `apps/web/src/styles/tokens.css`). Usar estos tokens; no inventar `box-shadow` sueltos.

| Token CSS | Valor | Uso |
|---|---|---|
| `--elevation-card` | `0 0.5rem 1.5rem` (azul-profundo 12%) | Tarjetas en reposo |
| `--elevation-floating` | `0 1rem 3rem` (azul-profundo 24%) | Elementos flotantes, hover de tarjeta, glass, modales |
| `--elevation-sticky` | `0 -0.125rem 0.5rem` (negro 8%) | Barras sticky inferiores (CTA móvil) |

Alias Tailwind: `shadow-card`, `shadow-floating`, `shadow-sticky`.

---

## 8c. Estados completos de Botón

> Amplía la §5. Aplica a todas las variantes salvo que se indique.

| Estado | Comportamiento |
|---|---|
| **Default** | Color base de la variante (primario turquesa, CTA dorado, secundario glass, ghost transparente). |
| **Hover** | Primario → verde frailejón `#79C142`. CTA dorado → verde + texto blanco. Secundario/ghost → fondo `arena` o blanco 10%. |
| **Focus-visible** | `outline: 2px solid #103B66` (azul-profundo), `offset: 2px`. Sobre el hero, usar offset transparente. |
| **Active / pressed** | `scale(0.98)`, transición 100ms. |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, sin hover ni active. |
| **Loading** | Spinner + texto atenuado, `aria-busy="true"`, conserva el ancho, no interactivo. |

- Transición estándar: **200ms** con easing `cubic-bezier(0.2, 0, 0, 1)`.
- Radio: `--radius-control` (0.75rem); el CTA principal usa `--radius-pill`.
- Mínimo táctil: **44×44px**.

---

## 8d. Tarjeta de Tour (catálogo)

> La glass card de §6 es genérica. Esta es la tarjeta real del grid de tours.

- Contenedor: superficie de página; radio `--radius-card` (1.25rem); sombra `--elevation-card`.
- Imagen superior **16:9** (`--layout-tour-media-aspect`), `object-fit: cover`, `loading="lazy"` (below the fold).
- Cuerpo:
  - Título: **H4 Sora** (SemiBold).
  - Metadata: ubicación · duración en **Body 2 Inter**, color `--semantic-text-muted`.
  - Precio: **con contexto** ("por persona" / "total"). El Dorado se usa solo como acento del precio o rating, no como fondo.
  - Badge de disponibilidad (semáforo): color semántico **+ texto/icono** (nunca color solo).
- Hover: `translate-y(-4px)` + sombra `--elevation-floating`, 200ms.

---

## 8e. Modal / Dialog (`AccessibleDialog`)

> Componente accesible ya implementado en `apps/web/src/components/ui/AccessibleDialog.tsx`.
> **Toda** ventana modal o drawer debe usar este componente, nunca una implementación ad-hoc.

**Anatomía:**
- **Overlay:** `bg-negro-volcanico/60` cubriendo el viewport; clic cierra (salvo modales bloqueantes de feedback post-tour).
- **Contenedor:** `bg-surface-page`, `p-6`, texto `text-text-primary`, sombra `shadow-floating`.
  - Modal (`dialog`): `rounded-panel` (2rem), `max-w-2xl`, `w-[calc(100%-2rem)]`, `max-h-[calc(100vh-2rem)]` con scroll interno.
  - Drawer: `w-drawer-mobile` (85vw) con `max-w-drawer-max` (24rem); `rounded-l-panel` (borde derecho) o `rounded-r-panel` (borde izquierdo).
- **Botón cerrar:** icono `×`, ≥44×44px, `aria-label` (prop `closeLabel`), hover `bg-surface-warm`.

**Comportamiento accesible (obligatorio):**
- `role="dialog"` + `aria-modal="true"` + `aria-label` (prop `ariaLabel`) + `aria-describedby` opcional (`describedBy`).
- **Focus trap** al abrir (`useFocusTrap`).
- **Escape** cierra y **devuelve el foco al disparador** (prop `triggerRef`).
- Bloqueo de scroll del `body` mientras está abierto.
- Animación: overlay fade + contenedor `scale(0.95 → 1)`, ~200–300ms; respeta `prefers-reduced-motion`.

**API (props):** `open`, `onClose`, `triggerRef`, `ariaLabel`, `closeLabel`, `children`, `variant?` (`"dialog"` | `"drawer"`, default `"dialog"`), `drawerEdge?` (`"left"` | `"right"`, default `"right"`), `describedBy?`, `id?`, `className?`.

**Usos:**
- **Modal (`dialog`):** Auth Gate, confirmaciones, feedback post-tour (bloqueante).
- **Drawer:** menú móvil (borde derecho), filtros del catálogo, manifiesto lateral.

---

## 9. Tono y Voz de la Marca

- **Tono:** cercano, experto, inspirador. Segunda persona (de tú a tú).
- **Sí:** "Descubre lugares que te cambian por dentro." · "Viaja consciente, vive experiencias auténticas."
- **No:** "Las mejores vacaciones de tu vida." · "Viajes baratos." · "Promociones imperdibles!!!"

---

## 10. Trust Badges (Footer)

Cada promesa con su icono lineal:
1. **Turismo Responsable** (hoja) — Cuidamos los lugares que visitas.
2. **Experiencias Únicas** (cámara) — Diseñamos viajes auténticos y memorables.
3. **Seguridad Garantizada** (escudo) — Tu tranquilidad es nuestra prioridad.
4. **Atención Personalizada** (personas) — Estamos contigo en cada paso.

---

## 11. Logotipo — Variantes y Assets

> **Wordmark oficial:** "Borondo Tours" (dos palabras, tipografía display propia del logo — NO Sora,
> NO reescribir a "BorondoTours"). **Isotipo:** ave con cresta (beige/marrón oscuro) y plumas de pecho
> iridiscentes en degradado verde → turquesa → azul → morado, ojos ámbar. Es "el rostro de la marca".

### Variantes de estructura

| Variante | Descripción | Uso canónico |
|---|---|---|
| **Horizontal** | Isotipo (ave) a la izquierda + wordmark "Borondo Tours" a la derecha | Navbars, cabeceras, firmas de email, uso principal |
| **Vertical** | Ave arriba + wordmark centrado debajo (slogan opcional bajo línea topográfica) | Portadas, redes sociales, formatos centrados |
| **Isotipo (ave)** | Solo el ave a color | Favicon, avatar, icono de app, espacios reducidos |
| **Monograma (BT)** | Letras B y T entrelazadas | Sello formal minimalista cuando el isotipo no cabe |

### Versiones monocromáticas / contraste

| Versión | Cómo | Cuándo |
|---|---|---|
| Principal sobre fondo claro | Logo a color completo | Fondos claros (blanco-niebla, arena) |
| Clara sobre fondo oscuro | Wordmark/ave en `blanco-niebla` `#F9FBFC` | Fondos oscuros o fotografía (con overlay oscuro) |
| Monocromática 1 tinta | Todo en `negro-volcanico` `#101010` | Impresión a una tinta, documentos sin color |
| Dorada | Isotipo/monograma en `dorado` `#FDB813` sobre `azul-profundo` | Tarjetas premium, dorso de tarjeta de presentación |

### Mapa de archivos (`otros/design/marca/`)

| Archivo | Qué es | Formato / tamaño | Uso recomendado |
|---|---|---|---|
| `logo.png` | Logo **horizontal a color** (ave + "Borondo Tours"), fondo transparente | PNG raster | Uso general horizontal sobre fondo claro |
| `borondo tours logo v1.svg` | Logo **horizontal vectorial** (ave + wordmark) | SVG (escalable) | **Preferir para web/print** — escala sin pérdida |
| `borondo tours logo nombre v1.svg` | Variante vectorial logo + nombre | SVG | Alternativa vectorial del horizontal |
| `borondo tours nombre v1.svg` | **Wordmark solo** "Borondo Tours" (vectorial) | SVG | Cuando el ave va aparte o no cabe |
| `borondo tours nombre v1.png` | Wordmark solo (raster, fondo claro/transparente) | PNG | Wordmark sobre fondo claro |
| `logo ave 1000x1000.png` | **Isotipo (ave) a color** alta resolución | PNG 1000×1000 | Icono app, OG image, impresión |
| `logo ave 500x500.png` | Isotipo (ave) a color | PNG 500×500 | Avatar, favicon grande, redes |
| `borondo tours brand v1.png` | **Tablero de marca** (logo + slogan sobre oscuro, versión hero) | PNG | Referencia visual / presentación |
| `borondo tours brand 2 v1.png` | **Manual de marca completo** (paleta, tipo, variantes de logo, web, merch) | PNG | Referencia visual del sistema completo |
| `Borondo tours completo v1.png` | Guía visual (área de respeto, tamaños mínimos, don'ts, tono, jerarquía) | PNG | Referencia de reglas de uso del logo |
| `Brand_Guidelines_Borondo_Tours_Completo-v2.md` | **Manual de marca en texto** (fuente de verdad escrita) | Markdown | Documento canónico de marca |

> **Regla de implementación:** en web/app usa los **SVG** (`borondo tours logo v1.svg`, `borondo tours nombre v1.svg`)
> por escalabilidad; usa `logo ave 1000x1000.png` para favicon/OG/PWA icon. Los `*brand*.png` y
> `Borondo tours completo v1.png` son tableros de referencia, NO assets para incrustar en la UI.

### Reglas de uso del logo (del manual)

- **Área de respeto:** margen mínimo = altura de la "x" de "Tours" (1x) libre alrededor. Nada invade ese espacio.
- **Tamaño mínimo:** digital 160px de ancho (favicon 32px); impresión 25mm (bordado/grabado 20mm).
- **Sobre fotografía:** siempre overlay oscuro para contraste; nunca sobre fondo complejo sin él.
- **Prohibido (don'ts):** distorsionar proporciones, cambiar colores, aplicar sombras/brillos/biseles,
  modificar la tipografía del logo, rotarlo/inclinarlo, encerrarlo en cajas ajustadas, bajar del
  tamaño mínimo, o separar el ave del wordmark.

---

## Accesibilidad (WCAG 2.1 AA)
- Contraste texto ≥ 4.5:1. Verificar `blanco-niebla` sobre `azul-profundo` y texto sobre glass (usar overlay).
- Inputs con label. Focus ring visible. Targets táctiles ≥ 44×44px.
- Modales glass: focus trap + Escape.

---

## Fuentes

### Documentación
- Manual de marca completo: `otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md`
- Steering de marca: `.kiro/steering/12-brand-identity.md`

### Tableros visuales
- Tablero de marca (paleta + glass): `otros/design/b2c/web/1-1-Marca.png`

### Assets de logo (carpeta `otros/design/marca/`)
> Ver el mapa completo de variantes y reglas de uso en la sección **11. Logotipo — Variantes y Assets**.

| Archivo | Contenido |
|---|---|
| `borondo tours logo v1.svg` | Logo completo (isotipo + wordmark) — **vectorial, uso web** |
| `borondo tours logo nombre v1.svg` | Logo con nombre (variante) — vectorial |
| `borondo tours nombre v1.svg` | Wordmark "Borondo Tours" solo — vectorial |
| `borondo tours nombre v1.png` | Wordmark "Borondo Tours" solo — raster |
| `logo ave 1000x1000.png` | Isotipo (ave) 1000×1000 — **favicon / OG / avatar** |
| `logo ave 500x500.png` | Isotipo (ave) 500×500 — usos reducidos |
| `logo.png` | Logo (raster genérico) |
| `borondo tours brand v1.png` | Tablero de marca (composición) |
| `borondo tours brand 2 v1.png` | Tablero de marca (variante) |
| `Borondo tours completo v1.png` | Presentación completa de marca |
