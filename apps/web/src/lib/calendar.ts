/**
 * Lógica del calendario semáforo del Tour Detail (R17.3, R17.4, R17.5).
 *
 * Funciones puras, TypeScript strict, sin `any`. Fuente: design.md §"Calendario"
 * y Requirement 17. Reutiliza `availabilityStatus` (R5) para derivar el estado
 * de color de cada fecha a partir de su `TourInstance`.
 *
 * Reglas de negocio cubiertas:
 *   - `selectDate` (R17.4/R17.5): la selección del calendario mantiene A LO SUMO
 *     una fecha. Una fecha en estado Verde/Amarillo reemplaza la selección
 *     previa; una fecha en estado Rojo/Gris se bloquea y conserva la previa.
 *   - `initialMonth` (R17.3): el calendario se posiciona en el primer mes
 *     (cronológicamente) que contiene una fecha Verde o Amarillo; si no existe
 *     ninguna, aplica un comportamiento por defecto determinista (el mes de la
 *     referencia "hoy").
 *
 * Determinismo: `initialMonth` recibe la referencia de "hoy" como parámetro
 * inyectable (con `new Date()` solo como valor por defecto), de modo que la
 * lógica no invoca `Date.now()` internamente y es completamente testeable.
 */

import { availabilityStatus } from "./availability";
import type { AvailabilityStatus, TourInstance } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// Selección de fecha (R17.4, R17.5)
// ─────────────────────────────────────────────────────────────────────────

/** Estados en los que una fecha es seleccionable (hay cupos y es ofrecida). */
const SELECTABLE_STATUSES: ReadonlySet<AvailabilityStatus> = new Set<AvailabilityStatus>([
  "green",
  "yellow",
]);

/**
 * Determina la nueva selección del calendario tras un intento de selección.
 *
 * @param current   Fecha seleccionada actualmente (ISO `yyyy-mm-dd`) o `null`.
 * @param candidate Fecha sobre la que el usuario intenta seleccionar.
 * @param status    Estado del semáforo de la fecha candidata (R5).
 * @returns
 *   - `candidate` cuando `status ∈ {green, yellow}` (reemplaza la previa, R17.4).
 *   - `current`  cuando `status ∈ {red, gray}` (bloquea y conserva la previa, R17.5).
 *
 * En todos los casos el resultado representa A LO SUMO una fecha seleccionada
 * (un único valor o `null`), garantizando la invariante del calendario.
 */
export function selectDate(
  current: string | null,
  candidate: string,
  status: AvailabilityStatus,
): string | null {
  // Verde/Amarillo → la candidata reemplaza a la previa (R17.4).
  if (SELECTABLE_STATUSES.has(status)) {
    return candidate;
  }
  // Rojo/Gris → selección impedida, se conserva la previa (R17.5).
  return current;
}

// ─────────────────────────────────────────────────────────────────────────
// Mes inicial del calendario (R17.3)
// ─────────────────────────────────────────────────────────────────────────

/** Componentes de una fecha de calendario (mes en base 1: 1 = enero). */
interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Parsea una fecha ISO `yyyy-mm-dd` en sus componentes de calendario sin
 * depender de la zona horaria del entorno. Devuelve `null` si el formato es
 * inválido o los componentes no forman una fecha real.
 */
function parseIsoDate(iso: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/** Compara dos fechas de calendario. Devuelve <0, 0 o >0 (orden cronológico). */
function compareCalendarDate(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

/** Extrae los componentes de calendario de un `Date` usando su hora local. */
function toCalendarDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/** Construye un `Date` local en el día 1 del mes indicado (mes en base 1). */
function firstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * Calcula el mes en el que debe posicionarse el calendario al cargar (R17.3).
 *
 * Recorre las instancias, deriva el estado del semáforo de cada una vía
 * `availabilityStatus` (una fecha es Verde/Amarillo solo si es ofrecida, no es
 * pasada respecto a `today` y tiene cupos), y devuelve el primer día del mes
 * de la fecha Verde/Amarillo más temprana. Si ninguna instancia es
 * seleccionable, devuelve el primer día del mes de `today` de forma
 * determinista.
 *
 * @param instances Instancias del tour (fecha + cupos + si es ofrecida).
 * @param today     Referencia de "hoy" inyectable; por defecto `new Date()`.
 *                  Se usa solo para determinar fechas pasadas y el mes por
 *                  defecto, de modo que la función es pura y determinista dada
 *                  una referencia fija.
 */
export function initialMonth(
  instances: readonly TourInstance[],
  today: Date = new Date(),
): Date {
  // Guarda defensiva: una referencia inválida degrada al mes actual real.
  const reference = Number.isNaN(today.getTime()) ? new Date() : today;
  const todayParts = toCalendarDate(reference);

  let earliest: CalendarDate | null = null;

  for (const instance of instances) {
    const parts = parseIsoDate(instance.date);
    if (parts === null) {
      continue;
    }

    const isPast = compareCalendarDate(parts, todayParts) < 0;
    const status = availabilityStatus({
      available: instance.available,
      total: instance.total,
      isPast,
      isOffered: instance.isOffered,
    });

    // Solo Verde/Amarillo posicionan el calendario (R17.3).
    if (status !== "green" && status !== "yellow") {
      continue;
    }

    if (earliest === null || compareCalendarDate(parts, earliest) < 0) {
      earliest = parts;
    }
  }

  if (earliest !== null) {
    return firstDayOfMonth(earliest.year, earliest.month);
  }

  // Sin fechas Verde/Amarillo → mes actual determinista (R17.3, default).
  return firstDayOfMonth(todayParts.year, todayParts.month);
}
