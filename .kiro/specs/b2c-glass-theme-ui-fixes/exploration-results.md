# Resultados de la exploración (tarea 1) — código sin arreglar

- Prueba: `apps/web/e2e/glass-theme-ui.bug.spec.ts` (Playwright, Chromium, 1440×900; el caso g también mide 1280×720 y 1440×720).
- Temas: Colorido (sin `borondo.theme`), Claro y Oscuro, vía `localStorage`.
- Servidor: dev de Astro en `http://localhost:4321`, reutilizado por `playwright.config.ts` (`reuseExistingServer`).
- Comando: `pnpm --filter @borondo/web exec playwright test e2e/glass-theme-ui.bug.spec.ts`.
- Resultado: **33 de 33 fallan** (11 casos × 3 temas). Es lo esperado: el bug existe.
- Mediciones crudas por caso y tema: `apps/web/playwright-report/glass-bug-report/*.json` (ignorado por git).

## Resumen por hipótesis

| Hip. | Caso | Veredicto | Contraejemplo |
|---|---|---|---|
| 1 | a, b | **Confirmada** | El panel `p3_90` de la primera TourCard de /explorar lleva `.bt-drop` y `backdrop-filter: none`. El borde pasa a `--bt-drop-rim`: 45 % en Colorido, 90 % en Claro, 22 % en Oscuro. |
| 1 | e (chips) | **Refutada en parte** | Los chips no tienen `.bt-drop` (`drop: false`). Su aspecto viene de `.bt-chip`, no de `initGlass`. |
| 2 | c | **Reformulada** | No hay capa sólida de ancho completo bajo `.bt-nav-row`: `solidLayers = []` en los 3 temas. El fondo sólido está en el **contenedor de cada cápsula** del Home (ver detalle). |
| 3 | d | **Refutada en parte** | `overflow` de `.bt-nav-links` es `visible/visible` y la píldora vuelve a "Explorar" al salir. Sí queda un borde residual `1px solid` en `a[href="/explorar"] > div:empty` bajo la píldora: ese es el corte visible. |
| 4 | e | **Confirmada, con matiz** | El recorte lo hace el contenedor, no el chip: la fila tiene `overflow-y: hidden` y 32 px de alto, y el chip mide 34 px (32 + borde de 1 px). Dentro del chip, `scrollHeight = clientHeight = 32`. Alto < 44 px en los 8 chips. |
| 5 | f | **Confirmada** | Sin `data-bt-seam`. `p0_50` y su `::before` no tienen `mask-image` ni degradado; el hero `p0_1` tiene imagen sin máscara. |
| 6 | g | **Reformulada** | No hay solape en 1440×900 ni en 1280×720, en reposo ni con hover. Sí lo hay en **1440×720**: rail `[1382,343,1442,499]` ∩ "Ver todos" `[1365,336,1490,382]`. |
| 7 | h (pestañas) | **Confirmada** | Las 3 pestañas tienen `.bt-drop`, rotación −90° y fondo transparente. `writing-mode` es `horizontal-tb`: el texto vertical sale de la rotación, no del modo de escritura. El texto ya usa `--semantic-text-on-action` (`rgb(16,16,16)`). |
| 7 | h (rail) | **Confirmada, con matiz** | No es `.bt-glass-std`. Los iconos son trazos monocromos `currentColor` (sin degradado, sin #1877F2, sin #25F4EE/#FE2C55). Cada botón mide 40×40 (< 44). **Refutado:** no hay X; `SOCIAL` ya tiene Instagram, Facebook y TikTok con sus `href` correctos. |
| 8 | i | **Confirmada** | `#bt-promos` usa `.bt-carousel`. Muestra 2 de 4 tarjetas en 1 fila. |
| 9 | j | **Confirmada y ampliada** | 27 tarjetas incorrectas por tema (detalle abajo). |
| 10 | k | **Confirmada en parte** | No hay `aria-busy` ni `.bt-card--loading`. Con movimiento reducido sigue la transición de 0.1 s. Ningún tour demo tiene `.bt-card--soldout`. **Refutado:** el foco ya cumple (2 px sólido `--semantic-focus`) y no hay elevación con movimiento reducido (`transform: none`). |

## Detalle de las reformulaciones

### Hip. 2 — la capa sólida está en cada cápsula del Home

Relleno computado del contenedor de cada cápsula (`p0_157`, `p0_163` y `p0_170`):

| Tema | Home | /explorar |
|---|---|---|
| Colorido | `rgb(18,48,79)` (surface card) | ≈ blanco 0,36 % |
| Claro | `rgb(255,255,255)` | ≈ blanco 0,36 % |
| Oscuro | `rgb(22,22,24)` | ≈ blanco 0,36 % |

La capa de vidrio `.bt-nav-glass` es igual en ambas vistas.

**Arreglo:** neutralizar el relleno del contenedor de la cápsula del Home, en `postprocess.mjs` o en `setupNav`. No hay que buscar una franja de ancho completo.

### Hip. 6 — el solape depende del alto del viewport

- El rail está anclado abajo (`bottom: 221px`, escalado) y las pestañas arriba.
- Hay solape cuando el alto H es menor que unos **759·s px** (s = escala del lienzo).
- Ejemplos: 1440×720 se solapa; 1440×900 y 1280×720 no.
- La regla del carril (tokens `--bt-lane-*`) debe garantizar que no haya intersección para todo H de escritorio.

### Hip. 3 — no hay recorte por overflow

El defecto es solo el borde del `div:empty` del enlace activo. Para el Paso 3 basta con quitar `border` y `outline` de ese `div`; `overflow: visible` ya se cumple.

### Hip. 9 — tarjetas que no llevan a `/tour?tour={slug}`

Por tema hay 27 tarjetas incorrectas:

| Vista | Tarjetas | Problema |
|---|---|---|
| /tour (relacionados) | 4 | `div` sin enlace |
| /blog | 6 | `div` sin enlace (tarjetas de artículo) |
| /blog/articulo | 3 | `div` sin enlace (tours relacionados) |
| /estados/home-promociones | 4 | `div` sin enlace |
| /estados/explorar-sugerencias | 5 | `div` sin enlace |
| Vitrina Promociones | 4 | `/explorar?region=…&destacado=…` |
| Chip del hero del Home | 1 | `/explorar?region=magdalena&destacado=ciudad-perdida` |

Las tarjetas de /blog son de artículos, no de tours: hay que decidir si entran en la Property 7 o enlazan al artículo.

Home, /favoritos, /explorar/mapa y /estados/favoritos-vacio no tienen tarjetas de tour. Las 6 de /explorar están bien.

## Hallazgos que afectan al design

- **Tokens de las pestañas en Claro.** En Claro, `--semantic-status-danger` resuelve a `rgb(180,35,24)` (#B42318) y `--semantic-focus` a `rgb(0,122,255)` (#007AFF), no al coral #F97066 ni al turquesa #00B7C7 de Req. 2.10. Colorido y Oscuro sí coinciden. Hay que decidir si las pestañas siguen al token del tema (lo que mide la prueba) o usan un color de marca fijo.
- **Token `--bt-social-facebook`.** Todavía no existe: resuelve al color heredado (`rgb(249,251,252)`). Se crea en la tarea 3.4 / 4.6.
- **Tema Sistema.** No se cubrió en esta exploración; la tarea pedía los 3 temas.

