/**
 * Component tests — TourAddOns (Task 15.4)
 *
 * Validates: Requirements 16.5, 16.6
 *
 * Tests:
 * - Renders add-ons with name, description, and price (R16.5).
 * - Omits the section when no add-ons (R16.6).
 * - Formats prices correctly with grouping.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TourAddOns } from "./TourAddOns";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { AddOn } from "../../lib/types";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="detail">
      {children}
    </LanguageProvider>
  );
}

describe("TourAddOns — rendering add-ons (R16.5)", () => {
  const sampleAddOns: AddOn[] = [
    {
      id: "addon-1",
      name: "Almuerzo típico",
      shortDescription: "Almuerzo con ingredientes locales servido en finca.",
      additionalPriceCop: 45000,
    },
    {
      id: "addon-2",
      name: "Guía fotógrafo",
      shortDescription: "Fotógrafo profesional durante toda la experiencia.",
      additionalPriceCop: 150000,
    },
  ];

  it("renders the section title from i18n", () => {
    render(
      <Wrapper>
        <TourAddOns addOns={sampleAddOns} />
      </Wrapper>,
    );

    expect(screen.getByText("Complementa tu experiencia")).toBeInTheDocument();
  });

  it("renders each add-on name", () => {
    render(
      <Wrapper>
        <TourAddOns addOns={sampleAddOns} />
      </Wrapper>,
    );

    expect(screen.getByText("Almuerzo típico")).toBeInTheDocument();
    expect(screen.getByText("Guía fotógrafo")).toBeInTheDocument();
  });

  it("renders each add-on description", () => {
    render(
      <Wrapper>
        <TourAddOns addOns={sampleAddOns} />
      </Wrapper>,
    );

    expect(screen.getByText("Almuerzo con ingredientes locales servido en finca.")).toBeInTheDocument();
    expect(screen.getByText("Fotógrafo profesional durante toda la experiencia.")).toBeInTheDocument();
  });

  it("renders prices formatted as +$X COP", () => {
    render(
      <Wrapper>
        <TourAddOns addOns={sampleAddOns} />
      </Wrapper>,
    );

    expect(screen.getByText("+$45.000 COP")).toBeInTheDocument();
    expect(screen.getByText("+$150.000 COP")).toBeInTheDocument();
  });

  it("renders a single add-on correctly", () => {
    const singleAddon: AddOn[] = [
      {
        id: "addon-x",
        name: "Snorkel",
        shortDescription: "Equipo completo de snorkel incluido.",
        additionalPriceCop: 25000,
      },
    ];

    render(
      <Wrapper>
        <TourAddOns addOns={singleAddon} />
      </Wrapper>,
    );

    expect(screen.getByText("Snorkel")).toBeInTheDocument();
    expect(screen.getByText("+$25.000 COP")).toBeInTheDocument();
  });

  it("does not render description when it is empty string", () => {
    const addonNoDesc: AddOn[] = [
      {
        id: "addon-no-desc",
        name: "Seguro básico",
        shortDescription: "",
        additionalPriceCop: 10000,
      },
    ];

    render(
      <Wrapper>
        <TourAddOns addOns={addonNoDesc} />
      </Wrapper>,
    );

    expect(screen.getByText("Seguro básico")).toBeInTheDocument();
    expect(screen.getByText("+$10.000 COP")).toBeInTheDocument();
    // No paragraph for description should be rendered
    const cards = screen.getByText("Seguro básico").closest("div");
    expect(cards?.querySelector("p")).toBeNull();
  });
});

describe("TourAddOns — omit section when empty (R16.6)", () => {
  it("renders nothing when addOns array is empty", () => {
    const { container } = render(
      <Wrapper>
        <TourAddOns addOns={[]} />
      </Wrapper>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("does not render the title when there are no add-ons", () => {
    render(
      <Wrapper>
        <TourAddOns addOns={[]} />
      </Wrapper>,
    );

    expect(screen.queryByText("Complementa tu experiencia")).not.toBeInTheDocument();
  });
});

describe("TourAddOns — price formatting edge cases", () => {
  it("formats large prices with proper dot grouping", () => {
    const expensiveAddon: AddOn[] = [
      {
        id: "addon-expensive",
        name: "Vuelo privado",
        shortDescription: "Charter a destino remoto.",
        additionalPriceCop: 5500000,
      },
    ];

    render(
      <Wrapper>
        <TourAddOns addOns={expensiveAddon} />
      </Wrapper>,
    );

    expect(screen.getByText("+$5.500.000 COP")).toBeInTheDocument();
  });

  it("formats small prices under 1000 without grouping", () => {
    const cheapAddon: AddOn[] = [
      {
        id: "addon-cheap",
        name: "Mapa impreso",
        shortDescription: "Mapa del recorrido.",
        additionalPriceCop: 500,
      },
    ];

    render(
      <Wrapper>
        <TourAddOns addOns={cheapAddon} />
      </Wrapper>,
    );

    expect(screen.getByText("+$500 COP")).toBeInTheDocument();
  });
});
