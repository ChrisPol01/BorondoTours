// Busca candidatos en Unsplash (licencia Unsplash, sin premium/plus) y guarda un JSON compacto.
import { writeFile } from 'node:fs/promises';

const QUERIES = {
  cocora: 'cocora valley colombia',
  tayrona: 'tayrona colombia',
  amazonas: 'amazon river colombia',
  cartagena: 'cartagena colombia',
  canocristales: 'cano cristales',
  guatape: 'guatape colombia',
  sanandres: 'san andres colombia beach',
  pacifico: 'nuqui colombia',
  tatacoa: 'tatacoa desert',
  barichara: 'barichara colombia',
  paramo: 'paramo frailejones colombia',
  ciudadperdida: 'ciudad perdida colombia',
  cafe: 'colombia coffee farm',
  aves: 'colombia hummingbird',
  trekking: 'colombia hiking mountains',
  gastronomia: 'colombian food',
};

const out = {};
for (const [key, q] of Object.entries(QUERIES)) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=20`;
  const res = await fetch(url);
  if (!res.ok) { out[key] = { error: res.status }; continue; }
  const json = await res.json();
  out[key] = json.results
    .filter(p => !p.premium && !p.plus && p.width >= 3000 && p.width > p.height)
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      alt: p.alt_description,
      desc: (p.description || '').slice(0, 120),
      w: p.width, h: p.height,
      author: p.user?.name,
      authorUrl: p.user?.links?.html,
      page: p.links?.html,
      base: p.urls?.raw?.split('?')[0],
    }));
  await new Promise(r => setTimeout(r, 400));
}
await writeFile(process.argv[2], JSON.stringify(out, null, 1));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])));

