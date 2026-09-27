# Brief de diseño para Stitch — BorondoTours

> **Qué es esto:** un brief de sistema de diseño + marca para pegar en **Google Stitch**
> (u otro generador de UI por texto). Stitch NO analiza tus PNGs: **genera** pantallas desde
> una descripción. Este brief le da la identidad de Borondo para que todo lo que dibuje salga
> con la marca correcta.
>
> **Cómo usarlo:**
> 1. Copia el bloque **"PROMPT PARA PEGAR EN STITCH"** (más abajo) al inicio de tu conversación con Stitch.
> 2. Debajo, agrega la pantalla concreta que quieres (ej. "Genera la pantalla de checkout de 3 pasos…").
> 3. Si Stitch se queda corto de contexto, usa la versión **CORTA** (sección final).
>
> Fuentes: `otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md` (manual de marca oficial)
> y `otros/design/b2c/design.md` (resumen del design system con tokens y valores Glass exactos).

---

## PROMPT PARA PEGAR EN STITCH (versión completa)

```
You are designing screens for BorondoTours — a B2C marketplace of nature tours in Colombia.
The vibe: premium but warm, editorial, inspired by the Colombian páramo (highlands). Immersive
landscape photography with translucent "glassmorphism" panels floating on top. Elegant, trustworthy,
natural. NOT corporate-cold, NOT loud/discount-y.

UI copy language: SPANISH (Colombia). Interface instructions below are in English but every visible
label, button, placeholder and heading you output must be in Spanish.

=== BRAND COLORS (use these exact hex values) ===
- Azul Profundo (deep blue)      #103B66  → dark backgrounds, strong surfaces, footer
- Azul Cóndor (condor blue)      #2364AA  → muted/secondary text, sober accents
- Turquesa Laguna (turquoise)    #00B7C7  → PRIMARY buttons (default), badges, links
- Verde Frailejón (green)        #79C142  → primary button HOVER, "available" state, success
- Arena (sand)                   #F3E8D1  → warm section backgrounds
- Dorado (gold)                  #FDB813  → CTA buttons, ratings/stars, "planifica tu viaje"
- Blanco Niebla (fog white)      #F9FBFC  → page background, text on dark
- Negro Volcánico (volcanic black) #101010 → primary body text, image overlays

Approved gradients ONLY (do not invent others):
- Nature:   #00B7C7 → #79C142   (turquoise → green)
- Depth:    #103B66 → #00B7C7   (deep blue → turquoise)
Image overlays: solid black at low opacity (e.g. #101010 at 40%). Never a random gradient.

=== TYPOGRAPHY ===
- Headings (H1–H4): "Sora"  → H1 ExtraBold 56px, H2 Bold 40px, H3 SemiBold 28px, H4 SemiBold 20px
- Body / buttons / labels: "Inter" → Body 16px, Body-small 14px, Button 16px SemiBold, Label 12px
- Line-heights generous (150–160% for body). Sentence case for headings (NOT all caps except tiny labels).
- Never use a decorative or serif font. Only Sora + Inter.

=== VISUAL STYLE ===
- Immersive full-bleed landscape photos (páramos, lagoons, palm valleys, colonial towns) as the
  main surface. People shown respectfully interacting with nature (often from behind / profile).
- Glassmorphism: translucent panels with backdrop blur for search bars, cards and modals over photos.
- Rounded corners: inputs/buttons ~12px, cards ~20px, panels ~32px, chips/pills fully rounded.
- Soft, subtle shadows for elevation — never harsh drop shadows, bevels or glows.
- Subtle topographic contour lines as a background pattern, low opacity, over deep-blue areas.
- Icons: simple 2px line style, rounded corners, minimalist (like Lucide). Mountain, MapPin, Camera,
  Leaf, Users, Calendar, Search, Heart, Star, Shield, Ticket.
- Generous white space. Let the photography breathe.

=== KEY COMPONENTS ===
- Navbar: transparent/glass over hero. Links (in Spanish): "Destinos", "Experiencias", "Nosotros",
  "Blog", "Contacto". Right-side CTA button in GOLD (#FDB813): "Planifica tu viaje".
- Primary button: solid Turquoise (#00B7C7), white text; hover → Green (#79C142).
- CTA button: solid Gold (#FDB813), black text (#101010).
- Secondary button: transparent with a thin deep-blue outline, dark text.
- Tour card: 3:4 photo, dark bottom gradient overlay, tour name, "duración • tipo", "Desde $X COP"
  price, gold star rating, heart (favorite) icon top-right.
- Glass search widget: fields "¿A dónde quieres ir?" (Destino), "Fecha de viaje" (Fechas),
  "2 viajeros" (Viajeros), and a GOLD button "Buscar aventura".
- Trust badges (footer / value props), 4 items with line icons: "Turismo Responsable" (Leaf),
  "Experiencias Únicas" (Camera), "Seguridad Garantizada" (Shield), "Atención Personalizada" (Users).

=== TONE OF VOICE (for any copy you write) ===
Close, expert, inspiring. Second person ("tú"). Clear, positive, emotional — no hype, no clichés.
- SÍ: "Descubre lugares que te cambian por dentro." / "Viaja consciente, vive experiencias auténticas."
- NO: "Las mejores vacaciones de tu vida." / "Promociones imperdibles!!!" / "Viajes baratos".

=== ACCESSIBILITY ===
Text on photos must keep ≥4.5:1 contrast (add the dark overlay). Buttons ≥44px tall. Every input has
a visible label. Don't signal state with color alone — always pair with text or icon.

Slogan (use sparingly, e.g. hero or footer): "Explora donde nace la naturaleza".
```

---

## Cómo pedir cada pantalla (plantilla)

Después del prompt de arriba, pide la pantalla concreta. Ejemplos:

- **Home:** "Genera la landing (desktop y mobile): hero full-bleed con foto de paisaje, overlay
  oscuro, badge 'EXPLORA COLOMBIA' en turquesa, H1 'Viajes que transforman tu manera de ver el
  mundo.', buscador glass superpuesto, luego grid de 4 destinos destacados (tour cards), sección de
  4 trust badges sobre fondo arena, y footer azul profundo."
- **Checkout:** "Genera un checkout de 4 pasos (Datos del viaje → Pasajeros → Pago → Confirmación)
  con un stepper superior. Paso de pago con métodos (tarjeta, PSE, Nequi), aplicar Borondo Coins, y
  botón dorado 'Confirmar y pagar'. Pantalla de confirmación con hero y 3 tarjetas (resumen,
  próximos pasos, documentos)."
- **Detalle de tour:** "Genera la página de detalle de un tour: galería de fotos, título, precio
  'Desde $X COP', rating, descripción, calendario de disponibilidad tipo semáforo, y panel de
  reserva glass fijo a la derecha con botón turquesa."

Regla: describe **estructura y contenido**, deja que Stitch aplique la marca del brief.

---

## CONTEXTO DE PRODUCTO — pantallas del Portal B2C

BorondoTours es un marketplace B2C de tours en Colombia. El portal público (viajero) tiene estas
pantallas. Dale este contexto a Stitch para que entienda el sistema completo y genere cada pantalla
coherente con las demás (misma navbar, mismo footer, mismos patrones de tarjeta y glass).

**Zona pública (sin login):**
| # | Pantalla | Ruta | Propósito |
|---|---|---|---|
| 1 | Home / Landing | `/` | Hero inmersivo + buscador glass + destinos destacados + trust badges |
| 2 | Catálogo | `/discovery` | Grid de tours + búsqueda + filtros laterales + toggle mapa |
| 3 | Detalle de tour | `/tours/[slug]` | Galería, precio, rating, calendario de disponibilidad semáforo, panel de reserva glass |
| 12 | Destinos | `/destinations` | Mosaico de regiones de Colombia con conteo de tours |
| 13 | Experiencias | `/experiences` | Categorías temáticas de experiencias |
| 14 | Blog | `/blog` | Listado de artículos de viaje |
| 15 | Nosotros y Contacto | `/about`, `/contact` | Historia de marca + formulario de contacto |

**Zona privada (viajero autenticado) — layout con sidebar de cuenta:**
| # | Pantalla | Ruta | Propósito |
|---|---|---|---|
| 4 | Checkout | `/checkout` | Wizard 4 pasos: Datos → Pasajeros → Pago → Confirmación |
| 5 | Panel de usuario | `/mi-cuenta` | Dashboard del viajero (resumen, accesos rápidos) |
| 6 | Mis Tours / Reservas | `/mis-reservas` | Kanban/lista de reservas (próximas, completadas) |
| 7 | Detalle de reserva | `/mis-reservas/[reference]` | Voucher, estado, documentos de una reserva |
| 8 | Perfil | `/perfil` | Datos personales del viajero |
| 9 | Borondo Coins | `/coins` | Wallet: saldo, nivel de lealtad, historial |
| 10 | Favoritos | `/favoritos` | Tours guardados |
| 11 | Mensajes | `/mensajes` | Chat con guía / soporte |

**Prioridad para HOY (empezar por estas):** Home (1), Catálogo (2), Detalle de tour (3), Checkout (4).
Son el corazón del flujo de compra (descubrir → ver → reservar → pagar).

**Dos layouts distintos:**
- **Público:** navbar glass sobre hero + footer azul profundo. Foto protagonista, mucho glassmorphism.
- **Privado (cuenta):** sidebar izquierdo azul profundo con navegación de cuenta + contenido claro a la
  derecha. Aquí el glassmorphism se usa menos (claridad operativa); las tarjetas son blancas sobre
  fondo Blanco Niebla.

Cuando pidas una pantalla privada, indícale a Stitch: "usa el layout de cuenta con sidebar izquierdo
azul profundo (links: Mi Panel, Mis Tours, Mis Reservas, Favoritos, Mensajes, Borondo Coins,
Configuración)".

---

## FIDELIDAD MÁXIMA — cómo exprimir a Stitch

Stitch **genera**, no clona un PNG. Para acercarlo lo más posible a la identidad Borondo:
- Pega SIEMPRE el prompt de marca completo antes de pedir cada pantalla.
- Repite los HEX exactos en cada pedido si Stitch empieza a desviarse de color.
- Especifica el viewport ("desktop 1440px" o "mobile 375px") — no lo dejes a criterio.
- Si una corrida se desvía, pide "regenera manteniendo EXACTAMENTE la paleta y tipografía del brief".
- Itera pantalla por pantalla, no todas de golpe: Stitch mantiene mejor la coherencia en sesiones cortas.
- Descarga el diseño que más se acerque y trátalo como **punto de partida**, no como resultado final.

> ⚠️ Aun con todo esto, Stitch **no** producirá una copia pixel-idéntica de tus mockups PNG (ver
> "Notas y límites"). Para pixel-perfect real de tus mockups existentes, usa el flujo `.design.md` → Kiro.

---

## PROMPT CORTO (si Stitch se queda sin contexto)

```
Design for BorondoTours, a premium B2C nature-tour marketplace in Colombia. Warm, editorial,
páramo-inspired: full-bleed landscape photos with translucent glassmorphism panels. All UI copy in
Spanish (Colombia).
Colors: deep blue #103B66, condor blue #2364AA, turquoise #00B7C7 (primary buttons), green #79C142
(hover/success), sand #F3E8D1 (warm bg), gold #FDB813 (CTA + ratings), fog white #F9FBFC (bg/text on
dark), volcanic black #101010 (text/overlay). Gradients only turquoise→green or deep-blue→turquoise.
Fonts: Sora for headings (H1 ExtraBold 56px … H4 20px), Inter for body/buttons (16px). Sentence case.
Style: rounded corners (buttons 12px, cards 20px), soft shadows, 2px line icons (Lucide-like),
generous whitespace, subtle topographic-line pattern. Buttons ≥44px, text on photos ≥4.5:1 contrast.
Primary btn = turquoise (white text, hover green). CTA btn = gold (black text). Secondary = outline.
Tone: close, second-person "tú", inspiring, no hype. Slogan: "Explora donde nace la naturaleza".
```

---

## Notas y límites (honestas)

- **Stitch genera, no clona.** Aunque le des este brief, su salida NO será pixel-idéntica a tus
  mockups PNG existentes: es un generador, cada corrida varía. Sirve para explorar/prototipar con la
  identidad correcta, no para reproducir una pantalla exacta que ya diseñaste.
- **El código que exporta Stitch** (suele ser HTML/CSS o React con Tailwind y colores hardcodeados)
  NO usa tus tokens del design system (`bg-turquesa`, `text-h1`, etc.). Si luego lo traes al proyecto
  Astro, habrá que traducir esos hex/estilos a los tokens de Borondo. Para eso sigue siendo mejor el
  flujo `.design.md` → Kiro que ya montamos.
- **Fuente única de verdad:** este brief es un resumen del manual oficial
  (`otros/design/marca/Brand_Guidelines_Borondo_Tours_Completo-v2.md`) y del design system
  (`otros/design/b2c/design.md`, que incluye los valores exactos de glassmorphism). Si la marca
  cambia, actualiza el manual y regenera este brief.
```
