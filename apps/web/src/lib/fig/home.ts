/**
 * Contenido dinámico del Home (carrusel del hero, tours por región y vitrinas).
 *
 * Mientras no exista el endpoint del catálogo, son datos de muestra coherentes con los tours del
 * diseño de Figma. Al conectar la API, estas listas se reemplazan por la respuesta de
 * `GET /api/v1/tours` sin tocar la vista.
 */
import { quoteTemplate } from "./whatsapp";

/** Tipos de producto del menú Explorar (Tours.product_type). */
export const TOUR_TYPES = [
  { code: "PASADIA", label: "Pasadía" },
  { code: "PASANOCHE", label: "Pasanoche" },
  { code: "EXCURSION", label: "Excursión" },
] as const;

export type TourTypeCode = (typeof TOUR_TYPES)[number]["code"];

export interface CatalogQuery {
  readonly region?: string;
  readonly type?: TourTypeCode;
  readonly featured?: string;
}

/** URL del catálogo con los filtros que lee la página /explorar. */
export function catalogUrl(query: CatalogQuery): string {
  const params = new URLSearchParams();
  if (query.region) params.set("region", query.region);
  if (query.type) params.set("tipo", query.type);
  if (query.featured) params.set("destacado", query.featured);
  const qs = params.toString();
  return qs ? `/explorar?${qs}` : "/explorar";
}

/** Nombre visible de cada departamento que usan los filtros (?region=). */
export const REGION_LABELS: Readonly<Record<string, string>> = {
  magdalena: "Magdalena",
  "san-andres": "San Andrés y Providencia",
  quindio: "Quindío",
  bolivar: "Bolívar",
  antioquia: "Antioquia",
  huila: "Huila",
  caldas: "Caldas",
  risaralda: "Risaralda",
};

/** Convierte un texto a slug sin tildes ("Valle del Cocora y Salento" → "valle-del-cocora-y-salento"). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface RegionTour {
  readonly slug: string;
  readonly name: string;
  readonly meta: string;
}

export interface HeroSlide {
  readonly id: string;
  readonly title: string;
  readonly place: string;
  /** Departamento del catálogo (slug sin tildes) para filtrar. */
  readonly region: string;
  readonly regionLabel: string;
  readonly image: string;
  readonly tours: readonly [RegionTour, RegionTour];
}

/**
 * Diapositivas del hero. "Carnaval de Pasto" queda pendiente hasta tener una foto propia con
 * derechos de uso: se agrega aquí con una línea cuando la imagen esté en /public.
 */
export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "ciudad-perdida",
    title: "Ciudad Perdida",
    place: "Sierra Nevada de Santa Marta",
    region: "magdalena",
    regionLabel: "Magdalena",
    image: "/fig/12a4a01e59-1920.webp",
    tours: [
      { slug: "ciudad-perdida", name: "Ciudad Perdida", meta: "4 días · desde $1.450.000" },
      { slug: "rio-buritaca", name: "Río Buritaca", meta: "Pasadía · desde $180.000" },
    ],
  },
  {
    id: "san-andres",
    title: "San Andrés",
    place: "Mar de los siete colores",
    region: "san-andres",
    regionLabel: "San Andrés y Providencia",
    image: "/fig/87b1f22d9a-1380.webp",
    tours: [
      { slug: "isla-de-san-andres", name: "Isla de San Andrés", meta: "4 días · desde $1.680.000" },
      { slug: "johnny-cay-y-acuario", name: "Johnny Cay y Acuario", meta: "Pasadía · desde $160.000" },
    ],
  },
  {
    id: "eje-cafetero",
    title: "Eje Cafetero",
    place: "Valle del Cocora, Salento",
    region: "quindio",
    regionLabel: "Quindío",
    image: "/fig/757a7ef47f-1920.webp",
    tours: [
      { slug: "valle-del-cocora-y-salento", name: "Valle del Cocora", meta: "1 día · desde $178.500" },
      { slug: "ruta-del-cafe-en-finca", name: "Ruta del café", meta: "1 día · desde $145.000" },
    ],
  },
  {
    id: "cartagena",
    title: "Cartagena",
    place: "Ciudad amurallada",
    region: "bolivar",
    regionLabel: "Bolívar",
    image: "/fig/d81a176aae-981.webp",
    tours: [
      { slug: "islas-del-rosario-pasadia", name: "Islas del Rosario", meta: "Pasadía · desde $260.000" },
      { slug: "centro-historico-a-pie", name: "Centro histórico", meta: "Medio día · desde $90.000" },
    ],
  },
];

export interface ShowcaseTour {
  readonly slug: string;
  readonly name: string;
  readonly place: string;
  readonly region: string;
  readonly category: string;
  readonly duration: string;
  readonly rating: string;
  readonly image: string;
  readonly price: string;
  readonly priceBefore?: string;
  readonly discount?: string;
  readonly availability: "Disponible" | "Quedan pocos";
}

export const PROMOTIONS: readonly ShowcaseTour[] = [
  { slug: "valle-del-cocora-y-salento", name: "Valle del Cocora y Salento", place: "Salento, Quindío", region: "quindio", category: "Naturaleza", duration: "1 día", rating: "4,8 (268)", image: "/fig/c348d85455-604.webp", price: "$178.500", priceBefore: "$210.000", discount: "-15%", availability: "Disponible" },
  { slug: "isla-de-san-andres", name: "Isla de San Andrés 4 días", place: "San Andrés", region: "san-andres", category: "Sol y Playa", duration: "4 días", rating: "4,8 (261)", image: "/fig/87b1f22d9a-672.webp", price: "$1.680.000", priceBefore: "$2.100.000", discount: "-20%", availability: "Quedan pocos" },
  { slug: "guatape-y-el-penol", name: "Guatapé y El Peñol", place: "Guatapé, Antioquia", region: "antioquia", category: "Naturaleza", duration: "1 día", rating: "4,8 (285)", image: "/fig/44302bcf7d-672.webp", price: "$207.000", priceBefore: "$230.000", discount: "-10%", availability: "Disponible" },
  { slug: "desierto-de-la-tatacoa", name: "Desierto de la Tatacoa", place: "Villavieja, Huila", region: "huila", category: "Naturaleza", duration: "1 día", rating: "4,8 (157)", image: "/fig/42803df979-801.webp", price: "$343.200", priceBefore: "$390.000", discount: "-12%", availability: "Quedan pocos" },
];

export const BEST_SELLERS: readonly ShowcaseTour[] = [
  { slug: "parque-tayrona-y-playas", name: "Parque Tayrona y playas", place: "Santa Marta, Magdalena", region: "magdalena", category: "Sol y Playa", duration: "1 día", rating: "4,9 (412)", image: "/fig/e159b4192d-604.webp", price: "$220.000", availability: "Disponible" },
  { slug: "valle-del-cocora-y-salento", name: "Valle del Cocora y Salento", place: "Salento, Quindío", region: "quindio", category: "Naturaleza", duration: "1 día", rating: "4,8 (268)", image: "/fig/c348d85455-604.webp", price: "$210.000", availability: "Disponible" },
  { slug: "ciudad-perdida", name: "Ciudad Perdida", place: "Sierra Nevada, Magdalena", region: "magdalena", category: "Aventura", duration: "4 días", rating: "4,9 (198)", image: "/fig/12a4a01e59-672.webp", price: "$1.450.000", availability: "Quedan pocos" },
  { slug: "ruta-del-cafe-en-finca", name: "Ruta del café en finca", place: "Filandia, Quindío", region: "quindio", category: "Gastronomía", duration: "1 día", rating: "4,7 (176)", image: "/fig/0bb4eeb10f-604.webp", price: "$145.000", availability: "Disponible" },
  { slug: "islas-del-rosario-pasadia", name: "Islas del Rosario pasadía", place: "Cartagena, Bolívar", region: "bolivar", category: "Sol y Playa", duration: "1 día", rating: "4,7 (233)", image: "/fig/d81a176aae-604.webp", price: "$260.000", availability: "Disponible" },
];

/** Mensaje de WhatsApp de cada tarjeta de "Más allá de Colombia", por su título visible. */
export const ADVISOR_CARD_MESSAGES: Readonly<Record<string, string>> = {
  "Viajes internacionales": quoteTemplate("un viaje internacional"),
  "Parques de Orlando": quoteTemplate("un plan a los parques de Orlando"),
  "Cruceros": quoteTemplate("un crucero"),
  "Viajes personalizados": quoteTemplate("un viaje personalizado"),
};

/** Índice siguiente del carrusel, circular. */
export function nextIndex(current: number, total: number, step = 1): number {
  if (total <= 0) return 0;
  return (((current + step) % total) + total) % total;
}
