/**
 * `TourAddOns` — sección de complementos (add-ons) del tour.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades (R16.5, R16.6)
 * ─────────────────────────────────────────────────────────────────────────
 *   • Muestra 1–50 add-ons con nombre (≤100 chars), descripción (≤300 chars)
 *     y precio (0.01–999,999,999.99 COP) (R16.5).
 *   • Si no hay add-ons → se omite la sección entera (R16.6).
 *   • Layout de cards para cada add-on con precio formateado.
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import type { JSX } from "react";

import type { AddOn } from "../../lib/types";
import { formatAddonPriceCop } from "../../lib/format";
import { useTranslation } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface TourAddOnsProps {
  /** Lista de add-ons del tour (0–50). */
  readonly addOns: AddOn[];
}

// ─────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────

/**
 * Sección de complementos del tour. Se omite si el array está vacío (R16.6).
 */
export function TourAddOns({ addOns }: TourAddOnsProps): JSX.Element | null {
  const { t } = useTranslation("detail");

  // R16.6: sin add-ons → omitir la sección entera.
  if (addOns.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-heading text-h4 font-semibold text-negro-volcanico">
        {t("addons.title")}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addon) => (
          <AddOnCard key={addon.id} addon={addon} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-componente: card individual de add-on
// ─────────────────────────────────────────────────────────────────────────

interface AddOnCardProps {
  readonly addon: AddOn;
}

function AddOnCard({ addon }: AddOnCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-negro-volcanico/10 bg-blanco-niebla p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-body text-body1 font-semibold text-negro-volcanico leading-tight">
          {addon.name}
        </h4>
        <span className="flex-shrink-0 whitespace-nowrap rounded-md bg-turquesa/10 px-2 py-0.5 font-body text-body2 font-semibold text-turquesa">
          {formatAddonPriceCop(addon.additionalPriceCop)}
        </span>
      </div>
      {addon.shortDescription.length > 0 && (
        <p className="font-body text-body2 text-negro-volcanico/70 leading-relaxed">
          {addon.shortDescription}
        </p>
      )}
    </div>
  );
}
