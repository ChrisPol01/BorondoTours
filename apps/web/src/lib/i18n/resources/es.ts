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

    "destinations.title": "Destinos que inspiran",
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
