/**
 * `SearchWidgetV2` — Buscador glass del hero para la Home v2 (`/home-v2`).
 *
 * Variante del `SearchWidget` original con dos diferencias:
 *   • Todos los textos visibles se resuelven vía i18n (`t()`), usando las
 *     claves ya definidas en el namespace `home` (search.*). El original
 *     tiene strings hardcodeados; aquí se corrige.
 *   • Aislado en `landing-v2/` para comparación, sin tocar el original.
 *
 * Mantiene: liquid glass, iconos Lucide, botones +/- dorados, validación y
 * navegación a /discovery.
 *
 * TypeScript strict, sin `any`.
 */

import { useState, useCallback, type FormEvent, type JSX } from "react";
import { MapPin, Calendar, Users, Search, Plus, Minus } from "lucide-react";

import { useTranslation } from "../../lib/i18n/provider";
import { LanguageProvider } from "../../lib/i18n/provider";
import type { SearchCriteria } from "../../lib/types";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

const DESTINATION_MAX_LENGTH = 120;
const TRAVELERS_MIN = 1;
const TRAVELERS_MAX = 99;

// ─────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────

interface FieldErrors {
  destination: string | null;
  date: string | null;
  travelers: string | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function isDatePast(dateStr: string): boolean {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dateStr < todayStr;
}

function validateCriteria(
  criteria: SearchCriteria,
  t: (key: string) => string,
): FieldErrors {
  const errors: FieldErrors = { destination: null, date: null, travelers: null };
  if (criteria.destination.trim().length === 0) {
    errors.destination = t("home:search.destinationRequired");
  }
  if (criteria.date !== null && isDatePast(criteria.date)) {
    errors.date = t("home:search.dateInvalid");
  }
  if (
    criteria.travelers < TRAVELERS_MIN ||
    criteria.travelers > TRAVELERS_MAX ||
    !Number.isInteger(criteria.travelers)
  ) {
    errors.travelers = t("home:search.travelersInvalid");
  }
  return errors;
}

function buildDiscoveryUrl(criteria: SearchCriteria): string {
  const params = new URLSearchParams();
  params.set("q", criteria.destination.trim());
  if (criteria.date !== null) params.set("date", criteria.date);
  if (criteria.travelers !== 1) params.set("travelers", String(criteria.travelers));
  return `/discovery?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

function SearchWidgetV2Inner(): JSX.Element {
  const { t } = useTranslation("home");

  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [errors, setErrors] = useState<FieldErrors>({
    destination: null,
    date: null,
    travelers: null,
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const criteria: SearchCriteria = {
        destination,
        date: date.length > 0 ? date : null,
        travelers,
      };
      const validationErrors = validateCriteria(criteria, t);
      const hasErrors =
        validationErrors.destination !== null ||
        validationErrors.date !== null ||
        validationErrors.travelers !== null;
      if (hasErrors) {
        setErrors(validationErrors);
        return;
      }
      setErrors({ destination: null, date: null, travelers: null });
      window.location.href = buildDiscoveryUrl(criteria);
    },
    [destination, date, travelers, t],
  );

  const incrementTravelers = (): void => {
    setTravelers((prev) => Math.min(prev + 1, TRAVELERS_MAX));
  };

  const decrementTravelers = (): void => {
    setTravelers((prev) => Math.max(prev - 1, TRAVELERS_MIN));
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="glass-header mx-auto w-full max-w-5xl rounded-2xl px-4 py-3 md:rounded-full md:px-6 md:py-5"
    >
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0">
        {/* Campo Destino */}
        <div className="flex flex-1 items-center gap-3 px-3 py-2 md:border-r md:border-blanco-niebla/15">
          <MapPin className="h-5 w-5 flex-shrink-0 text-blanco-niebla/70" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="search-v2-destination" className="text-sm font-semibold text-blanco-niebla">
              {t("search.destinationPlaceholder")}
            </label>
            <input
              id="search-v2-destination"
              type="text"
              maxLength={DESTINATION_MAX_LENGTH}
              placeholder={t("search.destinationPlaceholder")}
              aria-label={t("search.destinationLabel")}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-invalid={errors.destination !== null}
              className="w-full rounded-md bg-blanco-niebla/15 px-2 py-1.5 text-sm text-blanco-niebla placeholder:text-blanco-niebla/30 backdrop-blur-sm focus:bg-blanco-niebla/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Campo Fecha */}
        <div className="flex flex-1 items-center gap-3 px-3 py-2 md:border-r md:border-blanco-niebla/15">
          <Calendar className="h-5 w-5 flex-shrink-0 text-blanco-niebla/70" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="search-v2-date" className="text-sm font-semibold text-blanco-niebla">
              {t("search.datesPlaceholder")}
            </label>
            <input
              id="search-v2-date"
              type="text"
              placeholder={t("search.datesPlaceholder")}
              aria-label={t("search.datesLabel")}
              value={date}
              onFocus={(e) => {
                e.currentTarget.type = "date";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={errors.date !== null}
              className="w-full rounded-md bg-blanco-niebla/15 px-2 py-1.5 text-sm text-blanco-niebla placeholder:text-blanco-niebla/30 backdrop-blur-sm focus:bg-blanco-niebla/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Campo Viajeros con +/- */}
        <div className="flex flex-1 items-center gap-3 px-3 py-2">
          <Users className="h-5 w-5 flex-shrink-0 text-blanco-niebla/70" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-blanco-niebla">
              {t("search.travelersLabel")}
            </span>
            <span className="text-xs text-blanco-niebla/40">{travelers}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={decrementTravelers}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-dorado text-negro-volcanico transition-colors hover:bg-verde hover:text-blanco-niebla"
              aria-label={t("search.travelersInvalid")}
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={incrementTravelers}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-dorado text-negro-volcanico transition-colors hover:bg-verde hover:text-blanco-niebla"
              aria-label={t("search.travelersLabel")}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Botón CTA */}
        <div className="flex-shrink-0 pl-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-dorado px-7 py-3.5 font-body text-sm font-semibold text-negro-volcanico shadow-[0_0_15px_rgba(253,184,19,0.4)] transition-all hover:bg-verde hover:text-blanco-niebla hover:shadow-[0_0_15px_rgba(121,193,66,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-dorado focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>{t("search.submit")}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Exportación
// ─────────────────────────────────────────────────────────────────────────

export function SearchWidgetV2(): JSX.Element {
  return (
    <LanguageProvider namespace="home">
      <SearchWidgetV2Inner />
    </LanguageProvider>
  );
}

export default SearchWidgetV2;
