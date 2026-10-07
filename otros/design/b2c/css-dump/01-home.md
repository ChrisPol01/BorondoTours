# CSS dump exacto — Home (Figma `113:17071`, desktop 1440)

> Extraído de Figma con el módulo `cssprops` del bridge (lectura de propiedades nativas,
> no `getCSSAsync` que se cuelga). Valores 1:1 con el diseño. Fuente de verdad para construir.
> Colores con `boundVar` mapean a tokens: `#00B7C7`→action-primary/turquesa, `#79C142`→verde,
> `#FDB813`→dorado/action-cta, `#F9FBFC`→blanco-niebla/on-strong, `#101010`→negro/on-action,
> `#12304F`→surface-card, `#103B66`→azul-profundo.

## Frame raíz
- `Home / Desktop — v2` 1440×3194, bg `#0A1A2B` + linear-gradient(#103B66 0% → #07121F 100%).

## Sección Hero (`113:17072`) — 1440×900, bg imagen (destino-ciudad-perdida-hd.jpg), posición absoluta
Capas (en orden):
1. Capa oscura/linterna (radial en código): `radial-gradient(rgba(15,59,102,0) 0%, rgba(15,59,102,0.05) 35%, rgba(10,26,46,0.82) 100%)` → clase `.media-veil-hero`.
2. Degradado inferior: x0 y480, 1440×420, `linear-gradient(rgba(10,26,46,0) 0%, rgba(10,26,46,0.85) 100%)`.
3. Patrón topográfico: 1440×900 → clase `.topo-pattern` (decorativo).

Bloques posicionados (x,y desde el frame 1440×900):
- **Titular** x80 y250 (780×313): flex-col, gap 18, align-start.
  - Badge "EXPLORA DONDE NACE LA NATURALEZA": padding 3/12/4/12, radius 999, bg+border `#00B7C7` (action-primary). Texto Inter Semi Bold 12px, color `#101010` (on-action), letter-spacing 1.44px (12%).
  - H1 "Viajes que transforman tu manera de ver el mundo." — Sora ExtraBold 60px, line-height 108%, width 780, color `#F9FBFC` (on-strong).
  - Subtítulo "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza." — Inter Regular 18px, line-height 160%, width 520, color `#F9FBFC`.
- **Buscador** x80 y730 (900×75): flex-row, padding 8, radius 999, bg `rgba(249,251,252,0.14)`, border 1px `rgba(249,251,252,0.4)`, BACKGROUND_BLUR 18, DROP_SHADOW 0/16/40 rgba(0,0,0,0.25). → `.on-media .glass-surface` pill.
  - 3 campos idénticos (226 ancho, FILL, padding 10/20, gap 10, align-center):
    - Destino: icon map-pin 20 + col[ label "Destino" Inter Semi Bold 12px / valor "¿A dónde quieres ir?" Inter Regular 14px lh 160% ], color `#F9FBFC`.
    - Fechas: icon calendar 20 + col[ "Fechas" / "Fecha de viaje" ].
    - Viajeros: icon users 20 + col[ "Viajeros" / "2 viajeros" ].
  - Separadores: rectángulo 1×36, `rgba(249,251,252,0.3)` (entre campos, x2).
  - Botón CTA "Buscar aventura" 201×48: bg `#FDB813` (dorado), radius 999, padding 15/28, gap 8, icon search 18 + texto Inter Semi Bold 15px `#101010`.
- **Hint agente** x104 y818 (531×16): flex-row gap 8, icon sparkles 16 `#FDB813` + texto Inter Regular 13px `#F9FBFC`: `Pronto podrás pedirlo en tus palabras: "un plan de naturaleza para 4 en diciembre"`.
- **Pin Ciudad Perdida** x870 y250 (197×47): flex-row gap 10, padding 8/14/8/8, radius 999, bg `rgba(249,251,252,0.16)`, border 1px `rgba(249,251,252,0.45)`, BACKGROUND_BLUR 12.
  - Círculo 28×28 radius 999 bg `#FDB813`, icon map-pin 16 `#101010`.
  - col[ "Ciudad Perdida" Inter Semi Bold 13px / "4 días · desde $1.450.000" Inter Regular 11px ], `#F9FBFC`.
- **Pin Río Buritaca** x1060 y430 (197×47): idéntico. Textos "Río Buritaca" / "Pasadía · desde $180.000".
- **Destino en portada** x1080 y760 (185×68): flex-col gap 10.
  - "Ciudad Perdida" Sora Bold 22px `#F9FBFC`.
  - "Sierra Nevada de Santa Marta" Inter Regular 13px `#F9FBFC`.
  - Dots (flex-row gap 6): activo 48×4 radius 4 `#12304F` + 3× 24×4 radius 4 `rgba(249,251,252,0.35)`.

## Navbar sin sesión (`113:17100`) — 1360×69, 3 cápsulas, SPACE_BETWEEN
Cada cápsula: bg `#12304F`, border 1px `rgba(255,255,255,0.4)`, radius 999.
- Cápsula Logo 167×69: padding 8/18, gap 4 (logo).
- Cápsula Navegación 342×56: padding 8/10, gap 4 (Explorar, Blog, Nosotros — pendiente confirmar labels exactos).
- Cápsula Acciones 293×56: padding 8/10, gap 6 (idioma, tema, Iniciar sesión).

## Sección "Explora por experiencia" (`113:17189`) — 1440×1060, `.topo-pattern`
- Header (1280 ancho, SPACE_BETWEEN, align-end):
  - col: eyebrow "EXPLORA COLOMBIA" Inter Semi Bold 12px `#00B7C7` / H2 "¿Qué quieres vivir?" Sora Bold 44px `#F9FBFC` / "Elige una experiencia y te mostramos los tours que la hacen realidad." Inter 16px `#F9FBFC`.
  - Botón outline "Ver todo el catálogo" 212×40: glass (cristal blanco 6% + rim), radius 999, padding 11/20, texto Inter Semi Bold 15px `#F9FBFC` + arrow-right 18.
- Mosaico de 9 tiles (bg imagen + velo `linear-gradient(rgba(10,26,46,0) 35% → 0.8 100%)`, radius 24), cada uno con icon 44 (stroke blanco 40%), nombre Sora Bold + "N tours" Inter 13px, botón circular 40×40 glass arrow-right. → `/explorar?category=`:
  - Sol y Playa 630×460 · Sora Bold 32px · 64 tours (img exp/destino playa: destino-san-andres)
  - Naturaleza 305×220 · Sora Bold 20px · 82 tours (exp-paramo)
  - Aventura 305×460 · 20px · 57 tours (exp-trekking)
  - Cultura e Historia 305×220 · 41 tours (exp-pueblo-patrimonio)
  - Ciudad y Noche 305×220 · 36 tours (destino-cartagena)
  - Recreación 305×220 · 29 tours (destino-guatape)
  - Relax y Bienestar 305×220 · 18 tours (exp-finca-tradicional)
  - Gastronomía y Café 305×220 · 24 tours (exp-cafe)
  > Layout mosaico: Sol y Playa (grande izq 630×460); columna centro-arriba Naturaleza + centro-abajo Ciudad y Noche/Recreación/Relax; Aventura (alto der 305×460); Cultura (der arriba). Confirmar posiciones exactas al construir con x/y.

## Sección "Viajes a tu medida" (`113:17320`) — 1440×620, `.topo-pattern`
- Header (760): eyebrow "MÁS ALLÁ DE COLOMBIA" Inter Semi Bold 12px `#FDB813` / H2 "Diseñamos el viaje que tienes en mente" Sora Bold 40px `#F9FBFC` / "Cuéntanos qué sueñas y un asesor arma tu plan: vuelos, hoteles y experiencias." Inter 16px.
- 4 tarjetas (1280 row gap 20), cada 305×228, bg imagen + velo `linear-gradient(rgba(16,16,16,0.25) 0% → 0.72 100%)`, radius 24:
  - "Viajes internacionales" / "Europa, Suramérica y más"
  - "Parques de Orlando" / "Planes en familia con todo resuelto"
  - "Cruceros" / "Caribe y Mediterráneo"
  - "Viajes personalizados" / "Tu fecha, tu ritmo, tu presupuesto"
  - Cada una: icon 44, título Sora Bold 20px `#F9FBFC`, subtítulo Inter 13px `#F9FBFC`, link "Cotiza con un asesor" Inter Semi Bold 13px `#FDB813` + arrow-right 16.

## Sección "Paga como prefieras" (`113:17388`) — 1440×260, bg `#06111D`
- col: "Paga como prefieras, con total seguridad" Sora SemiBold 24px `#F9FBFC` / "Pagos procesados por pasarelas autorizadas en Colombia." Inter 14px.
- Carrusel glass (row gap 16), chips radius 14 (cristal blanco 6% + rim): OnePay.la, PSE, Nequi, Daviplata, VISA, Mastercard (Sora Bold 16px `#F9FBFC`).

## Sección "Promesas" (`113:17411`) — 1440×300
- 4 tarjetas glass (1280 row gap 20), cada 305, padding 24, radius 20, cristal blanco 6% + rim:
  - icon 44 + título Sora SemiBold 17px `#F9FBFC` + descripción Inter 14px `#F9FBFC`:
  - "Turismo responsable" / "Cuidamos los lugares que visitas."
  - "Experiencias únicas" / "Diseñamos viajes auténticos y memorables."
  - "Seguridad y confianza" / "Tu tranquilidad es nuestra prioridad."
  - "Atención personalizada" / "Estamos contigo en cada paso del viaje."

## Colofón (`113:17445`) — 1440×54, bg `#06111D`, row SPACE_BETWEEN, padding 18/80
- Izq (row gap 18): "© 2026 BorondoTours S.A.S." · "NIT 900.000.000-0" · "RNT 00000" · "Cali, Colombia" — Inter 13px `#F9FBFC`.
- Der (row gap 18): Términos · Privacidad · Cancelación · Retracto (Inter Semi Bold 13px `#00B7C7`) + iconos IG/FB/X 18.

## Rail derecho (`165:104121`) — 60×156, redes, radius 18, fijo al scroll.
## FAB Soporte (`165:104173`) — 176×52, bg `#00B7C7`, radius 999, icon 24 + "¿Te ayudamos?" Inter SemiBold 14px `#101010`.
