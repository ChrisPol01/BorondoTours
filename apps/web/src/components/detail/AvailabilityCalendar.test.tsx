/**
 * Component tests — AvailabilityCalendar (Task 15.7)
 *
 * Validates: Requirements 17.5, 17.8
 *
 * Tests:
 * - R17.5: Calendar blocks selection on red/gray dates and indicates visually.
 * - R17.8: aria-label per date includes formatted date + available slots as integer ≥0.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { TourInstance } from "../../lib/types";

// ─────────────────────────────────────────────────────────────────────────
// Mock window.matchMedia (jsdom does not implement it)
// ─────────────────────────────────────────────────────────────────────────

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Wrapper
// ─────────────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="detail">
      {children}
    </LanguageProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build a future date ISO string guaranteed to be in the NEXT month so
 * all test dates land in the same calendar month regardless of when
 * tests run (avoids month-boundary issues with single-month rendering).
 */
function futureMonthDate(day: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-${String(day).padStart(2, "0")}`;
}

/**
 * Find a calendar day button by its aria-label content AND css class.
 * react-day-picker may render duplicate buttons; this helper finds the
 * one rendered by our CustomDayButton with the expected styling.
 */
function findDayButton(
  container: HTMLElement,
  ariaLabelFragment: string,
  cssClassFragment?: string,
): HTMLButtonElement | undefined {
  const allButtons = container.querySelectorAll<HTMLButtonElement>("button[aria-label]");
  let result: HTMLButtonElement | undefined;
  allButtons.forEach((btn) => {
    const label = btn.getAttribute("aria-label") ?? "";
    if (label.includes(ariaLabelFragment)) {
      if (cssClassFragment === undefined || btn.className.includes(cssClassFragment)) {
        result = btn;
      }
    }
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────
// Fixtures — all dates in the same future month (days 10–13)
// ─────────────────────────────────────────────────────────────────────────

/** A green date (≥50% available). */
const greenDate = futureMonthDate(10);
/** A yellow date (1%–49% available). */
const yellowDate = futureMonthDate(11);
/** A red date (0 available). */
const redDate = futureMonthDate(12);
/** A gray date (not offered). */
const grayDate = futureMonthDate(13);

function createInstances(): TourInstance[] {
  return [
    { date: greenDate, available: 10, total: 20, currentPriceCop: 500000, isOffered: true },
    { date: yellowDate, available: 3, total: 20, currentPriceCop: 550000, isOffered: true },
    { date: redDate, available: 0, total: 20, currentPriceCop: 600000, isOffered: true },
    { date: grayDate, available: 5, total: 20, currentPriceCop: 600000, isOffered: false },
  ];
}


// ─────────────────────────────────────────────────────────────────────────
// Tests — R17.8: aria-label por fecha con cupos ≥0
// ─────────────────────────────────────────────────────────────────────────

describe("AvailabilityCalendar — aria-label with date and slots (R17.8)", () => {
  it("green date has aria-label with formatted date and slot count ≥0", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const greenButton = findDayButton(container, "10 cupos disponibles", "cursor-pointer");
    expect(greenButton).toBeDefined();
    // Verify label contains date portion in Spanish format: "N de mes de YYYY"
    expect(greenButton!.getAttribute("aria-label")).toMatch(/\d+ de \w+ de \d{4}/);
  });

  it("yellow date has aria-label with slot count ≥0", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const yellowButton = findDayButton(container, "3 cupos disponibles", "cursor-pointer");
    expect(yellowButton).toBeDefined();
    expect(yellowButton!.getAttribute("aria-label")).toMatch(/\d+ de \w+ de \d{4}/);
  });

  it("red date has aria-label with 0 cupos (slot count is integer ≥0)", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    expect(redButton).toBeDefined();
    expect(redButton!.getAttribute("aria-label")).toMatch(/\d+ de \w+ de \d{4}/);
  });

  it("gray date (not offered) has aria-label with slots as integer ≥0", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const grayButton = findDayButton(container, "5 cupos disponibles", "cursor-not-allowed");
    expect(grayButton).toBeDefined();
    expect(grayButton!.getAttribute("aria-label")).toMatch(/\d+ de \w+ de \d{4}/);
  });

  it("slots are always integer ≥0 (negative available is clamped to 0)", () => {
    const instances: TourInstance[] = [
      { date: futureMonthDate(14), available: 10, total: 20, currentPriceCop: 500000, isOffered: true },
      { date: futureMonthDate(15), available: -3, total: 20, currentPriceCop: 500000, isOffered: true },
    ];

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={instances} />
      </Wrapper>,
    );

    // Negative available is clamped to 0; the date has status=red so cursor-not-allowed
    const dateButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    expect(dateButton).toBeDefined();
  });

  it("slots are always integers (fractional available is floored)", () => {
    const instances: TourInstance[] = [
      { date: futureMonthDate(16), available: 7.8, total: 20, currentPriceCop: 500000, isOffered: true },
    ];

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={instances} />
      </Wrapper>,
    );

    const dateButton = findDayButton(container, "7 cupos disponibles");
    expect(dateButton).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Tests — R17.5: Calendar blocks selection on red/gray dates
// ─────────────────────────────────────────────────────────────────────────

describe("AvailabilityCalendar — blocks selection on red/gray (R17.5)", () => {
  it("clicking a green date triggers onDateSelect (selection accepted)", () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} onDateSelect={onDateSelect} />
      </Wrapper>,
    );

    const greenButton = findDayButton(container, "10 cupos disponibles", "cursor-pointer");
    expect(greenButton).toBeDefined();

    fireEvent.click(greenButton!);

    expect(onDateSelect).toHaveBeenCalledTimes(1);
    expect(onDateSelect).toHaveBeenCalledWith(greenDate, expect.objectContaining({ date: greenDate }));
  });

  it("clicking a yellow date triggers onDateSelect (selection accepted)", () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} onDateSelect={onDateSelect} />
      </Wrapper>,
    );

    const yellowButton = findDayButton(container, "3 cupos disponibles", "cursor-pointer");
    expect(yellowButton).toBeDefined();

    fireEvent.click(yellowButton!);

    expect(onDateSelect).toHaveBeenCalledTimes(1);
    expect(onDateSelect).toHaveBeenCalledWith(yellowDate, expect.objectContaining({ date: yellowDate }));
  });

  it("clicking a red date does NOT trigger onDateSelect (selection blocked)", () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} onDateSelect={onDateSelect} />
      </Wrapper>,
    );

    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    expect(redButton).toBeDefined();

    fireEvent.click(redButton!);

    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it("clicking a gray date does NOT trigger onDateSelect (selection blocked)", () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} onDateSelect={onDateSelect} />
      </Wrapper>,
    );

    const grayButton = findDayButton(container, "5 cupos disponibles", "cursor-not-allowed");
    expect(grayButton).toBeDefined();

    fireEvent.click(grayButton!);

    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it("red date button has aria-disabled indicating blocked state", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    expect(redButton).toBeDefined();
    expect(redButton).toHaveAttribute("aria-disabled", "true");
  });

  it("gray date button has aria-disabled indicating blocked state", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const grayButton = findDayButton(container, "5 cupos disponibles", "cursor-not-allowed");
    expect(grayButton).toBeDefined();
    expect(grayButton).toHaveAttribute("aria-disabled", "true");
  });

  it("green/yellow date buttons are NOT aria-disabled", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const greenButton = findDayButton(container, "10 cupos disponibles", "cursor-pointer");
    const yellowButton = findDayButton(container, "3 cupos disponibles", "cursor-pointer");

    expect(greenButton).not.toHaveAttribute("aria-disabled", "true");
    expect(yellowButton).not.toHaveAttribute("aria-disabled", "true");
  });

  it("red/gray dates have cursor-not-allowed class (visual indication of blocking)", () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    const grayButton = findDayButton(container, "5 cupos disponibles", "cursor-not-allowed");

    expect(redButton).toBeDefined();
    expect(grayButton).toBeDefined();
  });

  it("shows blocking indication message when clicking a red date", async () => {
    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} />
      </Wrapper>,
    );

    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");
    expect(redButton).toBeDefined();

    fireEvent.click(redButton!);

    // The alert message should appear indicating the date is blocked (R17.5)
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("selecting green then attempting red preserves green selection", () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Wrapper>
        <AvailabilityCalendar instances={createInstances()} onDateSelect={onDateSelect} />
      </Wrapper>,
    );

    const greenButton = findDayButton(container, "10 cupos disponibles", "cursor-pointer");
    const redButton = findDayButton(container, "0 cupos disponibles", "cursor-not-allowed");

    // Select the green date first
    fireEvent.click(greenButton!);
    expect(onDateSelect).toHaveBeenCalledTimes(1);

    // Attempt to select the red date
    fireEvent.click(redButton!);

    // onDateSelect should still have been called only once (for the green date)
    expect(onDateSelect).toHaveBeenCalledTimes(1);

    // Re-query the green button after re-render to check aria-selected
    const updatedGreen = findDayButton(container, "10 cupos disponibles", "cursor-pointer");
    expect(updatedGreen).toHaveAttribute("aria-selected", "true");
  });
});
