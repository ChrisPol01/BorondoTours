# 🗂️ Inventario de pantallas — B2C (Figma)

> Actualizado 2026-09-29. Archivo Figma "BorondoTours — B2C Design System & Screens", **Page 1**.
> Reemplaza al inventario anterior basado en la matriz de temas (sección 16), que quedó obsoleta.

## Cómo está organizado Page 1

- **Sección 00 · Componentes:** solo componentes padre / estándar.
- **3 tableros por tema:** Colorido (`132:33618`, x = 0), Claro (`132:33619`, x = 23320) y Oscuro (`132:33620`, x = 46640).
- En cada tablero: **filas = pantallas** (en vertical) y **columnas = estados** de esa pantalla (en horizontal). Cada celda tiene su versión Desktop y Móvil.
- **Colorido es el canónico.** Claro y Oscuro se regeneran desde él con `btreg` y se auditan con `btvis`.

## Patrón de cada estado (design.md §8f)

| Patrón | Desktop | Móvil |
|---|---|---|
| Diálogo bloqueante | 480 px centrado, velo 30 % + blur 20, sobre la pantalla de origen | Hoja inferior con el mismo velo |
| Panel lateral | 480 px a la derecha, velo 20 % + blur 8 | Pantalla completa |
| Popover anclado | Sin velo, `glass-strong` | Hoja inferior o pantalla completa |
| Toast | Abajo a la derecha, 400 px | Arriba, ancho completo |
| Inline | Dentro de la página | Dentro de la página |

## Estados por pantalla

Leyenda: ✅ hecho · ⏳ pendiente · ➖ no aplica.

| Pantalla | Estado | Patrón | Desktop | Móvil |
|---|---|---|:---:|:---:|
| Explorar | Cargando (skeleton) | Inline | ✅ `136:38866` | ✅ `124:18864` |
| Explorar | Sin resultados | Inline | ✅ `136:39362` | ✅ `124:18546` |
| Explorar | Vista mapa | Inline | ✅ | ✅ |
| Detalle del tour | Fecha agotada | Inline | ✅ `135:34434` | ✅ |
| Detalle del tour | Lista de espera | Diálogo | ✅ `128:28235` | ✅ |
| Detalle del tour | Lista de espera · confirmada | Toast + botón activo | ✅ `128:28957` | ✅ |
| Detalle del tour | Iniciar sesión · Crear cuenta · OTP | Diálogo | ✅ `128:30589` `128:31042` `128:31502` | ✅ |
| Checkout 2 | Pasaporte pendiente | Inline | ✅ `136:40027` | ✅ `125:19638` |
| Checkout 2 | Pasaporte cargado | Inline | ✅ `136:40284` | ✅ `125:19764` |
| Checkout 3 | Pago rechazado · enlace vencido · cupo agotado | Diálogo / hoja inferior | ✅ `128:27651` `128:27845` `128:28040` | ✅ sobre el Paso 3 |
| Checkout 3 | Divide tu cuenta | Inline | ✅ `136:40537` | ✅ `125:20154` |
| Checkout 3 | Términos y política (acordeón) | Acordeón `143:43446` | ✅ | ✅ |
| Mis reservas | Por pagar · Completadas · Canceladas · Vacío | Inline | ✅ `142:40767` `142:41084` `142:41414` `142:41720` | ✅ |
| Mis reservas | Detalle de reserva | Panel / pantalla completa | ✅ `128:29657` | ✅ `125:21534` |
| Mis reservas | Cancelar · Reprogramar · Calificar | Diálogo / hoja inferior | ✅ | ✅ sobre Mis reservas |
| Favoritos | Vacío | Inline | ✅ `143:42027` | ✅ |
| Mensajes | Bloqueado · Solo lectura | Inline | ✅ `143:42319` `143:42560` | ✅ |
| Con sesión | Menú de cuenta | Popover / hoja sin desenfoque | ✅ `128:31935` | ✅ sobre Perfil |
| Con sesión | Notificaciones | Popover / pantalla completa | ✅ `128:32188` | ✅ `93:106662` |
| Con sesión | Soporte | Panel / pantalla completa | ✅ `128:32706` | ✅ `93:107115` |
| Home | Promociones | Panel / hoja sin desenfoque | ✅ | ✅ sobre el Home |
| Explorar | Filtros | Hoja sin desenfoque | ➖ | ✅ sobre Explorar |
| Global | Error 404 · Error 500 | Página completa | ✅ `143:42798` `143:42868` | ✅ |

## Pendientes

1. Terminar de regenerar Claro y Oscuro (`btregen2.RUN`, avance en `regenPlan`) y auditar con `btvis` (contraste = 0).
2. Regenerar la página "Flujo del frontend" con los ids nuevos.
3. Borrar la sonda `104:9284`.
