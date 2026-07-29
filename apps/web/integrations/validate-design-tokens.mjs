/**
 * validate-design-tokens.mjs — Integración Astro de validación de tokens (Task 2.2)
 *
 * Añade un paso de validación al pipeline de `astro build` que ABORTA el build
 * (con el nombre del/los token(s) faltante(s)) si algún archivo fuente del
 * Portal B2C referencia un design token que no está definido (R1.10).
 *
 * Mecánica:
 *   1. Recolecta el conjunto de tokens DEFINIDOS a partir de las declaraciones
 *      de CSS custom properties (`--nombre: valor;`) en los archivos `.css` de
 *      `src/` — principalmente `styles/tokens.css` (fuente de verdad) y el
 *      bloque `@theme` de `styles/global.css`.
 *   2. Recolecta el conjunto de tokens REFERENCIADOS buscando `var(--nombre)`
 *      en todos los archivos fuente (.astro/.tsx/.ts/.jsx/.js/.css/.mdx).
 *   3. Se limita a los prefijos de design token de la marca para no marcar
 *      variables CSS locales ajenas al sistema de diseño.
 *   4. Si algún token referenciado no está definido, lanza un error indicando
 *      el nombre del token y los archivos donde se usa → el build falla.
 *
 * El hook `astro:build:start` se ejecuta ANTES de emitir artefactos, de modo
 * que un token faltante detiene el build de inmediato.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Prefijos de las CSS custom properties que forman el sistema de diseño. */
const DESIGN_TOKEN_PREFIXES = [
  '--brand-', '--derived-', '--semantic-', '--gradient-', '--type-', '--leading-',
  '--layout-', '--shape-', '--border-', '--elevation-', '--glass-', '--logo-',
  '--icon-', '--motion-', '--color-', '--font-', '--text-', '--container-',
  '--radius-', '--shadow-', '--blur-', '--spacing-', '--ease-', '--z-index-',
]

/** Los hexadecimales visuales solo pueden existir en la fuente de tokens. */
const HEX_LITERAL_RE = /#[0-9a-f]{3,8}\b/gi

/** Extensiones de archivos fuente a escanear. */
const SCAN_EXTENSIONS = new Set(['.astro', '.tsx', '.ts', '.jsx', '.js', '.css', '.mdx'])

/** Declaración de custom property: `--nombre:` (captura el nombre). */
const DEFINE_RE = /(--[a-z0-9-]+)\s*:/gi

/** Referencia a custom property: `var(--nombre` (captura el nombre). */
const VAR_RE = /var\(\s*(--[a-z0-9-]+)/gi

function isDesignToken(name) {
  return DESIGN_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix))
}

/** Recorre `dir` recursivamente y devuelve los archivos fuente escaneables. */
function collectSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    // Ignorar dependencias y carpetas ocultas (.astro, .git, etc.).
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      collectSourceFiles(full, files)
    } else if (SCAN_EXTENSIONS.has(extname(full))) {
      files.push(full)
    }
  }
  return files
}

/**
 * @param {{ srcDir?: string }} [options]
 * @returns {import('astro').AstroIntegration}
 */
export default function validateDesignTokens(options = {}) {
  return {
    name: 'validate-design-tokens',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const srcDir = options.srcDir ?? fileURLToPath(new URL('../src', import.meta.url))
        const files = collectSourceFiles(srcDir)

        /** @type {Set<string>} tokens definidos como CSS custom properties. */
        const defined = new Set()
        /** @type {Map<string, Set<string>>} token referenciado → archivos. */
        const references = new Map()
        /** @type {{ file: string, values: string[] }[]} literales visuales fuera de tokens.css. */
        const literalViolations = []

        for (const file of files) {
          const content = readFileSync(file, 'utf8')
          const extension = extname(file)

          if (['.astro', '.tsx', '.jsx'].includes(extension)) {
            const values = [...content.matchAll(HEX_LITERAL_RE)].map((match) => match[0])
            if (values.length > 0) literalViolations.push({ file, values })
          }

          // Definiciones: solo cuentan en archivos CSS (custom properties reales).
          if (extension === '.css') {
            for (const match of content.matchAll(DEFINE_RE)) {
              defined.add(match[1])
            }
          }

          // Referencias: `var(--token)` en cualquier archivo fuente.
          for (const match of content.matchAll(VAR_RE)) {
            const name = match[1]
            if (!isDesignToken(name)) continue
            if (!references.has(name)) references.set(name, new Set())
            references.get(name).add(file)
          }
        }

        if (literalViolations.length > 0) {
          const details = literalViolations
            .map(({ file, values }) => `  - ${relative(srcDir, file)}: ${[...new Set(values)].join(', ')}`)
            .join('\n')
          throw new Error(
            '[validate-design-tokens] Build abortado: literales hexadecimales en componentes. ' +
              `Usa tokens Tailwind 4 declarados.\n${details}`,
          )
        }

        // Tokens referenciados pero no definidos → falla de build (R1.10).
        const missing = []
        for (const [name, usedIn] of references) {
          if (!defined.has(name)) {
            missing.push({ name, files: [...usedIn] })
          }
        }

        if (missing.length > 0) {
          const names = missing.map((m) => m.name).join(', ')
          const details = missing
            .map(
              ({ name, files: usedIn }) =>
                `  - ${name} (referenciado en: ${usedIn
                  .map((f) => relative(srcDir, f))
                  .join(', ')})`,
            )
            .join('\n')
          throw new Error(
            `[validate-design-tokens] Build abortado: design token(s) no definido(s): ${names}\n${details}\n` +
              'Define el/los token(s) en src/styles/tokens.css o en el bloque @theme de src/styles/global.css.',
          )
        }

        logger.info(
          `Design tokens OK: ${references.size} token(s) de marca referenciado(s), todos definidos.`,
        )
      },
    },
  }
}
