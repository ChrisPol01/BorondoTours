# 13. Uso seguro del puente de Figma (Antigravity Bridge)

## Por qué existe
Una imagen de más de 2000 px de ancho o alto cierra la sesión del chat cuando ya
hay varias imágenes en la conversación. Las capturas de frames altos (Home de
escritorio, pantallas móviles largas) a escala 1.5 superaban ese límite.

El plugin (`~/.figma-mcp-bridge/mcp/figma-plugin/code.js`) ya recorta toda captura
a 1568 px por lado. Estas reglas son la segunda capa.

## Reglas de captura
- Por defecto `capture: false`. Capturar solo para verificar algo visual concreto.
- Si capturo: siempre `capture_node_ids` con el nodo pequeño que cambió (una
  sección, un componente), nunca la página ni un frame de pantalla completa.
- `scale` ≤ 1 en todas las capturas. Frames de más de 1000 px de alto: `scale: 0.5`.
- Máximo 1 imagen por respuesta y pocas por sesión. Para revisar estructura usar
  `figma_read_canvas` (texto), no imágenes.
- `figma_screenshot` sin `node_ids` está prohibido (captura la página entera).
- No usar `get_image` (REST, escala 2 por defecto) para frames completos.

## Reglas de fuentes (lentitud)
- El plugin cachea las fuentes y corta cada carga a 5 s. `ensureFont` devuelve el
  `fontName` que realmente cargó: usar ese valor en `node.fontName`.
- Diagnóstico: `return ensureFont.timings()` lista cuánto tardó cada fuente.
- No llamar `figma.listAvailableFontsAsync()`: es lento y bloquea la llamada.
- Nombres exactos en este equipo (confirmado 2026-09-27): Inter usa **"Semi Bold"**
  (con espacio); Sora usa **"SemiBold"**, "Bold", "ExtraBold" (sin espacio).
  Pedir "Inter SemiBold" tardaba ~44 s y fallaba: era la causa de la lentitud.
- Figma carga el plugin desde `~/.gemini/antigravity/mcp/figma-plugin/`. Todo parche al
  plugin se copia también ahí y a `~/.gemini/antigravity-ide/...`.

## Trabajo por partes
- Construir cada pantalla por secciones (una llamada por sección), no en un bloque.
- Guardar helpers con `bridge.define` y reutilizarlos con `bridge.require`.

## Módulos (no duplicar)
- Fuente canónica: `otros/infra/figma-bridge-plugin/modules/` (`bt`, `bts`, `btm`, `btd`, `btmap`, `btt`, `btflow`, `btp`, `btq`, `btqf`, `btqt`, `btmx`, `btmx2`, `btg`, `btvis`, `btvisfix`, `btboard`, `btreg`, `btpat`, `btpat2`, `btstate`, `btstate2`, `btrebase`). Ver su README.
- Control de calidad obligatorio antes de dar una pantalla por terminada: `btvis.audit` = 0 en el canónico (tablero Colorido) y en sus copias Claro y Oscuro.
- Vidrio: usar solo `btg.GLASS` (oscuro → texto blanco; `light` → texto negro; neutro sobre el azul Inmersivo del Home). Valores en `otros/infra/figma-bridge-plugin/theme-variables.json`. No correr `btt.ensure({force:true})` sin revisar: reinicia los valores.
- Si la herramienta `figma_execute_code` desaparece de la sesión: reiniciar el plugin "Antigravity Bridge" o reconectar el MCP `figma-bridge`. Tras editar, `btqf.FIX` → `btt.REFRESH` → `btmx2.POSTALL`.
- Nombres reservados del runtime: no declarar `log` ni `n` en el cuerpo de `figma_execute_code`.
- Pantalla nueva: añadir su id a `DATA` de `btflow` y regenerar la página "Flujo del frontend". Cambio en una pantalla de la sección 16: correr `btt.REFRESH`.
- Capturas del tablero de flujo: `scale` 0.15 (mide ~4600×6800).
- Colores nuevos: usar variables del tema (`btt`), no hex sueltos. Al vincular, usar `btt` (asigna dos veces y escribe el color resuelto); tras cambiar valores de variables, correr `btt.SYNC`.
- Solo `bt` define colores, sombras, primitivas e iconos; los demás lo importan. Un icono nuevo va a `EXTRA` de `bt`.
- Antes de crear un helper, revisar si ya existe en estos módulos. Si se cambia un módulo en Figma, actualizar también el archivo del repo.

## Liquid glass estandarizado (btlg) y lotes
- Todo vidrio usa `btlg.LG`: contenedor sin relleno, Clip content, sombra Y10 B30 negro 10 %; capa hija
  "Cristal" (índice 0, DETRÁS del contenido, absoluta, bloqueada): fill `glass/fill` (blanco 10 %) o
  `glass/strong`, blur 40, borde 1 px degradado `glass/rim-hi` (60 %) → `glass/rim-lo` (0 %), inner shadow Y2 B10 blanco 20 %.
- Pantallas: `btlgs.RUN(from,to)` de a ~10. Matriz 16: `btmx2.UPDATE(from,to)` de a 20 (216 copias). Nunca todo de una vez: el plugin se cierra por memoria ("Plugin runtime aborted").
- Inmersivo quedó unificado con Colorido (`btmx2.eff` devuelve el tema de la copia).
- Figma pinta con `paint.opacity` e ignora el alfa de la variable: `btt.bindP`/`btg.sp` copian ese alfa.

## Corrección de contraste y limpieza (2026-09-27)
- Módulo `btqfix.FIXROOT(root, tv)`: corrige texto/iconos que fallan WCAG eligiendo el token de mejor
  contraste sobre su fondo real. `tv` = mapa del tema (`btqf.vars()` para Colorido, `btmx2.tv(theme)` para copias).
- Iconos sobre fondo claro deben quedar en `text/on-action` (Negro Volcánico), no `text/primary` (en Colorido es blanco).
- `btq.bgOf` reconoce la capa "Cristal" del liquid glass como fondo (hijo índice 0 llamado "Cristal").
- Versiones viejas / respaldos: mover la sección a la página **"🗑 Temp — versiones viejas"** (reversible), no borrar.
- La matriz 16 = 216 copias + 49 etiquetas de texto (encabezados). No tocar las etiquetas al regenerar.

## Tableros por tema (vigente desde 2026-09-29 — reemplaza la matriz 16)

- Page 1 contiene solo la sección 00 (componentes padre) y 3 tableros:
  Colorido `132:33618` (x=0) · Claro `132:33619` (x=23320) · Oscuro `132:33620` (x=46640).
  Filas = 19 familias de pantalla (sub-fila Desktop arriba, Móvil abajo); columnas = estados.
- Las pantallas **canónicas** son las del tablero Colorido (`pluginData canon=1`). Claro/Oscuro son
  copias con `src` = id del canónico. Se regeneran con `btreg.REPLACE(copia)` / `btreg.CREATE(canon, tema)`.
- Geometría en `bridge.store 'geo2'` (PAD 120, LABEL 560, DX 1640, MX 490; x = PAD+LABEL+celda·DX|MX).
  Mapa de filas en `'layout2'`. Pantalla nueva: `btstate.PLACE(nodo, fila, celda, 'D'|'M', nombre)` +
  `btstate.setLayout`. Si una pantalla crece y pisa la sub-fila siguiente, desplazar todo lo que está
  debajo en los 3 tableros y actualizar `geo2` (se hizo +279 en Acceso y +240 en Checkout 3).
- Para cambiar la base de un estado sin perder su id (reacciones, flujos): `btrebase.REBASE`.
- Patrones de modal: `btpat.DIALOG | PANEL | POPOVER` y `btpat2` (barra, acciones, espaciador). Ver design.md §8f.
- Auditor oficial de contraste: `btvis.audit` + `btvisfix.FIX(root, V)` con las variables del tema
  (`btqf.vars()` Colorido, `btmx2.tv(tema)` para Claro/Oscuro). `btq.contrast` y `btmx2.AUDIT/REGEN/copies`
  quedaron obsoletos (dependían de la matriz `58:7481`, hoy en la papelera). Controles deshabilitados
  (opacidad ≤ 0.6) quedan exentos.
- `bridge.state` se borra cada vez que el plugin se recarga: guardar todo progreso en `bridge.store`.
- Capturas: la de un nodo suelto se pinta sobre blanco y no sirve para juzgar contraste; capturar el
  frame completo (scale ≤ 0.45 si mide más de 1000 px).
- `figma.variables.setBoundVariableForPaint` devuelve un objeto de solo lectura: la opacidad se aplica
  con spread (`{...paint, opacity}`), no asignando `paint.opacity` después.
- `findAll` sobre toda la página tumba el puente: recorrer frame por frame.

## Regenerar Claro/Oscuro y estados móviles (2026-09-29)
- Regenerar copias: `btregen2.RUN(400–700)` con `async: true`; el avance vive en `bridge.store 'regenPlan'`
  y se guarda por pantalla. ~9 s por pantalla de 350 nodos. Un BRIDGE_OFFLINE casi nunca pierde trabajo:
  esperar ~25 s y leer `regenPlan` antes de reintentar.
- No correr `btt.APPLY` sobre un TEXT suelto (falla con "not a function").
- Estados móviles de interrupción: `btmsheet.SHEET(frame, base, 0.3, 20)` para diálogos y
  `(0.2, 0)` para menús ligeros (sin desenfoque). Paneles y notificaciones: `btmsheet.FULL` + "Barra volver".
- Si una pantalla crece, desplazar todo lo que está debajo en los TRES tableros y actualizar `geo2`.
- `minWidth` no acepta 0 (usar `null`).

## Cierre del B2C (2026-09-29)
- **Fuente de componentes:** página **Design System** → sección `00 · Componentes y sistema` (`52:5262`).
  Se movió desde Page 1; las instancias siguen enlazadas. No crear componentes dentro de las pantallas:
  si aparece uno suelto, pasarlo a la sección 00 y dejar una instancia en su lugar (`swapComponent`/`createInstance`
  + `btt.APPLY(inst, tema)` en copias Claro/Oscuro).
- Estados de controles: módulo `btcs` (`BUILD(parent,x,y)`) → sets Button, Input, Chip, Tab, Checkbox, Radio
  en "Estados — Controles (componentes)" (`165:104285`). Rail derecho = set `165:104120`; FAB = `38:1933`;
  TourCard = set `166:104691`. Versiones viejas en Temp → sección "Design System v0 (obsoleto)".
- `btmap.sets()` busca en `figma.currentPage`: para usar el mapa desde Page 1 hay que cambiar a `figma.root`.
- **Sin negro puro:** `tint` es una capa ≤ 16 %; si un panel lo usa al 100 %, rebind a `glass/strong`.
  Páginas de error y modales usan `glass/strong`, no `surface/strong`.
- **Cristal en tarjetas con foto:** mide lo mismo que el panel de información, no la tarjeta. No redimensionarlo
  al padre (desenfoca la foto). El rollback de un job async no restaura: guardar geometría antes en `bridge.store`.
- Contraste: `btvis.audit(frame,{full:true})` + `btqt.best(node, {r,g,b}, V)` (el fondo va como objeto RGB, no hex)
  + `btqf.setP(node, prop, V[role], 1)`. Los casos `img:true` están sobre foto: se resuelven con `text/on-strong`.
- Lotes estables: ~1800 nodos por llamada. `SYNC` de Claro+Oscuro ≈ 195 s: correr con `async: true`.
- **Scroll:** pantallas con `overflowDirection='VERTICAL'` y `numberOfFixedChildren` = chrome + overlays al final
  del orden de capas (overlays siempre encima). Carruseles: `overflowDirection='HORIZONTAL'`. La API del plugin
  no tiene `scrollBehavior` (sticky): tarjeta Reserva y Sub-navegación quedan documentadas como sticky en design.md §8g.
- Los comentarios de Figma no se leen desde el plugin: pedir al usuario la pantalla exacta.

## Histórico — agregar pantallas a la matriz 16 (obsoleto)

Cuando aparece una pantalla nueva en las secciones 01–18, hay que agregarla a la matriz de temas
(`58:7481`) como 3 copias (Colorido/Claro/Oscuro). `btmx2.REGEN/AUDIT` solo operan sobre copias que
YA existen; para AGREGAR se clona la fuente y se posiciona a mano. Reglas aprendidas:

- **Geometría de columnas** (X por tema y dispositivo): Colorido D=560 / M=2080 · Claro D=2710 / M=4230 ·
  Oscuro D=4860 / M=6380. El dispositivo se decide por ancho de la fuente (≥1000 = Desktop). Las filas
  nuevas se apilan en Y debajo de la última copia (`maxBottom + 300`, redondeado), con gap ~120px.
- **Cada copia lleva `pluginData`**: `src` = id de la pantalla fuente, `theme` = Colorido|Claro|Oscuro.
  Sin esto, `copies()`/`REGEN`/`AUDIT` no la reconocen.
- **APPLY no basta**: `btt.APPLY(c, tema)` solo re-vincula paints SOLID. Los **gradientes** (ej. el
  `--gradient-page` azul del fondo) y las **sombras/brillos de vidrio** quedan con el color del tema
  Colorido y TAPAN el tema (una copia "Claro" se ve azul oscuro). **FIX obligatorio**: tras `APPLY`,
  llamar `btmx2.GRAD(c)` (re-vincula stops de gradiente en fills y strokes) y `btmx2.FX(c)` (re-vincula
  color de efectos). Recién ahí el fondo Claro resuelve a `#f2f2f7` y el Oscuro a `#0b0b0c`.
- Secuencia por copia no-Colorido: `clone → COPYOP → APPLY → GRAD → FX → SYNC`.
- **Lotes y saturación**: clonar frames + GRAD+FX es pesado. Móviles: lotes de 2–3 pantallas (6–9 clones).
  Desktop 1440px: **de a 1**. Devolver SIEMPRE un resultado mínimo (`{added:n}`), NUNCA árboles/nombres:
  la saturación ocurre al DEVOLVER, no durante. Un `BRIDGE_OFFLINE` tras un lote casi siempre significa
  que el trabajo SÍ se completó — verificar contando copias por `src` antes de reintentar (evita duplicar).
- **AUDIT aparte**: nunca en la misma llamada que la creación. `btmx2.AUDIT(from,to)` en rangos de ~15
  (los que incluyen desktop, de ~6). Es idempotente: reintentar es seguro.
- **Etiqueta de fila**: cada fila nueva necesita su TEXT a la izquierda (x=40, ancho 460, Sora Bold ~32,
  fill vinculado a `brand/azul-profundo`), con `pluginData rowlabel=1`. Colocar en la Y de la fila.
- Resultado de esta sesión: matriz pasó de 72 a **102 pantallas** (306 copias), 0 faltantes.

## Estilos de texto (2026-09-29)
- Vincular textos existentes con `setTextStyleIdAsync` es inviable a escala (19 de 6.814 en 12 min) y bloquea el plugin: los demás trabajos quedan en cola. Además cambia el interlineado y puede mover las maquetas.
- Los 8 estilos ya existen (`Heading/H1–H4`, `Body/Body 1–2`, `UI/Button`, `UI/Label`). Se aplican solo al crear pantallas nuevas.
- Si un trabajo con `async: true` no termina, reiniciar el plugin (Ctrl+Alt+P) para cancelarlo.

## Auditoría y fotos (2026-09-29)
- `btvis.audit(frame)` devuelve `{n, sample}`: contar con `r.n`. `{full:true}` cambia el formato; no usarlo para contar.
- `bridge.store` no existe en esta versión del plugin.
- Si hay texto sobre una foto, la capa directa bajo el texto debe ser un velo oscuro (degradado Negro Volcánico 20 % → 70 %), nunca blanca. El auditor estima la foto como gris, así que se confirma con una captura.
- Auth Gate (opción B): los estados "Iniciar sesión", "Crear cuenta" y "Código OTP" usan como base el Checkout paso 3 (pluginData `authGate=B`). Escritorio mide 1084 de alto; móvil, 844 con hoja inferior.

## Extraer diseño exacto para construir código (pixel-perfect, 2026-09-29)

Para traducir una pantalla de Figma a código con fidelidad total, NO usar `getCSSAsync()`:
en este entorno se cuelga (>300 s) sobre subárboles medianos y encola jobs zombis.

Método correcto: **leer propiedades nativas del nodo (síncronas, instantáneas)** con el módulo
`cssprops` (definido con `bridge.define`, cuerpo como string). Da fills/strokes/effects/radius/
layout/typo/medidas exactos y resuelve `boundVariables` (mapea a tokens). ~150–300 ms por nodo.

Reglas:
- Volcar **de a un nodo pequeño por llamada, maxDepth 3–4**. Nunca el frame raíz de la pantalla
  completo (arrastra patrones topográficos + vectores y se vuelve lento).
- Saltar decorativos (`Patrón topográfico`, `Cristal`, `Velo foto`, capas de degradado) y vectores:
  se reproducen con clases del sistema (`.topo-pattern`, `.media-veil`, `.glass-surface`).
- Para bloques con posición absoluta (heroes), leer x/y/w/h de los hijos directos aparte.
- Guardar el volcado como `.md` de referencia en `otros/design/b2c/css-dump/NN-pantalla.md`
  para NO re-extraer. Colores con `boundVar` → tokens Tailwind; valores crudos → tal cual.
- Si `getCSSAsync` dejó jobs colgados, pedir al usuario recargar el plugin (Ctrl+Alt+P).
