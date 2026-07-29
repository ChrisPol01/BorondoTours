/**
 * Property test (tarea 4.16 / Property 12) — la sanitización de HTML solo deja
 * pasar la allowlist (`lib/sanitize.ts`, `sanitizeHtml`).
 *
 * Property 12: Para todo HTML generado (incluyendo payloads con `script`,
 * `iframe`, `form`, `input`, `style`, atributos `on*` y atributos arbitrarios),
 * `sanitizeHtml(html)` produce una salida que:
 *   · no contiene ninguna etiqueta fuera de la allowlist
 *     `{p, strong, em, ul, ol, li, a, br, h2, h3}`,
 *   · no contiene los elementos `script`/`iframe`/`form`/`input`/`style`,
 *   · no contiene ningún atributo cuyo nombre comience por `on`,
 *   · en las etiquetas `a` conserva únicamente el atributo `href`.
 *
 * **Validates: Requirements 16.7, 20.6**
 *
 * La verificación NO se hace por regex sobre el string de salida, sino
 * parseando el DOM resultante (`DOMParser`, disponible en jsdom) y recorriendo
 * cada elemento y atributo. Esto evita falsos positivos por texto escapado y
 * comprueba la garantía real: qué nodos/atributos existen tras insertar al DOM.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { sanitizeHtml } from "./sanitize";

// ─────────────────────────────────────────────────────────────────────────
// Allowlist canónica (debe coincidir con lib/sanitize.ts)
// ─────────────────────────────────────────────────────────────────────────

/** Etiquetas permitidas en la salida sanitizada (R16.7). */
const ALLOWED_TAGS = new Set([
  "p",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "a",
  "br",
  "h2",
  "h3",
]);

/** Etiquetas explícitamente prohibidas que nunca deben sobrevivir (R20.6). */
const FORBIDDEN_TAGS = ["script", "iframe", "form", "input", "style"];

// ─────────────────────────────────────────────────────────────────────────
// Generadores (arbitraries) — payloads maliciosos + fragmentos legítimos
// ─────────────────────────────────────────────────────────────────────────

/** Nombre de atributo de evento `on*` (onclick, onerror, onload, ...). */
const onEventName = fc
  .constantFrom(
    "click",
    "error",
    "load",
    "mouseover",
    "focus",
    "submit",
    "input",
  )
  .map((evt) => `on${evt}`);

/** Nombre de atributo arbitrario fuera de la allowlist (class, style, data-*...). */
const arbitraryAttrName = fc.constantFrom(
  "class",
  "id",
  "style",
  "data-x",
  "aria-hidden",
  "src",
  "srcset",
  "formaction",
  "xlink:href",
);

/** Valor de atributo (incluye vectores tipo javascript: y payloads). */
const attrValue = fc.constantFrom(
  "steal()",
  "alert(1)",
  "javascript:alert(1)",
  "https://evil.test",
  "https://borondotours.com",
  "1",
  "color:red",
  "#",
  "data:text/html,<script>1</script>",
);

/** Etiqueta prohibida con contenido, generada como fragmento HTML crudo. */
const forbiddenElement: fc.Arbitrary<string> = fc.oneof(
  fc.constant("<script>alert(1)</script>"),
  fc.constant('<script src="https://evil.test/x.js"></script>'),
  fc.constant('<iframe src="https://evil.test"></iframe>'),
  fc.constant("<form><input name=\"x\" value=\"y\"></form>"),
  fc.constant('<input type="text" onfocus="steal()">'),
  fc.constant("<style>body{display:none}</style>"),
  fc.constant('<img src="x" onerror="alert(1)">'),
  fc.constant("<svg><script>1</script></svg>"),
);

/** Etiqueta de la allowlist con posibles atributos maliciosos inyectados. */
const allowedElementWithAttrs: fc.Arbitrary<string> = fc
  .record({
    tag: fc.constantFrom("p", "strong", "em", "li", "a", "h2", "h3"),
    onAttr: fc.option(fc.tuple(onEventName, attrValue), { nil: null }),
    arbAttr: fc.option(fc.tuple(arbitraryAttrName, attrValue), { nil: null }),
    href: fc.option(attrValue, { nil: null }),
    text: fc.constantFrom("hola", "viaja", "mundo", "Sección", ""),
  })
  .map(({ tag, onAttr, arbAttr, href, text }) => {
    const attrs: string[] = [];
    if (href !== null) attrs.push(`href="${href}"`);
    if (onAttr !== null) attrs.push(`${onAttr[0]}="${onAttr[1]}"`);
    if (arbAttr !== null) attrs.push(`${arbAttr[0]}="${arbAttr[1]}"`);
    const attrStr = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
    return `<${tag}${attrStr}>${text}</${tag}>`;
  });

/** Fragmentos de lista legítimos (para ejercitar ul/ol/li/br). */
const listFragment = fc.constantFrom(
  "<ul><li>uno</li><li>dos</li></ul>",
  "<ol><li>a</li></ol>",
  "línea<br>fin",
  "<p>texto normal</p>",
);

/** Un "trozo" de HTML: legítimo, prohibido o mezcla con atributos. */
const htmlChunk: fc.Arbitrary<string> = fc.oneof(
  allowedElementWithAttrs,
  forbiddenElement,
  listFragment,
);

/**
 * Documento HTML arbitrario: concatenación de 0..8 trozos. Incluye
 * combinaciones de payloads maliciosos, atributos `on*`/arbitrarios y HTML
 * legítimo, cubriendo el espacio de entrada descrito por la Property 12.
 */
const arbitraryHtml: fc.Arbitrary<string> = fc
  .array(htmlChunk, { minLength: 0, maxLength: 8 })
  .map((chunks) => chunks.join(""));

// ─────────────────────────────────────────────────────────────────────────
// Utilidad: parsear la salida sanitizada y recorrer el DOM
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parsea `html` como fragmento dentro del `<body>` y devuelve todos los
 * elementos descendientes. Usa `DOMParser` (jsdom).
 */
function parseElements(html: string): Element[] {
  const doc = new DOMParser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    "text/html",
  );
  return Array.from(doc.body.querySelectorAll("*"));
}

// ─────────────────────────────────────────────────────────────────────────
// Property 12
// ─────────────────────────────────────────────────────────────────────────

describe("Property-based: la sanitización de HTML solo deja pasar la allowlist", () => {
  it(
    "Feature: frontend-b2c-portal, Property 12: La sanitización de HTML solo " +
      "deja pasar la allowlist. Para todo HTML generado (incluyendo payloads " +
      "con script/iframe/form/input/style, atributos on* y atributos " +
      "arbitrarios), sanitizeHtml(html) produce una salida que no contiene " +
      "etiquetas fuera de {p,strong,em,ul,ol,li,a,br,h2,h3}, no contiene " +
      "script/iframe/form/input/style, no contiene atributos on*, y en las " +
      "etiquetas a conserva únicamente href. " +
      "**Validates: Requirements 16.7, 20.6**",
    () => {
      fc.assert(
        fc.property(arbitraryHtml, (html) => {
          const clean = sanitizeHtml(html);

          // La salida siempre es string (nunca undefined/null).
          expect(typeof clean).toBe("string");

          // Ninguna etiqueta prohibida aparece de forma literal en la salida.
          const lower = clean.toLowerCase();
          for (const tag of FORBIDDEN_TAGS) {
            expect(lower).not.toContain(`<${tag}`);
          }

          // Parseo del DOM resultante y verificación nodo a nodo.
          for (const el of parseElements(clean)) {
            const tagName = el.tagName.toLowerCase();

            // (1) Toda etiqueta pertenece a la allowlist (R16.7).
            expect(ALLOWED_TAGS.has(tagName)).toBe(true);

            // (2) Ninguna etiqueta prohibida sobrevive (R20.6). Redundante con
            //     la allowlist, pero explícito por el requisito de seguridad.
            expect(FORBIDDEN_TAGS).not.toContain(tagName);

            for (const attr of Array.from(el.attributes)) {
              const attrName = attr.name.toLowerCase();

              // (3) Ningún atributo `on*` sobrevive (R20.6).
              expect(attrName.startsWith("on")).toBe(false);

              // (4) El único atributo permitido es `href`, y solo en `<a>`
              //     (R16.7). Cualquier otro atributo es una violación.
              if (attrName === "href") {
                expect(tagName).toBe("a");
              } else {
                // No debería existir ningún atributo distinto de href.
                expect(attrName).toBe("href");
              }
            }
          }
        }),
        { numRuns: 200 },
      );
    },
  );
});
