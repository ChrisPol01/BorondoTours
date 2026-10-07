/** Auditoría WCAG de las rutas principales generadas desde Figma. */
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const require = createRequire(join(repo, 'apps/web/package.json'));
const { chromium } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const routes = [
  '/', '/explorar', '/explorar/mapa', '/experiencias', '/destinos', '/tour',
  '/checkout', '/checkout/viajeros', '/checkout/pago', '/checkout/confirmacion',
  '/iniciar-sesion', '/crear-cuenta', '/mis-reservas', '/mis-tours', '/favoritos',
  '/mensajes', '/perfil', '/blog', '/blog/articulo', '/nosotros', '/contacto',
  '/preguntas-frecuentes', '/legal', '/politica-de-cancelacion', '/sin-conexion',
];
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
let total = 0;
for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  total += result.violations.length;
  const summary = result.violations.map(v => `${v.id}(${v.nodes.length})`).join(', ');
  console.log(`${route.padEnd(32)} ${result.violations.length ? 'FAIL ' + summary : 'OK'}`);
}
await browser.close();
console.log(`TOTAL_VIOLATIONS=${total}`);
process.exitCode = total ? 1 : 0;
