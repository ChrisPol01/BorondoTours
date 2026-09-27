# Requirements Document

## Introduction

Este documento especifica el rediseño visual y de experiencia pixel-perfect del portal B2C de BorondoTours (`apps/web`) a partir de las 15 láminas PNG de `otros/design/b2c`. El trabajo se ejecutará mockup por mockup en el orden jerárquico descubierto, sin implementar código durante esta fase. El objetivo es reproducir con fidelidad verificable las composiciones desktop y mobile, consolidar patrones reutilizables y aplicar la identidad de marca de BorondoTours (isotipo colibrí barbudo del páramo, _Oxypogon guerinii_) sin alterar contratos, cálculos, estados, validaciones, seguridad ni reglas de negocio ya aprobadas.

Las fuentes se reconcilian con esta precedencia: (1) requisitos funcionales vigentes y reglas de negocio aprobadas para comportamiento; (2) manual y steering de marca de BorondoTours (colibrí barbudo del páramo, _Oxypogon guerinii_) para identidad; (3) mockup correspondiente para composición visual; (4) este documento para alcance y aceptación del rediseño; (5) implementación existente para reutilización. Una diferencia visual del mockup no autoriza una nueva regla de negocio, endpoint, tratamiento de datos personales ni capacidad de backend. Las capacidades del inventario MVP que todavía no tengan contrato aprobado se representan únicamente como `Visual_Only_State` hasta recibir `Product_Approval`.

El alcance conserva el stack aprobado de Astro SSG, React 19 islands y Tailwind CSS 4, e incluye accesibilidad WCAG 2.1 AA, responsive design, internacionalización preparada para locales aprobados, SEO técnico, datos estructurados, Core Web Vitals y regresión visual automatizada. Este documento crea únicamente requisitos; el diseño técnico y el plan de tareas pertenecen a fases posteriores.

## Inventario visual y orden obligatorio

| Orden | Archivo | Dimensiones | Contenido detectado |
|---:|---|---:|---|
| 1 | `1-Inicio de pagina web.png` | 1536×1024 | Home desktop 1440, home mobile 375 y paneles de sistema visual |
| 2 | `2-Catalogo pagina web.png` | 1536×1024 | Catálogo desktop/mobile, búsqueda, filtros, orden y lista/mapa |
| 3 | `2-1-Reserva de tour seleccionado pagina web.png` | 1536×1024 | Tour seleccionado desktop/mobile, calendario, precio y add-ons |
| 4 | `3-Seleccion de destinos pagina web.png` | 1536×1024 | Destinos desktop/mobile y CTA de recomendación |
| 5 | `4-Experiencias pagina web.png` | 1536×1024 | Familias de experiencias desktop/mobile |
| 6 | `5-Blog pagina web.png` | 1536×1024 | Blog desktop/mobile, búsqueda, categorías y newsletter |
| 7 | `6-Nosotros y contacto pagina web.png` | 1536×1024 | Nosotros, valores, equipo, contacto, mapa y formulario |
| 8 | `20-Panel usuario pagina web.png` | 1536×1024 | Dashboard autenticado, próximo tour, nivel, Coins y actividad |
| 9 | `21-Mis tours usuario pagina web.png` | 1122×1402 | Tours próximos, en curso y completados |
| 10 | `21-1-Detalle de reserva de tour usuario pagina web.png` | 1024×1536 | Detalle, itinerario, viajeros, pagos, guía, mapa y cancelación |
| 11 | `21-2-Proceso de reservas usuario pagina web.png` | 1024×1536 | Wizard de pasajeros, extras, resumen, Coins, pago y confirmación |
| 12 | `22-Perfil usuario pagina web.png` | 1024×1536 | Perfil, preferencias, datos sensibles, documentos y seguridad |
| 13 | `23-Borondo Coins usuario pagina web.png` | 1536×1024 | Wallet, niveles, historial y formas de ganar Coins |
| 14 | `24-Tours favoritos usuario pagina web.png` | 1402×1122 | Favoritos, colecciones, disponibilidad y reserva |
| 15 | `25-Mensajes usuarios pagina web.png` | 1536×1024 | Bandeja, conversación, contexto de reserva y adjuntos |

## Glossary

- **Redesign_Project**: Feature `b2c-pixel-perfect-redesign` que coordina el rediseño secuencial.
- **Portal_B2C**: Aplicación Astro ubicada en `apps/web`, con páginas públicas y área privada del viajero.
- **Functional_Baseline**: Comportamientos, contratos, validaciones, cálculos, estados, permisos y mensajes aprobados por `frontend-b2c-portal`, el inventario MVP y las reglas de negocio vigentes.
- **Behavioral_Regression_Matrix**: Matriz de trazabilidad que relaciona cada comportamiento del Functional_Baseline con la ruta, acción, resultado y prueba de no regresión del rediseño.
- **Canonical_URL**: URL absoluta preferida para indexación de una página pública.
- **Public_Route**: Ruta del Portal_B2C accesible sin autenticación y elegible para indexación.
- **Private_Route**: Ruta del Portal_B2C que requiere sesión de cliente y queda excluida de indexación.
- **SEO_Metadata**: Título, descripción, Canonical_URL, directivas de indexación y metadatos sociales de una página.
- **Sitemap**: Archivo XML que enumera las Public_Routes canónicas habilitadas para indexación.
- **Structured_Data**: Metadatos JSON-LD schema.org válidos que describen organización, sitio, navegación, tours y ofertas sin inventar datos.
- **Enabled_Locale**: Idioma aprobado y provisto con catálogo completo de traducciones para exposición al usuario.
- **Performance_Profile**: Medición reproducible en viewport móvil de 375×812 CSS px, red 4G simulada, CPU ralentizada 4×, caché fría y build de producción.
- **Mockup_Inventory**: Las 15 láminas de la tabla anterior en el orden indicado.
- **Mockup**: Una lámina PNG individual usada como fuente visual de verdad para una etapa.
- **Visual_Baseline**: Captura de referencia derivada del Mockup para comparar una ruta en un viewport fijo.
- **Design_System**: Tokens, tipografía, espaciado, iconografía, radios, sombras, degradados y superficies de la marca de BorondoTours (isotipo colibrí barbudo del páramo, _Oxypogon guerinii_).
- **Ave_Azul_Tokens**: Identificador técnico de la paleta oficial de la marca (isotipo colibrí barbudo del páramo, _Oxypogon guerinii_). Colores: Azul Profundo `#103B66`, Azul Cóndor `#2364AA`, Turquesa Laguna `#00B7C7`, Verde Frailejón `#79C142`, Arena `#F3E8D1`, Dorado `#FDB813`, Blanco Niebla `#F9FBFC` y Negro Volcánico `#101010`. _(El nombre del token se conserva por estabilidad de referencias en criterios y tests; no implica que el ave se llame "ave azul".)_
- **Liquid_Glass_Surface**: Superficie translúcida del mockup con desenfoque, borde luminoso sutil y separación de capas.
- **Rendering_Architecture**: Astro SSG con HTML estático y React islands únicamente para estado o interacción.
- **React_Island**: Componente React hidratado en navegador mediante una directiva Astro.
- **Minimum_Hydration_Directive**: Directiva menos urgente que permite cumplir el comportamiento: `client:load`, `client:idle` o `client:visible`.
- **Island_Registry**: Inventario normativo de elementos interactivos y directivas mínimas definido en Requirement 5.
- **Static_Region**: Contenido sin estado de cliente que se renderiza como componente o página Astro sin JavaScript hidratado.
- **Header**: Navbar fija/global, navegación desktop, drawer mobile y controles de cuenta.
- **Canonical_TourCard**: Diseño moderno de tarjeta de tour originado en el home y compartido por home, catálogo, recomendaciones y favoritos.
- **Catalog_Controller**: React island que controla búsqueda, filtros, orden, paginación y sincronización con URL.
- **Booking_Calendar_Island**: React island aislada del Mockup 2-1 que controla fecha, cupos, precio vigente y selección de reserva.
- **Booking_Wizard_Island**: React island del proceso de reserva que controla pasos, pasajeros, add-ons, Coins, método de pago y resumen.
- **Account_Shell_Island**: React island que valida la sesión, carga datos privados y coordina navegación del área autenticada.
- **Lifecycle_View**: Clasificación visual de tours en Próximos, En curso y Completados.
- **SafeHtml_Renderer**: Único componente autorizado para sanitizar y renderizar HTML procedente del backend.
- **I18n_System**: Sistema i18next que resuelve texto, labels, placeholders, `alt` y nombres accesibles.
- **Evaluation_Inventory**: Lista de capacidades visibles en mockups cuyo backend, negocio o fase requiere aprobación explícita.
- **Visual_Only_State**: Representación fiel con datos de fixture y controles sin efecto de negocio irreversible.
- **Product_Approval**: Decisión registrada que autoriza implementar backend o reglas de negocio para un elemento del Evaluation_Inventory.
- **Reduced_Motion_Mode**: Preferencia `prefers-reduced-motion: reduce` que elimina movimiento no esencial.
- **Visual_Regression_Suite**: Pruebas Playwright de capturas a 375×812 y 1440×900 en Chromium controlado.
- **Interactive_Element**: Control con estado o conducta, incluidos búsqueda, filtros, drawers, galerías, calendarios, widgets de reserva, mapas, autenticación y perfil.

## Requirements

### Requirement 1: Fuente visual y ejecución secuencial

**User Story:** Como responsable de producto, quiero implementar una lámina a la vez en el orden acordado, para maximizar la fidelidad y evitar inconsistencias acumuladas.

#### Acceptance Criteria

1. THE Redesign_Project SHALL procesar el Mockup_Inventory en el orden 1, 2, 2-1, 3, 4, 5, 6, 20, 21, 21-1, 21-2, 22, 23, 24 y 25.
2. WHEN comienza una etapa, THE Redesign_Project SHALL limitar los cambios visuales de la etapa al Mockup correspondiente y a componentes compartidos requeridos por el Mockup correspondiente.
3. WHEN una etapa termina, THE Redesign_Project SHALL registrar la ruta, los componentes reutilizados, los componentes modificados y las diferencias aprobadas respecto al Visual_Baseline.
4. IF una etapa no cumple sus criterios visuales, THEN THE Redesign_Project SHALL conservar la etapa siguiente como no iniciada.
5. IF un Mockup contradice una regla funcional aprobada, THEN THE Redesign_Project SHALL conservar la regla funcional aprobada y registrar la contradicción en el Evaluation_Inventory.
6. WHEN una decisión visual de una etapa modifica un componente compartido, THE Redesign_Project SHALL verificar las etapas anteriores mediante la Visual_Regression_Suite.

### Requirement 2: Análisis visual y sistema de diseño

**User Story:** Como diseñador, quiero que cada detalle visible se traduzca a tokens y patrones reutilizables, para mantener fidelidad sin acumular valores arbitrarios.

#### Acceptance Criteria

1. THE Design_System SHALL usar Sora para H1–H4 y subtítulos e Inter para cuerpo, botones y etiquetas.
2. THE Design_System SHALL mapear los colores visibles de los Mockups a Ave_Azul_Tokens o a tokens derivados con nombre semántico.
3. IF un color visible no corresponde a un Ave_Azul_Token, THEN THE Design_System SHALL documentar el token derivado, la lámina de origen y el uso permitido.
4. THE Design_System SHALL definir tokens de espaciado, ancho de contenedor, radios, bordes, sombras, desenfoque y opacidad medidos desde los Mockups.
5. THE Design_System SHALL representar los degradados de marca mediante tokens que comiencen y terminen en colores de Ave_Azul_Tokens.
6. WHERE un Mockup muestra Liquid_Glass_Surface, THE Design_System SHALL reproducir transparencia, desenfoque, borde, brillo y profundidad mediante tokens reutilizables.
7. IF `backdrop-filter` no está disponible, THEN THE Design_System SHALL sustituir Liquid_Glass_Surface por una superficie opaca con contraste WCAG 2.1 AA.
8. THE Design_System SHALL usar iconografía minimalista de línea redondeada con trazo visual de 2px.
9. THE Design_System SHALL conservar el área de respeto y las proporciones del logotipo horizontal de la marca BorondoTours.
10. THE Design_System SHALL exponer los tokens mediante Tailwind CSS 4 sin literales visuales duplicados en componentes.
11. WHEN los paneles de sistema visual del Mockup 1 difieren de la guía de marca BorondoTours, THE Design_System SHALL usar la guía de marca BorondoTours y registrar la diferencia visual.

### Requirement 3: Fidelidad responsive y geometría

**User Story:** Como visitante, quiero una interfaz coherente con los mockups en desktop y mobile, para recibir la misma jerarquía y calidad visual en cualquier dispositivo.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir la jerarquía, alineación, tamaño relativo, ritmo vertical, densidad, capas y recorte de imagen del Mockup correspondiente.
2. WHEN el viewport mide 1440px de ancho, THE Portal_B2C SHALL mantener cada ancla visual principal dentro de 2px de su posición aprobada en el Visual_Baseline.
3. WHEN el viewport mide 375px de ancho, THE Portal_B2C SHALL mantener cada ancla visual principal dentro de 2px de su posición aprobada en el Visual_Baseline.
4. WHEN el viewport se encuentra entre 375px y 1440px, THE Portal_B2C SHALL adaptar el layout sin scroll horizontal, texto cortado, controles ocultos ni superposición no mostrada en el Mockup.
5. WHEN el contenido traducido ocupa más ancho que el texto español de referencia, THE Portal_B2C SHALL ajustar el flujo sin superponer controles.
6. IF una lámina no muestra una variante responsive, THEN THE Portal_B2C SHALL derivar la variante mobile con los patrones responsive consolidados de los Mockups 1–6.
7. THE Portal_B2C SHALL preservar áreas táctiles de al menos 44×44 CSS px para controles móviles.

### Requirement 4: Arquitectura estática y reutilización

**User Story:** Como equipo técnico, quiero conservar Astro SSG y reutilizar componentes compatibles, para desplegar estáticamente con el mínimo JavaScript.

#### Acceptance Criteria

1. THE Rendering_Architecture SHALL generar las rutas públicas como HTML estático mediante Astro SSG.
2. THE Rendering_Architecture SHALL generar shells estáticos para rutas autenticadas y cargar datos privados mediante API después de validar la sesión en cliente.
3. THE Portal_B2C SHALL producir un artefacto estático desplegable en S3 y CloudFront sin dependencia de SSR en tiempo de ejecución.
4. WHERE un componente existente coincide visual y semánticamente con el Mockup, THE Portal_B2C SHALL reutilizar el componente existente.
5. IF un componente existente difiere del patrón canónico, THEN THE Portal_B2C SHALL adaptar el componente compartido antes de crear una variante específica.
6. THE Rendering_Architecture SHALL mantener cada Static_Region fuera de React.
7. WHERE un Interactive_Element requiere estado de cliente, THE Rendering_Architecture SHALL encapsular el estado en la React_Island de menor alcance que cubra la interacción.
8. THE Portal_B2C SHALL usar TypeScript estricto sin `any` nuevo.
9. THE Portal_B2C SHALL conservar Tailwind CSS 4 como mecanismo de estilos de componentes.
10. WHERE una interacción requiere hidratación, THE Rendering_Architecture SHALL usar React 19 mediante una React_Island.
11. WHERE una React_Island consulta datos remotos, THE Portal_B2C SHALL conservar TanStack Query como gestor de estado de servidor.
12. WHERE varias React_Islands comparten estado, THE Portal_B2C SHALL conservar Nanostores como mecanismo de estado compartido.

### Requirement 5: Registro de islands e hidratación mínima

**User Story:** Como responsable de rendimiento, quiero hidratar únicamente controles interactivos, para evitar enviar JavaScript a contenido estático.

#### Acceptance Criteria

1. THE Island_Registry SHALL asignar `client:idle` al Header, al buscador del home y al Auth Gate.
2. THE Island_Registry SHALL asignar `client:load` al Catalog_Controller, al Account_Shell_Island, a Lifecycle_View, al Booking_Wizard_Island, a los controles de perfil, al historial filtrable de Coins, a favoritos mutables y a mensajería.
3. THE Island_Registry SHALL asignar `client:visible` a galerías, Booking_Calendar_Island, mapas, carruseles con controles, formularios públicos con estado local y widgets interactivos below-the-fold.
4. THE Island_Registry SHALL mantener hero estático, copy, breadcrumbs, información de tour, tarjetas sin mutación, destinos, experiencias, artículos, valores, equipo y footer como Static_Region.
5. WHEN un mapa no está visible, THE Portal_B2C SHALL diferir la descarga de la librería de mapas.
6. WHEN una galería no está visible, THE Portal_B2C SHALL diferir la hidratación de los controles de galería.
7. IF un Interactive_Element funciona mediante navegación HTML o envío nativo sin estado local, THEN THE Island_Registry SHALL mantener el Interactive_Element como Static_Region.
8. WHEN una nueva React_Island se incorpora, THE Island_Registry SHALL registrar nombre, ruta, estado poseído, directiva y justificación.
9. IF una React_Island contiene contenido estático separable, THEN THE Rendering_Architecture SHALL mover el contenido estático separable a Astro.

### Requirement 6: Header sin solapamientos

**User Story:** Como visitante, quiero usar navegación, inputs y botones sin que el header los tape, para operar todas las páginas en cualquier breakpoint.

#### Acceptance Criteria

1. THE Header SHALL reservar una zona de layout equivalente a la altura visible del Header en páginas sin hero superpuesto.
2. WHILE el Header se superpone a un hero, THE Header SHALL mantener fuera de la zona ocupada del Header todos los inputs, botones y textos interactivos del hero.
3. WHEN el viewport cambia de ancho, THE Header SHALL recalcular la composición sin cubrir inputs, botones, breadcrumbs, títulos ni controles de cuenta.
4. WHEN el viewport mide 375px de ancho, THE Header SHALL mostrar navegación mobile sin colisión entre logotipo, menú, cuenta y CTA.
5. WHEN el viewport mide 1440px de ancho, THE Header SHALL mostrar navegación desktop sin colisión entre enlaces, cuenta y CTA.
6. WHEN el drawer mobile abre, THE Header SHALL atrapar el foco dentro del drawer.
7. WHEN el drawer mobile cierra, THE Header SHALL devolver el foco al control que abrió el drawer.
8. IF el contenido del Header excede el ancho disponible, THEN THE Header SHALL cambiar al patrón mobile antes de producir solapamiento.

### Requirement 7: Canonical TourCard

**User Story:** Como viajero, quiero reconocer el mismo tour en todos los contextos, para comparar opciones sin reaprender la tarjeta.

#### Acceptance Criteria

1. THE Canonical_TourCard SHALL adoptar el diseño moderno mostrado en el home del Mockup 1.
2. THE Portal_B2C SHALL usar Canonical_TourCard en home, catálogo, recomendaciones, tours cercanos y favoritos.
3. THE Canonical_TourCard SHALL mostrar la misma jerarquía de imagen, ubicación, nombre, duración, precio, rating, disponibilidad y acción cuando los datos correspondientes existan.
4. IF un contexto no provee un dato opcional, THEN THE Canonical_TourCard SHALL omitir el elemento opcional sin reservar un espacio vacío.
5. WHERE un contexto requiere una acción adicional, THE Canonical_TourCard SHALL usar un slot o variante del componente compartido.
6. THE Portal_B2C SHALL eliminar la necesidad de una tarjeta inferior específica del catálogo.
7. WHEN Canonical_TourCard recibe foco, THE Canonical_TourCard SHALL mostrar foco visible y permitir activación con teclado.

### Requirement 8: Mockup 1 — Home

**User Story:** Como visitante, quiero entender la propuesta y explorar tours desde la portada, para iniciar una búsqueda con confianza.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir el hero, mensaje, buscador, destinos destacados, trust badges y footer del Mockup 1.
2. THE Portal_B2C SHALL reproducir las composiciones desktop 1440 y mobile 375 incluidas en el Mockup 1.
3. WHEN el visitante envía destino, fecha y viajeros válidos, THE Portal_B2C SHALL navegar al catálogo con criterios serializados en la URL.
4. IF un criterio de búsqueda es inválido, THEN THE Portal_B2C SHALL conservar los valores y mostrar un error asociado al campo.
5. WHEN el visitante activa “Ver todos”, THE Portal_B2C SHALL navegar al catálogo.
6. WHEN el visitante activa “Planifica tu viaje”, THE Portal_B2C SHALL abrir la experiencia de planificación definida o el Visual_Only_State identificado en el Evaluation_Inventory.
7. THE Portal_B2C SHALL cargar el hero como contenido estático prioritario sin depender de React.

### Requirement 9: Mockup 2 — Catálogo

**User Story:** Como viajero, quiero buscar, filtrar y comparar tours en una vista fiel al catálogo, para encontrar una opción adecuada.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir búsqueda, conteo, filtros, chips activos, orden, toggle lista/mapa, paginación y grid del Mockup 2.
2. THE Catalog_Controller SHALL usar la URL como fuente de verdad de búsqueda, filtros, orden, página y vista.
3. WHEN el visitante modifica búsqueda, filtros, orden, página o vista, THE Catalog_Controller SHALL actualizar la URL en un máximo de 500ms.
4. WHEN la URL contiene estado de catálogo, THE Catalog_Controller SHALL restaurar los controles y resultados desde la URL.
5. WHILE el viewport mide menos de 768px, THE Catalog_Controller SHALL presentar filtros en un drawer con focus trap.
6. WHEN la vista mapa se activa, THE Portal_B2C SHALL mostrar marcadores correspondientes a los tours filtrados con coordenadas válidas.
7. IF el mapa no puede inicializarse, THEN THE Portal_B2C SHALL ofrecer la vista lista conservando filtros.
8. THE Catalog_Controller SHALL renderizar Canonical_TourCard sin una variante visual inferior específica del catálogo.
9. IF la consulta no produce resultados, THEN THE Catalog_Controller SHALL mostrar un estado vacío con acción para limpiar filtros.
10. IF la consulta falla, THEN THE Catalog_Controller SHALL conservar el último estado válido y ofrecer reintento.
11. THE Catalog_Controller SHALL parsear los query params `q`, `regions`, `durations`, `priceMin`, `priceMax`, `difficulties`, `passportOnly`, `sort`, `page` y `view` a un estado de catálogo válido.
12. THE Catalog_Controller SHALL serializar un estado de catálogo válido a query params canónicos ordenados de forma determinista.
13. WHEN un estado de catálogo canónico se serializa y se vuelve a parsear, THE Catalog_Controller SHALL producir un estado equivalente al estado original.

### Requirement 10: Mockup 2-1 — Tour seleccionado y calendario de reserva

**User Story:** Como viajero, quiero revisar un tour y seleccionar una fecha con precio vigente, para iniciar la reserva con información clara.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir galería, breadcrumbs, datos del tour, descripción, incluidos, no incluidos, recomendaciones, add-ons, calendario, precio, CTA y tours cercanos del Mockup 2-1.
2. THE Portal_B2C SHALL renderizar breadcrumbs, texto, listas, precio base y contenido de tarjetas cercanas mediante Astro.
3. THE Booking_Calendar_Island SHALL poseer exclusivamente el mes visible, la fecha seleccionada, la disponibilidad, el precio de instancia y los mensajes de selección.
4. THE Booking_Calendar_Island SHALL usar `client:visible` como Minimum_Hydration_Directive.
5. WHEN una fecha disponible se selecciona, THE Booking_Calendar_Island SHALL reemplazar la selección anterior por la nueva fecha.
6. WHEN una fecha disponible se selecciona, THE Booking_Calendar_Island SHALL actualizar el precio mostrado con el precio vigente de la instancia en un máximo de 1 segundo.
7. IF una fecha agotada, pasada o no ofrecida se activa, THEN THE Booking_Calendar_Island SHALL conservar la selección anterior y anunciar el motivo.
8. IF el precio vigente no está disponible, THEN THE Booking_Calendar_Island SHALL conservar el último precio válido y anunciar el error.
9. THE Booking_Calendar_Island SHALL exponer disponibilidad mediante texto accesible además del color.
10. WHEN el viewport mide al menos 1024px de ancho, THE Booking_Calendar_Island SHALL mostrar dos meses simultáneos.
11. WHEN el viewport mide menos de 1024px de ancho, THE Booking_Calendar_Island SHALL mostrar un mes.
12. WHEN el viajero activa “Reservar ahora” con fecha seleccionada, THE Portal_B2C SHALL preservar tour, instancia, fecha y precio para el Auth Gate o Booking_Wizard_Island.
13. IF el viajero activa “Reservar ahora” sin fecha seleccionada, THEN THE Booking_Calendar_Island SHALL solicitar una fecha sin iniciar navegación.
14. WHERE una descripción procede del backend, THE Portal_B2C SHALL renderizar la descripción mediante SafeHtml_Renderer.

### Requirement 11: Mockup 3 — Destinos

**User Story:** Como viajero, quiero explorar Colombia por región, para descubrir tours según el lugar que quiero visitar.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir hero, métricas, mosaico regional, cantidades de tours, CTA de recomendación y footer del Mockup 3.
2. WHEN el visitante activa una región, THE Portal_B2C SHALL navegar al catálogo con la región serializada en la URL.
3. IF una región no tiene tours publicados, THEN THE Portal_B2C SHALL mostrar la región con estado vacío sin inventar disponibilidad.
4. WHEN el visitante activa el CTA de recomendación, THE Portal_B2C SHALL abrir la experiencia aprobada o el Visual_Only_State identificado en el Evaluation_Inventory.
5. THE Portal_B2C SHALL renderizar el mosaico regional como Static_Region cuando las acciones sean enlaces nativos.

### Requirement 12: Mockup 4 — Experiencias

**User Story:** Como viajero, quiero explorar tours por tipo de experiencia, para encontrar actividades acordes con mis intereses.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir las categorías Trekking, Avistamiento, Cultural, Gastronomía y Aventura Extrema del Mockup 4.
2. WHEN el visitante activa una categoría, THE Portal_B2C SHALL navegar al catálogo con la categoría serializada en la URL.
3. THE Portal_B2C SHALL reproducir las métricas y promesas de confianza mostradas en el Mockup 4.
4. THE Portal_B2C SHALL renderizar las categorías como Static_Region cuando las acciones sean enlaces nativos.
5. IF una categoría carece de resultados, THEN THE Portal_B2C SHALL mostrar el estado vacío del catálogo conservando la categoría activa.

### Requirement 13: Mockup 5 — Blog

**User Story:** Como visitante, quiero descubrir historias y consejos de viaje, para inspirar y preparar futuras experiencias.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir hero, artículo destacado, búsqueda, categorías, orden, grid, artículos populares y newsletter del Mockup 5.
2. WHEN el visitante busca artículos, THE Portal_B2C SHALL reflejar el término de búsqueda en la URL.
3. WHEN el visitante selecciona categoría u orden, THE Portal_B2C SHALL reflejar la selección en la URL.
4. THE Portal_B2C SHALL generar páginas de artículo publicables mediante Astro SSG.
5. WHERE el artículo contiene HTML procedente de un CMS o backend, THE Portal_B2C SHALL renderizar el HTML mediante SafeHtml_Renderer.
6. IF la suscripción al newsletter carece de backend aprobado, THEN THE Portal_B2C SHALL mantener el formulario en Visual_Only_State y registrarlo en el Evaluation_Inventory.
7. IF no existen artículos para los criterios activos, THEN THE Portal_B2C SHALL mostrar un estado vacío conservando los criterios.

### Requirement 14: Mockup 6 — Nosotros y contacto

**User Story:** Como visitante, quiero conocer la empresa y contactarla, para confiar en BorondoTours y solicitar ayuda.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir historia, métricas, valores, equipo, datos de contacto, horarios, mapa, formulario y CTA de WhatsApp del Mockup 6.
2. WHEN el visitante activa el CTA de WhatsApp, THE Portal_B2C SHALL abrir un enlace seguro al número configurado mediante variable pública de entorno.
3. WHEN el mapa entra en el viewport, THE Portal_B2C SHALL hidratar el mapa mediante `client:visible`.
4. IF el mapa no puede inicializarse, THEN THE Portal_B2C SHALL mostrar dirección textual y enlace externo accesible.
5. WHERE el formulario de contacto usa un endpoint aprobado, THE Portal_B2C SHALL enviar el formulario mediante una React_Island `client:visible`.
6. IF el formulario de contacto carece de endpoint aprobado, THEN THE Portal_B2C SHALL conservar el formulario en Visual_Only_State y registrarlo en el Evaluation_Inventory.
7. THE Portal_B2C SHALL obtener teléfonos, correos, dirección y coordenadas desde configuración sin hardcodear secretos.

### Requirement 15: Autenticación y shell de cliente

**User Story:** Como cliente, quiero autenticarme sin perder la intención de compra, para acceder a reservas y capacidades de cuenta.

#### Acceptance Criteria

1. WHEN un visitante activa una acción protegida, THE Portal_B2C SHALL abrir el Auth Gate sin borrar tour, instancia, fecha, pasajeros ni ruta de origen.
2. THE Auth Gate SHALL ofrecer iniciar sesión, registrarse y continuar con Google conforme a Spec F.
3. WHEN el Auth Gate abre, THE Auth Gate SHALL atrapar el foco y anunciarse como diálogo.
4. WHEN el Auth Gate cierra, THE Auth Gate SHALL devolver el foco al control que abrió el Auth Gate.
5. WHEN la autenticación de un CLIENT finaliza, THE Portal_B2C SHALL continuar la intención protegida o navegar al panel del cliente.
6. THE Account_Shell_Island SHALL usar `client:load` para validar sesión antes de mostrar datos privados.
7. IF la sesión no es válida, THEN THE Account_Shell_Island SHALL ocultar datos privados y dirigir al flujo de autenticación.
8. THE Portal_B2C SHALL mantener el access token exclusivamente en memoria.
9. THE Portal_B2C SHALL recibir el refresh token exclusivamente mediante cookie HttpOnly administrada por backend.
10. WHEN el cliente cierra sesión, THE Account_Shell_Island SHALL limpiar estado privado en memoria y navegar a una ruta pública.

### Requirement 16: Mockup 20 — Panel de usuario

**User Story:** Como cliente autenticado, quiero ver un resumen de mi próxima aventura y mi actividad, para saber qué requiere atención.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir saludo, próximo tour, countdown, métricas, Coins, nivel, actividad, recomendaciones, ayuda y navegación lateral del Mockup 20.
2. WHEN existe un tour próximo, THE Portal_B2C SHALL mostrar fecha, lugar, estado y acción de detalle del tour próximo.
3. IF no existe un tour próximo, THEN THE Portal_B2C SHALL mostrar un estado vacío con acción para explorar tours.
4. WHEN el cliente activa una recomendación, THE Portal_B2C SHALL navegar al detalle mediante Canonical_TourCard.
5. THE Portal_B2C SHALL distinguir saldo de Coins y progreso de nivel como conceptos visuales separados.
6. IF una métrica del panel carece de backend aprobado, THEN THE Portal_B2C SHALL mostrar la métrica en Visual_Only_State y registrarla en el Evaluation_Inventory.

### Requirement 17: Mockup 21 — Mis Tours por ciclo de vida

**User Story:** Como cliente, quiero separar tours próximos, en curso y completados, para acceder a acciones apropiadas según el momento del viaje.

#### Acceptance Criteria

1. THE Lifecycle_View SHALL clasificar cada reserva en exactamente una categoría: Próximos, En curso o Completados.
2. WHEN una reserva tiene fecha futura y estado confirmado, THE Lifecycle_View SHALL mostrar la reserva en Próximos.
3. WHILE una reserva se encuentra dentro de la ventana operativa del tour, THE Lifecycle_View SHALL mostrar la reserva en En curso.
4. WHEN una reserva tiene estado completado, THE Lifecycle_View SHALL mostrar la reserva en Completados.
5. THE Lifecycle_View SHALL reproducir filtros por año y destino mostrados en el Mockup 21.
6. WHERE una reserva permite voucher, THE Lifecycle_View SHALL mostrar la acción de descarga.
7. WHERE una reserva completada permite reseña, THE Lifecycle_View SHALL mostrar la acción de reseña conforme a la fase aprobada.
8. IF una acción operativa de tour en curso carece de backend aprobado, THEN THE Lifecycle_View SHALL mantener la acción en Visual_Only_State y registrarla en el Evaluation_Inventory.
9. IF una categoría no contiene reservas, THEN THE Lifecycle_View SHALL mostrar un estado vacío específico de la categoría.

### Requirement 18: Mockup 21-1 — Detalle de reserva

**User Story:** Como cliente, quiero consultar itinerario, viajeros, pagos y contactos de una reserva, para gestionar el viaje desde un solo lugar.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir resumen, identificador, itinerario, punto de encuentro, fecha, viajeros, documentos, total, pagos, saldo, guía, operador, mapa, voucher, soporte y cancelación del Mockup 21-1.
2. WHEN el cliente solicita el voucher de una reserva elegible, THE Portal_B2C SHALL descargar el voucher provisto por el endpoint aprobado.
3. WHEN el cliente activa contacto con guía u operador, THE Portal_B2C SHALL usar el canal aprobado sin exponer datos personales en la URL.
4. WHERE la reserva admite cancelación, THE Portal_B2C SHALL mostrar la franja, penalidad y monto en Coins antes de solicitar confirmación.
5. WHEN una cancelación con reembolso se confirma, THE Portal_B2C SHALL solicitar OTP antes de ejecutar la cancelación.
6. IF la reserva no admite cancelación con devolución, THEN THE Portal_B2C SHALL explicar la condición sin habilitar una acción irreversible.
7. WHEN el mapa entra en el viewport, THE Portal_B2C SHALL hidratar el mapa mediante `client:visible`.
8. IF una capacidad del detalle carece de backend aprobado, THEN THE Portal_B2C SHALL mantener la capacidad en Visual_Only_State y registrarla en el Evaluation_Inventory.

### Requirement 19: Mockup 21-2 — Proceso de reserva

**User Story:** Como cliente, quiero completar pasajeros, extras y pago en un flujo claro, para confirmar la reserva sin perder información.

#### Acceptance Criteria

1. THE Booking_Wizard_Island SHALL reproducir los pasos Datos del viaje, Pasajeros, Servicios adicionales, Resumen y pago, y Confirmación del Mockup 21-2.
2. THE Booking_Wizard_Island SHALL usar `client:load` como Minimum_Hydration_Directive.
3. WHEN el cliente avanza de paso, THE Booking_Wizard_Island SHALL validar los campos del paso actual antes de mostrar el paso siguiente.
4. IF un campo es inválido, THEN THE Booking_Wizard_Island SHALL conservar los valores y asociar un mensaje textual al campo.
5. WHEN pasajeros o add-ons cambian, THE Booking_Wizard_Island SHALL recalcular subtotal, descuento de Coins, IVA y total mediante reglas aprobadas.
6. WHEN el cliente aplica Coins, THE Booking_Wizard_Island SHALL limitar los Coins al saldo disponible.
7. WHEN el cliente aplica Coins, THE Booking_Wizard_Island SHALL aplicar el descuento antes de calcular IVA.
8. WHEN el cliente confirma pago, THE Booking_Wizard_Island SHALL enviar una solicitud idempotente al endpoint aprobado.
9. WHEN el backend confirma el pago, THE Booking_Wizard_Island SHALL mostrar la confirmación con identificador de reserva.
10. IF el pago permanece pendiente, THEN THE Booking_Wizard_Island SHALL mostrar estado pendiente sin declarar la reserva confirmada.
11. IF el pago falla, THEN THE Booking_Wizard_Island SHALL conservar la reserva y ofrecer una acción segura de reintento.
12. IF Split Fare carece de Product_Approval para esta fase, THEN THE Booking_Wizard_Island SHALL representar Split Fare como Visual_Only_State y registrarlo en el Evaluation_Inventory.

### Requirement 20: Mockup 22 — Perfil y preferencias

**User Story:** Como cliente, quiero administrar perfil, preferencias y seguridad, para mantener mi cuenta actualizada y protegida.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir portada, avatar, datos personales, preferencias, condiciones médicas, documentos, seguridad, sesiones, notificaciones y eliminación de cuenta del Mockup 22.
2. WHEN el cliente edita datos personales, THE Portal_B2C SHALL validar los datos antes de enviar cambios.
3. WHEN el cliente guarda preferencias, THE Portal_B2C SHALL conservar dificultad, regiones y preferencia alimentaria aprobadas.
4. WHERE el cliente registra condiciones médicas, THE Portal_B2C SHALL solicitar consentimiento explícito separado antes de enviar datos sensibles.
5. WHERE el cliente carga un documento, THE Portal_B2C SHALL usar una URL prefirmada para almacenamiento privado.
6. THE Portal_B2C SHALL mantener documentos y datos sensibles fuera de logs, URLs y mensajes de error.
7. WHEN el cliente cambia contraseña o email, THE Portal_B2C SHALL solicitar OTP conforme a Spec F.
8. WHERE la gestión de sesiones activas está aprobada, THE Portal_B2C SHALL permitir cerrar sesiones mediante confirmación explícita.
9. WHEN el cliente solicita eliminar la cuenta, THE Portal_B2C SHALL explicar anonimización, retención fiscal y bloqueos por reservas futuras antes de confirmar.
10. IF autenticación de dos pasos carece de Product_Approval para la fase actual, THEN THE Portal_B2C SHALL representar autenticación de dos pasos como Visual_Only_State y registrarla en el Evaluation_Inventory.
11. IF una preferencia o documento mostrado carece de contrato aprobado, THEN THE Portal_B2C SHALL mantener el control en Visual_Only_State y registrarlo en el Evaluation_Inventory.

### Requirement 21: Mockup 23 — Borondo Coins

**User Story:** Como cliente, quiero consultar Coins, nivel e historial, para comprender y usar mis beneficios.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir balance, equivalencia, nivel, progreso, beneficios, historial, resumen y formas de ganar Coins del Mockup 23.
2. THE Portal_B2C SHALL mostrar XP de nivel y saldo de Coins como magnitudes separadas.
3. THE Portal_B2C SHALL obtener ratio, umbrales, beneficios y transacciones desde contratos aprobados sin hardcodear reglas divergentes.
4. WHEN el cliente filtra el historial, THE Portal_B2C SHALL actualizar la lista sin alterar el saldo mostrado.
5. IF una actividad de ganancia pertenece a una fase futura, THEN THE Portal_B2C SHALL marcar la actividad como Visual_Only_State y registrarla en el Evaluation_Inventory.
6. THE Portal_B2C SHALL comunicar que los Coins aprobados son libres, no transferibles y sin vencimiento conforme a Spec D.
7. IF la equivalencia visible del Mockup contradice el ratio aprobado, THEN THE Portal_B2C SHALL mostrar el ratio aprobado y registrar la diferencia visual.

### Requirement 22: Mockup 24 — Favoritos

**User Story:** Como cliente, quiero guardar y organizar tours, para comparar opciones y reservar después.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir favoritos, colecciones, compartir lista, orden, disponibilidad y CTA de exploración del Mockup 24.
2. THE Portal_B2C SHALL renderizar cada favorito mediante Canonical_TourCard.
3. WHEN el cliente agrega o elimina un favorito, THE Portal_B2C SHALL actualizar el estado visual de forma reversible hasta recibir confirmación del backend.
4. IF el backend rechaza el cambio de favorito, THEN THE Portal_B2C SHALL restaurar el estado anterior y anunciar el error.
5. WHERE colecciones tienen Product_Approval, THE Portal_B2C SHALL permitir crear, nombrar y asignar favoritos a colecciones.
6. IF colecciones carecen de Product_Approval, THEN THE Portal_B2C SHALL representar colecciones como Visual_Only_State y registrarlas en el Evaluation_Inventory.
7. IF compartir lista carece de Product_Approval, THEN THE Portal_B2C SHALL representar compartir lista como Visual_Only_State y registrarlo en el Evaluation_Inventory.
8. IF no existen favoritos, THEN THE Portal_B2C SHALL mostrar un estado vacío con acción para explorar tours.

### Requirement 23: Mockup 25 — Mensajes

**User Story:** Como cliente, quiero consultar conversaciones vinculadas a reservas, para coordinar viajes y solicitar soporte.

#### Acceptance Criteria

1. THE Portal_B2C SHALL reproducir bandeja, búsqueda, filtro de no leídas, conversación, presencia, contexto de reserva, adjuntos y opciones del Mockup 25.
2. WHEN el cliente abre una conversación aprobada, THE Portal_B2C SHALL mostrar únicamente mensajes autorizados para el cliente y la reserva correspondiente.
3. WHERE el chat tripartito está dentro de su ventana aprobada, THE Portal_B2C SHALL permitir mensajes entre cliente, guía y agente autorizado.
4. IF el chat está fuera de su ventana aprobada, THEN THE Portal_B2C SHALL mostrar la conversación en estado no interactivo con explicación temporal.
5. WHERE los adjuntos están aprobados, THE Portal_B2C SHALL cargar adjuntos mediante URL prefirmada y validación de tipo y tamaño.
6. IF mensajería completa carece de Product_Approval para la fase actual, THEN THE Portal_B2C SHALL representar la bandeja y conversación como Visual_Only_State y registrarlas en el Evaluation_Inventory.
7. THE Portal_B2C SHALL mantener identificadores sensibles, PII y contenido de mensajes fuera de URLs y logs.
8. WHEN el cliente navega la bandeja con teclado, THE Portal_B2C SHALL permitir seleccionar conversaciones y operar mensajes sin puntero.

### Requirement 24: Inventario de evaluación y aprobación de producto

**User Story:** Como responsable de producto, quiero distinguir diseño visual de compromiso funcional, para aprobar backend y reglas de negocio de forma consciente.

#### Acceptance Criteria

1. THE Evaluation_Inventory SHALL incluir planificación de viaje y recomendaciones personalizadas mostradas en los Mockups 1 y 3.
2. THE Evaluation_Inventory SHALL incluir newsletter, CMS editorial, formulario de contacto persistente y mapa de oficina mostrados en los Mockups 5 y 6.
3. THE Evaluation_Inventory SHALL incluir countdown dinámico, feed de actividad y recomendaciones personalizadas mostrados en el Mockup 20.
4. THE Evaluation_Inventory SHALL incluir itinerario en vivo, ubicación de grupo, botón de emergencia y contacto anticipado con guía mostrados en el Mockup 21.
5. THE Evaluation_Inventory SHALL incluir gestión de documentos de viajeros, pagos parciales, Split Fare y estados de pago mostrados en los Mockups 21-1 y 21-2.
6. THE Evaluation_Inventory SHALL incluir alergias, condiciones médicas, preferencias alimentarias, sesiones activas, dos pasos y preferencias multicanal mostradas en el Mockup 22.
7. THE Evaluation_Inventory SHALL incluir formas futuras de ganar Coins y beneficios de nivel no disponibles en la fase actual mostrados en el Mockup 23.
8. THE Evaluation_Inventory SHALL incluir colecciones y compartir favoritos mostrados en el Mockup 24.
9. THE Evaluation_Inventory SHALL incluir presencia, mensajería persistente, grupos, archivos, silenciar y reportar mostrados en el Mockup 25.
10. THE Evaluation_Inventory SHALL registrar para cada elemento el Mockup, control visible, contrato requerido, datos personales implicados, fase documental, estado de aprobación y propietario de decisión.
11. IF un elemento no tiene Product_Approval, THEN THE Portal_B2C SHALL limitar el elemento a diseño fiel en Visual_Only_State.
12. WHEN Product_Approval se registra, THE Redesign_Project SHALL actualizar requisitos funcionales antes de implementar backend o efectos de negocio.

### Requirement 25: Movimiento, GSAP y Three.js

**User Story:** Como visitante, quiero movimiento útil y sobrio, para comprender cambios sin distracciones ni peso innecesario.

#### Acceptance Criteria

1. IF un Mockup no define una secuencia temporal verificable, THEN THE Portal_B2C SHALL usar transiciones CSS o comportamiento nativo para cambios de estado.
2. WHERE un storyboard aprobado define scrollytelling, THE Portal_B2C SHALL aislar GSAP en una React_Island `client:idle`.
3. IF no existe un storyboard aprobado de scrollytelling, THEN THE Portal_B2C SHALL generar el artefacto sin GSAP.
4. WHERE un Mockup contiene geometría tridimensional interactiva verificable, THE Portal_B2C SHALL aislar Three.js en una React_Island `client:visible` fuera del path crítico.
5. IF el Mockup_Inventory no contiene geometría tridimensional interactiva, THEN THE Portal_B2C SHALL generar el artefacto sin Three.js.
6. WHILE Reduced_Motion_Mode está activo, THE Portal_B2C SHALL sustituir animaciones no esenciales por cambios instantáneos o fundidos de máximo 100ms.
7. WHILE Reduced_Motion_Mode está activo, THE Portal_B2C SHALL detener autoplay, parallax y desplazamiento animado.

### Requirement 26: i18n, contenido seguro y secretos

**User Story:** Como responsable de plataforma, quiero textos traducibles y contenido seguro, para ampliar idiomas sin introducir XSS ni filtrar secretos.

#### Acceptance Criteria

1. THE I18n_System SHALL resolver todo texto orientado al usuario, placeholder, `alt`, `aria-label` y mensaje de estado mediante claves de traducción.
2. THE I18n_System SHALL usar español como idioma por defecto y español como fallback.
3. IF una clave no existe en el idioma activo, THEN THE I18n_System SHALL resolver la clave en español.
4. IF una clave no existe en español, THEN THE I18n_System SHALL mostrar la clave y registrar un aviso de desarrollo sin datos personales.
5. WHERE el backend provee HTML, THE Portal_B2C SHALL renderizar el HTML exclusivamente mediante SafeHtml_Renderer.
6. THE SafeHtml_Renderer SHALL eliminar scripts, iframes, formularios, estilos, atributos de evento y protocolos inseguros antes de insertar contenido.
7. IF SafeHtml_Renderer no puede sanitizar contenido, THEN THE SafeHtml_Renderer SHALL renderizar un fallback seguro sin insertar el original.
8. THE Portal_B2C SHALL obtener tokens de servicios, endpoints y configuración sensible desde variables de entorno apropiadas.
9. THE Portal_B2C SHALL mantener secretos, access tokens, documentos, datos médicos y PII fuera del código fuente, URLs, telemetría y mensajes de error.

### Requirement 27: Accesibilidad WCAG 2.1 AA

**User Story:** Como persona que usa teclado, lector de pantalla o preferencias de movimiento, quiero operar todo el portal sin barreras.

#### Acceptance Criteria

1. THE Portal_B2C SHALL cumplir WCAG 2.1 AA en rutas públicas y autenticadas.
2. THE Portal_B2C SHALL mantener contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande, foco y componentes de interfaz.
3. THE Portal_B2C SHALL mostrar foco visible en cada elemento enfocable.
4. THE Portal_B2C SHALL asociar un label accesible a cada input, select, textarea, calendario, búsqueda y control personalizado.
5. THE Portal_B2C SHALL proporcionar `alt` descriptivo para imágenes informativas y `alt=""` para imágenes decorativas.
6. WHEN un diálogo, drawer o menú modal abre, THE Portal_B2C SHALL atrapar el foco dentro del componente.
7. WHEN un diálogo, drawer o menú modal cierra, THE Portal_B2C SHALL devolver el foco al disparador.
8. WHEN el cliente usa Tab, Shift+Tab, Enter, Espacio o Escape, THE Portal_B2C SHALL permitir operar todos los Interactive_Elements aplicables.
9. THE Portal_B2C SHALL comunicar estados de disponibilidad, error, éxito, selección y progreso mediante texto o iconografía además del color.
10. WHILE Reduced_Motion_Mode está activo, THE Portal_B2C SHALL cumplir las sustituciones de movimiento definidas en Requirement 25.
11. WHEN contenido asíncrono cambia, THE Portal_B2C SHALL anunciar errores y confirmaciones mediante una región viva con prioridad apropiada.
12. THE Portal_B2C SHALL mantener un enlace de salto al contenido como primer elemento tabulable.

### Requirement 28: Rendimiento e imágenes

**User Story:** Como viajero con conexión limitada, quiero cargas progresivas y estables, para explorar sin esperas ni saltos de layout.

#### Acceptance Criteria

1. THE Portal_B2C SHALL servir cada imagen responsiva con candidatos `srcset` de 400w, 800w y 1200w y un atributo `sizes` correspondiente al ancho renderizado.
2. THE Portal_B2C SHALL cargar imágenes above-the-fold necesarias para LCP con prioridad alta.
3. THE Portal_B2C SHALL cargar imágenes below-the-fold de forma diferida antes de entrar al viewport.
4. THE Portal_B2C SHALL reservar dimensiones de imágenes y componentes asíncronos para mantener CLS menor a 0.1.
5. WHILE una vista espera datos, THE Portal_B2C SHALL mostrar skeletons que reproduzcan la geometría final.
6. IF una solicitud supera 10 segundos, THEN THE Portal_B2C SHALL mostrar un estado de error con reintento sin desplazar el layout.
7. IF una imagen falla, THEN THE Portal_B2C SHALL mostrar un fallback que conserve dimensiones y comportamiento de `alt`.
8. THE Portal_B2C SHALL dividir JavaScript por ruta y por React_Island pesada.
9. THE Portal_B2C SHALL mantener mapa, galería, calendario, checkout y mensajería fuera del bundle inicial de rutas que no usan esas capacidades.
10. THE Portal_B2C SHALL evitar dependencias de animación o 3D cuando Requirements 25.3 o 25.5 resulten aplicables.
11. WHEN una ruta pública clave se mide con el Performance_Profile, THE Portal_B2C SHALL alcanzar Largest Contentful Paint menor o igual a 2,5 segundos.
12. WHEN una ruta pública clave se mide con el Performance_Profile, THE Portal_B2C SHALL alcanzar Interaction to Next Paint menor o igual a 200 milisegundos.
13. WHEN una ruta pública clave se mide con el Performance_Profile, THE Portal_B2C SHALL alcanzar Cumulative Layout Shift menor o igual a 0,1.
14. WHEN el rediseño añade una React_Island, THE Portal_B2C SHALL documentar el tamaño comprimido incorporado al JavaScript de la ruta correspondiente.

### Requirement 29: Validación visual, componentes, E2E y axe

**User Story:** Como equipo de calidad, quiero detectar desviaciones visuales y funcionales automáticamente, para preservar fidelidad durante toda la secuencia.

#### Acceptance Criteria

1. THE Visual_Regression_Suite SHALL capturar cada ruta implementada a 375×812 y 1440×900.
2. THE Visual_Regression_Suite SHALL usar Chromium, fuentes locales, datos deterministas, animaciones deshabilitadas y reloj fijo.
3. THE Visual_Regression_Suite SHALL aceptar como máximo 0.5% de píxeles diferentes respecto al Visual_Baseline aprobado.
4. THE Visual_Regression_Suite SHALL fallar cuando una ancla principal difiera más de 2px respecto al Visual_Baseline aprobado.
5. WHEN un componente compartido cambia, THE Visual_Regression_Suite SHALL ejecutar capturas de todas las rutas que consumen el componente compartido.
6. THE Portal_B2C SHALL incluir component tests para estados default, hover, focus, disabled, loading, empty, error y success de componentes interactivos aplicables.
7. THE Portal_B2C SHALL incluir component tests para focus trap, retorno de foco, validación, selección de fecha, actualización de precio y estados optimistas.
8. THE Portal_B2C SHALL incluir E2E para Home→Catálogo, Catálogo→Tour, fecha→Auth Gate→reserva, login→panel, Lifecycle_View→detalle, perfil, Coins, favoritos y mensajería visual.
9. THE Portal_B2C SHALL incluir axe en cada ruta pública y autenticada a 375px y 1440px.
10. THE Portal_B2C SHALL mantener cero violaciones axe de impacto serious o critical.
11. THE Portal_B2C SHALL incluir pruebas de teclado para navegación, drawers, modales, calendario, wizard y área autenticada.
12. THE Portal_B2C SHALL mantener cobertura de al menos 80% en archivos modificados con lógica o interacción.
13. WHEN una diferencia visual es intencional, THE Redesign_Project SHALL exigir aprobación registrada antes de actualizar el Visual_Baseline.

### Requirement 30: Build y despliegue estático

**User Story:** Como responsable de operaciones, quiero desplegar el rediseño como sitio estático, para usar S3 y CloudFront sin servidores de renderizado.

#### Acceptance Criteria

1. THE Portal_B2C SHALL completar lint sin warnings antes de producir el artefacto.
2. THE Portal_B2C SHALL completar typecheck sin errores antes de producir el artefacto.
3. THE Portal_B2C SHALL completar tests unitarios, component tests, E2E, axe y Visual_Regression_Suite antes de aprobar una etapa.
4. THE Portal_B2C SHALL completar `astro build` en modo estático sin adaptador SSR.
5. THE Portal_B2C SHALL producir rutas, assets con hash y fallbacks compatibles con S3 y CloudFront.
6. THE Portal_B2C SHALL obtener la URL de API y tokens públicos permitidos desde configuración de build.
7. THE Portal_B2C SHALL mantener secretos de backend fuera del bundle estático.
8. WHEN una ruta privada se solicita directamente, THE Portal_B2C SHALL servir el shell estático y validar la sesión antes de mostrar datos privados.

### Requirement 31: Preservación del comportamiento y contratos

**User Story:** Como responsable de producto, quiero que el rediseño conserve el comportamiento aprobado, para mejorar la experiencia sin introducir regresiones de negocio.

#### Acceptance Criteria

1. THE Redesign_Project SHALL mantener una Behavioral_Regression_Matrix que cubra cada ruta y capacidad del Functional_Baseline afectada por el rediseño.
2. THE Behavioral_Regression_Matrix SHALL registrar para cada capacidad la entrada, la acción del usuario, el resultado observable, el contrato de datos y la prueba de regresión correspondiente.
3. WHEN el rediseño modifica la presentación de una capacidad del Functional_Baseline, THE Portal_B2C SHALL conservar los mismos datos requeridos y resultados de negocio aprobados.
4. WHEN el rediseño modifica navegación, búsqueda, filtros, ordenamiento o paginación, THE Portal_B2C SHALL conservar rutas, slugs y query params canónicos compatibles con enlaces existentes.
5. WHEN el rediseño modifica un formulario, THE Portal_B2C SHALL conservar reglas de validación, valores permitidos, mensajes asociados y datos ingresados después de un error.
6. WHEN el rediseño modifica disponibilidad, precio, IVA, Coins, penalidades o totales, THE Portal_B2C SHALL presentar los valores calculados por las reglas y contratos aprobados sin recalcular reglas divergentes en la capa visual.
7. WHEN el rediseño modifica autenticación o una acción protegida, THE Portal_B2C SHALL conservar intención, estado y retorno del usuario definidos por el Functional_Baseline.
8. WHEN el rediseño modifica estados de carga, vacío, error o éxito, THE Portal_B2C SHALL conservar la recuperación, el reintento y la información contextual disponibles en el Functional_Baseline.
9. IF un Mockup propone un comportamiento incompatible con el Functional_Baseline, THEN THE Portal_B2C SHALL aplicar el Functional_Baseline y registrar la diferencia para Product_Approval.
10. IF una capacidad visual no existe en el Functional_Baseline, THEN THE Portal_B2C SHALL aplicar Visual_Only_State hasta que requisitos funcionales aprobados definan el comportamiento.
11. THE Redesign_Project SHALL mantener fuera de alcance cualquier cambio a esquemas de base de datos, endpoints, cálculos financieros, roles o transiciones de estado que no tenga Product_Approval.

### Requirement 32: SEO técnico y datos estructurados

**User Story:** Como responsable de adquisición, quiero que las páginas públicas conserven señales de búsqueda válidas, para mantener descubrimiento orgánico durante el rediseño.

#### Acceptance Criteria

1. THE Portal_B2C SHALL proporcionar SEO_Metadata único y no vacío para cada Public_Route indexable.
2. THE Portal_B2C SHALL proporcionar una Canonical_URL absoluta para cada Public_Route indexable.
3. WHEN una Public_Route representa contenido equivalente en más de un Enabled_Locale, THE Portal_B2C SHALL enlazar las versiones mediante etiquetas `hreflang` recíprocas y una referencia `x-default`.
4. THE Sitemap SHALL incluir únicamente Canonical_URL de Public_Routes indexables que respondan con contenido válido.
5. THE Portal_B2C SHALL publicar una política `robots.txt` que permita rastrear Public_Routes indexables y señale la ubicación del Sitemap.
6. THE Portal_B2C SHALL excluir Private_Routes, estados de autenticación y URLs con filtros de usuario del Sitemap.
7. WHEN una Private_Route se renderiza, THE Portal_B2C SHALL emitir la directiva `noindex, nofollow`.
8. WHEN una Public_Route se comparte, THE Portal_B2C SHALL proporcionar título, descripción e imagen social mediante Open Graph y metadatos equivalentes de tarjeta social.
9. WHEN una página representa un tour publicado, THE Portal_B2C SHALL generar Structured_Data de tipo `TouristTrip` y `Offer` a partir de datos visibles y aprobados del tour.
10. WHEN una página muestra una ruta jerárquica de navegación, THE Portal_B2C SHALL generar Structured_Data de tipo `BreadcrumbList` equivalente a los breadcrumbs visibles.
11. THE Portal_B2C SHALL generar Structured_Data de organización y sitio con nombre, URL, logotipo y datos de marca aprobados.
12. IF un valor requerido por Structured_Data no está disponible, THEN THE Portal_B2C SHALL omitir la propiedad o el bloque afectado sin inventar contenido.
13. THE Structured_Data SHALL superar una validación schema.org sin errores de sintaxis ni propiedades con tipos incompatibles.
14. WHEN el rediseño cambia estructura visual o copy, THE Portal_B2C SHALL conservar slugs, Canonical_URL y datos de negocio indexados salvo aprobación explícita del cambio.

### Requirement 33: Localización y formatos regionales

**User Story:** Como viajero, quiero recibir contenido y formatos coherentes con el idioma activo, para comprender el portal sin inconsistencias.

#### Acceptance Criteria

1. THE I18n_System SHALL mantener español como Enabled_Locale predeterminado del Portal_B2C.
2. WHERE un Enabled_Locale adicional está aprobado, THE I18n_System SHALL cargar un catálogo completo antes de exponer el selector correspondiente.
3. WHEN el usuario selecciona un Enabled_Locale, THE Portal_B2C SHALL actualizar textos, nombres accesibles, SEO_Metadata y atributo `lang` del documento al idioma seleccionado.
4. WHEN el usuario selecciona un Enabled_Locale, THE Portal_B2C SHALL conservar ruta, intención, búsqueda, filtros y selección compatibles durante el cambio.
5. THE Portal_B2C SHALL formatear fechas, números y monedas conforme al Enabled_Locale activo sin alterar los valores numéricos de origen.
6. WHERE un contenido procede del backend en un único idioma, THE Portal_B2C SHALL identificar el idioma disponible sin generar una traducción automática no aprobada.
7. IF una traducción falta en el Enabled_Locale activo, THEN THE I18n_System SHALL aplicar la secuencia de fallback definida en Requirement 26.
8. WHEN una traducción ocupa hasta 30% más ancho que el texto español del Visual_Baseline, THE Portal_B2C SHALL mantener contenido legible sin recorte, superposición ni scroll horizontal.
9. THE Portal_B2C SHALL mantener la dirección de lectura de izquierda a derecha para los Enabled_Locales aprobados en el alcance actual.
10. IF un idioma no dispone de catálogo completo, THEN THE Portal_B2C SHALL mantener oculto el selector de ese idioma.

## Evaluation Inventory — requiere aprobación antes de backend o negocio

| Mockup | Elemento a diseñar fielmente | Estado inicial | Aprobación necesaria |
|---|---|---|---|
| 1, 3 | “Planifica tu viaje” y recomendador | Visual_Only_State | Flujo, datos, ownership y endpoint |
| 5 | CMS editorial, búsqueda de artículos y newsletter | Visual_Only_State salvo contenido SSG | CMS, suscripción, consentimiento y proveedor |
| 6 | Formulario persistente y mapa de oficina | Visual_Only_State salvo enlace de contacto | Endpoint, retención, anti-spam y coordenadas finales |
| 20 | Feed de actividad, countdown y recomendaciones personales | Visual_Only_State | Contratos de actividad y personalización |
| 21 | Itinerario en vivo, ubicación del grupo y botón de emergencia | Visual_Only_State | Ventana operativa, permisos, GPS y protocolo de emergencia |
| 21-1 | Edición de viajeros/documentos y pagos de saldo | Visual_Only_State | Contratos de booking, PII, auditoría y pagos |
| 21-2 | Split Fare y alternativas de pago | Visual_Only_State | Fase, idempotencia, proveedor y reglas financieras |
| 22 | Datos médicos, dietas, sesiones activas, 2FA y canales | Visual_Only_State para capacidades sin contrato | Consentimiento, retención, MFA y preferencias |
| 23 | Recompensas futuras, referidos, cumpleaños y premium | Visual_Only_State | Reglas de loyalty y fase |
| 24 | Colecciones y compartir favoritos | Visual_Only_State | Modelo de datos, privacidad y enlaces compartidos |
| 25 | Chat persistente, presencia, grupos, adjuntos y reportes | Visual_Only_State | Fase 2, DynamoDB, TTL, moderación y presigned URLs |

## Reconciliation Notes

- La implementación actual ya contiene Astro SSG, React islands, Tailwind CSS 4, Ave_Azul_Tokens, `SafeHtml`, i18n, `TourCard`, catálogo, mapa, galería, calendario y tests; el rediseño deberá adaptar estos activos antes de duplicarlos.
- El `TourCard` compartido actual debe evolucionar hacia Canonical_TourCard; el catálogo no conservará una tarjeta específica inferior.
- El Header actual es fijo; el rediseño debe corregir explícitamente la falta de compensación superior en páginas sin hero y verificar que ningún input o botón quede cubierto.
- Los Mockups muestran más capacidades que el alcance del spec frontend público vigente. La fidelidad visual se incluye ahora, pero el Evaluation_Inventory evita aprobar implícitamente backend, pagos, PII, GPS, chat, loyalty futuro o reglas operativas.
- El Mockup_Inventory no demuestra contenido 3D ni una secuencia temporal de scrollytelling; Three.js y GSAP quedan excluidos del artefacto inicial hasta contar con evidencia visual y aprobación.