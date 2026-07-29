/**
 * Component tests — SearchWidget (Task 11.3)
 *
 * Validates: Requirements 9.4, 9.5, 9.6
 *
 * Tests:
 * - R9.4: Valid form submission triggers navigation with correct query params.
 * - R9.5: Empty destination shows error associated via aria-describedby, preserves values.
 * - R9.5: Past date shows error associated to date field, preserves values.
 * - R9.5: Travelers out of range shows error, preserves values.
 * - R9.6: All fields have accessible labels reachable by keyboard.
 * - Navigation is NOT triggered on invalid submission.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchWidget } from "./SearchWidget";

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/** Returns a future date string (tomorrow) in YYYY-MM-DD format. */
function getFutureDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
}

/** Returns a past date string (yesterday) in YYYY-MM-DD format. */
function getPastDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Setup & teardown
// ─────────────────────────────────────────────────────────────────────────

let originalLocation: Location;

beforeEach(() => {
  // Save original and mock window.location.href assignment
  originalLocation = window.location;
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...originalLocation, href: "" },
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: originalLocation,
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R9.6: All fields have accessible labels
// ─────────────────────────────────────────────────────────────────────────

describe("SearchWidget — accessibility (R9.6)", () => {
  it("destination field has an associated label", () => {
    render(<SearchWidget />);
    // label text from i18n: "Destino"
    const input = screen.getByLabelText("Destino");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("date field has an associated label", () => {
    render(<SearchWidget />);
    // label text from i18n: "Fechas"
    const input = screen.getByLabelText("Fechas");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "date");
  });

  it("travelers field has an associated label", () => {
    render(<SearchWidget />);
    // label text from i18n: "Viajeros"
    const input = screen.getByLabelText("Viajeros");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("all fields are keyboard-reachable (focusable)", () => {
    render(<SearchWidget />);
    const destination = screen.getByLabelText("Destino");
    const date = screen.getByLabelText("Fechas");
    const travelers = screen.getByLabelText("Viajeros");

    // All inputs should be focusable (not disabled)
    expect(destination).not.toBeDisabled();
    expect(date).not.toBeDisabled();
    expect(travelers).not.toBeDisabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R9.4: Valid submission navigates to Discovery with query params
// ─────────────────────────────────────────────────────────────────────────

describe("SearchWidget — valid submission (R9.4)", () => {
  it("navigates to /discovery with destination as q param", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    await user.type(destination, "Eje Cafetero");
    await user.click(submitBtn);

    expect(window.location.href).toContain("/discovery?");
    expect(window.location.href).toContain("q=Eje+Cafetero");
  });

  it("includes date param when a future date is provided", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const dateInput = screen.getByLabelText("Fechas");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    const futureDate = getFutureDate();

    await user.type(destination, "Llanos");
    await user.clear(dateInput);
    // fireEvent is more reliable for date inputs
    await userEvent.type(dateInput, futureDate);
    await user.click(submitBtn);

    expect(window.location.href).toContain("/discovery?");
    expect(window.location.href).toContain("q=Llanos");
    expect(window.location.href).toContain(`date=${futureDate}`);
  });

  it("includes travelers param when value is not 1", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const travelers = screen.getByLabelText("Viajeros") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    await user.type(destination, "Amazonia");
    // Select all text in the number input and replace
    await user.tripleClick(travelers);
    await user.keyboard("5");
    await user.click(submitBtn);

    expect(window.location.href).toContain("/discovery?");
    expect(window.location.href).toContain("q=Amazonia");
    expect(window.location.href).toContain("travelers=5");
  });

  it("does NOT include travelers param when value is 1 (default)", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    await user.type(destination, "Costa Caribe");
    await user.click(submitBtn);

    expect(window.location.href).toContain("/discovery?");
    expect(window.location.href).not.toContain("travelers=");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// R9.5: Invalid submission — errors and value preservation
// ─────────────────────────────────────────────────────────────────────────

describe("SearchWidget — invalid submission (R9.5)", () => {
  it("shows error for empty destination with aria-describedby", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });
    await user.click(submitBtn);

    // Error message should be visible
    const errorMsg = screen.getByText("Escribe un destino para continuar.");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveAttribute("id", "search-destination-error");
    expect(errorMsg).toHaveAttribute("role", "alert");

    // Destination input should reference the error via aria-describedby
    const destination = screen.getByLabelText("Destino");
    expect(destination).toHaveAttribute(
      "aria-describedby",
      "search-destination-error",
    );
    expect(destination).toHaveAttribute("aria-invalid", "true");
  });

  it("shows error for past date with aria-describedby and preserves values", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const dateInput = screen.getByLabelText("Fechas");
    const travelers = screen.getByLabelText("Viajeros");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    const pastDate = getPastDate();

    await user.type(destination, "Andes");
    await userEvent.type(dateInput, pastDate);
    // Replace travelers value: select all then type new value
    await user.tripleClick(travelers);
    await user.keyboard("3");
    await user.click(submitBtn);

    // Date error should show
    const errorMsg = screen.getByText("Elige una fecha que no sea pasada.");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveAttribute("id", "search-date-error");
    expect(errorMsg).toHaveAttribute("role", "alert");

    // Date input should reference the error via aria-describedby
    expect(dateInput).toHaveAttribute("aria-describedby", "search-date-error");
    expect(dateInput).toHaveAttribute("aria-invalid", "true");

    // Values are preserved (R9.5)
    expect(destination).toHaveValue("Andes");
    expect(travelers).toHaveValue(3);
  });

  it("shows error for travelers = 0 with aria-describedby and preserves values", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const travelers = screen.getByLabelText("Viajeros");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    await user.type(destination, "Bogotá");
    // Replace travelers: select all then type 0
    await user.tripleClick(travelers);
    await user.keyboard("0");
    await user.click(submitBtn);

    // Travelers error should show
    const errorMsg = screen.getByText("Indica entre 1 y 99 viajeros.");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveAttribute("id", "search-travelers-error");
    expect(errorMsg).toHaveAttribute("role", "alert");

    // Travelers input should reference the error via aria-describedby
    expect(travelers).toHaveAttribute(
      "aria-describedby",
      "search-travelers-error",
    );
    expect(travelers).toHaveAttribute("aria-invalid", "true");

    // Values are preserved (R9.5)
    expect(destination).toHaveValue("Bogotá");
    expect(travelers).toHaveValue(0);
  });

  it("shows error for travelers = 100 (out of range)", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const travelers = screen.getByLabelText("Viajeros");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    await user.type(destination, "Costa Pacífico");
    // Replace travelers: select all then type 100
    await user.tripleClick(travelers);
    await user.keyboard("100");
    await user.click(submitBtn);

    // Travelers error should show
    const errorMsg = screen.getByText("Indica entre 1 y 99 viajeros.");
    expect(errorMsg).toBeInTheDocument();

    // Destination is preserved
    expect(destination).toHaveValue("Costa Pacífico");
  });

  it("does NOT navigate on invalid submission", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    // Submit with empty destination (invalid)
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });
    await user.click(submitBtn);

    // window.location.href should remain unchanged
    expect(window.location.href).toBe("");
  });

  it("clears errors on subsequent valid submission", async () => {
    const user = userEvent.setup();
    render(<SearchWidget />);

    const destination = screen.getByLabelText("Destino");
    const submitBtn = screen.getByRole("button", { name: "Buscar aventura" });

    // First submit with empty destination → error
    await user.click(submitBtn);
    expect(
      screen.getByText("Escribe un destino para continuar."),
    ).toBeInTheDocument();

    // Fix the field and submit again
    await user.type(destination, "Eje Cafetero");
    await user.click(submitBtn);

    // Error should be gone
    expect(
      screen.queryByText("Escribe un destino para continuar."),
    ).not.toBeInTheDocument();

    // Navigation happened
    expect(window.location.href).toContain("/discovery?");
  });
});
