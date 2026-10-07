/**
 * compare — diferencia de píxeles entre el PNG exportado de Figma y la página en localhost.
 * Uso: node compare.mjs <salida-mcp-pngs.json> [baseUrl]
 *   El JSON trae { result: { "<figmaId>": "<png base64>", ... } }. La ruta se toma de manifest.json.
 * Escribe en otros/infra/fig2astro/diff/ el PNG de Figma, la captura y un mapa de diferencias,
 * e imprime el % de píxeles distintos (umbral de color 32/255 por canal).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const web = join(repo, 'apps/web');
const require = createRequire(join(web, 'package.json'));
const sharp = require(require.resolve('sharp', { paths: [join(repo, 'node_modules/.pnpm/sharp@0.34.5/node_modules')] }));
const { chromium } = require('@playwright/test');

const [input, base = 'http://localhost:4321'] = process.argv.slice(2);
const raw = JSON.parse(readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
const pngs = raw.result ?? raw;
const manifest = JSON.parse(readFileSync(join(here, 'manifest.json'), 'utf8'));
const byId = Object.fromEntries(Object.entries(manifest).map(([route, v]) => [v.id, { route, ...v }]));
const outDir = join(here, 'diff');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const [id, b64] of Object.entries(pngs)) {
  const info = byId[id];
  if (!info) { console.log(`${id}: sin ruta en manifest`); continue; }
  const slug = info.route === '/' ? 'home' : info.route.slice(1).replace(/\//g, '_');
  const figPath = join(outDir, `${slug}.figma.png`);
  writeFileSync(figPath, Buffer.from(b64, 'base64'));
  await page.goto(base + info.route, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  // Escala 1:1 (la barra de scroll reduce clientWidth y desalinearía la comparación).
  await page.evaluate(() => document.documentElement.style.setProperty('--fig-scale', '1'));
  await page.evaluate(() => document.fonts.ready);
  const shotPath = join(outDir, `${slug}.web.png`);
  const stage = await page.$('.fig-stage');
  await stage.screenshot({ path: shotPath });

  const fig = await sharp(figPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = fig.info.width, H = fig.info.height;
  const padded = await sharp(shotPath).removeAlpha().extend({ bottom: 4000, right: 200, background: '#ff00ff' }).png().toBuffer();
  const web1 = await sharp(padded).extract({ left: 0, top: 0, width: W, height: H }).removeAlpha().raw().toBuffer();
  const diff = Buffer.alloc(W * H * 3);
  let bad = 0;
  for (let i = 0; i < W * H; i++) {
    const o = i * 3;
    const d = Math.max(Math.abs(fig.data[o] - web1[o]), Math.abs(fig.data[o + 1] - web1[o + 1]), Math.abs(fig.data[o + 2] - web1[o + 2]));
    if (d > 32) { bad++; diff[o] = 255; diff[o + 1] = 0; diff[o + 2] = 80; }
    else { const g = Math.round((fig.data[o] + fig.data[o + 1] + fig.data[o + 2]) / 9); diff[o] = g; diff[o + 1] = g; diff[o + 2] = g; }
  }
  await sharp(diff, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(outDir, `${slug}.diff.png`));
  const shotMeta = await sharp(shotPath).metadata();
  console.log(`${info.route.padEnd(40)} diff ${(bad / (W * H) * 100).toFixed(2)}%  figma ${W}x${H}  web ${shotMeta.width}x${shotMeta.height}`);
}
await browser.close();
