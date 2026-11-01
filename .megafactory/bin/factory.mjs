#!/usr/bin/env node
// @ts-check
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, posix, resolve, win32 } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Lanzador del proyecto (.megafactory/bin/factory.mjs; §23.3.4, MF-D55): raíz desde su ubicación, pin válido
// (E_INTEGRITY si no), central por las fuentes 2-6 de §23.2.2 (paridad en launcher-home-parity.test.mjs),
// desfase, --root reservado y el motor central sobre el proyecto, con su exit. Bytes iguales en todo proyecto.

const MARKER = { file: 'mf-home.json', product: 'megafabrica-sdlc', layouts: [1] };
const REQUIRED = ['engine/scripts/factory.mjs', 'engine/version.json', 'bin/mf.mjs'];
const HELP = 'define MF_HOME (PowerShell: $env:MF_HOME = "<ruta>"; cmd: set MF_HOME=<ruta>; bash/zsh: export MF_HOME=<ruta>) o ejecuta mf link con --mf-home <ruta>';

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
 * Resolución mínima de la central (fuentes 2-6; sin --mf-home, que solo aceptan los comandos mf).
 * @param {{projectRoot:string, env?:Record<string, string|undefined>, platform?:string, userHome?:string, cwd?:string}} i
 * @returns {{home:string|null, source:string|null, skips:string[], error:string|null}}
 */
export function resolveHomeMinimal(i) {
  const platform = i.platform ?? process.platform;
  const env = i.env ?? process.env;
  /** @type {string[]} */
  const skips = [];
  if (env.MF_HOME) {
    const dir = resolve(i.cwd ?? process.cwd(), env.MF_HOME);
    const reason = reasonOf(dir, i.projectRoot, platform);
    return reason ? { home: null, source: 'env', skips, error: `invalid:env:${reason}` } : { home: realpathSync(dir), source: 'env', skips, error: null };
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
    if (reason === 'missing' && source === 'local') return { home: null, source, skips, error: 'invalid:local:missing' }; // MF-10
    skips.push(`${source}:${reason}`);
  }
  return { home: null, source: null, skips, error: 'not-found' };
}

/** @param {string} code @param {string} message @param {number} exit @returns {number} */
const stop = (code, message, exit) => { process.stderr.write(`${code}: ${message}\n`); return exit; };
/** @param {string[]} argv @returns {Promise<number>} */
export async function main(argv) {
  const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
  const lockFile = join(root, '.megafactory', 'megafactory.lock.json');
  if (!existsSync(lockFile)) return stop('E_NOT_LINKED', 'el proyecto no está enlazado a la central: ejecuta mf link', 2);
  const lock = json(lockFile);
  const commit = pick(lock, 'factory', 'commit');
  if (typeof pick(lock, 'factory', 'version') !== 'string' || (commit !== null && typeof commit !== 'string')) return stop('E_INTEGRITY', 'lock-invalid: el pin no es JSON o le falta factory.version o factory.commit (ejecuta mf link)', 4);
  if (argv.some((a) => a === '--root' || a.startsWith('--root='))) return stop('E_ARGS', 'root-reserved: el lanzador fija la raíz del proyecto', 1);
  const r = resolveHomeMinimal({ projectRoot: root });
  if (!r.home) return stop('E_MF_HOME', `${r.error}${r.skips.length ? ` (${r.skips.join(', ')})` : ''}; ${HELP}`, 1);
  const lib = (/** @type {string} */ rel) => import(pathToFileURL(join(/** @type {string} */ (r.home), ...rel.split('/'))).href);
  const drift = await lib('engine/scripts/lib/drift.mjs');
  const d = drift.launcherDrift({ lock, home: r.home, policy: drift.effectivePolicy(drift.projectDriftPolicy(root), process.env), argv, root, env: process.env });
  if (d.error) return stop(d.code ?? 'E_DRIFT', d.error, 2);
  if (d.line) process.stderr.write(`${d.line}\n`);
  const engine = await lib('engine/scripts/factory.mjs');
  return engine.run(engine.liftSubcommand(argv), { root });
}

const entry = process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : '';
if (entry && norm(entry, process.platform) === norm(realpathSync(fileURLToPath(import.meta.url)), process.platform)) main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
