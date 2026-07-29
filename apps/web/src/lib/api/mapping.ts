/**
 * Mapeo `snake_case` (API) ↔ `camelCase` (código) de la capa de datos.
 *
 * TypeScript strict, sin `any` (se opera sobre `unknown` con type guards).
 * Fuente: design.md §"Data Models" y la convención de `lib/types.ts`.
 *
 * El backend (Hono/Lambda) emite JSON en `snake_case`; el frontend trabaja en
 * `camelCase`. Esta conversión ocurre EXCLUSIVAMENTE aquí (capa de fetch),
 * nunca en los componentes. La transformación es puramente estructural: recorre
 * objetos y arrays de forma recursiva reescribiendo las claves, sin tocar los
 * valores primitivos.
 */

// ─────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────

/**
 * Determina si un valor es un objeto plano (`Record<string, unknown>`),
 * excluyendo `null`, arrays y otros tipos. Permite recorrer estructuras JSON
 * sin recurrir a `any`.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ─────────────────────────────────────────────────────────────────────────
// Conversión de claves
// ─────────────────────────────────────────────────────────────────────────

/**
 * Convierte una clave `snake_case` a `camelCase`.
 *
 * Ej.: `base_price_cop` → `basePriceCop`; `iva_exempt_available` →
 * `ivaExemptAvailable`; `page_size` → `pageSize`. Las claves que ya están en
 * `camelCase` (sin `_`) se devuelven sin cambios.
 */
export function snakeToCamelKey(key: string): string {
  return key.replace(/_+([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

/**
 * Recorre un valor JSON arbitrario y reescribe todas las claves de objeto a
 * `camelCase` de forma recursiva. Los arrays se mapean elemento a elemento y
 * los valores primitivos se conservan intactos.
 *
 * El resultado es `unknown`: quien invoca conoce la forma esperada (`T` en
 * `camelCase`, definida en `lib/types.ts`) y realiza la aserción en la frontera
 * de la capa de fetch. Así se mantiene el tipado fuerte sin `any`.
 */
export function camelizeKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => camelizeKeysDeep(item));
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      result[snakeToCamelKey(key)] = camelizeKeysDeep(nested);
    }
    return result;
  }

  return value;
}
