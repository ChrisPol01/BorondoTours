/**
 * Centro legal de /nosotros (p45_67): acordeón exclusivo con un ancla por documento.
 * Los enlaces del colofón (/nosotros#terminos, #privacidad, #cancelacion, #retracto, #cookies)
 * bajan hasta esta sección y abren el documento correspondiente.
 */
import { LEGAL_DOCS, legalDocByAnchor, type LegalDoc } from "../legal";
import { getStage, h, markHandled, normalize, reducedMotion, textOf } from "./dom";
import { translateTree } from "./i18n-dom";
import { growWithContent } from "./layout";

interface Item {
  readonly anchor: string;
  readonly root: HTMLElement;
  readonly head: HTMLElement;
  readonly body: HTMLElement;
}

/** Sección "Centro legal": el contenedor del título h2 con ese texto. */
function findSection(stage: HTMLElement): HTMLElement | null {
  const heading = [...stage.querySelectorAll<HTMLElement>("h2")].find((el) => textOf(el) === "Centro legal");
  return heading?.parentElement?.parentElement ?? null;
}

function findItems(section: HTMLElement): Item[] {
  const titles = [...section.querySelectorAll<HTMLElement>("span")];
  const located = LEGAL_DOCS.map((doc) => {
    const title = titles.find((el) => textOf(el) === normalize(doc.title));
    const head = title?.parentElement ?? null;
    const root = head?.parentElement ?? null;
    const body = root ? ([...root.children].find((c) => c !== head && c.tagName === "SPAN") as HTMLElement | undefined) : undefined;
    return { doc, head, root, body };
  });
  // La clase del cuerpo que ya existe (documento abierto en el diseño) sirve de molde para los demás.
  const bodyClass = located.find((l) => l.body)?.body?.className ?? "";

  const items: Item[] = [];
  for (const { doc, head, root, body } of located) {
    if (!head || !root) continue;
    const content = renderDoc(doc, bodyClass);
    if (body) body.replaceWith(content);
    else root.append(content);
    items.push({ anchor: doc.anchor, root, head, body: content });
  }
  return items;
}

/** Documento completo: resumen, secciones numeradas, fecha y aviso. Con scroll interno. */
function renderDoc(doc: LegalDoc, bodyClass: string): HTMLElement {
  const parts: HTMLElement[] = [h("p", { class: "bt-legal-summary" }, [doc.summary])];
  for (const section of doc.sections) {
    parts.push(h("h3", { class: "bt-legal-h" }, [section.heading]));
    for (const text of section.paragraphs) parts.push(h("p", {}, [text]));
  }
  // La versión y la fecha ya aparecen en la cabecera de cada documento (diseño).
  // En otros idiomas, un aviso: el texto legal queda en español porque es la versión que rige.
  parts.unshift(h("p", { class: "bt-legal-lang" }, ["El texto legal completo está en español y esa es la versión que rige."]));
  return h(
    "div",
    { class: `${bodyClass} bt-legal-doc`, role: "region", tabindex: "0", "aria-label": doc.title },
    parts,
  );
}

export function initLegal(): void {
  const stage = getStage();
  if (!stage || location.pathname.replace(/\/$/, "") !== "/nosotros") return;
  const section = findSection(stage);
  if (!section) return;
  const items = findItems(section);
  const first = items[0];
  if (!first) return;

  const open = (target: Item, scroll: boolean): void => {
    for (const item of items) {
      const isTarget = item === target;
      item.body.hidden = !isTarget;
      item.head.setAttribute("aria-expanded", String(isTarget));
      item.root.classList.toggle("bt-legal-target", isTarget && scroll);
    }
    translateTree(target.body);
    target.body.scrollTop = 0;
    growWithContent(stage, target.body);
    if (scroll) target.root.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
  };

  // Todos cerrados: estado por defecto de /nosotros cuando NO se llega con un ancla del colofon.
  const collapseAll = (): void => {
    for (const item of items) {
      item.body.hidden = true;
      item.head.setAttribute("aria-expanded", "false");
      item.root.classList.remove("bt-legal-target");
      growWithContent(stage, item.body);
    }
  };

  for (const item of items) {
    item.root.id = item.anchor;
    item.root.classList.add("bt-legal-item");
    item.body.classList.add("bt-legal-body");
    item.body.id = `${item.anchor}-contenido`;
    item.head.classList.add("bt-legal-head");
    item.head.setAttribute("role", "button");
    item.head.setAttribute("tabindex", "0");
    item.head.setAttribute("aria-controls", item.body.id);
    markHandled(item.head);
    const toggle = (): void => {
      if (item.body.hidden) {
        open(item, false);
        history.replaceState(null, "", `#${item.anchor}`);
      } else {
        item.body.hidden = true;
        item.head.setAttribute("aria-expanded", "false");
        growWithContent(stage, item.body);
      }
    };
    item.head.addEventListener("click", toggle);
    item.head.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  }

  const fromHash = (): void => {
    const doc = legalDocByAnchor(location.hash);
    const item = doc ? items.find((i) => i.anchor === doc.anchor) : undefined;
    // Con ancla valida (ej. llegar desde el colofon a /nosotros#terminos): abre ese documento y baja.
    // Sin ancla: TODOS colapsados (antes abria "Terminos" por defecto, bug reportado).
    if (item) open(item, true);
    else collapseAll();
  };
  // Espera a que el navegador termine su propio salto al ancla (que aún no existía) antes de bajar.
  window.requestAnimationFrame(fromHash);
  window.addEventListener("hashchange", fromHash);
}
