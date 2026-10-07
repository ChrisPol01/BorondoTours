// Relaciona cada imagen /fig/*.webp con los textos de la tarjeta que la usa (para elegir fotos por destino).
// Uso: node otros/infra/fig2astro/imgmap.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'apps/web/src/pages';
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.astro')) files.push(p);
});
walk(root);

const map = new Map();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  // clase -> imagen
  const clsImg = new Map();
  for (const m of src.matchAll(/\.(p\d+_\d+)\{[^}]*url\("(\/fig\/[^"]+)"\)/g)) clsImg.set(m[1], m[2]);
  for (const [cls, img] of clsImg) {
    const i = src.indexOf(`class="${cls}"`);
    if (i < 0) continue;
    const chunk = src.slice(i, i + 2500).replace(/<svg[\s\S]*?<\/svg>/g, '');
    const texts = [...chunk.matchAll(/>([^<>]{3,60})</g)].map((t) => t[1].trim()).filter(Boolean).slice(0, 4);
    const key = img;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(texts.join(' | '));
  }
}
for (const [img, set] of map) console.log(img, '=>', [...set].slice(0, 3).join(' || '));
