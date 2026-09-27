/**
 * `CatalogController` — island principal del catálogo Discovery (R13.6, R13.8,
 * R13.10, R13.11, R14.5, R7.6).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   1. URL como fuente de verdad: lee URL al montar → hidrata estado (R13.10).
 *   2. Dispara `QUERY /tours/search` con el estado actual (debounce 300ms).
 *   3. Refleja cambios de filtros/búsqueda/orden en la URL ≤500ms (R13.8).
 *   4. Conserva filtros al alternar Lista/Mapa (R14.5).
 *   5. "Limpiar filtros" resetea todo + URL (R13.11).
 *   6. Compone: SearchBar, FilterPanel, SortSelect, ViewToggle,
 *      CatalogGrid/MapView.
 *   7. Envuelve con QueryClientProvider + LanguageProvider.
 *
 * TypeScript strict, sin `any`. Textos vía i18n (discovery namespace).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";

import { apiFetch, createQueryClient } from "../../lib/api";
import { catalogQueryDefaults } from "../../lib/api/queryClient";
import { LanguageProvider } from "../../lib/i18n/provider";
import { parseCatalogState, serializeCatalogState } from "../../lib/queryParams";
import { buildTourSearchBody } from "../../lib/searchRequest";
import type { CatalogState, TourSummary } from "../../lib/types";

import { LiquidGlassSurface } from "../ui/GlassSurface";
import { CatalogGrid } from "./CatalogGrid";
import { FilterPanel } from "./FilterPanel";
import type { FilterValues } from "./FilterPanel";
import { MapView } from "./MapView";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";
import { ViewToggle } from "./ViewToggle";
import type { CatalogView } from "./ViewToggle";

// ─────────────────────────────────────────────────────────────────────────
// Constantes de presentación
// ─────────────────────────────────────────────────────────────────────────

/**
 * Imagen de fondo del hero del catálogo (paisaje). En producción se sirve desde
 * el CDN (S3 + CloudFront). Placeholder local por ahora.
 */
const CATALOG_HERO_IMAGE = "/images/hero-landscape.png";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Precio máximo del sistema (alineado con queryParams.ts). */
const PRICE_MAX = 999_999_999;

/** Debounce para escritura de URL en ms (≤500ms garantizando R13.8). */
const URL_WRITE_DEBOUNCE_MS = 300;

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/** Lee el CatalogState actual de la URL del navegador. */
function readStateFromUrl(): CatalogState {
  if (typeof window === "undefined") {
    return parseCatalogState(new URLSearchParams());
  }
  return parseCatalogState(new URLSearchParams(window.location.search));
}

/** Escribe el CatalogState en la URL sin recargar (R13.8). */
function writeStateToUrl(state: CatalogState): void {
  if (typeof window === "undefined") return;
  const params = serializeCatalogState(state);
  const search = params.toString();
  const newUrl = search.length > 0
    ? `${window.location.pathname}?${search}`
    : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
}

/** Extrae FilterValues del CatalogState (subset). */
function stateToFilters(state: CatalogState): FilterValues {
  return {
    regions: state.regions,
    durations: state.durations,
    priceMin: state.priceMin,
    priceMax: state.priceMax,
    difficulties: state.difficulties,
    passportOnly: state.passportOnly,
    sort: state.sort,
  };
}

/** Estado por defecto del catálogo (sin filtros, sin búsqueda). */
function defaultCatalogState(): CatalogState {
  return {
    q: "",
    regions: [],
    durations: [],
    priceMin: 0,
    priceMax: PRICE_MAX,
    difficulties: [],
    passportOnly: false,
    sort: "popular",
    cursor: null,
    view: "list",
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Respuesta tipada del endpoint de búsqueda (cursor-based / keyset)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Respuesta de `QUERY /tours/search`. `nextCursor` es el token opaco de la
 * siguiente página (`null` = no hay más resultados). El backend lo devuelve en
 * el payload; también se acepta desde `meta.nextCursor` como fallback.
 */
interface SearchResponse {
  tours: TourSummary[];
  nextCursor: string | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente interno (con acceso a hooks de TanStack Query)
// ─────────────────────────────────────────────────────────────────────────

function CatalogControllerInner(): JSX.Element {
  // ── Estado del catálogo (hidratado de la URL al montar, R13.10) ──────
  const [catalogState, setCatalogState] = useState<CatalogState>(readStateFromUrl);

  /**
   * Pila de cursores de páginas ANTERIORES (paginación keyset). Vive en memoria,
   * NO en la URL: el cursor es un token opaco de posición y no debe ensuciar el
   * enlace compartible (que conserva solo filtros + el cursor actual opcional).
   * `prevCursors[i]` es el cursor con el que se cargó la página i; permite
   * "Anterior" sin que el backend calcule offset. `[]` = estamos en la 1ª página.
   */
  const [prevCursors, setPrevCursors] = useState<Array<string | null>>([]);

  // Ref del debounce para escritura de URL
  const urlWriteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sincronización URL → estado (escucha popstate + custom events) ───
  useEffect(() => {
    function handleUrlChange(): void {
      setCatalogState(readStateFromUrl());
    }

    // Navegación del historial (back/forward)
    window.addEventListener("popstate", handleUrlChange);
    // Evento custom disparado por SearchBar al modificar `q`
    window.addEventListener("catalogstate:change", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("catalogstate:change", handleUrlChange);
    };
  }, []);

  // ── Escritura de estado → URL con debounce ≤500ms (R13.8) ──────────
  const updateState = useCallback((nextState: CatalogState): void => {
    setCatalogState(nextState);

    if (urlWriteTimerRef.current !== null) {
      clearTimeout(urlWriteTimerRef.current);
    }
    urlWriteTimerRef.current = setTimeout(() => {
      writeStateToUrl(nextState);
    }, URL_WRITE_DEBOUNCE_MS);
  }, []);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (urlWriteTimerRef.current !== null) {
        clearTimeout(urlWriteTimerRef.current);
      }
    };
  }, []);

  // ── TanStack Query: QUERY /tours/search ────────────────────────────
  const queryKey = useMemo(
    () => ["tours", "search", catalogState] as const,
    [catalogState],
  );

  const { data, isLoading, isError, refetch } = useQuery<SearchResponse | null>({
    queryKey,
    queryFn: async ({ signal }) => {
      // Body alineado al contrato TourSearchSchema (filters anidados, sort, cursor).
      const result = await apiFetch<SearchResponse>("/tours/search", {
        method: "QUERY",
        body: buildTourSearchBody(catalogState),
        signal,
      });
      return result;
    },
    ...catalogQueryDefaults,
  });

  const tours = data?.tours ?? [];
  // Cursor de la siguiente página (null = no hay más resultados).
  const nextCursor = data?.nextCursor ?? null;
  const hasNext = nextCursor !== null;
  // Hay página anterior si tenemos cursores apilados en memoria.
  const hasPrev = prevCursors.length > 0;

  // ── Callbacks de componentes hijos ─────────────────────────────────

  /**
   * Cambio de filtros desde FilterPanel (R13.6: combinación AND).
   * Cambiar filtros invalida la posición: se resetea el cursor y la pila
   * (el keyset de una consulta no es válido para otra).
   */
  const handleFilterChange = useCallback(
    (filters: FilterValues): void => {
      const next: CatalogState = {
        ...catalogState,
        ...filters,
        cursor: null, // volver a la primera página al cambiar filtros
      };
      setPrevCursors([]);
      updateState(next);
    },
    [catalogState, updateState],
  );

  /** Limpiar filtros: reset todo + URL (R13.11). */
  const handleClearFilters = useCallback((): void => {
    const next = defaultCatalogState();
    // Conservar la vista actual al limpiar filtros
    next.view = catalogState.view;
    setPrevCursors([]);
    updateState(next);
    // Escribir URL inmediatamente (sin debounce para feedback instantáneo)
    writeStateToUrl(next);
  }, [catalogState.view, updateState]);

  /** Cambio de sort desde SortSelect (R13.9). Resetea posición (nuevo orden = nuevo keyset). */
  const handleSortChange = useCallback(
    (sort: CatalogState["sort"]): void => {
      const next: CatalogState = { ...catalogState, sort, cursor: null };
      setPrevCursors([]);
      updateState(next);
    },
    [catalogState, updateState],
  );

  /** Toggle Lista/Mapa conservando filtros y posición (R14.5). */
  const handleViewChange = useCallback(
    (view: CatalogView): void => {
      const next: CatalogState = { ...catalogState, view };
      updateState(next);
    },
    [catalogState, updateState],
  );

  /**
   * Avanzar a la siguiente página (keyset). Apila el cursor actual para poder
   * volver, y navega con el `nextCursor` devuelto por el backend.
   */
  const handleNextPage = useCallback((): void => {
    if (nextCursor === null) return;
    setPrevCursors((stack) => [...stack, catalogState.cursor]);
    const next: CatalogState = { ...catalogState, cursor: nextCursor };
    updateState(next);
  }, [catalogState, nextCursor, updateState]);

  /**
   * Volver a la página anterior (keyset). Desapila el último cursor guardado y
   * navega a él. Si la pila queda vacía, volvemos a la primera página (null).
   */
  const handlePrevPage = useCallback((): void => {
    setPrevCursors((stack) => {
      if (stack.length === 0) return stack;
      const nextStack = stack.slice(0, -1);
      const targetCursor = stack[stack.length - 1];
      updateState({ ...catalogState, cursor: targetCursor });
      return nextStack;
    });
  }, [catalogState, updateState]);

  /** Reintentar tras error (R11.7). */
  const handleRetry = useCallback((): void => {
    void refetch();
  }, [refetch]);

  // ── Derivaciones ────────────────────────────────────────────────────
  const filters = stateToFilters(catalogState);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div>
      {/*
        Hero del catálogo: imagen full-width con una superficie Liquid Glass
        superpuesta que contiene el buscador y los controles de vista/orden
        (mockup Catálogo). El overlay oscuro garantiza contraste ≥4.5:1 del
        texto claro sobre la fotografía (R8.4).
      */}
      <section className="relative w-full overflow-hidden">
        {/* Imagen de fondo decorativa */}
        <img
          src={CATALOG_HERO_IMAGE}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-negro-volcanico/40" aria-hidden="true" />

        {/* Contenido del hero */}
        <div className="relative mx-auto max-w-public px-page-gutter py-8">
          <LiquidGlassSurface
            overImage={true}
            className="rounded-panel p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:max-w-md">
                <SearchBar />
              </div>
              <div className="flex items-center gap-4">
                <SortSelect
                  value={catalogState.sort}
                  onChange={handleSortChange}
                />
                <ViewToggle
                  activeView={catalogState.view}
                  onViewChange={handleViewChange}
                />
              </div>
            </div>
          </LiquidGlassSurface>
        </div>
      </section>

      {/* Contenido principal: FilterPanel + Grid/Map */}
      <div className="mx-auto flex max-w-public gap-8 px-page-gutter py-8">
        {/* Sidebar de filtros (desktop) / Drawer (mobile) */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Zona de resultados */}
        <div className="flex-1 min-w-0">
          {catalogState.view === "list" ? (
            <CatalogGrid
              tours={tours}
              isLoading={isLoading}
              isError={isError}
              pagination={{ hasPrev, hasNext }}
              onClearFilters={handleClearFilters}
              onRetry={handleRetry}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          ) : (
            <MapView
              tours={tours}
              activeView={catalogState.view}
              onViewChange={handleViewChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Exportación con providers (island pattern)
// ─────────────────────────────────────────────────────────────────────────

const queryClient = createQueryClient();

/**
 * CatalogController como island React `client:load` (Astro).
 *
 * Envuelve con QueryClientProvider + LanguageProvider para que todos los
 * sub-componentes del catálogo compartan el mismo queryClient e i18n.
 */
export function CatalogController(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider namespace="discovery">
        <CatalogControllerInner />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default CatalogController;
