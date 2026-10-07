/**
 * Home (/): carrusel del hero, chips de tours por región, pestañas laterales con vitrinas
 * (Promociones / Más vendidos) y tarjetas de "Más allá de Colombia" hacia WhatsApp.
 * Usa las clases generadas p0_* del frame 113:17071.
 */
import { ADVISOR_CARD_MESSAGES, BEST_SELLERS, HERO_SLIDES, nextIndex, PROMOTIONS, type ShowcaseTour } from "../home";
import { tourHref } from "../catalog";
import { whatsappUrl } from "../whatsapp";
import { getStage, h, icon, ICONS, markHandled, reducedMotion, textOf } from "./dom";
import { createPanel, type Panel } from "./panel";
import { cardFromShowcase, createTourCard } from "./tour-card";
import { setSourceText, translateTree } from "./i18n-dom";
const HOME_FIGMA_ID = "113:17071";
const AUTOPLAY_MS = 7000;
/* ---------------- Hero: carrusel de 4 destinos ---------------- */
function setupHero(stage: HTMLElement): void {
  const bg = stage.querySelector<HTMLElement>(".p0_1");
  const title = stage.querySelector<HTMLElement>(".p0_44 > h3");
  const place = stage.querySelector<HTMLElement>(".p0_44 > span");
  const dotsBox = stage.querySelector<HTMLElement>(".p0_46");
  const chips = [stage.querySelector<HTMLElement>(".p0_19"), stage.querySelector<HTMLElement>(".p0_24")];
  if (!bg || !title || !place || !dotsBox || HERO_SLIDES.length === 0) return;
  // Precarga para que el cambio no muestre el fondo vacío.
  for (const slide of HERO_SLIDES) new Image().src = slide.image;
  const dots = [...dotsBox.children] as HTMLElement[];
  let current = 0;
  let timer: number | undefined;
  let paused = false;
  dotsBox.setAttribute("role", "group");
  dotsBox.setAttribute("aria-label", "Destinos destacados");
  dots.forEach((dot, i) => {
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");
    dot.setAttribute("aria-label", `Diapositiva ${i + 1}: ${HERO_SLIDES[i]?.title ?? ""}`);
    markHandled(dot);
    const go = (): void => { show(i); restart(); };
    dot.addEventListener("click", go);
    dot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(); }
      if (event.key === "ArrowRight") { event.preventDefault(); show(nextIndex(current, HERO_SLIDES.length)); dots[current]?.focus(); restart(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); show(nextIndex(current, HERO_SLIDES.length, -1)); dots[current]?.focus(); restart(); }
    });
  });
  chips.forEach((chip, i) => {
    if (!chip) return;
    chip.setAttribute("role", "link");
    chip.setAttribute("tabindex", "0");
    markHandled(chip);
    const go = (): void => {
      const slide = HERO_SLIDES[current];
      const tour = slide?.tours[i];
      if (slide && tour) location.assign(tourHref(tour.slug));
    };
    chip.addEventListener("click", go);
    chip.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); go(); }
    });
  });
  const paintTexts = (index: number): void => {
    const slide = HERO_SLIDES[index];
    if (!slide) return;
    setSourceText(title, slide.title);
    setSourceText(place, slide.place);
    chips.forEach((chip, i) => {
      const tour = slide.tours[i];
      if (!chip || !tour) return;
      const name = chip.querySelector<HTMLElement>(".p0_22");
      const meta = chip.querySelector<HTMLElement>(".p0_23");
      if (name) setSourceText(name, tour.name);
      if (meta) setSourceText(meta, tour.meta);
      chip.setAttribute("aria-label", `${tour.name}, ${slide.regionLabel}`);
    });
    dots.forEach((dot, i) => {
      dot.className = i === index ? "p0_47" : "p0_48";
      dot.setAttribute("aria-current", String(i === index));
    });
  };
  const show = (index: number): void => {
    if (index === current) return;
    const slide = HERO_SLIDES[index];
    if (!slide) return;
    current = index;
    // La nueva imagen entra de izquierda a derecha por encima de la anterior.
    const layer = h("div", { class: "bt-hero-slide", "aria-hidden": "true" });
    layer.style.backgroundImage = `url("${slide.image}")`;
    bg.prepend(layer);
    const settle = (): void => {
      bg.style.backgroundImage = `url("${slide.image}")`;
      bg.querySelectorAll(".bt-hero-slide").forEach((l) => { if (l !== layer) l.remove(); });
      layer.remove();
    };
    if (reducedMotion()) settle();
    else layer.addEventListener("animationend", settle, { once: true });
    stage.classList.add("bt-swapping");
    window.setTimeout(() => {
      paintTexts(index);
      stage.classList.remove("bt-swapping");
    }, reducedMotion() ? 0 : 260);
  };
  const tick = (): void => { if (!paused && !document.hidden) show(nextIndex(current, HERO_SLIDES.length)); };
  const restart = (): void => {
    window.clearInterval(timer);
    // Con movimiento reducido no hay avance automático (WCAG 2.2.2).
    if (!reducedMotion()) timer = window.setInterval(tick, AUTOPLAY_MS);
  };
  // Pausa mientras el usuario interactúa con el texto, los chips o los indicadores.
  for (const zone of [dotsBox.parentElement, ...chips]) {
    if (!zone) continue;
    zone.addEventListener("mouseenter", () => { paused = true; });
    zone.addEventListener("mouseleave", () => { paused = false; });
    zone.addEventListener("focusin", () => { paused = true; });
    zone.addEventListener("focusout", () => { paused = false; });
  }
  paintTexts(0);
  restart();
}
/* ---------------- Vitrinas: Promociones y Más vendidos ---------------- */
/**
 * Vitrina en carrusel horizontal (Promociones / Más vendidos). Cabecera con icono, conteo real de
 * tours, flechas que desplazan de tarjeta en tarjeta, "Ver todas" al catálogo sin filtros y cerrar.
 * Conserva el focus trap y el Escape del panel (createPanel).
 */
function showcase(id: string, title: string, subtitle: string, tours: readonly ShowcaseTour[], iconPaths: readonly string[]): Panel {
  const track = h("div", { class: "bt-vtrack", tabindex: "0", role: "region", "aria-label": title }, tours.map((t) => createTourCard(cardFromShowcase(t))));
  const prev = h("button", { type: "button", class: "bt-icon-btn bt-vnav", "aria-label": "Tours anteriores", "data-bt-handled": true }, [icon(ICONS.prev)]);
  const next = h("button", { type: "button", class: "bt-icon-btn bt-vnav", "aria-label": "Tours siguientes", "data-bt-handled": true }, [icon(ICONS.next)]);
  const all = h("a", { class: "bt-vall", href: "/explorar", "data-bt-handled": true }, ["Ver todas", icon(ICONS.arrowRight, 16)]);
  const step = (): number => {
    const first = track.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 16 : track.clientWidth;
  };
  const updateNav = (): void => {
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };
  const scrollBy = (dir: 1 | -1): void => track.scrollBy({ left: dir * step(), behavior: reducedMotion() ? "auto" : "smooth" });
  prev.addEventListener("click", () => scrollBy(-1));
  next.addEventListener("click", () => scrollBy(1));
  track.addEventListener("scroll", updateNav, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); scrollBy(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); scrollBy(-1); }
  });
  // Mientras el panel está oculto no hay medidas: se recalcula al abrirse / cambiar de tamaño.
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(updateNav).observe(track);
  const panel = createPanel({ id, title, subtitle: `${subtitle} · ${tours.length} tours`, wide: true, iconPaths, actions: [prev, next, all] });
  panel.body.append(track);
  updateNav();
  return panel;
}
/**
 * Pestañas laterales (p0_13/p0_17/p0_18): horizontales ancladas al borde derecho; en reposo se ve
 * la mitad izquierda y al pasar el mouse / enfocarse se deslizan hasta mostrarse al 100%. Promociones
 * y Más vendidos abren su vitrina; "Ver todos" navega al catálogo. El color de marca fijo y el
 * deslizamiento viven en fig-runtime.css; aquí solo se marca la clase y se conectan los paneles.
 */
function placeSideTab(tab: HTMLElement): void {
  tab.classList.add("bt-side-tab");
}
function setupSideTabs(stage: HTMLElement): void {
  const promoTab = stage.querySelector<HTMLAnchorElement>("a.p0_13");
  const bestTab = stage.querySelector<HTMLAnchorElement>("a.p0_17");
  const allTab = stage.querySelector<HTMLAnchorElement>("a.p0_18");
  let promos: Panel | null = null;
  let best: Panel | null = null;
  if (promoTab) {
    placeSideTab(promoTab);
    markHandled(promoTab);
    promoTab.setAttribute("aria-haspopup", "dialog");
    promoTab.addEventListener("click", (event) => {
      event.preventDefault();
      best?.close();
      promos ??= showcase("bt-promos", "Promociones", "Precios especiales por tiempo limitado", PROMOTIONS, ICONS.tag);
      promos.open(promoTab);
    });
  }
  if (bestTab) {
    placeSideTab(bestTab);
    markHandled(bestTab);
    bestTab.setAttribute("aria-haspopup", "dialog");
    bestTab.addEventListener("click", (event) => {
      event.preventDefault();
      promos?.close();
      best ??= showcase("bt-best", "Más vendidos", "Los tours que más eligen nuestros viajeros", BEST_SELLERS, ICONS.flame);
      best.open(bestTab);
    });
  }
  // "Ver todos" navega al catálogo completo sin filtros (enlace normal, sin panel).
  if (allTab) {
    placeSideTab(allTab);
    allTab.href = "/explorar";
    allTab.removeAttribute("aria-haspopup");
  }
}
/* ---------------- Más allá de Colombia → WhatsApp ---------------- */
function setupAdvisorCards(stage: HTMLElement): void {
  stage.querySelectorAll<HTMLButtonElement>(".p0_111 > button").forEach((button) => {
    const title = textOf(button.querySelector(".p0_116"));
    const message = ADVISOR_CARD_MESSAGES[title];
    if (!message) return;
    markHandled(button);
    button.setAttribute("aria-label", `${title}: cotiza con un asesor por WhatsApp (se abre en otra pestaña)`);
    button.addEventListener("click", () => window.open(whatsappUrl(message), "_blank", "noopener"));
  });
}
export function initHome(): void {
  const stage = getStage();
  if (!stage || stage.dataset.figmaId !== HOME_FIGMA_ID) return;
  setupHero(stage);
  setupSideTabs(stage);
  setupAdvisorCards(stage);
  translateTree(stage);
}
