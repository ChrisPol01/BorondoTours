/**
 * MapView — vista de mapa del catálogo Discovery (R14).
 *
 * Island React con directiva `client:visible` (se monta solo cuando entra en
 * viewport). Carga Mapbox GL JS dinámicamente para manejar fallos de carga
 * con gracia (R14.7).
 *
 * Requisitos implementados:
 * - R14.1: Toggle Lista/Mapa, Lista por defecto, indicador visual de la vista activa
 * - R14.2: Render ≤3s con un marcador por tour con coordenadas válidas según filtros
 * - R14.3: Centro Colombia [-74.2973, 4.5709] zoom 5
 * - R14.4: Un solo popup a la vez (foto/nombre/precio/"Ver detalle")
 * - R14.6: Estado vacío si ningún tour filtrado tiene coordenadas
 * - R14.7: Fallback a lista si Mapbox no carga en 3s conservando filtros
 * - R14.8: Token desde env var (import.meta.env.PUBLIC_MAPBOX_TOKEN)
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
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "../../lib/api";
import { formatPriceCop } from "../../lib/format";
import { useTranslation } from "../../lib/i18n/provider";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { TourSummary } from "../../lib/types";
import type { CatalogView } from "./ViewToggle";
import { ViewToggle } from "./ViewToggle";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Centro por defecto: Colombia (R14.3). */
const DEFAULT_CENTER: [number, number] = [-74.2973, 4.5709];
/** Zoom por defecto (R14.3). */
const DEFAULT_ZOOM = 5;
/** Timeout máximo para la carga de Mapbox en ms (R14.7). */
const LOAD_TIMEOUT_MS = 3000;

// ─────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────

type MapState = "loading" | "ready" | "error" | "empty";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface MapViewProps {
  /** Tours filtrados del catálogo (pueden o no tener coordenadas). */
  readonly tours: TourSummary[];
  /** Vista activa controlada externamente. */
  readonly activeView: CatalogView;
  /** Callback al cambiar vista (conserva filtros, R14.5). */
  readonly onViewChange: (view: CatalogView) => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente interno (tiene acceso a hooks)
// ─────────────────────────────────────────────────────────────────────────

function MapViewInner({ tours, activeView, onViewChange }: MapViewProps): JSX.Element {
  const { t } = useTranslation("discovery");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapState, setMapState] = useState<MapState>("loading");

  // Filtrar tours con coordenadas válidas (R14.2)
  const toursWithCoords = useMemo(
    () => tours.filter((tour): tour is TourSummary & { coordinates: [number, number] } => tour.coordinates !== null),
    [tours],
  );

  // Inicializar mapa al montar (solo cuando la vista es "map")
  useEffect(() => {
    if (activeView !== "map") return;

    // Si no hay tours con coordenadas, mostrar estado vacío (R14.6)
    if (toursWithCoords.length === 0) {
      setMapState("empty");
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function initMap(): Promise<void> {
      // Token desde env var, nunca en código fuente (R14.8)
      const token = import.meta.env.PUBLIC_MAPBOX_TOKEN as string | undefined;
      if (!token) {
        if (!cancelled) setMapState("error");
        return;
      }

      // Timeout de 3s: si Mapbox no carga, fallback (R14.7)
      const timeoutPromise = new Promise<"timeout">((resolve) => {
        timeoutId = setTimeout(() => resolve("timeout"), LOAD_TIMEOUT_MS);
      });

      try {
        // Importación dinámica de mapbox-gl y su CSS (R14.7: fallback si falla)
        const mapboxPromise = import("mapbox-gl").then(async (mod) => {
          // Cargar CSS de Mapbox dinámicamente (solo una vez)
          if (!document.querySelector('link[href*="mapbox-gl"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css";
            document.head.appendChild(link);
          }
          return mod;
        });

        const result = await Promise.race([mapboxPromise, timeoutPromise]);

        if (cancelled) return;

        if (result === "timeout") {
          setMapState("error");
          return;
        }

        // Clear timeout si cargó a tiempo
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
          timeoutId = undefined;
        }

        const mapboxgl = result.default;

        if (!mapContainerRef.current || cancelled) return;

        // Asignar token (R14.8)
        mapboxgl.accessToken = token;

        // Crear mapa centrado en Colombia (R14.3)
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (cancelled) return;
          setMapState("ready");
          addMarkers(mapboxgl, map);
        });

        map.on("error", () => {
          if (!cancelled) setMapState("error");
        });
      } catch {
        if (!cancelled) setMapState("error");
      }
    }

    function addMarkers(
      mapboxgl: typeof import("mapbox-gl").default,
      map: mapboxgl.Map,
    ): void {
      // Limpiar marcadores previos
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      for (const tour of toursWithCoords) {
        const marker = new mapboxgl.Marker()
          .setLngLat(tour.coordinates)
          .addTo(map);

        // Click en marcador → popup con foto/nombre/precio/"Ver detalle" (R14.4)
        marker.getElement().addEventListener("click", (e: Event) => {
          e.stopPropagation();

          // Cerrar popup anterior — un solo popup a la vez (R14.4)
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          const popupHtml = buildPopupHtml(tour);
          const popup = new mapboxgl.Popup({
            closeOnClick: true,
            maxWidth: "260px",
            offset: 25,
          })
            .setLngLat(tour.coordinates)
            .setHTML(popupHtml)
            .addTo(map);

          popupRef.current = popup;

          popup.on("close", () => {
            if (popupRef.current === popup) {
              popupRef.current = null;
            }
          });
        });

        markersRef.current.push(marker);
      }
    }

    function buildPopupHtml(tour: TourSummary & { coordinates: [number, number] }): string {
      const price = formatPriceCop(tour.basePriceCop);
      // Escapar HTML en strings del tour para prevenir XSS en popup
      const safeName = escapeHtml(tour.name);
      const safeAlt = escapeHtml(tour.photoAlt || tour.name);
      const viewDetailLabel = t("map.viewDetail");

      return `
        <div class="mapview-popup">
          <img
            src="${escapeHtml(tour.photoUrl)}"
            alt="${safeAlt}"
            class="mapview-popup__image"
            loading="lazy"
          />
          <div class="mapview-popup__content">
            <p class="mapview-popup__title">${safeName}</p>
            <p class="mapview-popup__price">${escapeHtml(price)}</p>
            <a
              href="/tours/${escapeHtml(tour.slug)}"
              class="mapview-popup__link"
            >
              ${escapeHtml(viewDetailLabel)} →
            </a>
          </div>
        </div>
      `;
    }

    initMap();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeView, toursWithCoords, t]);

  // Callback para fallback: cambiar a vista de lista conservando filtros (R14.7)
  const handleFallbackToList = useCallback(() => {
    onViewChange("list");
  }, [onViewChange]);

  return (
    <div>
      {/* Toggle Lista/Mapa (R14.1) */}
      <div className="mb-4 flex justify-end">
        <ViewToggle activeView={activeView} onViewChange={onViewChange} />
      </div>

      {/* Contenedor del mapa (solo visible en vista "map") */}
      {activeView === "map" && (
        <div className="relative">
          {/* Estado vacío: sin tours con coordenadas (R14.6) */}
          {mapState === "empty" && (
            <div
              className="flex h-map-canvas flex-col items-center justify-center rounded-control border border-border-subtle bg-surface-warm/30"
              role="status"
            >
              <p className="px-4 text-center text-text-primary">
                {t("map.empty")}
              </p>
            </div>
          )}

          {/* Fallback: Mapbox no cargó en 3s (R14.7) */}
          {mapState === "error" && (
            <div
              className="flex h-map-canvas flex-col items-center justify-center gap-3 rounded-control border border-border-subtle bg-surface-warm/30"
              role="alert"
            >
              <p className="px-4 text-center text-text-primary">
                {t("map.fallback")}
              </p>
              <button
                type="button"
                onClick={handleFallbackToList}
                className="px-4 py-2 rounded-control bg-action-primary text-on-action font-semibold text-sm hover:bg-action-primary-hover transition-colors duration-brand"
              >
                {t("map.fallbackAction")}
              </button>
            </div>
          )}

          {/* Contenedor del mapa Mapbox (R14.2, R14.3) */}
          {mapState !== "empty" && mapState !== "error" && (
            <>
              {mapState === "loading" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-control bg-surface-page/80">
                  <div className="animate-pulse font-semibold text-text-muted">
                    {t("common:state.loading")}
                  </div>
                </div>
              )}
              <div
                ref={mapContainerRef}
                className="h-map-canvas w-full overflow-hidden rounded-control"
                aria-label={t("view.map")}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Exportación envuelta con providers (island pattern)
// ─────────────────────────────────────────────────────────────────────────

const queryClient = createQueryClient();

/**
 * MapView como island React `client:visible` (Astro). Envuelve el componente
 * interno con los providers necesarios (QueryClient, i18n).
 */
export function MapView(props: MapViewProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider namespace="discovery">
        <MapViewInner {...props} />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

/** Escapa caracteres peligrosos de HTML para prevenir XSS en popups. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
