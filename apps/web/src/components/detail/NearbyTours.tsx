/**
 * `NearbyTours` — carrusel de tours cercanos para el Tour Detail (R18).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • Muestra ≤6 tours dentro de 50km del tour actual, ordenados por
 *     distancia ascendente, usando `nearbyTours` de `lib/geo.ts` (R18.1).
 *   • Excluye el tour actual del resultado (R18.2).
 *   • Oculta la sección si la lógica falla o tarda >3s (R18.3).
 *   • Muestra skeleton placeholders mientras calcula (R18.4).
 *   • Oculta la sección si no hay tours dentro de 50km (R18.5).
 *   • Presenta los resultados como un contenedor de scroll horizontal.
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import type { TourSummary } from "../../lib/types";
import { nearbyTours, type NearbyOrigin } from "../../lib/geo";
import { useTranslation } from "../../lib/i18n/provider";
import { Skeleton } from "../ui/Skeleton";
import { TourCard } from "../ui/TourCard";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface NearbyToursProps {
  /** Coordenadas [lng, lat] del tour actual (origen del cálculo). */
  readonly origin: [number, number];
  /** Slug del tour actual — se excluye del resultado (R18.2). */
  readonly currentSlug: string;
  /** Semilla de tours candidatos (llega desde `TourPageData.nearby`). */
  readonly nearbySeed: TourSummary[];
}

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Timeout máximo para el cálculo de tours cercanos (R18.3). */
const TIMEOUT_MS = 3000;

/** Número de skeleton cards a mostrar durante la carga (R18.4). */
const SKELETON_COUNT = 4;

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

/**
 * Carrusel de tours cercanos al tour actual.
 *
 * La computación se realiza en un efecto con timeout de 3s. Si el resultado
 * está vacío, la sección se oculta completamente (render nothing). Si falla
 * o supera el timeout, también se oculta (R18.3, R18.5).
 */
export function NearbyTours({
  origin,
  currentSlug,
  nearbySeed,
}: NearbyToursProps): JSX.Element | null {
  const { t } = useTranslation("detail");

  const [state, setState] = useState<{
    status: "loading" | "success" | "hidden";
    tours: TourSummary[];
  }>({ status: "loading", tours: [] });

  // Memoize el origin object para nearbyTours
  const nearbyOrigin = useMemo<NearbyOrigin>(
    () => ({ slug: currentSlug, coordinates: origin }),
    [currentSlug, origin],
  );

  useEffect(() => {
    let cancelled = false;

    // Timeout de 3s: si no se resuelve, ocultar la sección (R18.3).
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setState({ status: "hidden", tours: [] });
      }
    }, TIMEOUT_MS);

    // Simulamos un cómputo asíncrono (con Promise.resolve) para permitir el
    // skeleton visible y respetar el contrato de timeout. En un escenario
    // real esto podría involucrar un fetch; aquí la semilla ya viene en props
    // y el filtrado es síncrono, pero se envuelve para respetar la arquitectura.
    const compute = async (): Promise<void> => {
      try {
        // Defer al siguiente tick para que el skeleton se muestre brevemente
        await Promise.resolve();

        const result = nearbyTours(nearbyOrigin, nearbySeed);

        if (cancelled) return;

        window.clearTimeout(timeoutId);

        if (result.length === 0) {
          // R18.5: no hay tours en 50km → ocultar sección
          setState({ status: "hidden", tours: [] });
        } else {
          setState({ status: "success", tours: result });
        }
      } catch {
        // R18.3: si falla → ocultar sección
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          setState({ status: "hidden", tours: [] });
        }
      }
    };

    void compute();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [nearbyOrigin, nearbySeed]);

  // Estado oculto: no renderizar nada (R18.3, R18.5)
  if (state.status === "hidden") {
    return null;
  }

  // Estado de carga: skeleton placeholders (R18.4)
  if (state.status === "loading") {
    return (
      <section aria-label={t("nearby.title")} className="w-full">
        <h2 className="font-heading text-h3 font-semibold text-negro-volcanico mb-4">
          {t("nearby.title")}
        </h2>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          role="status"
          aria-busy="true"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className="min-w-tour-rail-card flex-shrink-0">
              <Skeleton height={180} rounded="xl" className="w-full mb-3" />
              <Skeleton height={20} rounded="md" className="w-3/4 mb-2" />
              <Skeleton height={16} rounded="md" className="w-1/2 mb-2" />
              <Skeleton height={18} rounded="md" className="w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Estado de éxito: carrusel con TourCards
  return (
    <section aria-label={t("nearby.title")} className="w-full">
      <h2 className="font-heading text-h3 font-semibold text-negro-volcanico mb-4">
        {t("nearby.title")}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {state.tours.map((tour) => (
          <div key={tour.slug} className="min-w-tour-rail-card flex-shrink-0">
            <TourCard tour={tour} href={`/tours/${tour.slug}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
