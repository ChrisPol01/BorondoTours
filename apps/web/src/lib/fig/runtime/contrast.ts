// Corrige en el navegador el texto que no cumple WCAG AA sobre su fondo real (4.5:1, o 3:1 si es
// texto grande). El fondo se compone igual que en la auditoría (otros/infra/fig2astro/contrast.mjs):
// colores, degradados y capas de vidrio de los ancestros. Entre los tokens de texto elige el de más
// contraste y se re-ejecuta al cambiar el tema o cuando el runtime agrega contenido.

const TOKENS = [
  "--semantic-text-primary",
  "--semantic-text-on-strong",
  "--semantic-text-on-action",
] as const;

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const COLOR = /rgba?\([^)]+\)|color\(srgb[^)]+\)/g;

function parse(color: string): Rgba | null {
  const s = /color\(srgb ([^)]+)\)/.exec(color);
  if (s?.[1]) {
    const p = s[1].split(/[\s/]+/).filter(Boolean).map(Number);
    return { r: (p[0] ?? 0) * 255, g: (p[1] ?? 0) * 255, b: (p[2] ?? 0) * 255, a: p[3] ?? 1 };
  }
  const m = /rgba?\(([^)]+)\)/.exec(color);
  if (!m?.[1]) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r: p[0] ?? 0, g: p[1] ?? 0, b: p[2] ?? 0, a: p[3] ?? 1 };
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a + bottom.a * (1 - top.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (k: "r" | "g" | "b"): number => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
  return { r: mix("r"), g: mix("g"), b: mix("b"), a };
}

function luminance({ r, g, b }: Rgba): number {
  const f = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

function gradientColor(image: string): Rgba | null {
  const colors = [...image.matchAll(COLOR)].map((m) => parse(m[0])).filter((c): c is Rgba => c !== null);
  if (!colors.length) return null;
  const n = colors.length;
  return colors.reduce((acc, c) => ({ r: acc.r + c.r / n, g: acc.g + c.g / n, b: acc.b + c.b / n, a: acc.a + c.a / n }), {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  });
}

/** Pinta el fondo propio de un nodo sobre `bg`. Devuelve null si es una foto (no se juzga). */
function paint(node: Element, bg: Rgba): Rgba | null {
  if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement) return null;
  const s = getComputedStyle(node);
  if (s.backgroundImage.includes("url(")) return null;
  let out = bg;
  if (s.backgroundImage.includes("gradient")) {
    const g = gradientColor(s.backgroundImage);
    if (g) out = over(g, out);
  }
  const c = parse(s.backgroundColor);
  if (c && c.a > 0) out = over(c, out);
  return out;
}

/** Capas decorativas (vidrio, fotos) que un ancestro pinta debajo del texto, en el punto del texto. */
function underlays(parent: Element, child: Element, x: number, y: number): Element[] {
  const layers: Element[] = [];
  for (const sibling of parent.children) {
    if (sibling === child) break;
    const r = sibling.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    // Capa decorativa: absoluta y sin texto (vidrio vacío, franja con dibujo SVG, foto).
    if (!sibling.textContent?.trim() && getComputedStyle(sibling).position === "absolute") layers.push(sibling);
    // Una foto dentro de la capa la vuelve fotográfica: paint() devolverá null y no se juzga.
    const photo = sibling.querySelector("img, video");
    if (photo && !sibling.textContent?.trim() && getComputedStyle(sibling).position === "absolute") layers.push(photo);
  }
  return layers;
}

function backgroundOf(el: Element): Rgba | null {
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  // Incluye el propio elemento: un botón o una etiqueta pintan su fondo detrás de su texto.
  const chain: Element[] = [];
  for (let n: Element | null = el; n; n = n.parentElement) chain.unshift(n);
  let bg: Rgba | null = { r: 255, g: 255, b: 255, a: 1 };
  for (let i = 0; i < chain.length && bg; i++) {
    const node = chain[i] as Element;
    bg = paint(node, bg);
    const next = chain[i + 1];
    if (next) for (const layer of underlays(node, next, x, y)) if (bg) bg = paint(layer, bg);
  }
  return bg;
}

function dimmed(el: Element): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) if (Number(getComputedStyle(n).opacity) <= 0.6) return true;
  return false;
}

function resolveToken(token: string): Rgba | null {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const c = parse(getComputedStyle(probe).color);
  probe.remove();
  return c;
}

function fix(): void {
  const palette = TOKENS.map((t) => ({ t, c: resolveToken(t) })).filter((x): x is { t: (typeof TOKENS)[number]; c: Rgba } => x.c !== null);
  if (!palette.length) return;
  document.querySelectorAll<HTMLElement>("[data-bt-contrast]").forEach((el) => {
    el.style.removeProperty("color");
    el.removeAttribute("data-bt-contrast");
  });
  const root = document.querySelector(".fig-stage") ?? document.body;
  const seen = new Set<Element>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!el || seen.has(el) || !t.nodeValue?.trim()) continue;
    seen.add(el);
    if (el.closest("svg, script, style, [hidden], .bt-sr-only, [aria-disabled='true'], :disabled")) continue;
    // El chrome fijo cambia de fondo al hacer scroll: su contraste lo resuelven los tokens --bt-glass-*.
    if (el.closest(".bt-nav-fixed, .bt-rail, .bt-fab, .bt-sidebar-fixed")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || dimmed(el)) continue;
    const fg = parse(cs.color);
    const bg = backgroundOf(el);
    if (!fg || !bg) continue;
    const size = Number.parseFloat(cs.fontSize);
    const large = size >= 24 || (Number(cs.fontWeight) >= 700 && size >= 18.66);
    const min = large ? 3 : 4.5;
    const current = ratio(over(fg, bg), bg);
    if (current >= min) continue;
    const best = palette.reduce((a, b) => (ratio(b.c, bg) > ratio(a.c, bg) ? b : a));
    if (ratio(best.c, bg) > current) {
      (el as HTMLElement).style.setProperty("color", `var(${best.t})`, "important");
      el.setAttribute("data-bt-contrast", "");
    }
  }
}

export function initContrast(): void {
  let pending = 0;
  const run = (): void => {
    window.clearTimeout(pending);
    pending = window.setTimeout(() => requestAnimationFrame(fix), 120);
  };
  run();
  new MutationObserver(run).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const stage = document.querySelector(".fig-stage");
  // El runtime agrega tarjetas, documentos y diálogos: solo cambios de hijos (fix() solo toca estilos).
  if (stage) new MutationObserver(run).observe(stage, { childList: true, subtree: true });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", run);
}
