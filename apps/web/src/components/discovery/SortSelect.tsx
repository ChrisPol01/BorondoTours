/**
 * `SortSelect` — selector de ordenamiento del catálogo (R13.9).
 *
 * Dropdown con 4 opciones de orden, default "Más popular". La selección se
 * refleja inmediatamente en el estado del catálogo (URL como fuente de verdad).
 *
 * Opciones (R13.9):
 *   - Más popular (default)
 *   - Precio: menor a mayor
 *   - Precio: mayor a menor
 *   - Más reciente
 *
 * TypeScript strict, sin `any`. Textos vía i18n (discovery namespace).
 */
import type { JSX } from "react";

import { useTranslation } from "../../lib/i18n/provider";
import type { CatalogState } from "../../lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SortOption = CatalogState["sort"];

export interface SortSelectProps {
  /** Valor actual del sort. */
  readonly value: SortOption;
  /** Callback al cambiar la selección. */
  readonly onChange: (sort: SortOption) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

/** Opciones de ordenamiento en orden de presentación (R13.9). */
const SORT_OPTIONS: readonly SortOption[] = [
  "popular",
  "price_asc",
  "price_desc",
  "recent",
];

/** Mapa de valor → clave i18n. */
const SORT_I18N_KEYS: Record<SortOption, string> = {
  popular: "discovery:sort.popular",
  price_asc: "discovery:sort.priceAsc",
  price_desc: "discovery:sort.priceDesc",
  recent: "discovery:sort.recent",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select nativo con las 4 opciones de orden del catálogo.
 * Etiqueta y opciones en español vía i18n.
 */
export function SortSelect({ value, onChange }: SortSelectProps): JSX.Element {
  const { t } = useTranslation("discovery");

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="font-body text-body2 font-semibold text-negro-volcanico whitespace-nowrap"
      >
        {t("sort.label")}
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className={[
          "font-body text-body2 text-negro-volcanico",
          "rounded-lg border border-azul-profundo/30 bg-blanco-niebla",
          "px-3 py-2",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-blanco-niebla",
        ].join(" ")}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(SORT_I18N_KEYS[option])}
          </option>
        ))}
      </select>
    </div>
  );
}
