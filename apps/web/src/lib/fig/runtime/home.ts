/**
 * Home (/): carrusel del hero, chips de tours por región, pestañas laterales con vitrinas
 * (Promociones / Más vendidos) y tarjetas de "Más allá de Colombia" hacia WhatsApp.
 * Usa las clases generadas p0_* del frame 113:17071.
 */
import { ADVISOR_CARD_MESSAGES, BEST_SELLERS, HERO_SLIDES, nextIndex, PROMOTIONS, type ShowcaseTour } from "../home";
import { tourHref } from "../catalog";
import { whatsappUrl } from "../whatsapp";
import { getStage, h, icon, ICONS, markHandled, reducedMotion, textOf } from "./dom";
import { figScale, fitBlock } from "./layout";
import { createPanel, type Panel } from "./panel";
import { cardFromShowcase, createTourCard } from "./tour-card";
import { setSourceText, translateTree } from "./i18n-dom";
import { displayAuthor, featuredReviews, formatRating, GOOGLE_REVIEWS, type GoogleReview, type GoogleReviewsSource } from "../trust";
import { authUrl } from "../auth";
import { ambientGlow, button, emptyState, featureGroup, lift, onStrong, ratingSummary, reviewCard, sectionHead, stars, type FeatureOptions } from "./ui-kit";
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
  const all = button({ label: "Ver todas", href: "/explorar", arrow: true });
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
/* ---------------- Gestor BorondoTech para agencias y operadores ---------------- */
/** Todas las funcionalidades llevan a iniciar sesión: el gestor aún no tiene ruta en el B2C. */
const GESTOR_LOGIN = authUrl("login");
const GESTOR_SR_HINT = "Inicia sesión para usarlo";
/** Iconos de trazo 2 px (viewBox 24). */
const GESTOR_ICONS = {
  pipeline: ["M6 5v11", "M12 5v6", "M18 5v14"],
  quote: ["M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", "M12 17.5v-11"],
  inbox: ["M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z", "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"],
  percent: ["M19 5 5 19", "M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  seats: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m9 16 2 2 4-4"],
  manifest: ["M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z", "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", "M12 11h4", "M12 16h4", "M8 11h.01", "M8 16h.01"],
  share: ["M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "m8.59 13.51 6.83 3.98", "m15.41 6.51-6.82 3.98"],
  wallet: ["M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"],
} as const;
type GestorFeature = readonly [title: string, text: string, icon: readonly string[]];
/** Funcionalidades del gestor (propuesta consolidada ERP+B2B y decisiones del dueño D2-D4). */
const AGENCY_FEATURES: readonly GestorFeature[] = [
  ["CRM y embudo de ventas", "Sigue cada cliente desde el primer mensaje hasta la reserva.", GESTOR_ICONS.pipeline],
  ["Cotizaciones con link de pago", "Envía la cotización y cobra en línea con el mismo enlace.", GESTOR_ICONS.quote],
  ["Bandeja multicanal", "WhatsApp, Instagram y Messenger en una sola bandeja.", GESTOR_ICONS.inbox],
  ["Comisiones claras", "Consulta lo que ganas por cada venta, sin hojas de cálculo.", GESTOR_ICONS.percent],
];
const OPERATOR_FEATURES: readonly GestorFeature[] = [
  ["Tours y cupos en tiempo real", "Actualiza la disponibilidad una vez y todos ven el mismo dato.", GESTOR_ICONS.seats],
  ["Manifiesto automático", "La lista de pasajeros se llena sola con cada reserva.", GESTOR_ICONS.manifest],
  ["Distribución a agencias", "Fija una comisión para tus revendedores y deja que vendan por ti.", GESTOR_ICONS.share],
  ["Liquidaciones a la vista", "Revisa pagos, retenciones y soportes de cada ciclo.", GESTOR_ICONS.wallet],
];
const toFeature = ([title, text, iconPaths]: GestorFeature): FeatureOptions => ({ title, text, icon: iconPaths, href: GESTOR_LOGIN, srHint: GESTOR_SR_HINT });
/** Margen inferior de la franja (px de diseño) bajo el contenido. */
const GESTOR_BAND_PADDING = 72;
/**
 * Franja del gestor (p0_126, fondo surface-strong): reemplaza la de cifras y medios de pago.
 * Encabezado y dos grupos (agencias / operadores) del kit; cada funcionalidad y cada CTA llevan a
 * iniciar sesión. El alto sigue al contenido (idioma, fuentes) con fitBlock.
 */
function setupGestorBand(stage: HTMLElement): void {
  const band = stage.querySelector<HTMLElement>(".p0_126");
  if (!band || band.querySelector(".bt-gestor")) return;
  band.classList.add("bt-gestor-band");
  onStrong(band);
  const groups = h("div", { class: "bt-gestor-groups" }, [
    featureGroup({ title: "Para agencias", intro: "Vende tours sin perder el hilo de cada cliente.", features: AGENCY_FEATURES.map(toFeature), cta: button({ label: "Entrar como agencia", href: GESTOR_LOGIN, arrow: true }) }),
    featureGroup({ title: "Para operadores", intro: "Publica tus tours una vez y deja que las agencias los vendan.", features: OPERATOR_FEATURES.map(toFeature), cta: button({ label: "Entrar como operador", href: GESTOR_LOGIN, arrow: true }) }),
  ]);
  const section = h("section", { class: "bt-gestor", "aria-labelledby": "bt-gestor-title" }, [
    sectionHead({ eyebrow: "BorondoTech para empresas de turismo", title: "Tu agencia u operadora, organizada en un solo lugar", id: "bt-gestor-title" }),
    groups,
  ]);
  // Los bloques generados de "Paga como prefieras" (p0_127/p0_129) salen de la franja.
  band.replaceChildren(ambientGlow(), section);
  const apply = (): void => fitBlock(stage, band, section.offsetTop + section.offsetHeight + GESTOR_BAND_PADDING);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(apply).observe(section);
  apply();
}
/** Promesas (p0_140) y botones de "Más allá de Colombia" (p0_111): vidrio e interacción del kit. */
function setupStandardSurfaces(stage: HTMLElement): void {
  stage.querySelectorAll<HTMLElement>(".p0_139 > .p0_140").forEach((card) => card.classList.add("bt-glass-std"));
  lift(...stage.querySelectorAll(".p0_111 > button"), stage.querySelector(".p0_66"));
}

/* ---------------- Reseñas de Google ---------------- */
const REVIEW_DATE = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });
function toCard(review: GoogleReview): HTMLElement {
  const date = new Date(`${review.date}T12:00:00`);
  return reviewCard({
    author: displayAuthor(review.author),
    date: Number.isNaN(date.getTime()) ? "" : REVIEW_DATE.format(date),
    rating: review.rating,
    ratingLabel: `${review.rating} de 5 estrellas`,
    text: review.text,
    url: review.url,
  });
}
function reviewsBody(source: GoogleReviewsSource): HTMLElement {
  const featured = featuredReviews(source.reviews);
  if (source.rating === null || featured.length === 0) {
    // Sin reseñas reales todavía: estado "pronto", sin cifras ni estrellas inventadas.
    return emptyState({
      align: "start",
      glass: true,
      media: stars(0, 22),
      title: "Pronto verás aquí las opiniones de nuestros viajeros",
      text: "Publicamos solo reseñas reales de nuestro perfil de Google. ¿Ya viajaste con nosotros? Cuéntanos cómo te fue.",
    });
  }
  const score = formatRating(source.rating);
  const summary = ratingSummary(score, Math.round(source.rating), `${source.total} reseñas en Google`, `${score} de 5 estrellas`);
  return h("div", { class: "bt-reviews-grid" }, [summary, h("ul", { class: "bt-reviews-list" }, featured.map(toCard))]);
}
/**
 * Sección "Lo que dicen nuestros viajeros" encima de las promesas (p0_138). Las promesas bajan lo
 * que mida la sección y el resto de la página se desplaza con fitBlock.
 */
function setupGoogleReviews(stage: HTMLElement): void {
  const block = stage.querySelector<HTMLElement>(".p0_138");
  const cards = block?.querySelector<HTMLElement>(":scope > .p0_139");
  if (!block || !cards || block.querySelector(".bt-reviews")) return;
  const source = GOOGLE_REVIEWS;
  const actions = [button({ label: "Ver en Google", variant: "glass", href: source.profileUrl, external: true, arrow: true })];
  if (source.writeReviewUrl) actions.push(button({ label: "Escribir una reseña", href: source.writeReviewUrl, external: true }));
  const section = h("section", { class: "bt-reviews", "aria-labelledby": "bt-reviews-title" }, [
    sectionHead({ eyebrow: "Reseñas de Google", title: "Lo que dicen nuestros viajeros", id: "bt-reviews-title", aside: actions }),
    reviewsBody(source),
  ]);
  block.prepend(ambientGlow(), section);
  const baseTop = Number.parseFloat(getComputedStyle(cards).top) || 0;
  const baseHeight = Number.parseFloat(getComputedStyle(block).height) || 0;
  const GAP = 56;
  const apply = (): void => {
    const extra = section.offsetHeight + GAP;
    cards.style.top = `${baseTop + extra}px`;
    fitBlock(stage, block, baseHeight + extra);
  };
  // El alto cambia con el idioma, las fuentes y la cantidad de reseñas.
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(apply).observe(section);
  apply();
}

/* ---------------- Hero que cabe en la ventana ---------------- */
/** Alto mínimo del hero (px de diseño): por debajo, título y buscador se solaparían. */
const HERO_MIN_HEIGHT = 700;
/** Cuánto del recorte se aplica también al bloque del título (el resto lo absorbe el buscador). */
const HERO_TITLE_SHARE = 0.4;
const HERO_TITLE_MAX_SHIFT = 90;
/** Margen extra para que el texto inferior quede por encima del degradado que funde el hero con la página. */
const HERO_FADE_CLEARANCE = 14;
const HERO_BOTTOM_GROUP = [".p0_30", ".p0_40", ".p0_44"] as const;
const HERO_TITLE_GROUP = [".p0_25", ".p0_19", ".p0_24"] as const;
const HERO_FULL_LAYERS = [".p0_2", ".p0_4"] as const;
/** Valor original de una propiedad en px (se guarda la primera vez para no acumular ajustes). */
function heroOriginal(el: HTMLElement, prop: "top" | "height"): number {
  const key = prop === "top" ? "btHeroTop" : "btHeroHeight";
  const stored = el.dataset[key];
  if (stored !== undefined) return Number(stored);
  const value = Number.parseFloat(getComputedStyle(el)[prop]) || 0;
  el.dataset[key] = String(value);
  return value;
}
/**
 * El hero mide 900 px de diseño y se escala con el ancho: en pantallas anchas pero bajas (1366×768)
 * el buscador y el texto inferior quedaban bajo el pliegue. Se acorta hasta caber en la ventana
 * (con un mínimo) subiendo el grupo inferior; el resto de la página sube con él.
 */
function fitHeroToViewport(stage: HTMLElement): void {
  const hero = stage.querySelector<HTMLElement>(".p0_1");
  if (!hero || hero.parentElement !== stage.firstElementChild) return;
  fitBlock(stage, hero, 0); // guarda las medidas originales
  const base = Number(hero.dataset.btOrigHeight ?? hero.offsetHeight);
  if (!base) return;
  const apply = (): void => {
    const target = Math.round(Math.min(base, Math.max(HERO_MIN_HEIGHT, window.innerHeight / figScale())));
    const delta = base - target;
    fitBlock(stage, hero, target, true);
    const shift = (selectors: readonly string[], amount: number): void => {
      for (const selector of selectors) {
        const el = hero.querySelector<HTMLElement>(`:scope > ${selector}`);
        if (el) el.style.top = `${heroOriginal(el, "top") - amount}px`;
      }
    };
    shift(HERO_BOTTOM_GROUP, delta + HERO_FADE_CLEARANCE);
    shift(HERO_TITLE_GROUP, Math.min(Math.round(delta * HERO_TITLE_SHARE), HERO_TITLE_MAX_SHIFT));
    for (const selector of HERO_FULL_LAYERS) {
      const layer = hero.querySelector<HTMLElement>(`:scope > ${selector}`);
      if (layer) layer.style.height = `${target}px`;
    }
    const shade = hero.querySelector<HTMLElement>(":scope > .p0_3");
    if (shade) shade.style.height = `${target - heroOriginal(shade, "top")}px`;
  };
  let frame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(apply);
  }, { passive: true });
  apply();
}
export function initHome(): void {
  const stage = getStage();
  if (!stage || stage.dataset.figmaId !== HOME_FIGMA_ID) return;
  fitHeroToViewport(stage);
  setupHero(stage);
  setupSideTabs(stage);
  setupAdvisorCards(stage);
  setupGestorBand(stage);
  setupStandardSurfaces(stage);
  setupGoogleReviews(stage);
  translateTree(stage);
}
