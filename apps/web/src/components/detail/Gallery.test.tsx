/**
 * Component tests — Gallery (Task 15.2)
 *
 * Validates: Requirements 15.1, 15.8, 15.9, 15.10
 *
 * Tests:
 * - Renders placeholder when no photos (R15.9).
 * - Renders slider with main image and controls for multiple photos (R15.1).
 * - Uses descriptive alt for informative photos, alt="" for decorative (R15.8).
 * - Shows fallback when image fails to load (R15.10).
 * - Thumbnail navigation selects the correct photo.
 * - Prev/next buttons cycle through photos.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Gallery } from "./Gallery";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { GalleryPhoto } from "../../lib/types";

/**
 * Wrapper that provides LanguageProvider for i18n resolution in the detail namespace.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider initialLanguage="es" namespace="detail">
      {children}
    </LanguageProvider>
  );
}

// ── Test fixtures ──

const singlePhoto: GalleryPhoto[] = [
  { url: "https://example.com/photo1.jpg", alt: "Laguna del Otún al amanecer", decorative: false },
];

const multiplePhotos: GalleryPhoto[] = [
  { url: "https://example.com/photo1.jpg", alt: "Laguna del Otún al amanecer", decorative: false },
  { url: "https://example.com/photo2.jpg", alt: "Frailejones del páramo", decorative: false },
  { url: "https://example.com/photo3.jpg", alt: "", decorative: true },
  { url: "https://example.com/photo4.jpg", alt: "Vista panorámica del valle", decorative: false },
];

// ── Tests ──

describe("Gallery — placeholder when no photos (R15.9)", () => {
  it("renders a placeholder with accessible label when photos array is empty", () => {
    render(
      <Wrapper>
        <Gallery photos={[]} />
      </Wrapper>,
    );

    const placeholder = screen.getByRole("img", { name: /sin fotos disponibles/i });
    expect(placeholder).toBeInTheDocument();
  });

  it("renders a text message indicating no photos", () => {
    render(
      <Wrapper>
        <Gallery photos={[]} />
      </Wrapper>,
    );

    expect(screen.getByText("No hay fotos disponibles")).toBeInTheDocument();
  });

  it("does not render navigation controls when empty", () => {
    render(
      <Wrapper>
        <Gallery photos={[]} />
      </Wrapper>,
    );

    expect(screen.queryByRole("button", { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /siguiente/i })).not.toBeInTheDocument();
  });
});

describe("Gallery — slider with controls (R15.1)", () => {
  it("renders the main image from the first photo", () => {
    const { container } = render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const mainImg = container.querySelector("img");
    expect(mainImg).toBeInTheDocument();
    expect(mainImg).toHaveAttribute("src", multiplePhotos[0]!.url);
  });

  it("renders prev/next navigation buttons for multiple photos", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    expect(screen.getByRole("button", { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
  });

  it("does not render prev/next for a single photo", () => {
    render(
      <Wrapper>
        <Gallery photos={singlePhoto} />
      </Wrapper>,
    );

    expect(screen.queryByRole("button", { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /siguiente/i })).not.toBeInTheDocument();
  });

  it("renders a position indicator (1/N) for multiple photos", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    expect(screen.getByText("1 / 4")).toBeInTheDocument();
  });

  it("renders thumbnails for multiple photos", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const thumbnails = screen.getAllByRole("tab");
    expect(thumbnails).toHaveLength(4);
  });

  it("has a carousel region with correct aria-roledescription", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const region = screen.getByRole("region", { name: /galería de fotos/i });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });
});

describe("Gallery — alt text (R15.8)", () => {
  it("uses descriptive alt for informative photos", () => {
    const { container } = render(
      <Wrapper>
        <Gallery photos={singlePhoto} />
      </Wrapper>,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "Laguna del Otún al amanecer");
  });

  it("uses alt=\"\" for decorative photos", () => {
    // Navigate to the decorative photo (index 2)
    const { container } = render(
      <Wrapper>
        <Gallery photos={[multiplePhotos[2]!]} />
      </Wrapper>,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });
});

describe("Gallery — fallback on image load error (R15.10)", () => {
  it("shows fallback text when main image fails to load", () => {
    const { container } = render(
      <Wrapper>
        <Gallery photos={singlePhoto} />
      </Wrapper>,
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();

    // Simulate image load error
    fireEvent.error(img!);

    // After error, the fallback message should appear
    expect(screen.getByText(/no se pudo cargar la imagen/i)).toBeInTheDocument();
  });

  it("shows fallback in thumbnail when thumbnail image fails", () => {
    const { container } = render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    // Get the first thumbnail image (inside a tab button)
    const thumbnailImages = container.querySelectorAll('[role="tab"] img');
    expect(thumbnailImages.length).toBeGreaterThan(0);

    // Simulate error on first thumbnail
    fireEvent.error(thumbnailImages[0]!);

    // The thumbnail should now show a fallback SVG instead
    const tabs = screen.getAllByRole("tab");
    const firstTab = tabs[0]!;
    expect(firstTab.querySelector("svg")).toBeInTheDocument();
  });
});

describe("Gallery — navigation", () => {
  it("next button advances to the next photo", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    expect(screen.getByText("1 / 4")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("previous button goes to the last photo when at the first", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const prevButton = screen.getByRole("button", { name: /anterior/i });
    await user.click(prevButton);

    expect(screen.getByText("4 / 4")).toBeInTheDocument();
  });

  it("clicking a thumbnail navigates to that photo", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const thumbnails = screen.getAllByRole("tab");
    // Click the third thumbnail (index 2)
    await user.click(thumbnails[2]!);

    expect(screen.getByText("3 / 4")).toBeInTheDocument();
  });

  it("current thumbnail has aria-selected=true", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const thumbnails = screen.getAllByRole("tab");
    expect(thumbnails[0]).toHaveAttribute("aria-selected", "true");
    expect(thumbnails[1]).toHaveAttribute("aria-selected", "false");
  });

  it("keyboard ArrowRight advances to next photo", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const carousel = screen.getByRole("region", { name: /galería de fotos/i });
    fireEvent.keyDown(carousel, { key: "ArrowRight" });

    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("keyboard ArrowLeft goes to previous photo", () => {
    render(
      <Wrapper>
        <Gallery photos={multiplePhotos} />
      </Wrapper>,
    );

    const carousel = screen.getByRole("region", { name: /galería de fotos/i });
    fireEvent.keyDown(carousel, { key: "ArrowLeft" });

    expect(screen.getByText("4 / 4")).toBeInTheDocument();
  });
});
