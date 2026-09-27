/**
 * Modelos de datos y tipos de API del Portal B2C (Fase 1).
 *
 * TypeScript strict, sin `any`. Fuente: design.md §"Data Models".
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Convención de mapeo snake_case (API) ↔ camelCase (código)
 * ─────────────────────────────────────────────────────────────────────────
 * El contrato con el backend (Hono/Lambda) usa `snake_case` en todas las
 * claves JSON; el frontend trabaja en `camelCase`. La conversión ocurre en la
 * capa de fetch (ver `lib` de datos / tarea 7.3), NUNCA en los componentes.
 *
 * Las tablas de correspondencia por tipo están documentadas junto a cada
 * interfaz mediante la anotación `@apiField`. Regla general:
 *   - snake → camel:  `base_price_cop`        → `basePriceCop`
 *   - snake → camel:  `iva_exempt_available`  → `ivaExemptAvailable`
 *   - snake → camel:  `operator_name`         → `operatorName`
 * Las uniones de dominio (`Region`, `DurationBucket`, `Difficulty`) conservan
 * los mismos literales en API y en código (son enums PostgreSQL en snake_case),
 * por lo que no requieren transformación de valor.
 */

// ─────────────────────────────────────────────────────────────────────────
// Envoltorio estándar de API — { data, error, meta }
// ─────────────────────────────────────────────────────────────────────────

/**
 * Respuesta estándar del backend. Toda respuesta HTTP tiene esta forma.
 * @apiField data   ↔ data   (payload; `null` en error o vacío)
 * @apiField error  ↔ error  (`null` cuando la operación fue exitosa)
 * @apiField meta   ↔ meta   (paginación; `null` cuando no aplica)
 */
export interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta: { page?: number; pageSize?: number; total?: number } | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Uniones de dominio (enums PostgreSQL — mismos literales en API y código)
// ─────────────────────────────────────────────────────────────────────────

/** Regiones turísticas de Colombia (7). Filtro de Destino (R13.1). */
export type Region =
  | "eje_cafetero"
  | "llanos"
  | "amazonia"
  | "costa_caribe"
  | "costa_pacifico"
  | "andes"
  | "bogota_dc";

/** Rangos de duración para el filtro de catálogo (4) (R13.2). */
export type DurationBucket =
  | "half_day"
  | "one_day"
  | "two_three_days"
  | "more_than_three";

/** Nivel de dificultad del tour (4) (R13.4). */
export type Difficulty = "familiar" | "moderado" | "aventurero" | "extremo";

// ─────────────────────────────────────────────────────────────────────────
// Tour — resumen (grids/carruseles/mapa) y detalle
// ─────────────────────────────────────────────────────────────────────────

/**
 * Resumen de tour usado en grids, carruseles y marcadores de mapa (R11.4).
 * @apiField slug                ↔ slug
 * @apiField name                ↔ name
 * @apiField operatorName        ↔ operator_name
 * @apiField region              ↔ region
 * @apiField durationLabel       ↔ duration_label
 * @apiField basePriceCop        ↔ base_price_cop
 * @apiField photoUrl            ↔ photo_url
 * @apiField photoAlt            ↔ photo_alt
 * @apiField coordinates         ↔ coordinates  ([lng, lat]) (R14.2)
 * @apiField difficulty          ↔ difficulty
 * @apiField ivaExemptAvailable  ↔ iva_exempt_available
 */
export interface TourSummary {
  slug: string;
  name: string;
  operatorName: string;
  region: Region;
  /** Etiqueta de duración ya formateada o cruda para `format.ts`. */
  durationLabel: string;
  basePriceCop: number;
  photoUrl: string;
  photoAlt: string;
  /** `[lng, lat]`; `null` si el tour no tiene coordenadas válidas (R14.2). */
  coordinates: [number, number] | null;
  difficulty: Difficulty;
  ivaExemptAvailable: boolean;
  /** Rating promedio del tour (1-5). Opcional, para cards. */
  rating?: number;
  /** Número de reviews. Opcional, para cards. */
  reviewCount?: number;
}

/**
 * Detalle completo de tour para la vista de detalle (R15, R16).
 * @apiField slug                ↔ slug
 * @apiField name                ↔ name
 * @apiField region              ↔ region
 * @apiField destination         ↔ destination
 * @apiField durationDays        ↔ duration_days
 * @apiField durationNights      ↔ duration_nights
 * @apiField durationHours       ↔ duration_hours
 * @apiField basePriceCop        ↔ base_price_cop
 * @apiField operatorName        ↔ operator_name
 * @apiField difficulty          ↔ difficulty
 * @apiField ivaExemptAvailable  ↔ iva_exempt_available
 * @apiField gallery             ↔ gallery         (0..20)
 * @apiField longDescriptionHtml ↔ long_description_html (sin sanitizar)
 * @apiField includes            ↔ includes
 * @apiField notIncludes         ↔ not_includes
 * @apiField whatToBring         ↔ what_to_bring
 * @apiField addOns              ↔ add_ons         (0..50)
 * @apiField coordinates         ↔ coordinates
 */
export interface TourDetail {
  slug: string;
  name: string;
  region: Region;
  destination: string;
  durationDays: number | null;
  durationNights: number | null;
  durationHours: number | null;
  basePriceCop: number;
  operatorName: string;
  difficulty: Difficulty;
  ivaExemptAvailable: boolean;
  /** 0..20 fotos (R15.1). */
  gallery: GalleryPhoto[];
  /** Hasta 20.000 chars, sin sanitizar; se renderiza solo vía `SafeHtml` (R16.1). */
  longDescriptionHtml: string;
  includes: string[] | null;
  notIncludes: string[] | null;
  whatToBring: string[] | null;
  /** 0..50 add-ons (R16.5). */
  addOns: AddOn[];
  coordinates: [number, number];
}

/**
 * Foto de la galería del tour.
 * @apiField url         ↔ url
 * @apiField alt         ↔ alt
 * @apiField decorative  ↔ decorative
 */
export interface GalleryPhoto {
  url: string;
  alt: string;
  decorative: boolean;
}

/**
 * Servicio adicional opcional del tour (R16.5).
 * @apiField id                  ↔ id
 * @apiField name                ↔ name              (<=100 chars)
 * @apiField shortDescription    ↔ short_description (<=300 chars)
 * @apiField additionalPriceCop  ↔ additional_price_cop (0.01 .. 999_999_999.99)
 */
export interface AddOn {
  id: string;
  name: string;
  shortDescription: string;
  additionalPriceCop: number;
}

/**
 * Disponibilidad y precio de una fecha concreta del tour (R17.2).
 * @apiField date            ↔ date            (ISO yyyy-mm-dd)
 * @apiField available       ↔ available
 * @apiField total           ↔ total
 * @apiField currentPriceCop  ↔ current_price_cop
 * @apiField isOffered       ↔ is_offered
 */
export interface TourInstance {
  date: string;
  available: number;
  total: number;
  currentPriceCop: number;
  isOffered: boolean;
}

/**
 * Payload compuesto de `GET /tours/:slug/page-data`.
 * @apiField tour       ↔ tour
 * @apiField instances  ↔ instances
 * @apiField nearby     ↔ nearby   (semilla; el filtrado 50km se hace en cliente)
 */
export interface TourPageData {
  tour: TourDetail;
  instances: TourInstance[];
  nearby: TourSummary[];
}

// ─────────────────────────────────────────────────────────────────────────
// Estado del catálogo (Discovery) — la URL es la fuente de verdad
// ─────────────────────────────────────────────────────────────────────────

/**
 * Estado de exploración del catálogo, serializable a/desde `URLSearchParams`
 * (R12, R13, R14). Ver `lib/queryParams.ts`.
 */
export interface CatalogState {
  /** Texto de búsqueda normalizado (trim) (R12.3). */
  q: string;
  /** Regiones seleccionadas (multi) (R13.1). */
  regions: Region[];
  /** Rangos de duración seleccionados (multi) (R13.2). */
  durations: DurationBucket[];
  /** Precio mínimo, 0..999_999_999 (R13.3). */
  priceMin: number;
  /** Precio máximo, priceMin <= priceMax (R13.3). */
  priceMax: number;
  /** Dificultades seleccionadas (multi) (R13.4). */
  difficulties: Difficulty[];
  /** Solo tours con IVA exento (pasaporte) (R13.5). */
  passportOnly: boolean;
  /** Orden; default "popular" (R13.9). */
  sort: "popular" | "price_asc" | "price_desc" | "recent";
  /**
   * Cursor de paginación keyset (cursor-based). `null` = primera página.
   * Es un token opaco devuelto por el backend en `meta.nextCursor`; nunca se
   * interpreta ni se calcula en el cliente. Sustituye al antiguo `page` numérico
   * para lograr paginación O(1) en la BD (ADR-011, TourSearchSchema.cursor).
   * La pila de cursores para navegar "Anterior" vive en memoria, no en la URL.
   */
  cursor: string | null;
  /** Vista activa; default "list" (R14.1). */
  view: "list" | "map";
}

// ─────────────────────────────────────────────────────────────────────────
// Buscador del hero (Landing)
// ─────────────────────────────────────────────────────────────────────────

/** Criterios del `SearchWidget` del hero (R9.2). */
export interface SearchCriteria {
  /** Destino, 0..120 chars (R9.2). */
  destination: string;
  /** Fecha ISO; no puede ser pasada al enviar (R9.4). `null` si no se eligió. */
  date: string | null;
  /** Viajeros, 1..99, inicial 1 (R9.2). */
  travelers: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Semáforo de disponibilidad (función pura `lib/availability.ts`, R5)
// ─────────────────────────────────────────────────────────────────────────

/** Estado del semáforo de disponibilidad de una fecha (R5). */
export type AvailabilityStatus = "green" | "yellow" | "red" | "gray";

/**
 * Entrada de la función pura `availabilityStatus` (R5).
 * Nota: es un modelo de cálculo del frontend (no proviene tal cual de la API);
 * se deriva de `TourInstance` en la capa de presentación.
 */
export interface DateAvailability {
  /** Cupos disponibles. */
  available: number;
  /** Capacidad total. */
  total: number;
  /** La fecha ya pasó. */
  isPast: boolean;
  /** El tour se ofrece esa fecha. */
  isOffered: boolean;
}
