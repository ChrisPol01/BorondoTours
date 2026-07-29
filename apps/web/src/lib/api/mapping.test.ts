/**
 * Unit tests del mapeo snake_case → camelCase (capa de datos).
 */

import { describe, expect, it } from "vitest";

import { camelizeKeysDeep, isPlainObject, snakeToCamelKey } from "./mapping";

describe("snakeToCamelKey", () => {
  it("convierte claves snake_case a camelCase", () => {
    expect(snakeToCamelKey("base_price_cop")).toBe("basePriceCop");
    expect(snakeToCamelKey("iva_exempt_available")).toBe("ivaExemptAvailable");
    expect(snakeToCamelKey("page_size")).toBe("pageSize");
  });

  it("deja intactas las claves ya en camelCase o de una sola palabra", () => {
    expect(snakeToCamelKey("slug")).toBe("slug");
    expect(snakeToCamelKey("operatorName")).toBe("operatorName");
  });

  it("maneja dígitos y guiones bajos múltiples", () => {
    expect(snakeToCamelKey("photo_url_2")).toBe("photoUrl2");
    expect(snakeToCamelKey("a__b")).toBe("aB");
  });
});

describe("camelizeKeysDeep", () => {
  it("reescribe claves en objetos anidados y arrays", () => {
    const input = {
      base_price_cop: 100,
      add_ons: [{ additional_price_cop: 5, short_description: "x" }],
      tour_detail: { operator_name: "Op", coordinates: [-74, 4] },
    };
    expect(camelizeKeysDeep(input)).toEqual({
      basePriceCop: 100,
      addOns: [{ additionalPriceCop: 5, shortDescription: "x" }],
      tourDetail: { operatorName: "Op", coordinates: [-74, 4] },
    });
  });

  it("conserva primitivos y null sin cambios", () => {
    expect(camelizeKeysDeep(null)).toBeNull();
    expect(camelizeKeysDeep(42)).toBe(42);
    expect(camelizeKeysDeep("text")).toBe("text");
  });
});

describe("isPlainObject", () => {
  it("distingue objetos planos de arrays y null", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject("s")).toBe(false);
  });
});
