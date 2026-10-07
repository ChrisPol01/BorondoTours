// Descarga las fotos de prueba elegidas (Unsplash) en alta calidad y genera el registro de fuentes.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const [, , candidatesPath, outDir] = process.argv;
const cand = JSON.parse(await readFile(candidatesPath, 'utf8'));

const PICKS = [
  ['destino-eje-cafetero-cocora', 'cocora', 2, 'Destino', 'Valle del Cocora, Salento (Quindío)'],
  ['destino-tayrona', 'tayrona', 0, 'Destino', 'Parque Tayrona (Magdalena)'],
  ['destino-amazonas', 'amazonas', 4, 'Destino', 'Lago Tarapoto / Amazonas'],
  ['destino-cartagena', 'cartagena', 5, 'Destino', 'Centro histórico de Cartagena (Bolívar)'],
  ['destino-guatape', 'guatape', 1, 'Destino', 'Embalse de Guatapé (Antioquia)'],
  ['destino-san-andres', 'sanandres', 0, 'Destino', 'San Andrés Isla'],
  ['destino-pacifico', 'pacifico', 0, 'Destino', 'Costa Pacífica (Chocó)'],
  ['destino-tatacoa', 'tatacoa', 0, 'Destino', 'Desierto de la Tatacoa (Huila)'],
  ['destino-andes', 'trekking', 2, 'Destino', 'Cordillera de los Andes'],
  ['exp-avistamiento-aves', 'aves', 3, 'Experiencia', 'Avistamiento de colibríes'],
  ['exp-trekking', 'trekking', 4, 'Experiencia', 'Sendero de montaña'],
  ['exp-cafe', 'cafe', 3, 'Experiencia', 'Cosecha de café'],
  ['exp-gastronomia', 'gastronomia', 0, 'Experiencia', 'Cocina tradicional colombiana'],
  ['exp-navegacion-rio', 'amazonas', 2, 'Experiencia', 'Navegación por río amazónico'],
  ['exp-pueblo-patrimonio', 'ciudadperdida', 4, 'Experiencia', 'Pueblo colonial andino'],
  ['exp-finca-tradicional', 'ciudadperdida', 2, 'Experiencia', 'Finca tradicional antioqueña'],
  ['exp-paramo', 'paramo', 0, 'Experiencia', 'Páramo de frailejones'],
];

await mkdir(outDir, { recursive: true });
const registry = [];
for (const [file, key, idx, kind, label] of PICKS) {
  const p = cand[key][idx];
  const url = `${p.base}?w=2560&q=80&fm=jpg&fit=max`;
  const res = await fetch(url);
  if (!res.ok) { console.log('FAIL', file, res.status); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(outDir, `${file}.jpg`), buf);
  registry.push({ file: `${file}.jpg`, kind, label, unsplashId: p.id, page: p.page, author: p.author, authorUrl: p.authorUrl, originalSize: `${p.w}x${p.h}`, bytes: buf.length, license: 'Unsplash License' });
  console.log('ok', file, Math.round(buf.length / 1024) + 'KB');
}
await writeFile(join(outDir, 'fuentes.json'), JSON.stringify(registry, null, 2));
