/**
 * Unit tests de `lib/calendar.ts` — `selectDate` (R17.4/R17.5) e `initialMonth`
 * (R17.3). Cubren happy path, bloqueo Rojo/Gris, precedencia cronológica y el
 * comportamiento por defecto determinista.
 */

import { describe, expect, it } from "vitest";
import { initialMonth, selectDate } from "./calendar";
import type { TourInstance } from "./types";

// Referencia de "hoy" fija para tests deterministas (2024-06-15, hora local).
const TODAY = new Date(2024, 5, 15);

function instance(overrides: Partial<TourInstance> & { date: string }): TourInstance {
  return {
    date: overrides.date,
    available: overrides.available ?? 10,
    total: overrides.total ?? 20,
    currentPriceCop: overrides.currentPriceCop ?? 100_000,
    isOffered: overrides.isOffered ?? true,
  };
}

describe("selectDate (R17.4, R17.5)", () => {
  it("reemplaza la selección previa con una fecha verde", () => {
    expect(selectDate("2024-06-20", "2024-07-01", "green")).toBe("2024-07-01");
  });

  it("reemplaza la selección previa con una fecha amarilla", () => {
    expect(selectDate("2024-06-20", "2024-07-01", "yellow")).toBe("2024-07-01");
  });

  it("selecciona desde estado inicial null cuando es verde/amarillo", () => {
    expect(selectDate(null, "2024-07-01", "green")).toBe("2024-07-01");
    expect(selectDate(null, "2024-07-01", "yellow")).toBe("2024-07-01");
  });

  it("conserva la selección previa al intentar una fecha roja", () => {
    expect(selectDate("2024-06-20", "2024-07-01", "red")).toBe("2024-06-20");
  });

  it("conserva la selección previa al intentar una fecha gris", () => {
    expect(selectDate("2024-06-20", "2024-07-01", "gray")).toBe("2024-06-20");
  });

  it("mantiene null si se bloquea una fecha roja/gris sin selección previa", () => {
    expect(selectDate(null, "2024-07-01", "red")).toBeNull();
    expect(selectDate(null, "2024-07-01", "gray")).toBeNull();
  });
});

describe("initialMonth (R17.3)", () => {
  it("posiciona en el primer mes con una fecha verde/amarillo", () => {
    const instances: TourInstance[] = [
      instance({ date: "2024-09-10", available: 15, total: 20 }), // verde
      instance({ date: "2024-07-05", available: 3, total: 20 }), // amarillo (más temprano)
    ];
    const month = initialMonth(instances, TODAY);
    expect(month.getFullYear()).toBe(2024);
    expect(month.getMonth()).toBe(6); // julio (base 0)
    expect(month.getDate()).toBe(1);
  });

  it("ignora fechas pasadas al elegir el mes", () => {
    const instances: TourInstance[] = [
      instance({ date: "2024-01-10", available: 15, total: 20 }), // pasada → gris
      instance({ date: "2024-08-01", available: 10, total: 20 }), // verde futuro
    ];
    const month = initialMonth(instances, TODAY);
    expect(month.getMonth()).toBe(7); // agosto
  });

  it("ignora fechas rojas y grises", () => {
    const instances: TourInstance[] = [
      instance({ date: "2024-07-01", available: 0, total: 20 }), // rojo
      instance({ date: "2024-08-01", isOffered: false }), // gris
      instance({ date: "2024-09-01", available: 12, total: 20 }), // verde
    ];
    const month = initialMonth(instances, TODAY);
    expect(month.getMonth()).toBe(8); // septiembre
  });

  it("default determinista al mes actual cuando no hay verde/amarillo", () => {
    const instances: TourInstance[] = [
      instance({ date: "2024-07-01", available: 0, total: 20 }), // rojo
      instance({ date: "2024-08-01", isOffered: false }), // gris
    ];
    const month = initialMonth(instances, TODAY);
    expect(month.getFullYear()).toBe(2024);
    expect(month.getMonth()).toBe(5); // junio (mes de TODAY)
    expect(month.getDate()).toBe(1);
  });

  it("default determinista con lista vacía", () => {
    const month = initialMonth([], TODAY);
    expect(month.getMonth()).toBe(5);
    expect(month.getFullYear()).toBe(2024);
  });

  it("descarta fechas con formato inválido", () => {
    const instances: TourInstance[] = [
      instance({ date: "no-es-fecha", available: 15, total: 20 }),
      instance({ date: "2024-10-01", available: 15, total: 20 }), // verde
    ];
    const month = initialMonth(instances, TODAY);
    expect(month.getMonth()).toBe(9); // octubre
  });
});
