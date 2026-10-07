/**
 * Preservación de los filtros del catálogo (spec b2c-glass-theme-ui-fixes, tarea 2, Req. 3.2).
 *
 * Se registró el comportamiento del código SIN arreglar antes de tocar vidrio, tarjetas y vitrina.
 * El arreglo (tarea 4) puede cambiar el aspecto de las tarjetas y añadir el estado Agotado, pero no
 * debe cambiar qué tours aparecen, en qué orden ni cómo se paginan. Dos capas:
 *  1. Oráculo: copia congelada de la lógica actual de filtrado y orden; fast-check compara contra
 *     `searchCatalog` para combinaciones aleatorias de categoría, búsqueda, orden y página.
 *  2. Snapshot: lista de slugs del dataset demo y resultados de combinaciones fijas.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  CATALOG, CATEGORY_LABELS, DIFFICULTY_LABELS, DURATION_LABELS, EMPTY_FILTERS, PAGE_SIZE, PRICE_MAX, PRICE_MIN,
  PRICE_STEP, REGION_NAMES, SORT_LABELS, TYPE_LABELS, filtersToParams, parseFilters, searchCatalog,
  type CatalogTour, type Category, type Difficulty, type Duration, type Filters, type PlanType, type Region, type Sort,
} from "./catalog";

/* ---------------- Oráculo: lógica del código sin arreglar (congelada) ---------------- */

const fold = (text: string): string => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function oracleMatches(t: CatalogTour, f: Filters): boolean {
  if (f.q) {
    const hay = fold(`${t.name} ${t.place} ${CATEGORY_LABELS[t.category]} ${REGION_NAMES[t.region]} ${t.description}`);
    if (!fold(f.q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  if (f.category && t.category !== f.category) return false;
  if (f.regions.length && !f.regions.includes(t.region)) return false;
  if (f.types.length && !f.types.includes(t.type)) return false;
  if (f.durations.length && !f.durations.includes(t.duration)) return false;
  if (f.difficulties.length && !f.difficulties.includes(t.difficulty)) return false;
  if (t.price < f.min || t.price > f.max) return false;
  if (f.iva && !t.ivaExempt) return false;
  return true;
}

function oracleSearch(f: Filters): string[] {
  const by: Record<Sort, (a: CatalogTour, b: CatalogTour) => number> = {
    populares: (a, b) => b.popularity - a.popularity,
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
    valoracion: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  };
  const list = CATALOG.filter((t) => oracleMatches(t, f)).sort(by[f.sort]);
  if (f.featured) {
    const i = list.findIndex((t) => t.slug === f.featured);
    if (i > 0) list.unshift(...list.splice(i, 1));
  }
  return list.map((t) => t.slug);
}

/** Página como la pinta /explorar ("Cargar más" acumula de PAGE_SIZE en PAGE_SIZE). */
const page = (slugs: readonly string[], p: number): string[] => slugs.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);

/* ---------------- Generadores ---------------- */

const keys = <T extends string>(o: Readonly<Record<T, string>>): T[] => Object.keys(o) as T[];
const subset = <T extends string>(o: Readonly<Record<T, string>>) => fc.subarray(keys(o));
const words = ["cafe", "café", "playa", "Cocora", "páramo", "aves", "isla", "caribe", "eje", "tour", "noche", "zzz", ""];

const filtersArb: fc.Arbitrary<Filters> = fc.record({
  q: fc.oneof(fc.constant(""), fc.array(fc.constantFrom(...words), { maxLength: 2 }).map((w) => w.join(" ").trim()), fc.string({ maxLength: 6 })),
  category: fc.option(fc.constantFrom(...keys<Category>(CATEGORY_LABELS)), { nil: null }),
  regions: subset<Region>(REGION_NAMES),
  types: subset<PlanType>(TYPE_LABELS),
  durations: subset<Duration>(DURATION_LABELS),
  difficulties: subset<Difficulty>(DIFFICULTY_LABELS),
  min: fc.integer({ min: PRICE_MIN / PRICE_STEP, max: PRICE_MAX / PRICE_STEP }).map((n) => n * PRICE_STEP),
  max: fc.integer({ min: PRICE_MIN / PRICE_STEP, max: PRICE_MAX / PRICE_STEP }).map((n) => n * PRICE_STEP),
  iva: fc.boolean(),
  sort: fc.constantFrom(...keys<Sort>(SORT_LABELS)),
  featured: fc.option(fc.constantFrom(...CATALOG.map((t) => t.slug)), { nil: null }),
}).map((f) => ({ ...f, min: Math.min(f.min, f.max), max: Math.max(f.min, f.max) }));

/* ---------------- Pruebas ---------------- */

describe("Preservation · filtros del catálogo (Req. 3.2)", () => {
  it("el dataset demo conserva sus tours y su orden", () => {
    expect(CATALOG.map((t) => t.slug)).toMatchSnapshot();
  });

  it("Property 8: searchCatalog = oráculo para filtros aleatorios, incluida la página", () => {
    fc.assert(
      fc.property(filtersArb, fc.integer({ min: 0, max: 3 }), (f, p) => {
        const actual = searchCatalog(f).map((t) => t.slug);
        const expected = oracleSearch(f);
        expect(actual).toEqual(expected);
        expect(page(actual, p)).toEqual(page(expected, p));
      }),
      { numRuns: 400 },
    );
  });

  it("Property 8: la URL de filtros se lee y se escribe igual (ida y vuelta)", () => {
    fc.assert(
      fc.property(filtersArb, (f) => {
        const clean = { ...f, q: f.q.slice(0, 80) };
        const back = parseFilters(filtersToParams(clean));
        expect(searchCatalog(back).map((t) => t.slug)).toEqual(oracleSearch(clean));
      }),
      { numRuns: 200 },
    );
  });

  it("combinaciones fijas de categoría, búsqueda, orden y página", () => {
    const combos: Record<string, Filters> = {
      todos: EMPTY_FILTERS,
      "sol-y-playa": { ...EMPTY_FILTERS, category: "SOL_Y_PLAYA" },
      "aventura-precio-asc": { ...EMPTY_FILTERS, category: "AVENTURA", sort: "precio-asc" },
      "q-cafe": { ...EMPTY_FILTERS, q: "café" },
      "q-caribe-valoracion": { ...EMPTY_FILTERS, q: "caribe", sort: "valoracion" },
      "eje-cafetero-precio-desc": { ...EMPTY_FILTERS, regions: ["eje-cafetero"], sort: "precio-desc" },
      "iva-pasadia": { ...EMPTY_FILTERS, iva: true, types: ["PASADIA"] },
      "destacado-ciudad-perdida": parseFilters(new URLSearchParams("region=magdalena&destacado=ciudad-perdida")),
      "sin-resultados": { ...EMPTY_FILTERS, q: "zzz" },
    };
    const out: Record<string, { page0: string[]; page1: string[]; total: number }> = {};
    for (const [name, f] of Object.entries(combos)) {
      const slugs = searchCatalog(f).map((t) => t.slug);
      out[name] = { page0: page(slugs, 0), page1: page(slugs, 1), total: slugs.length };
    }
    expect(out).toMatchSnapshot();
  });
});
