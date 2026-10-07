# Bugfix Requirements Document

## Introduction

Tras implementar la tarea 12 (vidrio "gota de agua" sin blur) y la tarea 13 (píldora deslizante del navbar) en el B2C (`apps/web`), aparecieron regresiones visuales y de comportamiento en los tres temas (Colorido, Claro, Oscuro):

- El vidrio no sigue el estándar definido en Figma.
- Las tarjetas de tour perdieron su diseño.
- El navbar se ve distinto entre pantallas y su indicador corta bordes.
- Los chips de filtro se ven recortados.
- Hay cortes duros entre secciones.
- El rail de redes se superpone a otros botones.
- Los botones laterales perdieron sus colores de marca.
- El modal de vitrinas desperdicia espacio.
- Algunas tarjetas no llevan al detalle del tour.

Impacto: la interfaz se ve inconsistente con la marca y con Figma, y la conversión baja porque una tarjeta no siempre lleva al detalle donde se reserva.

**Fuente de verdad visual (Figma):**
- Vidrio por tema: página "Design System", lienzo "#Design System", componente "TourCard", variante "Default", capas `body-oscuro`, `body-colorido` y `body-claro`.
- Tarjeta de tour: set `166:104691`, variantes Default y Hover.
- Pestañas laterales derechas: export de Figma del Home (`apps/web/src/pages/index.astro`, clases `p0_13`, `p0_17` y `p0_18`).

**Condición del bug C(X):** X es un elemento del B2C renderizado en un tema T. C(X) se cumple cuando X está en alguno de estos casos:

| Caso | Elemento X |
|---|---|
| a | Usa vidrio: navbar, sidebar, rail, modal, menú, chip, tarjeta o vitrina |
| b | Es una TourCard |
| c | Es el navbar del Home |
| d | Es el indicador del navbar con hover sobre una opción distinta de la activa |
| e | Es un chip de filtro superior |
| f | Es una unión entre una imagen o hero y un fondo de sección (por ejemplo `p0_50`) |
| g | Es el rail de redes sociales |
| h | Es un botón lateral derecho: Promociones, Más vendidos o Ver todos |
| i | Es el modal de vitrinas |
| j | Es el clic en una tarjeta de tour desde cualquier origen |

**Preservación ¬C(X):** el resto de comportamientos del B2C debe quedar idéntico tras el arreglo: auth demo, filtros del catálogo, formulario de contacto, centro legal, traducción, corrector de contraste y scroll fijo del chrome.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN un elemento con vidrio (navbar, sidebar, rail, modal, menú, chip, tarjeta o vitrina) se renderiza en cualquier tema THEN el sistema aplica un tinte y un borde aproximados por el runtime (`--bt-drop-*`) que no coinciden con las capas `body-colorido`, `body-claro` ni `body-oscuro` del TourCard de Figma.

1.2 WHEN se renderiza una tarjeta de tour en el catálogo, el Home o las vitrinas THEN el sistema muestra un diseño alterado por el runtime de vidrio y catálogo, distinto del componente TourCard de Figma (set `166:104691`, variante Default).

1.3 WHEN el usuario pasa el mouse sobre una tarjeta de tour THEN el sistema no aplica la variante Hover del componente TourCard.

1.4 WHEN una tarjeta de tour necesita sus otros estados (por ejemplo foco o carga) THEN el sistema no los tiene definidos.

1.5 WHEN se abre el Home THEN el sistema muestra un fondo azul sólido detrás de las cápsulas del navbar. En /explorar el mismo navbar se ve correcto.

1.6 WHEN el usuario pasa el mouse sobre una opción del navbar distinta de "Explorar" (por ejemplo Blog o Nosotros) THEN el sistema deja cortado el delineado o borde de la cápsula de "Explorar".

1.7 WHEN se renderizan los chips de filtro superiores en /explorar o el Home (Todos, Recreación, Sol y Playa, Gastronomía, Cultura, Naturaleza, Aventura, Deportes extremos) THEN el sistema los muestra con un contorno fino recortado y sin el vidrio estándar del tema.

1.8 WHEN una imagen o hero se une con el fondo de una sección (por ejemplo el div `p0_50` del Home) THEN el sistema muestra una línea de corte dura visible.

1.9 WHEN se muestra el rail de redes sociales (Instagram, Facebook, TikTok) THEN el sistema lo superpone sobre los botones laterales derechos.

1.10 WHEN se muestran los botones laterales derechos (Promociones, Más vendidos, Ver todos) o el rail de redes sociales THEN el sistema los presenta transparentes, sin sus colores:
- Pestañas laterales: pierden el Dorado de Promociones (`p0_13`), el coral de Más vendidos (`p0_17`) y el Turquesa de Ver todos (`p0_18`).
- Rail de redes: los botones pierden el logotipo oficial y los colores de marca de cada red (Instagram, Facebook y TikTok).

1.11 WHEN se muestran los botones laterales derechos THEN el sistema renderiza su texto en vertical o cortado, y en reposo no se lee.

1.12 WHEN se abre el modal de vitrinas (Promociones o Más vendidos) THEN el sistema muestra 2 tarjetas en una sola fila y deja mucho espacio vacío abajo.

1.13 WHEN el usuario hace clic en una tarjeta de tour desde cualquier vista donde aparezca una tarjeta (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa, estados u otra) THEN el sistema no siempre lo lleva al detalle de ese tour.

1.14 WHEN una tarjeta de tour corresponde a un tour sin cupos disponibles THEN el sistema no tiene un estado Agotado definido: la tarjeta se ve igual que una disponible y no indica que no hay cupos.

### Expected Behavior (Correct)

2.1 WHEN un elemento con vidrio (navbar, sidebar, rail, modal, menú, chip, tarjeta o vitrina) se renderiza en el tema T THEN el sistema SHALL aplicar exactamente el estilo de vidrio de la capa de Figma del tema T: `body-colorido`, `body-claro` o `body-oscuro`. Ese estilo incluye relleno, borde, sombras y efectos, expresado con tokens semánticos.

2.2 WHEN se renderiza una tarjeta de tour en el catálogo, el Home o las vitrinas THEN el sistema SHALL mostrarla con el diseño del componente TourCard de Figma (set `166:104691`, variante Default), como antes de la tarea 12.

2.3 WHEN el usuario pasa el mouse sobre una tarjeta de tour THEN el sistema SHALL aplicar la variante Hover del componente TourCard como estado estándar de hover.

2.4 WHEN una tarjeta de tour se renderiza en cualquier vista (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa o estados) THEN el sistema SHALL aplicar estos estados estándar:
- **Foco con teclado:** mismo aspecto que Hover más un anillo de foco de 2 px (`--semantic-focus`), visible solo con `:focus-visible`.
- **Cargando:** skeleton con la forma real de la tarjeta (bloque de imagen 16:9, líneas de texto y precio) y contenedor con `aria-busy="true"`. Sin spinner.
- **Movimiento reducido:** con `prefers-reduced-motion`, hover y foco sin elevación animada ni transición.
- **Variantes de contenido:** se ven correctas con el vidrio nuevo: "Quedan pocos" (punto dorado), "Disponible", sin descuento (oculta el precio tachado) y con descuento (badge -N %).

2.5 WHEN se abre cualquier pantalla con navbar, incluido el Home THEN el sistema SHALL mostrar el mismo navbar con el vidrio estándar del tema y sin fondo azul sólido detrás de las cápsulas.

2.6 WHEN el usuario pasa el mouse sobre cualquier opción del navbar THEN el sistema SHALL mover la píldora indicadora limpia, sin bordes cortados en ninguna cápsula. Al quitar el mouse, la píldora SHALL volver a la opción activa ("Explorar").

2.7 WHEN se renderizan los chips de filtro superiores THEN el sistema SHALL mostrarlos completos, sin bordes recortados, con el vidrio estándar del tema y un área táctil de al menos 44 px.

2.8 WHEN una imagen o hero se une con el fondo de una sección THEN el sistema SHALL fusionar ambos con un degradado de color, sin línea de corte visible.

2.9 WHEN se muestra el rail de redes sociales THEN el sistema SHALL:
- ubicarlo más abajo, sin superponerse con los botones laterales ni con otros controles;
- mostrarlo dentro de una cápsula de vidrio estándar del tema;
- mostrar en cada botón el logotipo oficial de la red con sus colores de marca, a color completo:
  - Instagram: degradado oficial (amarillo → naranja → magenta → morado) con el logo blanco;
  - Facebook: azul oficial con la "f" blanca;
  - TikTok: fondo negro con el logo de nota musical en sus colores oficiales (cian `#25F4EE` y rojo/rosa `#FE2C55` desplazados sobre blanco);
- dar a cada botón un área táctil de al menos 44 px y un nombre accesible con el nombre de la red;
- enlazar a `instagram.com/borondotours`, `facebook.com/borondotours` y `tiktok.com/@borondotours`.

2.10 WHEN se muestran los botones laterales derechos THEN el sistema SHALL restaurar los colores del export de Figma del Home, con texto e icono en Negro Volcánico (`--semantic-text-on-action`) en los tres (WCAG 2.1 AA):

| Pestaña | Clase | Color | Token |
|---|---|---|---|
| Promociones | `p0_13` | Dorado `#FDB813` | `--semantic-action-cta` |
| Más vendidos | `p0_17` | Coral `#F97066` | `--semantic-status-danger` |
| Ver todos | `p0_18` | Turquesa `#00B7C7` | `--semantic-focus` |

2.11 WHEN los botones laterales derechos están en reposo THEN el sistema SHALL mostrar solo el icono o una pestaña compacta.

2.12 WHEN el usuario pasa el mouse o el foco sobre un botón lateral derecho THEN el sistema SHALL desplegarlo con una animación que muestre su nombre completo en horizontal y legible. Con `prefers-reduced-motion` activo, el despliegue SHALL ocurrir sin animación.

2.13 WHEN se abre el modal de vitrinas THEN el sistema SHALL mostrar una grilla de 2 filas por 2 columnas con 4 tours por página, y las flechas SHALL avanzar o retroceder de 4 en 4.

2.14 WHEN el usuario hace clic en una tarjeta de tour desde cualquier vista donde aparezca (catálogo, vitrinas, Home, relacionados, blog, favoritos, mapa, estados u otra) THEN el sistema SHALL llevarlo siempre al detalle `/tour?tour={slug}`. Nunca SHALL llevarlo directo al checkout, porque en el detalle el viajero elige fecha, viajeros y adicionales.

2.15 WHEN una tarjeta de tour corresponde a un tour sin cupos disponibles THEN el sistema SHALL mostrar el estado Agotado:
- tarjeta atenuada con la etiqueta "Agotado" (texto más icono, no solo color);
- sin botón Reservar, pero la tarjeta SHALL seguir siendo enlace al detalle `/tour?tour={slug}`, donde el viajero puede elegir otra fecha o unirse a la lista de espera (Spec-B RF-B05b);
- la etiqueta SHALL cumplir contraste WCAG 2.1 AA y la atenuación no SHALL bajar el texto de la tarjeta por debajo de AA.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN el usuario inicia o cierra sesión con el auth demo THEN el sistema SHALL CONTINUE TO autenticarlo, mostrar el chrome con sesión (sidebar) y abrir el Auth Gate al pagar, como hoy.

3.2 WHEN el usuario aplica filtros del catálogo (categoría, búsqueda, orden) THEN el sistema SHALL CONTINUE TO filtrar y ordenar las tarjetas con los mismos resultados.

3.3 WHEN el usuario envía el formulario de contacto THEN el sistema SHALL CONTINUE TO validar los campos y enviarlo igual que ahora.

3.4 WHEN el usuario navega el centro legal THEN el sistema SHALL CONTINUE TO mostrar sus documentos y su navegación sin cambios.

3.5 WHEN el usuario cambia de idioma THEN el sistema SHALL CONTINUE TO traducir los textos de la interfaz.

3.6 WHEN se renderiza cualquier pantalla THEN el corrector de contraste (`contrast.ts`) SHALL CONTINUE TO ajustar texto e iconos para cumplir WCAG 2.1 AA.

3.7 WHEN el usuario hace scroll THEN el sistema SHALL CONTINUE TO mantener fijos el navbar, el rail y el FAB (`initFixedChrome`), con el cambio de estado al hacer scroll.

3.8 WHEN el usuario cambia de tema (Colorido, Claro, Oscuro o Sistema) THEN el sistema SHALL CONTINUE TO aplicar el tema elegido con sus tokens semánticos en toda la interfaz.

3.9 WHEN se regenera el markup desde Figma con fig2astro THEN el sistema SHALL CONTINUE TO producir las páginas sin edición manual del markup generado. Los arreglos estáticos SHALL CONTINUE TO vivir en `postprocess.mjs`.

3.10 WHEN el usuario navega con teclado o con lector de pantalla THEN el sistema SHALL CONTINUE TO ofrecer foco visible, áreas táctiles de al menos 44 px y nombres accesibles en navbar, chips, tarjetas, botones laterales y modales.

3.11 WHEN el usuario usa el FAB, el modal de vitrinas o los menús THEN el sistema SHALL CONTINUE TO abrirlos y cerrarlos con Escape, focus trap y retorno de foco.
