/**
 * Component tests — Navbar (Task 10.3)
 *
 * Validates: Requirements 6.4, 6.5, 6.7
 *
 * Tests:
 * - Renders navigation links.
 * - Glass vs solid class switching (initial state without hero sentinel).
 * - Mobile menu aria-expanded toggle.
 * - Escape returns focus to the hamburger button (focus trap behavior).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeaderIsland } from "./Navbar";
import { LanguageProvider } from "../../lib/i18n/provider";

/** Wrapper providing LanguageProvider with es catalog. */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="nav">
      {children}
    </LanguageProvider>
  );
}

// Mock IntersectionObserver for tests
let intersectionCallback: IntersectionObserverCallback | null = null;
const mockDisconnect = vi.fn();
const mockObserve = vi.fn();

beforeEach(() => {
  // @ts-expect-error Mocking IntersectionObserver for jsdom
  global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    };
  });
});

afterEach(() => {
  intersectionCallback = null;
  mockDisconnect.mockClear();
  mockObserve.mockClear();
});

describe("Navbar — renders links (R6.2)", () => {
  it("renders all 5 navigation links from i18n", () => {
    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    expect(screen.getByText("Destinos")).toBeInTheDocument();
    expect(screen.getByText("Experiencias")).toBeInTheDocument();
    expect(screen.getByText("Nosotros")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Contacto")).toBeInTheDocument();
  });

  it("renders the CTA button 'Planifica tu viaje' (R6.3)", () => {
    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    // The CTA renders as a button with the translated text
    const ctaButtons = screen.getAllByText("Planifica tu viaje");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("preserves the horizontal logo proportions, minimum size, and clear-space hooks (R6.8)", () => {
    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const logo = screen.getByAltText("Borondo Tours — inicio");
    expect(logo).toHaveClass("brand-logo-horizontal");
    expect(logo.parentElement).toHaveClass("brand-logo-clear-space");
    expect(logo).not.toHaveClass("h-10");
  });
});

describe("Navbar — glass vs solid class switching (R6.4, R6.5)", () => {
  it("defaults to glass (isOverHero=true) initially with glass-surface class", () => {
    // Add sentinel to DOM so IntersectionObserver can observe it
    const sentinel = document.createElement("div");
    sentinel.setAttribute("data-hero-sentinel", "");
    document.body.appendChild(sentinel);

    const { container } = render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const header = container.querySelector("header");
    // Initial state is glass (isOverHero=true by default)
    expect(header).toHaveClass("glass-surface");
    expect(header).toHaveClass("text-blanco-niebla");

    document.body.removeChild(sentinel);
  });

  it("switches to solid bg when no hero sentinel is present (R6.5)", () => {
    // No sentinel in DOM → always solid
    const { container } = render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-blanco-niebla");
    expect(header).toHaveClass("text-negro-volcanico");
  });

  it("switches to solid when IntersectionObserver reports hero not intersecting", () => {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("data-hero-sentinel", "");
    document.body.appendChild(sentinel);

    const { container } = render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    // Simulate scroll away from hero
    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    const header = container.querySelector("header");
    expect(header).toHaveClass("bg-blanco-niebla");
    expect(header).toHaveClass("text-negro-volcanico");

    document.body.removeChild(sentinel);
  });
});

describe("Navbar — mobile menu aria-expanded toggle (R6.7)", () => {
  it("hamburger button has aria-expanded=false initially", () => {
    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const hamburger = screen.getByLabelText("Abrir menú");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles aria-expanded to true when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const hamburger = screen.getByLabelText("Abrir menú");
    await user.click(hamburger);

    // After opening, label changes to "Cerrar menú"
    const closeButton = screen.getByLabelText("Cerrar menú");
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
  });

  it("shows mobile menu panel when opened", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    const hamburger = screen.getByLabelText("Abrir menú");
    await user.click(hamburger);

    const mobileMenu = document.getElementById("mobile-nav-menu");
    expect(mobileMenu).toBeInTheDocument();
  });
});

describe("Navbar — Escape returns focus (R6.7 focus trap)", () => {
  it("closes the mobile menu and returns focus to hamburger on Escape", async () => {
    render(
      <Wrapper>
        <HeaderIsland />
      </Wrapper>,
    );

    // Open the menu
    const hamburger = screen.getByLabelText("Abrir menú");
    await act(async () => {
      fireEvent.click(hamburger);
    });

    // Wait for focus trap to activate
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    // Press Escape
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    // Wait for cleanup
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    // Menu should be closed and focus returned to the hamburger button
    const hamburgerAfter = screen.getByLabelText("Abrir menú");
    expect(hamburgerAfter).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(hamburgerAfter);
  });
});
