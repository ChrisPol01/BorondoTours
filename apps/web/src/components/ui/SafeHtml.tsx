/**
 * `SafeHtml` — único punto de render de HTML proveniente del backend en el
 * Portal B2C.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Contrato de seguridad (R16.1, R16.3, R20.5, R20.7)
 * ─────────────────────────────────────────────────────────────────────────
 * Todo HTML no confiable (p. ej. la descripción larga del tour) DEBE pasar por
 * este componente y nunca insertarse directamente en el DOM. Internamente:
 *
 *   1. Sanitiza el `html` con `sanitizeHtml()` (allowlist estricta + DOMPurify).
 *   2. Renderiza el resultado ÚNICAMENTE vía `dangerouslySetInnerHTML` con la
 *      salida sanitizada — jamás con el `html` original (R20.5).
 *   3. Si la sanitización produce contenido no procesable (cadena vacía), NO se
 *      inserta nada del original: se renderiza vacío o, si se provee
 *      `fallbackKey`, el texto i18n correspondiente como TEXTO plano (R16.3,
 *      R20.7).
 *
 * TypeScript strict, sin `any`.
 */
import type { ReactElement } from "react";

import { sanitizeHtml } from "@lib/sanitize";
import { useTranslation } from "@lib/i18n/provider";

/** Props de `SafeHtml`. */
export interface SafeHtmlProps {
  /** HTML de origen no confiable (backend) que se sanitiza antes de renderizar. */
  readonly html: string;
  /**
   * Clave i18n a mostrar como texto plano cuando el contenido no se puede
   * sanitizar (queda vacío). Si se omite, no se renderiza nada (R16.3).
   */
  readonly fallbackKey?: string;
  /** Clases Tailwind opcionales para el contenedor (o el fallback). */
  readonly className?: string;
}

/**
 * Renderiza HTML del backend de forma segura.
 *
 * @param props `{ html, fallbackKey? }`.
 * @returns El HTML sanitizado, el texto de `fallbackKey`, o `null` si no hay
 *          contenido sanitizable ni fallback.
 */
export function SafeHtml({ html, fallbackKey, className }: SafeHtmlProps): ReactElement | null {
  // El hook se invoca siempre (reglas de hooks), aunque el fallback no se use.
  const { t } = useTranslation();

  // Único punto de sanitización. Ante contenido no procesable → '' (R20.7).
  const sanitized = sanitizeHtml(html);

  // Contenido no sanitizable: nunca insertamos el original en el DOM (R20.7).
  // Con `fallbackKey` mostramos el mensaje i18n como texto plano (R16.3).
  if (sanitized.length === 0) {
    if (fallbackKey === undefined) return null;
    return <span className={className}>{t(fallbackKey)}</span>;
  }

  // Se inserta EXCLUSIVAMENTE la salida sanitizada, nunca `html` (R20.5).
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
