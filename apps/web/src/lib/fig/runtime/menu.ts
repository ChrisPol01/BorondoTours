/**
 * Menús desplegables del runtime (patrón disclosure: aria-expanded + aria-controls).
 * Un solo menú abierto a la vez; se cierran con Escape, al elegir o al hacer clic fuera.
 */
import { currentLang, translateTree } from "./i18n-dom";
import { hideAnimated } from "./dom";

export interface Dropdown {
  readonly trigger: HTMLElement;
  readonly menu: HTMLDivElement;
}

const dropdowns: Dropdown[] = [];
let listening = false;

export function closeMenu(d: Dropdown, restoreFocus = false): void {
  if (d.menu.hidden) return;
  d.trigger.setAttribute("aria-expanded", "false");
  hideAnimated(d.menu);
  if (restoreFocus) d.trigger.focus();
}

export function closeAll(except?: Dropdown): void {
  for (const d of dropdowns) if (d !== except) closeMenu(d);
}

function listen(): void {
  if (listening) return;
  listening = true;
  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    for (const d of dropdowns) {
      if (!d.menu.hidden && !d.menu.contains(target) && !d.trigger.contains(target)) closeMenu(d);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = dropdowns.find((d) => !d.menu.hidden);
    if (open) closeMenu(open, true);
  });
}

/** Conecta un disparador con su menú. El menú se monta dentro de `host` (posicionado). */
export function bindDropdown(trigger: HTMLElement, menu: HTMLDivElement, host: HTMLElement): Dropdown {
  listen();
  const d: Dropdown = { trigger, menu };
  dropdowns.push(d);
  trigger.classList.add("bt-menu-trigger");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", menu.id);
  host.append(menu);
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (menu.hidden) {
      closeAll(d);
      translateTree(menu, currentLang());
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    } else {
      closeMenu(d);
    }
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" || !menu.hidden) return;
    event.preventDefault();
    trigger.click();
    menu.querySelector<HTMLElement>("a,button")?.focus();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(d, true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = [...menu.querySelectorAll<HTMLElement>("a,button")];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
    event.preventDefault();
    next?.focus();
  });
  return d;
}
