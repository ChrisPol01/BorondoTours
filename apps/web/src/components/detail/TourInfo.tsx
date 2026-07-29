/**
 * `TourInfo` — información principal del tour para la vista de detalle (R15.2–R15.4).
 *
 * Muestra:
 *   - Nombre del tour como ÚNICO H1 de la página (R15.2).
 *   - Destino y región del tour.
 *   - Duración formateada vía `formatDuration` ("N días / M noches" o "N horas").
 *   - Precio base formateado vía `formatPriceCop` ("Desde $X COP por persona").
 *   - Badge del operador con estilo de marca.
 *   - Badge de dificultad con colores de token según nivel (R15.3).
 *   - Indicador "IVA exento disponible" si `ivaExemptAvailable` es true (R15.4).
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import type { JSX } from "react";

import type { Difficulty, TourDetail } from "../../lib/types";
import { formatDuration } from "../../lib/format";
import { formatPriceCop } from "../../lib/format";
import { useTranslation } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface TourInfoProps {
  /** Detalle completo del tour. */
  readonly tour: TourDetail;
}

// ─────────────────────────────────────────────────────────────────────────
// Badge de dificultad — colores de token por nivel (R15.3)
// ─────────────────────────────────────────────────────────────────────────

/** Mapeo de dificultad a clases de colores Tailwind (design tokens). */
const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  familiar: "bg-verde/15 text-verde border-verde/30",
  moderado: "bg-dorado/15 text-dorado border-dorado/30",
  aventurero: "bg-adventure/15 text-adventure border-adventure/30",
  extremo: "bg-avail-red/15 text-avail-red border-avail-red/30",
};

/** Etiquetas legibles por nivel de dificultad (mismo literal que el filtro). */
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  familiar: "discovery:filters.difficulty.familiar",
  moderado: "discovery:filters.difficulty.moderado",
  aventurero: "discovery:filters.difficulty.aventurero",
  extremo: "discovery:filters.difficulty.extremo",
};

// ─────────────────────────────────────────────────────────────────────────
// Mapeo de región a etiqueta legible
// ─────────────────────────────────────────────────────────────────────────

const REGION_LABELS: Record<string, string> = {
  eje_cafetero: "discovery:filters.region.eje_cafetero",
  llanos: "discovery:filters.region.llanos",
  amazonia: "discovery:filters.region.amazonia",
  costa_caribe: "discovery:filters.region.costa_caribe",
  costa_pacifico: "discovery:filters.region.costa_pacifico",
  andes: "discovery:filters.region.andes",
  bogota_dc: "discovery:filters.region.bogota_dc",
};

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Información principal del tour. Renderiza el nombre como único H1, metadatos
 * clave (destino, duración, precio) y badges de operador/dificultad.
 */
export function TourInfo({ tour }: TourInfoProps): JSX.Element {
  const { t } = useTranslation("detail");

  const duration = formatDuration({
    days: tour.durationDays,
    nights: tour.durationNights,
    hours: tour.durationHours,
  });

  const price = formatPriceCop(tour.basePriceCop);
  const regionKey = REGION_LABELS[tour.region] ?? tour.region;
  const regionLabel = regionKey.includes(":") ? t(regionKey) : regionKey;

  return (
    <section className="flex flex-col gap-4">
      {/* R15.2: Nombre como único H1 de la página */}
      <h1 className="font-heading text-h1 font-extrabold text-negro-volcanico">
        {tour.name}
      </h1>

      {/* Destino y región */}
      <p className="text-body1 text-negro-volcanico/70">
        {tour.destination}
        {tour.destination && tour.region ? " · " : ""}
        {regionLabel}
      </p>

      {/* Duración formateada (R15.2) */}
      {duration.length > 0 && (
        <p className="text-body2 font-semibold text-negro-volcanico/80">
          {duration}
        </p>
      )}

      {/* Badges: operador + dificultad (R15.3) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Badge operador */}
        <span className="inline-flex items-center rounded-full border border-azul-profundo/20 bg-azul-profundo/10 px-3 py-1 text-label font-semibold text-azul-profundo">
          {tour.operatorName}
        </span>

        {/* Badge dificultad con colores de token */}
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-label font-semibold ${DIFFICULTY_STYLES[tour.difficulty]}`}
        >
          {t(DIFFICULTY_LABELS[tour.difficulty])}
        </span>
      </div>

      {/* Precio base (R15.2) */}
      <p className="text-h4 font-bold text-negro-volcanico">
        {price}
      </p>

      {/* IVA exento disponible (R15.4) */}
      {tour.ivaExemptAvailable && (
        <span className="inline-flex items-center gap-1 rounded-md bg-verde/10 px-3 py-1.5 text-body2 font-medium text-verde">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          {t("vat.exempt")}
        </span>
      )}
    </section>
  );
}
