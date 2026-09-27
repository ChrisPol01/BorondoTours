/**
 * Component tests — CatalogGrid (Task 13.2)
 *
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8
 *
 * Tests:
 * - Responsive grid classes (3 col / 2 col / 1 col).
 * - 12 skeletons on loading state (R11.5).
 * - Empty state with "limpiar filtros" action (R11.6).
 * - Error state with retry action conserving filters (R11.7).
 * - Renders TourCards with correct data (R11.4).
 * - Pagination controls show/hide appropriately (R11.8).
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock IntersectionObserver for jsdom (Image component uses it for lazy loading).
beforeAll(() => {
  // @ts-expect-error Mocking IntersectionObserver for jsdom
  global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => ({
    observe: vi.fn(() => {
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
});

import { CatalogGrid, type CatalogGridProps } from "./CatalogGrid";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { TourSummary } from "../../lib/types";

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="discovery">
      {children}
    </LanguageProvider>
  );
}

function renderGrid(overrides: Partial<CatalogGridProps> = {}) {
  const defaultProps: CatalogGridProps = {
    tours: [],
    isLoading: false,
    isError: false,
    pagination: { hasPrev: false, hasNext: false },
    onClearFilters: vi.fn(),
    onRetry: vi.fn(),
    onPrevPage: vi.fn(),
    onNextPage: vi.fn(),
    ...overrides,
  };

  return render(
    <Wrapper>
      <CatalogGrid {...defaultProps} />
    </Wrapper>,
  );
}

function makeTour(slug: string): TourSummary {
  return {
    slug,
    name: `Tour ${slug}`,
    operatorName: "Operador Test",
    region: "eje_cafetero",
    durationLabel: "3 días / 2 noches",
    basePriceCop: 1250000,
    photoUrl: `https://example.com/${slug}.jpg`,
    photoAlt: `Foto de ${slug}`,
    coordinates: [-75.5, 4.8],
    difficulty: "familiar",
    ivaExemptAvailable: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe("CatalogGrid — loading state (R11.5)", () => {
  it("renders 12 skeleton placeholders when isLoading is true", () => {
    renderGrid({ isLoading: true });

    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveAttribute("aria-busy", "true");

    // Each TourCardSkeleton renders multiple Skeleton spans; count the
    // top-level skeleton containers (direct children of the grid).
    const skeletonCards = loadingContainer.children;
    expect(skeletonCards).toHaveLength(12);
  });

  it("applies responsive grid classes to the loading container", () => {
    renderGrid({ isLoading: true });

    const container = screen.getByRole("status");
    // 1 columna es el default implícito de `grid` (sin clase explícita).
    expect(container).toHaveClass("grid");
    expect(container).toHaveClass("md:grid-cols-2");
    expect(container).toHaveClass("lg:grid-cols-3");
  });
});

describe("CatalogGrid — empty state (R11.6)", () => {
  it("shows empty message and 'limpiar filtros' button when tours array is empty", () => {
    const onClearFilters = vi.fn();
    renderGrid({ tours: [], onClearFilters });

    expect(screen.getByText("No encontramos tours con esos criterios.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /limpiar filtros/i })).toBeInTheDocument();
  });

  it("calls onClearFilters when 'limpiar filtros' button is clicked", async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    renderGrid({ tours: [], onClearFilters });

    await user.click(screen.getByRole("button", { name: /limpiar filtros/i }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});

describe("CatalogGrid — error state (R11.7)", () => {
  it("shows error message and 'reintentar' button", () => {
    renderGrid({ isError: true });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("calls onRetry when 'reintentar' button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderGrid({ isError: true, onRetry });

    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("CatalogGrid — data rendering (R11.4)", () => {
  it("renders TourCards with correct links to /tours/:slug", () => {
    const tours = [makeTour("laguna-otun"), makeTour("paramo-ruiz")];
    renderGrid({ tours });

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/tours/laguna-otun");
    expect(links[1]).toHaveAttribute("href", "/tours/paramo-ruiz");
  });

  it("displays tour name, duration and price", () => {
    const tours = [makeTour("laguna-otun")];
    renderGrid({ tours });

    expect(screen.getByText("Tour laguna-otun")).toBeInTheDocument();
    // TourCard renderiza "durationLabel • tipo" en un mismo nodo; matcher parcial.
    expect(
      screen.getByText((_content, element) =>
        element?.textContent === "3 días / 2 noches • Excursión",
      ),
    ).toBeInTheDocument();
    // Precio formateado con separador de miles COP.
    expect(screen.getByText(/1\.250\.000/)).toBeInTheDocument();
  });

  it("applies responsive grid classes to the tours container", () => {
    const tours = [makeTour("tour-1")];
    renderGrid({ tours });

    const section = screen.getByLabelText("Resultados del catálogo");
    const grid = section.querySelector(".grid");
    // 1 columna es el default implícito de `grid` (sin clase explícita).
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveClass("md:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });
});

describe("CatalogGrid — pagination cursor-based (R11.8)", () => {
  it("does not show pagination controls when there is neither prev nor next", () => {
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: false, hasNext: false } });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows pagination controls when there is a next page", () => {
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: false, hasNext: true } });

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("disables previous button when there is no previous page", () => {
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: false, hasNext: true } });

    const prevButton = screen.getByLabelText(/anterior/i);
    expect(prevButton).toBeDisabled();
  });

  it("disables next button when there is no next page", () => {
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: true, hasNext: false } });

    const nextButton = screen.getByLabelText(/siguiente/i);
    expect(nextButton).toBeDisabled();
  });

  it("calls onNextPage when next is clicked", async () => {
    const user = userEvent.setup();
    const onNextPage = vi.fn();
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: false, hasNext: true }, onNextPage });

    await user.click(screen.getByLabelText(/siguiente/i));
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it("calls onPrevPage when previous is clicked", async () => {
    const user = userEvent.setup();
    const onPrevPage = vi.fn();
    const tours = [makeTour("tour-1")];
    renderGrid({ tours, pagination: { hasPrev: true, hasNext: false }, onPrevPage });

    await user.click(screen.getByLabelText(/anterior/i));
    expect(onPrevPage).toHaveBeenCalledTimes(1);
  });
});
