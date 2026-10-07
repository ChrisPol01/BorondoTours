/**
 * Submenú de /nosotros (Historia · Equipo · Contacto · Legal).
 *
 * Mismo comportamiento que la navbar: una píldora azul (.bt-nav-indicator) que se desliza hacia la
 * opción bajo el mouse o con foco. Al salir vuelve a la sección que se está viendo (scroll-spy).
 * Al hacer clic (o Enter/Espacio) lleva a la sección correspondiente de la página.
 *
 * La barra se detecta por estructura (cuatro envoltorios con esos textos), no por ids de Figma.
 */
import { getStage, h, markHandled, reducedMotion, textOf } from "./dom";

interface Entry {
  readonly label: string;
  /** Título h2 de la sección a la que lleva. */
  readonly heading: string;
  readonly id: string;
}

const ENTRIES: readonly Entry[] = [
  { label: "Historia", heading: "Nuestra historia", id: "historia" },
  { label: "Equipo", heading: "Equipo", id: "equipo" },
  { label: "Contacto", heading: "Contacto", id: "contacto" },
  { label: "Legal", heading: "Centro legal", id: "legal" },
];

/** Separación respecto al borde superior al llegar a una sección (deja ver el título bajo la navbar). */
const SCROLL_OFFSET = 150;

function findBar(stage: HTMLElement): { bar: HTMLElement; items: HTMLElement[] } | null {
  const first = [...stage.querySelectorAll<HTMLElement>("span, a")].find((el) => textOf(el) === ENTRIES[0]?.label);
  const bar = first?.parentElement?.parentElement;
  if (!bar) return null;
  const items: HTMLElement[] = [];
  for (const entry of ENTRIES) {
    const item = [...bar.children].find(
      (c): c is HTMLElement => c instanceof HTMLElement && c.childElementCount > 0 && textOf(c) === entry.label,
    );
    if (!item) return null;
    items.push(item);
  }
  return { bar, items };
}

export function initSubnav(): void {
  const stage = getStage();
  if (!stage || location.pathname.replace(/\/$/, "") !== "/nosotros") return;
  const found = findBar(stage);
  if (!found) return;
  const { bar, items } = found;

  const headings = [...stage.querySelectorAll<HTMLElement>("h2")];
  const targets = ENTRIES.map((entry) => headings.find((el) => textOf(el) === entry.heading) ?? null);

  bar.classList.add("bt-subnav");
  // La capa de vidrio de Figma (p45_12) trae ancho/alto fijos (376x45) y los botones ahora miden 44px
  // de alto: sin esto la píldora azul sobresale del vidrio. La capa se estira al 100 % de la barra.
  const glass = bar.firstElementChild;
  if (glass instanceof HTMLElement && glass.tagName === "DIV" && glass.childElementCount === 0) glass.classList.add("bt-glass-fill");
  bar.setAttribute("role", "navigation");
  bar.setAttribute("aria-label", "Secciones de Nosotros");

  // La píldora va justo antes del primer item: encima de la capa de vidrio y debajo de los textos.
  const pill = h("span", { class: "bt-nav-indicator", "aria-hidden": "true" });
  bar.insertBefore(pill, items[0] ?? null);

  let current = 0; // sección visible (scroll-spy); a ella vuelve la píldora al salir el mouse
  let shown = 0; // opción que la píldora muestra ahora (puede ser la del mouse, no la visible)
  const place = (index: number): void => {
    const item = items[index];
    if (!item) return;
    shown = index;
    pill.style.width = `${item.offsetWidth}px`;
    pill.style.height = `${item.offsetHeight}px`;
    pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
    items.forEach((it, i) => {
      it.classList.toggle("is-indicated", i === index);
      it.removeAttribute("aria-current");
    });
    item.setAttribute("aria-current", "true");
  };

  const goTo = (index: number): void => {
    const target = targets[index];
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? "auto" : "smooth" });
    current = index;
    place(index);
  };

  items.forEach((item, index) => {
    const entry = ENTRIES[index];
    if (!entry) return;
    item.classList.add("bt-subnav-item");
    item.setAttribute("role", "link");
    item.setAttribute("tabindex", "0");
    item.id = `subnav-${entry.id}`;
    markHandled(item);
    // "Contacto" venia como <a href="/contacto">: ahora baja a la seccion Contacto de esta pagina.
    const anchor = item.querySelector("a");
    if (anchor) {
      anchor.setAttribute("href", `#${entry.id}`);
      anchor.setAttribute("tabindex", "-1");
      markHandled(anchor);
    }
    item.addEventListener("mouseenter", () => place(index));
    item.addEventListener("focus", () => place(index));
    item.addEventListener("click", (event) => {
      event.preventDefault();
      goTo(index);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goTo(index);
      }
    });
  });
  bar.addEventListener("mouseleave", () => place(current));
  bar.addEventListener("focusout", (event) => {
    if (!bar.contains(event.relatedTarget as Node | null)) place(current);
  });

  // Scroll-spy: la seccion activa es la ultima cuyo titulo ya paso el 35 % de la ventana.
  let frame = 0;
  const spy = (): void => {
    frame = 0;
    let active = 0;
    targets.forEach((target, i) => {
      if (target && target.getBoundingClientRect().top <= window.innerHeight * 0.35) active = i;
    });
    if (active !== current) {
      current = active;
      if (!bar.matches(":hover") && !bar.contains(document.activeElement)) place(active);
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(spy);
    },
    { passive: true },
  );

  // Recoloca tras el layout real (fuentes, resize, cambio de tema/idioma).
  // Refrescar NUNCA mueve la píldora a otra opción: solo la realinea donde ya está (shown).
  const refresh = (): void => place(shown);
  requestAnimationFrame(() => {
    spy();
    refresh();
  });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(refresh).observe(bar);
  if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => undefined);
  window.addEventListener("resize", refresh, { passive: true });
  place(0);
}
