/**
 * Tarjeta de tour ESTÁNDAR del B2C: foto a sangre, etiqueta de categoría, corazón, descuento y un
 * panel de vidrio con lugar, nombre, duración, valoración, precio y disponibilidad.
 *
 * Es la única definición de tarjeta de tour. La usan las vitrinas del Home (Promociones / Más
 * vendidos), el catálogo (/explorar) y "También en …" del detalle del tour, para que se vean y se
 * comporten igual en todo el sitio.
 *
 * Estructura (`.bt-vitem`): la tarjeta es un `<a>` real (toda ella es clicable y lleva a la ficha
 * del tour) y el corazón es un `<button>` HERMANO superpuesto: un botón dentro de un enlace sería
 * HTML inválido. El panel de vidrio crece con su contenido: si un texto es largo, el panel se hace
 * más alto y, al estar en una grilla o carrusel, todas las tarjetas de la fila se igualan.
 */
import { CATEGORY_LABELS, cardState, discountOf, formatCop, tourHref, type CardState, type CatalogTour } from "../catalog";
import { authUrl } from "../auth";
import type { ShowcaseTour } from "../home";
import { getSession } from "./auth";
import { h, icon, ICONS } from "./dom";

export interface TourCardData {
  readonly slug: string;
  readonly name: string;
  readonly place: string;
  readonly category: string;
  /** "1 día", "5 horas"… */
  readonly duration: string;
  /** "4,8 (268)" */
  readonly rating: string;
  readonly image: string;
  /** Precio vigente ya formateado ("$178.500"). */
  readonly price: string;
  readonly priceBefore?: string;
  /** "-15%" */
  readonly discount?: string;
  readonly state: CardState;
}

export const cardFromCatalog = (t: CatalogTour): TourCardData => ({
  slug: t.slug,
  name: t.name,
  place: t.place,
  category: CATEGORY_LABELS[t.category],
  duration: t.durationLabel.split(" · ")[0] ?? t.durationLabel,
  rating: `${t.rating.toLocaleString("es-CO")} (${t.reviews})`,
  image: t.image,
  price: formatCop(t.price),
  priceBefore: t.priceBefore ? formatCop(t.priceBefore) : undefined,
  discount: discountOf(t) ?? undefined,
  state: cardState(t),
});

export const cardFromShowcase = (t: ShowcaseTour): TourCardData => ({
  slug: t.slug,
  name: t.name,
  place: t.place,
  category: t.category,
  duration: t.duration,
  rating: t.rating,
  image: t.image,
  price: t.price,
  priceBefore: t.priceBefore,
  discount: t.discount,
  state: cardState(t),
});

/* ---------------- Favoritos (demostración) ---------------- */

/** Misma familia de claves borondo.demo.* que la sesión de demostración. */
const FAVORITES_KEY = "borondo.demo.favorites";
/** Se emite cada vez que cambia la lista de favoritos (la usa /favoritos para quitar la tarjeta al instante). */
export const FAVORITES_EVENT = "bt:favorites";
export function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : []);
  } catch {
    return new Set();
  }
}
function writeFavorites(favorites: ReadonlySet<string>): void {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); } catch { /* storage no disponible */ }
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

/**
 * Corazón de la tarjeta. Guardar un favorito pide cuenta (Spec-A RF-A10): sin sesión lleva al
 * acceso y vuelve a la página actual; con sesión alterna el estado y lo recuerda.
 */
function heartButton(data: TourCardData): HTMLButtonElement {
  const button = h("button", { type: "button", class: "bt-vheart", "aria-label": `Guardar ${data.name} en favoritos`, "aria-pressed": "false", "data-bt-handled": true }, [icon(ICONS.heart, 20)]);
  const sync = (): void => button.setAttribute("aria-pressed", String(getSession() !== null && readFavorites().has(data.slug)));
  sync();
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!getSession()) {
      location.assign(authUrl("login", `${location.pathname}${location.search}`));
      return;
    }
    const favorites = readFavorites();
    if (favorites.has(data.slug)) favorites.delete(data.slug);
    else favorites.add(data.slug);
    writeFavorites(favorites);
    sync();
  });
  return button;
}

/**
 * Convierte el contenedor de tarjetas del diseño (flex con ancho fijo de Figma) en una grilla CSS
 * de tarjetas estándar. Conserva el ancho que tenía en el diseño para no desbordar la columna.
 * Devuelve el número de columnas resultante (para recortar la última fila incompleta si se quiere).
 */
export function makeCardGrid(container: HTMLElement, count?: number, minColumn = 270): number {
  if (!container.classList.contains("bt-vgrid")) {
    const width = Number.parseFloat(getComputedStyle(container).width);
    if (Number.isFinite(width) && width > 0) container.style.setProperty("--bt-grid-w", `${width}px`);
    container.classList.add("bt-vgrid");
  }
  const width = Number.parseFloat(getComputedStyle(container).width) || 0;
  const capacity = Math.max(1, Math.floor((width + 24) / (minColumn + 24)));
  // Pocas tarjetas: se reparten el ancho (sin columnas vacías a la derecha) en vez de auto-llenar.
  if (count === undefined) return capacity;
  const columns = Math.max(1, Math.min(count, capacity));
  if (count > 0) container.style.setProperty("--bt-grid-cols", `repeat(${columns}, minmax(0, 1fr))`);
  else container.style.removeProperty("--bt-grid-cols");
  return columns;
}

/**
 * Estado de carga de la tarjeta estándar: misma silueta (foto a sangre + panel de vidrio con
 * líneas de lugar, nombre, duración y precio), sin spinner. Es decorativa (`aria-hidden`); el
 * contenedor de la lista es quien anuncia `aria-busy`. La clase `bt-card--loading` va en el
 * contenedor para conservar el contrato de los estados de carga del catálogo.
 */
export function createTourCardSkeleton(): HTMLElement {
  const bar = (cls: string): HTMLElement => h("span", { class: `bt-vskel ${cls}` });
  const info = h("div", { class: "bt-vinfo" }, [
    bar("bt-vskel--place"),
    bar("bt-vskel--name"),
    bar("bt-vskel--meta"),
    bar("bt-vskel--price"),
    bar("bt-vskel--pill"),
  ]);
  const card = h("div", { class: "bt-vcard bt-vcard--skeleton", "aria-hidden": "true" }, [
    h("span", { class: "bt-vskel bt-vskel--badge" }),
    info,
  ]);
  return h("div", { class: "bt-vitem bt-card--loading" }, [card]);
}

/* ---------------- Tarjeta ---------------- */

export interface TourCardOptions {
  /** Resalta la tarjeta (llegada desde el Home con ?destacado=slug). */
  readonly featured?: boolean;
}

const AVAILABILITY: Readonly<Record<CardState, string>> = {
  available: "Disponible",
  low: "Quedan pocos",
  soldout: "Agotado",
};

export function createTourCard(data: TourCardData, options: TourCardOptions = {}): HTMLElement {
  const soldOut = data.state === "soldout";
  const avail = h("span", { class: "bt-vpill", "data-level": data.state }, [AVAILABILITY[data.state]]);
  // Agotado no depende solo del color: lleva icono (círculo con barra).
  if (soldOut) avail.prepend(icon(["M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z", "M5.6 5.6l12.8 12.8"], 14));

  const info = h("div", { class: "bt-vinfo" }, [
    h("span", { class: "bt-vplace" }, [icon(ICONS.pin, 14), data.place]),
    h("h3", { class: "bt-vname" }, [data.name]),
    h("div", { class: "bt-vmeta" }, [
      h("span", {}, [icon(ICONS.clock, 14), data.duration]),
      h("span", { class: "bt-vrating" }, [icon(ICONS.star, 14), data.rating]),
    ]),
    h("div", { class: "bt-vprice" }, [
      h("span", { class: "bt-vfrom" }, ["Desde", ...(data.priceBefore ? [h("s", {}, [data.priceBefore])] : [])]),
      h("strong", { class: "bt-vamount" }, [data.price]),
      // "por persona" y el estado comparten fila y se parten en dos líneas si no caben: el estado
      // nunca se corta ni empuja el precio.
      h("div", { class: "bt-vline" }, [h("span", { class: "bt-vper" }, ["por persona"]), avail]),
    ]),
  ]);

  const label = soldOut
    ? `${data.name}, ${data.place}. Agotado. Ver detalle`
    : `${data.name}, ${data.place}. Desde ${data.price}. Ver y reservar`;
  const classes = ["bt-vcard", "bt-tourcard"];
  if (soldOut) classes.push("bt-card--soldout");
  if (data.state === "low") classes.push("bt-low");
  if (options.featured) classes.push("bt-featured");

  const card = h("a", { class: classes.join(" "), href: tourHref(data.slug), "aria-label": label, "data-bt-handled": true }, [
    h("img", { src: data.image, alt: "", loading: "lazy", decoding: "async", width: "300", height: "390" }),
    h("span", { class: "bt-vbadge" }, [data.category]),
    ...(data.discount ? [h("span", { class: "bt-voff" }, [data.discount])] : []),
    info,
  ]);
  return h("div", { class: "bt-vitem" }, [card, heartButton(data)]);
}
