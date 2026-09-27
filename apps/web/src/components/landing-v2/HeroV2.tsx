/**
 * `HeroV2` — Hero de la Home v2 (ruta `/home-v2`, comparación de diseño).
 *
 * Variante basada en `otros/design/b2c/specs/01-home.design.md`:
 *   • Overlay `bg-negro-volcanico/40` (el spec pide 40%, no 15%).
 *   • Título con token tipográfico `text-h1` (font-heading ExtraBold).
 *   • Badge "EXPLORA COLOMBIA" en turquesa.
 *   • Imagen decorativa `alt=""` con fallback a fondo sólido.
 *
 * NO modifica el `Hero` original de `/`. Es una copia aislada para comparar.
 *
 * TypeScript strict, sin `any`.
 */

import { useState, useCallback, type JSX, type SyntheticEvent } from "react";
import { translate } from "../../lib/i18n/index";

const HERO_IMAGE_SRC = "/images/hero-landscape.png";

export function HeroV2(): JSX.Element {
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
      aria-labelledby="hero-v2-heading"
    >
      {/* Imagen de fondo decorativa */}
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

      {/* Overlay 40% (spec) para contraste del texto */}
      <div
        className={`absolute inset-0 ${
          imageError ? "bg-negro-volcanico" : "bg-negro-volcanico/40"
        }`}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-44 text-center sm:px-6 md:pt-32 md:pb-32 lg:pt-36 lg:pb-36">
        {/* Badge superior */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-turquesa/40 bg-turquesa/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="font-heading text-label uppercase tracking-wider text-turquesa">
            {translate("home:hero.badge")}
          </span>
        </div>

        {/* Título con token text-h1 */}
        <h1
          id="hero-v2-heading"
          className="font-heading text-h1 font-extrabold leading-tight text-blanco-niebla"
        >
          {translate("home:hero.title")}
        </h1>

        <p className="mx-auto mt-4 max-w-lg font-body text-body1 leading-relaxed text-blanco-niebla/90">
          {translate("home:hero.subtitle")}
        </p>
      </div>
    </section>
  );
}

export default HeroV2;
