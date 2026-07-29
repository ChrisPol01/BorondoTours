import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import fc from "fast-check";

import { Skeleton, toCssSize } from "./Skeleton";

// El placeholder de carga vive en el DOM como decorativo por defecto: para
// consultarlo desde los tests usamos el contenedor de render directamente.
describe("Skeleton", () => {
  it("renderiza un elemento decorativo (aria-hidden) por defecto", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("role");
  });

  it("aplica la animación de pulso y la desactiva bajo prefers-reduced-motion", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    // Pulso animado en lugar de spinner (R21.2).
    expect(el).toHaveClass("animate-pulse");
    // Respeta prefers-reduced-motion desactivando la animación.
    expect(el).toHaveClass("motion-reduce:animate-none");
  });

  it("usa el color de marca (arena) referenciado por token", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("bg-arena");
  });

  it("aplica width/height numéricos como píxeles", () => {
    const { container } = render(<Skeleton width={120} height={16} />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("16px");
  });

  it("respeta width/height como cadenas CSS arbitrarias", () => {
    const { container } = render(<Skeleton width="100%" height="12rem" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.width).toBe("100%");
    expect(el.style.height).toBe("12rem");
  });

  it("no fija dimensiones inline cuando no se pasan width/height", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.width).toBe("");
    expect(el.style.height).toBe("");
  });

  it("reserva una relación de aspecto para reproducir la geometría final", () => {
    const { container } = render(<Skeleton aspectRatio="16 / 9" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.aspectRatio).toBe("16 / 9");
  });

  it("aplica la clase de radio según la prop `rounded`", () => {
    const { container } = render(<Skeleton rounded="full" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("rounded-full");
  });

  it("usa `rounded-md` por defecto", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("rounded-md");
  });

  it("añade clases extra vía `className` sin perder las base", () => {
    const { container } = render(<Skeleton className="my-2 w-full" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("my-2");
    expect(el).toHaveClass("w-full");
    expect(el).toHaveClass("bg-arena");
  });

  it("anuncia la carga con role=status y aria-label cuando se pasa `label`", () => {
    const { container } = render(<Skeleton label="Cargando destinos" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveAttribute("role", "status");
    expect(el).toHaveAttribute("aria-label", "Cargando destinos");
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("renderiza un único nodo por defecto (count = 1)", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("renderiza `count` placeholders para componer grillas de carga", () => {
    // 12 skeletons de TourCard en el catálogo (R11.5 / R21.2).
    const { container } = render(<Skeleton count={12} />);
    const items = container.querySelectorAll("span");

    expect(items).toHaveLength(12);
    items.forEach((item) => {
      expect(item).toHaveClass("bg-arena");
      expect(item).toHaveClass("animate-pulse");
      expect(item).toHaveClass("motion-reduce:animate-none");
    });
  });

  it("con `count > 1` solo el primer placeholder conserva la etiqueta accesible", () => {
    const { container } = render(<Skeleton count={3} label="Cargando" />);
    const items = container.querySelectorAll("span");

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("role", "status");
    expect(items[0]).toHaveAttribute("aria-label", "Cargando");
    // Los demás son decorativos para no repetir el anuncio.
    expect(items[1]).toHaveAttribute("aria-hidden", "true");
    expect(items[2]).toHaveAttribute("aria-hidden", "true");
  });

  it("no renderiza nada cuando `count` es menor que 1", () => {
    const { container } = render(<Skeleton count={0} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });
});

describe("toCssSize", () => {
  it("convierte números a píxeles y deja cadenas intactas", () => {
    expect(toCssSize(0)).toBe("0px");
    expect(toCssSize(240)).toBe("240px");
    expect(toCssSize("50%")).toBe("50%");
    expect(toCssSize("2rem")).toBe("2rem");
  });

  // Propiedad: todo número finito produce el sufijo `px`; toda cadena se
  // devuelve sin modificar (idempotencia sobre cadenas).
  it("propiedad: número → `${n}px`, cadena → sin cambios", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.double({ noNaN: true, noDefaultInfinity: true })),
        (n) => {
          expect(toCssSize(n)).toBe(`${n}px`);
        },
      ),
    );
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(toCssSize(s)).toBe(s);
      }),
    );
  });
});
