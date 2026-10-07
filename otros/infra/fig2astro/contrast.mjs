/**
 * contrast — auditoría WCAG de contraste de texto en las páginas generadas, por tema.
 * Uso: node contrast.mjs [tema=claro] [baseUrl=http://localhost:4321] [ruta ...]
 *
 * Para cada texto visible toma el punto central, compone los fondos de todos los elementos que hay
 * debajo (elementsFromPoint, así cuenta las capas de vidrio hermanas) y compara con el color del
 * texto. Umbral 4.5:1 (3:1 si es texto grande). Omite texto sobre fotografía y controles atenuados.
 * Escribe el detalle en diff/contrast-<tema>.json e imprime el total por página.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(resolve(here, '../../..'), 'apps/web');
const require = createRequire(join(web, 'package.json'));
const { chromium } = require('@playwright/test');
const manifest = JSON.parse((await import('node:fs')).readFileSync(join(here, 'manifest.json'), 'utf8'));

const [theme = 'claro', base = 'http://localhost:4321', ...only] = process.argv.slice(2);
const routes = only.length ? only : Object.keys(manifest).sort();

/** Se ejecuta en la página. */
function audit() {
  // Chrome serializa color-mix() como color(srgb r g b / a) con canales 0–1.
  const COLOR = /rgba?\([^)]+\)|color\(srgb[^)]+\)/g;
  const parse = (c) => {
    const s = /color\(srgb ([^)]+)\)/.exec(c);
    if (s) {
      const p = s[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (k) => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
    return { r: mix('r'), g: mix('g'), b: mix('b'), a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const gradientColor = (img) => {
    const colors = [...img.matchAll(COLOR)].map((m) => parse(m[0])).filter(Boolean);
    if (!colors.length) return null;
    const n = colors.length;
    return colors.reduce((acc, c) => ({ r: acc.r + c.r / n, g: acc.g + c.g / n, b: acc.b + c.b / n, a: acc.a + c.a / n }), { r: 0, g: 0, b: 0, a: 0 });
  };
  const dimmed = (el) => { for (let n = el; n; n = n.parentElement) if (Number(getComputedStyle(n).opacity) <= 0.6) return true; return false; };

  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.querySelector('.fig-stage') ?? document.body, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!el || seen.has(el) || !t.nodeValue.trim()) continue;
    seen.add(el);
    if (el.closest('svg,script,style,[hidden],.bt-sr-only,.skip-link')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const range = document.createRange();
    range.selectNodeContents(t);
    const rect = range.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (dimmed(el)) continue;
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
    const stack = document.elementsFromPoint(x, y);
    // Texto tapado por chrome fijo (navbar, rail, FAB) o por el velo de un modal: no es lo que se ve.
    const chrome = '.bt-nav-fixed, .bt-rail, .bt-fab, .bt-sidebar-fixed, .bt-overlay, .bt-auth-overlay';
    const covered = !el.closest(chrome) && stack.some((node) => !node.contains(el) && node.closest(chrome));
    if (covered || el.closest('[aria-hidden="true"], [inert]')) continue;
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    let media = false;
    for (let i = stack.length - 1; i >= 0; i--) {
      const node = stack[i];
      // El propio elemento sí cuenta (fondo de botones y etiquetas); sus descendientes no.
      if (node !== el && el.contains(node)) continue;
      const s = getComputedStyle(node);
      if (s.backgroundImage.includes('url(')) { media = true; bg = { r: 0, g: 0, b: 0, a: 1 }; }
      if (s.backgroundImage.includes('gradient')) { const g = gradientColor(s.backgroundImage); if (g) bg = over(g, bg); }
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) bg = over(c, bg);
      if (node.tagName === 'IMG') { media = true; }
    }
    if (media) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const fgSolid = over(fg, bg);
    const value = ratio(fgSolid, bg);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const min = large ? 3 : 4.5;
    if (value < min) {
      out.push({
        text: t.nodeValue.trim().slice(0, 60),
        cls: el.className && typeof el.className === 'string' ? el.className : el.tagName,
        color: cs.color,
        bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
        ratio: Math.round(value * 100) / 100,
        min,
      });
    }
  }
  return out;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript((value) => {
  try { if (value === 'colorido') localStorage.removeItem('borondo.theme'); else localStorage.setItem('borondo.theme', value); } catch {}
}, theme);
const page = await ctx.newPage();
const report = {};
let total = 0;
const skipped = [];
// Mide una ruta ya cargada; si una navegacion destruye el contexto, lanza para reintentar.
async function measureRoute(route) {
  // Reasentar la carga: algunas rutas redirigen (client-side) tras el primer networkidle.
  await page.waitForLoadState('networkidle').catch(() => {});
  // pointer-events:auto para que elementsFromPoint vea capas decorativas (p. ej. el indicador del navbar).
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important;pointer-events:auto!important}' });
  await page.evaluate(() => document.documentElement.style.setProperty('--fig-scale', '1'));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const issues = [];
  for (let y = 0; y < height; y += 800) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    for (const i of await page.evaluate(audit)) if (!issues.some((j) => j.cls === i.cls && j.text === i.text)) issues.push(i);
  }
  return issues;
}
const isNavError = (e) => /Execution context was destroyed|navigation|detached|Target closed/i.test(String(e && e.message || e));
for (const route of routes) {
  let issues = null;
  for (let attempt = 0; attempt < 2 && issues === null; attempt++) {
    try {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      // Si la ruta redirige a otra del mismo set, medimos su destino una sola vez.
      issues = await measureRoute(route);
    } catch (e) {
      if (isNavError(e) && attempt === 0) {
        // Redireccion en curso: espera a que estabilice y reintenta una vez.
        await page.waitForLoadState('networkidle').catch(() => {});
        continue;
      }
      skipped.push({ route, reason: String(e && e.message || e).slice(0, 120) });
      break;
    }
  }
  if (issues === null) {
    report[route] = { skipped: true };
    console.log(`${route.padEnd(44)} (saltada: redirige/navega)`);
    continue;
  }
  report[route] = issues;
  total += issues.length;
  console.log(`${route.padEnd(44)} ${issues.length}`);
}
if (skipped.length) {
  report.__skipped = skipped;
  console.log(`Rutas saltadas: ${skipped.length} -> ${skipped.map((s) => s.route).join(', ')}`);
}
await browser.close();
mkdirSync(join(here, 'diff'), { recursive: true });
writeFileSync(join(here, 'diff', `contrast-${theme}.json`), JSON.stringify(report, null, 2), 'utf8');
console.log(`TOTAL ${theme}: ${total}`);
