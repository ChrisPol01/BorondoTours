/**
 * Component tests — SafeHtml (Task 8.9)
 *
 * Validates: Requirements 16.3, 20.7
 *
 * Tests:
 * - Renders allowlisted HTML correctly (p, strong, em, a, ul, li, etc.).
 * - Renders fallback text when content is not sanitizable (empty input or script-only).
 * - Never renders original unsanitized content.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SafeHtml } from "./SafeHtml";
import { LanguageProvider } from "../../lib/i18n/provider";

/**
 * Wrapper that provides LanguageProvider with the es catalog for fallback resolution.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="common">
      {children}
    </LanguageProvider>
  );
}

describe("SafeHtml — renders allowlisted HTML (R16.7)", () => {
  it("renders <p> and <strong> tags correctly", () => {
    const html = "<p>Texto <strong>importante</strong> aquí.</p>";

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output).toBeInTheDocument();
    expect(output!.innerHTML).toContain("<p>");
    expect(output!.innerHTML).toContain("<strong>");
    expect(output!.textContent).toContain("Texto importante aquí.");
  });

  it("renders <em>, <ul>, <li> and <a href> tags", () => {
    const html =
      '<ul><li><em>Item 1</em></li><li><a href="/link">Enlace</a></li></ul>';

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).toContain("<ul>");
    expect(output!.innerHTML).toContain("<li>");
    expect(output!.innerHTML).toContain("<em>");
    expect(output!.innerHTML).toContain('<a href="/link">');
  });

  it("renders <h2>, <h3>, <br> and <ol> tags", () => {
    const html = "<h2>Título</h2><h3>Sub</h3><ol><li>Uno</li></ol><br>";

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).toContain("<h2>");
    expect(output!.innerHTML).toContain("<h3>");
    expect(output!.innerHTML).toContain("<ol>");
    expect(output!.innerHTML).toContain("<br>");
  });
});

describe("SafeHtml — fallback when content is not sanitizable (R16.3, R20.7)", () => {
  it("returns null when html is empty and no fallbackKey", () => {
    const { container } = render(
      <Wrapper>
        <SafeHtml html="" />
      </Wrapper>,
    );

    // SafeHtml returns null → nothing rendered
    expect(container.innerHTML).toBe("");
  });

  it("renders fallback text when html is empty and fallbackKey provided (R16.3)", () => {
    render(
      <Wrapper>
        <SafeHtml html="" fallbackKey="common:content.unavailable" />
      </Wrapper>,
    );

    // The es catalog has "Contenido no disponible" for common:content.unavailable
    expect(screen.getByText("Contenido no disponible")).toBeInTheDocument();
  });

  it("renders fallback when html contains only script (stripped to empty) (R20.7)", () => {
    const html = "<script>alert('xss')</script>";

    render(
      <Wrapper>
        <SafeHtml html={html} fallbackKey="common:content.unavailable" />
      </Wrapper>,
    );

    expect(screen.getByText("Contenido no disponible")).toBeInTheDocument();
  });

  it("renders fallback when html contains only an iframe", () => {
    const html = '<iframe src="https://evil.com"></iframe>';

    render(
      <Wrapper>
        <SafeHtml html={html} fallbackKey="common:content.unavailable" />
      </Wrapper>,
    );

    expect(screen.getByText("Contenido no disponible")).toBeInTheDocument();
  });
});

describe("SafeHtml — never renders original unsanitized content (R20.5, R20.7)", () => {
  it("strips script tags and does not execute them", () => {
    const html = '<p>Safe text</p><script>document.title="hacked"</script>';

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).not.toContain("<script>");
    expect(output!.innerHTML).not.toContain("hacked");
    expect(output!.textContent).toContain("Safe text");
  });

  it("strips on* event handler attributes", () => {
    const html = '<p onmouseover="alert(1)">Hover me</p>';

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).not.toContain("onmouseover");
    expect(output!.textContent).toContain("Hover me");
  });

  it("strips form and input elements", () => {
    // form is in FORBID_CONTENTS so its children text is also removed,
    // but <p> outside form should survive
    const html =
      '<p>Safe paragraph</p><form action="/steal"><input type="text" name="card" /></form>';

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output).toBeInTheDocument();
    expect(output!.innerHTML).not.toContain("<form");
    expect(output!.innerHTML).not.toContain("<input");
    expect(output!.textContent).toContain("Safe paragraph");
  });

  it("strips style tags", () => {
    const html = "<style>body{display:none}</style><p>Content</p>";

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).not.toContain("<style>");
    expect(output!.textContent).toContain("Content");
  });

  it("preserves only href on <a>, strips it from other elements", () => {
    const html = '<a href="/safe">Link</a><p href="/evil">Para</p>';

    const { container } = render(
      <Wrapper>
        <SafeHtml html={html} />
      </Wrapper>,
    );

    const output = container.querySelector("div");
    expect(output!.innerHTML).toContain('<a href="/safe">');
    // <p> should NOT have href
    const paragraph = output!.querySelector("p");
    expect(paragraph).not.toHaveAttribute("href");
  });
});
