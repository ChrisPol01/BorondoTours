/**
 * Toggle Lista/Mapa para la vista del catálogo Discovery (R14.1).
 *
 * Lista es la vista por defecto. El toggle muestra indicación visual del estado
 * activo (R14.1) y conserva los filtros al alternar vista (R14.5).
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import type { JSX } from "react";

import { useTranslation } from "../../lib/i18n/provider";

/** Vista activa del catálogo. */
export type CatalogView = "list" | "map";

export interface ViewToggleProps {
  /** Vista actualmente seleccionada (R14.1: "list" por defecto). */
  readonly activeView: CatalogView;
  /** Callback al cambiar la vista; conserva filtros (R14.5). */
  readonly onViewChange: (view: CatalogView) => void;
}

/**
 * Toggle segmentado Lista/Mapa con indicación visual del botón activo.
 * Accesible con `role="group"`, cada botón con `aria-pressed`.
 */
export function ViewToggle({ activeView, onViewChange }: ViewToggleProps): JSX.Element {
  const { t } = useTranslation("discovery");
  const activeClasses = "bg-action-primary text-on-action";
  const inactiveClasses = "bg-surface-page text-text-primary hover:bg-surface-warm";

  return (
    <div role="group" aria-label={t("view.list") + " / " + t("view.map")} className="inline-flex overflow-hidden rounded-control border border-border-subtle">
      <button
        type="button"
        aria-pressed={activeView === "list"}
        onClick={() => onViewChange("list")}
        className={`min-h-11 px-4 py-2 text-sm font-semibold transition-colors duration-brand ${
          activeView === "list" ? activeClasses : inactiveClasses
        }`}
      >
        {t("view.list")}
      </button>
      <button
        type="button"
        aria-pressed={activeView === "map"}
        onClick={() => onViewChange("map")}
        className={`min-h-11 px-4 py-2 text-sm font-semibold transition-colors duration-brand ${
          activeView === "map" ? activeClasses : inactiveClasses
        }`}
      >
        {t("view.map")}
      </button>
    </div>
  );
}
