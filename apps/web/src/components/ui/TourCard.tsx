/**
 * `TourCard` — Tarjeta de tour estilo mockup etapa 1.
 *
 * Diseño:
 *   • Imagen de paisaje de fondo ocupando toda la card
 *   • Overlay gradient oscuro en la parte inferior
 *   • Info superpuesta abajo a la izquierda: nombre, duración • tipo, precio
 *   • Rating con estrella abajo a la derecha
 *   • Icono corazón (favorito) arriba a la derecha
 *   • Bordes redondeados, shadow sutil
 *
 * TypeScript strict, sin `any`.
 */
import type { JSX, KeyboardEvent } from "react";
import { Heart, Star } from "lucide-react";

import type { TourSummary } from "../../lib/types";
import { formatPriceCop } from "../../lib/format";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface TourCardProps {
  readonly tour: TourSummary;
  readonly glass?: boolean;
  readonly href: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

export function TourCard({ tour, href }: TourCardProps): JSX.Element {
  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>): void => {
    if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  // Mapear dificultad a un tipo legible para la card
  const typeLabel = getDifficultyLabel(tour.difficulty);

  return (
    <a
      href={href}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-md transition-shadow duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-azul-profundo"
      onKeyDown={handleKeyDown}
    >
      {/* Imagen de fondo */}
      <img
        src={tour.photoUrl}
        alt={tour.photoAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Icono favorito arriba a la derecha */}
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blanco-niebla/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-blanco-niebla"
          aria-label={`Agregar ${tour.name} a favoritos`}
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4 text-negro-volcanico/60" strokeWidth={2} />
        </button>
      </div>

      {/* Overlay gradient oscuro inferior */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-negro-volcanico/80 via-negro-volcanico/30 to-transparent"
        aria-hidden="true"
      />

      {/* Contenido superpuesto abajo */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-4">
        {/* Nombre del tour */}
        <h3 className="font-heading text-lg font-bold leading-tight text-blanco-niebla line-clamp-2">
          {tour.name}
        </h3>

        {/* Duración • Tipo */}
        <span className="text-sm text-blanco-niebla/80">
          {tour.durationLabel} • {typeLabel}
        </span>

        {/* Precio y rating */}
        <div className="mt-1 flex items-end justify-between">
          <div>
            <span className="text-xs text-blanco-niebla/60">Desde</span>
            <p className="text-base font-bold text-blanco-niebla">
              {formatPriceCop(tour.basePriceCop)}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-dorado text-dorado" />
            <span className="text-sm font-semibold text-blanco-niebla">
              {tour.rating ?? "4.8"}
            </span>
            <span className="text-xs text-blanco-niebla/60">
              ({tour.reviewCount ?? 96})
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "familiar":
      return "Excursión";
    case "moderado":
      return "Aventura";
    case "aventurero":
      return "Expedición";
    default:
      return "Cultural";
  }
}
