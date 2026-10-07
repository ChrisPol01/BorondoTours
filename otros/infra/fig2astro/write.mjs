/**
 * fig2astro — escribe páginas Astro a partir de la salida del compilador Figma (módulo `fig2astro`
 * del bridge). Uso:
 *   node otros/infra/fig2astro/write.mjs <archivo-salida-mcp.json> [...más archivos]
 *
 * Cada archivo contiene `{ ok, result: [{ id, route, name, html, css, images, w, h }] }`.
 * - Imágenes: se resuelven por SHA-1 (hash de Figma) contra `local-images.json` y se convierten a
 *   WebP con sharp al doble del tamaño en que se muestran (máximo el tamaño original).
 * - Cada pantalla se escribe en apps/web/src/pages/<ruta>.astro usando el layout `FigmaPage`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { postprocessCss, postprocessHtml, removeNavLinkGlassLayers } from './postprocess.mjs';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const web = join(repo, 'apps/web');
const require = createRequire(join(web, 'package.json'));
const sharp = require(require.resolve('sharp', { paths: [join(repo, 'node_modules/.pnpm/sharp@0.34.5/node_modules')] }));

const localImages = JSON.parse(readFileSync(join(here, 'local-images.json'), 'utf8').replace(/^\uFEFF/, ''));
const manifestPath = join(here, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

/** Rutas sin indexar: estados de interfaz, flujo de compra y área privada. */
const NOINDEX = /^\/(estados|checkout|pago|mis-reservas|mis-tours|favoritos|mensajes|perfil|notificaciones|soporte|bienvenida|iniciar-sesion|crear-cuenta|verificar|recuperar|sin-conexion|404|error)/;

function pagePath(route) {
  if (route === '/') return join(web, 'src/pages/index.astro');
  return join(web, 'src/pages', route.slice(1) + '.astro');
}

function titleOf(name) {
  const base = name.split(' / ')[0].replace(/\s+—.*$/, '').trim();
  return base === 'Home' ? 'BorondoTours — Explora donde nace la naturaleza' : `${base} — BorondoTours`;
}

async function image(hash, need) {
  const src = localImages[hash];
  if (!src) throw new Error(`Imagen ${hash} no encontrada en local-images.json`);
  const meta = await sharp(src).metadata();
  const width = Math.min(meta.width ?? 2400, Math.ceil(Math.max(need, 64) * 2));
  const name = `${hash.slice(0, 10)}-${width}.webp`;
  const out = join(web, 'public/fig', name);
  if (!existsSync(out)) {
    mkdirSync(dirname(out), { recursive: true });
    await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  }
  return `/fig/${name}`;
}

async function writeScreen(screen) {
  let html = screen.html;
  let css = screen.css;
  for (const [hash, info] of Object.entries(screen.images ?? {})) {
    const url = await image(hash, info.need || 1440);
    const token = `__IMG_${hash}__`;
    html = html.split(token).join(url);
    css = css.split(token).join(`"${url}"`);
  }
  ({ html, css } = removeNavLinkGlassLayers(html, css));
  html = postprocessHtml(html);
  css = postprocessCss(css);
  const file = pagePath(screen.route);
  const layout = relative(dirname(file), join(web, 'src/layouts/FigmaPage.astro')).replace(/\\/g, '/');
  const noindex = NOINDEX.test(screen.route);
  const out = `---
/**
 * GENERADO por otros/infra/fig2astro desde Figma (${screen.id} · "${screen.name}").
 * No editar a mano: los cambios de diseño se hacen en Figma y se regenera la página.
 * La interactividad se agrega con islands en src/components/fig/ montadas sobre esta capa.
 */
import FigmaPage from '${layout.startsWith('.') ? layout : './' + layout}';
---
<FigmaPage title=${JSON.stringify(titleOf(screen.name))} width={${Math.round(screen.w)}} height={${Math.round(screen.h)}} noindex={${noindex}} figmaId=${JSON.stringify(screen.id)}>
${html}
</FigmaPage>

<style is:global>
${css}
</style>
`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out, 'utf8');
  manifest[screen.route] = { id: screen.id, name: screen.name, file: relative(repo, file).replace(/\\/g, '/'), w: screen.w, h: screen.h, bytes: out.length };
  return `${screen.route} → ${relative(repo, file)} (${Math.round(out.length / 1024)} KB)`;
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Uso: node write.mjs <salida.json> [...]');
  process.exit(1);
}
for (const f of files) {
  const raw = JSON.parse(readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
  const screens = Array.isArray(raw) ? raw : Array.isArray(raw.result) ? raw.result : raw.result?.screens ?? [];
  for (const s of screens) console.log(await writeScreen(s));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
