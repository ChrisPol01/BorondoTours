/**
 * Catálogo de muestra y filtros de /explorar (puro, testeable).
 * Se reemplaza por `QUERY /api/v1/tours/search` cuando exista la API; la forma de los filtros
 * coincide con los parámetros de URL de esa búsqueda.
 */
import { slugify } from "./home";

export type Region = "caribe" | "eje-cafetero" | "andes" | "pacifico" | "amazonia" | "llanos";
export type Category = "RECREACION" | "SOL_Y_PLAYA" | "GASTRONOMICO" | "CULTURAL" | "NATURALEZA" | "AVENTURA" | "EXTREMO";
export type PlanType = "PASADIA" | "PASANOCHE" | "EXCURSION";
export type Duration = "medio-dia" | "1-dia" | "2-3-dias" | "mas-3-dias";
export type Difficulty = "FACIL" | "MODERADO" | "DIFICIL" | "EXTREMO";
export type Sort = "populares" | "precio-asc" | "precio-desc" | "valoracion";

export interface CatalogTour {
  readonly slug: string;
  readonly name: string;
  readonly place: string;
  readonly department: string;
  readonly region: Region;
  readonly category: Category;
  readonly type: PlanType;
  readonly duration: Duration;
  readonly durationLabel: string;
  readonly difficulty: Difficulty;
  readonly price: number;
  readonly priceBefore?: number;
  readonly rating: number;
  readonly reviews: number;
  readonly popularity: number;
  readonly ivaExempt: boolean;
  readonly lowStock: boolean;
  readonly soldOut: boolean;
  readonly image: string;
  readonly description: string;
}

export const CATEGORY_LABELS: Readonly<Record<Category, string>> = {
  RECREACION: "Recreación", SOL_Y_PLAYA: "Sol y Playa", GASTRONOMICO: "Gastronomía", CULTURAL: "Cultura",
  NATURALEZA: "Naturaleza", AVENTURA: "Aventura", EXTREMO: "Deportes extremos",
};
export const REGION_NAMES: Readonly<Record<Region, string>> = {
  caribe: "Caribe", "eje-cafetero": "Eje Cafetero", andes: "Andes", pacifico: "Pacífico", amazonia: "Amazonía", llanos: "Llanos",
};
export const TYPE_LABELS: Readonly<Record<PlanType, string>> = { PASADIA: "Pasadía", PASANOCHE: "Pasanoche", EXCURSION: "Excursión" };
export const DURATION_LABELS: Readonly<Record<Duration, string>> = { "medio-dia": "Medio día", "1-dia": "1 día", "2-3-dias": "2–3 días", "mas-3-dias": "+3 días" };
export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = { FACIL: "Fácil", MODERADO: "Moderado", DIFICIL: "Difícil", EXTREMO: "Extremo" };
export const SORT_LABELS: Readonly<Record<Sort, string>> = { populares: "Más populares", "precio-asc": "Precio: menor a mayor", "precio-desc": "Precio: mayor a menor", valoracion: "Mejor valorados" };

/** Departamento del Home (?region=quindio) → región del catálogo. */
export const DEPARTMENT_REGION: Readonly<Record<string, Region>> = {
  magdalena: "caribe", "san-andres": "caribe", bolivar: "caribe", quindio: "eje-cafetero", caldas: "eje-cafetero",
  risaralda: "eje-cafetero", antioquia: "andes", huila: "andes",
};

export const PRICE_MIN = 50_000;
export const PRICE_MAX = 2_000_000;
export const PRICE_STEP = 10_000;
export const PAGE_SIZE = 6;

type Row = [string, string, string, Region, Category, PlanType, Duration, string, Difficulty, number, number | undefined, number, number, number, boolean, boolean, string, string];
const ROWS: Row[] = [
  ["Valle del Cocora y Salento", "Salento, Quindío", "quindio", "eje-cafetero", "NATURALEZA", "PASADIA", "1-dia", "1 día · 8 horas", "MODERADO", 178_500, 210_000, 4.8, 268, 98, true, false, "/fig/c348d85455-604.webp", "Caminata entre palmas de cera, el árbol nacional, y tarde libre en el pueblo de Salento."],
  ["Parque Tayrona y playas", "Santa Marta, Magdalena", "magdalena", "caribe", "SOL_Y_PLAYA", "PASADIA", "1-dia", "1 día · 10 horas", "MODERADO", 220_000, undefined, 4.9, 412, 97, true, true, "/fig/e159b4192d-604.webp", "Sendero por bosque seco hasta Cabo San Juan y tiempo de playa en el parque natural."],
  ["Ruta del café en finca", "Manizales, Caldas", "caldas", "eje-cafetero", "GASTRONOMICO", "PASADIA", "1-dia", "1 día · 6 horas", "FACIL", 145_000, undefined, 4.8, 115, 90, true, false, "/fig/0bb4eeb10f-604.webp", "Del grano a la taza: recolección, beneficio y cata guiada en una finca cafetera."],
  ["Islas del Rosario pasadía", "Cartagena, Bolívar", "bolivar", "caribe", "SOL_Y_PLAYA", "PASADIA", "1-dia", "1 día · 9 horas", "FACIL", 260_000, undefined, 4.7, 233, 92, true, false, "/fig/d81a176aae-604.webp", "Lancha por el archipiélago, almuerzo típico y snorkel en aguas cristalinas."],
  ["Senderismo al páramo", "Murillo, Tolima", "tolima", "andes", "AVENTURA", "PASADIA", "1-dia", "1 día · 9 horas", "DIFICIL", 195_000, undefined, 4.9, 86, 80, false, true, "/fig/a96e5b3768-604.webp", "Ascenso entre frailejones hasta las lagunas del páramo, con guía local."],
  ["Avistamiento de aves", "Jardín, Antioquia", "antioquia", "andes", "NATURALEZA", "PASADIA", "medio-dia", "Medio día · 5 horas", "FACIL", 120_000, 140_000, 4.8, 74, 76, true, false, "/fig/b957e0bac8-604.webp", "Madrugada con guía ornitólogo para ver colibríes, tángaras y el gallito de roca."],
  ["Isla de San Andrés 4 días", "San Andrés", "san-andres", "caribe", "SOL_Y_PLAYA", "EXCURSION", "mas-3-dias", "4 días · 3 noches", "FACIL", 1_680_000, 2_100_000, 4.8, 261, 95, true, true, "/fig/87b1f22d9a-672.webp", "Hotel, vuelta a la isla, Johnny Cay y acuario en el mar de los siete colores."],
  ["Guatapé y El Peñol", "Guatapé, Antioquia", "antioquia", "andes", "NATURALEZA", "PASADIA", "1-dia", "1 día · 10 horas", "MODERADO", 207_000, 230_000, 4.8, 285, 94, true, false, "/fig/44302bcf7d-672.webp", "Subida a la Piedra del Peñol, paseo en lancha por el embalse y pueblo de zócalos."],
  ["Desierto de la Tatacoa", "Villavieja, Huila", "huila", "andes", "AVENTURA", "PASANOCHE", "2-3-dias", "2 días · 1 noche", "MODERADO", 343_200, 390_000, 4.8, 157, 84, true, true, "/fig/42803df979-801.webp", "Laberintos rojos y grises de día y observación astronómica de noche."],
  ["Ciudad Perdida", "Sierra Nevada, Magdalena", "magdalena", "caribe", "AVENTURA", "EXCURSION", "mas-3-dias", "4 días · 3 noches", "EXTREMO", 1_450_000, undefined, 4.9, 198, 88, false, true, "/fig/12a4a01e59-672.webp", "Trekking por la selva hasta Teyuna, ciudad ancestral del pueblo tayrona."],
  ["Finca cafetera y cabalgata", "Filandia, Quindío", "quindio", "eje-cafetero", "RECREACION", "PASANOCHE", "2-3-dias", "2 días · 1 noche", "FACIL", 390_000, undefined, 4.7, 92, 70, true, false, "/fig/0b6c6862e8-690.webp", "Noche en finca tradicional, cabalgata entre cafetales y cocina campesina."],
  ["Centro histórico a pie", "Cartagena, Bolívar", "bolivar", "caribe", "CULTURAL", "PASADIA", "medio-dia", "Medio día · 4 horas", "FACIL", 90_000, undefined, 4.6, 341, 86, true, false, "/fig/d81a176aae-981.webp", "Murallas, plazas y balcones de la ciudad amurallada con historiador local."],
  ["Paisaje Cultural Cafetero", "Pereira, Risaralda", "risaralda", "eje-cafetero", "CULTURAL", "EXCURSION", "2-3-dias", "3 días · 2 noches", "MODERADO", 980_000, 1_150_000, 4.7, 64, 66, true, false, "/fig/757a7ef47f-690.webp", "Pueblos patrimonio, termales y miradores del Eje Cafetero en un solo plan."],
  ["Río Buritaca", "Santa Marta, Magdalena", "magdalena", "caribe", "RECREACION", "PASADIA", "1-dia", "1 día · 7 horas", "FACIL", 180_000, undefined, 4.6, 58, 60, true, false, "/fig/e159b4192d-604.webp", "Pozos naturales y desembocadura del río en el mar Caribe."],
  ["Cocora al amanecer", "Salento, Quindío", "quindio", "eje-cafetero", "NATURALEZA", "PASADIA", "medio-dia", "Medio día · 5 horas", "MODERADO", 150_000, undefined, 4.9, 41, 58, true, false, "/fig/c348d85455-1560.webp", "Salida temprana para ver la niebla entre las palmas y el amanecer andino."],
];

/** Slugs de tours demo sin cupos (estado Agotado). Se reemplaza por `stock = 0` de la API. */
const SOLD_OUT_SLUGS: ReadonlySet<string> = new Set(["parque-tayrona-y-playas", "senderismo-al-paramo"]);
export const CATALOG: readonly CatalogTour[] = ROWS.map(([name, place, department, region, category, type, duration, durationLabel, difficulty, price, priceBefore, rating, reviews, popularity, ivaExempt, lowStock, image, description]) => ({
  slug: slugify(name), name, place, department, region, category, type, duration, durationLabel, difficulty, price, priceBefore,
  rating, reviews, popularity, ivaExempt, lowStock, soldOut: SOLD_OUT_SLUGS.has(slugify(name)), image, description,
}));

export const tourBySlug = (slug: string | null): CatalogTour | undefined => CATALOG.find((t) => t.slug === slug);

/** Los `count` tours más populares que cumplen `where` (puro). Base de las listas de sugerencias. */
export function popularTours(count: number, where: (t: CatalogTour) => boolean = () => true, tours: readonly CatalogTour[] = CATALOG): CatalogTour[] {
  return tours.filter(where).sort((a, b) => b.popularity - a.popularity).slice(0, count);
}

/** Categoría del catálogo cuyo nombre abre `heading` ("Naturaleza y Ecoturismo" → NATURALEZA). */
export function categoryFromHeading(heading: string): Category | null {
  const text = heading.toLocaleLowerCase("es");
  const hit = (Object.entries(CATEGORY_LABELS) as [Category, string][]).find(([, label]) => text.startsWith(label.toLocaleLowerCase("es")));
  return hit ? hit[0] : null;
}

/** Región del catálogo nombrada en `text` ("Eje Cafetero" → "eje-cafetero"). */
export function regionFromText(text: string): Region | null {
  const lower = text.toLocaleLowerCase("es");
  const hit = (Object.entries(REGION_NAMES) as [Region, string][]).find(([, name]) => lower.includes(name.toLocaleLowerCase("es")));
  return hit ? hit[0] : null;
}

/**
 * Tours recomendados para "También en …" del detalle: los más afines al actual. Prioridad: misma
 * región, luego misma categoría, luego popularidad. Nunca incluye el propio tour (puro).
 */
export function relatedTours(current: Pick<CatalogTour, "slug" | "region" | "category">, count = 4, tours: readonly CatalogTour[] = CATALOG): CatalogTour[] {
  const score = (t: CatalogTour): number => (t.region === current.region ? 1000 : 0) + (t.category === current.category ? 100 : 0) + t.popularity;
  return tours
    .filter((t) => t.slug !== current.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}

export interface Filters {
  readonly q: string;
  readonly category: Category | null;
  readonly regions: readonly Region[];
  readonly types: readonly PlanType[];
  readonly durations: readonly Duration[];
  readonly difficulties: readonly Difficulty[];
  readonly min: number;
  readonly max: number;
  readonly iva: boolean;
  readonly sort: Sort;
  readonly featured: string | null;
}

export const EMPTY_FILTERS: Filters = { q: "", category: null, regions: [], types: [], durations: [], difficulties: [], min: PRICE_MIN, max: PRICE_MAX, iva: false, sort: "populares", featured: null };

const csv = <T extends string>(value: string | null, allowed: readonly T[]): T[] =>
  (value ?? "").split(",").map((v) => v.trim()).filter((v): v is T => (allowed as readonly string[]).includes(v));

const clampPrice = (value: string | null, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || value === null || value === "") return fallback;
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, Math.round(n / PRICE_STEP) * PRICE_STEP));
};

export function parseFilters(params: URLSearchParams): Filters {
  const regions = csv(params.get("regiones"), Object.keys(REGION_NAMES) as Region[]);
  const dep = DEPARTMENT_REGION[params.get("region") ?? ""];
  if (dep && !regions.includes(dep)) regions.push(dep);
  const category = csv(params.get("categoria"), Object.keys(CATEGORY_LABELS) as Category[])[0] ?? null;
  const min = clampPrice(params.get("min"), PRICE_MIN);
  const max = clampPrice(params.get("max"), PRICE_MAX);
  const sort = (Object.keys(SORT_LABELS) as Sort[]).find((s) => s === params.get("orden")) ?? "populares";
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    category,
    regions,
    types: csv(params.get("tipo"), Object.keys(TYPE_LABELS) as PlanType[]),
    durations: csv(params.get("duracion"), Object.keys(DURATION_LABELS) as Duration[]),
    difficulties: csv(params.get("dificultad"), Object.keys(DIFFICULTY_LABELS) as Difficulty[]),
    min: Math.min(min, max),
    max: Math.max(min, max),
    iva: params.get("iva") === "1",
    sort,
    featured: params.get("destacado"),
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("categoria", f.category);
  if (f.regions.length) p.set("regiones", f.regions.join(","));
  if (f.types.length) p.set("tipo", f.types.join(","));
  if (f.durations.length) p.set("duracion", f.durations.join(","));
  if (f.difficulties.length) p.set("dificultad", f.difficulties.join(","));
  if (f.min !== PRICE_MIN) p.set("min", String(f.min));
  if (f.max !== PRICE_MAX) p.set("max", String(f.max));
  if (f.iva) p.set("iva", "1");
  if (f.sort !== "populares") p.set("orden", f.sort);
  if (f.featured) p.set("destacado", f.featured);
  return p;
}

const fold = (text: string): string => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function matches(tour: CatalogTour, f: Filters): boolean {
  if (f.q) {
    const hay = fold(`${tour.name} ${tour.place} ${CATEGORY_LABELS[tour.category]} ${REGION_NAMES[tour.region]} ${tour.description}`);
    if (!fold(f.q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  if (f.category && tour.category !== f.category) return false;
  if (f.regions.length && !f.regions.includes(tour.region)) return false;
  if (f.types.length && !f.types.includes(tour.type)) return false;
  if (f.durations.length && !f.durations.includes(tour.duration)) return false;
  if (f.difficulties.length && !f.difficulties.includes(tour.difficulty)) return false;
  if (tour.price < f.min || tour.price > f.max) return false;
  if (f.iva && !tour.ivaExempt) return false;
  return true;
}

export function searchCatalog(f: Filters, tours: readonly CatalogTour[] = CATALOG): CatalogTour[] {
  const list = tours.filter((t) => matches(t, f));
  const by: Record<Sort, (a: CatalogTour, b: CatalogTour) => number> = {
    populares: (a, b) => b.popularity - a.popularity,
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
    valoracion: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  };
  list.sort(by[f.sort]);
  if (f.featured) {
    const i = list.findIndex((t) => t.slug === f.featured);
    if (i > 0) list.unshift(...list.splice(i, 1));
  }
  return list;
}

export const formatCop = (value: number): string => `$${new Intl.NumberFormat("es-CO").format(value)}`;
export const discountOf = (t: CatalogTour): string | null => (t.priceBefore ? `-${Math.round((1 - t.price / t.priceBefore) * 100)}%` : null);

/**
 * Destino único de toda tarjeta de tour: el detalle, donde el viajero elige fecha, viajeros y
 * adicionales (RF 2.14). Nunca lleva directo al checkout.
 */
export function tourHref(slug: string): string {
  return `/tour?tour=${encodeURIComponent(slug)}`;
}

/** Estado de disponibilidad de una tarjeta (puro). `soldout` gana sobre `low`. */
export type CardState = "available" | "low" | "soldout";
export function cardState(tour: {
  readonly soldOut?: boolean;
  readonly stock?: number;
  readonly lowStock?: boolean;
  readonly availability?: string;
}): CardState {
  if (tour.soldOut === true || tour.stock === 0) return "soldout";
  if (tour.lowStock === true || tour.availability === "Quedan pocos") return "low";
  return "available";
}