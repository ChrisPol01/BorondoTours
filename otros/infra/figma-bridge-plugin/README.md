# Parche del plugin Antigravity Bridge (Figma)

Copia versionada del plugin de Figma que usa el MCP `figma-bridge`.

- `code.js`: versión parcheada (la que debe estar instalada).
- `code.original.js`: versión 4.0.0 sin parche, para comparar.

## Qué cambia el parche
1. **Capturas:** tope de 1568 px por lado mayor y 2,4 M de píxeles totales. Evita que
   el chat se cierre por imágenes de más de 2000 px.
2. **Fuentes:** caché por sesión y tope de 5 s por carga. `ensureFont` devuelve el
   `fontName` que cargó y prueba variantes ("ExtraBold" / "Extra Bold").
   `ensureFont.timings()` sirve de diagnóstico.

## Dónde instalarlo
Figma carga el plugin desde estas carpetas. Copiar `code.js` a las tres:
- `~/.gemini/antigravity/mcp/figma-plugin/`
- `~/.gemini/antigravity-ide/mcp/figma-plugin/`
- `~/.figma-mcp-bridge/mcp/figma-plugin/`

Luego cerrar y abrir el plugin en Figma Desktop.

Si una actualización del plugin sobrescribe `code.js`, volver a aplicar este archivo.

## Módulos de diseño (`modules/`)

Código de los helpers que se guardan dentro del archivo de Figma con `bridge.define` y se usan con `bridge.require`. Esta carpeta es la **fuente canónica**; si el documento se pierde o se cambia un módulo, se vuelve a cargar pegando el archivo en `bridge.define('<nombre>', <contenido>)`.

| Módulo | Qué hace | Depende de |
|---|---|---|
| `bt` | Base: tokens de color, fuentes, `F`/`T`/`I`/`IMG`, sombras (`shadowCard`, `shadowFloat`), glass, `BTN`, `CHIP`, `BADGE`, `TOURCARD`, `TOPO`, 72 iconos | — |
| `bts` | Estados y modales: `ROW`, `FIT`, `ST`, `MODAL`, `FIELD`, `CHECK`, `DIV`, `NOTE`, `KV` | `bt` |
| `btm` | Pantallas móviles: `shell`, `finish`, `activeTab` | `bt` |
| `btd` | Conversión a tema Oscuro (`night`). Se retira cuando los colores pasen a variables | `bt` |
| `btmap` | Mapa interactivo de Colombia: `BUILD` (33 component sets) y `MAP` (instancia por región) | `bt` |
| `btt` | Temas con variables: `ensure` (3 colecciones "Tema · Colorido/Claro/Oscuro", 20 tokens), `BIND` (colores sueltos → variables), `APPLY` (copia → otro tema; en Claro añade blur), `SYNC` (refresca color cacheado), `REFRESH` (regenera la sección de temas desde los originales), `COPYOP` | `bt` |
| `btflow` | Mapa de flujo: `DATA` (inventario de pantallas y estados) y `BUILD(page,'d'\|'m')` (tablero con miniaturas, estados y flechas) | `bt` |
| `btp` | Plantillas de las 18 pantallas de la sección 17: `SCREENS`, `BUILD(key, vp, x, y)` | `bt`, `btt` |
| `btq` | Auditoría de calidad (solo lee): `screens()`, `contrast(root)` (WCAG AA 4.5/3), `unbound(root)`, `fakeChrome(root)`, `bgOf`, `ratio` | — |
| `btqf` | Correcciones de calidad: `FIX(root)` (fondos, tarjetas glass, navbar según fondo, chips, texto e iconos por contraste), `paint`/`setP` (asignación doble con variable) | `btq` |
| `btmx` | Matriz de temas en la sección 16: `HEAD()`, `ROWS(a,b)` (filas = pantalla, columnas = Colorido · Claro · Oscuro; Desktop + Móvil) | `btt` |
| `btmx2` | Actualización de la matriz: `UPDATE()` = `btt.REFRESH` + `GRAD` (paradas de degradado al tema de la copia) + `POST` (texto con mejor contraste del tema). `POSTALL()` sin regenerar. Tarda ~2 min: lanzar con `async: true` | `btq`, `btqf`, `btt` |
| `btqt` | `TEXTFIX(root)`: asigna a cada texto que falla el rol de texto con mejor contraste; si ninguno pasa, oscurece el contenedor | `btq`, `btqf` |
| `btg` | Vidrio "gota de agua": `GLASS(node,{strong,light,blur,shadow})` (relleno glass/*, borde especular degradado, brillo interno, sombra, blur 28), `TEXT(node)` (texto blanco en vidrio oscuro, negro en `light`), `AMBIENT(root)` (manchas de color de fondo) | `btt` |

`btq.icons(root)` / `btq.all(root)`: auditoría de iconos y trazos (mínimo 3:1, WCAG 1.4.11). Los bordes decorativos del mapa de departamentos se excluyen.

**Variables de tema:** valores vigentes de las 4 colecciones (Colorido, Claro, Oscuro, Inmersivo) en `theme-variables.json`. `btt.ensure()` solo crea variables faltantes; no sobrescribe (usar `ensure({force:true})` para reiniciar a los valores iniciales).

**Módulos de tableros y estados (2026-09-29):**

| Módulo | Qué hace | Depende de |
|---|---|---|
| `btvis` | Auditor oficial de contraste: `audit(root,{full,max})` calcula el fondo real de cada texto/icono (no solo ancestros). Exenta controles deshabilitados (opacidad ≤ 0.6) | — |
| `btvisfix` | `FIX(root, V)`: asigna a cada hallazgo de `btvis` el token con mejor contraste del tema `V` | `btvis`, `btqf`, `btqt` |
| `btboard` | Pies de foto y etiquetas de los tableros (`txt`, `caption`, `place`) | — |
| `btreg` | Copias Claro/Oscuro desde el canónico: `REPLACE(copia)`, `CREATE(canon, tema)` | `btt`, `btmx2` |
| `btpat` | Patrones de interrupción: `DIALOG`, `PANEL`, `POPOVER` (design.md §8f) | — |
| `btpat2` | Barra de panel, acciones apiladas, espaciador, `fixCristals` | — |
| `btstate` | `PLACE` (celda del tablero + pluginData + pie de foto), `setLayout`, `AGOTADO` (Detalle con fecha agotada) | `btboard`, `btpat2` |
| `btstate2` | `SKELETON(card)`, `line`, `setText`, `bindFill` | — |
| `btrebase` | `REBASE(frame, base, keep)`: cambia la base de un estado sin perder su id | — |
| `btmsheet` | Móvil: `SHEET(frame, base, op, blur)` monta la hoja inferior sobre su pantalla de origen; `FULL(frame)` la pasa a pantalla completa | `btpat` |
| `btmr` | Estados Desktop de Mis reservas (`MRSTATE`, `setActiveTab`, `fitFrame`) | `btpat2` |
| `btmp` | Estados móviles de pasaporte sobre el Checkout Paso 2 (`PASS`) | `btrebase`, `btpat2` |
| `btregen` / `btregen2` | Regenerar Claro/Oscuro desde Colorido: `ONE(canon, tema)` y `RUN(maxNodes)` por lotes, avance en `regenPlan` | `btt`, `btmx2` |
| `btcs` | Estados de controles del Design System: `BUILD(parent,x,y)` crea los sets Button (Variante × Estado × Tamaño, propiedades Etiqueta e Icono), Input, Chip, Tab, Checkbox y Radio. Alturas 32/40/48, anillo de foco 2 px | `bt`, `btqf`, `btlg` |

**Fuente de componentes (2026-09-29):** página **Design System**, sección `00 · Componentes y sistema` (`52:5262`). Los componentes viejos quedaron en la página Temp, sección "Design System v0 (obsoleto)".

**Regenerar Claro/Oscuro:** ~9 s por pantalla de 350 nodos (APPLY y SYNC dominan). Usar `btregen2.RUN(400–700)` con `async: true`. Si responde BRIDGE_OFFLINE, esperar ~25 s y leer `regenPlan`: el plugin suele terminar el lote.

**Control de calidad (antes de entregar pantallas):** `btvis.audit` debe dar 0 en el canónico (tablero Colorido) y en sus copias Claro y Oscuro; corregir con `btvisfix.FIX(root, V)`. `btq.contrast` y `btmx2.UPDATE/AUDIT/REGEN` son del sistema anterior (matriz 16) y ya no se usan.

**Gotchas de variables (Figma):**
- La primera asignación de `node.fills` con un paint vinculado resetea la opacidad a 1: asignar dos veces.
- `setBoundVariableForPaint` deja el color viejo en el paint y Figma lo pinta así: escribir el color resuelto (`bindP` en `btt`).
- Plan Starter: 1 modo por colección, por eso cada tema es una colección aparte.
- `clone()` pierde la opacidad de paints vinculados en overrides de instancias: usar `btt.COPYOP(original, copia)`.

**Reglas para no duplicar:**
- Solo `bt` define colores, sombras, primitivas e iconos. Los demás módulos los importan; no copian `hex`, `sol` ni efectos.
- Un icono nuevo se agrega a `EXTRA` en `bt`, no en otro módulo.
- Los módulos antiguos `ui`, `ui2`, `ui3`, `ui4`, `btf` y `bti` se eliminaron del documento (2026-09-27): eran versiones duplicadas; sus iconos y fuentes quedaron en `bt`.

## Mapa de Colombia
- Trazos: [@svg-maps/colombia](https://github.com/VictorCazanave/svg-maps/tree/master/packages/colombia) v2.0.0, basado en MapSVG, licencia **CC BY 4.0**. La atribución debe mostrarse junto al mapa.
- En Figma: Section `00 · Componentes`, bloque "Mapa Colombia / Departamentos" (33 component sets `Departamento/<nombre>` con `Visitado` × `Estado` y hover interactivo). Usado en `09 · Mis tours` (escritorio y móvil) con recuadro de San Andrés.
- En código: `apps/web/src/lib/colombiaMap.ts` (nombres oficiales, código DANE, región y trazos). Copias de referencia en `otros/design/b2c/assets/mapas/` (`.svg`, `.json` y el original `svg-maps-colombia.js`).
