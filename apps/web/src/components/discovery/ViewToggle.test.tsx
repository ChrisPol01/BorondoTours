/**
 * Component tests — ViewToggle (Task 13.5)
 *
 * Validates: Requirements 14.1, 14.5
 *
 * Tests:
 * - Default "list" view shows active indicator
 * - Toggle to "map" updates aria-pressed
 * - Callback fires with correct view preserving filters (R14.5)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ViewToggle } from "./ViewToggle";
import { LanguageProvider } from "../../lib/i18n/provider";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="discovery">
      {children}
    </LanguageProvider>
  );
}

describe("ViewToggle — active state (R14.1)", () => {
  it("renders Lista button with aria-pressed=true when activeView is list", () => {
    render(
      <Wrapper>
        <ViewToggle activeView="list" onViewChange={vi.fn()} />
      </Wrapper>,
    );

    const listaBtn = screen.getByRole("button", { name: "Lista" });
    const mapaBtn = screen.getByRole("button", { name: "Mapa" });

    expect(listaBtn).toHaveAttribute("aria-pressed", "true");
    expect(mapaBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders Mapa button with aria-pressed=true when activeView is map", () => {
    render(
      <Wrapper>
        <ViewToggle activeView="map" onViewChange={vi.fn()} />
      </Wrapper>,
    );

    const listaBtn = screen.getByRole("button", { name: "Lista" });
    const mapaBtn = screen.getByRole("button", { name: "Mapa" });

    expect(listaBtn).toHaveAttribute("aria-pressed", "false");
    expect(mapaBtn).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ViewToggle — interaction (R14.5)", () => {
  it("calls onViewChange('map') when Mapa button is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(
      <Wrapper>
        <ViewToggle activeView="list" onViewChange={onViewChange} />
      </Wrapper>,
    );

    const mapaBtn = screen.getByRole("button", { name: "Mapa" });
    await user.click(mapaBtn);

    expect(onViewChange).toHaveBeenCalledWith("map");
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it("calls onViewChange('list') when Lista button is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(
      <Wrapper>
        <ViewToggle activeView="map" onViewChange={onViewChange} />
      </Wrapper>,
    );

    const listaBtn = screen.getByRole("button", { name: "Lista" });
    await user.click(listaBtn);

    expect(onViewChange).toHaveBeenCalledWith("list");
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });

  it("has accessible group role with label", () => {
    render(
      <Wrapper>
        <ViewToggle activeView="list" onViewChange={vi.fn()} />
      </Wrapper>,
    );

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-label", "Lista / Mapa");
  });
});
