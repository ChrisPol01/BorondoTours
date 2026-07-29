import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sanitizeHtml } from './sanitize';

/**
 * Property test dedicado a la Property 13 del diseño (frontend-b2c-portal).
 *
 * Feature: frontend-b2c-portal, Property 13: La sanitización de HTML es
 * idempotente.
 *
 * *Para todo* HTML generado (incluyendo payloads maliciosos con `script`,
 * `iframe`, manejadores `on*`, etiquetas y atributos arbitrarios, además de
 * texto plano y cadena vacía), volver a sanitizar una salida ya sanitizada no
 * la cambia: `sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x)`. Es decir, la
 * primera pasada alcanza un punto fijo estable; aplicar `sanitizeHtml` de nuevo
 * no elimina ni reescribe nada adicional.
 *
 * Validates: Requirements 16.7, 20.6, 20.7
 *
 * La comprobación es de igualdad exacta de strings: la idempotencia exige que
 * el resultado sea byte a byte idéntico, no solo "equivalente" al parsear.
 */

// --- Generadores inteligentes de HTML -------------------------------------

// Texto plano acotado, sin metacaracteres HTML para reducir ruido de parseo.
const safeText = fc
  .stringMatching(/^[a-zA-Z0-9 áéíóúñ.,:;!¿?()-]*$/)
  .filter((s) => s.length <= 40);

// Valores de atributo sin comillas ni `<`/`>` que rompan el HTML generado.
const attrValue = fc
  .stringMatching(/^[a-zA-Z0-9 _:/.#-]*$/)
  .filter((s) => s.length <= 30);

// Nombres de manejadores de eventos on* (siempre deben eliminarse — R20.6).
const onEventName = fc.constantFrom(
  'onclick',
  'onload',
  'onerror',
  'onmouseover',
  'onfocus',
  'onabc',
);

// Nombres de atributos arbitrarios fuera de la allowlist de atributos (R16.7).
const arbitraryAttrName = fc.constantFrom(
  'class',
  'id',
  'style',
  'data-x',
  'aria-label',
  'title',
  'src',
  'width',
  'role',
);

// Un atributo peligroso o arbitrario renderizado como ` name="value"`.
const dangerousAttr = fc
  .oneof(
    fc.tuple(onEventName, attrValue),
    fc.tuple(arbitraryAttrName, attrValue),
    fc.tuple(fc.constant('href'), attrValue),
  )
  .map(([name, value]) => ` ${name}="${value}"`);

const attrs = fc.array(dangerousAttr, { maxLength: 4 }).map((a) => a.join(''));

// Nombres de etiquetas: mezcla de permitidas, prohibidas y arbitrarias.
const tagName = fc.constantFrom(
  // permitidas (allowlist R16.7)
  'p',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'h2',
  'h3',
  // prohibidas (R20.6)
  'script',
  'iframe',
  'form',
  'input',
  'style',
  // arbitrarias fuera de allowlist
  'div',
  'span',
  'img',
  'svg',
  'object',
  'embed',
);

// Un fragmento HTML: etiqueta generica con atributos peligrosos envolviendo
// texto, un payload de inyeccion conocido, texto plano, o cadena vacía.
const htmlFragment = fc.oneof(
  fc
    .record({ tag: tagName, attr: attrs, text: safeText })
    .map(({ tag, attr, text }) => `<${tag}${attr}>${text}</${tag}>`),
  fc.constantFrom(
    '<script>alert(1)</script>',
    '<img src=x onerror="alert(1)">',
    '<iframe src="https://evil.test"></iframe>',
    '<form action="/x"><input name="pw"></form>',
    '<style>body{display:none}</style>',
    '<a href="javascript:alert(1)" onclick="steal()">x</a>',
    '<p onclick="x()" style="color:red" class="c">hola</p>',
    '<svg onload="alert(1)"></svg>',
    '<div data-x="1"><span title="t">t</span></div>',
    '<ul><li>uno</li><li>dos</li></ul>',
    '<a href="https://borondotours.com">seguro</a>',
    '', // cadena vacía → R20.7
  ),
  safeText,
);

// HTML completo: concatenacion de 0..6 fragmentos (incluye el caso vacío).
const htmlArbitrary = fc
  .array(htmlFragment, { minLength: 0, maxLength: 6 })
  .map((parts) => parts.join(''));

describe('Feature: frontend-b2c-portal, Property 13: La sanitización de HTML es idempotente', () => {
  it('sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x) para todo HTML generado', () => {
    fc.assert(
      fc.property(htmlArbitrary, (html) => {
        const once = sanitizeHtml(html);
        const twice = sanitizeHtml(once);
        expect(twice).toBe(once);
      }),
      { numRuns: 200 },
    );
  });
});
