/**
 * Component tests — SearchBar (Task 13.3)
 *
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 *
 * Tests:
 * - Input accepts 0-100 chars (R12.1)
 * - Debounce of 300ms before updating URL (R12.2)
 * - Writes normalized (trimmed) `q` to URL (R12.3)
 * - Hydrates from `q` URL param on mount (R12.4)
 * - Clear button removes text and `q` from URL (R12.7)
 * - Minimum 2 chars to trigger search (R12.1)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchBar } from "./SearchBar";

// ─────────────────────────────────────────────────────────────────────────
// Mock de window.location y history
// ─────────────────────────────────────────────────────────────────────────

let mockSearch = "";
const replaceStateSpy = vi.fn();

beforeEach(() => {
  mockSearch = "";

  Object.defineProperty(window, "location", {
    value: {
      get search() { return mockSearch; },
      set search(val: string) { mockSearch = val; },
      pathname: "/discovery",
      href: "http://localhost/discovery",
    },
    writable: true,
    configurable: true,
  });

  replaceStateSpy.mockImplementation((_state, _title, url) => {
    if (typeof url === "string") {
      const queryIndex = url.indexOf("?");
      mockSearch = queryIndex >= 0 ? url.slice(queryIndex) : "";
    }
  });

  vi.spyOn(window.history, "replaceState").mockImplementation(replaceStateSpy);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe("SearchBar - input constraints (R12.1)", () => {
  it("renders an input with maxLength=100", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("maxLength", "100");
  });

  it("has placeholder from i18n (discovery:search.placeholder)", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("placeholder", "Busca por nombre, destino o experiencia");
  });

  it("has an accessible label via aria-label", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-label", "Busca por nombre, destino o experiencia");
  });
});

describe("SearchBar - debounce 300ms and URL update (R12.2, R12.3)", () => {
  it("does not update URL before 300ms debounce", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    // Use fireEvent for immediate, synchronous interaction with fake timers
    fireEvent.change(input, { target: { value: "cafe" } });

    // Before debounce, no replaceState should have been called
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it("updates URL after 300ms debounce with value >= 2 chars", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "cafe" } });

    act(() => { vi.advanceTimersByTime(300); });

    expect(replaceStateSpy).toHaveBeenCalled();
    expect(mockSearch).toContain("q=cafe");
  });

  it("trims the value written to URL (R12.3)", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "  paisaje  " } });

    act(() => { vi.advanceTimersByTime(300); });

    const params = new URLSearchParams(mockSearch);
    expect(params.get("q")).toBe("paisaje");
  });

  it("removes q from URL when trimmed text has less than 2 chars (R12.1)", () => {
    mockSearch = "?q=test";
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "a" } });

    act(() => { vi.advanceTimersByTime(300); });

    const params = new URLSearchParams(mockSearch);
    expect(params.has("q")).toBe(false);
  });

  it("resets debounce timer on each keystroke", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "ca" } });

    // Advance 200ms (not enough)
    act(() => { vi.advanceTimersByTime(200); });
    expect(replaceStateSpy).not.toHaveBeenCalled();

    // Type more (resets the timer)
    fireEvent.change(input, { target: { value: "cafe" } });

    // Advance another 200ms (total 400ms from first, 200ms from second)
    act(() => { vi.advanceTimersByTime(200); });
    expect(replaceStateSpy).not.toHaveBeenCalled();

    // Advance remaining 100ms to complete 300ms from last change
    act(() => { vi.advanceTimersByTime(100); });
    expect(replaceStateSpy).toHaveBeenCalled();
    expect(mockSearch).toContain("q=cafe");
  });
});

describe("SearchBar - hydration from URL (R12.4)", () => {
  it("initializes input value from q param in URL", () => {
    mockSearch = "?q=llanos";
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("llanos");
  });

  it("initializes empty when no q param exists in URL", () => {
    mockSearch = "";
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");
  });
});

describe("SearchBar - clear button (R12.7)", () => {
  it("shows clear button when input has text", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "test" } });

    const clearBtn = screen.getByRole("button", { name: /limpiar/i });
    expect(clearBtn).toBeInTheDocument();
  });

  it("does not show clear button when input is empty", () => {
    mockSearch = "";
    render(<SearchBar />);
    expect(screen.queryByRole("button", { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it("clears input and removes q from URL on click", () => {
    mockSearch = "?q=montana&view=list";
    render(<SearchBar />);

    const clearBtn = screen.getByRole("button", { name: /limpiar/i });
    fireEvent.click(clearBtn);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");

    // URL should not have q but should preserve other params
    const params = new URLSearchParams(mockSearch);
    expect(params.has("q")).toBe(false);
    expect(params.get("view")).toBe("list");
  });

  it("returns focus to input after clearing", () => {
    mockSearch = "?q=test";
    render(<SearchBar />);

    const clearBtn = screen.getByRole("button", { name: /limpiar/i });
    fireEvent.click(clearBtn);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveFocus();
  });
});
