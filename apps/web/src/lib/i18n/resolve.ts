/**
 * Resolución de claves i18n con fallback determinista (R19.4, R19.5, R3.9, R7.5).
 *
 * Función pura, TypeScript strict, sin `any`. Fuente: design.md §"i18n (R19)" y
 * §"i18n — clave faltante", Property 9.
 *
 * Esta es la lógica central de traducción del Portal B2C: dada una clave con el
 * patrón `namespace:key`, resuelve su valor siguiendo un orden de precedencia
 * fijo y garantiza que NUNCA devuelve una cadena vacía (así el Button, el Footer
 * y cualquier texto muestran algo legible aunque falte la traducción).
 *
 * Orden de precedencia (el primero que produce un valor no vacío gana):
 *   1. Valor de la clave en el IDIOMA ACTIVO (R19.4 punto de partida).
 *   2. Valor de la clave en el idioma de RESPALDO `es` (R19.4).
 *   3. La CLAVE LITERAL solicitada, y se registra un log de desarrollo (R19.5).
 *
 * Se separa de la configuración de i18next (`lib/i18n/index.ts`) para poder
 * probarse de forma aislada (property-based testing, Property 9).
 */

// ─────────────────────────────────────────────────────────────────────────
// Tipos del sistema i18n
// ─────────────────────────────────────────────────────────────────────────

/**
 * Idiomas soportados por el Portal. Fase 1 sirve contenido en `es`; `en` se deja
 * preparado en la estructura pero sin contenido (design.md §"Fuera de alcance").
 */
export type Language = "es" | "en";

/** Idioma de respaldo determinista para toda resolución (R19.4). */
export const FALLBACK_LANGUAGE: Language = "es";

/**
 * Namespaces por dominio, alineados con la configuración de i18next
 * (design.md §"i18n"): claves con el patrón `namespace:key`.
 */
export type Namespace =
  | "common"
  | "nav"
  | "footer"
  | "home"
  | "checkout"
  | "discovery"
  | "detail";

/** Entradas `key → texto traducido` dentro de un namespace. */
export type NamespaceEntries = Readonly<Record<string, string>>;

/** Catálogo de un idioma: mapa `namespace → entradas`. */
export type LanguageCatalog = Partial<Readonly<Record<Namespace, NamespaceEntries>>>;

/**
 * Colección de catálogos indexados por idioma. Forma consistente con los
 * recursos de i18next (`{ [lng]: { [namespace]: { [key]: value } } }`).
 */
export type Catalogs = Partial<Readonly<Record<Language, LanguageCatalog>>>;

// ─────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────

/** Separador de namespace en las claves i18next (`namespace:key`). */
const NAMESPACE_SEPARATOR = ":";

/**
 * Busca el valor de `namespace:subKey` en el catálogo de un idioma concreto.
 *
 * Devuelve el texto SOLO si existe y es una cadena NO vacía; en cualquier otro
 * caso (idioma/namespace/clave ausentes, o valor vacío) devuelve `undefined`
 * para que la resolución continúe con el siguiente nivel de fallback. Tratar la
 * cadena vacía como "ausente" es lo que garantiza que `resolve` nunca propague
 * un valor vacío desde el catálogo.
 */
function lookup(
  catalogs: Catalogs,
  lng: Language,
  namespace: string,
  subKey: string,
): string | undefined {
  const languageCatalog = catalogs[lng];
  if (languageCatalog === undefined) {
    return undefined;
  }

  // El namespace parseado es una cadena arbitraria (puede no ser un `Namespace`
  // válido); se accede de forma segura sin `any`.
  const entries = (languageCatalog as Readonly<Record<string, NamespaceEntries | undefined>>)[
    namespace
  ];
  if (entries === undefined) {
    return undefined;
  }

  const value = entries[subKey];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return undefined;
}

/**
 * Registra un log de desarrollo cuando una clave no existe ni en el idioma
 * activo ni en el de respaldo (R19.5). Solo en entornos de desarrollo para no
 * ruido en producción; se apoya en `import.meta.env.DEV` (Vite/Astro).
 */
function warnMissingKey(key: string, activeLng: Language): void {
  if (import.meta.env.DEV) {
    // Log de desarrollo requerido por R19.5 (`console.warn` permitido por la config de lint).
    console.warn(
      `[i18n] Clave sin traducción en "${activeLng}" ni en respaldo "${FALLBACK_LANGUAGE}": "${key}". Se muestra la clave literal.`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────

/**
 * Resuelve una clave i18n con fallback determinista (Property 9).
 *
 * @param key       Clave con el patrón `namespace:key` (p. ej. `"nav:home"`).
 * @param activeLng Idioma activo en el que se intenta resolver primero.
 * @param catalogs  Colección de catálogos por idioma.
 * @returns El valor del idioma activo si existe; en su defecto el del idioma de
 *          respaldo `es`; en su defecto la clave literal. Nunca cadena vacía.
 */
export function resolve(key: string, activeLng: Language, catalogs: Catalogs): string {
  const separatorIndex = key.indexOf(NAMESPACE_SEPARATOR);

  // Clave mal formada (sin namespace, o sin parte de clave tras `:`): no es
  // resoluble, se devuelve la clave literal y se registra el faltante (R19.5).
  if (separatorIndex <= 0 || separatorIndex === key.length - 1) {
    warnMissingKey(key, activeLng);
    return key;
  }

  const namespace = key.slice(0, separatorIndex);
  const subKey = key.slice(separatorIndex + 1);

  // 1. Idioma activo (R19.4 — punto de partida).
  const active = lookup(catalogs, activeLng, namespace, subKey);
  if (active !== undefined) {
    return active;
  }

  // 2. Idioma de respaldo `es` (R19.4).
  const fallback = lookup(catalogs, FALLBACK_LANGUAGE, namespace, subKey);
  if (fallback !== undefined) {
    return fallback;
  }

  // 3. Clave literal + log de desarrollo (R19.5, R3.9, R7.5).
  warnMissingKey(key, activeLng);
  return key;
}
