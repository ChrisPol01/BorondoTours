/** Verifica que todos los enlaces internos de las vistas generadas resuelvan. */
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const require = createRequire(join(repo, 'apps/web/package.json'));
const { chromium } = require('@playwright/test');
const manifest = JSON.parse(readFileSync(join(here, 'manifest.json'), 'utf8'));
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const targets = new Set();
for (const route of Object.keys(manifest)) {
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  for (const href of await page.locator('.fig-stage a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))) {
    if (href?.startsWith('/') && !href.startsWith('//')) targets.add(href.split('#')[0]);
  }
}
const failures = [];
for (const route of targets) {
  const response = await context.request.get(base + route, { maxRedirects: 3 });
  if (response.status() >= 400 && route !== '/404') failures.push(`${route} → ${response.status()}`);
}
await browser.close();
console.log(`INTERNAL_LINKS=${targets.size}`);
if (failures.length) { console.log(failures.join('\n')); process.exitCode = 1; }
else console.log('BROKEN_LINKS=0');
