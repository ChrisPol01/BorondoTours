/**
 * Tests para `useFocusTrap` y `getFocusableElements`.
 *
 * Valida:
 * - R22.6: Tab/Shift+Tab cicla foco dentro del contenedor.
 * - R22.7: Escape invoca onClose.
 * - R22.8: Al desactivar, retorna foco al trigger.
 * - Utilidad `getFocusableElements` retorna elementos visibles y enfocables.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef, useState } from "react";
import { useFocusTrap, getFocusableElements } from "./useFocusTrap";

// ─────────────────────────────────────────────────────────────────────────────
// Test helper component
// ─────────────────────────────────────────────────────────────────────────────

interface TestHarnessProps {
  initialActive?: boolean;
  onClose?: () => void;
}

function TestHarness({ initialActive = true, onClose = vi.fn() }: TestHarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(initialActive);

  useFocusTrap({
    containerRef,
    triggerRef,
    isActive,
    onClose: () => {
      setIsActive(false);
      onClose();
    },
  });

  return (
    <div>
      <button ref={triggerRef} data-testid="trigger">
        Open
      </button>
      {isActive && (
        <div ref={containerRef} data-testid="container">
          <button data-testid="first">First</button>
          <input data-testid="middle" type="text" />
          <button data-testid="last">Last</button>
        </div>
      )}
    </div>
  );
}

function EmptyContainerHarness() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onClose = vi.fn();

  useFocusTrap({
    containerRef,
    triggerRef,
    isActive: true,
    onClose,
  });

  return (
    <div>
      <button ref={triggerRef} data-testid="trigger">
        Open
      </button>
      <div ref={containerRef} data-testid="container">
        <span>No focusable elements here</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests: getFocusableElements
// ─────────────────────────────────────────────────────────────────────────────

describe("getFocusableElements", () => {
  it("returns visible, focusable elements within a container", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button>OK</button>
      <a href="/link">Link</a>
      <input type="text" />
      <select><option>A</option></select>
      <textarea></textarea>
      <div tabindex="0">Custom</div>
      <div contenteditable="true">Editable</div>
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(7);

    document.body.removeChild(container);
  });

  it("excludes disabled elements", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button disabled>Disabled</button>
      <input type="text" disabled />
      <button>Enabled</button>
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0].textContent).toBe("Enabled");

    document.body.removeChild(container);
  });

  it("excludes elements with tabindex=-1", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button tabindex="-1">Hidden from tab</button>
      <button>Visible</button>
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0].textContent).toBe("Visible");

    document.body.removeChild(container);
  });

  it("excludes elements with aria-hidden=true", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button aria-hidden="true">Hidden</button>
      <button>Visible</button>
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);
    expect(focusable[0].textContent).toBe("Visible");

    document.body.removeChild(container);
  });

  it("excludes hidden input type", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <input type="hidden" />
      <input type="text" />
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(1);

    document.body.removeChild(container);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: useFocusTrap
// ─────────────────────────────────────────────────────────────────────────────

describe("useFocusTrap", () => {
  beforeEach(() => {
    // Asegurar que no queden listeners colgados.
    vi.restoreAllMocks();
  });

  it("focuses the first focusable element when activated (R22.6)", async () => {
    render(<TestHarness initialActive={true} />);

    // requestAnimationFrame es usado internamente; necesitamos forzarlo.
    await act(async () => {
      // jsdom no ejecuta rAF automáticamente, pero vitest + fake timers o
      // un tick debería forzar el callback.
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const first = screen.getByTestId("first");
    expect(document.activeElement).toBe(first);
  });

  it("calls onClose when Escape is pressed (R22.7)", async () => {
    const onClose = vi.fn();
    render(<TestHarness initialActive={true} onClose={onClose} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps Tab at the last element cycling to first (R22.6)", async () => {
    render(<TestHarness initialActive={true} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const last = screen.getByTestId("last");
    const first = screen.getByTestId("first");

    // Foco en el último elemento
    act(() => {
      last.focus();
    });
    expect(document.activeElement).toBe(last);

    // Tab en el último → debe ir al primero
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
      );
    });

    expect(document.activeElement).toBe(first);
  });

  it("traps Shift+Tab at the first element cycling to last (R22.6)", async () => {
    render(<TestHarness initialActive={true} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const first = screen.getByTestId("first");
    const last = screen.getByTestId("last");

    // El foco debería estar en first tras activarse
    expect(document.activeElement).toBe(first);

    // Shift+Tab en el primer elemento → debe ir al último
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
        })
      );
    });

    expect(document.activeElement).toBe(last);
  });

  it("returns focus to trigger when deactivated (R22.8)", async () => {
    const onClose = vi.fn();
    render(<TestHarness initialActive={true} onClose={onClose} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // Presionar Escape desactiva → debe retornar foco al trigger
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const trigger = screen.getByTestId("trigger");
    expect(document.activeElement).toBe(trigger);
  });

  it("handles containers with no focusable elements gracefully", async () => {
    render(<EmptyContainerHarness />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // No debería lanzar error; el contenedor recibe foco como fallback
    const container = screen.getByTestId("container");
    expect(document.activeElement).toBe(container);
  });

  it("does not trap keys when not active", async () => {
    const onClose = vi.fn();
    render(<TestHarness initialActive={false} onClose={onClose} />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
