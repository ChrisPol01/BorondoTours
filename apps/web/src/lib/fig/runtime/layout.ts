/**
 * Utilidades de maquetación sobre las vistas generadas (posicionamiento absoluto de Figma).
 *
 * Cada página tiene una raíz (primer hijo de .fig-stage) con alto fijo y bloques absolutos. Cuando
 * el runtime agrega o quita contenido (filas del catálogo, textos legales), `fitBlock` crece el
 * bloque, baja los bloques que están debajo y alarga la raíz, siempre desde las medidas originales
 * (se puede llamar varias veces sin acumular desplazamientos).
 */

/** Factor de escala del escenario (el diseño de 1440 se ajusta al ancho de la ventana). */
export function figScale(): number {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fig-scale"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function pageRoot(stage: HTMLElement): HTMLElement | null {
  return stage.firstElementChild instanceof HTMLElement ? stage.firstElementChild : null;
}

/** Ancestro de `node` que es hijo directo de la raíz de la página. */
export function rootChild(stage: HTMLElement, node: Element): HTMLElement | null {
  const root = pageRoot(stage);
  if (!root) return null;
  let current: Element | null = node;
  while (current && current.parentElement !== root) current = current.parentElement;
  return current instanceof HTMLElement ? current : null;
}

const px = (value: string): number => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

/** Medidas originales (del CSS generado) guardadas la primera vez que se tocan. */
function original(node: HTMLElement, prop: "top" | "height"): number {
  const key = `btOrig${prop === "top" ? "Top" : "Height"}`;
  const stored = node.dataset[key];
  if (stored !== undefined) return Number(stored);
  const value = px(getComputedStyle(node)[prop]);
  node.dataset[key] = String(value);
  return value;
}

/**
 * Ajusta el alto de un bloque absoluto (hijo de la raíz) a `height` px y desplaza lo que está debajo.
 * Por defecto solo crece (si el contenido cabe en el alto original, todo vuelve a su lugar);
 * con `allowShrink` el bloque también puede quedar más bajo que el original (p. ej. el hero en
 * ventanas bajas) y lo de abajo sube.
 */
export function fitBlock(stage: HTMLElement, block: HTMLElement, height: number, allowShrink = false): void {
  const root = pageRoot(stage);
  if (!root || block.parentElement !== root) return;
  const baseHeight = original(block, "height");
  const raw = Math.ceil(height - baseHeight);
  const delta = allowShrink ? raw : Math.max(0, raw);
  block.dataset.btDelta = String(delta);
  block.style.height = `${baseHeight + delta}px`;

  // Varios bloques pueden crecer en la misma página: cada hijo baja la suma de lo que crecieron
  // los bloques que terminan por encima de él (siempre desde las medidas originales).
  const absolute = [...root.children].filter(
    (c): c is HTMLElement => c instanceof HTMLElement && getComputedStyle(c).position === "absolute",
  );
  const grown = absolute
    .filter((c) => Number(c.dataset.btDelta ?? 0) !== 0)
    .map((c) => ({ bottom: original(c, "top") + original(c, "height"), delta: Number(c.dataset.btDelta) }));
  for (const child of absolute) {
    const childTop = original(child, "top");
    const shift = grown.reduce((sum, g) => (childTop >= g.bottom - 1 ? sum + g.delta : sum), 0);
    child.style.top = `${childTop + shift}px`;
  }
  const total = grown.reduce((sum, g) => sum + g.delta, 0);
  root.style.height = `${original(root, "height") + total}px`;
}

/**
 * Deja que un contenedor interno (y sus ancestros hasta el bloque de la raíz) tomen el alto de su
 * contenido y ajusta el bloque con `fitBlock`. Llamar después de cada cambio de contenido.
 */
export function growWithContent(stage: HTMLElement, inner: HTMLElement): void {
  const block = rootChild(stage, inner);
  if (!block) return;
  fitBlock(stage, block, 0); // guarda las medidas originales antes de tocar nada
  for (let node: HTMLElement | null = inner; node && node !== block; node = node.parentElement) {
    // Siempre dejamos que cada ancestro tome el alto de su contenido ACTUAL. Antes se cacheaba el
    // alto expandido en minHeight una sola vez (btGrow) y nunca se reseteaba: al colapsar, el div
    // no podia encogerse por debajo de ese minHeight y quedaba gigante (bug del acordeon legal).
    // Guardamos el alto base original una vez (btGrow) solo como referencia, pero el minHeight se
    // recalcula en cada pasada midiendo el contenido real con height:auto.
    if (node.dataset.btGrow === undefined) {
      node.dataset.btGrow = getComputedStyle(node).height;
      stretchGlass(node);
    }
    node.style.minHeight = "0";
    node.style.height = "auto";
  }
  block.style.height = "auto";
  const needed = block.offsetHeight;
  fitBlock(stage, block, needed);
}

/** Capas "Cristal" (div vacío absoluto, primer hijo) de un contenedor: se estiran al 100 %. */
export function stretchGlass(container: HTMLElement): void {
  const layer = container.firstElementChild;
  if (layer instanceof HTMLElement && layer.tagName === "DIV" && layer.childElementCount === 0) {
    if (getComputedStyle(layer).position === "absolute") layer.classList.add("bt-glass-fill");
  }
}
