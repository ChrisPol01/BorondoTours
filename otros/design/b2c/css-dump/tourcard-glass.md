# Volcado del vidrio de la TourCard y superficies — por tema

> **Estado del Antigravity Bridge (2026-10-06):** el puente **no está conectado**
> (`figma_list_targets` → `targets: []`; `figma_execute_code` → `BRIDGE_OFFLINE`).
> Por eso la lectura nativa en vivo de los nodos Figma del TourCard queda **PENDIENTE**.
> Los valores de abajo combinan:
> 1. los **valores oficiales del vidrio Figma por tema** confirmados en el encargo (ver §0), ya
>    implementados como tokens `--glass-figma-*` en `packages/ui/src/styles/tokens.css`; y
> 2. la receta de "liquid glass" documentada en `.kiro/steering/12-brand-identity.md` y
>    `otros/design/b2c/design.md` §5.
>
> **Cuando el bridge esté CONNECTED**, re-extraer (un nodo por llamada, `maxDepth` ≤ 3,
> `capture: false`, sin `getCSSAsync`):
> - **TourCard Default** `9:27` — efecto `DROP_SHADOW`, `cornerRadius` 20.
> - **TourCard Hover** `166:104682` — con capas hijas "Cristal" `166:104685` y "body" `166:104686`
>   (leer `fills`+`opacity`, `strokes`/`strokeWeight`/`strokeAlign`, `effects` GLASS/DROP_SHADOW,
>   `cornerRadius`, `size`, `position`, `boundVariables` resueltas a token).
> Luego reemplazar las tablas §1–§3 con los valores nativos. Como los `--bt-glass-*` referencian
> tokens semánticos, ajustar el valor en `tokens.css` basta para alinear sin tocar componentes.

## 0. Valores oficiales del vidrio Figma (confirmados en el encargo)

Capa de vidrio del TourCard (`body-{tema}` del set `166:104691`):

| Tema | Fill (relleno) | Texto |
|---|---|---|
| Colorido | `#5C23AA` al 50 % (morado vidrio) | `#F9FBFC` |
| Claro | `#FFFFFF` al 25 % | `#0A1A2B` |
| Oscuro | `#000000` al 51 % | `#F9FBFC` |

Efecto `GLASS` (parámetros Figma, iguales en los 3 temas):

| Parámetro | Valor |
|---|---|
| frost (radio de desenfoque) | 7 |
| refraction | 1 |
| depth | 93 |
| lightAngle | 315 |
| intensity | 0.8 |
| dispersion | 0.46 |

Estos valores están implementados como tokens `--glass-figma-*` en `tokens.css`:

| Token | Colorido (`:root`) | Claro (`[data-theme="claro"]` / sistema claro) | Oscuro (`[data-theme="oscuro"]` / sistema) |
|---|---|---|---|
| `--glass-figma-fill` | `color-mix(in srgb, #5c23aa 50%, transparent)` | `color-mix(in srgb, #ffffff 25%, transparent)` | `color-mix(in srgb, #000000 51%, transparent)` |
| `--glass-figma-fill-strong` | `color-mix(in srgb, #5c23aa 75%, transparent)` | `color-mix(in srgb, #ffffff 50%, transparent)` | `color-mix(in srgb, #000000 76%, transparent)` |
| `--glass-figma-text` | `#f9fbfc` | `#0a1a2b` | `#f9fbfc` |
| `--glass-figma-blur` | `7px` | `7px` | `7px` |

> `--brand-morado-vidrio: #5c23aa` es la primitiva del fill Colorido.
> El puente de Figma debe confirmar el `DROP_SHADOW` exacto (offset/blur/spread/color) de la
> variante Default y las diferencias de la variante Hover.

## 1. Vidrio estándar (`body-{tema}` del TourCard Default)

Los tokens `--bt-glass-*` (en `apps/web/src/styles/fig-runtime.css`) **no llevan hex suelto**:
referencian los tokens `--glass-figma-*`/semánticos que cambian por tema vía `data-theme`.

| Token `--bt-glass-*` | Referencia | Rol |
|---|---|---|
| `--bt-glass-fill` | `--glass-figma-fill` | Relleno translúcido de la superficie |
| `--bt-glass-fill-strong` | `--glass-figma-fill-strong` | Relleno de modales/menús (más opaco) |
| `--bt-glass-stroke` | `--glass-rim` + `--semantic-glass-border` | Borde de luz degradado 135° |
| `--bt-glass-shadow` | `--glass-highlight` + `--glass-depth` | Brillo interior superior + sombra difusa |
| `--bt-glass-blur` | `--glass-figma-blur` (`7px`) | Desenfoque de fondo (`backdrop-filter`) |
| `--bt-glass-text` | `--glass-figma-text` | Color de texto sobre el vidrio |

## 2. TourCard — forma (Default, nodo `9:27`)

| Elemento | Valor |
|---|---|
| Radio de la tarjeta | `20px` (confirmado en el encargo; `--radius-card` ≈ 1.25rem) |
| Sombra | `DROP_SHADOW` (valores exactos **pendientes** de lectura por el bridge) |
| Imagen | relación **16:9**, `object-fit: cover`, radio superior heredado del `overflow: hidden` |
| Relleno de tarjeta | vidrio del tema (`--bt-glass-fill` → `--glass-figma-fill`) |
| Borde | `--bt-glass-stroke` (1 px degradado) |
| Texto | `--bt-glass-text` → `--glass-figma-text` |
| Badge categoría | fondo `--semantic-action-primary`, texto `--semantic-text-on-action`, pill |
| Badge descuento | fondo `--semantic-action-cta`, texto `--semantic-text-on-action`, pill, `-N%` |
| Precio | `strong` Sora 18px + `s` tachado 12px (solo si hay `priceBefore`) |
| Disponibilidad | punto `--semantic-available` (ok) / `--semantic-limited` (low) + texto; Agotado con icono |

## 3. TourCard — Hover (nodo `166:104682`; Cristal `166:104685`, body `166:104686`)

| Propiedad | Default (`9:27`) | Hover (`166:104682`) |
|---|---|---|
| Elevación | `translateY(0)` | `translateY(-4px)` |
| Sombra | `--bt-glass-shadow` (DROP_SHADOW Default) | `--bt-glass-shadow` + `--elevation-floating` |
| Transición | — | `transform`/`box-shadow` `--motion-duration-standard` |
| Capa "Cristal" | fill `--glass-figma-fill`, blur 7 | **pendiente** confirmar fill/opacity/effects del Hover |
| Capa "body" | texto `--glass-figma-text` | **pendiente** confirmar fills+opacity del Hover |

> Con `prefers-reduced-motion: reduce` no hay `transform` ni `transition` en hover/foco
> (`fig-runtime.css`, bloque `@media (prefers-reduced-motion)`).
> Con `:focus-visible` se aplica el aspecto Hover **más** un anillo de 2 px `--semantic-focus`.
> Implementado en `.fig-stage .bt-tourcard:focus-visible` / `.bt-card:focus-visible`.

## 4. Pestañas laterales derechas (export del Home) — colores confirmados

| Pestaña | Clase | Token | Color (Colorido/Oscuro) |
|---|---|---|---|
| Promociones | `a.p0_13` | `--semantic-action-cta` | Dorado `#fdb813` |
| Más vendidos | `a.p0_17` | `--semantic-status-danger` | Coral `#f97066` (Claro → `#b42318`) |
| Ver todos | `a.p0_18` | `--semantic-focus` | Turquesa `#00b7c7` (Claro → `#007aff`) |

Texto e icono: `--semantic-text-on-action` (Negro Volcánico). Las tres pestañas abren su panel
(`#bt-promos`, `#bt-best`, `#bt-todos`) con vitrina 2×2 paginada de 4, contador `aria-live`,
focus trap y Escape que devuelve el foco a la pestaña.

## 5. Rail de redes — tokens de marca de terceros

| Red | Token | Valor |
|---|---|---|
| Instagram | `--bt-social-instagram-gradient` | `#feda75 → #fa7e1e → #d62976 → #962fbf → #4f5bd5` |
| Facebook | `--bt-social-facebook` | `#1877f2` |
| TikTok | `--bt-social-tiktok` | `#000000` + cian `#25f4ee` + rojo `#fe2c55` |

Rail dentro de una cápsula `.bt-glass-std`, tres botones (Instagram, Facebook, TikTok; sin X),
cada uno con SVG inline a color, `aria-label` por red, área ≥ 44×44 px y enlaces a
`instagram.com/borondotours`, `facebook.com/borondotours`, `tiktok.com/@borondotours`.
