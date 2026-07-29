/**
 * `FilterPanel` — panel lateral de filtros del catálogo (R13.1–R13.13).
 *
 * Contiene filtros de: Destino (7 regiones), Duración (4), Precio (rango
 * min<=max), Dificultad (4), "Incluye pasaporte" (IVA exento). Combinación AND.
 *
 * Comportamiento:
 * - "Limpiar filtros" visible si ≥1 filtro activo (R13.7).
 * - Hidrata controles desde el estado del catálogo (R13.10).
 * - "Limpiar filtros" resetea filtros + orden a default + actualiza URL (R13.11).
 * - <768px: se renderiza en un drawer lateral sin colapsar el grid,
 *   usando `useFocusTrap` (R13.13).
 * - ≥768px: se renderiza como sidebar estática.
 *
 * TypeScript strict, sin `any`. Textos vía i18n (discovery namespace).
 */
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type JSX,
  type ChangeEvent,
} from "react";

import { useTranslation } from "../../lib/i18n/provider";
import { useFocusTrap } from "../ui/useFocusTrap";
import type {
  CatalogState,
  Difficulty,
  DurationBucket,
  Region,
} from "../../lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Estado de filtros gestionado por el panel (subset de CatalogState). */
export interface FilterValues {
  readonly regions: Region[];
  readonly durations: DurationBucket[];
  readonly priceMin: number;
  readonly priceMax: number;
  readonly difficulties: Difficulty[];
  readonly passportOnly: boolean;
  readonly sort: CatalogState["sort"];
}

export interface FilterPanelProps {
  /** Estado actual de filtros (hidratado desde URL). */
  readonly filters: FilterValues;
  /** Callback cuando se cambia cualquier filtro. */
  readonly onFilterChange: (filters: FilterValues) => void;
  /** Callback para "Limpiar filtros": resetea filtros + orden + URL (R13.11). */
  readonly onClearFilters: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de dominio
// ─────────────────────────────────────────────────────────────────────────────

const REGIONS: readonly Region[] = [
  "eje_cafetero",
  "llanos",
  "amazonia",
  "costa_caribe",
  "costa_pacifico",
  "andes",
  "bogota_dc",
];

const DURATIONS: readonly DurationBucket[] = [
  "half_day",
  "one_day",
  "two_three_days",
  "more_than_three",
];

const DIFFICULTIES: readonly Difficulty[] = [
  "familiar",
  "moderado",
  "aventurero",
  "extremo",
];

/** Precio máximo del sistema (R13.3). */
const PRICE_MAX = 999_999_999;

/** Estado por defecto de los filtros (ningún filtro activo). */
const DEFAULT_FILTERS: FilterValues = {
  regions: [],
  durations: [],
  priceMin: 0,
  priceMax: PRICE_MAX,
  difficulties: [],
  passportOnly: false,
  sort: "popular",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determina si hay al menos un filtro activo respecto a los valores por defecto
 * (R13.7: "Limpiar filtros" visible si ≥1 filtro activo).
 */
export function hasActiveFilters(filters: FilterValues): boolean {
  if (filters.regions.length > 0) return true;
  if (filters.durations.length > 0) return true;
  if (filters.priceMin > 0) return true;
  if (filters.priceMax < PRICE_MAX) return true;
  if (filters.difficulties.length > 0) return true;
  if (filters.passportOnly) return true;
  if (filters.sort !== "popular") return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface CheckboxGroupProps<T extends string> {
  readonly title: string;
  readonly options: readonly T[];
  readonly selected: readonly T[];
  readonly getLabel: (option: T) => string;
  readonly onChange: (selected: T[]) => void;
}

function CheckboxGroup<T extends string>({
  title,
  options,
  selected,
  getLabel,
  onChange,
}: CheckboxGroupProps<T>): JSX.Element {
  const handleToggle = (option: T, checked: boolean): void => {
    if (checked) {
      onChange([...selected, option]);
    } else {
      onChange(selected.filter((item) => item !== option));
    }
  };

  return (
    <fieldset className="space-y-2">
      <legend className="font-body text-body2 font-semibold text-negro-volcanico mb-1">
        {title}
      </legend>
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-2 cursor-pointer font-body text-body2 text-negro-volcanico"
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => handleToggle(option, e.target.checked)}
            className="h-4 w-4 rounded border-azul-profundo/30 text-turquesa focus:ring-azul-profundo"
          />
          {getLabel(option)}
        </label>
      ))}
    </fieldset>
  );
}

interface PriceRangeProps {
  readonly title: string;
  readonly minLabel: string;
  readonly maxLabel: string;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly onChange: (min: number, max: number) => void;
}

function PriceRange({
  title,
  minLabel,
  maxLabel,
  priceMin,
  priceMax,
  onChange,
}: PriceRangeProps): JSX.Element {
  const [localMin, setLocalMin] = useState(String(priceMin === 0 ? "" : priceMin));
  const [localMax, setLocalMax] = useState(
    String(priceMax === PRICE_MAX ? "" : priceMax),
  );

  // Sincronizar con props externas (hidratación desde URL)
  useEffect(() => {
    setLocalMin(priceMin === 0 ? "" : String(priceMin));
    setLocalMax(priceMax === PRICE_MAX ? "" : String(priceMax));
  }, [priceMin, priceMax]);

  const commitChange = (minStr: string, maxStr: string): void => {
    const parsedMin = minStr === "" ? 0 : Math.max(0, Math.min(PRICE_MAX, Number(minStr) || 0));
    const parsedMax = maxStr === "" ? PRICE_MAX : Math.max(0, Math.min(PRICE_MAX, Number(maxStr) || PRICE_MAX));
    // Asegurar min <= max (R13.3)
    const finalMin = Math.min(parsedMin, parsedMax);
    const finalMax = Math.max(parsedMin, parsedMax);
    onChange(finalMin, finalMax);
  };

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setLocalMin(value);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setLocalMax(value);
  };

  const handleBlur = (): void => {
    commitChange(localMin, localMax);
  };

  const inputClasses = [
    "w-full font-body text-body2 text-negro-volcanico",
    "rounded-lg border border-azul-profundo/30 bg-blanco-niebla",
    "px-3 py-2",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
    "focus-visible:ring-offset-1 focus-visible:ring-offset-blanco-niebla",
  ].join(" ");

  return (
    <fieldset className="space-y-2">
      <legend className="font-body text-body2 font-semibold text-negro-volcanico mb-1">
        {title}
      </legend>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="filter-price-min" className="sr-only">
            {minLabel}
          </label>
          <input
            id="filter-price-min"
            type="text"
            inputMode="numeric"
            placeholder={minLabel}
            value={localMin}
            onChange={handleMinChange}
            onBlur={handleBlur}
            className={inputClasses}
          />
        </div>
        <span className="text-negro-volcanico/50" aria-hidden="true">
          –
        </span>
        <div className="flex-1">
          <label htmlFor="filter-price-max" className="sr-only">
            {maxLabel}
          </label>
          <input
            id="filter-price-max"
            type="text"
            inputMode="numeric"
            placeholder={maxLabel}
            value={localMax}
            onChange={handleMaxChange}
            onBlur={handleBlur}
            className={inputClasses}
          />
        </div>
      </div>
    </fieldset>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterPanelContent (shared between desktop sidebar and mobile drawer)
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPanelContentProps extends FilterPanelProps {
  readonly showClear: boolean;
}

function FilterPanelContent({
  filters,
  onFilterChange,
  onClearFilters,
  showClear,
}: FilterPanelContentProps): JSX.Element {
  const { t } = useTranslation("discovery");

  const updateFilters = useCallback(
    (partial: Partial<FilterValues>): void => {
      onFilterChange({ ...filters, ...partial });
    },
    [filters, onFilterChange],
  );

  return (
    <div className="space-y-6">
      {/* Título + Limpiar filtros (R13.7) */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h4 font-semibold text-negro-volcanico">
          {t("filters.title")}
        </h2>
        {showClear && (
          <button
            type="button"
            onClick={onClearFilters}
            className={[
              "font-body text-body2 text-turquesa underline",
              "hover:text-verde transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-blanco-niebla rounded",
            ].join(" ")}
          >
            {t("filters.clear")}
          </button>
        )}
      </div>

      {/* Filtro Destino — 7 regiones (R13.1) */}
      <CheckboxGroup<Region>
        title={t("filters.region.title")}
        options={REGIONS}
        selected={filters.regions}
        getLabel={(r) => t(`filters.region.${r}`)}
        onChange={(regions) => updateFilters({ regions })}
      />

      {/* Filtro Duración — 4 opciones (R13.2) */}
      <CheckboxGroup<DurationBucket>
        title={t("filters.duration.title")}
        options={DURATIONS}
        selected={filters.durations}
        getLabel={(d) => t(`filters.duration.${d}`)}
        onChange={(durations) => updateFilters({ durations })}
      />

      {/* Filtro Precio — rango min<=max (R13.3) */}
      <PriceRange
        title={t("filters.price.title")}
        minLabel={t("filters.price.min")}
        maxLabel={t("filters.price.max")}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        onChange={(priceMin, priceMax) => updateFilters({ priceMin, priceMax })}
      />

      {/* Filtro Dificultad — 4 opciones (R13.4) */}
      <CheckboxGroup<Difficulty>
        title={t("filters.difficulty.title")}
        options={DIFFICULTIES}
        selected={filters.difficulties}
        getLabel={(d) => t(`filters.difficulty.${d}`)}
        onChange={(difficulties) => updateFilters({ difficulties })}
      />

      {/* Filtro Pasaporte — IVA exento (R13.5) */}
      <label className="flex items-center gap-2 cursor-pointer font-body text-body2 text-negro-volcanico">
        <input
          type="checkbox"
          checked={filters.passportOnly}
          onChange={(e) => updateFilters({ passportOnly: e.target.checked })}
          className="h-4 w-4 rounded border-azul-profundo/30 text-turquesa focus:ring-azul-profundo"
        />
        {t("filters.passport")}
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Drawer (R13.13)
// ─────────────────────────────────────────────────────────────────────────────

interface MobileDrawerProps extends FilterPanelProps {
  readonly showClear: boolean;
}

function MobileDrawer({
  filters,
  onFilterChange,
  onClearFilters,
  showClear,
}: MobileDrawerProps): JSX.Element {
  const { t } = useTranslation("discovery");
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus trap para accesibilidad del drawer (R13.13, R22.6–R22.8)
  useFocusTrap({
    containerRef: drawerRef,
    triggerRef,
    isActive: isOpen,
    onClose: () => setIsOpen(false),
  });

  // Prevenir scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón para abrir el drawer */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="filter-drawer"
        className={[
          "inline-flex items-center gap-2",
          "font-body text-body2 font-semibold text-negro-volcanico",
          "rounded-lg border border-azul-profundo/30 bg-blanco-niebla",
          "px-4 py-2",
          "hover:bg-arena transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-blanco-niebla",
        ].join(" ")}
      >
        {/* Icono de filtro simple (SVG inline) */}
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
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {t("filters.open")}
      </button>

      {/* Overlay + Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="presentation">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-negro-volcanico/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            id="filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t("filters.title")}
            className={[
              "relative ml-auto h-full w-drawer-mobile max-w-drawer-max",
              "bg-blanco-niebla overflow-y-auto",
              "p-6 shadow-floating",
            ].join(" ")}
          >
            {/* Cerrar */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("common:action.close")}
                className={[
                  "rounded-lg p-2",
                  "hover:bg-arena transition-colors duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-blanco-niebla",
                ].join(" ")}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <FilterPanelContent
              filters={filters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
              showClear={showClear}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterPanel (main export)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Panel de filtros del catálogo. Detecta el viewport para renderizar como
 * sidebar (≥768px) o drawer lateral (<768px) sin colapsar el grid (R13.13).
 */
export function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps): JSX.Element {
  const showClear = hasActiveFilters(filters);

  return (
    <>
      {/* Desktop sidebar (≥768px): visible directamente */}
      <aside
        className="hidden md:block w-64 shrink-0"
        aria-label="Filtros del catálogo"
      >
        <FilterPanelContent
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          showClear={showClear}
        />
      </aside>

      {/* Mobile drawer (<768px): botón abre un drawer lateral */}
      <div className="md:hidden">
        <MobileDrawer
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          showClear={showClear}
        />
      </div>
    </>
  );
}

export { DEFAULT_FILTERS };
