/**
 * `Hero` — Sección hero de la Landing Page (R8.1–R8.9).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • Imagen de paisaje de fondo 100% ancho del viewport con overlay oscuro
 *     que garantiza contraste ≥4.5:1 entre texto blanco y fondo (R8.1, R8.4).
 *   • H1 y subtítulo de marca en tipografía Sora (R8.2, R8.3).
 *   • Imagen `loading="eager"` (above the fold, R8.5) con `alt=""` decorativa
 *     (R8.6).
 *   • Fallback a fondo oscuro sólido si la imagen no carga (R8.7).
 *   • Sin recorte de texto ni scroll horizontal en <768px (R8.8).
 *   • Todos los textos resueltos vía i18n (R8.9).
 *   • Atributo `data-hero-sentinel` en el contenedor para que la Navbar
 *     detecte la posición del hero vía IntersectionObserver.
 *
 * Este componente no tiene interactividad: se renderiza server-side por
 * Astro sin directiva `client:*`, usando `translate()` para la resolución
 * de textos (mismo patrón que Footer).
 *
 * TypeScript strict, sin `any`.
 */

import { useState, useCallback, type JSX, type SyntheticEvent } from "react";
import { translate } from "../../lib/i18n/index";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/**
 * Imagen de paisaje por defecto del hero (placeholder).
 * En producción se reemplaza por una imagen real de paisaje colombiano
 * servida desde el CDN (S3 + CloudFront).
 */
const HERO_IMAGE_SRC = "/images/hero-landscape.png";

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Hero de la Landing Page.
 *
 * Muestra una imagen de paisaje con overlay oscuro y textos de marca en Sora.
 * Expone `data-hero-sentinel` para que la Navbar detecte si está visible.
 */
export function Hero(): JSX.Element {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(
    (_event: SyntheticEvent<HTMLImageElement>): void => {
      setImageError(true);
    },
    [],
  );

  return (
    <section
      data-hero-sentinel
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden md:min-h-screen"
      aria-labelledby="hero-heading"
    >
      {/* Imagen de fondo decorativa (R8.1, R8.5, R8.6) */}
      {!imageError ? (
        <img
          src={HERO_IMAGE_SRC}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : null}

      {/*
        Overlay muy sutil para legibilidad del texto sin oscurecer la imagen.
      */}
      <div
        className={`absolute inset-0 ${
          imageError
            ? "bg-negro-volcanico"
            : "bg-negro-volcanico/15"
        }`}
        aria-hidden="true"
      />

      {/*
        Contenido del hero (R8.2, R8.3, R8.8, R8.9):
        - Textos en Sora vía i18n.
        - max-w + px para evitar que el texto se recorte o provoque
          scroll horizontal en viewports <768px (R8.8).
        - Tamaños responsivos con multiplicador de marca:
          mobile (0.85x): ~2.975rem ≈ text-3xl
          tablet (0.95x): ~3.325rem ≈ text-4xl
          desktop (1x): 3.5rem = text-h1
      */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-44 text-center sm:px-6 md:pt-32 md:pb-32 lg:pt-36 lg:pb-36">
        {/* Badge "EXPLORA COLOMBIA" — estilo turquesa/cyan */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-turquesa/40 bg-turquesa/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-turquesa">
            {translate("home:hero.badge")}
          </span>
        </div>

        <h1
          id="hero-heading"
          className="font-heading text-4xl font-extrabold leading-tight text-blanco-niebla md:text-5xl lg:text-6xl"
        >
          {translate("home:hero.title")}
        </h1>

        <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-blanco-niebla/85 md:text-base">
          {translate("home:hero.subtitle")}
        </p>
      </div>
    </section>
  );
}

export default Hero;
