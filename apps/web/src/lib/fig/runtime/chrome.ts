/**
 * Navbar pública de las vistas generadas: logo → Home, menú Explorar (tipos de tour + Personalizados),
 * selector de idioma (6 idiomas), selector de tema (persistente) y FAB del asistente fijo en pantalla.
 *
 * Las clases cambian por página (p0_*, p45_*, …), así que la navbar se ubica por su contenido:
 * el enlace "Explorar" cuyo contenedor también tiene Blog y Nosotros.
 */
import { catalogUrl, TOUR_TYPES } from "../home";
import { LANGUAGES, type Lang } from "../i18n";
import { parseTheme, setTheme, THEMES, type Theme } from "../../theme";
import { openAssistant } from "./assistant";
import { currentLang, setLanguage } from "./i18n-dom";
import { getStage, h, markHandled, textOf } from "./dom";
import { bindDropdown, closeAll } from "./menu";

const TYPE_HINTS: Readonly<Record<string, string>> = {
  PASADIA: "Vas y vuelves el mismo día",
  PASANOCHE: "Una noche fuera de casa",
  EXCURSION: "Varios días con alojamiento",
};

const THEME_LABELS: Readonly<Record<Theme, string>> = {
  colorido: "Colorido",
  claro: "Claro",
  oscuro: "Oscuro",
  sistema: "Sistema",
};

export interface NavParts {
  readonly row: HTMLElement;
  readonly links: HTMLElement;
  readonly explorar: HTMLAnchorElement;
}

export function findNav(stage: HTMLElement): NavParts | null {
  for (const anchor of stage.querySelectorAll<HTMLAnchorElement>('a[href="/explorar"]')) {
    const links = anchor.parentElement;
    if (!links || textOf(anchor) !== "Explorar") continue;
    if (!links.querySelector('a[href="/blog"]') || !links.querySelector('a[href="/nosotros"]')) continue;
    const row = links.parentElement;
    if (row) return { row, links, explorar: anchor };
  }
  return null;
}

function setupLogo(row: HTMLElement, links: HTMLElement): void {
  const logo = row.firstElementChild as HTMLElement | null;
  if (!logo || logo === links || logo.tagName === "A" || logo.closest("a")) return;
  const link = h("a", { href: "/", class: "bt-logo-link", "aria-label": "Ir al inicio" });
  markHandled(link);
  logo.replaceWith(link);
  link.append(logo);
}

function setupExplorar(links: HTMLElement, explorar: HTMLAnchorElement): void {
  const menu = h("div", { id: "bt-menu-explorar", class: "bt-menu bt-menu--left bt-glass", hidden: true, "aria-label": "Tipos de tour" });
  for (const type of TOUR_TYPES) {
    const item = h("a", { class: "bt-menu-item", href: catalogUrl({ type: type.code }) }, [
      h("span", {}, [type.label]),
      h("small", {}, [TYPE_HINTS[type.code] ?? ""]),
    ]);
    markHandled(item);
    menu.append(item);
  }
  const custom = h("button", { type: "button", class: "bt-menu-item" }, [
    h("span", {}, ["Personalizados"]),
    h("small", {}, ["Cuéntale al asistente lo que buscas"]),
  ]);
  markHandled(custom);
  custom.addEventListener("click", () => {
    closeAll();
    openAssistant("Personalizado", explorar);
  });
  menu.append(custom);
  links.classList.add("bt-nav-pill");
  menu.style.left = `${explorar.offsetLeft}px`;
  markHandled(explorar);
  bindDropdown(explorar, menu, links);
}

function setupLanguage(right: HTMLElement): void {
  const button = [...right.querySelectorAll<HTMLButtonElement>("button")].find((b) => /^[A-Z]{2}$/.test(textOf(b)));
  if (!button) return;
  markHandled(button);
  button.setAttribute("aria-label", "Cambiar idioma");
  const code = [...button.querySelectorAll("span")].find((s) => /^[A-Z]{2}$/.test(textOf(s))) ?? button;
  code.setAttribute("data-bt-no-i18n", "");
  const menu = h("div", { id: "bt-menu-lang", class: "bt-menu bt-menu--right bt-glass", hidden: true, "aria-label": "Cambiar idioma" });

  const render = (lang: Lang): void => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    code.textContent = meta?.short ?? "ES";
    menu.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.lang === lang));
    });
  };

  for (const lang of LANGUAGES) {
    const item = h("button", { type: "button", class: "bt-menu-item", "data-lang": lang.code, lang: lang.code, "data-bt-no-i18n": true }, [lang.label]);
    markHandled(item);
    item.addEventListener("click", () => {
      setLanguage(lang.code);
      render(lang.code);
      closeAll();
      button.focus();
    });
    menu.append(item);
  }
  render(currentLang());
  right.classList.add("bt-nav-pill");
  bindDropdown(button, menu, right);
}

function setupTheme(right: HTMLElement): void {
  const svg = [...right.children].find((child) => child.tagName.toLowerCase() === "svg") as SVGSVGElement | undefined;
  if (!svg) return;
  const button = h("button", { type: "button", class: "bt-theme-btn", "aria-label": "Cambiar tema" });
  markHandled(button);
  // Fija el tamaño del icono desde su viewBox: dentro del botón ya no lo estira el flex de la cápsula.
  const box = svg.viewBox.baseVal;
  if (box && box.width > 0) {
    svg.style.width = `${box.width}px`;
    svg.style.height = `${box.height}px`;
  }
  svg.replaceWith(button);
  button.append(svg);
  const menu = h("div", { id: "bt-menu-theme", class: "bt-menu bt-menu--right bt-glass", hidden: true, "aria-label": "Cambiar tema" });

  const render = (theme: Theme): void => {
    menu.querySelectorAll<HTMLButtonElement>("[data-theme-option]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.themeOption === theme));
    });
  };

  for (const theme of THEMES) {
    const item = h("button", { type: "button", class: "bt-menu-item", "data-theme-option": theme }, [THEME_LABELS[theme]]);
    markHandled(item);
    item.addEventListener("click", () => {
      setTheme(theme);
      render(theme);
      closeAll();
      button.focus();
    });
    menu.append(item);
  }
  let stored: Theme = "colorido";
  try {
    stored = parseTheme(window.localStorage.getItem("borondo.theme"));
  } catch {
    // Sin almacenamiento: se muestra el tema predeterminado.
  }
  render(stored);
  right.classList.add("bt-nav-pill");
  bindDropdown(button, menu, right);
}

/** El FAB "¿Te ayudamos?" queda fijo en pantalla (como el rail de redes) y abre el asistente. */
function setupAssistantFab(stage: HTMLElement): void {
  const fab = [...stage.querySelectorAll<HTMLButtonElement>("button")].find((b) => textOf(b) === "¿Te ayudamos?");
  if (!fab) return;
  markHandled(fab);
  fab.classList.add("bt-fab-fixed");
  fab.setAttribute("aria-haspopup", "dialog");
  fab.addEventListener("click", () => openAssistant(undefined, fab));
}

/**
 * Indicador de la navbar (tarea 13): una sola píldora turquesa que se desliza hacia la opción
 * bajo el mouse o con foco, y vuelve a "Explorar" (opción predeterminada) al salir.
 */
function setupIndicator(links: HTMLElement, explorar: HTMLAnchorElement): void {
  const items = [...links.children].filter((c): c is HTMLAnchorElement => c instanceof HTMLAnchorElement);
  if (items.length < 2) return;
  links.classList.add("bt-nav-links");
  const pill = h("span", { class: "bt-nav-indicator", "aria-hidden": "true" });
  // La pildora vive dentro de la capsula de enlaces (su offsetParent), nunca dentro de una capa de
  // vidrio: esa capa vacia de Figma se neutraliza (display:none). Se antepone a los enlaces para
  // quedar debajo de ellos (los enlaces llevan z-index mayor).
  links.prepend(pill);
  let active: HTMLAnchorElement = explorar;
  const place = (item: HTMLAnchorElement): void => {
    // offsetLeft/Top del enlace y de la pildora comparten offsetParent (la capsula, position:relative),
    // asi que el translate queda alineado con el enlace indicado tras el layout.
    pill.style.width = `${item.offsetWidth}px`;
    pill.style.height = `${item.offsetHeight}px`;
    pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
    for (const i of items) i.classList.toggle("is-indicated", i === item);
  };
  const moveTo = (item: HTMLAnchorElement): void => { active = item; place(item); };
  // Recoloca el indicador despues del layout real: primer frame, carga de fuentes (cambia el ancho
  // de los enlaces) y cambios de tamano de la capsula (resize/tema/idioma).
  const refresh = (): void => place(active);
  for (const item of items) {
    item.addEventListener("mouseenter", () => moveTo(item));
    item.addEventListener("focus", () => moveTo(item));
  }
  links.addEventListener("mouseleave", () => moveTo(explorar));
  links.addEventListener("focusout", (event) => { if (!links.contains(event.relatedTarget as Node)) moveTo(explorar); });
  moveTo(explorar);
  requestAnimationFrame(refresh);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(refresh).observe(links);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => undefined);
  window.addEventListener("resize", refresh, { passive: true });
}

export function initChrome(): void {
  const stage = getStage();
  if (!stage) return;
  setupAssistantFab(stage);
  const nav = findNav(stage);
  if (!nav) return;
  const { row, links, explorar } = nav;
  row.classList.add("bt-nav-row");
  setupLogo(row, links);
  setupExplorar(links, explorar);
  setupIndicator(links, explorar);
  const right = row.lastElementChild as HTMLElement | null;
  if (right && right !== links) {
    setupLanguage(right);
    setupTheme(right);
  }
}
