/**
 * Catálogo de recursos en español (`es`) — idioma por defecto y de respaldo del
 * Portal B2C en Fase 1 (R19.2, R19.4).
 *
 * Forma consistente con los recursos de i18next y con el tipo `LanguageCatalog`
 * de `lib/i18n/resolve.ts`: `{ [namespace]: { [key]: value } }`. Las claves
 * anidadas se expresan de forma plana con notación de punto dentro del
 * namespace (p. ej. `"error.timeout"` bajo `common`), tal como las consumen
 * `resolve()` y la capa de fetch (`t('common:error.*')`).
 *
 * Los textos siguen la voz de marca (cercana, en segunda persona) y el copy
 * aprobado en el manual de marca (hero, buscador, promesas de valor).
 *
 * TypeScript strict, sin `any`. El contenido en `en` se prepara en la estructura
 * (`resources/en.ts`) pero permanece vacío en Fase 1 (design.md §"Fuera de alcance").
 */

import type { LanguageCatalog } from "../resolve";

/**
 * Catálogo `es` con todos los namespaces por dominio del Portal
 * (`common`, `nav`, `footer`, `home`, `discovery`, `detail`).
 */
export const esCatalog: LanguageCatalog = {
  // ── common: textos transversales y mensajes de error de la capa de fetch ──
  common: {
    "brand.name": "Borondo Tours",
    "brand.slogan": "Explora donde nace la naturaleza",

    // Mensajes de error visibles al usuario (R21.6). El conjunto está acotado
    // por `ERROR_I18N_KEYS` en `lib/api/errors.ts`; nunca se muestra el
    // `error.message` crudo del backend (07-legal-compliance).
    "error.timeout": "La solicitud tardó demasiado. Inténtalo de nuevo.",
    "error.network": "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
    "error.notFound": "No encontramos lo que buscabas.",
    "error.server": "Algo salió mal de nuestro lado. Inténtalo más tarde.",
    "error.generic": "Ocurrió un error inesperado. Inténtalo de nuevo.",

    // Acciones y estados reutilizados en varias vistas.
    "action.retry": "Reintentar",
    "action.clearFilters": "Limpiar filtros",
    "action.viewDetail": "Ver detalle",
    "action.viewMore": "Ver más",
    "action.close": "Cerrar",
    "state.loading": "Cargando…",
    "content.unavailable": "Contenido no disponible",
  },

  // ── nav: barra de navegación y CTA (R6) ──
  nav: {
    home: "Inicio",
    destinations: "Destinos",
    experiences: "Experiencias",
    about: "Nosotros",
    blog: "Blog",
    contact: "Contacto",
    planTrip: "Planifica tu viaje",
    myBookings: "Mis reservas",
    searchTours: "Buscar tours",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    mobileNavigation: "Navegación principal",
    closeDrawer: "Cerrar panel de navegación",
    logoAlt: "Borondo Tours — inicio",
  },

  // ── footer: cuatro promesas de valor en orden fijo (R7) ──
  footer: {
    "promise.responsible.title": "Turismo Responsable",
    "promise.responsible.text": "Cuidamos los lugares que visitas.",
    "promise.unique.title": "Experiencias Únicas",
    "promise.unique.text": "Diseñamos viajes auténticos y memorables.",
    "promise.safety.title": "Seguridad Garantizada",
    "promise.safety.text": "Tu tranquilidad es nuestra prioridad.",
    "promise.personalized.title": "Atención Personalizada",
    "promise.personalized.text": "Estamos contigo en cada paso del viaje.",
    copyright: "© Borondo Tours. Todos los derechos reservados.",
    description: "Descubre lugares que te cambian por dentro. Viajes de naturaleza, aventura y cultura en Colombia con operadores locales certificados.",
    "nav.title": "Explora",
    "nav.destinations": "Destinos",
    "nav.experiences": "Experiencias",
    "nav.blog": "Blog",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "contact.title": "Contacto",
  },

  // ── home: landing (hero, buscador, secciones) (R8, R9, R10) ──
  home: {
    "hero.badge": "Explora Colombia",
    "hero.title": "Viajes que transforman tu manera de ver el mundo.",
    "hero.subtitle":
      "Explora paisajes únicos, vive experiencias auténticas y conecta con la naturaleza.",
    "hero.imageAlt": "",

    "search.destinationLabel": "Destino",
    "search.destinationPlaceholder": "¿A dónde quieres ir?",
    "search.datesLabel": "Fechas",
    "search.datesPlaceholder": "Fecha de viaje",
    "search.travelersLabel": "Viajeros",
    "search.travelersPlaceholder": "2 viajeros",
    "search.submit": "Buscar aventura",
    "search.destinationRequired": "Escribe un destino para continuar.",
    "search.dateInvalid": "Elige una fecha que no sea pasada.",
    "search.travelersInvalid": "Indica entre 1 y 99 viajeros.",

    "cta.primary": "Explorar destinos",
    "cta.secondary": "Conocer más",

    "destinations.kicker": "Destinos Destacados",
    "destinations.title": "Destinos que inspiran",
    "destinations.viewAll": "Ver todos los destinos",
    "destinations.error": "No pudimos cargar los destinos.",
    "destinations.retry": "Reintentar",

    // Trust badges inline en la landing (R10.2) — mismas promesas del footer
    "trust.responsible.title": "Turismo Responsable",
    "trust.responsible.text": "Cuidamos los lugares que visitas.",
    "trust.unique.title": "Experiencias Únicas",
    "trust.unique.text": "Diseñamos viajes auténticos y memorables.",
    "trust.safety.title": "Seguridad Garantizada",
    "trust.safety.text": "Tu tranquilidad es nuestra prioridad.",
    "trust.personalized.title": "Atención Personalizada",
    "trust.personalized.text": "Estamos contigo en cada paso del viaje.",
  },

  // ── checkout: wizard de reserva (maqueta visual, 04-checkout.design.md) ──
  checkout: {
    // Stepper
    "stepper.step1": "Datos del viaje",
    "stepper.step2": "Pasajeros",
    "stepper.step3": "Pago",
    "stepper.step4": "Confirmación",

    // Paso 1 — Datos del viaje
    "step1.summaryTitle": "Resumen del tour",
    "step1.tourName": "Valle del Cocora y Salento Mágico",
    "step1.tourLocation": "Eje Cafetero, Colombia",
    "step1.tourDates": "20 - 22 de mayo, 2025",
    "step1.tourDuration": "3 días / 2 noches",
    "step1.badgeConfirmed": "Confirmado",
    "step1.travelersTitle": "Número de viajeros",
    "step1.travelersHint": "Selecciona cuántas personas viajarán",
    "step1.travelersCount": "2 adultos",
    "step1.addonsTitle": "Add-ons opcionales",
    "step1.addonsHint": "Mejora tu experiencia agregando actividades o servicios adicionales.",
    "step1.addon.insurance": "Seguro de viaje premium",
    "step1.addon.insuranceDesc": "Cobertura médica ampliada y asistencia 24/7.",
    "step1.addon.insurancePrice": "$25.000 COP por persona",
    "step1.addon.transfer": "Traslado privado desde/hacia el aeropuerto",
    "step1.addon.transferPrice": "$80.000 COP por grupo",
    "step1.addon.extraNight": "Noche adicional en Salento",
    "step1.addon.extraNightPrice": "$120.000 COP por habitación",
    "step1.addon.dinner": "Cena especial típica",
    "step1.addon.dinnerPrice": "$45.000 COP por persona",
    "step1.summaryPartialTitle": "Resumen parcial",
    "step1.summary.travelers": "2 viajeros",
    "step1.summary.basePrice": "Precio base del tour",
    "step1.summary.basePriceValue": "$1.450.000",
    "step1.summary.adults": "2 adultos",
    "step1.summary.addonsSelected": "Add-ons seleccionados",
    "step1.summary.insuranceLine": "Seguro de viaje (2)",
    "step1.summary.insuranceValue": "$50.000",
    "step1.summary.dinnerLine": "Cena especial (2)",
    "step1.summary.dinnerValue": "$90.000",
    "step1.summary.subtotal": "Subtotal",
    "step1.summary.subtotalValue": "$1.590.000",
    "step1.summary.iva": "IVA (19%)",
    "step1.summary.ivaValue": "$302.100",
    "step1.summary.totalPartial": "Total parcial",
    "step1.summary.totalPartialValue": "$1.892.100 COP",
    "step1.continue": "Continuar a pasajeros",
    "step1.trustTitle": "Reserva segura",
    "step1.trustText": "Tus datos están protegidos.",

    // Paso 2 — Pasajeros
    "step2.title": "Información de los pasajeros",
    "step2.addPassenger": "Agregar pasajero",
    "step2.field.firstName": "Nombre(s)",
    "step2.field.lastName": "Apellido(s)",
    "step2.field.docType": "Tipo de documento",
    "step2.field.docNumber": "Número de documento",
    "step2.field.nationality": "Nacionalidad",
    "step2.field.medical": "Condiciones médicas o alergias (opcional)",
    "step2.p1.firstName": "Andrés Felipe",
    "step2.p1.lastName": "Gil Restrepo",
    "step2.p1.docType": "Cédula de ciudadanía",
    "step2.p1.docNumber": "1.234.567.890",
    "step2.p1.nationality": "Colombiana",
    "step2.p1.medical": "Sin información registrada",
    "step2.p2.firstName": "María Fernanda",
    "step2.p2.lastName": "López García",
    "step2.p2.docType": "Pasaporte",
    "step2.p2.docNumber": "AX1234567",
    "step2.ivaAlertTitle": "Eres extranjero: puedes ser elegible para IVA exento.",
    "step2.ivaAlertText": "Sube una foto de tu pasaporte para aplicar el beneficio.",
    "step2.uploadPassport": "Subir pasaporte",
    "step2.emergencyTitle": "Contacto de emergencia",
    "step2.emergency.name": "Nombre completo",
    "step2.emergency.nameValue": "Juan Carlos Gil",
    "step2.emergency.phone": "Teléfono",
    "step2.emergency.phoneValue": "+57 300 555 1234",
    "step2.emergency.relationship": "Parentesco",
    "step2.emergency.relationshipValue": "Padre",
    "step2.summaryTitle": "Resumen de tu reserva",
    "step2.summary.tour": "Tour (2 adultos)",
    "step2.summary.totalPartial": "Total parcial",
    "step2.summary.totalPartialValue": "$1.892.100 COP",
    "step2.back": "Volver",
    "step2.continue": "Continuar a pago",

    // Paso 3 — Pago
    "step3.title": "Resumen y pago",
    "step3.summary.basePrice": "Precio base",
    "step3.summary.coinsDiscount": "Descuento por Borondo Coins",
    "step3.summary.coinsDiscountValue": "-$100.000",
    "step3.summary.total": "Total a pagar",
    "step3.summary.totalValue": "$1.792.100 COP",
    "step3.coinsTitle": "Aplicar Borondo Coins",
    "step3.coinsAmount": "100.000",
    "step3.coinsAvailable": "Tienes 12.500 Coins disponibles",
    "step3.coinsApplied": "Descuento aplicado -$100.000 COP",
    "step3.methodsTitle": "Métodos de pago",
    "step3.method.card": "Tarjeta de crédito / débito",
    "step3.method.pse": "PSE",
    "step3.method.nequi": "Nequi / Daviplata",
    "step3.secureNote": "Pagos 100% seguros con ONEPAYLA",
    "step3.card.number": "Número de tarjeta",
    "step3.card.numberPlaceholder": "1234 1234 1234 1234",
    "step3.card.expiry": "Fecha de expiración MM/AA",
    "step3.card.cvv": "CVV",
    "step3.card.cvvPlaceholder": "123",
    "step3.optionsTitle": "Opciones adicionales",
    "step3.split.title": "Dividir el pago entre viajeros",
    "step3.split.desc": "Cada viajero recibirá un link de pago individual.",
    "step3.split.result": "Se generarán 2 links de pago",
    "step3.split.each": "Cada uno por $896.050 COP",
    "step3.acceptCancellation": "Acepto las condiciones de cancelación",
    "step3.viewCancellation": "Ver política de cancelación completa",
    "step3.pay": "Confirmar y pagar $1.792.100 COP",
    "step3.termsNote": "Al continuar aceptas nuestros Términos y Condiciones.",

    // Paso 4 — Confirmación
    "step4.title": "¡Tu aventura está confirmada!",
    "step4.subtitle": "Hemos enviado los detalles de tu reserva a andres.gil@email.com",
    "step4.card1.title": "Resumen de tu reserva",
    "step4.card1.tourName": "Valle del Cocora y Salento Mágico",
    "step4.card1.dates": "20 - 22 de mayo, 2025",
    "step4.card1.duration": "3 días / 2 noches",
    "step4.card1.travelers": "2 viajeros",
    "step4.card1.status": "Confirmado",
    "step4.card1.totalPaid": "Total pagado",
    "step4.card1.totalPaidValue": "$1.792.100 COP",
    "step4.card2.title": "Próximos pasos",
    "step4.card2.step1": "Revisa tu email con la confirmación y los detalles.",
    "step4.card2.step2": "Nuestro equipo te contactará antes del tour.",
    "step4.card2.step3": "Prepárate para vivir la experiencia.",
    "step4.card2.meetingTitle": "Punto de encuentro",
    "step4.card2.meetingPlace": "Calle 12 # 4-35, Armenia, Quindío",
    "step4.card2.meetingTime": "20 de mayo, 2025 - 07:00 AM",
    "step4.card3.title": "Tus documentos",
    "step4.card3.voucher": "Voucher de reserva",
    "step4.card3.voucherMeta": "PDF - 245 KB",
    "step4.card3.invoice": "Factura electrónica",
    "step4.card3.invoiceMeta": "PDF - 198 KB",
    "step4.card3.insurance": "Póliza de seguro",
    "step4.card3.insuranceMeta": "PDF - 312 KB",
    "step4.downloadAll": "Descargar todos los documentos",
    "step4.addCalendar": "Agregar al calendario",
    "step4.goToReservations": "Ir a mis reservas",
    "step4.heroImageAlt": "",
  },

  // ── discovery: catálogo con búsqueda, filtros y mapa (R11–R14) ──
  discovery: {
    title: "Descubre tu próxima aventura",
    "search.placeholder": "Busca por nombre, destino o experiencia",
    "search.clear": "Limpiar búsqueda",
    "empty.title": "No encontramos tours con esos criterios.",
    "empty.action": "Limpiar filtros",
    "view.list": "Lista",
    "view.map": "Mapa",

    // Filtros (R13)
    "filters.title": "Filtros",
    // aria-label del landmark del sidebar de filtros (región de navegación).
    "filters.sidebarLabel": "Filtros del catálogo",
    "filters.open": "Filtros",
    "filters.clear": "Limpiar filtros",

    // Filtro de destino/región (R13.1)
    "filters.region.title": "Destino",
    "filters.region.eje_cafetero": "Eje Cafetero",
    "filters.region.llanos": "Llanos",
    "filters.region.amazonia": "Amazonia",
    "filters.region.costa_caribe": "Costa Caribe",
    "filters.region.costa_pacifico": "Costa Pacífico",
    "filters.region.andes": "Andes",
    "filters.region.bogota_dc": "Bogotá DC",

    // Filtro de duración (R13.2)
    "filters.duration.title": "Duración",
    "filters.duration.half_day": "Medio día",
    "filters.duration.one_day": "1 día",
    "filters.duration.two_three_days": "2–3 días",
    "filters.duration.more_than_three": "Más de 3 días",

    // Filtro de precio (R13.3)
    "filters.price.title": "Precio",
    "filters.price.min": "Mínimo",
    "filters.price.max": "Máximo",

    // Filtro de dificultad (R13.4)
    "filters.difficulty.title": "Dificultad",
    "filters.difficulty.familiar": "Familiar",
    "filters.difficulty.moderado": "Moderado",
    "filters.difficulty.aventurero": "Aventurero",
    "filters.difficulty.extremo": "Extremo",

    // Filtro pasaporte (R13.5)
    "filters.passport": "Incluye pasaporte (IVA exento)",

    // Ordenamiento (R13.9)
    "sort.label": "Ordenar por",
    "sort.popular": "Más popular",
    "sort.priceAsc": "Precio: menor a mayor",
    "sort.priceDesc": "Precio: mayor a menor",
    "sort.recent": "Más reciente",

    // Mapa (R14)
    "map.empty": "Ninguno de los tours filtrados tiene ubicación en el mapa.",
    "map.fallback": "No fue posible cargar el mapa.",
    "map.fallbackAction": "Ver en lista",
    "map.viewDetail": "Ver detalle",

    // Error y paginación (R11.7, R11.8)
    "error.title": "No pudimos cargar los tours.",
    "pagination.label": "Paginación del catálogo",
    "pagination.prev": "Página anterior",
    "pagination.next": "Página siguiente",
  },

  // ── detail: ficha del tour (galería, calendario, add-ons) (R15–R18) ──
  detail: {
    "price.from": "Desde",
    "price.perPerson": "por persona",
    "vat.exempt": "IVA exento disponible",
    "section.includes": "¿Qué incluye?",
    "section.excludes": "¿Qué NO incluye?",
    "section.bring": "¿Qué llevar?",
    "addons.title": "Complementa tu experiencia",
    "nearby.title": "Tours cercanos",
    "calendar.select": "Selecciona una fecha",
    "calendar.label": "Calendario de disponibilidad",
    "calendar.dateAriaLabel": "{date} — {slots} cupos disponibles",
    "calendar.blocked": "Fecha no disponible",
    "calendar.priceError": "No pudimos obtener el precio. Se conserva el anterior.",

    // Reservar / CTA sticky (R15.5, R15.6, R15.7)
    "reserve.cta": "Reservar ahora",
    "reserve.ariaLabel": "Precio y reserva del tour",

    // Galería (R15.1, R15.8, R15.9, R15.10)
    "gallery.label": "Galería de fotos del tour",
    "gallery.placeholder": "Sin fotos disponibles para este tour",
    "gallery.noPhotos": "No hay fotos disponibles",
    "gallery.loadError": "No se pudo cargar la imagen",
    "gallery.previous": "Foto anterior",
    "gallery.next": "Foto siguiente",
    "gallery.thumbnails": "Miniaturas de fotos",
    "gallery.goToPhoto": "Ir a foto {n}",
  },
};
