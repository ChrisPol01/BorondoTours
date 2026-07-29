import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusMessage } from "./StatusMessage";

describe("StatusMessage", () => {
  it("anuncia errores de forma asertiva sin depender solo del color", () => {
    render(<StatusMessage tone="error" title="No pudimos cargar">Inténtalo de nuevo.</StatusMessage>);
    const message = screen.getByRole("alert");
    expect(message).toHaveAttribute("aria-live", "assertive");
    expect(message).toHaveAttribute("data-status", "error");
    expect(message).toHaveTextContent("No pudimos cargar");
  });

  it("anuncia éxito de forma cortés y admite una acción segura", () => {
    render(
      <StatusMessage tone="success" action={<button>Continuar</button>}>
        Cambios guardados.
      </StatusMessage>,
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });
});
