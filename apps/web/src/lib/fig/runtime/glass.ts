/**
 * Vidrio estándar del B2C: aplica una sola clase de vidrio (`.bt-glass-std` o su modificador
 * `--strong`) a una lista EXPLÍCITA de superficies, con los valores por tema de --bt-glass-*
 * (fig-runtime.css). Antes esto barría cualquier elemento con `backdrop-filter: blur`, lo que
 * pisaba el diseño propio de la TourCard, los chips, el hero y las pestañas laterales.
 *
 * Superficies con vidrio estándar: navbar (`.bt-nav-glass`, `.bt-nav-capsule`), sidebar fijo,
 * cápsula del rail (`.bt-rail`), paneles (`.bt-glass`), menús (`.bt-menu`), chips (`.bt-chip`).
 * Vidrio "strong" (más opaco, para leer sobre contenido): modales/diálogos y menús.
 * Excluidos (recuperan su diseño propio): TourCard (`.bt-card`), hero, pestañas laterales
 * `a.p0_13/p0_17/p0_18` y los botones internos del rail (`.bt-rail-link`).
 */
import { getStage } from "./dom";

/** Clases de superficie que llevan vidrio estándar (relleno translúcido + borde + sombra). */
const STD_SELECTORS = [
  ".bt-nav-glass",
  ".bt-nav-capsule",
  ".bt-sidebar-fixed",
  ".bt-rail",
  ".bt-chip",
] as const;

/** Clases de superficie que llevan vidrio "strong" (modales y menús). */
const STRONG_SELECTORS = [".bt-menu", '[role="dialog"]'] as const;

/** Elementos que NUNCA reciben vidrio del runtime (tienen su propio diseño). */
const EXCLUDED_SELECTORS = [
  ".bt-card",
  ".bt-rail-link",
  "a.p0_13",
  "a.p0_17",
  "a.p0_18",
] as const;

const matchesAny = (el: Element, selectors: readonly string[]): boolean =>
  selectors.some((sel) => el.matches(sel));

/**
 * Decide qué vidrio corresponde a un elemento (función pura, testeable):
 *  - `null`   → TourCard, hero, pestañas laterales y botones internos del rail (sin vidrio del runtime)
 *  - `"strong"` → diálogos y menús (más opacos)
 *  - `"std"`  → navbar, cápsula del rail, chips y demás superficies estándar
 */
export function glassTargetKind(el: Element): "std" | "strong" | null {
  if (matchesAny(el, EXCLUDED_SELECTORS) || el.closest(".bt-card") !== null) return null;
  if (matchesAny(el, STRONG_SELECTORS) || el.closest('[role="dialog"]') !== null) return "strong";
  if (matchesAny(el, STD_SELECTORS)) return "std";
  // `.bt-glass` es un panel/menú base: si no es un diálogo, va como estándar.
  if (el.classList.contains("bt-glass")) return "std";
  return null;
}

export function initGlass(): void {
  const stage = getStage();
  if (!stage) return;
  const selector = [...STD_SELECTORS, ...STRONG_SELECTORS, ".bt-glass"].join(",");
  // `.bt-glass` puede estar fuera del stage (menús/overlays montados en body): se incluye el documento.
  const candidates = new Set<Element>([
    ...stage.querySelectorAll(selector),
    ...document.querySelectorAll(".bt-glass, .bt-menu, [role='dialog']"),
  ]);
  for (const el of candidates) {
    const kind = glassTargetKind(el);
    if (!kind) continue;
    // El vidrio vive en UN solo nivel: una capa de fondo vacía (sin hijos, usada como "Cristal"
    // de Figma) que ya está dentro de otro anfitrión de vidrio no recibe vidrio propio. Evita la
    // "tarjeta dentro de otra tarjeta" (navbar y rail). Los menús/diálogos son overlays flotantes
    // y sí pueden ir dentro de una cápsula, por eso se excluyen de este corte.
    if (el.childElementCount === 0 && !matchesAny(el, STRONG_SELECTORS) && isInsideGlassHost(el)) continue;
    el.classList.add("bt-glass-std");
    el.classList.toggle("bt-glass-std--strong", kind === "strong");
  }
}
/** True si `el` esta contenido en otro elemento que ya es anfitrion de vidrio estandar/strong. */
function isInsideGlassHost(el: Element): boolean {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (glassTargetKind(p) !== null) return true;
  }
  return false;
}
