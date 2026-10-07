/**
 * Detalle /tour?tour=slug: pinta el tour elegido en el catálogo (título, migas, categoría, tipo,
 * lugar, duración, dificultad, valoración, imagen, precio y descripción) y "Reservar ahora" lleva al
 * checkout guardando la selección en sessionStorage (borondo.cart). Itinerario e incluye siguen de muestra.
 */
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, formatCop, REGION_NAMES, relatedTours, tourBySlug, TYPE_LABELS, type CatalogTour,
} from "../catalog";
import { getStage, markHandled, textOf } from "./dom";
import { setSourceText, translateTree } from "./i18n-dom";
import { growWithContent } from "./layout";
import { cardFromCatalog, createTourCard, makeCardGrid } from "./tour-card";

const ORIGINAL = {
  name: "Valle del Cocora y Salento",
  category: "NATURALEZA",
  type: "PASADÍA",
  place: "Salento, Quindío",
  duration: "1 día · 8 horas",
  difficulty: "Moderado",
  rating: "4,8 (41)",
  before: "$210.000 COP",
  price: "Desde $185.000",
} as const;

/**
 * "También en …": reemplaza las tarjetas estáticas del diseño por tours reales del catálogo con la
 * tarjeta estándar. Se ubica por el texto del título (no por clases generadas) y, como las
 * tarjetas pueden ser más altas que la fila de Figma, la sección crece y empuja lo que sigue.
 */
function setupRelated(stage: HTMLElement, current: CatalogTour): void {
  const heading = [...stage.querySelectorAll<HTMLElement>("h2")].find((e) => textOf(e).startsWith("También en"));
  const header = heading?.parentElement?.parentElement;
  const row = header?.nextElementSibling;
  if (!heading || !header || !(row instanceof HTMLElement)) return;

  const picks = relatedTours(current, 4);
  const regions = new Set(picks.map((t) => t.region));
  const region = regions.size === 1 ? picks[0]?.region : current.region;
  setSourceText(heading, regions.size === 1 && region ? `También en la región ${REGION_NAMES[region]}` : "Tours que también te pueden gustar");

  const all = [...header.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s) === "Ver todos en la región");
  const action = all?.parentElement;
  if (action && region) {
    const go = (): void => location.assign(`/explorar?regiones=${region}`);
    markHandled(action);
    action.setAttribute("role", "link");
    action.tabIndex = 0;
    action.style.cursor = "pointer";
    action.addEventListener("click", (e) => { e.preventDefault(); go(); });
    action.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); go(); } });
  }

  makeCardGrid(row);
  row.replaceChildren(...picks.map((t) => {
    const el = createTourCard(cardFromCatalog(t));
    translateTree(el);
    return el;
  }));
  const grow = (): void => growWithContent(stage, row);
  grow();
  void document.fonts?.ready.then(grow);
}

export function initTour(): void {
  const stage = getStage();
  if (!stage || location.pathname.replace(/\/$/, "") !== "/tour") return;
  const slug = new URLSearchParams(location.search).get("tour");
  const tour = tourBySlug(slug);

  for (const el of stage.querySelectorAll<HTMLElement>("a, button")) {
    if (!/^reservar( ahora)?$/i.test(textOf(el))) continue;
    markHandled(el);
    el.addEventListener("click", (event) => {
      event.preventDefault();
      try { sessionStorage.setItem("borondo.cart", JSON.stringify({ tour: tour?.slug ?? "valle-del-cocora-y-salento", savedAt: Date.now() })); } catch { /* sin storage */ }
      location.assign("/checkout");
    });
  }
  if (!tour) {
    const fallback = tourBySlug("valle-del-cocora-y-salento");
    if (fallback) setupRelated(stage, fallback);
    return;
  }

  const map = new Map<string, string>([
    [ORIGINAL.name, tour.name],
    [ORIGINAL.category, CATEGORY_LABELS[tour.category].toLocaleUpperCase("es-CO")],
    [ORIGINAL.type, TYPE_LABELS[tour.type].toLocaleUpperCase("es-CO")],
    [ORIGINAL.place, tour.place],
    [ORIGINAL.duration, tour.durationLabel],
    [ORIGINAL.difficulty, DIFFICULTY_LABELS[tour.difficulty]],
    [ORIGINAL.rating, `${tour.rating.toLocaleString("es-CO")} (${tour.reviews})`],
    [ORIGINAL.before, tour.priceBefore ? `${formatCop(tour.priceBefore)} COP` : ""],
    [ORIGINAL.price, `Desde ${formatCop(tour.price)}`],
  ]);
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const value = (n.nodeValue ?? "").trim();
    const next = map.get(value);
    if (next !== undefined) n.nodeValue = next;
  }
  const desc = [...stage.querySelectorAll<HTMLElement>("span")].find((s) => textOf(s).length > 120);
  if (desc) desc.textContent = tour.description;
  const hero = [...stage.querySelectorAll<HTMLElement>("div")].find((d) => /\/fig\/.*-(1[0-9]{3}|9\d\d)\.webp/.test(getComputedStyle(d).backgroundImage));
  if (hero) hero.style.backgroundImage = `url("${tour.image}")`;
  document.title = `${tour.name} — BorondoTours`;
  setupRelated(stage, tour);
  translateTree(stage);
}
