import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type JSX } from "react";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "./Badge";
import { Checkbox } from "./Checkbox";
import { Chip } from "./Chip";
import { Input } from "./Input";
import { RadioGroup } from "./RadioGroup";
import { Tabs } from "./Tabs";

describe("Input", () => {
  it("asocia la etiqueta y la ayuda", () => {
    render(<Input label="Correo electrónico" hint="Te enviaremos la confirmación" />);
    const input = screen.getByLabelText("Correo electrónico");
    expect(input).toHaveAccessibleDescription("Te enviaremos la confirmación");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("en error marca aria-invalid y anuncia el mensaje", () => {
    render(<Input label="Correo" error="Revisa el formato del correo" />);
    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Revisa el formato del correo");
    expect(screen.getByRole("alert")).toHaveTextContent("Revisa el formato del correo");
  });
});

describe("Checkbox", () => {
  it("se marca con la etiqueta", () => {
    render(<Checkbox label="Acepto la política de datos" />);
    const box = screen.getByRole("checkbox", { name: "Acepto la política de datos" });
    fireEvent.click(screen.getByText("Acepto la política de datos"));
    expect(box).toBeChecked();
  });

  it("aplica el estado indeterminado en el DOM", () => {
    render(<Checkbox label="Todos" indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe("RadioGroup", () => {
  it("expone el grupo con su leyenda y cambia de valor", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Residencia fiscal"
        value="co"
        onChange={onChange}
        options={[
          { value: "co", label: "Residente en Colombia" },
          { value: "ext", label: "Extranjero" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Residencia fiscal" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Residente en Colombia" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Extranjero" }));
    expect(onChange).toHaveBeenCalledWith("ext");
  });
});

describe("Chip", () => {
  it("como toggle usa aria-pressed", () => {
    render(<Chip selected>Naturaleza</Chip>);
    expect(screen.getByRole("button", { name: "Naturaleza" })).toHaveAttribute("aria-pressed", "true");
  });

  it("como enlace no usa aria-pressed", () => {
    render(<Chip href="/explorar?category=AVENTURA">Aventura</Chip>);
    const link = screen.getByRole("link", { name: "Aventura" });
    expect(link).not.toHaveAttribute("aria-pressed");
  });
});

describe("Tabs", () => {
  function Harness(): JSX.Element {
    const [value, setValue] = useState<"a" | "b" | "c">("a");
    return (
      <Tabs
        label="Mis reservas"
        value={value}
        onChange={setValue}
        items={[
          { value: "a", label: "Próximas", count: 2 },
          { value: "b", label: "Por pagar" },
          { value: "c", label: "Completadas" },
        ]}
      >
        <p>Panel {value}</p>
      </Tabs>
    );
  }

  it("marca la pestaña activa y enlaza el panel", () => {
    render(<Harness />);
    const active = screen.getByRole("tab", { name: /Próximas/ });
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(active).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(/Próximas/);
  });

  it("las flechas mueven el foco y activan la pestaña", () => {
    render(<Harness />);
    const list = screen.getByRole("tablist", { name: "Mis reservas" });
    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Por pagar" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Por pagar" })).toHaveFocus();
    fireEvent.keyDown(list, { key: "End" });
    expect(screen.getByRole("tab", { name: "Completadas" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Próximas/ })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Badge", () => {
  it("siempre muestra texto además del color", () => {
    render(
      <Badge tone="success" dot>
        Disponible
      </Badge>,
    );
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });
});
