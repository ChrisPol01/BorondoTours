/**
 * Sanitización de HTML del backend para el Portal B2C (Fase 1).
 *
 * Función pura, TypeScript strict, sin `any`. Es el único mecanismo autorizado
 * para limpiar HTML proveniente del backend antes de renderizarlo (siempre vía
 * el componente `SafeHtml`). Fuente: design.md §"Seguridad por defecto" y
 * Correctness Properties 12 y 13.
 *
 * Requisitos cubiertos:
 *   - R16.7 : allowlist estricta de etiquetas `{p, strong, em, ul, ol, li, a,
 *             br, h2, h3}`; la etiqueta `a` admite únicamente el atributo `href`.
 *   - R20.6 : elimina `script`, `iframe`, `form`, `input`, `style` y todo
 *             atributo cuyo nombre comience por `on` antes de insertar al DOM.
 *   - R20.7 : ante contenido no sanitizable (o error de sanitización) devuelve
 *             cadena vacía, sin insertar ni ejecutar el contenido original.
 *
 * Se usa `isomorphic-dompurify` para funcionar de forma idéntica en el navegador
 * (islands React `client:*`) y en el contexto SSR/build de Astro (Node), donde
 * no existe un DOM nativo.
 */
import DOMPurify from 'isomorphic-dompurify';

/**
 * Etiquetas HTML permitidas. Cualquier otra etiqueta se elimina (R16.7).
 * `as const` para que el tipo sea la tupla literal exacta de la allowlist.
 */
const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'h2',
  'h3',
] as const;

/**
 * Único atributo permitido: `href`. Solo tiene sentido en `a`; un hook posterior
 * garantiza que se elimine si aparece en cualquier otra etiqueta (R16.7).
 */
const ALLOWED_ATTR = ['href'] as const;

/**
 * Etiquetas explícitamente prohibidas (R20.6). Son redundantes respecto de la
 * allowlist (no están en `ALLOWED_TAGS`), pero se declaran de forma explícita
 * para dejar constancia del requisito de seguridad y proteger ante cambios.
 */
const FORBID_TAGS = ['script', 'iframe', 'form', 'input', 'style'] as const;

/**
 * Hook que refuerza R16.7: el atributo `href` solo puede sobrevivir en `<a>`.
 * DOMPurify aplica `ALLOWED_ATTR` de forma global, por lo que sin este hook un
 * payload como `<p href="...">` conservaría el atributo. Se registra una única
 * vez a nivel de módulo para evitar acumulación de hooks entre invocaciones.
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const element = node as Element;
  if (
    typeof element.hasAttribute === 'function' &&
    element.hasAttribute('href') &&
    element.tagName.toLowerCase() !== 'a'
  ) {
    element.removeAttribute('href');
  }
});

/**
 * Sanitiza un fragmento de HTML dejando pasar únicamente la allowlist.
 *
 * Garantías:
 *   - La salida no contiene etiquetas fuera de `ALLOWED_TAGS` (R16.7).
 *   - La salida no contiene `script`/`iframe`/`form`/`input`/`style` (R20.6).
 *   - La salida no contiene atributos `on*` ni atributos ajenos a `href`; `href`
 *     solo sobrevive en `<a>` (R16.7, R20.6).
 *   - Ante entrada no procesable o error interno, devuelve `''` (R20.7).
 *   - Es idempotente: `sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x)`.
 *
 * @param html HTML de origen no confiable (p. ej. descripción larga del tour).
 * @returns HTML sanitizado, o cadena vacía si el contenido no es procesable.
 */
export function sanitizeHtml(html: string): string {
  // Contenido no procesable → vacío (R20.7). Un valor no-string nunca debería
  // llegar en TS strict, pero se defiende en frontera por seguridad en runtime.
  if (typeof html !== 'string' || html.length === 0) return '';

  try {
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [...ALLOWED_TAGS],
      ALLOWED_ATTR: [...ALLOWED_ATTR],
      FORBID_TAGS: [...FORBID_TAGS],
      // `href` es el ÚNICO atributo permitido (R16.7). DOMPurify admite por
      // defecto atributos `data-*` y `aria-*`; se desactivan explícitamente
      // para que ningún atributo ajeno a la allowlist sobreviva.
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
      // Elimina el contenido de las etiquetas prohibidas (no solo la etiqueta),
      // evitando que texto de `<script>`/`<style>` quede suelto en la salida.
      FORBID_CONTENTS: [...FORBID_TAGS],
      // Devuelve siempre un string, nunca un nodo DOM.
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      // No conservar el HTML original ante contenido totalmente inválido.
      KEEP_CONTENT: true,
    });

    // Algunas rutas de DOMPurify pueden devolver un `TrustedHTML`; normalizamos.
    return typeof clean === 'string' ? clean : String(clean);
  } catch {
    // Cualquier fallo de sanitización se traduce en contenido vacío (R20.7).
    return '';
  }
}
