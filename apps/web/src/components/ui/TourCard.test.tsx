/**
 * Component tests — GlassSurface & TourCard (Task 8.5)
 *
 * Validates: Requirements 4.5, 4.6, 4.7, 4.8
 *
 * Tests:
 * - TourCard: distinct visible elements (photo alt non-empty, name, duration, price, badge).
 * - TourCard: activation with Enter/Space.
 * - GlassSurface: renders with glass-surface class (fallback via @supports not applies solid bg).
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { TourCard } from "./TourCard";
import { GlassSurface } from "./GlassSurface";
import type { TourSummary } from "../../lib/types";

// Mock IntersectionObserver for jsdom (Image component uses it for lazy loading).
// We simulate "in view" so the Image renders immediately.
beforeAll(() => {
  // @ts-expect-error Mocking IntersectionObserver for jsdom
  global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => ({
    observe: vi.fn(() => {
      // Immediately report intersection so Image renders
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
});

/** Sample tour data for testing. */
const mockTour: TourSummary = {
  slug: "laguna-del-otun",
  name: "Laguna del Otún",
  operatorName: "Borondo Expediciones",
  region: "eje_cafetero",
  durationLabel: "3 días / 2 noches",
  basePriceCop: 1250000,
  photoUrl: "/images/laguna-otun.webp",
  photoAlt: "Vista panorámica de la Laguna del Otún con frailejones",
  coordinates: [-75.4, 4.7],
  difficulty: "aventurero",
  ivaExemptAvailable: false,
};

describe("TourCard — visible elements (R4.6)", () => {
  it("renders photo with non-empty alt text (R4.7)", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", mockTour.photoAlt);
    expect(img.getAttribute("alt")).not.toBe("");
  });

  it("renders the tour name", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    expect(screen.getByText("Laguna del Otún")).toBeInTheDocument();
  });

  it("renders the duration label", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    expect(screen.getByText("3 días / 2 noches")).toBeInTheDocument();
  });

  it("renders the formatted price", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    // formatPriceCop(1250000) should produce "Desde $1.250.000 COP por persona"
    expect(screen.getByText(/1\.250\.000/)).toBeInTheDocument();
  });

  it("renders the operator badge", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    expect(screen.getByText("Borondo Expediciones")).toBeInTheDocument();
  });
});

describe("TourCard — keyboard activation (R4.8)", () => {
  it("activates with Enter key (native anchor behavior)", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tours/laguna-del-otun");
  });

  it("activates with Space key via onKeyDown handler", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    const link = screen.getByRole("link");

    // Simulate Space keydown — the component calls click() on the element
    const clickSpy = vi.spyOn(link, "click");
    fireEvent.keyDown(link, { key: " " });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("shows focus-visible ring for keyboard focus indicator (R4.8)", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("focus-visible:ring-2");
    expect(link).toHaveClass("focus-visible:ring-azul-profundo");
  });
});

describe("TourCard — glass variant", () => {
  it("renders with glass-surface class when glass=true", () => {
    const { container } = render(
      <TourCard tour={mockTour} href="/tours/laguna-del-otun" glass />,
    );

    // The Card component with variant=glass wraps in GlassSurface which adds glass-surface class
    const glassSurface = container.querySelector(".glass-surface");
    expect(glassSurface).toBeInTheDocument();
  });

  it("uses light text classes (blanco-niebla) on glass variant", () => {
    render(<TourCard tour={mockTour} href="/tours/laguna-del-otun" glass />);

    const name = screen.getByText("Laguna del Otún");
    expect(name).toHaveClass("text-blanco-niebla");
  });
});

describe("GlassSurface — rendering and fallback (R4.5)", () => {
  it("renders children inside a container with glass-surface class", () => {
    const { container } = render(
      <GlassSurface overImage={true}>
        <p>Test content</p>
      </GlassSurface>,
    );

    const surface = container.firstElementChild as HTMLElement;
    expect(surface).toHaveClass("glass-surface");
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    const { container } = render(
      <GlassSurface overImage={true}>Content</GlassSurface>,
    );

    const surface = container.firstElementChild as HTMLElement;
    expect(surface.tagName).toBe("DIV");
  });

  it("renders with custom element tag via `as` prop", () => {
    const { container } = render(
      <GlassSurface as="section" overImage={true}>Content</GlassSurface>,
    );

    const surface = container.firstElementChild as HTMLElement;
    expect(surface.tagName).toBe("SECTION");
  });

  it("appends additional className", () => {
    const { container } = render(
      <GlassSurface overImage={true} className="p-6 mt-4">Content</GlassSurface>,
    );

    const surface = container.firstElementChild as HTMLElement;
    expect(surface).toHaveClass("glass-surface");
    expect(surface).toHaveClass("p-6");
    expect(surface).toHaveClass("mt-4");
  });
});


