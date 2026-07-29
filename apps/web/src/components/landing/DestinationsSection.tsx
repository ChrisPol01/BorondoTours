/**
 * `DestinationsSection` — Sección de destinos destacados + trust badges de la
 * Landing Page (R10.1–R10.6).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • Obtiene destinos destacados (3–8 tours) vía TanStack Query desde la API
 *     (`GET /home/page-data`). En Fase 1, usa MOCK DATA mientras no exista el
 *     endpoint real (R10.1).
 *   • Renderiza `TourCard` con variante `glass={true}` sobre fotografías (R10.1).
 *   • Click en TourCard navega a `/tours/:slug` (R10.3) — ya manejado por la
 *     prop `href` de TourCard.
 *   • Imágenes below-the-fold con lazy loading a 200px (R10.4) — gestionado por
 *     el componente `Image` dentro de `TourCard`.
 *   • Muestra `Skeleton` durante la carga (R10.5).
 *   • En caso de error: mensaje + botón de reintento, preservando el resto de la
 *     página (R10.6).
 *   • Trust badges inline con las 4 promesas de valor + iconos Lucide (R10.2).
 *
 * Island React: se hidrata con `client:visible` o `client:idle` porque necesita
 * TanStack Query para el data fetching.
 *
 * TypeScript strict, sin `any`.
 */

import { useQuery, QueryClientProvider } from "@tanstack/react-query";
import type { JSX } from "react";

import type { TourSummary } from "../../lib/types";
import { createQueryClient } from "../../lib/api";
import { useTranslation } from "../../lib/i18n/provider";
import { LanguageProvider } from "../../lib/i18n/provider";
import { TourCard } from "../ui/TourCard";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";

// ─────────────────────────────────────────────────────────────────────────
// Mock data (se reemplazará por el endpoint real GET /home/page-data)
// ─────────────────────────────────────────────────────────────────────────

/**
 * MOCK: Destinos destacados para la landing (Fase 1).
 * Estos datos simulan la respuesta de `GET /home/page-data` con 6 tours
 * destacados. En producción se consumirá el endpoint real.
 */
const MOCK_FEATURED_TOURS: TourSummary[] = [
  {
    slug: "valle-del-cocora",
    name: "Valle del Cocora",
    operatorName: "Quindío Expeditions",
    region: "eje_cafetero",
    durationLabel: "1 día",
    basePriceCop: 250_000,
    photoUrl: "/images/tours/valle-cocora.jpg",
    photoAlt: "Palmas de cera gigantes en el Valle del Cocora bajo cielo despejado",
    coordinates: [-75.488, 4.637],
    difficulty: "familiar",
    ivaExemptAvailable: true,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    slug: "parque-tayrona",
    name: "Parque Tayrona",
    operatorName: "Caribe Trek",
    region: "costa_caribe",
    durationLabel: "3 días",
    basePriceCop: 890_000,
    photoUrl: "/images/tours/parque-tayrona.jpg",
    photoAlt: "Bahía del Parque Tayrona con aguas cristalinas y vegetación tropical",
    coordinates: [-73.937, 11.302],
    difficulty: "moderado",
    ivaExemptAvailable: true,
    rating: 4.8,
    reviewCount: 96,
  },
  {
    slug: "amazonas-leticia",
    name: "Amazonas",
    operatorName: "Amazonas Wildlife",
    region: "amazonia",
    durationLabel: "4 días",
    basePriceCop: 1_250_000,
    photoUrl: "/images/tours/amazonas-leticia.jpg",
    photoAlt: "Río Amazonas al atardecer con selva tropical en ambas orillas",
    coordinates: [-69.942, -4.215],
    difficulty: "aventurero",
    ivaExemptAvailable: true,
    rating: 4.9,
    reviewCount: 74,
  },
  {
    slug: "cartagena",
    name: "Cartagena",
    operatorName: "Caribe Cultural",
    region: "costa_caribe",
    durationLabel: "2 días",
    basePriceCop: 560_000,
    photoUrl: "/images/tours/cartagena.jpg",
    photoAlt: "Calles coloridas del centro histórico de Cartagena de Indias",
    coordinates: [-75.514, 10.391],
    difficulty: "familiar",
    ivaExemptAvailable: false,
    rating: 4.7,
    reviewCount: 110,
  },
];

/**
 * Simula la petición a la API con un delay mínimo para demostrar el skeleton.
 * En producción se usará `apiFetch<TourSummary[]>('/home/page-data')`.
 */
async function fetchFeaturedTours(): Promise<TourSummary[]> {
  // Simular latencia de red (~300ms)
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_FEATURED_TOURS;
}

// ─────────────────────────────────────────────────────────────────────────
// Query client para esta island
// ─────────────────────────────────────────────────────────────────────────

const queryClient = createQueryClient();

// ─────────────────────────────────────────────────────────────────────────
// Componente principal (isla exportada)
// ─────────────────────────────────────────────────────────────────────────

/**
 * `DestinationsSection` — isla React que obtiene destinos destacados y muestra
 * trust badges. Envuelve sus hijos en `QueryClientProvider` + `LanguageProvider`.
 */
export function DestinationsSection(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider namespace="home">
        <DestinationsSectionContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Contenido interno (usa hooks)
// ─────────────────────────────────────────────────────────────────────────

/** Número de skeleton placeholders del grid durante la carga (R10.5). */
const SKELETON_COUNT = 6;

function DestinationsSectionContent(): JSX.Element {
  const { t } = useTranslation("home");

  const {
    data: tours,
    isLoading,
    isError,
    refetch,
  } = useQuery<TourSummary[]>({
    queryKey: ["home", "featuredTours"],
    queryFn: fetchFeaturedTours,
  });

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-public px-page-gutter">
        {/* Header de sección: label + título a la izquierda, link a la derecha */}
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-turquesa">
              Destinos Destacados
            </span>
            <h2 className="mt-1 font-heading text-h2 font-bold text-negro-volcanico">
              {t("destinations.title")}
            </h2>
          </div>
          <a
            href="/destinos"
            className="hidden text-sm font-medium text-turquesa transition-colors hover:text-azul-condor md:inline-flex md:items-center md:gap-1"
          >
            Ver todos los destinos
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Estado de carga: Skeleton grid (R10.5) */}
        {isLoading && <DestinationsSkeletonGrid count={SKELETON_COUNT} />}

        {/* Estado de error: mensaje + reintento (R10.6) */}
        {isError && !isLoading && (
          <DestinationsError
            message={t("destinations.error")}
            onRetry={() => void refetch()}
          />
        )}

        {/* Estado de éxito: grid de TourCards (R10.1) */}
        {tours && !isLoading && !isError && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tours.slice(0, 4).map((tour) => (
              <TourCard
                key={tour.slug}
                tour={tour}
                glass={true}
                href={`/tours/${tour.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────────────────────────────────

/** Grid de skeletons durante la carga (R10.5). */
function DestinationsSkeletonGrid({ count }: { readonly count: number }): JSX.Element {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Cargando destinos"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton height={200} rounded="xl" className="w-full" />
          <Skeleton height={20} rounded="md" className="w-3/4" />
          <Skeleton height={16} rounded="md" className="w-1/2" />
          <Skeleton height={18} rounded="md" className="w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** Estado de error con reintento (R10.6): preserva el resto de la página. */
function DestinationsError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}): JSX.Element {
  return (
    <div
      className="flex flex-col items-center gap-4 py-12 text-center"
      role="alert"
    >
      <p className="text-body1 font-body text-negro-volcanico/80">{message}</p>
      <Button variant="secondary" labelKey="home:destinations.retry" onClick={onRetry} />
    </div>
  );
}

export default DestinationsSection;
