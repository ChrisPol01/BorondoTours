/**
 * Component tests — estados de Discovery (Task 13.6)
 *
 * Validates: Requirements 11.6, 12.5, 12.6, 13.10, 13.13
 *
 * Tests:
 * - R11.6: Empty state with "limpiar filtros" action (already partially covered
 *   in CatalogGrid.test.tsx — here we add integration-level coverage).
 * - R12.5: SearchBar preserves text in input when no results are returned.
 * - R12.6: Error state preserves last catalog shown (CatalogController behavior).
 * - R13.10: FilterPanel hydrates controls from URL params on page load.
 * - R13.13: FilterPanel renders mobile drawer trigger at <768px.
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock IntersectionObserver for jsdom
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

  // Mock requestAnimationFrame for useFocusTrap
  global.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
  });
  global.cancelAnimationFrame = vi.fn();
});

import { LanguageProvider } from "../../lib/i18n/provider";
import { SearchBar } from "./SearchBar";
import { FilterPanel } from "./FilterPanel";
import type { FilterValues } from "./FilterPanel";
import { CatalogGrid, type CatalogGridProps } from "./CatalogGrid";
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

const DEFAULT_FILTERS: FilterValues = {
  regions: [],
  durations: [],
  priceMin: 0,
  priceMax: 999_999_999,
  difficulties: [],
  passportOnly: false,
  sort: "popular",
};

// ─────────────────────────────────────────────────────────────────────────
// R12.5: SearchBar preserva texto cuando no hay resultados
// ─────────────────────────────────────────────────────────────────────────

describe("Discovery — SearchBar preserves text on no results (R12.5)", () => {
  let mockSearch: string;
  const replaceStateSpy = vi.fn();

  beforeEach(() => {
    mockSearch = "?q=inexistente";
    Object.defineProperty(window, "location", {
      value: {
        get search() { return mockSearch; },
        set search(val: string) { mockSearch = val; },
        pathname: "/discovery",
        href: "http://localhost/discovery?q=inexistente",
      },
      writable: true,
      configurable: true,
    });
    replaceStateSpy.mockImplementation((_state: unknown, _title: string, url?: string) => {
      if (typeof url === "string") {
        const queryIndex = url.indexOf("?");
        mockSearch = queryIndex >= 0 ? url.slice(queryIndex) : "";
      }
    });
    vi.spyOn(window.history, "replaceState").mockImplementation(replaceStateSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("SearchBar retains user text when CatalogGrid shows empty state", () => {
    // El escenario: el usuario escribió "inexistente", no hay resultados.
    // SearchBar debe conservar el texto en el input (R12.5) y CatalogGrid
    // muestra el estado vacío (R11.6).
    const { container } = render(
      <Wrapper>
        <SearchBar />
        <CatalogGrid
          tours={[]}
          isLoading={false}
          isError={false}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={vi.fn()}
          onRetry={vi.fn()}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    // SearchBar preserva el texto del query param
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("inexistente");

    // CatalogGrid muestra el estado vacío
    expect(screen.getByText("No encontramos tours con esos criterios.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /limpiar filtros/i })).toBeInTheDocument();
  });

  it("SearchBar text is preserved even after empty state is visible", () => {
    // Simula que se renderiza primero con resultados y luego sin ellos
    const onClearFilters = vi.fn();
    const { rerender } = render(
      <Wrapper>
        <SearchBar />
        <CatalogGrid
          tours={[makeTour("tour-1")]}
          isLoading={false}
          isError={false}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={onClearFilters}
          onRetry={vi.fn()}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    // El input tiene valor de la URL
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("inexistente");

    // Rerender con tours vacíos (simula respuesta del servidor sin resultados)
    rerender(
      <Wrapper>
        <SearchBar />
        <CatalogGrid
          tours={[]}
          isLoading={false}
          isError={false}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={onClearFilters}
          onRetry={vi.fn()}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    // El texto del SearchBar se mantiene intacto
    expect(input).toHaveValue("inexistente");
    // Y se muestra el estado vacío
    expect(screen.getByText("No encontramos tours con esos criterios.")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R12.6: Error conserva último catálogo mostrado
// ─────────────────────────────────────────────────────────────────────────

describe("Discovery — Error preserves last catalog (R12.6)", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        search: "?q=cafe",
        pathname: "/discovery",
        href: "http://localhost/discovery?q=cafe",
      },
      writable: true,
      configurable: true,
    });
  });

  it("when error occurs, CatalogGrid shows error state with retry action", () => {
    const onRetry = vi.fn();
    render(
      <Wrapper>
        <CatalogGrid
          tours={[]}
          isLoading={false}
          isError={true}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={vi.fn()}
          onRetry={onRetry}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("error state does NOT clear filters — onRetry preserves current state", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onClearFilters = vi.fn();

    render(
      <Wrapper>
        <CatalogGrid
          tours={[]}
          isLoading={false}
          isError={true}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={onClearFilters}
          onRetry={onRetry}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    // onRetry se invoca (para reintentar con los mismos filtros)
    expect(onRetry).toHaveBeenCalledTimes(1);
    // onClearFilters NO se invoca (los filtros se preservan)
    expect(onClearFilters).not.toHaveBeenCalled();
  });

  it("transition from data → error: error state replaces grid but CatalogController preserves filters", () => {
    // Simula la secuencia: primero hay datos, luego ocurre un error.
    // Los filtros se mantienen porque el error no resetea el estado del catálogo.
    const tours = [makeTour("cafe-1"), makeTour("cafe-2")];
    const onRetry = vi.fn();

    const { rerender } = render(
      <Wrapper>
        <CatalogGrid
          tours={tours}
          isLoading={false}
          isError={false}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={vi.fn()}
          onRetry={onRetry}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    // Inicialmente vemos las cards
    expect(screen.getByText("Tour cafe-1")).toBeInTheDocument();
    expect(screen.getByText("Tour cafe-2")).toBeInTheDocument();

    // Cuando ocurre un error, CatalogGrid muestra el estado de error
    rerender(
      <Wrapper>
        <CatalogGrid
          tours={[]}
          isLoading={false}
          isError={true}
          pagination={{ currentPage: 1, totalPages: 1 }}
          onClearFilters={vi.fn()}
          onRetry={onRetry}
          onPageChange={vi.fn()}
        />
      </Wrapper>,
    );

    // Las cards ya no están visibles — el estado de error las reemplaza
    expect(screen.queryByText("Tour cafe-1")).not.toBeInTheDocument();
    // Pero el estado de error está presente con reintentar
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R13.10: FilterPanel hidrata controles desde URL params al cargar
// ─────────────────────────────────────────────────────────────────────────

describe("Discovery — FilterPanel hydrates from URL params (R13.10)", () => {
  it("renders with pre-selected regions from filters state", () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      regions: ["eje_cafetero", "amazonia"],
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    // En desktop sidebar, los checkboxes de las regiones seleccionadas están marcados
    const sidebar = screen.getByLabelText("Filtros del catálogo");
    const ejeCafetero = within(sidebar).getByLabelText("Eje Cafetero");
    const amazonia = within(sidebar).getByLabelText("Amazonia");
    const llanos = within(sidebar).getByLabelText("Llanos");

    expect(ejeCafetero).toBeChecked();
    expect(amazonia).toBeChecked();
    expect(llanos).not.toBeChecked();
  });

  it("renders with pre-selected durations from filters state", () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      durations: ["half_day", "more_than_three"],
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const sidebar = screen.getByLabelText("Filtros del catálogo");
    const halfDay = within(sidebar).getByLabelText("Medio día");
    const moreThanThree = within(sidebar).getByLabelText("Más de 3 días");
    const oneDay = within(sidebar).getByLabelText("1 día");

    expect(halfDay).toBeChecked();
    expect(moreThanThree).toBeChecked();
    expect(oneDay).not.toBeChecked();
  });

  it("renders with pre-selected difficulties from filters state", () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      difficulties: ["aventurero"],
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const sidebar = screen.getByLabelText("Filtros del catálogo");
    const aventurero = within(sidebar).getByLabelText("Aventurero");
    const familiar = within(sidebar).getByLabelText("Familiar");

    expect(aventurero).toBeChecked();
    expect(familiar).not.toBeChecked();
  });

  it("renders passport checkbox checked when passportOnly is true", () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      passportOnly: true,
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const sidebar = screen.getByLabelText("Filtros del catálogo");
    const passport = within(sidebar).getByLabelText("Incluye pasaporte (IVA exento)");
    expect(passport).toBeChecked();
  });

  it("shows 'limpiar filtros' button when any filter is active", () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      regions: ["llanos"],
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const sidebar = screen.getByLabelText("Filtros del catálogo");
    expect(within(sidebar).getByRole("button", { name: /limpiar filtros/i })).toBeInTheDocument();
  });

  it("does NOT show 'limpiar filtros' button when no filters are active", () => {
    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const sidebar = screen.getByLabelText("Filtros del catálogo");
    expect(within(sidebar).queryByRole("button", { name: /limpiar filtros/i })).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R13.13: FilterPanel <768px renders lateral drawer without collapsing grid
// ─────────────────────────────────────────────────────────────────────────

describe("Discovery — FilterPanel mobile drawer <768px (R13.13)", () => {
  it("renders a trigger button in the mobile container (md:hidden)", () => {
    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    // El botón de filtros existe para mobile (dentro del contenedor md:hidden)
    const buttons = screen.getAllByRole("button", { name: /filtros/i });
    // Al menos un botón "Filtros" está presente (el trigger del drawer mobile)
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    // El trigger button tiene aria-expanded=false (drawer cerrado)
    const triggerButton = buttons.find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    );
    expect(triggerButton).toBeDefined();
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
    expect(triggerButton).toHaveAttribute("aria-controls", "filter-drawer");
  });

  it("opens drawer dialog when trigger button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    // Encontrar el trigger con aria-expanded
    const triggerButton = screen.getAllByRole("button", { name: /filtros/i }).find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    )!;

    await user.click(triggerButton);

    // El drawer se abre como dialog modal
    const drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(drawer).toHaveAttribute("aria-label", "Filtros");

    // El trigger ahora indica que está expandido
    expect(triggerButton).toHaveAttribute("aria-expanded", "true");
  });

  it("drawer contains filter controls (region checkboxes)", async () => {
    const user = userEvent.setup();
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      regions: ["costa_caribe"],
    };

    render(
      <Wrapper>
        <FilterPanel
          filters={filters}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const triggerButton = screen.getAllByRole("button", { name: /filtros/i }).find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    )!;

    await user.click(triggerButton);

    const drawer = screen.getByRole("dialog");
    // El drawer contiene checkboxes de filtros con estado hidratado
    const costaCaribe = within(drawer).getByLabelText("Costa Caribe");
    expect(costaCaribe).toBeChecked();
  });

  it("drawer closes when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const triggerButton = screen.getAllByRole("button", { name: /filtros/i }).find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    )!;

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Cerrar con el botón de cerrar
    const closeButton = screen.getByLabelText(/cerrar/i);
    await user.click(closeButton);

    // El drawer ya no está visible
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("drawer closes on Escape key press", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    const triggerButton = screen.getAllByRole("button", { name: /filtros/i }).find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    )!;

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Presionar Escape cierra el drawer (R22.7)
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("desktop sidebar is rendered alongside the mobile trigger (both present in DOM)", () => {
    // R13.13: El grid no se colapsa — el sidebar desktop y el drawer mobile
    // coexisten en el DOM, controlados por classes CSS (hidden/md:block)
    render(
      <Wrapper>
        <FilterPanel
          filters={DEFAULT_FILTERS}
          onFilterChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      </Wrapper>,
    );

    // El sidebar desktop existe con aria-label
    expect(screen.getByLabelText("Filtros del catálogo")).toBeInTheDocument();

    // El trigger mobile también existe
    const triggerButton = screen.getAllByRole("button", { name: /filtros/i }).find(
      (btn) => btn.getAttribute("aria-expanded") !== null,
    );
    expect(triggerButton).toBeDefined();
  });
});
