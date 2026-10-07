/**
 * `SearchWidget` — Buscador glass del hero (R9.1–R9.7).
 *
 * Diseño fiel al mockup etapa 1:
 *   • Mismo liquid glass que el navbar (transparente, blur, saturate)
 *   • Iconos Lucide (MapPin, Calendar, Users, Search)
 *   • Botones +/- dorados para viajeros
 *   • Botón "Buscar aventura" con glow shadow dorado/verde
 *   • Form más grande y legible
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
  if (criteria.travelers < TRAVELERS_MIN || criteria.travelers > TRAVELERS_MAX || !Number.isInteger(criteria.travelers)) {
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

const FIELD_CLASS =
  "w-full rounded-md bg-surface-card/15 px-2 py-1.5 text-sm text-on-strong placeholder:text-on-strong/60 backdrop-blur-sm focus:bg-surface-card/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus";
const ERROR_CLASS = "text-xs font-semibold text-dorado";
const STEP_CLASS =
  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-dorado text-on-action transition-colors hover:bg-verde focus:outline-none focus-visible:ring-2 focus-visible:ring-focus";

function SearchWidgetInner(): JSX.Element {
  const { t } = useTranslation("home");

  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({ destination: null, date: null, travelers: null });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const criteria: SearchCriteria = { destination, date: date.length > 0 ? date : null, travelers };
      const validationErrors = validateCriteria(criteria, t);
      const hasErrors = validationErrors.destination !== null || validationErrors.date !== null || validationErrors.travelers !== null;
      if (hasErrors) { setErrors(validationErrors); return; }
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
      aria-label={t("home:search.submit")}
      className="glass-header mx-auto w-full max-w-5xl rounded-2xl px-4 py-3 md:rounded-full md:px-6 md:py-5"
    >
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-start md:gap-0">
        {/* Campo Destino */}
        <div className="flex flex-1 items-start gap-3 px-3 py-2 md:border-r md:border-border-subtle">
          <MapPin className="mt-7 h-5 w-5 flex-shrink-0 text-on-strong/70" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="search-destination" className="text-sm font-semibold text-on-strong">
              {t("home:search.destinationLabel")}
            </label>
            <input
              id="search-destination"
              type="text"
              maxLength={DESTINATION_MAX_LENGTH}
              placeholder={t("home:search.destinationPlaceholder")}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-invalid={errors.destination !== null}
              aria-describedby={errors.destination !== null ? "search-destination-error" : undefined}
              className={FIELD_CLASS}
            />
            {errors.destination !== null && (
              <p id="search-destination-error" role="alert" className={ERROR_CLASS}>{errors.destination}</p>
            )}
          </div>
        </div>
        {/* Campo Fecha */}
        <div className="flex flex-1 items-start gap-3 px-3 py-2 md:border-r md:border-border-subtle">
          <Calendar className="mt-7 h-5 w-5 flex-shrink-0 text-on-strong/70" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="search-date" className="text-sm font-semibold text-on-strong">
              {t("home:search.datesLabel")}
            </label>
            <input
              id="search-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={errors.date !== null}
              aria-describedby={errors.date !== null ? "search-date-error" : undefined}
              className={FIELD_CLASS}
            />
            {errors.date !== null && (
              <p id="search-date-error" role="alert" className={ERROR_CLASS}>{errors.date}</p>
            )}
          </div>
        </div>
        {/* Campo Viajeros: número editable con botones +/- */}
        <div className="flex flex-1 items-start gap-3 px-3 py-2">
          <Users className="mt-7 h-5 w-5 flex-shrink-0 text-on-strong/70" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="search-travelers" className="text-sm font-semibold text-on-strong">
              {t("home:search.travelersLabel")}
            </label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={decrementTravelers} className={STEP_CLASS} aria-label={t("home:search.travelersLess")}>
                <Minus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              </button>
              <input
                id="search-travelers"
                type="number"
                inputMode="numeric"
                value={travelers}
                onChange={(e) => setTravelers(Number.parseInt(e.target.value, 10) || 0)}
                aria-invalid={errors.travelers !== null}
                aria-describedby={errors.travelers !== null ? "search-travelers-error" : undefined}
                className={`${FIELD_CLASS} w-16 text-center`}
              />
              <button type="button" onClick={incrementTravelers} className={STEP_CLASS} aria-label={t("home:search.travelersMore")}>
                <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              </button>
            </div>
            {errors.travelers !== null && (
              <p id="search-travelers-error" role="alert" className={ERROR_CLASS}>{errors.travelers}</p>
            )}
          </div>
        </div>
        {/* CTA: texto Negro Volcánico también en hover (blanco sobre Verde no cumple WCAG AA) */}
        <div className="flex-shrink-0 self-center pl-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dorado px-7 py-3.5 font-body text-sm font-semibold text-on-action shadow-[0_0_15px_rgba(253,184,19,0.4)] transition-all hover:bg-verde hover:shadow-[0_0_15px_rgba(121,193,66,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>{t("home:search.submit")}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Exportación
// ─────────────────────────────────────────────────────────────────────────

export function SearchWidget(): JSX.Element {
  return (
    <LanguageProvider namespace="home">
      <SearchWidgetInner />
    </LanguageProvider>
  );
}

export default SearchWidget;
