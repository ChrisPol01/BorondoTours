# Mapeo frontend B2C — pantallas → componentes (notas de trabajo)

> Notas escritas lote a lote mientras se revisan los tramos. Fuente: `otros/design/b2c/tramos/*/tramo-0X.png`.
> ⚠️ = hallazgo que se corrige en Figma (no se copia del mockup).

## 01–04 (registrado antes)
- 02 Catálogo / 03 Detalle: badges "Por Ave Azul / Por EcoRutas / Por Amazonía Viva" ⚠️ quitar (marca blanca).
- 04 Checkout: 3 pasos + confirmación, sidebar de usuario logueado.

## Layout del portal privado (05–11)
- **PortalHeader** (azul profundo, ancho completo): logo, nav pública (Destinos, Experiencias, Nosotros, Blog, Contacto), iconos buscar / favoritos / campana con contador (dorado), avatar + nombre + nivel + chevron.
- **PortalSidebar** (oscuro): ítem activo = pill turquesa con chevron. Ítems: Mi Panel, Mis Tours, Mi Perfil, Borondo Coins, Favoritos, Mensajes (contador turquesa), Configuración.
  - Widget **PromoCoins** "Gana más Borondo Coins" (plegable, imagen monedas, botón outline "Conocer más →").
  - Widget **HelpCard** "¿Necesitas ayuda?" + botón turquesa "Ir a soporte" + icono headset.

## 05 Mi Panel
- Saludo H1 "¡Hola, Andrés! 👋" + subtítulo. ⚠️ emoji en UI core (la voz de marca solo permite emojis en push) → quitar.
- **NextTourHero**: foto full-width + panel glass (badge "PRÓXIMO TOUR", título, subtítulo, fecha, ubicación, **Countdown** días/horas/min/seg, CTA dorado "Ver detalles del viaje →") + pill de estado "Confirmado ✓".
- **StatCard** ×3 (icono circular + label + valor + sparkline):
  - Tours completados 7.
  - Borondo Coins 12.500 "Equivale a $125.000 COP" ⚠️ con ratio default 100:500 serían $62.500 → usar valor calculado por token/ratio.
  - Nivel "Aventurero ★★★" + **ProgressBar** "1.250 XP para llegar a Explorador 62%" ⚠️ orden invertido. Canónico (Spec-E): Explorador → Viajero → Aventurero → Conquistador → Embajador. Header dice "Aventurero Nivel 2" ⚠️ (Aventurero es nivel 3).
- **ActivityTimeline**: nodos con icono de color + texto + tiempo relativo; link "Ver toda mi actividad →".
- **Carrusel "Tours recomendados para ti"**: TourCard (corazón, badge de región, título, duración, dificultad, "Desde $X COP"), flechas prev/next, "Ver todos".

## 06 Mis Tours
- **Tabs** Próximos / En curso / Completados (subrayado turquesa).
- **BookingRow**: imagen, título, fecha, ubicación, "N viajeros" + **AvatarStack** (+N), **StatusPill** (Confirmado verde / Pendiente de pago dorado / Hold gris), "En N días", acciones Ver detalles (outline), Descargar voucher (outline+icono), Contactar guía (WhatsApp), Completar pago (CTA dorado).
  - ⚠️ "Hold" es nombre de estado interno → texto de usuario (ej. "Reserva parcial · saldo pendiente").
  - ⚠️ Voucher solo en CONFIRMED/COMPLETED (Spec-D RF-D06): ocultar en Pendiente/Hold.
  - ⚠️ "Contactar guía" por WhatsApp: el canal con el cliente es el chat tripartito (se habilita 24h antes, Spec-D RF-D08 / Spec-I RF-I20) → "Abrir chat" deshabilitado con countdown.
- Botón "Ver más próximos tours ▾".
- **Sección En curso**: badge "En vivo"; card del tour (imagen, fechas, ubicación, "En ruta • 2.850 m s.n.m."); **GuideCard** (avatar, nombre, "Guía profesional certificado", rating, teléfono, WhatsApp directo); **MapCard** Mapbox con ruta, zoom y "Ubicación del grupo · actualizado hace 2 min"; **ItineraryTimeline** del día (checks); **EmergencyButton** (outline danger).
  - ⚠️ Rating del guía no se muestra al cliente (Spec-D RF-D09: solo en panel privado del guía y reportes del operador) → quitar.
  - ⚠️ Teléfono/WhatsApp directo del guía → reemplazar por "Abrir chat del tour".
  - ⚠️ Mapa GPS solo si el operador activó "Los clientes pueden ver el GPS" (default OFF, Spec-I RF-I20) → diseñar estado con y sin mapa.
- **Completados**: filtros Select Año / Destino; grid **CompletedTourCard** (imagen, corazón, título, fecha, ubicación, **Rating** estrellas, chip "+250 Coins", botón "Ver detalles" o "Dejar reseña ★" outline dorado); "Ver más tours completados ▾".

## 07 Detalle de Reserva
- **Breadcrumb** Mis Tours › Reserva #BT-2025-0456.
- **ReservationHero**: foto + StatusPill "Confirmado", título, duración, región, fechas, nº de reserva; botón blanco "Ver detalles del tour ↗".
- **ItineraryCard**: grupos por día ("Día 1 · Martes 20 de mayo") con timeline, hora + actividad + dirección; **InfoNote** "Este itinerario puede estar sujeto a cambios…".
- **TravelersCard** "Viajeros (3)" + "Ver detalles": **PassengerRow** (avatar, nombre, documento, badge Adulto / Niña 8 años) + botón dashed "+ Agregar viajero".
  - ⚠️ Documento completo visible (PII) → enmascarar (`C.C. •••• 7890`).
  - "Agregar viajero" solo si faltan ≥5 días (APP1 Flujo E); si no, deshabilitado con tooltip.
- **PaymentsCard**: total, pagos realizados (verde), saldo pendiente, fecha límite; tabla **SplitFareTable** (nombre, Pagado ✓ / Pendiente, monto); CTA "Realizar pago"; "Ver factura".
  - ⚠️ Estado "Confirmado" + saldo pendiente se contradicen (CONFIRMED = 100% pagado). Con saldo → "Reserva parcial" (PARTIAL_PAID).
- **DocumentsCard**: **DocumentRow** (icono PDF, nombre, peso, descargar) para voucher, factura electrónica y póliza de seguro; "Descargar todos"; nota "Lleva estos documentos contigo".
- Card "Guía / Operador" ⚠️: rating del guía, teléfono, "Enviar WhatsApp", badge "Operador certificado", "Ver perfil". Rehacer como **GuideCard** "Tu guía": avatar + nombre + "Guía profesional certificado" + botón "Abrir chat del tour" (habilitado 24h antes). Sin operador, sin rating, sin teléfono.
- **CancellationPolicyBanner** (fondo cálido + icono alerta): texto "sin penalidad hasta 7 días… cargos del 50%" ⚠️ no coincide con ADR-007. Texto dinámico por franja: ≥10 días reprogramar gratis / penalidad 40%; 5–9 días 60%; <5 días 100%. Acciones: Modificar reserva (turquesa), Cancelar reserva (outline danger), Contactar soporte (outline); "Ver política completa →".
- **MeetingPointCard**: Lugar, Referencia, Fecha y hora, "Cómo llegar" (turquesa), "Agregar a calendario" (outline) + **MapCard** Mapbox con pin y popup.

## 08 Mi Perfil
- **ProfileCover**: portada + botón glass "Cambiar portada"; **Avatar** grande con botón cámara; nombre, email, **LevelBadge** "Aventurero Nivel 2" ⚠️ (Aventurero = nivel 3), "Miembro desde Junio 2024".
- **PersonalInfoCard**: **InfoRow** (icono + label + valor): Nombre, Apellido, Email (candado "No editable"), Teléfono, Fecha de nacimiento, Nacionalidad; bloque documento (Select tipo + número); "Editar" y "Guardar cambios".
  - ⚠️ El documento no se puede cambiar una vez registrado (APP1 Flujo E) → bloquear como el email.
- **TravelPreferencesCard**: **DifficultyChip** (Familiar verde / Moderado dorado / Aventurero naranja / Extremo rojo) + slider; regiones favoritas con **Tag** removible turquesa + "+ Agregar más" (dashed); **Textarea** condiciones médicas "(Confidencial)" con candado; dieta con **RadioChip** (Omnívoro, Vegetariano, Vegano, Otro).
  - ⚠️ Datos de salud: consentimiento explícito separado (Ley 1581) → agregar checkbox de autorización.
- **SecurityCard**: 3 **PasswordInput** (ojo) + "Actualizar contraseña"; **Toggle** "Autenticación en dos pasos"; **SessionRow** (icono dispositivo, nombre, ciudad, "Activa ahora" / "Hace 2 días") + "Cerrar todas las sesiones" (outline danger).
  - Cambio de contraseña exige OTP (Spec-F RF-F06) → diseñar paso OTP. MFA TOTP es Fase 3; mostrar como "Próximamente" o dejar fuera en Fase 1.
- **NotificationsCard**: Toggles agrupados Email / Push / WhatsApp (ofertas, recordatorios, actualizaciones de reserva).
  - ⚠️ "Actualizaciones de reserva" es transaccional (obligatoria) → toggle bloqueado en ON con candado.
  - ⚠️ Marketing (ofertas) debe venir en OFF por defecto (opt-in, Ley 1581).
- **SavedDocumentsCard**: pasaporte (miniatura, "Nº AU123456", fecha de subida) + badges "Verificado ✓" / "IVA exento disponible ✓"; **Dropzone** "+ Subir nuevo documento" (JPG, PNG, PDF, máx. 10 MB).
  - ⚠️ Nº de pasaporte completo → enmascarar.
- **DangerZoneCard** (borde danger, fondo rojo suave): "Eliminar mi cuenta" + texto de retención DIAN 5 años + botón outline danger. ✔ alineado con Ley 1581.

## 09 Borondo Coins
- **CoinsBalanceCard** (fondo turquesa claro + ilustración de monedas): "Tu balance actual 12.500 Borondo Coins" + chip "= $125.000 COP en descuentos" ⚠️ ratio (ver 05).
- **LevelCard** "Tu nivel actual": emblema, nombre del nivel, "¡Vas por buen camino!", ProgressBar "12.500 / 15.000 coins · Faltan 2.500 coins para Conquistador".
  - ⚠️ El nivel se mide en **XP**, no en Coins (Spec-E RF-E03). La barra debe decir XP (ej. "5.000 / 12.000 XP").
- **LevelsTrack** "Niveles y beneficios": 5 **LevelTile** (emblema hexagonal + nombre + % + rango), el actual resaltado con fondo arena + pill "Tu nivel actual". Orden correcto: Explorador → Viajero → Aventurero → Conquistador → Embajador ✔.
  - ⚠️ "0.5% de descuento" → es "0.5% en Coins por compra".
  - ⚠️ Rangos en coins → umbrales en XP (100 / 1.500 / 5.000 / 12.000 / 25.000).
  - ⚠️ Emblema morado de Conquistador: el morado no está en la paleta de tokens → usar un token existente o documentar un derivado nuevo.
- **MovementsTable** "Historial de movimientos": **DateRangePicker**, Select "Todos los tipos", columnas Fecha / Concepto / Tipo (badge Ganados verde · Usados rojo) / Coins (+ verde, − rojo) / Saldo; "Ver más movimientos →".
  - Falta "Exportar CSV" (Spec-E RF-E06) → agregar. Nombre del referido → solo iniciales.
- **QuickSummaryCard**: Total ganado / Total usado / Balance actual + InfoNote "Tus coins no vencen y son acumulables" ✔.
- **HowToEarnGrid**: 5 **EarnCard** (icono circular de color + título + descripción + recompensa): Completa tours, Deja reseñas, Refiere amigos (200 ✔), Cumpleaños (300), Nivel premium (+20%); "Ver todas las formas de ganar →".
  - ⚠️ Los valores salen de `CoinRewardConfig`. "Cumpleaños" y "Nivel premium +20%" no existen en la spec → reemplazar por "Ver anuncios (10 coins, máx. 3/día)" y "Completa tu perfil (100)". Reseñas = 50 tour + 30 guía.
- Sidebar: variante de copy del widget ("¡Entre más viajas, más ganas!" / "¿Tienes dudas?") → el **PromoCoins** necesita prop de texto.

## 10 Favoritos
- **PageHeader**: H1 + subtítulo + acciones "Compartir lista" (outline) y "Explorar tours" (turquesa).
- **CollectionsPanel**: título + "+ Nueva colección"; **CollectionItem** (miniatura, nombre, contador), el activo "Todos mis favoritos" con icono corazón; **EmptyState** dashed "Crea colecciones y organiza tus tours favoritos · Crear colección →".
  - ⚠️ Colecciones y "Compartir lista" no existen en el modelo (`UserFavorites` = user_id + tour_id) → marcar como Fase 2 o crear tablas nuevas. En Fase 1: solo "Todos mis favoritos".
- Grid "Todos mis favoritos (8)" + Select "Ordenar por: Más reciente".
- **FavoriteTourCard**: imagen con corazón lleno + botón X quitar, título, ubicación, duración, "Desde $X COP", badge Disponible / No disponible, CTA "Reservar" con icono calendario.
  - ⚠️ Con "No disponible" el CTA sigue activo → cambiar a "Avisarme" (lista de espera, Spec-B RF-B05b). Corazón rojo → token `derived-danger`.
- **CtaBanner** "¿No encuentras lo que buscas?" (ilustración mochila) + "Explorar todos los tours →" (outline).

## 11 Mensajes
- PageHeader: "Mensajes" + "Conecta con nuestros operadores, guías y soporte" ⚠️ → "Conecta con tu guía y con el equipo de BorondoTours".
- **ConversationList**: **SearchInput** "Buscar conversaciones…" + botón filtro; Tabs Todas / No leídas / Favoritas con contador; **ConversationItem** (avatar + punto en línea, nombre + rol, preview, hora, contador turquesa, campana silenciada).
  - ⚠️ "Laura Salazar (Operadora)" → quitar (marca blanca).
  - ⚠️ Chats de grupo entre viajeros ("Andrés & Familia", "Expedición Amazonía") no están en la spec → fuera de Fase 1.
  - Válidos: chat del tour (por reserva) y "Soporte BorondoTours" (avatar con isotipo). "Logística BorondoTours" → mejor como notificación, no como chat.
- **ChatThread**:
  - Header: avatar, nombre, "En línea", botones llamada / video / menú ⚠️ llamada y video no están en la spec (solo texto + fotos, Spec-D RF-D08) → quitar.
  - **DateSeparator** (pill); **MessageBubble** entrante (blanco) / saliente (verde claro) con hora + doble check; **FileBubble** (PDF, nombre, peso).
  - **Composer**: clip adjuntar, input, emoji, botón enviar turquesa.
  - ⚠️ Es chat tripartito (cliente + guía + agente BorondoTours) → el header debe mostrar los 3 participantes.
  - Estado bloqueado "El chat se habilita 24h antes del tour" + countdown.
  - Estado solo lectura cuando el tour termina.
- **ConversationInfoPanel**: portada + avatar + nombre + "Guía profesional certificado" + pill "En línea"; "Sobre esta conversación" (Reserva, Tour, Fecha, "Ver detalles de la reserva"); Opciones (Ver perfil, Archivos compartidos, Fotos compartidas, Toggle silenciar, "Reportar conversación" en danger).
  - "Ver perfil" del guía → quitar (no hay perfil público del guía).

## 12 Destinos (pública)
- **Navbar pública**: logo, links, corazón, bolsa con contador ⚠️ (no hay carrito multi-ítem en el modelo: 1 checkout = 1 reserva) → quitar la bolsa. CTA dorado "Planifica tu viaje" con icono calendario.
- **PageHero**: foto + **Breadcrumb** Inicio › Destinos + H1 "Nuestros Destinos" + subtítulo + **GlassStatChip** (pin + "7 regiones increíbles · Más de 250 tours disponibles").
- **RegionCard** ×7 (foto completa, icono cuadrado de color arriba a la izquierda, nombre, "N tours disponibles", botón circular flecha turquesa). Grid 4 + 3 centrado.
  - Regiones del mockup: Caribe, Eje Cafetero, Andes, Amazonas, Llanos Orientales, Pacífico, Santanderes.
  - ⚠️ Spec-A usa Bogotá DC en vez de Santanderes; ahora las regiones vienen de la tabla `Regions` (K-RF12) → datos dinámicos.
  - ⚠️ Iconos morado y naranja fuera de paleta → mapear a tokens.
- **CtaBanner con mascota**: ilustración del colibrí barbudo (Chivito) + "¿No sabes por dónde empezar?" + CTA dorado "Quiero recomendaciones" (icono sparkle). Confirmar uso del isotipo como mascota ilustrada (el manual no lo define).
- **Footer** (azul profundo + patrón topográfico):
  - Columna de marca: logo + slogan + redes (círculos outline dorado: Instagram, Facebook, YouTube, TikTok).
  - Columnas: Destinos, Experiencias (Aventura, Cultura, Naturaleza, Bienestar, Gastronomía), Información (Quiénes somos, FAQ, Términos, Privacidad, Blog), Contacto (teléfono, email, ciudad).
  - Barra inferior: "© Borondo Tours" + "Hecho con ♡ en Colombia".
  - ⚠️ Faltan los 4 trust badges que el manual pide en el footer → agregarlos.
  - Ciudad "Medellín" vs sede fiscal Cali (ADR-009) → confirmar.

## 13 Experiencias (pública)
- Navbar con **estado activo** del link (subrayado turquesa) → variante `active` del NavLink.
- PageHero (breadcrumb + H1 "Experiencias Únicas" + subtítulo).
- **SectionTitle** centrado + divisor decorativo (línea + punto turquesa).
- **ExperienceCard** ×5 (tarjeta vertical alta, foto completa, icono circular de color arriba a la izquierda, panel glass con título + descripción, link de color "Explorar trekking →"): Trekking (turquesa), Avistamiento (verde), Cultural (dorado), Gastronomía (naranja), Aventura Extrema (rojo).
  - ⚠️ Naranja/rojo → tokens `derived-adventure` / `derived-danger`. Verificar contraste de los links de color sobre el glass oscuro.
  - ⚠️ "Trekking" y "Avistamiento" no son valores de `Tours.category` (NATURALEZA, AVENTURA, CULTURAL, GASTRONOMICO, URBANO…) → decidir si son categorías o tags.
- **StatsStrip** (fondo arena + patrón topográfico, 4 ítems con icono en círculo outline): +250 experiencias únicas, Expertos locales, Seguridad garantizada, Turismo responsable → reutilizar como variante del **TrustBadge**.
- Footer: la columna "Experiencias" cambia respecto a 12 (Trekking, Avistamiento… vs Aventura, Cultura, Naturaleza, Bienestar…) ⚠️ unificar en un solo Footer.

## 14 Blog (pública)
- **BlogHero**: foto + H1 "Blog de Viajes" + subtítulo + **SearchInput glass** "Buscar artículos…" a la derecha.
- **FilterChips**: Todos (activo, turquesa relleno) · Destinos · Trekking · Cultura · Gastronomía · Aventura · Consejos (outline pill) + Select "Ordenar por: Más recientes".
- **BlogCard** (grid 3 col): imagen + **CategoryBadge** de color, fecha + tiempo de lectura, título H4, extracto, "Leer más →" + corazón guardar.
  - ⚠️ Badge "Cultura" morado → token.
- **Pagination**: prev/next circulares, números circulares (activo turquesa), elipsis.
- Sidebar:
  - **CategoriesCard** (icono circular + nombre + contador).
  - **PopularArticlesCard** (miniatura + título + "12.5K lecturas").
  - **NewsletterCard** (azul profundo + ilustración de colibrí + input glass + CTA dorado "Suscribirme →").
    - ⚠️ Newsletter = marketing → checkbox de consentimiento explícito (Ley 1581).
    - ⚠️ El colibrí de la ilustración no es el Oxypogon guerinii → usar la mascota Chivito.
- ⚠️ Blog no tiene Spec funcional. Encaja con Astro Content Collections (SSG, SEO) → definir fuente de contenido.
- Falta la plantilla de **artículo individual** (no hay mockup) → diseñarla.

## 15 Nosotros (público)

**Estructura:**
1. Navbar pública (NavLink "Nosotros" activo con subrayado turquesa) + favoritos + bolsa (⚠️ bolsa fuera de spec) + CTA dorado "Planifica tu viaje".
2. PageHero con foto de equipo sobre paisaje de páramo/laguna: H1 "Sobre Borondo Tours" + subtítulo "Más que viajes, creamos conexiones que transforman." (sin breadcrumb ni GlassStatChips aquí).
3. Sección "Nuestra historia" (SectionTitle con línea turquesa a la izquierda): H2 + 3 párrafos con negritas + firma (SignatureBlock: firma manuscrita + nombre + cargo) | imagen redondeada (palmas de cera, Eje Cafetero).
4. Sección "Nuestros valores": 4 ValueCard (icono lineal + H4 + texto) — Turismo Responsable (hoja, fondo verde tenue), Experiencias Únicas (cámara, azul tenue), Seguridad Garantizada (escudo, dorado tenue), Atención Personalizada (personas, turquesa tenue). **Son las mismas 4 promesas del TrustBadge** → reutilizar componente con variante `card` (vs variante `inline` del footer).
5. Sección "Nuestro equipo fundador": 4 TeamMemberCard (avatar circular grande + nombre Sora + cargo + iconos sociales LinkedIn/Instagram/TikTok).
6. Footer.

**Componentes nuevos:** SignatureBlock, ValueCard (= TrustBadge variante card), TeamMemberCard, SocialIconLink (reutilizable en footer), ImageFrame redondeado (radius card).

**⚠️ Observaciones:**
- Nombres del equipo (Camilo Restrepo, Laura Mejía, Andrés Gil, Valentina López) son placeholder — el steering de marca usa "Andrés Morales, CEO & Fundador" en la tarjeta de presentación. Confirmar nombres reales o usar placeholders genéricos (regla PII: placeholders en diseño).
- "Nació en 2018" y "equipo de guías locales en el Eje Cafetero": copy de historia a confirmar con el negocio (el modelo actual es marketplace de operadores; no afirmar que los guías son propios — coherente con marca blanca).
- Colores de fondo de ValueCard (dorado/verde/turquesa tenues): mapear a `color-mix` de tokens, no hex libres.
- Footer: "Medellín, Colombia" vs sede Cali (ADR-009) → pendiente confirmar. Columna Experiencias: Trekking/Avistamiento/Cultural/Gastronomía/Aventura Extrema — unificar con categorías del modelo (NATURALEZA, AVENTURA, CULTURAL, GASTRONOMICO, URBANO…).
- Footer sin los 4 trust badges (deben estar según manual de marca) — aquí aparecen como sección de valores; en el footer global agregarlos igual.

## 16 Contacto (público)

**Estructura:**
1. Navbar pública (NavLink "Contacto" activo).
2. Hero split: izquierda H1 "Contáctanos" + subtítulo sobre foto (laguna/embalse); derecha **ContactForm en GlassPanel** (título "Envíanos un mensaje" con subrayado turquesa): Input con icono (Nombre completo), Input con icono (Correo), Select (Asunto), Textarea (Mensaje), botón CTA dorado full-width "Enviar mensaje" + icono avión.
3. Columna izquierda "Información de contacto": 4 ContactInfoItem (icono en círculo azul-profundo + título + valor + nota): Email, Teléfono (horario L-V), WhatsApp, Dirección (+ link "Ver en Google Maps →").
4. HoursCard (fondo arena): tabla de horarios (L-V, Sábado, Domingos y festivos) + línea con escudo "Atención 24/7 para viajeros en ruta".
5. Columna derecha "Visítanos en nuestra oficina": MapCard (Mapbox) con MapPin personalizado (isotipo) + popover turquesa "Borondo Tours · Oficina 402" + controles zoom/geolocalizar.
6. CtaBanner sobre foto oscura: "¿Tienes preguntas sobre tu viaje?" + CTA dorado "Hablemos por WhatsApp" (icono WhatsApp).
7. Footer.

**Componentes nuevos/reutilizados:** Input con icono leading (variante del Input), Select, Textarea (ya en Perfil), GlassPanel (= Glass Surface de Fase A), ContactInfoItem (IconCircle + texto), HoursCard/HoursTable, MapCard (reutiliza de Detalle de Reserva/Tour, variante con popover), MapPin de marca, CtaBanner variante con foto.

**⚠️ Observaciones:**
- **Ley 1581:** el formulario recoge nombre + email y NO tiene checkbox de autorización de tratamiento de datos → agregar checkbox obligatorio NO pre-marcado + link a Política de Privacidad. Si se ofrece suscripción a novedades, checkbox separado en OFF.
- Formulario sin labels visibles (solo placeholders) → WCAG: agregar labels (pueden ser flotantes) + mensajes de error con `aria-describedby` + estado de éxito (StatusMessage/Toast) tras enviar.
- Campo teléfono opcional recomendado (útil para respuesta por WhatsApp) — decisión de producto.
- Endpoint de contacto: público y sin auth → requiere rate limiting + reCAPTCHA (Spec-F RF-F11) — nota para backend.
- **Sede:** mapa y dirección en El Poblado, Medellín vs Cali (ADR-009 menciona sede en Cali). Pendiente confirmar; dirección y teléfonos son placeholder.
- "Atención 24/7 para viajeros en ruta": compromiso operativo a confirmar con el negocio antes de publicarlo.
- WhatsApp directo de BorondoTours (no del operador) → OK con marca blanca.
- Bolsa/carrito en navbar ⚠️ (igual que el resto).

---

# CONSOLIDADO — Matriz de componentes compartidos

Leyenda de pantallas: 01 Home · 02 Catálogo · 03 Detalle Tour · 04 Checkout · 05 Mi Panel · 06 Mis Tours · 07 Detalle Reserva · 08 Perfil · 09 Coins · 10 Favoritos · 11 Mensajes · 12 Destinos · 13 Experiencias · 14 Blog · 15 Nosotros · 16 Contacto

## A. Globales públicos (se repiten sí o sí)
| Componente | Pantallas | Variantes |
|---|---|---|
| Navbar pública (logo + NavLink + favoritos + CTA) | 01,02,03,12,13,14,15,16 (+04 simplificada) | glass (sobre hero) / sólida; NavLink default/active |
| Footer (4 columnas + redes + trust badges) | todas las públicas | — |
| PageHero (título + subtítulo sobre foto) | 02,12,13,14,15,16 | con/sin Breadcrumb, con/sin GlassStatChips, split con formulario (16) |
| Breadcrumb | 02,03,12,13,14 | — |
| SectionTitle (línea turquesa + título) | 01,03,12,13,14,15,16 | con/sin link "Ver todos" |
| CtaBanner | 01,12,13,14,16 | con mascota Chivito / con foto / con WhatsApp |
| TrustBadge / ValueCard | 01,04,15, footer | inline / card |
| Button (Primario, Hover, CTA, Secundario, Ghost) | todas | + tamaño sm/md/lg, icono leading/trailing, loading, disabled |
| Input / Select / Textarea / SearchInput | 01,02,04,08,10,11,14,16 | con icono, error, disabled |
| Badge / StatusPill / Tag / CategoryBadge | 02,03,05,06,07,09,10,13,14 | semáforo, estados de reserva, dificultad |
| TourCard | 01,02,03,10,12,13 | catálogo / favorito (corazón) / compacta |
| Pagination | 02,09,14 | — |
| FilterChips / Tabs | 02,06,09,10,13,14 | — |
| MapCard (Mapbox) | 02,03,07,12,16 | con popover, con controles |
| Modal / Toast / StatusMessage | 03,04,06,07,08,16 | éxito/error/aviso |
| Rating (estrellas) | 01,02,03,06,13 | solo lectura / input |

## B. Layout del portal (privado, 05–11)
| Componente | Pantallas |
|---|---|
| PortalHeader (búsqueda + notificaciones + avatar/nivel) | 05–11 |
| PortalSidebar (items + contadores + pill activo turquesa) | 05–11 |
| PromoCoins (card de Coins en sidebar, texto por prop) | 05–11 |
| HelpCard ("¿Necesitas ayuda?") | 05–11 |
| PageHeader privado (título + subtítulo + acciones) | 06–11 |
| EmptyState | 06,10,11 |

## C. Dominio (reutilizables entre 2+ pantallas)
- **Reservas:** NextTourHero+Countdown (05) · BookingRow/StatusPill (05,06) · ReservationHero (07) · ItineraryTimeline/ItineraryCard (03,07) · MeetingPointCard (03,07) · TravelersCard/PassengerRow (04,07) · PaymentsCard/SplitFareTable (04,07) · DocumentsCard/DocumentRow (07) · CancellationPolicyBanner (03,04,07) · GuideCard (05,07) · EmergencyButton (07) · CompletedTourCard (06).
- **Perfil:** ProfileCover, Avatar, LevelBadge (05,08,09, portal header), InfoRow, DifficultyChip, RadioChip, PasswordInput, Toggle (08, contacto), SessionRow, Dropzone (04 pasaporte, 08), DangerZoneCard.
- **Coins/Loyalty:** CoinsBalanceCard (05,09), LevelCard/LevelsTrack/LevelTile (09, 08), ProgressBar (05,09), MovementsTable (09), DateRangePicker (02,09), QuickSummaryCard, EarnCard (09).
- **Favoritos/Descubrimiento:** FavoriteTourCard, RegionCard (10,12), ExperienceCard (10,13), CollectionsPanel (⚠️ Fase 2).
- **Mensajes:** ConversationList/Item, ChatThread, MessageBubble, FileBubble, DateSeparator, Composer, ConversationInfoPanel (11).
- **Blog:** BlogHero, BlogCard, CategoriesCard, PopularArticlesCard, NewsletterCard (14) + plantilla de artículo (falta).
- **Institucional:** SignatureBlock, TeamMemberCard, SocialIconLink (15, footer), ContactForm, ContactInfoItem, HoursCard (16).

## D. Lista consolidada de ⚠️ a corregir en Figma
1. **Marca blanca:** quitar "Por [operador]", "Laura Salazar (Operadora)", card "Guía / Operador", teléfono/WhatsApp y rating del guía; reemplazar por "Abrir chat del tour" (habilitado 24h antes). Copy de Mensajes sin mencionar operador. Nosotros: no afirmar guías propios.
2. **Loyalty:** niveles por XP, orden Explorador→Viajero→Aventurero→Conquistador→Embajador (100/1.500/5.000/12.000/25.000); ratio Coins→COP calculado (100 Coins = $500 por defecto), no hardcodeado; quitar "Cumpleaños" y "Nivel premium".
3. **Estados de reserva:** "Confirmado" con saldo → PARTIAL_PAID ("Reserva confirmada · saldo pendiente"); "Hold" → copy de usuario.
4. **Cancelación (ADR-007):** ≥10 días 40% · 5–9 días 60% · <5 días 100%.
5. **PII:** enmascarar documento/pasaporte.
6. **Ley 1581:** consentimientos salud/newsletter/marketing en OFF por defecto; "Actualizaciones de reserva" bloqueado en ON; checkbox de tratamiento de datos en Contacto.
7. **Paleta:** morado, naranja y fondos tenues libres → mapear a tokens / `color-mix`.
8. **Fuera de spec (Fase 2 o quitar):** bolsa/carrito en navbar, colecciones y "compartir lista" en Favoritos, chats grupales entre viajeros, llamada/video en chat.
9. **Accesibilidad:** labels visibles en formularios (16), foco visible, semáforo siempre con texto.
10. **Footer:** agregar 4 trust badges; unificar columna Experiencias con categorías del modelo.

## E. Pendientes a confirmar con el usuario
1. Mascota **Chivito** en CtaBanner: ¿se usa como ilustración recurrente?
2. Sede: **Medellín (El Poblado) vs Cali**.
3. Categorías del footer/Experiencias (Trekking, Avistamiento, Aventura Extrema) vs enum del modelo.
4. **Blog:** fuente del contenido (CMS / markdown estático en Astro) y plantilla de artículo.
5. Nombres reales del equipo fundador o placeholders.
6. Compromiso "Atención 24/7 para viajeros en ruta".
7. Alcance Fase 2 de las funcionalidades fuera de spec (punto D.8).

## F. Resueltos (2026-09-27)
1. **Chivito = el logo.** No es una mascota aparte: es el isotipo (colibrí barbudo del páramo, *Oxypogon guerinii*). Donde el mockup muestra "mascota" se usa el componente `Logo` variante Isotipo. Assets en `otros/design/marca/`.
   - Figma: component set `Logo` (18:155) — `Tipo=Horizontal, Tono=Oscuro` (18:121), `Tipo=Horizontal, Tono=Claro` (18:137), `Tipo=Isotipo` (18:153). Horizontal 161×64 (≥160px mínimo). Isotipo = PNG 1000px recortado; wordmark = vector de `borondo tours nombre v1.svg` (beige original en Oscuro, Negro Volcánico en Claro).
   - Aplicado en Navbar (10:4) y Footer (10:14); se propaga a todas las instancias.
2. **Fotos de prueba:** banco en `otros/design/b2c/fotos-test/` (17 fotos Unsplash 2560px + `destino-ciudad-perdida.png` propia). Registro de autores en `fuentes.json`, reglas en `README.md`. Se reemplazan cuando los operadores suban sus fotos desde el B2B. En Figma se suben copias de 1600px (las de 2560px bloquean el plugin).
   - Home: Hero = Ciudad Perdida + overlay oscuro; TourCards = Cocora, Tayrona, Amazonas, Cartagena. Master TourCard (9:27) con Cocora por defecto.
3. **Mockups completos sin partir:** `otros/design/b2c/web/` (referencia visual por pantalla; los tramos siguen en `tramos/`).

## G. Decisiones del usuario (2026-09-27, 2ª ronda)
1. **Sede: Cali.** Footer y Contacto → "Cali, Colombia"; mapa de Contacto centrado en Cali (dirección exacta pendiente).
2. **Blog = reseñas + artículos aprobados** por BorondoTours antes de publicarse al cliente final (flujo de moderación). No existe Spec funcional de Blog → crear (autor, estados BORRADOR/EN_REVISION/PUBLICADO/RECHAZADO). Las reseñas siguen la regla de Spec-B (solo reservas COMPLETED) y respetan marca blanca.
3. **Equipo fundador: nombres reales** — Christopher Epe y Nathalia Salcedo (cargos por confirmar). Sin firma manuscrita real en Nosotros (usar nombre tipográfico). Contacto solo con canales corporativos.
4. **Atención:** agente humano 8×6 (8 h/día, 6 días; franja horaria por confirmar) + chatbot 24/7 para solicitudes genéricas. ⚠️ El chatbot está diferido en Spec-A (H-47, Fase 3+): la copy "24/7" solo se publica cuando el chatbot esté activo.
5. **Categorías de experiencias:** propuesta alineada al enum `Tours.category` (ver respuesta al usuario) — pendiente aprobación.
