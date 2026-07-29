/**
 * `AvailabilityCalendar` — island `client:visible` para el Tour Detail.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades (R17)
 * ─────────────────────────────────────────────────────────────────────────
 *   • Colores del semáforo por token vía `availabilityStatus` (R17.1, R17.2).
 *   • Posiciona en `initialMonth` al cargar (R17.3).
 *   • Selección con `selectDate`: green/yellow reemplaza; red/gray bloquea e
 *     indica visualmente (R17.4, R17.5).
 *   • 2 meses ≥1024px / 1 mes <1024px (R17.6, R17.7).
 *   • `aria-label` por fecha con cupos entero ≥0 (R17.8).
 *   • Al seleccionar fecha con cupos, dispara `onDateSelect` que actualiza el
 *     precio del CTA ≤1s (R17.9).
 *   • Si falla el precio, conserva el previo e indica error (R17.10).
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { DayPicker } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";

import { availabilityStatus } from "../../lib/availability";
import { initialMonth, selectDate } from "../../lib/calendar";
import type { AvailabilityStatus, TourInstance } from "../../lib/types";
import { useTranslation } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface AvailabilityCalendarProps {
  /** Instancias del tour con disponibilidad por fecha. */
  readonly instances: TourInstance[];
  /**
   * Callback disparado al seleccionar una fecha con cupos (green/yellow).
   * El componente padre actualiza el precio del CTA (R17.9).
   */
  readonly onDateSelect?: (date: string, instance: TourInstance) => void;
  /** Indica si hubo un error al obtener el precio (R17.10). */
  readonly priceError?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────

/** Información precalculada de disponibilidad por fecha. */
interface DateInfo {
  status: AvailabilityStatus;
  available: number;
  instance: TourInstance;
}

// ─────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────

/** Convierte un Date a una cadena ISO `yyyy-mm-dd` en hora local. */
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parsea un ISO `yyyy-mm-dd` a un Date local (medianoche). */
function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formatea una fecha en español: "1 de enero de 2025". */
function formatDateEs(date: Date): string {
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Hook: media query para responsivo (≥1024px → 2 meses)
// ─────────────────────────────────────────────────────────────────────────

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent): void => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

// ─────────────────────────────────────────────────────────────────────────
// Hook: construye mapa de disponibilidad
// ─────────────────────────────────────────────────────────────────────────

function useDateInfoMap(instances: TourInstance[]): Map<string, DateInfo> {
  return useMemo(() => {
    const today = new Date();
    const todayIso = toIsoDate(today);
    const map = new Map<string, DateInfo>();

    for (const instance of instances) {
      const isPast = instance.date < todayIso;
      const status = availabilityStatus({
        available: instance.available,
        total: instance.total,
        isPast,
        isOffered: instance.isOffered,
      });
      // Cupos disponibles: integer ≥0 (R17.8)
      const available = Math.max(0, Math.floor(instance.available));
      map.set(instance.date, { status, available, instance });
    }

    return map;
  }, [instances]);
}

// ─────────────────────────────────────────────────────────────────────────
// Colores del semáforo → clases CSS con tokens
// ─────────────────────────────────────────────────────────────────────────

const STATUS_BG_CLASSES: Record<AvailabilityStatus, string> = {
  green: "bg-available",
  yellow: "bg-limited",
  red: "bg-sold-out",
  gray: "bg-unavailable",
};

const STATUS_TEXT_CLASSES: Record<AvailabilityStatus, string> = {
  green: "text-text-primary",
  yellow: "text-text-primary",
  red: "text-on-strong",
  gray: "text-on-strong",
};

// ─────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────

export function AvailabilityCalendar({
  instances,
  onDateSelect,
  priceError = false,
}: AvailabilityCalendarProps): JSX.Element {
  const { t } = useTranslation("detail");
  const isDesktop = useIsDesktop();
  const dateInfoMap = useDateInfoMap(instances);

  // Estado de selección: máximo una fecha (R17.4/R17.5)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Estado para indicar bloqueo visual (intento de seleccionar red/gray)
  const [blockedAttempt, setBlockedAttempt] = useState(false);

  // Mes inicial (R17.3)
  const startMonth = useMemo(() => initialMonth(instances), [instances]);

  // Manejar clic en un día
  const handleDayClick = useCallback(
    (day: Date): void => {
      const iso = toIsoDate(day);
      const info = dateInfoMap.get(iso);
      if (!info) return;

      const newSelection = selectDate(selectedDate, iso, info.status);

      if (newSelection === iso && newSelection !== selectedDate) {
        // Verde/amarillo: selección aceptada (R17.4, R17.9)
        setSelectedDate(newSelection);
        setBlockedAttempt(false);
        onDateSelect?.(iso, info.instance);
      } else if (newSelection !== iso) {
        // Rojo/gris: bloqueo, indicar visualmente (R17.5)
        setBlockedAttempt(true);
        setTimeout(() => setBlockedAttempt(false), 1500);
      }
    },
    [dateInfoMap, selectedDate, onDateSelect],
  );

  // Custom DayButton que aplica el semáforo con aria-label (R17.8)
  const CustomDayButton = useCallback(
    (props: DayButtonProps): JSX.Element => {
      const { day, modifiers: _modifiers, ...buttonProps } = props;
      const date = day.date;
      const iso = toIsoDate(date);
      const info = dateInfoMap.get(iso);

      // Día sin instancia: render minimal
      if (!info) {
        return (
          <button
            {...buttonProps}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-body text-negro-volcanico/30"
            disabled
            aria-disabled="true"
          >
            {date.getDate()}
          </button>
        );
      }

      const isSelected = selectedDate === iso;
      const bgClass = STATUS_BG_CLASSES[info.status];
      const textClass = STATUS_TEXT_CLASSES[info.status];
      const isSelectable = info.status === "green" || info.status === "yellow";

      // aria-label con fecha formateada + cupos (R17.8)
      const ariaLabel = t("calendar.dateAriaLabel")
        .replace("{date}", formatDateEs(date))
        .replace("{slots}", String(info.available));

      return (
        <button
          type="button"
          onClick={() => handleDayClick(date)}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-body transition-all",
            bgClass,
            textClass,
            isSelected ? "ring-2 ring-negro-volcanico ring-offset-1" : "",
            isSelectable
              ? "cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-turquesa"
              : "cursor-not-allowed opacity-70",
          ].join(" ")}
          aria-label={ariaLabel}
          aria-selected={isSelected}
          aria-disabled={!isSelectable}
        >
          {date.getDate()}
        </button>
      );
    },
    [dateInfoMap, selectedDate, handleDayClick, t],
  );

  // Fechas seleccionadas para DayPicker (visual highlighting)
  const selected = selectedDate ? parseIsoDate(selectedDate) : undefined;

  return (
    <div
      className="flex flex-col gap-3"
      role="group"
      aria-label={t("calendar.label")}
    >
      {/* Título del calendario */}
      <h3 className="font-heading text-h4 font-semibold text-negro-volcanico">
        {t("calendar.select")}
      </h3>

      {/* DayPicker con colores de semáforo */}
      <div className="overflow-x-auto">
        <DayPicker
          mode="single"
          selected={selected}
          defaultMonth={startMonth}
          numberOfMonths={isDesktop ? 2 : 1}
          onDayClick={handleDayClick}
          components={{
            DayButton: CustomDayButton,
          }}
          classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "flex flex-col gap-2",
            month_caption: "flex justify-center items-center py-2",
            caption_label: "font-heading text-sm font-semibold text-negro-volcanico",
            nav: "flex items-center gap-1",
            button_next:
              "h-7 w-7 flex items-center justify-center rounded-full bg-transparent hover:bg-arena transition-colors text-negro-volcanico",
            button_previous:
              "h-7 w-7 flex items-center justify-center rounded-full bg-transparent hover:bg-arena transition-colors text-negro-volcanico",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday:
              "w-9 text-center text-xs font-body text-negro-volcanico/60 font-medium",
            week: "flex w-full mt-1",
            day: "w-9 h-9 flex items-center justify-center p-0",
          }}
        />
      </div>

      {/* Indicación de bloqueo (R17.5) */}
      {blockedAttempt && (
        <p
          className="text-sm font-body text-sold-out"
          role="alert"
          aria-live="assertive"
        >
          {t("calendar.blocked")}
        </p>
      )}

      {/* Error de precio (R17.10) */}
      {priceError && (
        <p
          className="text-sm font-body text-sold-out"
          role="alert"
          aria-live="polite"
        >
          {t("calendar.priceError")}
        </p>
      )}
    </div>
  );
}
