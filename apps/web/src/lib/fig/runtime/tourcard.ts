/**
 * Normaliza las tarjetas estáticas del markup generado para que TODA tarjeta de tour lleve al
 * detalle (`/tour?tour={slug}`), igual que las tarjetas que pinta el runtime (catálogo, Home,
 * vitrinas). Las tarjetas de artículos del Blog llevan al artículo, no a un tour (RF 2.14).
 *
 * El detalle (`/tour`) resuelve el slug contra el catálogo; si no existe, igual es una URL de
 * detalle válida. Así el destino es determinista sin depender de un emparejamiento frágil.
 */
import { tourHref } from "../catalog";
import { slugify } from "../home";
import { getStage, textOf } from "./dom";

/** Páginas con tarjetas estáticas que hay que normalizar (ver exploration-results §Hip. 9). */
const TOURCARD_PAGES = new Set([
  "/tour",
  "/blog/articulo",
  "/estados/home-promociones",
  "/estados/explorar-sugerencias",
  "/explorar/mapa",
  "/favoritos",
]);
const ARTICLE_PAGES = new Set(["/blog"]);

const path = (): string => location.pathname.replace(/\/+$/, "") || "/";

/** ¿El texto parece un precio ($…) o una métrica, no un título de tarjeta? */
export const isPriceLike = (text: string): boolean => /^\$|^\d|COP$/.test(text.trim());

/** Enlace del Blog para el artículo cuyo título es `title`. */
export function articleHref(title: string): string {
  const slug = slugify(title);
  return slug ? `/blog/articulo?art=${encodeURIComponent(slug)}` : "/blog/articulo";
}

/** ¿`el` ya es navegable (un enlace, o está dentro de uno) o lo maneja otro módulo? */
function alreadyLinked(el: HTMLElement): boolean {
  return el.tagName === "A" || el.closest("a") !== null || el.closest("[data-bt-handled]") !== null || el.classList.contains("bt-card");
}

/** ¿El subárbol de `el` contiene una imagen o un fondo /fig/ (señal de tarjeta de tour)? */
function hasMedia(el: HTMLElement): boolean {
  if (el.querySelector("img")) return true;
  return [...el.querySelectorAll<HTMLElement>("div")].some((d) => getComputedStyle(d).backgroundImage.includes("/fig/"));
}

/**
 * Sube desde el título hasta la tarjeta: el menor ancestro (hasta 6 niveles) que contiene medios.
 * Devuelve null si no hay una tarjeta razonable (p. ej. un encabezado de sección del artículo).
 */
/** Número de encabezados que parecen título (no precio ni métrica) dentro de `el`. */
function titleCount(el: HTMLElement): number {
  let n = 0;
  for (const h of el.querySelectorAll<HTMLElement>("h3")) {
    if (!isPriceLike(textOf(h))) n++;
  }
  return n;
}
export function cardFromTitle(h3: HTMLElement, stage: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = h3.parentElement;
  for (let depth = 0; node && node !== stage && depth < 6; depth++, node = node.parentElement) {
    if (!hasMedia(node)) continue;
    // Una tarjeta real tiene un único título (el precio también es un h3, pero no cuenta). Si el
    // ancestro con medios ya envuelve varios títulos, es un contenedor de sección (p. ej. la
    // grilla del Blog, la barra "Más leídos" o la rejilla de tours relacionados), no una tarjeta:
    // subir más solo agranda el bloque, así que se descarta.
    return titleCount(node) === 1 ? node : null;
  }
  return null;
}

/** Convierte un bloque de tarjeta en navegable (role=link + teclado), sin reescribir el DOM. */
function makeNavigable(card: HTMLElement, href: string, title: string, isArticle: boolean): void {
  card.classList.add("bt-tourcard");
  card.setAttribute("role", "link");
  card.tabIndex = 0;
  card.style.cursor = "pointer";
  card.dataset.btHandled = "";
  card.dataset.btHref = href;
  card.setAttribute("aria-label", isArticle ? `Leer artículo: ${title}` : `${title}. Ver detalle`);
  const go = (): void => location.assign(href);
  card.addEventListener("click", (e) => {
    // No secuestrar clics sobre controles internos reales (botones/enlaces).
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    e.preventDefault();
    go();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
  });
}

export function initTourCards(): void {
  const stage = getStage();
  if (!stage) return;
  const here = path();
  const isArticle = ARTICLE_PAGES.has(here);
  if (!isArticle && !TOURCARD_PAGES.has(here)) return;

  const seen = new Set<HTMLElement>();
  for (const h3 of stage.querySelectorAll<HTMLElement>("h3")) {
    const title = textOf(h3);
    if (!title || title.length < 4 || isPriceLike(title)) continue;
    const card = cardFromTitle(h3, stage);
    if (!card || seen.has(card) || alreadyLinked(card)) continue;
    seen.add(card);
    const href = isArticle ? articleHref(title) : tourHref(slugify(title));
    makeNavigable(card, href, title, isArticle);
  }
}
