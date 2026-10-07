/**
 * Catálogo /explorar funcional sobre el diseño generado: búsqueda, categorías, región, precio,
 * tipo, duración, dificultad, IVA, orden, chips activos, "Cargar más" y tarjetas que llevan al
 * detalle del tour para reservar. Estado en la URL (compartible). Datos en ../catalog.ts.
 */
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, DURATION_LABELS, EMPTY_FILTERS, filtersToParams, formatCop,
  PAGE_SIZE, parseFilters, PRICE_MAX, PRICE_MIN, PRICE_STEP, REGION_NAMES, searchCatalog, SORT_LABELS, TYPE_LABELS,
  type CatalogTour, type Category, type Difficulty, type Duration, type Filters, type PlanType, type Region, type Sort,
} from "../catalog";
import { getStage, h, markHandled, textOf } from "./dom";
import { setSourceText, translateTree } from "./i18n-dom";
import { fitBlock, rootChild } from "./layout";
import { bindDropdown, closeAll } from "./menu";
import { cardFromCatalog, createTourCard, createTourCardSkeleton, makeCardGrid } from "./tour-card";

const invert = <K extends string>(map: Readonly<Record<K, string>>): Map<string, K> =>
  new Map((Object.entries(map) as [K, string][]).map(([k, v]) => [v, k]));

let filters: Filters = EMPTY_FILTERS;
let shown = PAGE_SIZE;
const listeners: (() => void)[] = [];

function update(next: Partial<Filters>, resetPage = true): void {
  filters = { ...filters, ...next, featured: next.featured ?? (resetPage ? null : filters.featured) };
  if (resetPage) shown = PAGE_SIZE;
  const qs = filtersToParams(filters).toString();
  history.replaceState(null, "", qs ? `/explorar?${qs}` : "/explorar");
  for (const fn of listeners) fn();
}

const toggle = <T>(list: readonly T[], value: T): T[] => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

function spanByText(root: ParentNode, text: string): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>("span, h3")].find((s) => textOf(s) === text);
}

function asControl(el: HTMLElement, role: string, onActivate: () => void): void {
  markHandled(el);
  el.setAttribute("role", role);
  el.tabIndex = 0;
  el.style.cursor = "pointer";
  el.addEventListener("click", (e) => { e.preventDefault(); onActivate(); });
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onActivate(); } });
}

/* ---------------- Búsqueda ---------------- */

function setupSearch(stage: HTMLElement): void {
  const placeholder = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).startsWith("Busca por destino"));
  const box = placeholder?.parentElement;
  if (!placeholder || !box) return;
  const input = h("input", { type: "search", class: "bt-search-input", placeholder: textOf(placeholder), "aria-label": "Buscar tours", maxlength: "80", value: filters.q, autocomplete: "off" });
  placeholder.replaceWith(input);
  const btn = [...box.querySelectorAll<HTMLElement>("button, div")].find((b) => textOf(b) === "Buscar");
  let timer = 0;
  input.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => update({ q: input.value.trim() }), 300);
  });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); update({ q: input.value.trim() }); } });
  if (btn) asControl(btn, "button", () => update({ q: input.value.trim() }));
  listeners.push(() => { if (document.activeElement !== input) input.value = filters.q; });
}

/* ---------------- Chips (categorías y opciones múltiples) ---------------- */

function chip(el: HTMLElement, isOn: () => boolean, onToggle: () => void): void {
  el.classList.add("bt-chip");
  // La fila contenedora se marca para que fig-runtime.css le quite el recorte vertical (bug 4.4).
  el.parentElement?.classList.add("bt-chip-row");
  asControl(el, "button", onToggle);
  const paint = (): void => el.setAttribute("aria-pressed", String(isOn()));
  paint();
  listeners.push(paint);
}

function setupCategories(stage: HTMLElement): void {
  const all = spanByText(stage, "Todas")?.parentElement;
  const row = all?.parentElement;
  if (!all || !row) return;
  chip(all, () => !filters.category, () => update({ category: null }));
  const map = invert(CATEGORY_LABELS);
  for (const el of [...row.children] as HTMLElement[]) {
    const code = map.get(textOf(el)) as Category | undefined;
    if (code) chip(el, () => filters.category === code, () => update({ category: filters.category === code ? null : code }));
  }
}

function setupFilterPanel(stage: HTMLElement): HTMLElement | null {
  const title = spanByText(stage, "Filtros");
  const panel = title ? rootChild(stage, title) : null;
  if (!panel) return null;

  // Región: casillas.
  const regions = invert(REGION_NAMES);
  for (const [label, code] of regions) {
    const row = spanByText(panel, label)?.parentElement;
    if (!row) continue;
    const box = row.firstElementChild;
    const check = h("span", { class: "bt-check", "aria-hidden": "true" });
    if (box) box.replaceWith(check);
    else row.prepend(check);
    asControl(row, "checkbox", () => update({ regions: toggle(filters.regions, code as Region) }));
    const paint = (): void => row.setAttribute("aria-checked", String(filters.regions.includes(code as Region)));
    paint();
    listeners.push(paint);
  }

  const group = <K extends string>(labels: Readonly<Record<K, string>>, key: "types" | "durations" | "difficulties"): void => {
    for (const [label, code] of invert(labels)) {
      const el = spanByText(panel, label)?.parentElement;
      if (!el) continue;
      chip(el, () => (filters[key] as readonly string[]).includes(code), () => update({ [key]: toggle(filters[key] as readonly string[], code) } as Partial<Filters>));
    }
  };
  group<PlanType>(TYPE_LABELS, "types");
  group<Duration>(DURATION_LABELS, "durations");
  group<Difficulty>(DIFFICULTY_LABELS, "difficulties");

  // Precio: dos controles deslizantes reales.
  const priceTitle = spanByText(panel, "Precio por persona");
  const priceBox = priceTitle?.parentElement;
  if (priceTitle && priceBox) {
    for (const el of [...priceBox.children]) if (el !== priceTitle) (el as HTMLElement).style.display = "none";
    const mk = (label: string, value: number): HTMLInputElement =>
      h("input", { type: "range", min: String(PRICE_MIN), max: String(PRICE_MAX), step: String(PRICE_STEP), value: String(value), "aria-label": label });
    const lo = mk("Precio mínimo", filters.min);
    const hi = mk("Precio máximo", filters.max);
    const out = h("div", { class: "bt-range-out", "aria-live": "polite" });
    const paint = (): void => {
      lo.value = String(filters.min);
      hi.value = String(filters.max);
      out.textContent = `${formatCop(filters.min)} – ${formatCop(filters.max)}${filters.max === PRICE_MAX ? "+" : ""}`;
      const a = ((filters.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
      const b = ((filters.max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
      wrap.style.setProperty("--a", `${a}%`);
      wrap.style.setProperty("--b", `${b}%`);
    };
    const wrap = h("div", { class: "bt-range" }, [lo, hi]);
    let t = 0;
    const onInput = (which: "lo" | "hi"): void => {
      let min = Number(lo.value);
      let max = Number(hi.value);
      if (min > max) { if (which === "lo") min = max; else max = min; }
      filters = { ...filters, min, max };
      paint();
      window.clearTimeout(t);
      t = window.setTimeout(() => update({ min, max }), 200);
    };
    lo.addEventListener("input", () => onInput("lo"));
    hi.addEventListener("input", () => onInput("hi"));
    priceBox.append(wrap, out);
    paint();
    listeners.push(paint);
  }

  // IVA: interruptor.
  const ivaRow = spanByText(panel, "Solo con exención de IVA (extranjeros)")?.parentElement;
  if (ivaRow) {
    const knob = h("span", { class: "bt-switch", "aria-hidden": "true" });
    const original = [...ivaRow.children].filter((c) => c.tagName !== "SPAN");
    original.forEach((c) => c.remove());
    ivaRow.append(knob);
    asControl(ivaRow, "switch", () => update({ iva: !filters.iva }));
    const paint = (): void => ivaRow.setAttribute("aria-checked", String(filters.iva));
    paint();
    listeners.push(paint);
  }

  const clear = spanByText(panel, "Limpiar");
  if (clear) asControl(clear, "button", () => update({ ...EMPTY_FILTERS }));
  return panel;
}

/* ---------------- Resumen, orden y chips activos ---------------- */

function setupSummary(stage: HTMLElement, results: () => CatalogTour[]): void {
  const count = [...stage.querySelectorAll<HTMLElement>("span, h3")].find((s) => /^\d+ tours/.test(textOf(s)));
  const sortEl = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).startsWith("Ordenar:"));
  const sortBox = sortEl?.parentElement;
  const activeRow = spanByText(stage, "Caribe —")?.parentElement?.parentElement ?? null;

  if (sortEl && sortBox) {
    const menu = h("div", { id: "bt-menu-sort", class: "bt-menu bt-menu--right bt-glass", hidden: true, "aria-label": "Ordenar" });
    for (const [code, label] of Object.entries(SORT_LABELS) as [Sort, string][]) {
      const item = h("button", { type: "button", class: "bt-menu-item", "data-sort": code }, [label]);
      markHandled(item);
      item.addEventListener("click", () => { closeAll(); update({ sort: code }, false); sortBox.focus(); });
      menu.append(item);
    }
    sortBox.setAttribute("role", "button");
    sortBox.tabIndex = 0;
    markHandled(sortBox);
    sortBox.style.overflow = "visible";
    sortBox.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortBox.click(); } });
    const host = sortBox.parentElement ?? sortBox;
    host.style.overflow = "visible";
    host.style.position = "relative";
    bindDropdown(sortBox, menu, host);
    listeners.push(() => {
      setSourceText(sortEl, `Ordenar: ${SORT_LABELS[filters.sort]}`);
      menu.querySelectorAll<HTMLElement>("[data-sort]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sort === filters.sort)));
    });
  }

  const template = activeRow?.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
  listeners.push(() => {
    const list = results();
    if (count) {
      const parts = [...filters.regions.map((r) => REGION_NAMES[r]), ...(filters.category ? [CATEGORY_LABELS[filters.category]] : [])];
      setSourceText(count, `${list.length} tours${parts.length ? ` · ${parts.join(" y ")}` : ""}`);
    }
    if (!activeRow || !template) return;
    const chips: { label: string; clear: Partial<Filters> }[] = [
      ...(filters.q ? [{ label: `“${filters.q}”`, clear: { q: "" } }] : []),
      ...(filters.category ? [{ label: CATEGORY_LABELS[filters.category], clear: { category: null } }] : []),
      ...filters.regions.map((r) => ({ label: REGION_NAMES[r], clear: { regions: filters.regions.filter((x) => x !== r) } })),
      ...filters.types.map((v) => ({ label: TYPE_LABELS[v], clear: { types: filters.types.filter((x) => x !== v) } })),
      ...filters.durations.map((v) => ({ label: DURATION_LABELS[v], clear: { durations: filters.durations.filter((x) => x !== v) } })),
      ...filters.difficulties.map((v) => ({ label: DIFFICULTY_LABELS[v], clear: { difficulties: filters.difficulties.filter((x) => x !== v) } })),
      ...(filters.min !== PRICE_MIN || filters.max !== PRICE_MAX ? [{ label: `${formatCop(filters.min)} – ${formatCop(filters.max)}`, clear: { min: PRICE_MIN, max: PRICE_MAX } }] : []),
      ...(filters.iva ? [{ label: "Exento de IVA", clear: { iva: false } }] : []),
    ];
    activeRow.replaceChildren(...chips.map((c) => {
      const el = template.cloneNode(true) as HTMLElement;
      const span = el.querySelector("span") ?? el;
      span.textContent = `${c.label} —`;
      translateTree(el);
      el.setAttribute("aria-label", `Quitar filtro ${c.label}`);
      asControl(el, "button", () => update(c.clear));
      return el;
    }));
  });
}

/* ---------------- Tarjetas ---------------- */

function setupGrid(stage: HTMLElement, results: () => CatalogTour[]): void {
  // La grilla: contenedor con flex-wrap que agrupa más títulos de tarjeta (h3).
  const grid = [...stage.querySelectorAll<HTMLElement>("div")]
    .filter((d) => getComputedStyle(d).flexWrap === "wrap" && d.children.length >= 3)
    .sort((a, b) => b.querySelectorAll("h3").length - a.querySelectorAll("h3").length)[0];
  if (!grid?.firstElementChild) return;
  // Todas las tarjetas son la tarjeta estándar (tour-card.ts): la grilla pasa a ser CSS grid.
  makeCardGrid(grid);
  const block = rootChild(stage, grid);
  const more = [...stage.querySelectorAll<HTMLElement>("button, a, div")].find((b) => textOf(b) === "Cargar más tours" && b.children.length <= 2);
  const moreBlock = more ? rootChild(stage, more) : null;
  if (more) asControl(more, "button", () => { shown += PAGE_SIZE; update({}, false); });
  // Guarda las medidas del diseño (alto del bloque y posición de lo que está debajo) ANTES de
  // cambiar las tarjetas; si no, el alto "original" sería ya el del contenido nuevo y el botón
  // "Cargar más tours" quedaría encima de la última fila.
  if (block) fitBlock(stage, block, 0);

  listeners.push(() => {
    const list = results();
    const page = list.slice(0, shown);
    grid.replaceChildren(...page.map((t) => {
      const el = createTourCard(cardFromCatalog(t), { featured: filters.featured === t.slug });
      translateTree(el);
      return el;
    }));
    if (list.length === 0) {
      const empty = h("div", { class: "bt-empty", role: "status" }, [
        h("h3", {}, ["No encontramos tours con esos filtros"]),
        h("p", {}, ["Prueba con otra región, amplía el rango de precio o quita algunos filtros."]),
      ]);
      const reset = h("button", { type: "button", class: "bt-cta" }, ["Limpiar filtros"]);
      markHandled(reset);
      reset.addEventListener("click", () => update({ ...EMPTY_FILTERS }));
      empty.append(reset);
      grid.append(empty);
      translateTree(empty);
    }
    if (moreBlock) moreBlock.style.visibility = list.length > shown ? "visible" : "hidden";
    grid.style.height = "auto";
    if (block) {
      const needed = grid.scrollHeight;
      grid.style.height = `${needed}px`;
      fitBlock(stage, block, needed);
    }
  });
}

export function initCatalog(): void {
  const stage = getStage();
  if (!stage || location.pathname.replace(/\/$/, "") !== "/explorar") return;
  filters = parseFilters(new URLSearchParams(location.search));
  const results = (): CatalogTour[] => searchCatalog(filters);
  setupSearch(stage);
  setupCategories(stage);
  setupFilterPanel(stage);
  setupSummary(stage, results);
  setupGrid(stage, results);
  for (const fn of listeners) fn();
}

/**
 * Estado de carga del catalogo (/estados/explorar-cargando, Figma 136:38866, Req. 2.4).
 * El export de Figma trae placeholders de esqueleto estaticos; aqui se marcan como skeleton
 * accesible: el contenedor de la grilla lleva aria-busy="true" + role="status" y cada tarjeta
 * placeholder recibe .bt-card--loading. No se tocan clases pX_* a mano (se detecta la grilla por
 * forma), para que regenerar con fig2astro no requiera editar el markup.
 */
const LOADING_FIGMA_ID = "136:38866";
function skeletonGrid(stage: HTMLElement): { grid: HTMLElement; cards: HTMLElement[] } | null {
  let best: { grid: HTMLElement; cards: HTMLElement[] } | null = null;
  for (const el of stage.querySelectorAll<HTMLElement>("div")) {
    const kids = [...el.children].filter((k): k is HTMLElement => k instanceof HTMLElement);
    if (kids.length < 3) continue;
    const first = kids[0].getBoundingClientRect();
    if (first.width < 180 || first.width > 460 || first.height < 150) continue;
    const cards = kids.filter((k) => Math.abs(k.getBoundingClientRect().width - first.width) < 24 && k.getBoundingClientRect().height >= 150);
    if (cards.length < 3) continue;
    if (!best || cards.length > best.cards.length) best = { grid: el, cards };
  }
  return best;
}
export function initCatalogLoading(): void {
  const stage = getStage();
  if (!stage || stage.dataset.figmaId !== LOADING_FIGMA_ID) return;
  const found = skeletonGrid(stage);
  if (!found) return;
  found.grid.setAttribute("aria-busy", "true");
  found.grid.setAttribute("role", "status");
  found.grid.setAttribute("aria-label", "Cargando tours");
  // Los placeholders del export se reemplazan por la silueta de la tarjeta estándar.
  makeCardGrid(found.grid, found.cards.length);
  found.grid.replaceChildren(...found.cards.map(() => createTourCardSkeleton()));
}