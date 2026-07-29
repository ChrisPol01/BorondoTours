/**
 * Component tests — Button (Task 8.2)
 *
 * Validates: Requirements 3.2, 3.6, 3.7, 3.8, 3.9
 *
 * Tests:
 * - Variants/states (primary, cta, secondary) render correct classes.
 * - Disabled onClick blocking (R3.7).
 * - i18n label render via LanguageProvider (R3.8).
 * - Fallback to key literal when key is missing from catalog (R3.9).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";
import { LanguageProvider } from "../../lib/i18n/provider";

/**
 * Wrapper that provides LanguageProvider with the es catalog for i18n resolution.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="home">
      {children}
    </LanguageProvider>
  );
}

describe("Button — variants and states", () => {
  it("renders primary variant with turquesa bg and hover:bg-verde classes", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-action-primary");
    expect(button).toHaveClass("hover:bg-action-primary-hover");
    expect(button).toHaveClass("text-on-action");
  });

  it("renders cta variant with dorado bg and negro-volcanico text", () => {
    render(
      <Wrapper>
        <Button variant="cta" labelKey="home:cta.primary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-action-cta");
    expect(button).toHaveClass("text-text-primary");
  });

  it("renders secondary variant with transparent bg and border", () => {
    render(
      <Wrapper>
        <Button variant="secondary" labelKey="home:cta.secondary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("border-focus");
    expect(button).toHaveClass("text-text-primary");
  });

  it("applies the tokenized brand transition for hover state (R3.2)", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-colors");
    expect(button).toHaveClass("duration-brand");
  });

  it("applies focus-visible ring for keyboard focus (R3.5)", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus-visible:ring-2");
    expect(button).toHaveClass("focus-visible:ring-azul-profundo");
  });
});

describe("Button — disabled state (R3.6, R3.7)", () => {
  it("shows aria-disabled=true and opacity-50 when disabled", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" disabled />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("blocks onClick when disabled (R3.7)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" disabled onClick={onClick} />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when not disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" onClick={onClick} />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Button — i18n label (R3.8, R3.9)", () => {
  it("renders translated label from the es catalog (R3.8)", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:cta.primary" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    // "Explorar destinos" is the es translation of home:cta.primary
    expect(button).toHaveTextContent("Explorar destinos");
  });

  it("renders another known key correctly", () => {
    render(
      <Wrapper>
        <Button variant="cta" labelKey="nav:planTrip" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Planifica tu viaje");
  });

  it("falls back to key literal when key does not exist in catalog (R3.9)", () => {
    render(
      <Wrapper>
        <Button variant="primary" labelKey="home:nonexistent.key" />
      </Wrapper>,
    );

    const button = screen.getByRole("button");
    // Must display the key literal, never an empty string
    expect(button).toHaveTextContent("home:nonexistent.key");
    expect(button.textContent).not.toBe("");
  });
});
