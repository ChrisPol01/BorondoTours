/**
 * Unit tests de `parseCatalogState`/`serializeCatalogState` (R12.3, R13.3,
 * R13.8, R13.9, R13.10). Ejemplos concretos, casos límite y condiciones de
 * error. Las propiedades universales (round-trip e invariantes) se cubren en
 * el property test (tarea 4.7).
 */

import { describe, expect, it } from "vitest";
import type { CatalogState } from "./types";
import { parseCatalogState, serializeCatalogState } from "./queryParams";

const DEFAULT_STATE: CatalogState = {
  q: "",
  regions: [],
  durations: [],
  priceMin: 0,
  priceMax: 999_999_999,
  difficulties: [],
  passportOnly: false,
  sort: "popular",
  page: 1,
  view: "list",
};

function parse(query: string): CatalogState {
  return parseCatalogState(new URLSearchParams(query));
}

describe("parseCatalogState", () => {
  it("devuelve el estado por defecto para una URL vacía", () => {
    expect(parse("")).toEqual(DEFAULT_STATE);
  });

  it("normaliza `q` recortando espacios inicial y final (R12.3)", () => {
    const state = parse("q=%20%20laguna%20del%20otun%20%20");
    expect(state.q).toBe("laguna del otun");
    expect(state.q).toBe(state.q.trim());
  });

  it("parsea solo regiones válidas y descarta desconocidas (R13.1)", () => {
    const state = parse("regions=andes,marte,amazonia,andes");
    // Dedupe + orden canónico (andes va después de amazonia).
    expect(state.regions).toEqual(["amazonia", "andes"]);
  });

  it("parsea duraciones y dificultades válidas (R13.2, R13.4)", () => {
    const state = parse(
      "durations=one_day,half_day&difficulties=extremo,familiar,xxx",
    );
    expect(state.durations).toEqual(["half_day", "one_day"]);
    expect(state.difficulties).toEqual(["familiar", "extremo"]);
  });

  it("recorta el precio al rango permitido (R13.3)", () => {
    const state = parse("priceMin=-50&priceMax=5000000000");
    expect(state.priceMin).toBe(0);
    expect(state.priceMax).toBe(999_999_999);
  });

  it("intercambia el rango cuando priceMin > priceMax (R13.3)", () => {
    const state = parse("priceMin=800000&priceMax=100000");
    expect(state.priceMin).toBe(100_000);
    expect(state.priceMax).toBe(800_000);
    expect(state.priceMin).toBeLessThanOrEqual(state.priceMax);
  });

  it("ignora precios no numéricos y usa los valores por defecto", () => {
    const state = parse("priceMin=abc&priceMax=1.5");
    expect(state.priceMin).toBe(0);
    expect(state.priceMax).toBe(999_999_999);
  });

  it("interpreta passport=1 como passportOnly true (R13.5)", () => {
    expect(parse("passport=1").passportOnly).toBe(true);
    expect(parse("passport=0").passportOnly).toBe(false);
    expect(parse("passport=true").passportOnly).toBe(false);
  });

  it("usa `popular` como sort por defecto ante valores inválidos (R13.9)", () => {
    expect(parse("sort=price_asc").sort).toBe("price_asc");
    expect(parse("sort=unknown").sort).toBe("popular");
    expect(parse("").sort).toBe("popular");
  });

  it("usa `list` como view por defecto ante valores inválidos (R14.1)", () => {
    expect(parse("view=map").view).toBe("map");
    expect(parse("view=grid").view).toBe("list");
  });

  it("normaliza `page` a un entero positivo con 1 por defecto (R11.8)", () => {
    expect(parse("page=3").page).toBe(3);
    expect(parse("page=0").page).toBe(1);
    expect(parse("page=-2").page).toBe(1);
    expect(parse("page=abc").page).toBe(1);
  });
});

describe("serializeCatalogState", () => {
  it("omite todos los valores por defecto (URL vacía)", () => {
    expect(serializeCatalogState(DEFAULT_STATE).toString()).toBe("");
  });

  it("serializa un estado no trivial con claves en orden estable", () => {
    const state: CatalogState = {
      ...DEFAULT_STATE,
      q: "otun",
      regions: ["andes", "amazonia"],
      priceMin: 100_000,
      priceMax: 500_000,
      difficulties: ["extremo"],
      passportOnly: true,
      sort: "price_desc",
      page: 2,
      view: "map",
    };
    const params = serializeCatalogState(state);
    expect(params.get("q")).toBe("otun");
    // Orden canónico dentro del multi-valor.
    expect(params.get("regions")).toBe("amazonia,andes");
    expect(params.get("priceMin")).toBe("100000");
    expect(params.get("priceMax")).toBe("500000");
    expect(params.get("difficulties")).toBe("extremo");
    expect(params.get("passport")).toBe("1");
    expect(params.get("sort")).toBe("price_desc");
    expect(params.get("page")).toBe("2");
    expect(params.get("view")).toBe("map");
  });

  it("omite priceMin cuando es 0 y priceMax cuando es el máximo", () => {
    const params = serializeCatalogState({
      ...DEFAULT_STATE,
      priceMin: 0,
      priceMax: 250_000,
    });
    expect(params.has("priceMin")).toBe(false);
    expect(params.get("priceMax")).toBe("250000");
  });
});

describe("round-trip (ejemplos)", () => {
  it("parse(serialize(state)) es equivalente al estado canónico", () => {
    const state: CatalogState = {
      q: "cocora",
      regions: ["eje_cafetero", "andes"],
      durations: ["one_day"],
      priceMin: 50_000,
      priceMax: 900_000,
      difficulties: ["moderado", "aventurero"],
      passportOnly: true,
      sort: "recent",
      page: 4,
      view: "map",
    };
    // El estado ya está en forma canónica (arrays en orden de declaración).
    const expected: CatalogState = {
      ...state,
      regions: ["eje_cafetero", "andes"],
      difficulties: ["moderado", "aventurero"],
    };
    expect(parseCatalogState(serializeCatalogState(state))).toEqual(expected);
  });

  it("serialize es estable bajo re-parseo", () => {
    const state: CatalogState = {
      ...DEFAULT_STATE,
      q: "  guatape  ",
      regions: ["andes", "andes", "amazonia"],
      priceMin: 900_000,
      priceMax: 100_000,
      sort: "price_asc",
      page: 5,
    };
    const once = serializeCatalogState(state).toString();
    const twice = serializeCatalogState(
      parseCatalogState(serializeCatalogState(state)),
    ).toString();
    expect(twice).toBe(once);
  });
});
