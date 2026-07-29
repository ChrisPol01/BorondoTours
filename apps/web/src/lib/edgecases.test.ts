/**
 * Tarea 4.18 — Unit tests de casos límite de `src/lib/`.
 *
 * Consolida los casos frontera de las funciones puras del dominio, verificando
 * de forma explícita (ejemplos concretos, no muestreo aleatorio) los bordes que
 * más fácilmente rompen una implementación:
 *
 *   - Semáforo de disponibilidad: fronteras exactas 49% / 50% y `total = 0`
 *     (R5.2, R5.3).
 *   - Formateo de precio COP y de duración: valores frontera y singular/plural
 *     (R15.2).
 *   - Estado del catálogo: `q` con espacios (trim) y `priceMin > priceMax`
 *     (swap/clamp) (R12.3, R13.3).
 *   - Escalado tipográfico: fronteras exactas 767/768/1024/1025 y los valores
 *     exactos de marca 0.85 / 0.95 / 1 (R1.6).
 *
 * Estos tests son complementarios a los property tests existentes: fijan los
 * puntos de corte concretos como regresión determinista. Se usan nombres de
 * `describe`/`it` distintos de los tests ya existentes para no duplicarlos.
 *
 * _Requirements: 1.6, 5.2, 5.3, 12.3, 13.3, 15.2_
 */

import { describe, expect, it } from "vitest";
import { availabilityStatus } from "./availability";
import { formatDuration, formatPriceCop } from "./format";
import { parseCatalogState } from "./queryParams";
import { typographyMultiplier } from "./typography";
import type { DateAvailability } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// availabilityStatus — fronteras 49% / 50% y total = 0 (R5.2, R5.3)
// ─────────────────────────────────────────────────────────────────────────

/** Construye una `DateAvailability` ofrecida y futura (caso "activo"). */
function offered(available: number, total: number): DateAvailability {
  return { available, total, isPast: false, isOffered: true };
}

describe("edge cases — availabilityStatus: fronteras de umbral 49%/50% (R5.2, R5.3)", () => {
  it("exactamente 50% → green (ratio >= 0.5, R5.2)", () => {
    // 1/2 = 0.5 exacto.
    expect(availabilityStatus(offered(1, 2))).toBe("green");
    // 50/100 = 0.5 exacto.
    expect(availabilityStatus(offered(50, 100))).toBe("green");
    // 10/20 = 0.5 exacto.
    expect(availabilityStatus(offered(10, 20))).toBe("green");
  });

  it("exactamente 49% → yellow (0 < ratio < 0.5, R5.3)", () => {
    // 49/100 = 0.49 exacto.
    expect(availabilityStatus(offered(49, 100))).toBe("yellow");
  });

  it("justo por debajo del 50% → yellow (R5.3)", () => {
    // 99/200 = 0.495 < 0.5.
    expect(availabilityStatus(offered(99, 200))).toBe("yellow");
    // 24/49 ≈ 0.4897 < 0.5.
    expect(availabilityStatus(offered(24, 49))).toBe("yellow");
  });

  it("justo por encima del 50% → green (R5.2)", () => {
    // 51/100 = 0.51 > 0.5.
    expect(availabilityStatus(offered(51, 100))).toBe("green");
    // 26/50 = 0.52 > 0.5.
    expect(availabilityStatus(offered(26, 50))).toBe("green");
  });

  it("mínima disponibilidad positiva por debajo del 50% → yellow (R5.3)", () => {
    // 1/100 = 1% → amarillo (extremo inferior del rango 1%–49%).
    expect(availabilityStatus(offered(1, 100))).toBe("yellow");
  });
});

describe("edge cases — availabilityStatus: total = 0 y capacidad inválida (R5 precedencia)", () => {
  it("total = 0 → gray aunque available sea positivo (R5.6 sobre R5.4)", () => {
    expect(availabilityStatus(offered(5, 0))).toBe("gray");
    // total = 0 con available = 0 también es gray (total tiene precedencia).
    expect(availabilityStatus(offered(0, 0))).toBe("gray");
  });

  it("total negativo → gray (capacidad inválida, R5.6)", () => {
    expect(availabilityStatus(offered(3, -10))).toBe("gray");
  });

  it("available = 0 con total positivo → red (R5.4)", () => {
    expect(availabilityStatus(offered(0, 20))).toBe("red");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// formatPriceCop — valores frontera (R15.2)
// ─────────────────────────────────────────────────────────────────────────

describe("edge cases — formatPriceCop: fronteras de agrupación de miles (R15.2)", () => {
  it("frontera 999 → 1000 (aparece el primer separador de miles)", () => {
    expect(formatPriceCop(999)).toBe("Desde $999 COP por persona");
    expect(formatPriceCop(1_000)).toBe("Desde $1.000 COP por persona");
  });

  it("frontera 999.999 → 1.000.000 (segundo grupo de miles)", () => {
    expect(formatPriceCop(999_999)).toBe("Desde $999.999 COP por persona");
    expect(formatPriceCop(1_000_000)).toBe("Desde $1.000.000 COP por persona");
  });

  it("precio máximo del catálogo (999.999.999) se agrupa correctamente", () => {
    expect(formatPriceCop(999_999_999)).toBe(
      "Desde $999.999.999 COP por persona",
    );
  });

  it("redondeo exacto en la mitad (0.5) hacia arriba", () => {
    // Math.round(1000.5) === 1001.
    expect(formatPriceCop(1_000.5)).toBe("Desde $1.001 COP por persona");
  });

  it("valor exacto de marca: 1.250.000 → 'Desde $1.250.000 COP por persona'", () => {
    // Ejemplo canónico del manual de marca / R15.2: separador de miles = punto,
    // sin decimales, prefijo/sufijo literales exactos.
    expect(formatPriceCop(1_250_000)).toBe(
      "Desde $1.250.000 COP por persona",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────
// formatDuration — valores frontera y singular/plural (R15.2)
// ─────────────────────────────────────────────────────────────────────────

describe("edge cases — formatDuration: singular/plural y precedencia (R15.2)", () => {
  it("1 día en singular; 2 días en plural", () => {
    expect(formatDuration({ days: 1 })).toBe("1 día");
    expect(formatDuration({ days: 2 })).toBe("2 días");
  });

  it("1 noche en singular; 3 noches en plural", () => {
    expect(formatDuration({ nights: 1 })).toBe("1 noche");
    expect(formatDuration({ nights: 3 })).toBe("3 noches");
  });

  it("combina días y noches con ' / ' (formato multi-día)", () => {
    expect(formatDuration({ days: 3, nights: 2 })).toBe("3 días / 2 noches");
    expect(formatDuration({ days: 1, nights: 1 })).toBe("1 día / 1 noche");
  });

  it("días/noches tienen precedencia sobre horas", () => {
    expect(formatDuration({ days: 1, hours: 8 })).toBe("1 día");
  });

  it("1 hora en singular; 6 horas en plural (medio día)", () => {
    expect(formatDuration({ hours: 1 })).toBe("1 hora");
    expect(formatDuration({ hours: 6 })).toBe("6 horas");
  });

  it("frontera: 0 no se emite (se descarta), cae al siguiente formato válido", () => {
    // days = 0 no válido → cae a horas.
    expect(formatDuration({ days: 0, hours: 4 })).toBe("4 horas");
    // Todos cero/ausentes → cadena vacía.
    expect(formatDuration({ days: 0, nights: 0, hours: 0 })).toBe("");
    expect(formatDuration({})).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// parseCatalogState — q con espacios (R12.3) y priceMin > priceMax (R13.3)
// ─────────────────────────────────────────────────────────────────────────

function parse(query: string) {
  return parseCatalogState(new URLSearchParams(query));
}

describe("edge cases — parseCatalogState: normalización de `q` (R12.3)", () => {
  it("recorta espacios iniciales y finales dejando el texto interno intacto", () => {
    const state = parse("q=%20%20%20valle%20de%20cocora%20%20");
    expect(state.q).toBe("valle de cocora");
    expect(state.q).toBe(state.q.trim());
  });

  it("una `q` compuesta solo por espacios queda vacía", () => {
    const state = parse("q=%20%20%20%20");
    expect(state.q).toBe("");
  });

  it("una `q` de exactamente 2 caracteres se conserva (mínimo de búsqueda)", () => {
    // El disparo mínimo de 2 chars es lógica de UI (SearchBar); a nivel de
    // `lib` verificamos que `parseCatalogState` conserva el valor sin recortarlo.
    expect(parse("q=ab").q).toBe("ab");
    // Con espacios alrededor, tras el trim sigue teniendo 2 caracteres útiles.
    expect(parse("q=%20ab%20").q).toBe("ab");
  });

  it("una `q` de 1 carácter tras trim se conserva a nivel de lib (el gate de 2 es UI)", () => {
    expect(parse("q=%20a%20").q).toBe("a");
  });
});

describe("edge cases — parseCatalogState: rango de precio (R13.3)", () => {
  it("intercambia cuando priceMin > priceMax", () => {
    const state = parse("priceMin=900000&priceMax=100000");
    expect(state.priceMin).toBe(100_000);
    expect(state.priceMax).toBe(900_000);
    expect(state.priceMin).toBeLessThanOrEqual(state.priceMax);
  });

  it("priceMin == priceMax se conserva sin intercambio", () => {
    const state = parse("priceMin=250000&priceMax=250000");
    expect(state.priceMin).toBe(250_000);
    expect(state.priceMax).toBe(250_000);
  });

  it("recorta al rango [0, 999_999_999] y luego intercambia si aplica", () => {
    // Ambos fuera de rango: min negativo → 0, max sobre el tope → 999_999_999.
    const clamped = parse("priceMin=-100&priceMax=5000000000");
    expect(clamped.priceMin).toBe(0);
    expect(clamped.priceMax).toBe(999_999_999);

    // min sobre el tope y max = 0: ambos se recortan y luego se intercambian.
    const swapped = parse("priceMin=5000000000&priceMax=0");
    expect(swapped.priceMin).toBe(0);
    expect(swapped.priceMax).toBe(999_999_999);
    expect(swapped.priceMin).toBeLessThanOrEqual(swapped.priceMax);
  });

  it("mantiene el invariante 0 <= priceMin <= priceMax <= 999_999_999", () => {
    const state = parse("priceMin=800000&priceMax=100000");
    expect(state.priceMin).toBeGreaterThanOrEqual(0);
    expect(state.priceMin).toBeLessThanOrEqual(state.priceMax);
    expect(state.priceMax).toBeLessThanOrEqual(999_999_999);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// typographyMultiplier — fronteras exactas y valores de marca (R1.6)
// ─────────────────────────────────────────────────────────────────────────

describe("edge cases — typographyMultiplier: fronteras 767/768/1024/1025 (R1.6)", () => {
  it("767 → 0.85 (último ancho mobile)", () => {
    expect(typographyMultiplier(767)).toBe(0.85);
  });

  it("768 → 0.95 (primer ancho tablet, límite inclusivo)", () => {
    expect(typographyMultiplier(768)).toBe(0.95);
  });

  it("1024 → 0.95 (último ancho tablet, límite inclusivo)", () => {
    expect(typographyMultiplier(1024)).toBe(0.95);
  });

  it("1025 → 1 (primer ancho desktop)", () => {
    expect(typographyMultiplier(1025)).toBe(1);
  });

  it("devuelve exactamente los valores de marca 0.85 / 0.95 / 1", () => {
    // Valores exactos definidos por el manual de marca (§3 Escalado Responsivo).
    expect(typographyMultiplier(320)).toBe(0.85); // mobile pequeño
    expect(typographyMultiplier(900)).toBe(0.95); // tablet
    expect(typographyMultiplier(1920)).toBe(1); // desktop grande
  });
});
