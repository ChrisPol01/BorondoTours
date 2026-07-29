/**
 * Component tests — TourDescription (Task 15.4)
 *
 * Validates: Requirements 16.1, 16.2, 16.3, 16.4
 *
 * Tests:
 * - Renders long description via SafeHtml (R16.1).
 * - Omits description block when empty/absent (R16.2).
 * - Shows "contenido no disponible" fallback when SafeHtml cannot process (R16.3).
 * - Only renders "¿Qué incluye?", "¿Qué NO incluye?", "¿Qué llevar?" when they have data (R16.4).
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TourDescription } from "./TourDescription";
import { LanguageProvider } from "../../lib/i18n/provider";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="detail">
      {children}
    </LanguageProvider>
  );
}

describe("TourDescription — descripción larga (R16.1, R16.2, R16.3)", () => {
  it("renders the sanitized HTML content via SafeHtml (R16.1)", () => {
    const html = "<p>Una experiencia <strong>increíble</strong> en los Andes.</p>";

    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={html}
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.textContent).toContain("Una experiencia increíble en los Andes.");
    expect(container.querySelector("strong")).toBeInTheDocument();
  });

  it("omits the description block when html is empty string (R16.2)", () => {
    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml=""
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("omits the description block when html is null (R16.2)", () => {
    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={null}
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("omits the description block when html is undefined (R16.2)", () => {
    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={undefined}
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("omits the description block when html is only whitespace (R16.2)", () => {
    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml="   "
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("shows 'contenido no disponible' when SafeHtml cannot process content (R16.3)", () => {
    // Script-only content will be stripped to empty by sanitization
    const html = "<script>alert('xss')</script>";

    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={html}
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Contenido no disponible")).toBeInTheDocument();
  });

  it("does not expose raw HTML when SafeHtml cannot process (R16.3)", () => {
    const html = "<script>alert('xss')</script>";

    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={html}
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(container.innerHTML).not.toContain("<script>");
    expect(container.innerHTML).not.toContain("alert");
  });
});

describe("TourDescription — secciones informativas (R16.4)", () => {
  it("renders '¿Qué incluye?' only when includes has data", () => {
    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={null}
          includes={["Transporte", "Guía bilingüe"]}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(screen.getByText("¿Qué incluye?")).toBeInTheDocument();
    expect(screen.getByText("Transporte")).toBeInTheDocument();
    expect(screen.getByText("Guía bilingüe")).toBeInTheDocument();
  });

  it("renders '¿Qué NO incluye?' only when notIncludes has data", () => {
    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={null}
          includes={null}
          notIncludes={["Alimentación", "Seguro de viaje"]}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(screen.getByText("¿Qué NO incluye?")).toBeInTheDocument();
    expect(screen.getByText("Alimentación")).toBeInTheDocument();
    expect(screen.getByText("Seguro de viaje")).toBeInTheDocument();
  });

  it("renders '¿Qué llevar?' only when whatToBring has data", () => {
    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml={null}
          includes={null}
          notIncludes={null}
          whatToBring={["Protector solar", "Botella de agua"]}
        />
      </Wrapper>,
    );

    expect(screen.getByText("¿Qué llevar?")).toBeInTheDocument();
    expect(screen.getByText("Protector solar")).toBeInTheDocument();
    expect(screen.getByText("Botella de agua")).toBeInTheDocument();
  });

  it("omits sections with empty arrays", () => {
    const { container } = render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml="<p>Descripción</p>"
          includes={[]}
          notIncludes={[]}
          whatToBring={[]}
        />
      </Wrapper>,
    );

    expect(screen.queryByText("¿Qué incluye?")).not.toBeInTheDocument();
    expect(screen.queryByText("¿Qué NO incluye?")).not.toBeInTheDocument();
    expect(screen.queryByText("¿Qué llevar?")).not.toBeInTheDocument();
    // But description still renders
    expect(container.textContent).toContain("Descripción");
  });

  it("omits sections with null values", () => {
    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml="<p>Hello</p>"
          includes={null}
          notIncludes={null}
          whatToBring={null}
        />
      </Wrapper>,
    );

    expect(screen.queryByText("¿Qué incluye?")).not.toBeInTheDocument();
    expect(screen.queryByText("¿Qué NO incluye?")).not.toBeInTheDocument();
    expect(screen.queryByText("¿Qué llevar?")).not.toBeInTheDocument();
  });

  it("renders all sections together when all have data", () => {
    render(
      <Wrapper>
        <TourDescription
          longDescriptionHtml="<p>Tour completo</p>"
          includes={["Hotel"]}
          notIncludes={["Propinas"]}
          whatToBring={["Cámara"]}
        />
      </Wrapper>,
    );

    expect(screen.getByText("¿Qué incluye?")).toBeInTheDocument();
    expect(screen.getByText("¿Qué NO incluye?")).toBeInTheDocument();
    expect(screen.getByText("¿Qué llevar?")).toBeInTheDocument();
    expect(screen.getByText("Hotel")).toBeInTheDocument();
    expect(screen.getByText("Propinas")).toBeInTheDocument();
    expect(screen.getByText("Cámara")).toBeInTheDocument();
  });
});
