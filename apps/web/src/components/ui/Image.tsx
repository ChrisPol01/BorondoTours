/**
 * `Image` — wrapper de `@unpic/react` para el Portal B2C (R21.1, R21.4, R21.5).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • `srcset` a 400/800/1200w breakpoints (R21.4) — via la prop `breakpoints`
 *     de @unpic/react.
 *   • `loading` configurable: `"eager"` para contenido above-the-fold (hero)
 *     o `"lazy"` (default) para below-the-fold con `rootMargin` de 200px
 *     implementado vía IntersectionObserver (R21.1, R10.4).
 *   • En fallo de carga: muestra un placeholder con el texto `alt` sin bloquear
 *     el render (R21.5). El placeholder es un fondo gris neutro con el texto alt
 *     centrado, manteniendo las dimensiones reservadas para evitar layout shift.
 *
 * El componente NO usa literales hexadecimales: los colores se referencian vía
 * utilidades Tailwind que apuntan a los design tokens de marca (R1.9).
 *
 * TypeScript strict, sin `any`.
 */
import { Image as UnpicImage } from "@unpic/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX, SyntheticEvent } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Breakpoints estándar de la marca para srcset (R21.4). */
const IMAGE_BREAKPOINTS = [400, 800, 1200] as const;

/**
 * Margen del IntersectionObserver para lazy loading (R21.1, R10.4).
 * Inicia la carga de la imagen cuando está a 200px del viewport visible.
 */
const LAZY_ROOT_MARGIN = "200px";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

/** Layout soportado por el wrapper (mapeo a @unpic/react layouts). */
export type ImageLayout = "fixed" | "constrained" | "fullWidth";

/** Props del componente `Image`. */
export interface ImageProps {
  /** URL de la imagen (obligatorio). */
  readonly src: string;
  /** Texto alternativo (obligatorio para accesibilidad; vacío para decorativas). */
  readonly alt: string;
  /**
   * Estrategia de carga:
   * - `"eager"`: carga inmediata (above-the-fold, ej. hero).
   * - `"lazy"` (default): carga diferida con margen de 200px.
   */
  readonly loading?: "eager" | "lazy";
  /** Ancho intrínseco en píxeles (requerido para layout `fixed`/`constrained`). */
  readonly width?: number;
  /** Alto intrínseco en píxeles (requerido para layout `fixed`/`constrained`). */
  readonly height?: number;
  /** Aspect ratio numérico (alternativa a `width`+`height`). */
  readonly aspectRatio?: number;
  /** Layout de la imagen. Default `"constrained"`. */
  readonly layout?: ImageLayout;
  /** Clases Tailwind adicionales para el contenedor. */
  readonly className?: string;
  /** `fetchpriority` hint: "high" para hero, "low" para fuera de vista. */
  readonly priority?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Componente de imagen optimizada para el Portal B2C.
 *
 * Envuelve `@unpic/react` con los breakpoints de marca, lazy loading con
 * margen de 200px y placeholder de error accesible.
 */
export function Image({
  src,
  alt,
  loading = "lazy",
  width,
  height,
  aspectRatio,
  layout = "constrained",
  className,
  priority = false,
}: ImageProps): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === "eager");
  const containerRef = useRef<HTMLDivElement>(null);

  // R21.1/R10.4: para lazy loading, usar IntersectionObserver con rootMargin 200px
  // para iniciar la carga antes de que la imagen sea visible.
  useEffect(() => {
    if (loading === "eager") {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [loading]);

  // R21.5: en fallo de carga, mostrar placeholder con el alt text.
  const handleError = useCallback(
    (_event: SyntheticEvent<HTMLImageElement>): void => {
      setHasError(true);
    },
    [],
  );

  // Cuando la imagen falla, renderizar un placeholder accesible que reserva
  // las dimensiones para evitar layout shift.
  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={[
          "flex items-center justify-center",
          "bg-arena text-negro-volcanico/60",
          "text-body2 font-body text-center p-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "auto",
          aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        }}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt ? true : undefined}
      >
        {alt && (
          <span className="max-w-full overflow-hidden text-ellipsis">
            {alt}
          </span>
        )}
      </div>
    );
  }

  // Mientras no esté en vista (lazy loading), renderizar un placeholder que
  // reserva espacio sin bloquear el render.
  if (!isInView) {
    return (
      <div
        ref={containerRef}
        className={[
          "bg-arena",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "auto",
          aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        }}
        aria-hidden="true"
      />
    );
  }

  // Renderizar la imagen @unpic/react con breakpoints de marca.
  // La lógica de layout/dimensiones determina cómo se pasa a @unpic.
  return (
    <div ref={containerRef} className={className}>
      <UnpicImageWrapper
        src={src}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        layout={layout}
        priority={priority}
        onError={handleError}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Internal wrapper que maneja la union discriminada de @unpic/react
// ─────────────────────────────────────────────────────────────────────────

interface UnpicImageWrapperProps {
  src: string;
  alt: string;
  loading: "eager" | "lazy";
  width: number | undefined;
  height: number | undefined;
  aspectRatio: number | undefined;
  layout: ImageLayout;
  priority: boolean;
  onError: (event: SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Componente interno que despacha la renderización según el layout,
 * resolviendo la union discriminada de tipos de @unpic/react.
 */
function UnpicImageWrapper({
  src,
  alt,
  loading,
  width,
  height,
  aspectRatio,
  layout,
  priority,
  onError,
}: UnpicImageWrapperProps): JSX.Element {
  const breakpoints = [...IMAGE_BREAKPOINTS];

  // fullWidth: width no se permite, height y aspectRatio opcionales.
  if (layout === "fullWidth") {
    return (
      <UnpicImage
        src={src}
        alt={alt}
        loading={loading}
        priority={priority}
        layout="fullWidth"
        height={height}
        aspectRatio={aspectRatio}
        breakpoints={breakpoints}
        onError={onError}
      />
    );
  }

  // fixed/constrained: requiere width+height, width+aspectRatio, o height+aspectRatio.
  if (width != null && height != null) {
    return (
      <UnpicImage
        src={src}
        alt={alt}
        loading={loading}
        priority={priority}
        layout={layout}
        width={width}
        height={height}
        breakpoints={breakpoints}
        onError={onError}
      />
    );
  }

  if (width != null && aspectRatio != null) {
    return (
      <UnpicImage
        src={src}
        alt={alt}
        loading={loading}
        priority={priority}
        layout={layout}
        width={width}
        aspectRatio={aspectRatio}
        breakpoints={breakpoints}
        onError={onError}
      />
    );
  }

  if (height != null && aspectRatio != null) {
    return (
      <UnpicImage
        src={src}
        alt={alt}
        loading={loading}
        priority={priority}
        layout={layout}
        height={height}
        aspectRatio={aspectRatio}
        breakpoints={breakpoints}
        onError={onError}
      />
    );
  }

  // Fallback: dimensiones insuficientes para fixed/constrained → usar fullWidth.
  return (
    <UnpicImage
      src={src}
      alt={alt}
      loading={loading}
      priority={priority}
      layout="fullWidth"
      height={height}
      aspectRatio={aspectRatio}
      breakpoints={breakpoints}
      onError={onError}
    />
  );
}
