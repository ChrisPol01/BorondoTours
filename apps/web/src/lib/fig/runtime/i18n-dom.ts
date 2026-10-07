/**
 * Aplica el idioma elegido a las vistas generadas. Guarda el texto original en español de cada nodo
 * para poder volver a traducir (o regresar a español) sin recargar. La elección se guarda en
 * localStorage ("borondo.lang") y aplica en todas las pantallas.
 */
import { DEFAULT_LANG, HTML_LANG, LANG_STORAGE_KEY, parseLang, translatePhrase, type Lang } from "../i18n";

const originals = new WeakMap<Text, string>();
const ATTRS = ["aria-label", "placeholder", "title", "alt"] as const;
const SKIP = "script,style,svg,[data-bt-no-i18n]";

export function currentLang(): Lang {
  try {
    return parseLang(window.localStorage.getItem(LANG_STORAGE_KEY));
  } catch {
    return DEFAULT_LANG;
  }
}

function translateText(node: Text, lang: Lang): void {
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP)) return;
  let source = originals.get(node);
  if (source === undefined) {
    source = node.nodeValue ?? "";
    originals.set(node, source);
  }
  if (!source.trim()) return;
  const translated = translatePhrase(source, lang);
  const next = translated ?? source;
  if (node.nodeValue !== next) node.nodeValue = next;
}

function translateAttrs(element: Element, lang: Lang): void {
  if (element.closest(SKIP)) return;
  for (const attr of ATTRS) {
    const store = `data-bt-src-${attr}`;
    const current = element.getAttribute(attr);
    if (current === null) continue;
    const source = element.getAttribute(store) ?? current;
    if (!element.hasAttribute(store)) element.setAttribute(store, source);
    const next = translatePhrase(source, lang) ?? source;
    if (current !== next) element.setAttribute(attr, next);
  }
}

/** Traduce un subárbol (textos y atributos accesibles). */
export function translateTree(root: Element, lang: Lang = currentLang()): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) translateText(node as Text, lang);
  translateAttrs(root, lang);
  root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => translateAttrs(el, lang));
}

/** Reemplaza el texto de un elemento por una frase en español y la traduce al idioma activo. */
export function setSourceText(element: Element, spanish: string): void {
  element.textContent = spanish;
  translateTree(element);
}

export function applyLanguage(lang: Lang): void {
  document.documentElement.lang = HTML_LANG[lang];
  translateTree(document.body, lang);
  document.dispatchEvent(new CustomEvent("borondo:lang", { detail: lang }));
}

export function setLanguage(lang: Lang): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Sin almacenamiento: el idioma aplica solo en esta pantalla.
  }
  applyLanguage(lang);
}
