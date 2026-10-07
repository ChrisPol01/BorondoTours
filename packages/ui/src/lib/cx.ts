/** Valor aceptado por `cx`: las entradas falsas se descartan (clases condicionales). */
export type ClassValue = string | false | null | undefined;

/**
 * Une clases de Tailwind descartando valores vacíos. Equivalente mínimo de `clsx`,
 * sin dependencia externa: la librería no necesita objetos ni arrays anidados.
 */
export function cx(...values: readonly ClassValue[]): string {
  return values.filter((value): value is string => typeof value === "string" && value.length > 0).join(" ");
}
