/**
 * `DestinationsV2` — Destinos destacados de la Home v2 (`/home-v2`).
 *
 * Variante del `DestinationsSection` original:
 *   • Header con kicker "DESTINOS DESTACADOS" (i18n) + título + link "ver todos".
 *   • Grid 4 columnas de `TourCard` (reutiliza el componente global).
 *   • Skeleton grid alineado a `lg:grid-cols-4` (el original usa 3).
 *   • Reutiliza mock data hasta que exista `GET /home/page-data`.
 *
 * Isla React (`client:visible`): usa TanStack Query.
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
// Mock data (se reemplazará por GET /home/page-data)
// ─────────────────────────────────────────────────────────────────────────

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

async function fetchFeaturedTours(): Promise<TourSummary[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_FEATURED_TOURS;
}

// ─────────────────────────────────────────────────────────────────────────
// Query client
// ─────────────────────────────────────────────────────────────────────────

const queryClient = createQueryClient();

const SKELETON_COUNT = 4;

// ─────────────────────────────────────────────────────────────────────────
// Componente exportado
// ─────────────────────────────────────────────────────────────────────────

export function DestinationsV2(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider namespace="home">
        <DestinationsV2Content />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function DestinationsV2Content(): JSX.Element {
  const { t } = useTranslation("home");

  const {
    data: tours,
    isLoading,
    isError,
    refetch,
  } = useQuery<TourSummary[]>({
    queryKey: ["home-v2", "featuredTours"],
    queryFn: fetchFeaturedTours,
  });

  return (
    <section className="bg-surface-page py-16 lg:py-24">
      <div className="mx-auto max-w-public px-page-gutter">
        {/* Header: kicker + título a la izquierda, link a la derecha */}
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <span className="font-heading text-label uppercase tracking-wider text-turquesa">
              {t("destinations.kicker")}
            </span>
            <h2 className="mt-1 font-heading text-h2 font-bold text-negro-volcanico">
              {t("destinations.title")}
            </h2>
          </div>
          <a
            href="/discovery"
            className="hidden text-body2 font-medium text-turquesa transition-colors hover:text-azul-condor md:inline-flex md:items-center md:gap-1"
          >
            {t("destinations.viewAll")}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Carga */}
        {isLoading && <DestinationsSkeletonGrid count={SKELETON_COUNT} />}

        {/* Error */}
        {isError && !isLoading && (
          <DestinationsError
            message={t("destinations.error")}
            onRetry={() => void refetch()}
          />
        )}

        {/* Éxito */}
        {tours && !isLoading && !isError && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tours.slice(0, 4).map((tour) => (
              <TourCard key={tour.slug} tour={tour} glass={true} href={`/tours/${tour.slug}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────

function DestinationsSkeletonGrid({ count }: { readonly count: number }): JSX.Element {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Cargando destinos"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton height={280} rounded="xl" className="w-full" />
          <Skeleton height={20} rounded="md" className="w-3/4" />
          <Skeleton height={16} rounded="md" className="w-1/2" />
          <Skeleton height={18} rounded="md" className="w-1/3" />
        </div>
      ))}
    </div>
  );
}

function DestinationsError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center" role="alert">
      <p className="text-body1 font-body text-negro-volcanico/80">{message}</p>
      <Button variant="secondary" labelKey="home:destinations.retry" onClick={onRetry} />
    </div>
  );
}

export default DestinationsV2;
