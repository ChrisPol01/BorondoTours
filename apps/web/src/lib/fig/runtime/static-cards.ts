/**
 * Páginas con tarjetas de tour estáticas en el diseño (Favoritos, Destino, Experiencias,
 * sugerencias de Explorar, estado de promociones del Home y artículo del Blog). Cada una pasa a
 * usar la tarjeta estándar (`tour-card.ts`) con tours REALES del catálogo, para que todas se vean,
 * se enlacen y se comporten igual que en Explorar.
 *
 * La fila de tarjetas se localiza por estructura (título h3 → tarjeta → su contenedor), no por
 * clases generadas, así regenerar con fig2astro no obliga a tocar este archivo.
 */
import { categoryFromHeading, popularTours, regionFromText, tourBySlug, type CatalogTour } from "../catalog";
import { PROMOTIONS } from "../home";
import { getStage, textOf } from "./dom";
import { setSourceText, translateTree } from "./i18n-dom";
import { growWithContent } from "./layout";
import { cardFromCatalog, cardFromShowcase, createTourCard, FAVORITES_EVENT, makeCardGrid, readFavorites, type TourCardData } from "./tour-card";
import { cardFromTitle, isPriceLike } from "./tourcard";

interface Plan {
  /** Tarjetas a mostrar. Devuelve null para no tocar la página (p. ej. redirección). */
  readonly cards: (stage: HTMLElement) => TourCardData[] | null;
  /** Ancho mínimo de columna (px). */
  readonly minColumn?: number;
  /** Se ejecuta tras cada pintado (p. ej. actualizar un contador). */
  readonly after?: (stage: HTMLElement, cards: readonly TourCardData[]) => void;
  /** Muestra todas las tarjetas aunque la última fila quede incompleta (listas del usuario, como Favoritos). */
  readonly keepAll?: boolean;
  /** Vuelve a pintar cuando cambian los favoritos. */
  readonly liveFavorites?: boolean;
}

const popular = (count: number, where?: (t: CatalogTour) => boolean): TourCardData[] => popularTours(count, where).map(cardFromCatalog);

const heading = (stage: HTMLElement, tag: "h1" | "h2"): string => textOf(stage.querySelector(tag));

const PLANS: Readonly<Record<string, Plan>> = {
  // Favoritos reales: los tours que el viajero marcó con el corazón (más reciente primero).
  "/favoritos": {
    liveFavorites: true,
    keepAll: true,
    cards: () => {
      const list = [...readFavorites()].reverse().flatMap((slug) => tourBySlug(slug) ?? []);
      if (list.length === 0) {
        location.replace("/estados/favoritos-vacio");
        return null;
      }
      return list.map(cardFromCatalog);
    },
    after: (stage, cards) => {
      const counter = [...stage.querySelectorAll<HTMLElement>("span, p")].find((e) => /tours? guardados?/.test(textOf(e)));
      if (counter) {
        const n = cards.length;
        setSourceText(counter, `${n} ${n === 1 ? "tour guardado" : "tours guardados"}. Te avisamos si se abren cupos en los que están agotados.`);
      }
    },
  },
  // Destino: los tours de la región que nombra el título de la página.
  "/destinos": {
    cards: (stage) => {
      const region = regionFromText(heading(stage, "h1"));
      return popular(6, (t) => (region ? t.region === region : true));
    },
  },
  // Experiencia: los tours de la categoría que nombra el título de la sección.
  "/experiencias": {
    cards: (stage) => {
      const category = categoryFromHeading(heading(stage, "h2"));
      const list = category ? popular(6, (t) => t.category === category) : [];
      return list.length > 0 ? list : popular(6);
    },
  },
  "/estados/explorar-sugerencias": { cards: () => popular(6) },
  "/estados/home-promociones": { cards: () => PROMOTIONS.map(cardFromShowcase), minColumn: 240 },
  // Artículo "Cómo vivir el páramo…": tours de naturaleza y aventura.
  "/blog/articulo": { cards: () => popular(3, (t) => t.category === "NATURALEZA" || t.category === "AVENTURA") },
};

const path = (): string => location.pathname.replace(/\/+$/, "") || "/";

/** Contenedor de las tarjetas: padre de la primera tarjeta con un único título (no precio). */
function findCardRow(stage: HTMLElement): HTMLElement | null {
  for (const title of stage.querySelectorAll<HTMLElement>("h3")) {
    const text = textOf(title);
    if (text.length < 4 || isPriceLike(text)) continue;
    const card = cardFromTitle(title, stage);
    if (card?.parentElement && card.parentElement !== stage) return card.parentElement;
  }
  return null;
}

export function initStandardCards(): void {
  const stage = getStage();
  const plan = PLANS[path()];
  if (!stage || !plan) return;
  const row = findCardRow(stage);
  if (!row) return;

  const render = (): void => {
    const all = plan.cards(stage);
    if (!all) return;
    // Una fila incompleta se ve descuadrada: si hay más de una fila, se muestran solo las completas.
    const columns = makeCardGrid(row, all.length, plan.minColumn);
    const cards = !plan.keepAll && all.length > columns ? all.slice(0, all.length - (all.length % columns)) : all;
    makeCardGrid(row, cards.length, plan.minColumn);
    row.replaceChildren(...cards.map((data) => {
      const el = createTourCard(data);
      translateTree(el);
      return el;
    }));
    plan.after?.(stage, cards);
    growWithContent(stage, row);
  };
  render();
  void document.fonts?.ready.then(() => growWithContent(stage, row));
  if (plan.liveFavorites) window.addEventListener(FAVORITES_EVENT, render);
}
