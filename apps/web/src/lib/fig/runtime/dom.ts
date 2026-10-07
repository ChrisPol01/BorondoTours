/** Utilidades DOM del runtime de las vistas generadas (solo navegador). */

export const normalize = (value: string): string => value.replace(/\s+/g, " ").trim();

export const textOf = (node: Element | null | undefined): string => normalize(node?.textContent ?? "");

export const getStage = (): HTMLElement | null => document.querySelector<HTMLElement>(".fig-stage");

export const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Attrs = Readonly<Record<string, string | boolean | undefined>>;

/** Crea un elemento con atributos (true = atributo vacío, false/undefined = se omite) e hijos. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: ReadonlyArray<Node | string> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (name === "class") node.className = String(value);
    else node.setAttribute(name, value === true ? "" : value);
  }
  for (const child of children) node.append(child);
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** Icono de trazo 2 px (estilo de marca). `paths` son atributos `d`. */
export function icon(paths: readonly string[], size = 20): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

export const ICONS = {
  close: ["M18 6 6 18", "M6 6l12 12"],
  prev: ["M15 18l-6-6 6-6"],
  next: ["M9 18l6-6-6-6"],
  arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  tag: ["M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", "M7.5 7.5h.01"],
  flame: ["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"],
  pin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", "M12 10h.01"],
  clock: ["M12 6v6l4 2", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"],
  sun: ["M12 3v2", "M12 19v2", "M4.2 4.2l1.4 1.4", "M18.4 18.4l1.4 1.4", "M3 12h2", "M19 12h2", "M4.2 19.8l1.4-1.4", "M18.4 5.6l1.4-1.4", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"],
  whatsapp: ["M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.4A9 9 0 1 1 21 12z", "M8.5 9.5c.5 2.5 3.5 5.5 6 6l1.5-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"],
} as const;

/** Marca un control para que el enrutador genérico no lo procese. */
export const markHandled = (node: Element): void => node.setAttribute("data-bt-handled", "");

/** Desactiva y activa un estado con animación de salida (clase is-closing) antes de ocultar. */
export function hideAnimated(node: HTMLElement, done?: () => void): void {
  if (node.hidden) return;
  const finish = (): void => {
    node.classList.remove("is-closing");
    node.hidden = true;
    done?.();
  };
  if (reducedMotion()) return finish();
  node.classList.add("is-closing");
  node.addEventListener("animationend", finish, { once: true });
  // Respaldo por si el navegador no emite animationend.
  window.setTimeout(() => { if (!node.hidden) finish(); }, 450);
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hidden && el.offsetParent !== null);
}
