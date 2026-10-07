// Imprime el árbol de una página generada (clase · etiqueta · texto) para inspección.
// Uso: node otros/infra/fig2astro/tree.mjs apps/web/src/pages/index.astro [maxDepth]
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const maxDepth = Number(process.argv[3] ?? 99);
const src = readFileSync(file, 'utf8');
const start = src.indexOf('<FigmaPage');
const end = src.indexOf('</FigmaPage>');
const html = src.slice(src.indexOf('>', start) + 1, end);

const re = /<(\/?)([a-zA-Z0-9]+)([^>]*?)(\/?)>|([^<]+)/g;
const voids = new Set(['img', 'br', 'hr', 'input', 'path', 'rect', 'circle', 'stop', 'use', 'ellipse', 'line', 'polygon', 'polyline']);
let depth = 0;
let inSvg = 0;
let m;
const out = [];
while ((m = re.exec(html))) {
  const [, close, tag, attrs, selfClose, text] = m;
  if (text !== undefined) {
    const t = text.trim();
    if (t && !inSvg && depth <= maxDepth + 1) out.push(`${'  '.repeat(depth)}"${t.slice(0, 70)}"`);
    continue;
  }
  if (close) {
    if (tag === 'svg') inSvg--;
    depth--;
    continue;
  }
  const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? '';
  const href = /href="([^"]*)"/.exec(attrs)?.[1];
  const aria = /aria-label="([^"]*)"/.exec(attrs)?.[1];
  if (!inSvg && depth <= maxDepth) {
    out.push(`${'  '.repeat(depth)}<${tag}${cls ? ' .' + cls : ''}${href ? ' href=' + href : ''}${aria ? ' aria=' + aria : ''}>`);
  }
  if (tag === 'svg') inSvg++;
  if (!selfClose && !voids.has(tag)) depth++;
}
console.log(out.join('\n'));
