#!/usr/bin/env node
// @ts-check
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, posix, resolve, win32 } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Lanzador humano del proyecto (.megafactory/bin/mf.mjs; design §23.3.4, MF-D55): calcula la raíz desde su
// ubicación, resuelve la central con las fuentes 1-6 de §23.2.2 (versión mínima, paridad en
// tests/launcher-home-parity.test.mjs) y ejecuta <MF_HOME>/bin/mf.mjs con el proyecto como destino, así otra
// persona usa node .megafactory/bin/mf.mjs link sin conocer la ruta de la central. Los agentes no lo usan (D1).

const MARKER = { file: 'mf-home.json', product: 'megafabrica-sdlc', layouts: [1] };
const REQUIRED = ['engine/scripts/factory.mjs', 'engine/version.json', 'bin/mf.mjs'];
const HELP = 'define MF_HOME (PowerShell: $env:MF_HOME = "<ruta>"; cmd: set MF_HOME=<ruta>; bash/zsh: export MF_HOME=<ruta>) o usa --mf-home <ruta>';

/** @param {string} p @param {string} platform */
const norm = (p, platform) => { const r = (platform === 'win32' ? win32 : posix).resolve(p); return platform === 'win32' || platform === 'darwin' ? r.toLowerCase() : r; };
/** @param {string} a @param {string} b @param {string} platform */
function inside(a, b, platform) {
  const api = platform === 'win32' ? win32 : posix;
  const rel = api.relative(norm(a, platform), norm(b, platform));
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${api.sep}`) && !api.isAbsolute(rel));
}
/** @param {string} file @returns {unknown} */
const json = (file) => { try { return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
/** @param {unknown} o @param {...string} keys @returns {unknown} */
const pick = (o, ...keys) => keys.reduce((v, k) => (v && typeof v === 'object' ? /** @type {Record<string, unknown>} */ (v)[k] : undefined), o);

/** @param {string} dir @param {string} project @param {string} platform @returns {string|null} */
function reasonOf(dir, project, platform) {
  if (!existsSync(dir)) return 'missing';
  if (!statSync(dir).isDirectory()) return 'not-a-dir';
  const real = realpathSync(dir);
  if (!existsSync(join(real, MARKER.file))) return 'no-marker';
  const m = json(join(real, MARKER.file));
  if (pick(m, 'product') !== MARKER.product) return 'bad-marker';
  if (!MARKER.layouts.includes(/** @type {number} */ (pick(m, 'layout')))) return `layout-unsupported:${pick(m, 'layout')}`;
  const missing = REQUIRED.find((f) => !existsSync(join(real, ...f.split('/'))));
  if (missing) return `incomplete:${missing}`;
  const proj = existsSync(project) ? realpathSync(project) : resolve(project);
  return inside(real, proj, platform) || inside(proj, real, platform) ? 'overlaps-project' : null;
}

/**
 * Resolución mínima de la central (fuentes 1-6: --mf-home, MF_HOME, local.json, perfil, hermano y usuario).
 * @param {{projectRoot:string, flag?:string|null, env?:Record<string, string|undefined>, platform?:string, userHome?:string, cwd?:string}} i
 * @returns {{home:string|null, source:string|null, skips:string[], error:string|null}}
 */
export function resolveHomeMinimal(i) {
  const platform = i.platform ?? process.platform;
  const env = i.env ?? process.env;
  /** @type {string[]} */
  const skips = [];
  /** @type {[string, string|null|undefined][]} */
  const explicit = [];
  explicit.push(['flag', i.flag], ['env', env.MF_HOME]);
  for (const [source, value] of explicit) {
    if (!value) continue;
    const dir = resolve(i.cwd ?? process.cwd(), value);
    const reason = reasonOf(dir, i.projectRoot, platform);
    return reason ? { home: null, source, skips, error: `invalid:${source}:${reason}` } : { home: realpathSync(dir), source, skips, error: null };
  }
  const mf = join(i.projectRoot, '.megafactory');
  const str = (/** @type {unknown} */ v) => (typeof v === 'string' && v ? v : null);
  /** @type {[string, string|null][]} */
  const list = [];
  list.push(['local', str(pick(json(join(mf, 'local.json')), 'mfHome'))], ['profile', str(pick(json(join(mf, 'profile.json')), 'factory', 'home'))]);
  list.push(['sibling', join(i.projectRoot, '..', MARKER.product)], ['home', join(i.userHome ?? homedir(), MARKER.product)]);
  for (const [source, value] of list) {
    if (!value || !source) continue;
    const dir = resolve(i.projectRoot, value);
    const reason = reasonOf(dir, i.projectRoot, platform);
    if (!reason) return { home: realpathSync(dir), source, skips, error: null };
    skips.push(`${source}:${reason}`);
  }
  return { home: null, source: null, skips, error: 'not-found' };
}

/** @param {string[]} argv @returns {Promise<number>} */
export async function main(argv) {
  const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
  const at = argv.indexOf('--mf-home');
  const r = resolveHomeMinimal({ projectRoot: root, flag: at >= 0 ? argv[at + 1] ?? null : null });
  if (!r.home) {
    process.stderr.write(`E_MF_HOME: ${r.error}${r.skips.length ? ` (${r.skips.join(', ')})` : ''}; ${HELP}\n`);
    return 1;
  }
  const mf = await import(pathToFileURL(join(r.home, 'bin', 'mf.mjs')).href);
  return mf.main(argv, { target: root });
}

const self = fileURLToPath(import.meta.url);
const entry = process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : '';
if (entry && norm(entry, process.platform) === norm(realpathSync(self), process.platform)) main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
