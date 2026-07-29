# Requirements Document

## Introduction

Este documento especifica los requisitos del **Frontend del Portal B2C público de BorondoTours** (`apps/web`) para la **Fase 1**. El portal es la web pública de descubrimiento donde los viajeros exploran, buscan y consultan tours de operadores locales en Colombia sin necesidad de autenticarse.

El alcance de Fase 1 cubre cuatro áreas construidas en orden:

1. **Sistema de diseño base** — design tokens CSS, configuración Tailwind CSS 4, fuentes web y componentes UI base (botones con estados, cards, glass surfaces).
2. **Layout base** — navegación (navbar glass) y footer con trust badges de marca.
3. **Landing/Home** — hero con paisaje + overlay, buscador glass superpuesto, secciones de destinos con tarjetas glass, trust badges y footer.
4. **Discovery + Tour Detail** — catálogo con búsqueda, filtros, semáforo de disponibilidad y mapa (Spec-A); detalle de tour con galería, calendario semáforo y add-ons (Spec-B).

La identidad visual canónica es la marca **"Ave azul"** definida en `otros/design/Brand_Guidelines_Borondo_Tours_Completo-v2.md` y sus assets en `otros/design/`. La marca "Chivito" del steering 12 y la paleta azul-noche de Frontend-Architecture §3 quedan **obsoletas** para este proyecto.

El stack técnico es **Astro 5** (output `static`, SSG) con **islands de React 19**, **Tailwind CSS 4**, **nanostores** para estado compartido entre islands, **Mapbox GL JS** para el mapa, **react-day-picker** para el calendario, **i18next** para i18n y **@unpic/react** para imágenes. El scaffold ya existe en `apps/web/`.

Este documento cubre únicamente el **frontend**. Los contratos de datos (endpoints, modelos) provienen de Spec-A y Spec-B; la integración con el backend real se consume vía API. Quedan **fuera de alcance** de Fase 1: checkout, autenticación/Auth Gate, portal privado del cliente, lealtad, chat, reseñas con escritura, scrollytelling GSAP, y el idioma inglés (`en` se prepara pero el contenido de Fase 1 es `es`).

## Glossary

- **Portal_B2C**: La aplicación web pública `apps/web` construida con Astro 5. Sistema raíz del que dependen los demás.
- **Design_System**: Conjunto de design tokens CSS, configuración de Tailwind CSS 4 y fuentes web que definen paleta, tipografía, radios y superficies glass de la marca "Ave azul".
- **UI_Library**: Biblioteca de componentes UI base reutilizables (botones, cards, glass surfaces) construidos como islands o componentes Astro.
- **Button_Component**: Componente de botón de la UI_Library con estados default, hover, focus, disabled y variantes (primario, CTA, secundario).
- **Glass_Surface**: Componente/utilidad de superficie translúcida con `backdrop-filter: blur` usada sobre fotografías (navbar, buscador, tarjetas superpuestas, modales).
- **Base_Layout**: Layout Astro compartido (`Base.astro`) que provee estructura HTML, `<head>`, skip-link, Navbar y Footer.
- **Navbar**: Barra de navegación superior con efecto glass sobre el hero.
- **Footer**: Pie de página con trust badges (promesas de valor de marca) y enlaces.
- **Landing_Page**: Página de inicio (`index.astro`) con hero, buscador glass, secciones de destinos, trust badges y footer.
- **Hero_Section**: Sección superior de la Landing_Page con imagen de paisaje, overlay oscuro y textos de marca.
- **Search_Widget**: Módulo buscador glass superpuesto al hero con campos Destino, Fechas y Viajeros.
- **Discovery_Catalog**: Vista de catálogo de tours con búsqueda, filtros, ordenamiento, grid y toggle lista/mapa (Spec-A).
- **Tour_Card**: Tarjeta que representa un tour en grids y carruseles (foto, nombre, duración, precio, badge de operador).
- **Filter_Panel**: Conjunto de controles de filtrado del catálogo (destino, duración, precio, dificultad, IVA exento).
- **Map_View**: Vista de mapa alternativa del catálogo basada en Mapbox GL JS, island `client:visible`.
- **Tour_Detail**: Página de detalle de un tour (`/tours/:slug`) con galería, información, descripción, add-ons, calendario y tours cercanos (Spec-B).
- **Gallery_Component**: Galería/slider de fotos del hero del Tour_Detail.
- **Availability_Calendar**: Calendario mensual de disponibilidad basado en react-day-picker que aplica el semáforo.
- **Availability_Indicator**: Lógica de semáforo que asigna un estado de color a una fecha según cupos disponibles.
- **I18n_System**: Sistema de internacionalización basado en i18next que resuelve todos los textos vía `t('namespace:key')`.
- **SafeHtml_Renderer**: Componente que sanitiza HTML del backend con DOMPurify antes de renderizarlo.
- **Session_Store**: Store de nanostores en memoria que guarda el estado de sesión, incluido el access token.
- **Image_Component**: Componente de imagen basado en @unpic/react con `srcset` y lazy loading.
- **Skeleton_Loader**: Componente placeholder animado mostrado mientras cargan datos asíncronos.

## Requirements

### Requirement 1: Design Tokens de Marca

**User Story:** Como desarrollador frontend, quiero un conjunto único de design tokens CSS derivados de la marca "Ave azul", para que todos los componentes usen colores, tipografía y radios consistentes sin valores hardcodeados.

#### Acceptance Criteria

1. THE Design_System SHALL definir tokens CSS para la paleta de marca con los valores: Azul Profundo `#103B66`, Azul Cóndor `#2364AA`, Turquesa Laguna `#00B7C7`, Verde Frailejón `#79C142`, Arena `#F3E8D1`, Dorado `#FDB813`, Blanco Niebla `#F9FBFC` y Negro Volcánico `#101010`.
2. THE Design_System SHALL definir el color de fondo principal como Blanco Niebla `#F9FBFC` y el color de texto de párrafos como Negro Volcánico `#101010`.
3. THE Design_System SHALL definir tokens de tipografía que asignen la familia Sora a los niveles H1, H2, H3 y H4, y la familia Inter a body, botones y etiquetas.
4. THE Design_System SHALL definir tokens de tamaño tipográfico con los valores base: H1 `3.5rem`, H2 `2.5rem`, H3 `1.75rem`, H4 `1.25rem`, Body 1 `1rem`, Body 2 `0.875rem`, Botón `1rem` y Etiqueta `0.75rem`.
5. THE Design_System SHALL definir tokens de altura de línea por nivel tipográfico con los valores: H1 112%, H2 120%, H3 128%, H4 132%, Body 160%, Botón 100% y Etiqueta 150%.
6. THE Design_System SHALL definir tokens de escalado tipográfico responsivo aplicando los multiplicadores 0.85 cuando el ancho de viewport es menor a 768px, 0.95 cuando el ancho de viewport está entre 768px y 1024px (ambos inclusive), y 1 cuando el ancho de viewport es mayor a 1024px.
7. THE Design_System SHALL definir dos degradados de marca: Turquesa a Verde (`#00B7C7` a `#79C142`) y Azul Profundo a Turquesa (`#103B66` a `#00B7C7`).
8. THE Design_System SHALL exponer los 8 colores de marca y los tokens de tipografía como utilidades de Tailwind CSS 4 disponibles en el Portal_B2C mediante la configuración del tema, de forma que las utility classes referencien los tokens de marca.
9. WHERE un componente del Portal_B2C requiere un color, THE Design_System SHALL proveer ese color mediante un token de marca en lugar de un literal hexadecimal en el componente.
10. IF un componente referencia un token de diseño no definido, THEN THE Design_System SHALL producir una falla de build indicando el nombre del token faltante.

### Requirement 2: Fuentes Web

**User Story:** Como visitante, quiero que las tipografías de marca carguen de forma fiable y rápida, para que el texto se muestre con la identidad correcta sin bloquear el renderizado.

#### Acceptance Criteria

1. THE Design_System SHALL cargar las familias tipográficas Sora e Inter como fuentes web, cada una con una fuente de respaldo del sistema declarada explícitamente (Sora con respaldo sans-serif del sistema; Inter con respaldo sans-serif del sistema).
2. WHEN una fuente web aún no ha cargado, THE Portal_B2C SHALL mostrar el texto de inmediato con la fuente de respaldo del sistema mediante `font-display: swap`, sin bloquear el renderizado del texto.
3. THE Design_System SHALL cargar únicamente los siguientes pesos: Sora ExtraBold (800), Sora Bold (700), Sora SemiBold (600), Inter Regular (400) e Inter SemiBold (600), y ningún otro peso.
4. IF una fuente web no termina de cargar dentro de 3 segundos desde el inicio de su descarga, THEN THE Portal_B2C SHALL mantener el texto renderizado con la fuente de respaldo del sistema y reemplazarla por la fuente web cuando esta quede disponible.
5. WHEN una fuente web reemplaza a su fuente de respaldo tras cargar, THE Portal_B2C SHALL mantener el desplazamiento acumulado de diseño (Cumulative Layout Shift) por debajo de 0.1.

### Requirement 3: Componente de Botón con Estados

**User Story:** Como visitante, quiero botones con estados visuales claros, para que pueda identificar acciones disponibles y recibir retroalimentación al interactuar.

#### Acceptance Criteria

1. THE Button_Component SHALL proveer una variante primaria con fondo Turquesa Laguna `#00B7C7` y texto blanco en estado default, con un ratio de contraste entre el texto y el fondo de al menos 4.5:1.
2. WHEN el usuario posiciona el puntero sobre la variante primaria, THE Button_Component SHALL cambiar el fondo a Verde Frailejón `#79C142` mediante una transición de duración menor o igual a 300ms.
3. THE Button_Component SHALL proveer una variante CTA con fondo Dorado `#FDB813` y texto Negro Volcánico `#101010`, con un ratio de contraste entre el texto y el fondo de al menos 4.5:1.
4. THE Button_Component SHALL proveer una variante secundaria con fondo transparente, contorno con un ratio de contraste de al menos 3:1 respecto al fondo adyacente y texto oscuro con un ratio de contraste de al menos 4.5:1 respecto al fondo sobre el que se muestra.
5. WHEN el Button_Component recibe foco mediante teclado, THE Button_Component SHALL mostrar un indicador de foco visible con un ratio de contraste de al menos 3:1 respecto al fondo adyacente.
6. WHILE el Button_Component está en estado deshabilitado, THE Button_Component SHALL indicar visualmente la no interactividad con una opacidad menor o igual a 0.5 y exponer `aria-disabled="true"`.
7. IF el usuario intenta activar el Button_Component mientras está en estado deshabilitado, THEN THE Button_Component SHALL bloquear la activación sin ejecutar la acción asociada.
8. THE Button_Component SHALL renderizar su etiqueta de texto mediante el I18n_System.
9. IF la clave de traducción de la etiqueta del Button_Component no está disponible en el I18n_System, THEN THE Button_Component SHALL mostrar la clave solicitada en lugar de un espacio vacío.

### Requirement 4: Componentes Card y Glass Surface

**User Story:** Como visitante, quiero tarjetas legibles y superficies glass sobre fotografías, para que el contenido destaque con la estética de marca manteniendo la legibilidad.

#### Acceptance Criteria

1. THE UI_Library SHALL proveer un componente de tarjeta cuyos valores de radio de borde y espaciado coincidan con los tokens definidos por el Design_System sin desviación.
2. THE Glass_Surface SHALL aplicar un fondo translúcido con `backdrop-filter: blur` y un borde de 1px con una opacidad menor o igual al 30% según los tokens del Design_System.
3. WHERE se usa una Glass_Surface, THE UI_Library SHALL aplicarla únicamente superpuesta a una imagen o fotografía.
4. WHEN una Glass_Surface se superpone a una fotografía, THE Portal_B2C SHALL aplicar un overlay que garantice un ratio de contraste de al menos 4.5:1 entre el texto y el fondo resultante.
5. IF el navegador no soporta `backdrop-filter`, THEN THE Glass_Surface SHALL aplicar un fondo sólido opaco que mantenga un ratio de contraste de al menos 4.5:1 entre el texto y el fondo.
6. THE UI_Library SHALL proveer una variante de Tour_Card que muestre como elementos visibles distintos su foto principal, el nombre del tour, la duración, el precio base y el badge de operador.
7. WHERE la imagen de una Tour_Card es informativa, THE UI_Library SHALL proveer un atributo `alt` no vacío que describa la imagen.
8. WHERE una Tour_Card es interactiva, THE UI_Library SHALL mostrar un indicador de foco visible con un ratio de contraste de al menos 3:1 respecto al fondo adyacente y permitir su activación mediante las teclas Enter y Espacio.

### Requirement 5: Semáforo de Disponibilidad

**User Story:** Como viajero, quiero ver de un vistazo qué fechas tienen cupos disponibles mediante un código de colores consistente, para decidir rápidamente cuándo puedo reservar.

#### Acceptance Criteria

1. THE Availability_Indicator SHALL calcular el porcentaje de disponibilidad de una fecha como cupos_disponibles dividido entre capacidad_total.
2. WHEN el porcentaje de disponibilidad de una fecha es mayor o igual al 50%, THE Availability_Indicator SHALL asignar el estado Verde.
3. WHEN el porcentaje de disponibilidad de una fecha está entre el 1% y el 49% (ambos inclusive), THE Availability_Indicator SHALL asignar el estado Amarillo.
4. WHEN los cupos disponibles de una fecha son igual a cero, THE Availability_Indicator SHALL asignar el estado Rojo.
5. WHEN una fecha no está disponible para el tour o es una fecha pasada, THE Availability_Indicator SHALL asignar el estado Gris.
6. IF la capacidad total de una fecha es cero, desconocida o inválida, THEN THE Availability_Indicator SHALL asignar el estado Gris.
7. THE Availability_Indicator SHALL asignar exactamente un estado a cada fecha evaluada.
8. THE Design_System SHALL definir un token de color distinto para cada uno de los cuatro estados del semáforo (Verde, Amarillo, Rojo, Gris).
9. THE Availability_Indicator SHALL exponer el estado de cada fecha mediante texto accesible además del color, para no depender únicamente del color.

### Requirement 6: Layout Base y Navegación (Navbar)

**User Story:** Como visitante, quiero una barra de navegación consistente en todas las páginas, para orientarme y acceder a las secciones principales del portal.

#### Acceptance Criteria

1. THE Base_Layout SHALL renderizar la Navbar en la parte superior de cada página del Portal_B2C.
2. THE Navbar SHALL mostrar los enlaces de navegación Destinos, Experiencias, Nosotros, Blog y Contacto.
3. THE Navbar SHALL mostrar un botón CTA con fondo Dorado `#FDB813` y la etiqueta "Planifica tu viaje".
4. WHILE la Navbar se muestra superpuesta al Hero_Section, THE Navbar SHALL aplicar el efecto Glass_Surface garantizando un ratio de contraste de al menos 4.5:1 entre el texto de la Navbar y el fondo del hero.
5. WHEN el usuario desplaza la página fuera del Hero_Section, THE Navbar SHALL mostrar un fondo sólido que garantice un ratio de contraste de al menos 4.5:1 entre el texto de la Navbar y el fondo.
6. WHEN el ancho de viewport es mayor o igual a 768px, THE Navbar SHALL mostrar los enlaces de navegación en línea.
7. WHEN el ancho de viewport es menor a 768px, THE Navbar SHALL colapsar los enlaces de navegación en un menú móvil accionado por un botón con `aria-label` y `aria-expanded`, navegable con la tecla Tab, activable con las teclas Enter y Espacio, con indicador de foco visible, y que se cierre con la tecla Escape devolviendo el foco al botón que lo abrió.
8. THE Navbar SHALL renderizar el logotipo horizontal de la marca "Ave azul" con un ancho no menor a 160px y con un atributo `alt` descriptivo.
9. THE Navbar SHALL renderizar todas sus etiquetas de texto mediante el I18n_System.

### Requirement 7: Footer con Trust Badges

**User Story:** Como visitante, quiero un footer con las promesas de valor de la marca, para confiar en el servicio a lo largo del proceso de descubrimiento.

#### Acceptance Criteria

1. THE Footer SHALL mostrar exactamente las cuatro promesas de valor, en el siguiente orden: Turismo Responsable, Experiencias Únicas, Seguridad Garantizada y Atención Personalizada.
2. THE Footer SHALL mostrar, para cada una de las cuatro promesas de valor, un título y un texto descriptivo de apoyo.
3. THE Footer SHALL asociar cada promesa de valor con su icono de línea correspondiente: Turismo Responsable con el icono de Hoja, Experiencias Únicas con el icono de Cámara fotográfica, Seguridad Garantizada con el icono de Escudo, y Atención Personalizada con el icono de Personas/Comunidad.
4. WHEN el Footer se renderiza, THE Footer SHALL obtener todos sus textos mediante el I18n_System en el idioma activo.
5. IF una clave de traducción solicitada al I18n_System no está disponible, THEN THE Footer SHALL renderizar el texto en el idioma por defecto, sin mostrar la clave sin traducir ni dejar el espacio vacío.
6. THE Footer SHALL aparecer en la parte inferior de la Landing_Page, del Discovery_Catalog y del Tour_Detail.

### Requirement 8: Hero de la Landing Page

**User Story:** Como visitante que llega por primera vez, quiero un hero visualmente impactante con el mensaje de marca, para entender la propuesta de BorondoTours en los primeros segundos.

#### Acceptance Criteria

1. THE Hero_Section SHALL mostrar una imagen de paisaje de fondo con un overlay oscuro superpuesto, cubriendo ambos el 100% del ancho del viewport.
2. THE Hero_Section SHALL mostrar el título H1 "Viajes que transforman tu manera de ver el mundo." con la tipografía Sora.
3. THE Hero_Section SHALL mostrar el subtítulo "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza." con la tipografía Sora.
4. WHEN el overlay se aplica sobre la imagen de fondo, THE Hero_Section SHALL garantizar un ratio de contraste de al menos 4.5:1 entre el H1 y el subtítulo del hero y el área de fondo sobre la que se muestran, conforme a WCAG 2.1 AA.
5. THE Image_Component del Hero_Section SHALL cargar la imagen de fondo con `loading="eager"` por estar above the fold.
6. THE Hero_Section SHALL marcar la imagen de fondo como decorativa con `alt=""`.
7. IF la imagen de fondo del Hero_Section no carga, THEN THE Hero_Section SHALL mostrar un fondo oscuro sólido que preserve la legibilidad del texto del hero.
8. WHEN el ancho de viewport es menor a 768px, THE Hero_Section SHALL renderizar su contenido sin recorte de texto ni scroll horizontal.
9. THE Hero_Section SHALL renderizar todos sus textos mediante el I18n_System.

### Requirement 9: Buscador Glass del Hero

**User Story:** Como viajero, quiero un buscador destacado sobre el hero, para iniciar la exploración de tours según destino, fechas y número de viajeros.

#### Acceptance Criteria

1. THE Search_Widget SHALL renderizarse como Glass_Surface superpuesta al Hero_Section.
2. THE Search_Widget SHALL mostrar un campo Destino con el placeholder "¿A dónde quieres ir?" que admita entre 0 y 120 caracteres, un campo Fechas con el placeholder "Fecha de viaje" y un campo Viajeros con valor inicial 1 y un rango permitido entre 1 y 99.
3. THE Search_Widget SHALL mostrar un botón de búsqueda con fondo Dorado `#FDB813` y la etiqueta "Buscar aventura".
4. WHEN el usuario envía la búsqueda con un Destino no vacío, una fecha no pasada y un número de Viajeros dentro del rango 1 a 99, THE Search_Widget SHALL navegar al Discovery_Catalog transfiriendo los criterios ingresados como query params en la URL.
5. IF el usuario envía la búsqueda con el Destino vacío, una fecha pasada o un número de Viajeros fuera del rango 1 a 99, THEN THE Search_Widget SHALL cancelar la navegación, mostrar un mensaje de error asociado al campo correspondiente y preservar los valores ingresados.
6. THE Search_Widget SHALL asociar a cada campo de entrada una etiqueta accesible (`label` o `aria-label`) alcanzable mediante teclado.
7. THE Search_Widget SHALL renderizar todas sus etiquetas y placeholders mediante el I18n_System.

### Requirement 10: Secciones de Destinos y Trust Badges de la Landing

**User Story:** Como visitante, quiero ver destinos destacados y señales de confianza en la home, para descubrir opciones y sentirme seguro antes de explorar el catálogo.

#### Acceptance Criteria

1. THE Landing_Page SHALL mostrar al menos una sección de destinos destacados compuesta por entre 3 y 8 Tour_Cards con fondo glass (translúcido con desenfoque) superpuestas a fotografías.
2. THE Landing_Page SHALL mostrar una sección de trust badges con las 4 promesas de valor de la marca (Turismo Responsable, Experiencias Únicas, Seguridad Garantizada y Atención Personalizada), cada una acompañada de su icono de línea correspondiente.
3. WHEN el usuario selecciona una Tour_Card de destino, THE Landing_Page SHALL navegar al Tour_Detail mediante su URL canónica `/tours/:slug` en un máximo de 1 segundo.
4. WHEN una imagen de una sección below the fold entra dentro de un margen de 200px del borde del viewport visible, THE Landing_Page SHALL cargar dicha imagen de forma diferida.
5. WHILE los datos de las secciones de destinos están cargando, THE Landing_Page SHALL mostrar Skeleton_Loaders en lugar de un spinner genérico.
6. IF la carga de los datos de las secciones de destinos falla, THEN THE Landing_Page SHALL mostrar un mensaje de error indicando que no se pudieron cargar los destinos y ofrecer una acción de reintento, preservando el resto del contenido de la página.

### Requirement 11: Grid del Catálogo (Discovery)

**User Story:** Como viajero, quiero un catálogo de tours en cuadrícula responsiva, para explorar la oferta disponible cómodamente en cualquier dispositivo.

#### Acceptance Criteria

1. WHEN el ancho de viewport es mayor o igual a 1025px, THE Discovery_Catalog SHALL mostrar el grid en 3 columnas.
2. WHEN el ancho de viewport está entre 768px y 1024px (ambos inclusive), THE Discovery_Catalog SHALL mostrar el grid en 2 columnas.
3. WHEN el ancho de viewport es menor o igual a 767px, THE Discovery_Catalog SHALL mostrar el grid en 1 columna.
4. THE Tour_Card SHALL mostrar foto principal con texto alternativo, nombre del tour, duración, precio base y badge de operador.
5. WHILE la primera página del catálogo está cargando, THE Discovery_Catalog SHALL mostrar 12 Skeleton_Loaders de Tour_Card (igual al número de tours por página).
6. IF la búsqueda y filtros no producen resultados, THEN THE Discovery_Catalog SHALL mostrar un estado vacío con un texto que indique la ausencia de resultados y una acción para limpiar los filtros aplicados.
7. IF la petición de datos del catálogo falla, THEN THE Discovery_Catalog SHALL mostrar un estado de error con un texto que indique el fallo de carga y una acción de reintento, conservando los filtros aplicados.
8. THE Discovery_Catalog SHALL paginar el grid en bloques de 12 tours por página.

### Requirement 12: Búsqueda del Catálogo

**User Story:** Como viajero, quiero buscar tours por texto, para encontrar experiencias por nombre, destino, operador o etiquetas.

#### Acceptance Criteria

1. THE Discovery_Catalog SHALL mostrar en la parte superior una barra de búsqueda de texto que admita entre 0 y 100 caracteres y que requiera un mínimo de 2 caracteres para disparar una búsqueda.
2. WHEN el usuario escribe al menos 2 caracteres en la barra de búsqueda, THE Discovery_Catalog SHALL esperar 300ms de inactividad (debounce) y solicitar los tours cuyo nombre, destino, operador o etiquetas coincidan con el texto buscado.
3. WHEN el usuario ejecuta una búsqueda, THE Discovery_Catalog SHALL actualizar la URL con el query param `q` cuyo valor se normalice recortando los espacios inicial y final del texto buscado.
4. WHEN la URL contiene el query param `q` al cargar la página, THE Discovery_Catalog SHALL inicializar la barra de búsqueda y los resultados con ese valor.
5. IF la búsqueda no produce coincidencias, THEN THE Discovery_Catalog SHALL mostrar un estado sin resultados conservando el texto ingresado en la barra de búsqueda.
6. IF la petición de búsqueda falla, THEN THE Discovery_Catalog SHALL mostrar un mensaje de error conservando el último catálogo mostrado.
7. WHEN el usuario limpia la barra de búsqueda, THE Discovery_Catalog SHALL eliminar el query param `q` de la URL.

### Requirement 13: Filtros y Ordenamiento del Catálogo

**User Story:** Como viajero, quiero filtrar y ordenar el catálogo, para acotar la oferta a mis preferencias de destino, duración, precio y dificultad.

#### Acceptance Criteria

1. THE Filter_Panel SHALL ofrecer un filtro por Destino con las regiones Eje Cafetero, Llanos, Amazonia, Costa Caribe, Costa Pacífico, Andes y Bogotá DC, admitiendo la selección de múltiples regiones simultáneamente.
2. THE Filter_Panel SHALL ofrecer un filtro por Duración con las opciones Medio día, 1 día, 2–3 días y Más de 3 días, admitiendo la selección de múltiples opciones simultáneamente.
3. THE Filter_Panel SHALL ofrecer un filtro por Precio mediante un rango con un valor mínimo de 0 COP, un valor máximo de 999.999.999 COP y la restricción de que el valor mínimo sea menor o igual al valor máximo.
4. THE Filter_Panel SHALL ofrecer un filtro por Dificultad con las opciones Familiar, Moderado, Aventurero y Extremo, admitiendo la selección de múltiples opciones simultáneamente.
5. THE Filter_Panel SHALL ofrecer un filtro por "Incluye pasaporte" que acote a tours con exención de IVA disponible.
6. WHEN hay más de un filtro activo, THE Discovery_Catalog SHALL combinar los filtros mediante conjunción lógica (AND).
7. WHEN al menos un filtro está activo, THE Filter_Panel SHALL mostrar un control "Limpiar filtros".
8. WHEN el usuario modifica un filtro o el ordenamiento, THE Discovery_Catalog SHALL reflejar el estado en la URL como query params en un máximo de 500ms.
9. THE Discovery_Catalog SHALL ofrecer un ordenamiento con las opciones Más popular, Precio de menor a mayor, Precio de mayor a menor y Más reciente, con "Más popular" como orden por defecto.
10. WHEN la página del Discovery_Catalog carga con filtros u ordenamiento presentes en la URL, THE Filter_Panel SHALL hidratar sus controles con esos valores.
11. WHEN el usuario activa "Limpiar filtros", THE Discovery_Catalog SHALL remover todos los filtros aplicados, restablecer el ordenamiento por defecto "Más popular" y actualizar la URL en consecuencia.
12. IF los filtros aplicados producen un resultado vacío, THEN THE Discovery_Catalog SHALL mostrar un estado vacío conservando los filtros aplicados y el control "Limpiar filtros".
13. WHILE el ancho de viewport es menor a 768px, THE Filter_Panel SHALL presentarse en un drawer lateral sin colapsar el grid del catálogo.

### Requirement 14: Vista de Mapa del Catálogo

**User Story:** Como viajero, quiero ver los tours en un mapa, para explorar la oferta según su ubicación geográfica.

#### Acceptance Criteria

1. THE Discovery_Catalog SHALL ofrecer un toggle para alternar entre vista Lista y vista Mapa, con la vista Lista como estado por defecto y una indicación visual de la vista activa.
2. WHEN el usuario activa la vista Mapa, THE Map_View SHALL renderizar Mapbox GL JS como island `client:visible` en un máximo de 3 segundos, colocando un marcador por cada tour visible según los filtros activos cuyas coordenadas sean válidas.
3. THE Map_View SHALL centrarse por defecto en Colombia con el centro `[-74.2973, 4.5709]` y zoom 5.
4. WHEN el usuario selecciona un marcador, THE Map_View SHALL mostrar un único popup a la vez con foto, nombre, precio y un enlace "Ver detalle" del tour, cerrando el popup previo al abrir otro o al cerrarse.
5. WHEN el usuario alterna entre la vista Lista y la vista Mapa, THE Discovery_Catalog SHALL conservar los filtros aplicados.
6. IF ningún tour filtrado tiene coordenadas válidas, THEN THE Map_View SHALL mostrar un estado vacío indicando la ausencia de tours con ubicación en el mapa.
7. IF Mapbox GL JS no puede cargarse o inicializarse dentro de 3 segundos, THEN THE Map_View SHALL mostrar un mensaje de respaldo que ofrezca ver la lista de tours conservando los filtros aplicados.
8. THE Map_View SHALL leer el token de Mapbox desde una variable de entorno y no incluir el token directamente en el código fuente.

### Requirement 15: Hero e Información del Tour Detail

**User Story:** Como viajero, quiero ver la galería y la información esencial del tour, para evaluar la experiencia antes de decidir reservar.

#### Acceptance Criteria

1. THE Gallery_Component SHALL mostrar un slider con un mínimo de 1 y un máximo de 20 fotos, con thumbnails y controles de navegación, para la galería principal del Tour_Detail.
2. THE Tour_Detail SHALL mostrar el nombre del tour como un único H1, el destino y la región, la duración en el formato "N días / M noches" o "N horas", y el precio base con el formato "Desde $X COP por persona" usando separador de miles.
3. THE Tour_Detail SHALL mostrar un badge de operador y un badge de dificultad con los colores correspondientes definidos por el Design_System.
4. WHERE el tour tiene `iva_exempt_available` verdadero, THE Tour_Detail SHALL mostrar el indicador "IVA exento disponible".
5. WHEN el ancho de viewport es mayor o igual a 1024px, THE Tour_Detail SHALL mostrar una card lateral pegajosa (sticky) con el precio y un botón "Reservar ahora".
6. WHEN el ancho de viewport es menor a 1024px, THE Tour_Detail SHALL mostrar una barra inferior fija con el precio y un botón "Reservar ahora".
7. WHILE el usuario desplaza la página del Tour_Detail, THE Tour_Detail SHALL mantener visible el elemento pegajoso (card sticky o barra inferior fija) con el precio y el botón de reserva.
8. THE Gallery_Component SHALL proveer un atributo `alt` descriptivo no vacío para cada foto informativa y `alt=""` para las fotos decorativas.
9. IF la galería del tour no contiene fotos, THEN THE Gallery_Component SHALL mostrar una imagen placeholder en lugar del slider.
10. IF una foto de la galería no puede cargarse, THEN THE Gallery_Component SHALL mostrar una imagen de fallback en su lugar.

### Requirement 16: Descripción y Add-ons del Tour

**User Story:** Como viajero, quiero leer la descripción completa y los servicios adicionales, para entender qué incluye el tour y qué puedo agregar.

#### Acceptance Criteria

1. WHEN el viajero abre el detalle de un tour cuya descripción larga no está vacía, THE Tour_Detail SHALL renderizar dicha descripción (hasta 20.000 caracteres) mediante el SafeHtml_Renderer.
2. IF la descripción larga proveniente del backend está vacía o ausente, THEN THE Tour_Detail SHALL omitir el bloque de descripción larga sin mostrar espacio en blanco ni error visible.
3. IF el SafeHtml_Renderer no puede procesar el contenido HTML recibido, THEN THE Tour_Detail SHALL omitir el bloque de descripción larga y mostrar un mensaje que indique que el contenido no está disponible, sin exponer el HTML sin sanitizar.
4. WHEN el tour provee datos para una de las secciones "¿Qué incluye?", "¿Qué NO incluye?" o "¿Qué llevar?", THE Tour_Detail SHALL mostrar únicamente las secciones con datos y omitir individualmente cada sección sin datos.
5. WHERE el tour tiene entre 1 y 50 add-ons configurados, THE Tour_Detail SHALL mostrar cada add-on con su nombre (hasta 100 caracteres), su descripción corta (hasta 300 caracteres) y su precio adicional (valor entre 0,01 y 999.999.999,99).
6. IF el tour no tiene add-ons configurados, THEN THE Tour_Detail SHALL omitir por completo la sección de add-ons.
7. THE SafeHtml_Renderer SHALL permitir únicamente las etiquetas `p`, `strong`, `em`, `ul`, `ol`, `li`, `a`, `br`, `h2`, `h3` y, para la etiqueta `a`, únicamente el atributo `href`, eliminando cualquier otra etiqueta, cualquier otro atributo y todo atributo de evento.

### Requirement 17: Calendario Semáforo del Tour Detail

**User Story:** Como viajero, quiero un calendario que muestre la disponibilidad por fecha con colores, para elegir una fecha con cupos.

#### Acceptance Criteria

1. THE Availability_Calendar SHALL renderizar un calendario mensual usando react-day-picker con los colores del semáforo definidos por el Design_System.
2. THE Availability_Calendar SHALL aplicar a cada fecha exactamente uno de los cuatro estados provistos por el Availability_Indicator.
3. WHEN el Availability_Calendar se renderiza al cargar, THE Availability_Calendar SHALL posicionarse en el primer mes que contenga una fecha en estado Verde o Amarillo.
4. WHEN el usuario selecciona una fecha en estado Verde o Amarillo, THE Availability_Calendar SHALL marcarla como fecha seleccionada, manteniendo un máximo de una fecha seleccionada y reemplazando la fecha previamente seleccionada.
5. IF el usuario intenta seleccionar una fecha en estado Rojo o Gris, THEN THE Availability_Calendar SHALL impedir la selección conservando la fecha previamente seleccionada e indicándolo visualmente.
6. WHILE el ancho de viewport es mayor o igual a 1024px, THE Availability_Calendar SHALL mostrar dos meses simultáneos.
7. WHILE el ancho de viewport es menor a 1024px, THE Availability_Calendar SHALL mostrar un mes.
8. THE Availability_Calendar SHALL proveer para cada fecha un `aria-label` que indique la fecha y el número de cupos disponibles como un entero mayor o igual a cero.
9. WHEN el usuario selecciona una fecha con cupos, THE Tour_Detail SHALL actualizar el precio del CTA con el precio vigente de la instancia seleccionada en un máximo de 1 segundo.
10. IF no se obtiene el precio vigente de la instancia seleccionada, THEN THE Tour_Detail SHALL conservar el precio previo del CTA e indicar el error.

### Requirement 18: Tours Cercanos (Cross-selling)

**User Story:** Como viajero, quiero ver otros tours cercanos al que estoy viendo, para descubrir experiencias relacionadas en la misma zona.

#### Acceptance Criteria

1. WHEN se carga la página de detalle de un tour, THE Tour_Detail SHALL mostrar un carrusel horizontal navegable con un máximo de 6 tours sugeridos ubicados dentro de un radio de 50 km respecto a la ubicación del tour actual, ordenados por distancia ascendente.
2. THE Tour_Detail SHALL excluir el tour actual de la lista de tours sugeridos.
3. IF la carga de tours cercanos falla o no responde dentro de un máximo de 3 segundos, THEN THE Tour_Detail SHALL ocultar la sección de tours cercanos sin interrumpir la carga ni el funcionamiento del resto de la página.
4. WHILE los tours cercanos se están cargando, THE Tour_Detail SHALL mostrar un indicador de carga (skeleton) en el área del carrusel.
5. IF no existe ningún tour dentro del radio de 50 km distinto del tour actual, THEN THE Tour_Detail SHALL ocultar la sección de tours cercanos sin mostrar un carrusel vacío.

### Requirement 19: Internacionalización

**User Story:** Como equipo de producto, quiero que todos los textos pasen por el sistema de i18n, para poder añadir nuevos idiomas sin modificar los componentes.

#### Acceptance Criteria

1. THE Portal_B2C SHALL resolver todo texto orientado al usuario, incluyendo placeholders, atributos `alt` y atributos `aria-label`, mediante el I18n_System usando claves con el patrón `t('namespace:key')`, sin literales de texto embebidos.
2. THE Portal_B2C SHALL usar `es` como idioma por defecto en Fase 1.
3. WHERE un componente JSX de una island muestra texto, THE Portal_B2C SHALL obtener ese texto del I18n_System en lugar de un literal embebido en el JSX.
4. IF una clave de traducción solicitada no existe en el idioma activo, THEN THE I18n_System SHALL resolver el valor de la misma clave en el idioma de respaldo `es`.
5. IF una clave de traducción solicitada no existe ni en el idioma activo ni en el idioma de respaldo `es`, THEN THE I18n_System SHALL renderizar la clave solicitada y registrar un log de desarrollo.
6. WHEN el idioma activo cambia, THE Portal_B2C SHALL resolver los textos en el nuevo idioma mediante el I18n_System sin modificar los componentes.

### Requirement 20: Seguridad Frontend

**User Story:** Como responsable de seguridad, quiero que el frontend maneje tokens y HTML de forma segura, para proteger a los usuarios frente a XSS y robo de credenciales.

#### Acceptance Criteria

1. THE Session_Store SHALL mantener el access token exclusivamente en memoria mediante nanostores, sin escribirlo en ningún mecanismo de almacenamiento persistente del navegador.
2. THE Portal_B2C SHALL no escribir el access token en `localStorage` ni en `sessionStorage`.
3. WHEN el usuario cierra sesión, THE Session_Store SHALL eliminar el access token de la memoria de forma que ninguna solicitud posterior pueda leer su valor.
4. WHEN el documento se recarga o la pestaña se cierra, THE Session_Store SHALL descartar el access token en memoria, quedando sin token disponible hasta una nueva autenticación.
5. THE Portal_B2C SHALL renderizar todo HTML proveniente del backend exclusivamente mediante el SafeHtml_Renderer.
6. WHEN el SafeHtml_Renderer inserta contenido del backend en el DOM, THE SafeHtml_Renderer SHALL eliminar los elementos `script`, `iframe`, `form`, `input` y `style`, así como todo atributo cuyo nombre comience por `on`, antes de que el contenido se agregue al DOM.
7. IF el SafeHtml_Renderer recibe contenido que no puede sanitizar, THEN THE SafeHtml_Renderer SHALL renderizar contenido vacío sin insertar ni ejecutar el contenido original en el DOM.

### Requirement 21: Performance

**User Story:** Como viajero en una conexión limitada, quiero que las páginas carguen rápido y de forma progresiva, para explorar el portal sin esperas frustrantes.

#### Acceptance Criteria

1. WHEN una imagen ubicada por debajo del pliegue entra dentro de un margen de 200px del borde del viewport durante el scroll, THE Portal_B2C SHALL cargar dicha imagen de forma diferida (lazy loading).
2. WHILE una vista espera datos asíncronos, THE Portal_B2C SHALL mostrar Skeleton_Loaders en lugar de spinners genéricos.
3. IF una vista no recibe sus datos asíncronos dentro de 10 segundos, THEN THE Portal_B2C SHALL mostrar un mensaje de error con una acción de reintento, evitando el desplazamiento de diseño (layout shift).
4. THE Image_Component SHALL servir imágenes con `srcset` en los anchos 400w, 800w y 1200w mediante @unpic/react, seleccionando la resolución según el ancho del contenedor.
5. IF una imagen no puede cargarse, THEN THE Image_Component SHALL mostrar una imagen placeholder con su atributo `alt` sin bloquear el renderizado del resto de la vista.
6. WHEN el Discovery_Catalog consulta el catálogo, THE Portal_B2C SHALL configurar la caché de datos del catálogo con un `staleTime` de 300 segundos, sin volver a solicitar los datos durante ese intervalo.
7. THE Portal_B2C SHALL dividir el código por ruta (code splitting) de modo que cada página cargue únicamente los islands que utiliza.

### Requirement 22: Accesibilidad (WCAG 2.1 AA)

**User Story:** Como usuario que navega con teclado o lector de pantalla, quiero que el portal sea accesible, para poder descubrir y consultar tours sin barreras.

#### Acceptance Criteria

1. THE Base_Layout SHALL incluir un enlace "Saltar al contenido principal" como primer elemento de tabulación de cada página, oculto visualmente hasta recibir foco y visible al recibirlo, que al activarse mueva el foco al contenido principal.
2. THE Portal_B2C SHALL garantizar un ratio de contraste de al menos 4.5:1 entre el texto normal y su fondo, de al menos 3:1 entre el texto grande y su fondo, y de al menos 3:1 entre los componentes de interfaz e indicadores de estado y su fondo adyacente, entendiéndose por texto grande el de tamaño igual o mayor a 18pt, o igual o mayor a 14pt en negrita.
3. THE Portal_B2C SHALL mostrar un indicador de foco visible con un ratio de contraste de al menos 3:1 respecto al fondo adyacente en cada elemento enfocable, conforme a WCAG 2.4.7.
4. THE Portal_B2C SHALL asociar una etiqueta accesible (`label` o `aria-label`) a cada control de entrada.
5. THE Portal_B2C SHALL proveer texto alternativo en todas las imágenes de contenido y `alt=""` en las imágenes decorativas.
6. WHEN el usuario navega con teclado, THE Portal_B2C SHALL permitir alcanzar y operar todos los controles interactivos mediante Tab para avanzar al siguiente control, Shift+Tab para retroceder al control anterior, Enter para activar el control enfocado y Escape para cerrar o cancelar.
7. WHEN un componente modal está abierto, THE Portal_B2C SHALL atrapar el foco dentro del modal (focus trap) y cerrarlo con la tecla Escape.
8. WHEN un componente modal se cierra, THE Portal_B2C SHALL retornar el foco al elemento que abrió el modal.
9. IF un control de entrada recibe un valor inválido, THEN THE Portal_B2C SHALL mostrar un mensaje textual de error asociado programáticamente al control y preservar el valor ingresado.
10. THE Portal_B2C SHALL no transmitir información basándose únicamente en el color, proveyendo también texto o iconografía equivalente.
