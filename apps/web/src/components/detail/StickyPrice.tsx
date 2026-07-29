/**
 * `StickyPrice` — elemento sticky/fijo con precio y CTA "Reservar ahora" (R15.5–R15.7).
 *
 * Comportamiento responsivo:
 *   - ≥1024px (lg): card lateral sticky (`position: sticky; top: 1rem`) que
 *     permanece visible durante el scroll del contenido principal (R15.5, R15.7).
 *   - <1024px: barra inferior fija (`position: fixed; bottom: 0`) que permanece
 *     visible durante el scroll (R15.6, R15.7).
 *
 * Muestra el precio base formateado y un botón CTA (Dorado) "Reservar ahora".
 * Opcionalmente, puede mostrar un precio actualizado al seleccionar una fecha
 * en el calendario (se recibirá como prop en la integración con AvailabilityCalendar).
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import type { JSX } from "react";

import { formatPriceCop } from "../../lib/format";
import { useTranslation } from "../../lib/i18n/provider";
import { Button } from "../ui/Button";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface StickyPriceProps {
  /** Precio a mostrar (puede ser el base o el actualizado por fecha seleccionada). */
  readonly priceCop: number;
  /** Acción al pulsar "Reservar ahora". */
  readonly onReserve?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Elemento sticky (≥1024px) / barra fija inferior (<1024px) con precio + CTA.
 *
 * Ambas versiones se renderizan siempre; la visibilidad se controla con las
 * utilidades responsivas de Tailwind (`hidden lg:block` / `lg:hidden`), por lo
 * que el usuario siempre ve exactamente una representación del elemento sin JS
 * adicional para detectar breakpoints.
 */
export function StickyPrice({ priceCop, onReserve }: StickyPriceProps): JSX.Element {
  const { t } = useTranslation("detail");
  const formattedPrice = formatPriceCop(priceCop);

  return (
    <>
      {/* ── Desktop: card lateral sticky (≥1024px) — R15.5, R15.7 ──────── */}
      <aside
        className="hidden lg:block lg:sticky lg:top-4 lg:self-start"
        aria-label={t("reserve.ariaLabel")}
      >
        <div className="flex flex-col gap-4 rounded-xl border border-arena bg-blanco-niebla p-6 shadow-md">
          {/* Precio */}
          <p className="text-h4 font-bold text-negro-volcanico">
            {formattedPrice}
          </p>

          {/* CTA "Reservar ahora" */}
          <Button
            variant="cta"
            labelKey="detail:reserve.cta"
            onClick={onReserve}
          />
        </div>
      </aside>

      {/* ── Mobile: barra inferior fija (<1024px) — R15.6, R15.7 ───────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-arena bg-blanco-niebla px-4 py-3 shadow-sticky lg:hidden"
        role="complementary"
        aria-label={t("reserve.ariaLabel")}
      >
        {/* Precio compacto */}
        <p className="text-body1 font-bold text-negro-volcanico">
          {formattedPrice}
        </p>

        {/* CTA compacto */}
        <Button
          variant="cta"
          labelKey="detail:reserve.cta"
          onClick={onReserve}
        />
      </div>
    </>
  );
}
