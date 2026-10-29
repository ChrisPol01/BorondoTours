# QA funcional del B2C (`apps/web`), función por función

Fecha de ejecución: 2026-10-14. Entorno: servidor de desarrollo Astro en `http://localhost:4321` (ya estaba corriendo), Chromium headless de Playwright 1.61.1 con scripts ad hoc (`apps/web/tmp-qa-*.mjs`, ya borrados). Viewports 1440×900 y 390×844. Cuenta demo `demo@borondotours.com`. No se modificó código del producto ni se hicieron commits.

Cobertura:
- Recorrido de las 66 páginas de `src/pages` más `/tour?tour=…` y una ruta inexistente, en 5 combinaciones: colorido/es, oscuro/en, claro/es (escritorio, con sesión), colorido/es móvil con sesión y colorido/es anónimo. Total: 345 cargas. En cada una se registraron estado HTTP, redirección, `pageerror`, `console.error`, recursos fallidos, contraste de texto calculado sobre el fondo real (WCAG AA), texto en español residual en modo `en` y desborde horizontal.
- Pruebas de interacción por pantalla (clic, teclado, formularios), observando navegación, pestañas nuevas, descargas, diálogos y cambios del DOM.

Cómo leer el resultado: **OK** funciona; **FALLA** el control existe y se ve accionable pero no hace nada o hace algo incorrecto; **PARCIAL** funciona con datos de muestra o con una limitación; **NO IMPLEMENTADO** el diseño muestra la función pero no hay lógica detrás (controles dibujados, sin inputs reales).

## Resumen

| Resultado | Funciones |
|---|---|
| OK | 115 |
| FALLA | 63 |
| PARCIAL | 14 |
| NO IMPLEMENTADO | 24 |
| **Total** | **216** |

En ninguna de las 345 cargas hubo `pageerror` (errores JS no capturados). Los únicos `console.error` son los 404 esperados (`/404`, ruta inexistente, `/tours/:slug`) y `/discovery`, que llama a `/api/v1/tours/search` y recibe 404.

Diagnóstico general: lo público y de descubrimiento funciona (Home, Explorar, favoritos, acceso con OTP de demostración, contacto, Nosotros/legal). Desde el detalle del tour hacia adelante, casi todo es diseño estático de Figma con enlaces entre pantallas fijas. El checkout no usa el tour elegido, el área privada tiene casi todos sus botones sin efecto y la versión móvil es el lienzo de escritorio reducido al 27 %.

### Las 10 fallas más graves

1. **Móvil sin diseño responsive** (alta). A 390 px el lienzo de 1440 px se reduce con `zoom` a 0,27. El texto mide unos 4–5 px de alto y los botones unos 12 px, contra un mínimo táctil de 24–44 px. No hay menú hamburguesa. El sitio no se puede usar en un teléfono.
2. **El checkout ignora el tour elegido** (alta). Al reservar "Isla de San Andrés 4 días" se guarda `borondo.cart={"tour":"isla-de-san-andres-4-dias"}`, pero `/checkout`, `/checkout/viajeros`, `/checkout/pago` y la confirmación siempre muestran "Valle del Cocora y Salento", total $660.000 y abono $102.200.
3. **El precio del detalle no cambia con el tour** (alta). `/tour?tour=isla-de-san-andres-4-dias` muestra $185.000 (el precio de Cocora), cuando el catálogo dice "Desde $1.680.000". Cambian el título, las etiquetas y la imagen, pero el precio no.
4. **Los pasos del checkout no son interactivos** (alta). En el paso 1 no se puede cambiar la fecha, los viajeros ni la modalidad. En el paso 2 no hay campos editables y "Subir pasaporte" / "Elegir archivo" no abren selector (no hay `input[type=file]`). En el paso 3 no se puede cambiar el método de pago. El IVA 0 % para extranjeros no se recalcula: el total es $660.000 tanto con pasaporte pendiente como cargado.
5. **El calendario semáforo y el selector de viajeros del detalle no funcionan** (alta). Al hacer clic en un día no pasa nada y no existen controles +/−. La fecha agotada y la lista de espera solo existen como URLs fijas (`/estados/tour-…`) y sus botones ("Avísame si se abre un cupo", "Ver otras fechas", "Unirme a la lista de espera") no hacen nada.
6. **Las pestañas de Mis reservas no funcionan** (alta). "Próximas / Por pagar / Completadas / Canceladas" son un único `<button>` sin efecto, aunque las páginas `/mis-reservas/por-pagar|completadas|canceladas` existen. "Ver detalle" lleva a `/tour` sin slug en lugar de `/mis-reservas/detalle`.
7. **No se puede cancelar, reprogramar ni calificar** (alta). Los botones "Confirmar cancelación", "Cancelar reserva" (en el detalle), "Reprogramar y pagar $30.000", "Enviar calificación" y "Enviar solicitud" (reembolso) no tienen efecto. No se pueden elegir fecha, estrellas ni comentario.
8. **El voucher no se descarga** (alta). "Descargar PDF" y "Agregar al calendario" no tienen efecto, en el voucher y en la confirmación. El QR es una imagen fija.
9. **No hay cómo cerrar sesión desde la navegación** (alta). El avatar/menú de cuenta del sidebar no abre nada. "Cerrar sesión" solo existe en la pantalla de estado `/estados/perfil-menu`, a la que no lleva ningún enlace. Ahí sí funciona.
10. **El inglés queda a medias en el área privada y el checkout** (media). Con `borondo.lang=en`, el Home, Explorar, Blog y Nosotros se traducen. En cambio, el checkout, Mis reservas, Perfil, Mensajes, Legal, Procesando y Confirmación siguen en español casi por completo (15–30 frases por página). Además aparecen mezclas como "Guatapé and El Peñol", "5 days hábiles" y "Desde $178.500 · 1 day".

Otras de gravedad media que conviene atender pronto: las tarjetas "¿Qué quieres vivir?" del Home usan `?category=` y el catálogo lee `?categoria=`, así que llegan sin filtrar (15 tours en lugar de 3). El botón "Mapa" de Explorar no navega. El área de mensaje de `/contacto` es un dibujo sin `textarea`. No aparece banner de cookies en la primera visita. "Procesando" no avanza solo a la confirmación.

---

## Resultados por pantalla

### Home (`/`)

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Carga sin errores (anónimo) | OK | 0 pageerror, 0 console.error | — |
| Carrusel del hero: indicadores | OK | 4 indicadores; "Ciudad Perdida" → "San Andrés" al pulsar el 2º | — |
| Carrusel: avance automático | OK | A los 8 s cambia a "Eje Cafetero" | — |
| Chip de tour del hero → detalle | OK | Navega a `/tour?tour=valle-del-cocora-y-salento` | — |
| Buscador del hero: Destino / Fechas / Viajeros | NO IMPLEMENTADO | 0 inputs reales en el Home; el clic en cada campo no produce cambios | alta |
| "Buscar aventura" | OK | Navega a `/explorar` (sin los criterios, porque no se pueden escribir) | — |
| Tarjetas "¿Qué quieres vivir?" → catálogo filtrado | FALLA | Navega a `/explorar?category=SOL_Y_PLAYA`, que muestra 15 tours sin filtrar; con `?categoria=SOL_Y_PLAYA` salen 3 | media |
| "Ver todo el catálogo" | OK | `/explorar` | — |
| Pestaña lateral Promociones → vitrina | OK | Panel "Promociones" con 4 tarjetas | — |
| Pestaña lateral Más vendidos → vitrina | OK | Panel con 5 tarjetas | — |
| Vitrinas: flechas | OK | scrollLeft 0 → 124 / 0 → 316; "anterior" deshabilitada al inicio | — |
| Vitrinas: "Ver todas" | OK | href `/explorar` | — |
| Vitrinas: cerrar con Escape | OK | 0 paneles visibles tras Escape | — |
| Pestaña lateral "Ver todos" | OK | href `/explorar` | — |
| Tarjetas "Más allá de Colombia" → WhatsApp | OK | Las 4 abren `api.whatsapp.com/send/?phone=573225249637&text=…` en otra pestaña | — |
| Riel de redes (fijo) y redes del pie | OK | Instagram, Facebook y TikTok en pestaña nueva; el riel es `position:fixed` | — |
| Enlaces internos del Home y del pie | OK | 12 enlaces únicos, ninguno con estado ≥ 400 | — |
| Home con sesión iniciada | PARCIAL | `/` con sesión redirige a `/mis-reservas`; el Home solo se ve desde el logo (`/?home=1`) | media |
| Legibilidad en los 3 temas | OK | 0 textos bajo AA en el Home (colorido, claro, oscuro) | — |

### Navbar, chrome fijo y asistente

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Menú Explorar (tipos de tour) | OK | Abre Pasadía / Pasanoche / Excursión / Personalizados | — |
| Menú Explorar → catálogo filtrado | OK | `/explorar?tipo=PASADIA` → "10 tours", chip Pasadía activo | — |
| Menú Explorar → Personalizados | OK | Abre el panel "Asistente BorondoTours" | — |
| Selector de idioma (es/en/fr/pt/zh/ja) | OK | Cada idioma persiste tras recargar (`html lang` = en, fr, pt-BR, zh-Hans, ja) y traduce navbar y pestañas | — |
| Selector de tema (colorido/claro/oscuro/sistema) | OK | Cambia `data-theme` y el fondo; persiste en `borondo.theme` | — |
| Tema persiste entre páginas | OK | Oscuro elegido en `/` → `/explorar` sigue en oscuro | — |
| Navbar fija al hacer scroll | OK | Botón de tema en y=48 tras 2500 px de scroll | — |
| FAB "¿Te ayudamos?" → asistente | OK | Panel con 6 campos | — |
| Asistente → WhatsApp con mensaje armado | OK | Abre `api.whatsapp.com/send/…text=Hola, quiero cotizar un plan pasadía…` | — |
| Campana o acceso a notificaciones | FALLA | No hay control con href o aria de notificaciones en la navbar ni en el sidebar | media |

### Explorar (`/explorar`)

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Carga del catálogo | OK | "15 tours", 6 tarjetas visibles | — |
| Búsqueda por texto | OK | "cocora" → "2 tours", URL `?q=cocora` | — |
| Filtro categoría | OK | Naturaleza → "4 tours · Naturaleza", `aria-pressed=true` | — |
| Filtro región | OK | Caribe → "6 tours · Caribe", `aria-checked=true` | — |
| Filtro tipo | OK | Pasanoche → 2 tours | — |
| Filtro duración | OK | +3 días → 2 tours | — |
| Filtro dificultad | OK | Difícil → 1 tour (dice "1 tours", falta singular) | baja |
| Interruptor exención de IVA | OK | 15 → 13 tours, `?iva=1` | — |
| Filtro de precio (deslizadores) | OK | Rango $50.000–$70.000 → 0 tours | — |
| Ordenar: menor precio / mayor precio / mejor valorados | OK | Precios en orden ascendente y descendente; URL `?orden=…` | — |
| "Cargar más tours" | OK | 6 → 12 tarjetas | — |
| Estado vacío | OK | Aparece `bt-empty`, se oculta "Cargar más" | — |
| "Limpiar filtros" desde el estado vacío | OK | Vuelven las tarjetas, búsqueda vacía, URL `/explorar` | — |
| Filtros en la URL (compartir/recargar) | OK | `?regiones=caribe` restaura Caribe marcado | — |
| Chips de filtros activos (quitar) | FALLA | Con Caribe + Naturaleza no aparece ningún chip. Sin filtros se ven los chips estáticos del diseño "Caribe ×, Eje Cafetero ×, Pasadía ×, 1 día ×", que no hacen nada. El runtime busca el texto "Caribe —" y el diseño dice "Caribe ×" | media |
| Tarjeta → detalle | OK | `/tour?tour=isla-de-san-andres-4-dias` | — |
| Botón de vista "Mapa" | FALLA | Sin efecto; no navega a `/explorar/mapa` | media |
| Vista mapa `/explorar/mapa` | NO IMPLEMENTADO | Imagen estática, sin canvas de Mapbox | media |
| Vista mapa: botón "Lista", pines y tarjeta lateral | FALLA | Ninguno tiene efecto | media |
| Contraste del sello "Agotado" | FALLA | 2,68:1 en colorido y oscuro (mínimo 4,5) | baja |
| Mapa en tema claro | FALLA | Precios de los pines con contraste 1,12:1 ($145.000, $190.000, $160.000) | media |

### Favoritos

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Corazón sin sesión | OK | Redirige a `/iniciar-sesion?next=%2Fexplorar` | — |
| Corazón con sesión | OK | `aria-pressed=true`, se guarda en `borondo.demo.favorites` | — |
| `/favoritos` lista los guardados | OK | 1 tarjeta | — |
| Quitar favorito desde `/favoritos` | OK | Al quedar vacía pasa a `/estados/favoritos-vacio` | — |
| Estado vacío → "Explorar tours" | OK | `/explorar` | — |

### Destinos y Experiencias

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Destinos: chips Quindío / Risaralda / Caldas | FALLA | Sin efecto; las mismas 4 tarjetas | media |
| Destinos: tarjeta → detalle | OK | `/tour?tour=valle-del-cocora-y-salento` | — |
| Destinos: otra región | NO IMPLEMENTADO | La página es fija para el Eje Cafetero; no hay selector de región | media |
| Experiencias: selector de categoría | FALLA | Al pulsar "Aventura" no cambian el título ni las tarjetas | media |
| Experiencias: "Ver los 48 tours de Naturaleza" | FALLA | Sin efecto (debería ir a `/explorar?categoria=NATURALEZA`) | media |
| Experiencias: tarjetas → detalle | OK | Tarjetas estándar enlazadas a `/tour?tour=…` | — |

### Detalle de tour (`/tour?tour=slug`) y estados de disponibilidad

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Pinta el tour elegido (título, etiquetas, imagen) | OK | San Andrés: título, "SOL Y PLAYA · EXCURSIÓN", `document.title` | — |
| Precio del tour elegido | FALLA | San Andrés muestra $185.000 (catálogo: Desde $1.680.000) | alta |
| Itinerario, incluye y punto de encuentro | PARCIAL | Para San Andrés sigue diciendo "Salento" y "Parque Olaya Herrera" (contenido de muestra) | media |
| Valoración coherente | FALLA | El `h1` de la página es "4,9 (41)"; junto a él aparecen "126 reseñas…" y "Ver las 128 reseñas" | baja |
| Galería "Ver 18 fotos" | NO IMPLEMENTADO | Sin efecto | media |
| "Ver video en TikTok" | NO IMPLEMENTADO | Sin efecto | baja |
| Calendario semáforo: elegir fecha | NO IMPLEMENTADO | 69 celdas numéricas; el clic no cambia nada | alta |
| Selector de viajeros | NO IMPLEMENTADO | No hay controles +/− | alta |
| "Cómo llegar" | FALLA | Sin efecto | baja |
| "Ver las 128 reseñas" | FALLA | Sin efecto | baja |
| Favorito/compartir del tour principal | FALLA | Solo hay corazones en las tarjetas de "También en…" | baja |
| "Ver todos en la región" | OK | `/explorar?regiones=caribe` | — |
| "También en la región": tarjetas reales | OK | 4 tarjetas del catálogo enlazadas | — |
| "Reservar ahora" → checkout | OK | Guarda `borondo.cart` con el slug y navega a `/checkout` | — |
| Tour agotado (Tayrona) | OK | El detalle indica agotado | — |
| Fecha agotada: "Avísame si se abre un cupo" | FALLA | Sin efecto | media |
| Fecha agotada: "Ver otras fechas" | FALLA | Sin efecto | media |
| Lista de espera: "Unirme a la lista de espera" | FALLA | Sin efecto (no lleva a `…-confirmada`) | media |
| Ruta antigua `/tours/:slug` | FALLA | 404 en las 5 combinaciones (`tours/[slug].astro` depende del backend) | baja |
| Contraste en tema claro | FALLA | Iniciales de reseñas ("LM", "AR"…) a 2,41:1; 6–8 textos por página | media |
| Inglés | PARCIAL | Quedan unas 17 frases en español: "Ver 18 fotos", "IVA EXENTO PARA EXTRANJEROS", "Máx. 16 personas", descripción… | media |

### Acceso: login, registro, código, recuperar

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Rutas privadas sin sesión → login con `?next` | OK | `/mis-reservas`, `/favoritos`, `/perfil`, `/mensajes`, `/notificaciones`, `/mis-tours`, `/soporte`, `/checkout/confirmacion`, `/mis-reservas/voucher` | — |
| Pago sin sesión | PARCIAL | `/checkout`, `/checkout/pago`, `/pago/saldo` y `/pago/participante` se ven sin sesión; el login se exige al pulsar "Pagar" (comportamiento esperado) | baja |
| Login: campos vacíos | OK | "Escribe tu correo." / "Escribe tu contraseña." | — |
| Login: correo inválido | OK | "Escribe un correo válido…" | — |
| Login: credenciales incorrectas | OK | Mensaje genérico "Credenciales incorrectas…" | — |
| Login: mostrar/ocultar contraseña | OK | `type` pasa a `text` | — |
| Login correcto respeta `?next` | OK | `?next=/favoritos` → `/favoritos` | — |
| Bloqueo tras intentos fallidos | OK | Tras 6 intentos: "Cuenta bloqueada… 15 min." | — |
| "Continuar con Google" | PARCIAL | Simulado (sin OAuth); entra a `/mis-reservas` | baja |
| `/iniciar-sesion` con sesión activa | OK | Redirige a `/mis-reservas` | — |
| Registro: validación vacía | OK | Nombre, correo, contraseña y consentimiento | — |
| Registro: contraseña débil y consentimiento | OK | Reglas en vivo (8 caracteres, mayúscula, número) | — |
| Registro: correo ya existente | OK | "Ya existe una cuenta con este correo…" | — |
| Registro → verificar código | OK | `/verificar-codigo`; el código de demostración se muestra en pantalla | — |
| Código incorrecto | OK | "Código incorrecto. Te quedan 2 intentos." | — |
| Reenvío con temporizador | OK | "Reenviar en 00:44", deshabilitado | — |
| Código correcto → `/bienvenida` | OK | Cuenta creada y sesión iniciada | — |
| `/bienvenida`: "Siguiente" y "Saltar" | FALLA | Ninguno tiene efecto | baja |
| Recuperar: correo no registrado | OK | Mensaje neutro (no revela si la cuenta existe) | — |
| Recuperar → código → nueva clave → login | OK | Entra con la clave nueva | — |
| `/verificar-codigo` sin reto activo | OK | Redirige a `/crear-cuenta` | — |
| Nombre del usuario en navbar/sidebar | OK | "Mi cuenta (Viajero Demo)" | — |

### Checkout y pagos

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Checkout muestra el tour elegido | FALLA | Carrito = San Andrés; pantalla = "Valle del Cocora y Salento", $660.000 | alta |
| Paso 1: "Cambiar fecha" | NO IMPLEMENTADO | Sin efecto | alta |
| Paso 1: viajeros +/− y modalidad (completo/abono/dividir) | NO IMPLEMENTADO | 0 controles +/−; la modalidad no se puede elegir | alta |
| Paso 1 → viajeros | OK | `/checkout/viajeros` | — |
| Paso 2: datos de viajeros editables | NO IMPLEMENTADO | 0 campos (datos de muestra) | alta |
| Paso 2: "Subir pasaporte" / "Elegir archivo" | FALLA | Sin efecto; no hay `input[type=file]` | alta |
| IVA residente/extranjero dinámico | NO IMPLEMENTADO | Total $660.000 con pasaporte pendiente y cargado; sin selector de residencia | alta |
| Paso 2 → pago | OK | `/checkout/pago` | — |
| Paso 3: elegir método (PSE, Nequi, Tarjeta, Bancolombia, Daviplata) | NO IMPLEMENTADO | El clic no cambia la selección ni el botón "Pagar $102.200" | alta |
| Paso 3: "Divide tu cuenta" (Split Fare) | FALLA | Sin efecto; `/checkout/divide-tu-cuenta` solo se alcanza por URL | media |
| Divide tu cuenta: invitar / "Compartir enlaces por WhatsApp" | FALLA | 0 campos; el botón no hace nada | media |
| Pagar sin sesión → "Inicia sesión para pagar" | OK | Redirige a `/iniciar-sesion?next=%2Fcheckout%2Fprocesando` | — |
| Login desde el pago → procesando | OK | Vuelve a `/checkout/procesando` | — |
| Pagar con sesión → procesando | OK | `/checkout/procesando` | — |
| Procesando → confirmación automática | FALLA | A los 9 s sigue en procesando; solo avanza al hacer clic en la tarjeta | media |
| Confirmación con datos de la compra | PARCIAL | Correo fijo `andres.gil@correo.com` y tour fijo, no los del usuario ni del carrito | media |
| Confirmación: "Agregar al calendario", "Compartir con los viajeros", "Ver oferta", "Conocer" | FALLA | Los 4 sin efecto | media |
| Confirmación → "Ir a Mis reservas" | OK | `/mis-reservas` | — |
| Estados rechazado / enlace vencido / cupo agotado se muestran | OK | Avisos "Tu banco rechazó el pago", "Tu enlace de pago venció", "Alguien reservó el último cupo" | — |
| Botones de esos estados ("Intentar de nuevo", "Cambiar método de pago", "Generar nuevo enlace", "Elegir otra fecha", "Ver otras fechas", "Avísame si se libera") | FALLA | Los 6 sin efecto | media |
| Estados de error alcanzables desde el flujo | NO IMPLEMENTADO | Solo existen por URL; "Pagar" siempre lleva a procesando y luego a confirmación | media |
| `/pago/saldo` y `/pago/participante`: Pagar | OK | Piden login y siguen a procesando | — |
| Contraste en tema claro | FALLA | "Quedan 14 cupos…", "Si alguien no paga su parte…", "Subir pasaporte" a 2,41:1 | media |
| Inglés | FALLA | 15–23 frases en español por página ("Revisa tu viaje", "Paga tu reserva", "¿Quiénes viajan?"…) | media |

### Mis reservas, voucher, cancelar, reprogramar, calificar

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Pestañas Próximas / Por pagar / Completadas / Canceladas | FALLA | Son un único `<button>` con 5 hijos y sin `role=tab`; el clic no hace nada | alta |
| Buscador "Buscar por tour o referencia" | NO IMPLEMENTADO | 0 inputs | baja |
| "Ver detalle" | FALLA | Navega a `/tour` (sin slug) en lugar de `/mis-reservas/detalle` | media |
| Enlace "Voucher" de la reserva próxima | OK | `/mis-reservas/voucher` | — |
| Botón "Voucher" de la 2ª reserva | FALLA | Sin efecto | media |
| "Pagar saldo" | OK | `/pago/saldo` | — |
| Detalle de reserva (por URL) | OK | Panel con crew, datos y acciones | — |
| Detalle: "Descargar voucher" y "Reprogramar" | OK | Navegan a voucher y reprogramar | — |
| Detalle: "Cancelar reserva" | FALLA | Sin efecto | alta |
| Detalle: "Chat del tour" | FALLA | Sin efecto | media |
| Detalle: cerrar con Escape | FALLA | Sigue en `/mis-reservas/detalle` | baja |
| Voucher: QR y referencia | PARCIAL | Referencia BT-2026-00418 visible; QR fijo de diseño | media |
| Voucher: "Descargar PDF" | FALLA | Sin descarga ni pestaña nueva | alta |
| Voucher: "Agregar al calendario" | FALLA | Sin efecto | media |
| Cancelar: penalidad según política | OK | "Penalidad 40 %" (franja de 10 o más días) | — |
| Cancelar: elegir motivo | NO IMPLEMENTADO | 0 opciones | baja |
| Cancelar: "Confirmar cancelación" | FALLA | Sin efecto (no va a `/cancelacion-confirmada`) | alta |
| Cancelar: alternativa "Reprogramar" | OK | `/mis-reservas/reprogramar` | — |
| Cancelación confirmada: "Ir a mis reservas" | OK | `/mis-reservas` | — |
| Cancelación confirmada: "Ver otras fechas" | FALLA | Sin efecto | baja |
| Saldo a favor como crédito, sin Coins | OK | "Valor a tu favor"; no menciona Coins | — |
| Reprogramar: elegir nueva fecha | NO IMPLEMENTADO | 10 fechas dibujadas sin selección | alta |
| Reprogramar: "Reprogramar y pagar $30.000" | FALLA | Sin efecto | alta |
| Calificar: estrellas y comentario | NO IMPLEMENTADO | 0 controles | alta |
| Calificar: "Enviar calificación" | FALLA | Sin efecto | alta |
| Completadas: "Calificar" | OK | `/mis-reservas/calificar` | — |
| Reembolso (retracto/fuerza mayor) | NO IMPLEMENTADO | 0 campos; "Enviar solicitud" sin efecto | media |
| Contraste | FALLA | Tema claro: avatar "VD" a 2,41:1. Tema oscuro: "Cancelada" y "Sold out" a 3,59:1 | baja |
| Inglés | FALLA | 22–31 frases en español por página | media |

### Sidebar y menú de cuenta

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Enlaces del sidebar (Explorar, Mis reservas, Mis tours, Favoritos, Mensajes, Soporte) | OK | Todos llegan a su página | — |
| Sidebar fijo | OK | Fijo a la izquierda con el alto de la ventana | — |
| Menú de cuenta (avatar) | FALLA | El clic no abre ningún menú | alta |
| "Cerrar sesión" en `/mis-reservas`, `/perfil` y `/notificaciones` | FALLA | No existe en esas pantallas | alta |
| "Cerrar sesión" en `/estados/perfil-menu` | OK | Borra la sesión y lleva a `/`; ninguna navegación lleva a esa pantalla | — |

### Perfil, notificaciones, mensajes, soporte, mis tours

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Perfil: datos personales editables | NO IMPLEMENTADO | 0 campos | alta |
| Perfil: "Guardar cambios", "Cambiar foto", "Solicitar eliminación" (Ley 1581) | FALLA | Los 3 sin efecto | media |
| Perfil: navegación por secciones | OK | "Apariencia" hace scroll a su sección | — |
| Perfil: interruptores de notificaciones/apariencia | NO IMPLEMENTADO | 0 interruptores reales | media |
| `/notificaciones` | PARCIAL | Es el perfil con la sección de preferencias; no hay centro de notificaciones | media |
| Mensajes: escribir y enviar | NO IMPLEMENTADO | 0 campos de texto | media |
| Mensajes: cambiar de conversación | FALLA | Sin efecto | media |
| Mensajes: "Ver mi reserva" | FALLA | Sin efecto | baja |
| Soporte: "Escribir por WhatsApp" | FALLA | Sin efecto (el FAB sí abre WhatsApp) | media |
| Soporte: "Preguntas frecuentes" / "Cotiza con un asesor" | OK | Navegan a `/preguntas-frecuentes` y `/contacto` | — |
| Soporte: vista propia | PARCIAL | Panel de ayuda sobre el fondo del perfil | baja |
| Mis tours: "Compartir mi mapa" | FALLA | Sin efecto | baja |
| Mis tours: km recorridos | PARCIAL | Muestra "— km" | baja |
| Mis tours: contraste | FALLA | Etiqueta "San Andrés" a 1,18:1 en los 3 temas | media |
| Contraste del perfil en tema claro | FALLA | "VD" y "El documento no se puede cambiar…" a 2,41:1 | baja |

### Contacto (`/contacto` y formulario de Nosotros)

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Validación con campos vacíos | OK | "Escribe tu nombre (mínimo 3 letras).", "Escribe tu correo." | — |
| Correo inválido | OK | `aria-invalid` en el correo | — |
| Consentimiento obligatorio | OK | "Debes autorizar el tratamiento de datos…"; no envía | — |
| Envío válido → confirmación | OK | Panel "¡Mensaje enviado!…" en ambos formularios | — |
| `/contacto`: campo de mensaje | FALLA | "Cuéntanos en qué te ayudamos…" es un dibujo, no un `textarea`; en Nosotros sí existe | media |
| Limpieza del formulario tras enviar | FALLA | Nombre y correo conservan su valor y la casilla sigue marcada | baja |
| Anti-spam: campo trampa | OK | `website` de 1×1 px, `aria-hidden`, `tabindex=-1` | — |
| Anti-spam: 2º envío antes de 30 s | PARCIAL | No aparece aviso; no se pudo confirmar si se bloquea en silencio | baja |

### Blog

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Chips de categoría | FALLA | Sin efecto; los mismos artículos | media |
| Tarjeta → artículo | OK | `/blog/articulo?art=como-se-toma-un-cafe-de-origen…` | — |
| El artículo corresponde al elegido | PARCIAL | Siempre muestra "Cómo vivir el páramo sin afectarlo" | media |
| Artículo destacado → artículo | OK | `/blog/articulo` | — |
| Newsletter "Suscribirme" | FALLA | No hay input de correo; el botón no hace nada | baja |
| Artículo: tours relacionados → detalle | OK | `/tour?tour=valle-del-cocora-y-salento` | — |
| Inglés | OK | Solo queda el placeholder "tu@correo.com" | — |

### Nosotros y legal

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Submenú Historia / Equipo / Contacto / Legal | OK | Scroll a la sección (scrollY 0 → 1177) | — |
| Centro legal: acordeón exclusivo | OK | Abrir el 3º cierra el 1º | — |
| Cerrar el documento abierto | OK | Todos `aria-expanded=false` | — |
| Pie `/nosotros#privacidad` abre ese documento | OK | Política de datos abierta, scroll a la sección | — |
| `/legal`: secciones | PARCIAL | Documento estático, sin despliegue | baja |
| `/politica-de-cancelacion` coincide con las reglas | OK | 40 / 60 / 100 % presentes | — |
| FAQ: buscador | NO IMPLEMENTADO | Placeholder sin input | media |
| FAQ: acordeón de preguntas | NO IMPLEMENTADO | El clic no despliega nada | media |
| Inglés en legal y FAQ | FALLA | 4–11 frases en español; mezclas como "5 days hábiles" | baja |

### Errores, 404 y cookies

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Ruta inexistente → 404 | OK | HTTP 404, "Este camino no aparece en el mapa" | — |
| 404: "Volver al inicio" y "Explorar tours" | OK | Navegan a `/` y `/explorar` | — |
| `/error` y `/sin-conexion`: "Reintentar" | OK | Recargan la página | — |
| `/error`: "Contactar soporte" | FALLA | Sin efecto | baja |
| Banner de cookies en la primera visita | NO IMPLEMENTADO | Sin `borondo.cookies`, el Home no muestra banner; solo existe `/estados/cookies` | media |
| `/estados/cookies`: "Rechazar opcionales" | OK | Guarda `borondo.cookies=essential` y vuelve a `/` | — |
| `/discovery` (página antigua) | FALLA | Llama a `/api/v1/tours/search` y recibe 404 en las 5 combinaciones | baja |

### Transversal: temas, idioma y móvil

| Función | Resultado | Evidencia | Gravedad |
|---|---|---|---|
| Tema colorido | OK | 0 textos bajo AA en la mayoría de las páginas; excepciones: sello "Agotado" 2,68:1 y "San Andrés" en Mis tours 1,18:1 | baja |
| Tema claro | FALLA | El token gris secundario queda en 2,41:1 sobre las superficies claras: checkout, viajeros, perfil, reseñas del tour, avatar "VD". Mapa: 1,12:1 | media |
| Tema oscuro | PARCIAL | Insignias "Cancelada", "Finalizado", "Sold out" y "Próximamente" a 3,59:1 | baja |
| Inglés en páginas públicas (Home, Explorar, Blog, Nosotros, Recuperar) | OK | 0–1 frases residuales | — |
| Inglés en checkout, área privada y estados | FALLA | Ver los puntos anteriores; nombres propios traducidos ("Guatapé and El Peñol") | media |
| Escritorio 1440×900 sin desborde horizontal | OK | 0 px de desborde en las 345 cargas | — |
| Móvil 390×844 (Home, Explorar, detalle, checkout) | FALLA | Escala 0,27; texto de unos 5 px, botones de unos 12 px; sin hamburguesa | alta |
| Errores JS (`pageerror`) | OK | 0 en 345 cargas y en todas las interacciones | — |

---

### Notas de método

- "Sin efecto" significa que tras el clic no hubo navegación, pestaña nueva, descarga ni diálogo, y como máximo hubo 1–3 mutaciones del DOM (el estado de foco o hover). Varios controles marcados FALLA son botones del diseño a los que ningún módulo del runtime conecta lógica (`FigmaRuntime.astro` enruta por texto solo unos 15 rótulos).
- El contraste se calculó componiendo los colores de fondo de los ancestros. Los textos sobre imagen o degradado no se evaluaron, así que puede haber más casos sobre fotos.
- La detección de español residual en modo `en` usa una lista de palabras frecuentes. Los conteos son aproximados; los ejemplos citados son reales.
- No se probaron pagos reales (OnePay.la), envío real de correos ni backend: el B2C funciona hoy en modo demostración, con datos en `localStorage` y `sessionStorage`.
