/**
 * Post-proceso de las páginas generadas por fig2astro.
 *
 * Corrige datos fijos que el diseño de Figma trae como marcadores y que deben salir bien en el HTML
 * estático (SEO y lectores de pantalla), sin depender de JavaScript:
 *  - Colofón: NIT y RNT reales de BorondoTours S.A.S.
 *  - Enlaces legales del colofón → página Nosotros, anclados a la sección "Centro legal".
 *  - Agrega el enlace "Cookies", que faltaba en el diseño.
 *  - Teléfono de contacto real en lugar del marcador +57 300 123 4567.
 *  - CSS: corrige los position:fixed que el exportador asigna por error (ver postprocessCss).
 *  - CSS: neutraliza el relleno sólido del navbar del Home para igualarlo al de /explorar.
 *  - HTML: marca la unión hero → p0_50 con data-bt-seam para el degradado de fig-runtime.css.
 *
 * Es idempotente: se puede correr varias veces sobre la misma página.
 * write.mjs lo aplica al generar; para páginas ya generadas:
 *   node otros/infra/fig2astro/postprocess.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const COMPANY = Object.freeze({ nit: '90208308-7', rnt: '294364' });
/** Ancla de cada documento dentro del Centro legal de /nosotros. */
export const LEGAL_ANCHORS = Object.freeze({
  'Términos': 'terminos',
  'Privacidad': 'privacidad',
  'Cancelación': 'cancelacion',
  'Retracto': 'retracto',
  'Cookies': 'cookies',
});
// El generador escribe `href` antes de `class`; se aceptan ambos órdenes.
const FOOTER_LINK =
  /<a (?:href="[^"]*" class="(p\d+_\d+)"|class="(p\d+_\d+)" href="[^"]*")>(Términos|Privacidad|Cancelación|Retracto|Cookies)<\/a>/g;
/** Teléfono de contacto real (mismo número del WhatsApp de la agencia, src/lib/fig/whatsapp.ts). */
export const CONTACT_PHONE = '+57 322 524 9637';
/**
 * El exportador de Figma marca como `position:fixed;z-index:40` nodos que en el diseño solo
 * estaban anclados a la derecha o abajo. Resultado: el resumen del checkout y los textos
 * "Costo fijo $2.200" flotaban sobre el Auth Gate y se quedaban quietos al hacer scroll.
 * - Texto (lleva font-family): vuelve al flujo de su fila; margin-left:auto lo deja a la derecha.
 * - Bloques anchos (resumen de 440 px): position:absolute con las mismas coordenadas.
 * - Rail de redes (≤ 80 px de ancho): se queda fijo, es el único fijo intencional.
 */
export function postprocessCss(css) {
  let out = css.replace(/(\.p\d+_\d+)\{([^}]*position:fixed[^}]*)\}/g, (rule, selector, body) => {
    const width = Number(/(?:^|;)width:([\d.]+)px/.exec(body)?.[1] ?? 0);
    if (body.includes('font-family')) {
      const next = body
        .replace('position:fixed;z-index:40;', 'position:relative;flex-shrink:0;margin-left:auto;')
        .replace(/;?(?:right|left|top|bottom):-?[\d.]+px/g, '')
        .replace(/;?width:[\d.]+px/, '')
        .replace(/;?height:[\d.]+px/, '');
      return `${selector}{${next.replace(/^;/, '')}}`;
    }
    if (width > 80) return `${selector}{${body.replace('position:fixed;z-index:40;', 'position:absolute;')}}`;
    return rule;
  });
  out = neutralizeHomeNavCapsules(out);
  out = prefillNavGlass(out);
  out = strengthenGlassLayers(out);
  return out;
}

/**
 * Vidrio que no se refleja (bug: tarjetas/paneles planos). El exportador de Figma crea para cada
 * tarjeta de vidrio una capa de fondo con `--semantic-glass-fill` al 6% + `backdrop-filter:blur` +
 * un borde de luz (::after). Ese 6% esta pensado para superficies SOBRE fotografia (el blur mezcla
 * la imagen de atras). Pero sobre el fondo solido de pagina (gradiente), un 6% blanco es casi
 * invisible y el blur no tiene nada que difuminar: la tarjeta se ve plana, solo con el borde tenue.
 *
 * Correccion: estas capas de vidrio usan el MISMO relleno que las tarjetas/modales oficiales
 * (--bt-glass-fill = --glass-figma-fill: morado 50% en Colorido, blanco 25% en Claro, negro 51% en
 * Oscuro), que SI se lee sobre cualquier fondo. Firma unica: relleno glass-fill 6% + backdrop blur
 * en la misma regla (las capas-imagen o los contenedores sin blur no se tocan). Idempotente.
 */
export function strengthenGlassLayers(css) {
  return css.replace(/(\.p\d+_\d+(?:::\w+)?)\{([^}]*)\}/g, (rule, selector, body) => {
    if (selector.includes('::')) return rule; // los ::after (borde de luz) no llevan relleno
    if (!/backdrop-filter:blur/.test(body)) return rule;
    if (!/background-color:color-mix\(in srgb, var\(--semantic-glass-fill[^)]*\) 6%, transparent\)/.test(body)) return rule;
    if (body.includes('--bt-glass-fill')) return rule; // ya corregido
    const next = body.replace(
      /background-color:color-mix\(in srgb, var\(--semantic-glass-fill[^)]*\) 6%, transparent\)/,
      'background-color:var(--bt-glass-fill, color-mix(in srgb, var(--semantic-glass-fill, #ffffff) 50%, transparent))',
    );
    return `${selector}{${next}}`;
  });
}

/**
 * Anti-parpadeo del navbar del Home (bug 6a / FOUC): las cápsulas del navbar
 * (p0_157/p0_163/p0_170) nacen con `background-color:transparent` y solo reciben el azul glass
 * cuando el runtime les aplica `.bt-nav-capsule.bt-glass-std{background-color:var(--bt-nav-fill)}`.
 * Antes de que corra el JS, el navbar se pinta transparente y al llegar el runtime "salta" al azul,
 * lo que produce el parpadeo visible al navegar a Nosotros/Blog.
 *
 * Esta función hace que la cápsula nazca ya con el azul glass en el CSS estático (mismo valor que
 * --bt-nav-fill), de modo que el primer paint ya es correcto y el runtime solo confirma el valor.
 *
 * Firma de esas cápsulas: píldora (`border-radius:999px`) con `background-color:transparent`, el
 * borde de luz del vidrio (`inset 0 0 0 1px color-mix(... glass-border ...)`) y `overflow:hidden`.
 * No toca la capa interna de vidrio translúcido (glass-fill 6%) ni otras píldoras del diseño.
 * Idempotente: si la cápsula ya trae --bt-nav-fill, no la vuelve a tocar.
 */
export function prefillNavGlass(css) {
  return css.replace(/(\.p\d+_\d+)\{([^}]*)\}/g, (rule, selector, body) => {
    if (!/border-radius:999px/.test(body)) return rule;
    if (!/background-color:transparent/.test(body)) return rule;
    if (!/inset 0 0 0 1px color-mix\(in srgb, var\(--semantic-glass-border/.test(body)) return rule;
    if (!/overflow:hidden/.test(body)) return rule;
    if (body.includes('--bt-nav-fill')) return rule; // ya corregido
    const next = body.replace(
      /background-color:transparent;?/,
      // Mismo azul glass que --bt-nav-fill; fallback al azul profundo translucido si no existe.
      'background-color:var(--bt-nav-fill, color-mix(in srgb, var(--brand-azul-profundo, #103b66) 55%, transparent));',
    );
    return `${selector}{${next}}`;
  });
}

/**
 * Navbar del Home (bug 4.3 / H2): el exportador pone un relleno sólido `surface-card` en el
 * contenedor de cada cápsula de la navbar del Home (p0_157/p0_163/p0_170). Por eso el navbar del
 * Home se ve con fondo azul sólido y el de /explorar con vidrio translúcido. La cápsula ya trae su
 * propia capa de vidrio (`.bt-nav-glass`, un div vacío interno): basta con quitar el relleno sólido
 * del contenedor para que el navbar sea idéntico en todas las vistas.
 *
 * Firma única de esas cápsulas: píldora (`border-radius:999px`) con relleno `surface-card` y el
 * borde de luz del vidrio (`inset 0 0 0 1px color-mix(... glass-border ...)`). No toca otras
 * píldoras del diseño (el CTA "Iniciar sesión" usa `action-cta`, no `surface-card`).
 */
export function neutralizeHomeNavCapsules(css) {
  return css.replace(/(\.p\d+_\d+)\{([^}]*)\}/g, (rule, selector, body) => {
    if (!/border-radius:999px/.test(body)) return rule;
    if (!/background-color:var\(--semantic-surface-card[^;)]*\)/.test(body)) return rule;
    if (!/inset 0 0 0 1px color-mix\(in srgb, var\(--semantic-glass-border/.test(body)) return rule;
    const next = body.replace(
      /background-color:var\(--semantic-surface-card[^;)]*\);?/,
      // Nace con el azul glass del navbar (mismo valor que --bt-nav-fill) para no parpadear:
      // el runtime solo refina. Fallback al azul profundo translucido si el token no existe.
      'background-color:color-mix(in srgb, var(--bt-nav-fill, color-mix(in srgb, var(--brand-azul-profundo, #103b66) 55%, transparent)) 100%, transparent);',
    );
    return `${selector}{${next}}`;
  });
}
/**
 * Navbar con vidrio duplicado (bug p45_90): la cápsula de los enlaces (Explorar / Blog / Nosotros)
 * trae su propio relleno Y, dentro, un div vacío absoluto de vidrio (`backdrop-filter`, pastilla
 * 999px) como primer hijo, justo antes de los `<a>`. Las dos superficies se apilan y el pill se ve
 * doble. Se elimina esa capa del markup y la cápsula pasa a ser la ÚNICA superficie: toma el relleno
 * del navbar (--bt-nav-fill, cambia con el tema) y el desenfoque que tenía la capa.
 *
 * Detección estructural (no depende de un id): div vacío + regla CSS `position:absolute;left:0;top:0`
 * con `border-radius:999px` y `backdrop-filter:blur`, seguido de un `<a`. Idempotente.
 * Recibe HTML y CSS porque la capa solo se reconoce cruzando ambos.
 */
export function removeNavLinkGlassLayers(html, css) {
  const layers = new Set();
  for (const m of css.matchAll(/\.(p\d+_\d+)\{([^}]*)\}/g)) {
    const body = m[2];
    if (/position:absolute;left:0;top:0/.test(body) && /border-radius:999px/.test(body) && /backdrop-filter:blur/.test(body)) layers.add(m[1]);
  }
  let outHtml = html;
  let outCss = css;
  for (const layer of layers) {
    const re = new RegExp(`<div class="(p\\d+_\\d+)"><div class="${layer}"></div>(?=<a )`, 'g');
    const parents = new Set();
    for (const m of outHtml.matchAll(re)) parents.add(m[1]);
    if (parents.size === 0) continue;
    outHtml = outHtml.replace(re, (_m, parent) => `<div class="${parent}">`);
    for (const parent of parents) {
      outCss = outCss.replace(new RegExp(`(\\.${parent})\\{([^}]*)\\}`), (_r, sel, body) => {
        const fill = 'background-color:var(--bt-nav-fill, color-mix(in srgb, var(--brand-azul-profundo, #103b66) 55%, transparent))';
        const next = /background-color:[^;]+/.test(body) ? body.replace(/background-color:[^;]+/, fill) : `${fill};${body}`;
        const blur = 'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)';
        return `${sel}{${/backdrop-filter:/.test(next) ? next : `${next};${blur}`}}`;
      });
    }
    // La capa ya no existe: se quitan sus reglas (y la del borde de luz ::after).
    outCss = outCss.replace(new RegExp(`\\.${layer}(?:::after)?\\{[^}]*\\}\\n?`, 'g'), '');
  }
  return { html: outHtml, css: outCss };
}

export function postprocessHtml(html) {
  let out = html
    .replace(/NIT 900\.000\.000-0/g, `NIT ${COMPANY.nit}`)
    .replace(/RNT 00000\b/g, `RNT ${COMPANY.rnt}`)
    .replace(/\+57 300 123 4567/g, CONTACT_PHONE);
  out = out.replace(
    FOOTER_LINK,
    (_m, clsA, clsB, label) => `<a href="/nosotros#${LEGAL_ANCHORS[label]}" class="${clsA ?? clsB}">${label}</a>`,
  );
  // Inserta "Cookies" justo después de "Retracto" si aún no existe en ese colofón.
  out = out.replace(
    /(<a href="\/nosotros#retracto" class="(p\d+_\d+)">Retracto<\/a>)(?!<a href="\/nosotros#cookies")/g,
    (_m, anchor, cls) => `${anchor}<a href="/nosotros#cookies" class="${cls}">Cookies</a>`,
  );
  out = markHeroSeam(out);
  return out;
}

/**
 * Unión hero → p0_50 (bug 4.5 / H5): entre el hero del Home y el bloque p0_50 (que empieza con
 * `surface/page` sólido) hay una línea horizontal dura. Se marca el bloque inferior con
 * `data-bt-seam` para que fig-runtime.css le aplique un degradado de fundido en el borde superior.
 * Idempotente: no vuelve a marcar un bloque que ya tenga el atributo.
 */
export function markHeroSeam(html) {
  return html.replace(
    /<div class="(p0_50)"(?![^>]*data-bt-seam)/g,
    (_m, cls) => `<div class="${cls}" data-bt-seam`,
  );
}
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.astro')) acc.push(p);
  }
  return acc;
}
const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const here = dirname(fileURLToPath(import.meta.url));
  const pages = join(here, '../../../apps/web/src/pages');
  let changed = 0;
  for (const file of walk(pages)) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('GENERADO por otros/infra/fig2astro')) continue;
    const cut = src.indexOf('<style is:global>');
    let htmlPart = cut < 0 ? src : src.slice(0, cut);
    let cssPart = cut < 0 ? '' : src.slice(cut);
    if (cut >= 0) ({ html: htmlPart, css: cssPart } = removeNavLinkGlassLayers(htmlPart, cssPart));
    const next = cut < 0 ? postprocessHtml(src) : postprocessHtml(htmlPart) + postprocessCss(cssPart);
    if (next !== src) {
      writeFileSync(file, next, 'utf8');
      changed++;
    }
  }
  console.log(`postprocess: ${changed} páginas actualizadas`);
}
