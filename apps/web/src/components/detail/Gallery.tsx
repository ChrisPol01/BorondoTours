/**
 * `Gallery` — island `client:visible` para el Tour Detail del Portal B2C.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • Slider con 1–20 fotos, thumbnails y controles prev/next (R15.1).
 *   • `alt` descriptivo por foto informativa; `alt=""` para decorativas (R15.8).
 *   • Si no hay fotos: muestra un placeholder en lugar del slider (R15.9).
 *   • Si una foto falla al cargar: muestra un fallback en su lugar (R15.10).
 *   • Navegación con flechas del teclado (izquierda/derecha).
 *   • Responsivo: ancho completo en todos los breakpoints.
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import { useCallback, useEffect, useState } from "react";
import type { JSX, KeyboardEvent } from "react";

import type { GalleryPhoto } from "../../lib/types";
import { useTranslation } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface GalleryProps {
  /** Lista de fotos del tour (0–20 items). */
  readonly photos: GalleryPhoto[];
}

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Número máximo de thumbnails visibles. */
const MAX_VISIBLE_THUMBNAILS = 8;

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Galería de imágenes del tour con slider, thumbnails y controles de navegación.
 */
export function Gallery({ photos }: GalleryProps): JSX.Element {
  const { t } = useTranslation("detail");

  // R15.9: Si no hay fotos, mostrar placeholder.
  if (photos.length === 0) {
    return <GalleryPlaceholder />;
  }

  return <GallerySlider photos={photos} t={t} />;
}

// ─────────────────────────────────────────────────────────────────────────
// Placeholder (R15.9)
// ─────────────────────────────────────────────────────────────────────────

function GalleryPlaceholder(): JSX.Element {
  const { t } = useTranslation("detail");

  return (
    <div
      className="flex w-full items-center justify-center rounded-lg bg-arena aspect-video"
      role="img"
      aria-label={t("gallery.placeholder")}
    >
      <div className="flex flex-col items-center gap-2 text-negro-volcanico/50">
        {/* Icono de imagen (SVG inline, Lucide-style) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="font-body text-body2">{t("gallery.noPhotos")}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Slider
// ─────────────────────────────────────────────────────────────────────────

interface GallerySliderProps {
  readonly photos: GalleryPhoto[];
  readonly t: (key: string) => string;
}

function GallerySlider({ photos, t }: GallerySliderProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());

  const totalPhotos = photos.length;

  const goToPrevious = useCallback((): void => {
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  const goToNext = useCallback((): void => {
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  }, [totalPhotos]);

  const goToIndex = useCallback((index: number): void => {
    setCurrentIndex(index);
  }, []);

  const handleImageError = useCallback((index: number): void => {
    setErrorIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Navegación por teclado (flechas izquierda/derecha).
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }
    },
    [goToPrevious, goToNext],
  );

  // Resetear el índice si se sale de rango (photos puede cambiar).
  useEffect(() => {
    if (currentIndex >= totalPhotos) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalPhotos]);

  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return <GalleryPlaceholder />;

  const hasError = errorIndices.has(currentIndex);

  return (
    <div
      className="flex w-full flex-col gap-3"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("gallery.label")}
    >
      {/* Imagen principal */}
      <div className="relative w-full overflow-hidden rounded-lg bg-arena aspect-video">
        {hasError ? (
          <GalleryFallback alt={currentPhoto.decorative ? "" : currentPhoto.alt} />
        ) : (
          <MainImage
            photo={currentPhoto}
            index={currentIndex}
            onError={handleImageError}
          />
        )}

        {/* Controles prev/next */}
        {totalPhotos > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-negro-volcanico/50 text-blanco-niebla transition-colors hover:bg-negro-volcanico/70 focus:outline-none focus:ring-2 focus:ring-turquesa"
              aria-label={t("gallery.previous")}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-negro-volcanico/50 text-blanco-niebla transition-colors hover:bg-negro-volcanico/70 focus:outline-none focus:ring-2 focus:ring-turquesa"
              aria-label={t("gallery.next")}
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        {/* Indicador de posición */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-negro-volcanico/60 px-3 py-1 text-xs font-body text-blanco-niebla">
            {currentIndex + 1} / {totalPhotos}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {totalPhotos > 1 && (
        <ThumbnailStrip
          photos={photos}
          currentIndex={currentIndex}
          errorIndices={errorIndices}
          onSelect={goToIndex}
          onImageError={handleImageError}
          t={t}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Imagen principal
// ─────────────────────────────────────────────────────────────────────────

interface MainImageProps {
  readonly photo: GalleryPhoto;
  readonly index: number;
  readonly onError: (index: number) => void;
}

function MainImage({ photo, index, onError }: MainImageProps): JSX.Element {
  const alt = photo.decorative ? "" : photo.alt;

  const handleError = useCallback((): void => {
    onError(index);
  }, [onError, index]);

  return (
    <img
      src={photo.url}
      alt={alt}
      className="h-full w-full object-cover"
      onError={handleError}
      draggable={false}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Fallback (R15.10)
// ─────────────────────────────────────────────────────────────────────────

interface GalleryFallbackProps {
  readonly alt: string;
}

function GalleryFallback({ alt }: GalleryFallbackProps): JSX.Element {
  const { t } = useTranslation("detail");

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-arena text-negro-volcanico/50"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt ? true : undefined}
    >
      <div className="flex flex-col items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="2" x2="22" y1="2" y2="22" />
          <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
          <line x1="13.5" x2="6" y1="13.5" y2="21" />
          <path d="M18 12 21 15" />
          <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
          <path d="M21 15V5a2 2 0 0 0-2-2H5" />
        </svg>
        <span className="font-body text-xs">{t("gallery.loadError")}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Thumbnail strip
// ─────────────────────────────────────────────────────────────────────────

interface ThumbnailStripProps {
  readonly photos: GalleryPhoto[];
  readonly currentIndex: number;
  readonly errorIndices: Set<number>;
  readonly onSelect: (index: number) => void;
  readonly onImageError: (index: number) => void;
  readonly t: (key: string) => string;
}

function ThumbnailStrip({
  photos,
  currentIndex,
  errorIndices,
  onSelect,
  onImageError,
  t,
}: ThumbnailStripProps): JSX.Element {
  return (
    <div
      className="flex w-full gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label={t("gallery.thumbnails")}
    >
      {photos.slice(0, MAX_VISIBLE_THUMBNAILS).map((photo, index) => (
        <ThumbnailButton
          key={`${photo.url}-${index}`}
          photo={photo}
          index={index}
          isCurrent={index === currentIndex}
          hasError={errorIndices.has(index)}
          onSelect={onSelect}
          onImageError={onImageError}
          t={t}
        />
      ))}
      {photos.length > MAX_VISIBLE_THUMBNAILS && (
        <div className="flex min-w-gallery-overflow items-center justify-center rounded-md bg-arena text-body2 font-body text-negro-volcanico/60">
          +{photos.length - MAX_VISIBLE_THUMBNAILS}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Thumbnail button
// ─────────────────────────────────────────────────────────────────────────

interface ThumbnailButtonProps {
  readonly photo: GalleryPhoto;
  readonly index: number;
  readonly isCurrent: boolean;
  readonly hasError: boolean;
  readonly onSelect: (index: number) => void;
  readonly onImageError: (index: number) => void;
  readonly t: (key: string) => string;
}

function ThumbnailButton({
  photo,
  index,
  isCurrent,
  hasError,
  onSelect,
  onImageError,
  t,
}: ThumbnailButtonProps): JSX.Element {
  const handleClick = useCallback((): void => {
    onSelect(index);
  }, [onSelect, index]);

  const handleError = useCallback((): void => {
    onImageError(index);
  }, [onImageError, index]);

  const ringClass = isCurrent
    ? "ring-2 ring-turquesa ring-offset-1"
    : "ring-1 ring-negro-volcanico/10 hover:ring-turquesa/50";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isCurrent}
      aria-label={t("gallery.goToPhoto").replace("{n}", String(index + 1))}
      onClick={handleClick}
      className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-turquesa ${ringClass}`}
    >
      {hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-arena text-negro-volcanico/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      ) : (
        <img
          src={photo.url}
          alt={photo.decorative ? "" : photo.alt}
          className="h-full w-full object-cover"
          onError={handleError}
          draggable={false}
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Icons (Lucide-style chevrons, inline para evitar dep adicional)
// ─────────────────────────────────────────────────────────────────────────

function ChevronLeftIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
