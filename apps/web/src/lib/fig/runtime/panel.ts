/**
 * Panel lateral accesible (patrón design.md §8f): entra de derecha a izquierda, sale de izquierda a
 * derecha, se monta por encima de las pestañas laterales y del rail (z-index 60), atrapa el foco,
 * cierra con Escape, con la X o al hacer clic en el velo, y devuelve el foco a quien lo abrió.
 */
import { t, type Lang } from "../i18n";
import { currentLang, translateTree } from "./i18n-dom";
import { focusables, getStage, h, hideAnimated, icon, ICONS } from "./dom";

export interface Panel {
  readonly overlay: HTMLDivElement;
  readonly body: HTMLDivElement;
  open(trigger?: HTMLElement | null): void;
  close(): void;
  isOpen(): boolean;
}

interface PanelOptions {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly narrow?: boolean;
  /** Variante ancha y centrada (vitrinas Promociones / Más vendidos): cabecera con icono y acciones. */
  readonly wide?: boolean;
  /** Trazos del icono circular de la cabecera (solo variante ancha). */
  readonly iconPaths?: readonly string[];
  /** Controles entre el título y el botón de cerrar (flechas, "Ver todas"). */
  readonly actions?: readonly HTMLElement[];
}

let openPanels = 0;

export function createPanel(options: PanelOptions): Panel {
  const lang: Lang = currentLang();
  const titleId = `${options.id}-title`;
  const closeBtn = h("button", { type: "button", class: "bt-icon-btn bt-close", "aria-label": t("Cerrar", lang), "data-bt-handled": true }, [icon(ICONS.close)]);
  const head = h("div", { class: "bt-panel-head" }, [
    ...(options.iconPaths ? [h("span", { class: "bt-panel-icon" }, [icon(options.iconPaths, 24)])] : []),
    h("div", {}, [
      h("h2", { id: titleId, class: "bt-panel-title" }, [options.title]),
      ...(options.subtitle ? [h("p", { class: "bt-panel-sub" }, [options.subtitle])] : []),
    ]),
    ...(options.actions ? [h("div", { class: "bt-panel-actions" }, [...options.actions])] : []),
    closeBtn,
  ]);
  const body = h("div", { class: "bt-panel-body" });
  const panel = h(
    "div",
    { class: `bt-panel bt-glass${options.narrow ? " bt-panel--narrow" : ""}${options.wide ? " bt-panel--wide" : ""}`, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId },
    [head, body],
  );
  const overlay = h("div", { id: options.id, class: `bt-overlay${options.wide ? " bt-overlay--center" : ""}`, hidden: true }, [panel]);
  (getStage() ?? document.body).append(overlay);

  let returnFocus: HTMLElement | null = null;

  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      api.close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusables(panel);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  const api: Panel = {
    overlay,
    body,
    isOpen: () => !overlay.hidden,
    open(trigger) {
      if (!overlay.hidden) return;
      returnFocus = trigger ?? (document.activeElement as HTMLElement | null);
      translateTree(overlay, currentLang());
      overlay.hidden = false;
      openPanels++;
      document.documentElement.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      window.requestAnimationFrame(() => (focusables(panel)[0] ?? closeBtn).focus());
    },
    close() {
      if (overlay.hidden || overlay.classList.contains("is-closing")) return;
      document.removeEventListener("keydown", onKey);
      hideAnimated(overlay, () => {
        openPanels = Math.max(0, openPanels - 1);
        if (openPanels === 0) document.documentElement.style.overflow = "";
        returnFocus?.focus();
      });
    },
  };

  closeBtn.addEventListener("click", () => api.close());
  overlay.addEventListener("click", (event) => { if (event.target === overlay) api.close(); });
  return api;
}
