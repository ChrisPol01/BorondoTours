# Informe Figma B2C: pantallas pendientes y versiones móviles

Archivo Figma: "BorondoTours — B2C Design System & Screens", Page 1 (tableros Colorido 132:33618,
Claro 132:33619, Oscuro 132:33620) y página "Flujo del frontend". No toqué la página B2B ni la sección 00.

## 1. No faltaba ninguna pantalla
El inventario en vivo del tablero Colorido tiene **132 canónicos** (pluginData `canon/row/dev/cell`).
Cada pantalla del flujo tiene versión desktop (1440) y móvil (390) con sus estados. Las 18 pantallas que
`btflow` marcaba "Pendiente" (`p:1`) ya existían como canónicas, con una copia en Claro y otra en Oscuro
(132 por tema y 0 duplicadas). No creé pantallas nuevas, porque habrían quedado duplicadas.

La página "Flujo del frontend" las mostraba como pendientes por dos motivos:
- `DATA` de `btflow.js` tenía `p:1` e ids viejos (38:*, 48:*, 54:*).
- El override `flowIds` (65:*, 69:*) apunta a la página "🗑 Temp — versiones viejas" y tenía prioridad.

### Pantallas antes "Pendiente" (canónico Colorido)
| Pantalla | Fila | Desktop | Móvil |
|---|---|---|---|
| Experiencias por categoría | experiencias | 93:92448 | 93:92796 |
| Destino / región | experiencias | 93:94077 | 93:94320 |
| Recuperar contraseña | acceso | 93:95382 | 93:95449 |
| Verificar correo | acceso | 93:95709 | 93:95770 |
| Procesando pago | checkout3 | 93:96000 | 93:96071 |
| Pago del participante | pagos | 93:96351 | 93:96464 |
| Pago del saldo | pagos | 93:96954 | 93:97062 |
| Voucher (QR) | misreservas | 93:97527 | 93:97841 |
| Cancelación confirmada | misreservas | 93:99315 | 93:99444 |
| Solicitud de reembolso | misreservas | 93:99993 | 93:100131 |
| Onboarding del viajero | misreservas | 93:100725 | 93:100844 |
| Artículo del blog | blog | 93:101343 | 93:101546 |
| Contacto | ayuda | 93:102306 | 93:102457 |
| Preguntas frecuentes | ayuda | 93:103164 | 93:103310 |
| Legal | ayuda | 93:103992 | 93:104101 |
| Política de cancelación | ayuda | 93:104574 | 93:104692 |
| Consentimiento de cookies | home | 93:105234 | 93:105346 |
| Sin conexión | errores | 93:105855 | 93:105911 |

Los estados que antes eran "Adaptar a móvil" también tienen su versión móvil (y desktop) en el tablero.
La lista completa de ids d/m de pantallas y estados está en `DATA` de `btflow.js`.

## 2. Defectos móviles corregidos (diseño móvil real a 390 px)
Al revisar las miniaturas encontré textos que se salían del frame móvil: textos con ancho "hug" más
anchos que su contenedor y columnas colapsadas a 1 px. Los corregí en el canónico y regeneré sus copias.
- **Procesando pago / Móvil** (93:96071): el título "Estamos confirmando tu pago" medía 402 px dentro de
  una tarjeta de 358 px. Ahora tiene ancho de relleno, alto automático y va centrado.
- **Mis reservas · por pagar / completadas / canceladas** (125:20361, 125:20676, 125:21030): en la
  tarjeta de reserva (imagen + texto + acciones en una fila) la columna de texto quedaba en 1 px. Ahora
  la fila hace salto de línea: la imagen y el texto (142 px) van arriba y los botones (48 px) en una fila
  de ancho completo abajo. La píldora de estado se ajusta al ancho de la columna.
- Pestaña "Completadas" (125:20695, 125:21050): ancho "hug".
- Textos con ancho de relleno y alto automático en: Consentimiento de cookies, Checkout 2 · pasaporte
  cargado, Mis reservas (base, cancelar, reprogramar), Calificar tour, Cancelación confirmada, Solicitud
  de reembolso, Mensajes (desktop, bloqueado y solo lectura, D y M).
- Frames móviles que crecieron con el contenido. La barra inferior vuelve a quedar pegada al borde y la
  hoja inferior al fondo: 93:96071, 93:105346, 93:84220, 125:20361, 125:20676, 125:21030, 125:21759,
  125:21954, 93:106812, 93:99444, 125:22362, 125:22635. En 125:21954 y 93:106812 oculté las filas del
  listado que quedan totalmente tapadas por la hoja inferior.

Copias Claro y Oscuro de esos 17 canónicos regeneradas con `btregen.ONE` y pasadas por `btvisfix.FIX`:
34 de 34 sin errores y 0 fallas restantes. Avance en `bridge.store` `regenFix2`.

## 3. Flujo del frontend
- `btflow.js` (repo y documento): `DATA` con los ids canónicos actuales (d y m) de todas las pantallas
  y estados, sin `p:1`. `pick()` da prioridad a `DATA`. `flow-ids.json` quedó vacío y marcado obsoleto.
- Página "Flujo del frontend" regenerada:
  - Desktop 247:13525: 40 pantallas diseñadas, 25 estados, 0 por adaptar, 0 pendientes.
  - Móvil 247:14291: 40 pantallas diseñadas, 27 estados, 0 por adaptar, 0 pendientes.
  - Los tableros viejos (74:91692, 74:92401) los moví a "🗑 Temp — versiones viejas"; no los borré.

## 4. Auditoría de contraste (btvis.audit)
Ver la sección 6 (resultado final de los tres tableros completos).

## 5. Notas operativas
- `figma.loadFontAsync` se colgó de forma intermitente dentro de trabajos async, y dos trabajos quedaron
  bloqueados en "running". Las fuentes de la marca ya estaban cargadas en la sesión, así que las
  ediciones de texto siguientes se hicieron sin esa llamada.
- Módulo nuevo en el documento: `btaudrun` (auditoría por lotes con avance en `bridge.store` `aud2_<tema>`).
- La rejilla de pestañas de Mis reservas móvil (4 pestañas, unos 514 px en 310 px) es un control con
  desplazamiento horizontal. Lo dejé como estaba.
