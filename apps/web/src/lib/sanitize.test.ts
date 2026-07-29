import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

// Unit tests (ejemplos + fronteras) para `sanitizeHtml`.
// Las propiedades universales (allowlist e idempotencia) se cubren en los
// property tests dedicados (Properties 12 y 13).
describe('sanitizeHtml', () => {
  it('conserva las etiquetas de la allowlist', () => {
    const input =
      '<p>Hola <strong>mundo</strong> <em>bonito</em></p>' +
      '<h2>Sección</h2><h3>Sub</h3>' +
      '<ul><li>uno</li></ul><ol><li>dos</li></ol>' +
      'línea<br>fin';
    const out = sanitizeHtml(input);
    expect(out).toContain('<p>');
    expect(out).toContain('<strong>');
    expect(out).toContain('<em>');
    expect(out).toContain('<h2>');
    expect(out).toContain('<h3>');
    expect(out).toContain('<ul>');
    expect(out).toContain('<ol>');
    expect(out).toContain('<li>');
    expect(out).toMatch(/<br\s*\/?>/);
  });

  it('permite href únicamente en la etiqueta a', () => {
    const out = sanitizeHtml('<a href="https://borondotours.com">viaja</a>');
    expect(out).toContain('href="https://borondotours.com"');
  });

  it('elimina href de etiquetas que no sean a', () => {
    const out = sanitizeHtml('<p href="https://evil.test">texto</p>');
    expect(out).toContain('<p>');
    expect(out).not.toContain('href');
  });

  it('elimina script/iframe/form/input/style y su contenido', () => {
    const input =
      '<p>ok</p>' +
      '<script>alert(1)</script>' +
      '<iframe src="https://evil.test"></iframe>' +
      '<form><input name="x"></form>' +
      '<style>body{display:none}</style>';
    const out = sanitizeHtml(input);
    expect(out).toContain('<p>ok</p>');
    expect(out.toLowerCase()).not.toContain('<script');
    expect(out.toLowerCase()).not.toContain('<iframe');
    expect(out.toLowerCase()).not.toContain('<form');
    expect(out.toLowerCase()).not.toContain('<input');
    expect(out.toLowerCase()).not.toContain('<style');
    expect(out).not.toContain('alert(1)');
    expect(out).not.toContain('display:none');
  });

  it('elimina atributos de evento on*', () => {
    const out = sanitizeHtml('<a href="#" onclick="steal()">x</a>');
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toContain('steal()');
  });

  it('elimina atributos arbitrarios fuera de la allowlist', () => {
    const out = sanitizeHtml('<p class="danger" data-x="1" style="color:red">t</p>');
    expect(out).toBe('<p>t</p>');
  });

  it('devuelve cadena vacía para entrada vacía', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('es idempotente en un caso representativo', () => {
    const input = '<p onclick="x()">hola<script>1</script> <a href="#" class="c">link</a></p>';
    const once = sanitizeHtml(input);
    expect(sanitizeHtml(once)).toBe(once);
  });
});
