/**
 * Paginación de listas (funciones puras, sin DOM). La vitrina de Promociones / Más vendidos
 * (home.ts) muestra 4 tarjetas por página en una grilla 2×2 y avanza de 4 en 4.
 */

/** Número de páginas de `n` elementos con `size` por página (mínimo 1, incluso con lista vacía). */
export function pageCount(n: number, size = 4): number {
  if (size <= 0) return 1;
  return Math.max(1, Math.ceil(n / size));
}

/**
 * Elementos de la página `page` (0-based), con `size` por página. `page` se recorta al rango
 * válido [0, pageCount - 1], así que nunca devuelve una página fuera de los límites.
 */
export function pageOf<T>(list: readonly T[], page: number, size = 4): readonly T[] {
  if (size <= 0) return list;
  const last = pageCount(list.length, size) - 1;
  const safe = Math.min(Math.max(0, Math.trunc(page)), last);
  const start = safe * size;
  return list.slice(start, start + size);
}
