/**
 * Confianza en el Home: reseñas de Google.
 *
 * Las reseñas se muestran únicamente si vienen del perfil de Google de la agencia
 * (Ley 1480: la publicidad debe ser veraz y comprobable).
 */

export interface GoogleReview {
  /** Nombre tal como aparece en Google; en pantalla se muestra solo nombre + inicial. */
  readonly author: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly text: string;
  /** Fecha de publicación (AAAA-MM-DD). */
  readonly date: string;
  /** Enlace a la reseña en Google (opcional). */
  readonly url?: string;
}

export interface GoogleReviewsSource {
  /** Perfil de la empresa en Google Maps. */
  readonly profileUrl: string;
  /** Enlace "Escribir una reseña" (https://search.google.com/local/writereview?placeid=…). Vacío = no se muestra. */
  readonly writeReviewUrl: string;
  /** Calificación promedio y total publicados por Google; null mientras no haya reseñas. */
  readonly rating: number | null;
  readonly total: number;
  readonly reviews: readonly GoogleReview[];
}

/**
 * Fuente de las reseñas. Se llena a mano (o con un job de build contra Google Places API) cuando
 * existan reseñas reales; mientras esté vacía, el Home muestra el estado "pronto" sin cifras.
 */
export const GOOGLE_REVIEWS: GoogleReviewsSource = {
  profileUrl: "https://www.google.com/maps/search/?api=1&query=BorondoTours%20Cali%20Colombia",
  writeReviewUrl: "",
  rating: null,
  total: 0,
  reviews: [],
};

/** "María Fernanda Gómez" → "María G." (privacidad: Ley 1581). */
export function displayAuthor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first} ${last.charAt(0).toLocaleUpperCase("es")}.` : first;
}

/** 4.8 → "4,8" (coma decimal es-CO). */
export const formatRating = (rating: number): string => rating.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Las `count` reseñas más recientes con al menos `minRating` estrellas (puro). */
export function featuredReviews(reviews: readonly GoogleReview[], count = 3, minRating = 4): GoogleReview[] {
  return [...reviews].filter((r) => r.rating >= minRating && r.text.trim()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}
