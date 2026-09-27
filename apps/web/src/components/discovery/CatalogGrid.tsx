/**
 * `CatalogGrid` — grid responsivo del catálogo Discovery del Portal B2C
 * (R11.1–R11.8).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsividad (R11.1–R11.3)
 * ─────────────────────────────────────────────────────────────────────────
 *   • ≥1025px → 3 columnas (lg breakpoint configurado en Tailwind a 1025px)
 *   • 768–1024px → 2 columnas (md breakpoint)
 *   • ≤767px → 1 columna (default)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Estados
 * ─────────────────────────────────────────────────────────────────────────
 *   • Carga (R11.5): 12 Skeleton_Loaders con el tamaño de un TourCard.
 *   • Vacío (R11.6): mensaje + acción "limpiar filtros".
 *   • Error (R11.7): mensaje + acción "reintentar" conservando filtros.
 *   • Datos: grid de TourCards con paginación de 12 por página (R11.8).
 *
 * TypeScript strict, sin `any`. Textos vía i18n (namespace `discovery`).
 */
import type { JSX } from "react";

import type { TourSummary } from "../../lib/types";
import { useTranslation } from "../../lib/i18n/provider";
import { TourCard } from "../ui/TourCard";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Tours por página (R11.8). */
const PAGE_SIZE = 12;

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

/**
 * Información de paginación keyset (cursor-based). No hay número de página ni
 * total: solo si existe una página anterior/siguiente. El cursor lo gestiona
 * el `CatalogController` (token opaco del backend).
 */
export interface PaginationInfo {
  /** Hay una página anterior a la actual (pila de cursores no vacía). */
  readonly hasPrev: boolean;
  /** Hay una página siguiente (el backend devolvió `nextCursor`). */
  readonly hasNext: boolean;
}

/** Props de `CatalogGrid`. */
export interface CatalogGridProps {
  /** Lista de tours a mostrar en la página actual. */
  readonly tours: TourSummary[];
  /** Estado de carga (primera carga → muestra 12 skeletons). */
  readonly isLoading: boolean;
  /** Error de la petición; si es `true` se muestra estado de error. */
  readonly isError: boolean;
  /** Información de paginación keyset. */
  readonly pagination: PaginationInfo;
  /** Callback al pulsar "limpiar filtros" en el estado vacío. */
  readonly onClearFilters: () => void;
  /** Callback al pulsar "reintentar" en el estado de error. */
  readonly onRetry: () => void;
  /** Callback para ir a la página anterior (keyset). */
  readonly onPrevPage: () => void;
  /** Callback para ir a la página siguiente (keyset). */
  readonly onNextPage: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Clases del grid responsivo
// ─────────────────────────────────────────────────────────────────────────

/**
 * Grid responsivo (R11.1–R11.3):
 * - 1 col default (≤767px)
 * - 2 cols md (768–1024px)
 * - 3 cols lg (≥1025px) — Tailwind `lg` configurado en 1025px
 */
const GRID_CLASSES = "grid gap-6 md:grid-cols-2 lg:grid-cols-3";

// ─────────────────────────────────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────────────────────────────────

/** Skeleton con forma de TourCard (imagen 16:9 + líneas de texto). */
function TourCardSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-card bg-surface-page shadow-card">
      {/* Imagen placeholder (16:9 aspect ratio) */}
      <Skeleton className="w-full aspect-tour-media" rounded="none" />
      {/* Contenido textual */}
      <div className="flex flex-col gap-2 px-4 pb-4">
        <Skeleton height={24} className="w-3/4" rounded="md" />
        <Skeleton height={16} className="w-1/2" rounded="md" />
        <Skeleton height={20} className="w-2/3" rounded="md" />
        <Skeleton height={20} className="w-1/4" rounded="full" />
      </div>
    </div>
  );
}

/** Estado de carga: 12 skeletons en el grid (R11.5). */
function LoadingState(): JSX.Element {
  return (
    <div className={GRID_CLASSES} role="status" aria-busy="true" aria-label="Cargando tours">
      {Array.from({ length: PAGE_SIZE }, (_unused, index) => (
        <TourCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Estado vacío: mensaje + "limpiar filtros" (R11.6). */
function EmptyState({ onClearFilters }: { readonly onClearFilters: () => void }): JSX.Element {
  const { t } = useTranslation("discovery");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-body1 font-body text-negro-volcanico/70">
        {t("empty.title")}
      </p>
      <Button
        variant="secondary"
        labelKey="discovery:empty.action"
        onClick={onClearFilters}
      />
    </div>
  );
}

/** Estado de error: mensaje + "reintentar" conservando filtros (R11.7). */
function ErrorState({ onRetry }: { readonly onRetry: () => void }): JSX.Element {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center" role="alert">
      <p className="text-body1 font-body text-negro-volcanico/70">
        {t("error.generic")}
      </p>
      <Button
        variant="primary"
        labelKey="common:action.retry"
        onClick={onRetry}
      />
    </div>
  );
}

/**
 * Controles de paginación keyset: "Anterior / Siguiente".
 * A diferencia de offset/page-based, no hay número de página ni total (la
 * paginación cursor-based no los conoce). Se oculta si no hay ni anterior ni
 * siguiente (una sola página de resultados).
 */
function PaginationControls({
  pagination,
  onPrevPage,
  onNextPage,
}: {
  readonly pagination: PaginationInfo;
  readonly onPrevPage: () => void;
  readonly onNextPage: () => void;
}): JSX.Element | null {
  const { t } = useTranslation("discovery");

  const { hasPrev, hasNext } = pagination;
  if (!hasPrev && !hasNext) return null;

  const buttonClasses = (enabled: boolean): string =>
    [
      "inline-flex items-center justify-center gap-2",
      "font-body text-button font-semibold",
      "min-h-11 rounded-control px-4 py-2",
      "transition-colors duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-azul-profundo",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-blanco-niebla",
      enabled
        ? "bg-action-primary text-on-action hover:bg-action-primary-hover"
        : "bg-arena text-negro-volcanico/40 cursor-not-allowed",
    ].join(" ");

  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex items-center justify-center gap-4 pt-8"
    >
      <button
        type="button"
        disabled={!hasPrev}
        onClick={onPrevPage}
        className={buttonClasses(hasPrev)}
        aria-label={t("pagination.prev")}
      >
        <span aria-hidden="true">←</span>
        {t("pagination.prev")}
      </button>

      <button
        type="button"
        disabled={!hasNext}
        onClick={onNextPage}
        className={buttonClasses(hasNext)}
        aria-label={t("pagination.next")}
      >
        {t("pagination.next")}
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────

/**
 * Grid responsivo del catálogo Discovery.
 *
 * Renderiza tours, estados de carga/vacío/error y controles de paginación
 * según el estado de la consulta.
 */
export function CatalogGrid({
  tours,
  isLoading,
  isError,
  pagination,
  onClearFilters,
  onRetry,
  onPrevPage,
  onNextPage,
}: CatalogGridProps): JSX.Element {
  // Estado de carga (R11.5): 12 skeletons
  if (isLoading) {
    return <LoadingState />;
  }

  // Estado de error (R11.7): mensaje + reintentar (filtros se conservan afuera)
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  // Estado vacío (R11.6): no hay tours con los filtros actuales
  if (tours.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  // Estado con datos: grid de TourCards + paginación (R11.4, R11.8)
  return (
    <section aria-label="Resultados del catálogo">
      <div className={GRID_CLASSES}>
        {tours.map((tour) => (
          <TourCard
            key={tour.slug}
            tour={tour}
            href={`/tours/${tour.slug}`}
          />
        ))}
      </div>

      <PaginationControls
        pagination={pagination}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    </section>
  );
}
