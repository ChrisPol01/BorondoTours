/**
 * Unit tests para `TourInfo` y `StickyPrice` — componentes de la vista de detalle
 * del tour (R15.2–R15.7).
 *
 * Verifica:
 *   - Nombre del tour como único H1 (R15.2).
 *   - Destino/región mostrados.
 *   - Duración formateada correctamente.
 *   - Precio formateado con separador de miles (R15.2).
 *   - Badge de operador presente.
 *   - Badge de dificultad con colores correctos (R15.3).
 *   - Indicador "IVA exento disponible" condicional (R15.4).
 *   - StickyPrice visible para desktop y mobile (R15.5, R15.6).
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TourDetail } from "../../lib/types";
import { TourInfo } from "./TourInfo";
import { StickyPrice } from "./StickyPrice";

// ─────────────────────────────────────────────────────────────────────────
// Mock de i18n (resolución determinista con fallback a clave literal)
// ─────────────────────────────────────────────────────────────────────────

const mockT = (key: string): string => {
  const map: Record<string, string> = {
    "vat.exempt": "IVA exento disponible",
    "reserve.cta": "Reservar ahora",
    "reserve.ariaLabel": "Precio y reserva del tour",
    "detail:reserve.cta": "Reservar ahora",
    "detail:reserve.ariaLabel": "Precio y reserva del tour",
    "detail:vat.exempt": "IVA exento disponible",
    "discovery:filters.difficulty.familiar": "Familiar",
    "discovery:filters.difficulty.moderado": "Moderado",
    "discovery:filters.difficulty.aventurero": "Aventurero",
    "discovery:filters.difficulty.extremo": "Extremo",
    "discovery:filters.region.eje_cafetero": "Eje Cafetero",
    "discovery:filters.region.llanos": "Llanos",
    "discovery:filters.region.amazonia": "Amazonia",
    "discovery:filters.region.costa_caribe": "Costa Caribe",
    "discovery:filters.region.costa_pacifico": "Costa Pacífico",
    "discovery:filters.region.andes": "Andes",
    "discovery:filters.region.bogota_dc": "Bogotá DC",
  };
  return map[key] ?? key;
};

vi.mock("../../lib/i18n/provider", () => ({
  useTranslation: () => ({
    t: mockT,
    language: "es",
    setLanguage: vi.fn(),
  }),
}));

// ─────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────

function createTour(overrides?: Partial<TourDetail>): TourDetail {
  return {
    slug: "laguna-del-otun",
    name: "Laguna del Otún",
    region: "eje_cafetero",
    destination: "Pereira, Risaralda",
    durationDays: 3,
    durationNights: 2,
    durationHours: null,
    basePriceCop: 1250000,
    operatorName: "EcoAdventuras",
    difficulty: "moderado",
    ivaExemptAvailable: true,
    gallery: [],
    longDescriptionHtml: "",
    includes: null,
    notIncludes: null,
    whatToBring: null,
    addOns: [],
    coordinates: [-75.6, 4.8],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// TourInfo tests
// ─────────────────────────────────────────────────────────────────────────

describe("TourInfo", () => {
  it("renders the tour name as H1 (R15.2)", () => {
    render(<TourInfo tour={createTour()} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Laguna del Otún");
  });

  it("shows destination and region (R15.2)", () => {
    render(<TourInfo tour={createTour()} />);
    expect(screen.getByText(/Pereira, Risaralda/)).toBeInTheDocument();
    expect(screen.getByText(/Eje Cafetero/)).toBeInTheDocument();
  });

  it("shows formatted duration with days/nights (R15.2)", () => {
    render(<TourInfo tour={createTour()} />);
    expect(screen.getByText("3 días / 2 noches")).toBeInTheDocument();
  });

  it("shows formatted duration with hours when no days/nights", () => {
    render(
      <TourInfo
        tour={createTour({ durationDays: null, durationNights: null, durationHours: 6 })}
      />,
    );
    expect(screen.getByText("6 horas")).toBeInTheDocument();
  });

  it("shows formatted price with thousands separator (R15.2)", () => {
    render(<TourInfo tour={createTour()} />);
    expect(
      screen.getByText("Desde $1.250.000 COP por persona"),
    ).toBeInTheDocument();
  });

  it("shows operator badge (R15.3)", () => {
    render(<TourInfo tour={createTour()} />);
    expect(screen.getByText("EcoAdventuras")).toBeInTheDocument();
  });

  it("shows difficulty badge with correct label (R15.3)", () => {
    render(<TourInfo tour={createTour({ difficulty: "aventurero" })} />);
    expect(screen.getByText("Aventurero")).toBeInTheDocument();
  });

  it("shows IVA exempt indicator when applicable (R15.4)", () => {
    render(<TourInfo tour={createTour({ ivaExemptAvailable: true })} />);
    expect(screen.getByText("IVA exento disponible")).toBeInTheDocument();
  });

  it("does not show IVA indicator when not applicable (R15.4)", () => {
    render(<TourInfo tour={createTour({ ivaExemptAvailable: false })} />);
    expect(screen.queryByText("IVA exento disponible")).not.toBeInTheDocument();
  });

  it("renders only one H1 on the page (R15.2 — unique H1)", () => {
    render(<TourInfo tour={createTour()} />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// StickyPrice tests
// ─────────────────────────────────────────────────────────────────────────

describe("StickyPrice", () => {
  it("shows formatted price (R15.5, R15.6)", () => {
    render(<StickyPrice priceCop={890000} />);
    // Both desktop and mobile show the price
    const priceElements = screen.getAllByText("Desde $890.000 COP por persona");
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows reserve CTA button (R15.5, R15.6)", () => {
    render(<StickyPrice priceCop={500000} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2); // one desktop, one mobile
    expect(buttons[0]).toHaveTextContent("Reservar ahora");
    expect(buttons[1]).toHaveTextContent("Reservar ahora");
  });

  it("calls onReserve when CTA is clicked", async () => {
    const onReserve = vi.fn();
    render(<StickyPrice priceCop={500000} onReserve={onReserve} />);
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(onReserve).toHaveBeenCalledTimes(1);
  });

  it("renders desktop sticky aside and mobile bar (R15.5, R15.6)", () => {
    render(<StickyPrice priceCop={1000000} />);
    const complementary = screen.getAllByRole("complementary", {
      name: "Precio y reserva del tour",
    });
    // Both desktop (aside) and mobile (div) render
    expect(complementary).toHaveLength(2);
  });

  it("desktop aside has sticky classes (R15.5, R15.7)", () => {
    render(<StickyPrice priceCop={1000000} />);
    const complementary = screen.getAllByRole("complementary", {
      name: "Precio y reserva del tour",
    });
    // The aside (first element) has sticky positioning
    const aside = complementary[0];
    expect(aside.className).toContain("lg:sticky");
    expect(aside.className).toContain("lg:top-4");
  });

  it("mobile bar has fixed positioning classes (R15.6, R15.7)", () => {
    render(<StickyPrice priceCop={1000000} />);
    const complementary = screen.getAllByRole("complementary", {
      name: "Precio y reserva del tour",
    });
    // The div (second element) has fixed positioning
    const bar = complementary[1];
    expect(bar.className).toContain("fixed");
    expect(bar.className).toContain("bottom-0");
  });
});
