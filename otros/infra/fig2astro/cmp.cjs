const { createRequire } = require('node:module');
const r = createRequire(process.cwd() + '/apps/web/package.json');
const sharp = r(r.resolve('sharp', { paths: [process.cwd() + '/node_modules/.pnpm/sharp@0.34.5/node_modules'] }));
(async () => {
  const d = 'otros/infra/fig2astro/diff/';
  const s = process.argv[2];
  const parts = await Promise.all(['figma','web','diff'].map(k => sharp(d + s + '.' + k + '.png').resize({ width: 600 }).extend({ right: 6, background: '#ff00ff' }).png().toBuffer()));
  const metas = await Promise.all(parts.map(p => sharp(p).metadata()));
  const H = Math.max(...metas.map(m => m.height));
  await sharp({ create: { width: 1818, height: H, channels: 3, background: '#ffffff' } }).composite(parts.map((p, i) => ({ input: p, left: i * 606, top: 0 }))).jpeg({ quality: 70 }).toFile(d + s + '.cmp.jpg');
})();
