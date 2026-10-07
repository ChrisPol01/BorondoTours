import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("usa primary/md por defecto con los tokens de marca", () => {
    render(<Button>Reservar</Button>);
    const button = screen.getByRole("button", { name: "Reservar" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-action-primary", "text-on-action", "hover:bg-action-primary-hover", "h-10", "rounded-pill");
  });

  it.each([
    ["cta", "bg-action-cta"],
    ["secondary", "glass-surface"],
    ["ghost", "bg-transparent"],
    ["danger", "bg-sold-out"],
  ] as const)("variante %s", (variant, cls) => {
    render(<Button variant={variant}>Acción</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("tamaño %s", (size, cls) => {
    render(<Button size={size}>Acción</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it("deshabilitado: aria-disabled, opacidad y no ejecuta la acción", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Pagar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Pagar" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveClass("opacity-50");
    expect(button).not.toHaveClass("hover:bg-action-primary-hover");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("cargando: aria-busy, spinner y etiqueta de carga; bloquea la acción", () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Cargando…" onClick={onClick}>
        Pagar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Cargando…" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg.animate-spin")).not.toBeNull();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("con href renderiza un enlace", () => {
    render(<Button href="/explorar">Explorar</Button>);
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar");
  });

  it("enlace deshabilitado no tiene href", () => {
    render(
      <Button href="/pagar" disabled>
        Pagar
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Pagar" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("el icono es decorativo y respeta la posición", () => {
    render(
      <Button icon={<svg data-testid="icon" />} iconPosition="end">
        Buscar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Buscar" });
    const wrapper = screen.getByTestId("icon").parentElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(button.lastElementChild).toBe(wrapper);
  });
});
