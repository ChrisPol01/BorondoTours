// Servidor estático local (solo 127.0.0.1) para que el plugin Figma MCP Bridge cargue assets del repo.
// Uso: node otros/design/tools/figma-assets/servidor-local.mjs   → http://127.0.0.1:8777/<ruta relativa a otros/design>
// Ej.: http://127.0.0.1:8777/b2c/fotos-test/figma-1600/destino-tayrona.jpg
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..'); // otros/design
const PORT = Number(process.env.PORT || 8777);
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([\\/])+/, '');
    if (rel.includes('..')) { res.writeHead(400).end(); return; }
    const type = TYPES[extname(rel).toLowerCase()];
    if (!type) { res.writeHead(415).end(); return; }
    const data = await readFile(join(ROOT, rel));
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' }).end(data);
  } catch { res.writeHead(404).end(); }
}).listen(PORT, '127.0.0.1', () => console.log(`assets en http://127.0.0.1:${PORT} (raíz ${ROOT})`));
