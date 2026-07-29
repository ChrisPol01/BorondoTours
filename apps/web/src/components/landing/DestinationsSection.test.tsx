/**
 * Component tests — DestinationsSection (Task 11.6)
 *
 * Validates: Requirements 10.5, 10.6
 *
 * Tests:
 * - R10.5: Loading state renders Skeleton placeholders (not a generic spinner).
 * - R10.5: Multiple skeleton elements are rendered during loading.
 * - R10.6: Error state shows error message from i18n.
 * - R10.6: Error state shows retry button.
 * - R10.6: Clicking retry triggers refetch.
 * - R10.6: Error state preserves rest of page content (trust badges remain).
 */
import { describe, it, expect, vi, beforeAll, type Mock } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock @tanstack/react-query to control useQuery state without hitting the
// real fetch function (which is internal to the module and not exported).
const mockRefetch = vi.fn().mockResolvedValue({ data: [] });

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Import after mocks are set up.
import { useQuery } from "@tanstack/react-query";
import { DestinationsSection } from "./DestinationsSection";

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Configure the mocked `useQuery` hook to return the specified state.
 */
function mockUseQueryState(state: {
  isLoading?: boolean;
  isError?: boolean;
  data?: unknown;
}) {
  (useQuery as Mock).mockReturnValue({
    data: state.data ?? undefined,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    refetch: mockRefetch,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Tests: Loading state — Skeleton placeholders (R10.5)
// ─────────────────────────────────────────────────────────────────────────

describe("DestinationsSection — loading state (R10.5)", () => {
  it("renders Skeleton placeholders instead of a generic spinner", () => {
    mockUseQueryState({ isLoading: true });
    render(<DestinationsSection />);

    // The loading container should use role="status" with aria-busy
    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toHaveAttribute("aria-busy", "true");

    // Should NOT contain a text "loading" or a spinner element
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  });

  it("renders multiple skeleton elements during loading (6 card placeholders)", () => {
    mockUseQueryState({ isLoading: true });
    render(<DestinationsSection />);

    const loadingContainer = screen.getByRole("status");
    // Each skeleton card is a direct child div of the grid
    const skeletonCards = loadingContainer.children;
    expect(skeletonCards.length).toBe(6);
  });

  it("each skeleton card contains multiple Skeleton spans for image/text placeholders", () => {
    mockUseQueryState({ isLoading: true });
    render(<DestinationsSection />);

    const loadingContainer = screen.getByRole("status");
    const firstCard = loadingContainer.children[0] as HTMLElement;

    // Each card should contain skeleton spans (bg-arena + animate-pulse)
    const skeletons = firstCard.querySelectorAll(".bg-arena");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("skeleton elements have animate-pulse class for animation", () => {
    mockUseQueryState({ isLoading: true });
    render(<DestinationsSection />);

    const loadingContainer = screen.getByRole("status");
    const firstSkeleton = loadingContainer.querySelector(".bg-arena");
    expect(firstSkeleton).toHaveClass("animate-pulse");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Tests: Error state (R10.6)
// ─────────────────────────────────────────────────────────────────────────

describe("DestinationsSection — error state (R10.6)", () => {
  it("shows error message from i18n (home:destinations.error)", () => {
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    // The translated error message for es locale
    expect(
      screen.getByText("No pudimos cargar los destinos."),
    ).toBeInTheDocument();
  });

  it("shows error container with role='alert' for accessibility", () => {
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows retry button (home:destinations.retry)", () => {
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    expect(
      screen.getByRole("button", { name: /reintentar/i }),
    ).toBeInTheDocument();
  });

  it("clicking retry triggers refetch", async () => {
    const user = userEvent.setup();
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("preserves trust badges section when error is shown (inline error, not full-page replacement)", () => {
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    // Trust badges should still be rendered (R10.6 — preserves rest of page)
    // The 4 trust badge titles (from i18n home namespace)
    expect(screen.getByText("Turismo Responsable")).toBeInTheDocument();
    expect(screen.getByText("Experiencias Únicas")).toBeInTheDocument();
    expect(screen.getByText("Seguridad Garantizada")).toBeInTheDocument();
    expect(screen.getByText("Atención Personalizada")).toBeInTheDocument();
  });

  it("section heading remains visible during error state", () => {
    mockUseQueryState({ isError: true });
    render(<DestinationsSection />);

    expect(
      screen.getByRole("heading", { level: 2 }),
    ).toBeInTheDocument();
  });
});
