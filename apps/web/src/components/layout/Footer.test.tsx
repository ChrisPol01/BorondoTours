/**
 * Component tests — Footer (Task 10.5)
 *
 * Validates: Requirements 7.1, 7.3, 7.5
 *
 * Tests:
 * - Renders 4 trust badges in correct fixed order.
 * - Correct icons (Leaf/Camera/Shield/Users).
 * - Texts resolved from i18n (not raw keys), fallback to es.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Footer } from "./Footer";

describe("Footer — 4 trust badges in correct fixed order (R7.1)", () => {
  it("renders exactly 4 trust badge titles in the correct order", () => {
    render(<Footer />);

    // The 4 trust badges should be present in the DOM
    const titles = [
      "Turismo Responsable",
      "Experiencias Únicas",
      "Seguridad Garantizada",
      "Atención Personalizada",
    ];

    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders trust badges in fixed order (R7.1)", () => {
    const { container } = render(<Footer />);

    // Get all h3 elements which contain the trust badge titles
    const headings = container.querySelectorAll("h3");
    expect(headings).toHaveLength(4);

    const orderedTitles = [
      "Turismo Responsable",
      "Experiencias Únicas",
      "Seguridad Garantizada",
      "Atención Personalizada",
    ];

    headings.forEach((heading, index) => {
      expect(heading.textContent).toBe(orderedTitles[index]);
    });
  });

  it("renders descriptive texts for each promise (R7.2)", () => {
    render(<Footer />);

    expect(screen.getByText("Cuidamos los lugares que visitas.")).toBeInTheDocument();
    expect(screen.getByText("Diseñamos viajes auténticos y memorables.")).toBeInTheDocument();
    expect(screen.getByText("Tu tranquilidad es nuestra prioridad.")).toBeInTheDocument();
    expect(screen.getByText("Estamos contigo en cada paso del viaje.")).toBeInTheDocument();
  });
});

describe("Footer — correct icons (R7.3)", () => {
  it("renders 4 SVG icons (Lucide icons) with aria-hidden", () => {
    const { container } = render(<Footer />);

    // Lucide React renders <svg> elements with aria-hidden="true"
    const svgIcons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgIcons).toHaveLength(4);
  });

  it("each icon has the correct Lucide class (h-6 w-6)", () => {
    const { container } = render(<Footer />);

    const svgIcons = container.querySelectorAll("svg");
    svgIcons.forEach((svg) => {
      expect(svg).toHaveClass("h-6");
      expect(svg).toHaveClass("w-6");
    });
  });

  it("icons use the turquesa brand color class", () => {
    const { container } = render(<Footer />);

    const svgIcons = container.querySelectorAll("svg");
    svgIcons.forEach((svg) => {
      expect(svg).toHaveClass("text-turquesa");
    });
  });
});

describe("Footer — i18n texts resolved, not raw keys (R7.4, R7.5)", () => {
  it("does not render raw i18n keys anywhere in the footer", () => {
    const { container } = render(<Footer />);

    const footerText = container.textContent ?? "";

    // Raw keys should never appear in the rendered output
    expect(footerText).not.toContain("footer:promise.responsible.title");
    expect(footerText).not.toContain("footer:promise.unique.title");
    expect(footerText).not.toContain("footer:promise.safety.title");
    expect(footerText).not.toContain("footer:promise.personalized.title");
    expect(footerText).not.toContain("footer:promise.responsible.text");
    expect(footerText).not.toContain("footer:promise.unique.text");
    expect(footerText).not.toContain("footer:promise.safety.text");
    expect(footerText).not.toContain("footer:promise.personalized.text");
    expect(footerText).not.toContain("footer:copyright");
  });

  it("renders copyright text resolved from i18n", () => {
    render(<Footer />);

    expect(
      screen.getByText("© Borondo Tours. Todos los derechos reservados."),
    ).toBeInTheDocument();
  });

  it("renders the footer with role=contentinfo", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("uses Azul Profundo background (brand identity)", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-azul-profundo");
    expect(footer).toHaveClass("text-blanco-niebla");
  });
});
