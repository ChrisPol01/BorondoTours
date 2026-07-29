/**
 * Formateo de presentación del Portal B2C (Fase 1).
 *
 * Funciones puras, TypeScript strict, sin `any`. Fuente: design.md §"Formateo
 * (R15.2)" y Requirement 15.2.
 *
 * Reglas de negocio (R15.2):
 *   - Precio: "Desde $X COP por persona" con separador de miles = punto (`.`),
 *     sin decimales y SIN depender del locale del entorno (agrupación manual;
 *     no se usa `toLocaleString`, cuyo separador varía según el entorno).
 *   - Duración: "N días / M noches" o "N horas", seleccionando el formato según
 *     qué campos están presentes; nunca se emiten números negativos ni campos
 *     nulos en la salida.
 */

// ─────────────────────────────────────────────────────────────────────────
// Precio en COP (R15.2)
// ─────────────────────────────────────────────────────────────────────────

const PRICE_PREFIX = "Desde $";
const PRICE_SUFFIX = " COP por persona";

/**
 * Agrupa un entero no negativo en grupos de tres dígitos separados por punto,
 * de forma determinista e independiente del locale del entorno.
 *
 * Ej.: 1250000 → "1.250.000"; 0 → "0"; 999 → "999".
 */
function groupThousandsWithDot(integer: number): string {
  const digits = String(integer);
  // Inserta un punto en cada frontera de grupo de miles (de derecha a izquierda).
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formatea un precio en pesos colombianos: `"Desde $1.250.000 COP por persona"`.
 *
 * Normalización defensiva: valores no finitos (NaN/Infinity) o negativos se
 * tratan como 0; los decimales se redondean al entero más cercano (sin
 * decimales en la salida, R15.2).
 */
export function formatPriceCop(value: number): string {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${PRICE_PREFIX}${groupThousandsWithDot(normalized)}${PRICE_SUFFIX}`;
}

/**
 * Formatea el precio adicional de un add-on: `"+$25.000 COP"`.
 *
 * Misma normalización defensiva que `formatPriceCop` (no finitos → 0,
 * negativos → 0, decimales → redondeados al entero más cercano).
 * Usado por `TourAddOns` para mostrar el precio adicional de cada complemento (R16.5).
 */
export function formatAddonPriceCop(value: number): string {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `+$${groupThousandsWithDot(normalized)} COP`;
}

// ─────────────────────────────────────────────────────────────────────────
// Duración del tour (R15.2)
// ─────────────────────────────────────────────────────────────────────────

/** Campos de duración de un tour; cualquiera puede faltar o ser nulo. */
export interface DurationParts {
  days?: number | null;
  nights?: number | null;
  hours?: number | null;
}

/**
 * Normaliza un contador de duración: descarta nulos, no finitos y valores no
 * positivos (nunca se emiten números negativos ni ceros en la salida, R15.2).
 * Trunca decimales hacia abajo para trabajar solo con enteros.
 */
function normalizeCount(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  const whole = Math.floor(value);
  return whole > 0 ? whole : null;
}

/** Devuelve el sustantivo en singular o plural según la cantidad. */
function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Formatea la duración de un tour según los campos presentes:
 *   - "N días / M noches"  cuando hay días y/o noches (formato multi-día).
 *   - "N horas"            cuando la duración se expresa en horas y no hay
 *                          días ni noches (experiencia de medio día).
 *
 * Si solo hay uno de días/noches, se emite únicamente esa parte
 * (p. ej. "1 día"). Si ningún campo es válido, devuelve cadena vacía.
 * El formato de días/noches tiene precedencia sobre el de horas (R15.2).
 */
export function formatDuration(d: DurationParts): string {
  const days = normalizeCount(d.days);
  const nights = normalizeCount(d.nights);
  const hours = normalizeCount(d.hours);

  const parts: string[] = [];
  if (days !== null) {
    parts.push(pluralize(days, "día", "días"));
  }
  if (nights !== null) {
    parts.push(pluralize(nights, "noche", "noches"));
  }
  if (parts.length > 0) {
    return parts.join(" / ");
  }

  if (hours !== null) {
    return pluralize(hours, "hora", "horas");
  }

  return "";
}
