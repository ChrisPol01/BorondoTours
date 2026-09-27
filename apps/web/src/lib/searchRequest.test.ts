/**
 * Unit tests de `buildTourSearchBody` — frontera de traducción
 * dominio (`CatalogState`) → contrato (`TourSearchSchema`, RFC 10008).
 *
 * Cubre: mapeo de dificultad al enum del contrato, buckets de duración →
 * `durationRange` en horas (incluyendo combinación y bucket sin tope),
 * `priceRange` (activo/inactivo), normalización de `q`, `sort`, `cursor` y
 * `ivaExemptAvailable`. Función pura; TypeScript strict, sin `any`.
 */

import { describe, expect, it } from "vitest";
import type { CatalogState } from "./types";
import { buildTourSearchBody } from "./searchRequest";

const DEFAULT_STATE: CatalogState = {
  q: "",
  regions: [],
  durations: [],
  priceMin: 0,
  priceMax: 999_999_999,
  difficulties: [],
  passportOnly: false,
  sort: "popular",
  cursor: null,
  view: "list",
};

describe("buildTourSearchBody — mínimos y defaults", () => {
  it("estado por defecto solo emite sort:popular (sin filters, q ni cursor)", () => {
    const body = buildTourSearchBody(DEFAULT_STATE);
    expect(body).toEqual({ sort: { field: "popular", order: "desc" } });
    expect(body.filters).toBeUndefined();
    expect(body.q).toBeUndefined();
    expect(body.cursor).toBeUndefined();
  });

  it("normaliza `q` recortando espacios y lo omite si queda vacío", () => {
    expect(buildTourSearchBody({ ...DEFAULT_STATE, q: "  cocora  " }).q).toBe(
      "cocora",
    );
    expect(buildTourSearchBody({ ...DEFAULT_STATE, q: "   " }).q).toBeUndefined();
  });
});

describe("buildTourSearchBody — dificultad → enum del contrato", () => {
  it("mapea la taxonomía B2C al enum del contrato", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      difficulties: ["familiar", "moderado", "aventurero", "extremo"],
    });
    expect(body.filters?.difficulties).toEqual([
      "FACIL",
      "MODERADO",
      "DIFICIL",
      "EXTREMO",
    ]);
  });
});

describe("buildTourSearchBody — regiones", () => {
  it("pasa las regiones tal cual (snake_case del dominio)", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      regions: ["eje_cafetero", "amazonia"],
    });
    expect(body.filters?.regions).toEqual(["eje_cafetero", "amazonia"]);
  });
});

describe("buildTourSearchBody — precio", () => {
  it("omite priceRange cuando min=0 y max=PRICE_MAX (sin filtro)", () => {
    const body = buildTourSearchBody(DEFAULT_STATE);
    expect(body.filters?.priceRange).toBeUndefined();
  });

  it("emite priceRange cuando el mínimo es > 0", () => {
    const body = buildTourSearchBody({ ...DEFAULT_STATE, priceMin: 100_000 });
    expect(body.filters?.priceRange).toEqual({ min: 100_000, max: 999_999_999 });
  });

  it("emite priceRange cuando el máximo es < PRICE_MAX", () => {
    const body = buildTourSearchBody({ ...DEFAULT_STATE, priceMax: 500_000 });
    expect(body.filters?.priceRange).toEqual({ min: 0, max: 500_000 });
  });
});

describe("buildTourSearchBody — duración → durationRange (horas)", () => {
  it("half_day → 0–5h", () => {
    const body = buildTourSearchBody({ ...DEFAULT_STATE, durations: ["half_day"] });
    expect(body.filters?.durationRange).toEqual({ min: 0, max: 5 });
  });

  it("two_three_days → 24–72h", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      durations: ["two_three_days"],
    });
    expect(body.filters?.durationRange).toEqual({ min: 24, max: 72 });
  });

  it("more_than_three → 72h..techo (sin tope superior → 1_000_000)", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      durations: ["more_than_three"],
    });
    expect(body.filters?.durationRange).toEqual({ min: 72, max: 1_000_000 });
  });

  it("combina buckets tomando el min de los min y el max de los max", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      durations: ["one_day", "two_three_days"],
    });
    // min(5, 24) = 5 ; max(24, 72) = 72
    expect(body.filters?.durationRange).toEqual({ min: 5, max: 72 });
  });

  it("si algún bucket combinado es sin tope, el max es el techo alto", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      durations: ["half_day", "more_than_three"],
    });
    expect(body.filters?.durationRange).toEqual({ min: 0, max: 1_000_000 });
  });
});

describe("buildTourSearchBody — pasaporte / IVA exento", () => {
  it("emite ivaExemptAvailable solo cuando passportOnly es true", () => {
    expect(
      buildTourSearchBody({ ...DEFAULT_STATE, passportOnly: true }).filters
        ?.ivaExemptAvailable,
    ).toBe(true);
    expect(buildTourSearchBody(DEFAULT_STATE).filters).toBeUndefined();
  });
});

describe("buildTourSearchBody — sort", () => {
  it("mapea cada sort del dominio a {field, order} del contrato", () => {
    expect(buildTourSearchBody({ ...DEFAULT_STATE, sort: "popular" }).sort).toEqual(
      { field: "popular", order: "desc" },
    );
    expect(
      buildTourSearchBody({ ...DEFAULT_STATE, sort: "price_asc" }).sort,
    ).toEqual({ field: "price_asc", order: "asc" });
    expect(
      buildTourSearchBody({ ...DEFAULT_STATE, sort: "price_desc" }).sort,
    ).toEqual({ field: "price_desc", order: "desc" });
    expect(buildTourSearchBody({ ...DEFAULT_STATE, sort: "recent" }).sort).toEqual(
      { field: "recent", order: "desc" },
    );
  });
});

describe("buildTourSearchBody — cursor (keyset)", () => {
  it("omite cursor cuando es null", () => {
    expect(buildTourSearchBody(DEFAULT_STATE).cursor).toBeUndefined();
  });

  it("incluye el cursor opaco cuando hay un token", () => {
    const body = buildTourSearchBody({
      ...DEFAULT_STATE,
      cursor: "eyJpZCI6NDJ9",
    });
    expect(body.cursor).toBe("eyJpZCI6NDJ9");
  });
});

describe("buildTourSearchBody — composición completa", () => {
  it("combina q + filtros + sort + cursor en un body coherente", () => {
    const body = buildTourSearchBody({
      q: "  guatape  ",
      regions: ["andes"],
      durations: ["one_day"],
      priceMin: 50_000,
      priceMax: 900_000,
      difficulties: ["moderado"],
      passportOnly: true,
      sort: "price_asc",
      cursor: "cursor-xyz",
      view: "map",
    });

    expect(body).toEqual({
      q: "guatape",
      filters: {
        regions: ["andes"],
        difficulties: ["MODERADO"],
        priceRange: { min: 50_000, max: 900_000 },
        durationRange: { min: 5, max: 24 },
        ivaExemptAvailable: true,
      },
      sort: { field: "price_asc", order: "asc" },
      cursor: "cursor-xyz",
    });
  });
});
