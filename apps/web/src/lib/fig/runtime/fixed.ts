/**
 * Chrome fijo al hacer scroll en todas las pantallas con navegación:
 * - Navbar pública: queda fija arriba; al bajar, sus cápsulas toman el vidrio fuerte del tema
 *   (glass-strong + glass-text) para leerse sobre cualquier contenido.
 * - Sidebar privado: fijo a la izquierda, del alto de la ventana (solo el contenido hace scroll).
 * - FAB "¿Te ayudamos?" y rail de redes: se agregan donde el diseño no los trae y quedan fijos.
 *
 * No aplica en checkout, pago, acceso ni páginas de error: allí no hay navbar ni sidebar.
 */
import { openAssistant } from "./assistant";
import { findNav } from "./chrome";
import { getStage, h, markHandled, textOf } from "./dom";
import { translateTree } from "./i18n-dom";
import { figScale, rootChild, stretchGlass } from "./layout";
const SVG_NS = "http://www.w3.org/2000/svg";
/**
 * Redes oficiales de la marca (las mismas del footer). Cada una lleva su logo de color como SVG
 * inline (ver `brandLogo`), para que el rail muestre el color de cada red y no un trazo monocromo.
 * Los colores de estos logos son de marcas de terceros (excepción documentada en fig-runtime.css):
 * solo se usan dentro del rail y el corrector de contraste (`contrast.ts`) no los recolorea.
 */
const SOCIAL = [
  { label: "Instagram", key: "instagram" as const, href: "https://instagram.com/borondotours" },
  { label: "Facebook", key: "facebook" as const, href: "https://facebook.com/borondotours" },
  { label: "TikTok", key: "tiktok" as const, href: "https://tiktok.com/@borondotours" },
] as const;
const BOT_ICON = ["M12 8V4H8", "M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z", "M2 14h2", "M20 14h2", "M15 13v2", "M9 13v2"];
function strokeIcon(paths: readonly string[], size: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({ viewBox: "0 0 24 24", width: String(size), height: String(size), fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })) svg.setAttribute(k, v);
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}
/** Contador para dar un id único al degradado de Instagram (evita colisión si el rail se monta dos veces). */
let gradientSeq = 0;
function svgEl<K extends string>(tag: K, attrs: Readonly<Record<string, string>>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
/**
 * Logo de color de cada red como SVG inline (24×24). Formas geométricas simples construidas con
 * primitivas (rect redondeado, círculo, glifo) sobre los colores oficiales de cada plataforma,
 * tomados de los tokens `--bt-social-*` (fig-runtime.css). `aria-hidden`: el nombre lo da el enlace.
 */
function brandLogo(key: (typeof SOCIAL)[number]["key"]): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({ viewBox: "0 0 24 24", width: "22", height: "22", "aria-hidden": "true", focusable: "false" })) svg.setAttribute(k, v);
  if (key === "instagram") {
    const id = `bt-ig-${gradientSeq++}`;
    const defs = svgEl("defs", {});
    const grad = svgEl("linearGradient", { id, x1: "2", y1: "22", x2: "22", y2: "2", gradientUnits: "userSpaceOnUse" });
    const stops: [string, string][] = [
      ["0", "var(--bt-social-instagram-1)"],
      ["0.25", "var(--bt-social-instagram-2)"],
      ["0.55", "var(--bt-social-instagram-3)"],
      ["0.8", "var(--bt-social-instagram-4)"],
      ["1", "var(--bt-social-instagram-5)"],
    ];
    for (const [offset, color] of stops) grad.append(svgEl("stop", { offset, "stop-color": color }));
    defs.append(grad);
    svg.append(defs);
    svg.append(svgEl("rect", { x: "2", y: "2", width: "20", height: "20", rx: "6", fill: `url(#${id})` }));
    svg.append(svgEl("circle", { cx: "12", cy: "12", r: "4.3", fill: "none", stroke: "#ffffff", "stroke-width": "1.8" }));
    svg.append(svgEl("circle", { cx: "17.1", cy: "6.9", r: "1.25", fill: "#ffffff" }));
    return svg;
  }
  if (key === "facebook") {
    svg.append(svgEl("rect", { x: "2", y: "2", width: "20", height: "20", rx: "6", fill: "var(--bt-social-facebook)" }));
    // Glifo "f" blanco construido con un trazo.
    svg.append(svgEl("path", { d: "M14.6 7.3h-1.4c-.9 0-1.4.5-1.4 1.4V10h2.6l-.4 2.7h-2.2V20h-2.7v-7.3H7V10h2.1V8.3c0-2 1.2-3.3 3.2-3.3h2.3Z", fill: "#ffffff" }));
    return svg;
  }
  // TikTok: fondo negro con la nota en cian y rojo desplazados y la nota blanca encima.
  svg.append(svgEl("rect", { x: "2", y: "2", width: "20", height: "20", rx: "6", fill: "var(--bt-social-tiktok)" }));
  const note = "M14.9 6c.3 1.6 1.3 2.6 2.9 2.8v2.1c-1 .05-1.9-.2-2.8-.75v3.9a3.9 3.9 0 1 1-3.9-3.9c.2 0 .4 0 .6.05v2.15a1.8 1.8 0 1 0 1.3 1.73V6Z";
  svg.append(svgEl("path", { d: note, fill: "var(--bt-social-tiktok-cyan)", transform: "translate(-0.9 0.6)" }));
  svg.append(svgEl("path", { d: note, fill: "var(--bt-social-tiktok-red)", transform: "translate(0.9 -0.6)" }));
  svg.append(svgEl("path", { d: note, fill: "#ffffff" }));
  return svg;
}
/* ---------------- Navbar pública ---------------- */
/** Colores "tinta" del vidrio: tokens que se cambian a glass-text al bajar. */
function inkColors(): Set<string> {
  const probe = h("span", { "aria-hidden": "true" });
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.append(probe);
  const colors = new Set<string>();
  for (const token of ["--semantic-text-on-strong", "--semantic-glass-text", "--semantic-text-primary", "--semantic-text-on-photo"]) {
    probe.style.color = `var(${token})`;
    colors.add(getComputedStyle(probe).color);
  }
  probe.remove();
  return colors;
}
function markInk(capsule: HTMLElement, colors: Set<string>): void {
  for (const el of capsule.querySelectorAll<HTMLElement | SVGElement>("span, a, button, path, rect, circle")) {
    if (el.closest(".bt-menu")) continue;
    // El botón de acción (Iniciar sesión, turquesa) conserva su texto oscuro.
    if (el.closest('a[href="/iniciar-sesion"], a[href="/mis-reservas"].bt-account')) continue;
    const style = getComputedStyle(el);
    const isShape = el instanceof SVGElement;
    const value = isShape ? style.fill : style.color;
    if (colors.has(value)) el.classList.add(isShape ? "bt-ink-fill" : "bt-ink");
  }
}
function setupNav(stage: HTMLElement): void {
  const nav = findNav(stage);
  if (!nav) return;
  const block = rootChild(stage, nav.row);
  if (!block) return;
  // Solo el bloque de la navbar (no un contenedor más grande que la incluya).
  const target = block.offsetHeight <= 120 ? block : nav.row;
  if (target !== block) {
    const scale = figScale();
    const rect = target.getBoundingClientRect();
    target.style.left = `${rect.left / scale}px`;
    target.style.top = `${(rect.top + window.scrollY) / scale}px`;
    target.style.width = `${rect.width / scale}px`;
  }
  target.classList.add("bt-nav-fixed");
  const colors = inkColors();
  for (const capsule of nav.row.children) {
    if (!(capsule instanceof HTMLElement)) continue;
    capsule.classList.add("bt-nav-capsule");
    const glass = capsule.firstElementChild;
    if (glass instanceof HTMLElement && glass.tagName === "DIV" && glass.childElementCount === 0) glass.classList.add("bt-nav-glass");
    // El logo envuelto en enlace: su cápsula real es el primer hijo.
    const inner = capsule.tagName === "A" ? capsule.firstElementChild : null;
    if (inner instanceof HTMLElement) {
      const innerGlass = inner.firstElementChild;
      if (innerGlass instanceof HTMLElement && innerGlass.childElementCount === 0) innerGlass.classList.add("bt-nav-glass");
    }
    markInk(capsule, colors);
  }
  const sync = (): void => { target.classList.toggle("bt-nav-scrolled", window.scrollY > 8); };
  sync();
  window.addEventListener("scroll", sync, { passive: true });
}
/* ---------------- Sidebar privado ---------------- */
function findSidebar(stage: HTMLElement): HTMLElement | null {
  const profile = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s) === "Ver perfil");
  if (!profile) return null;
  const block = rootChild(stage, profile);
  // El sidebar es una columna angosta (272 px en el diseño).
  return block && block.offsetWidth <= 320 ? block : null;
}
function setupSidebar(stage: HTMLElement): void {
  const sidebar = findSidebar(stage);
  if (!sidebar) return;
  const groups = [...sidebar.children].filter((c): c is HTMLElement => c instanceof HTMLElement);
  groups.forEach(stretchGlass);
  // Alto mínimo para que todo el menú sea visible; si la ventana es más baja, no se fija.
  const minimum = 560;
  const fit = (): void => {
    const available = window.innerHeight / figScale() - 32;
    const fits = available >= minimum;
    sidebar.classList.toggle("bt-sidebar-fixed", fits);
    sidebar.style.height = fits ? `${Math.max(available, 0)}px` : "";
  };
  fit();
  window.addEventListener("resize", fit, { passive: true });
}
/* ---------------- FAB y rail de redes ---------------- */
function ensureFab(stage: HTMLElement): void {
  const existing = [...stage.querySelectorAll<HTMLButtonElement>("button")].find((b) => textOf(b) === "¿Te ayudamos?");
  if (existing) return; // chrome.ts ya lo fija y lo conecta al asistente.
  const fab = h("button", { type: "button", class: "bt-fab", "aria-haspopup": "dialog" }, [strokeIcon(BOT_ICON, 24), h("span", {}, ["¿Te ayudamos?"])]);
  markHandled(fab);
  fab.addEventListener("click", () => openAssistant(undefined, fab));
  stage.append(fab);
  translateTree(fab);
}
function socialLink(item: (typeof SOCIAL)[number]): HTMLAnchorElement {
  const link = h("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", class: "bt-rail-link", "aria-label": `${item.label} de BorondoTours (se abre en otra pestaña)`, "data-bt-social": item.key }, [brandLogo(item.key)]);
  markHandled(link);
  return link;
}
function ensureRail(stage: HTMLElement): void {
  // El Home trae el rail (tres iconos dentro de una cápsula fija): se convierten en enlaces.
  const homeRail = [...stage.querySelectorAll<HTMLElement>("div")].find((d) => getComputedStyle(d).position === "fixed" && d.querySelectorAll("svg").length === 3 && !d.querySelector("span"));
  if (homeRail) {
    homeRail.classList.add("bt-rail", "bt-rail-host");
    homeRail.setAttribute("aria-label", "Redes sociales");
    const icons = [...homeRail.querySelectorAll<SVGSVGElement>("svg")];
    icons.forEach((svg, i) => {
      const item = SOCIAL[i];
      if (!item) return;
      svg.replaceWith(socialLink(item));
    });
    // Si el Home trae más o menos de 3 iconos, asegura exactamente las 3 redes.
    for (let i = icons.length; i < SOCIAL.length; i++) {
      const item = SOCIAL[i];
      if (item) homeRail.append(socialLink(item));
    }
    translateTree(homeRail);
    return;
  }
  const rail = h("nav", { class: "bt-rail", "aria-label": "Redes sociales" }, SOCIAL.map((item) => socialLink(item)));
  stage.append(rail);
  translateTree(rail);
}
/**
 * Colofón: en pantallas con sidebar es más angosto y sus dos grupos (datos legales y enlaces)
 * quedan pegados. Se reduce el relleno lateral hasta que quepan con separación.
 */
function fitColophon(stage: HTMLElement): void {
  const mark = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).startsWith("© 2026 BorondoTours"));
  const group = mark?.parentElement;
  const bar = group?.parentElement;
  if (!group || !bar || bar.children.length < 2) return;
  bar.style.columnGap = "32px";
  for (const padding of [80, 56, 40, 24]) {
    bar.style.paddingLeft = `${padding}px`;
    bar.style.paddingRight = `${padding}px`;
    if (bar.scrollWidth <= bar.clientWidth) return;
  }
  for (const child of bar.children) if (child instanceof HTMLElement) child.style.columnGap = "12px";
}
/** Cuando el colofón entra en pantalla, el FAB sube para no tapar sus enlaces. */
function liftFabOverColophon(stage: HTMLElement): void {
  const mark = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).startsWith("© 2026 BorondoTours"));
  const bar = mark?.parentElement?.parentElement;
  if (!bar || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.some((e) => e.isIntersecting);
    document.documentElement.classList.toggle("bt-colophon-visible", visible);
  });
  observer.observe(bar);
}
/** Nota de TikTok en un solo color (hereda el color del texto), para el colofón monocromo. */
function tiktokGlyph(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({ viewBox: "0 0 24 24", width: "18", height: "18", fill: "currentColor", "aria-hidden": "true", focusable: "false" })) svg.setAttribute(k, v);
  svg.append(svgEl("path", { d: "M14.9 2c.3 2.4 1.7 3.9 4.1 4.2v3.1c-1.5.05-2.9-.4-4.1-1.2v6.6a6 6 0 1 1-6-6c.3 0 .6 0 .9.07v3.2a2.9 2.9 0 1 0 2 2.75V2Z" }));
  return svg;
}
/**
 * Íconos de redes del colofón: el diseño los trae como dibujos sin enlace. Se convierten en
 * enlaces reales a las mismas redes oficiales del rail (Instagram, Facebook y TikTok).
 */
function linkColophonSocials(stage: HTMLElement): void {
  const mark = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).startsWith("© 2026 BorondoTours"));
  const links = mark?.parentElement?.parentElement?.lastElementChild;
  if (!links) return;
  const icons = [...links.children].filter((c): c is SVGSVGElement => c instanceof SVGSVGElement);
  icons.slice(0, SOCIAL.length).forEach((svg, i) => {
    const item = SOCIAL[i];
    if (!item) return;
    const icon = item.key === "tiktok" ? tiktokGlyph() : svg;
    const link = h("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", class: "bt-colophon-social", "aria-label": `${item.label} de BorondoTours (se abre en otra pestaña)` });
    markHandled(link);
    svg.before(link);
    link.append(icon);
    if (icon !== svg) svg.remove();
  });
}
export function initFixedChrome(): void {
  const stage = getStage();
  if (!stage) return;
  linkColophonSocials(stage);
  fitColophon(stage);
  liftFabOverColophon(stage);
  const hasNav = Boolean(findNav(stage));
  const hasSidebar = Boolean(findSidebar(stage));
  if (!hasNav && !hasSidebar) return;
  if (hasNav) setupNav(stage);
  if (hasSidebar) setupSidebar(stage);
  ensureFab(stage);
  ensureRail(stage);
}
