import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { AccessibleDialog } from "./AccessibleDialog";

function DialogHarness({ variant = "dialog" }: { variant?: "dialog" | "drawer" }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)}>Abrir</button>
      <AccessibleDialog
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        ariaLabel="Opciones"
        closeLabel="Cerrar opciones"
        variant={variant}
      >
        <button>Acción</button>
      </AccessibleDialog>
    </>
  );
}

async function openDialog(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

describe("AccessibleDialog", () => {
  it("expone semántica modal y variante canónica", async () => {
    render(<DialogHarness variant="drawer" />);
    await openDialog();
    const dialog = screen.getByRole("dialog", { name: "Opciones" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-dialog-variant", "drawer");
  });
  it("cierra con Escape y devuelve el foco al disparador", async () => {
    render(<DialogHarness />);
    await openDialog();
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Abrir" }));
  });

  it("cierra únicamente al activar el backdrop", async () => {
    render(<DialogHarness />);
    await openDialog();
    const backdrop = document.querySelector<HTMLElement>("[data-overlay-backdrop]");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("bloquea el scroll del documento mientras está abierto", async () => {
    render(<DialogHarness />);
    await openDialog();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar opciones" }));
    expect(document.body.style.overflow).toBe("");
  });
});
