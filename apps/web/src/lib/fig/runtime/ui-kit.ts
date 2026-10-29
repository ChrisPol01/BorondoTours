/**
 * Kit de componentes del runtime de Figma (JS sin framework). Cada pieza existe UNA vez y se usa en
 * todas las pantallas; su estilo vive en fig-runtime.css (sección "Kit de componentes"), que carga en
 * todas las páginas. La colocación (left/top) la pone cada pantalla en su propio CSS.
 *
 * Antes de crear una pieza nueva, revisar si una de estas cubre el caso con una variante.
 * Toda pieza nueva o variante que no exista en Figma se replica en la sección 00 de Figma
 * (agente `figma-sync`, ver .kiro/agents/figma-sync.md).
 */
import { h, icon, ICONS } from "./dom";

type Child = Node | string;

/* ---------------- Botón ---------------- */
export type ButtonVariant = "primary" | "glass" | "link";

export interface ButtonOptions {
  readonly label: string;
  readonly variant?: ButtonVariant;
  /** Con href es <a>; sin href es <button type="button">. */
  readonly href?: string;
  /** Abre en otra pestaña (rel noopener noreferrer). */
  readonly external?: boolean;
  /** Flecha al final (se desplaza al pasar el mouse). */
  readonly arrow?: boolean;
  readonly ariaLabel?: string;
  /** Solo sin href: "submit" para enviar un formulario. */
  readonly type?: "button" | "submit";
  /** Ocupa todo el ancho (formularios y diálogos). */
  readonly block?: boolean;
}

/**
 * Botón de 44 px: `primary` (turquesa → verde), `glass` (vidrio del tema) o `link` (texto subrayado).
 * Sobrecargas: sin href devuelve siempre un <button>.
 */
export function button(options: ButtonOptions & { readonly href?: undefined }): HTMLButtonElement;
export function button(options: ButtonOptions): HTMLAnchorElement | HTMLButtonElement;
export function button(options: ButtonOptions): HTMLAnchorElement | HTMLButtonElement {
  const cls = `bt-btn bt-btn--${options.variant ?? "primary"}${options.block ? " bt-btn--block" : ""}`;
  const children: Child[] = [options.label];
  if (options.arrow) children.push(icon(ICONS.arrowRight, 16));
  const common = { class: cls, "aria-label": options.ariaLabel, "data-bt-handled": true };
  if (options.href) {
    return h("a", { ...common, href: options.href, target: options.external ? "_blank" : undefined, rel: options.external ? "noopener noreferrer" : undefined }, children);
  }
  return h("button", { ...common, type: options.type ?? "button" }, children);
}

/* ---------------- Encabezado de sección ---------------- */
export interface SectionHeadOptions {
  readonly eyebrow?: string;
  readonly title: string;
  /** id del título (para aria-labelledby de la sección). */
  readonly id?: string;
  /** Botones o sello a la derecha. */
  readonly aside?: readonly HTMLElement[];
}

/** Marca un bloque con fondo oscuro (surface-strong): vidrio y texto claros dentro, en cualquier tema. */
export const onStrong = (node: Element): void => node.classList.add("bt-on-strong");

/** Eyebrow + título (h2) a la izquierda y acciones a la derecha. */
export function sectionHead(options: SectionHeadOptions): HTMLElement {
  const text = h("div", {}, [
    ...(options.eyebrow ? [h("p", { class: "bt-eyebrow" }, [options.eyebrow])] : []),
    h("h2", { class: "bt-section-title", id: options.id }, [options.title]),
  ]);
  return h("div", { class: "bt-section-head" }, [text, ...(options.aside?.length ? [h("div", { class: "bt-section-actions" }, [...options.aside])] : [])]);
}

/* ---------------- Sello ---------------- */
/** Píldora de vidrio con icono (p. ej. "RNT 294364 · Agencia registrada"). */
export function seal(label: string, iconPaths: readonly string[]): HTMLElement {
  return h("span", { class: "bt-seal bt-glass-std" }, [icon(iconPaths, 18), label]);
}

/* ---------------- Tarjeta de cifra ---------------- */
export interface StatOptions {
  readonly value: string;
  readonly label: string;
  readonly icon: readonly string[];
}

/** Cifra grande con icono y texto, en vidrio. Se usa dentro de una lista (<ul>). */
export function statCard(stat: StatOptions): HTMLElement {
  return h("li", { class: "bt-stat bt-glass-std bt-lift" }, [
    h("span", { class: "bt-stat-icon", "aria-hidden": "true" }, [icon(stat.icon, 22)]),
    h("span", { class: "bt-stat-value" }, [stat.value]),
    h("span", { class: "bt-stat-label" }, [stat.label]),
  ]);
}

/* ---------------- Funcionalidad (tarjeta enlace) y grupo de funcionalidades ---------------- */
export interface FeatureOptions {
  readonly title: string;
  /** Beneficio en una línea. */
  readonly text: string;
  readonly icon: readonly string[];
  readonly href: string;
  /** Texto solo para lectores de pantalla que anuncia el destino ("Inicia sesión para usarlo"). */
  readonly srHint?: string;
}

/** Fila enlace en vidrio: icono, título, beneficio y flecha. Se usa dentro de una lista (<ul>). */
export function featureCard(feature: FeatureOptions): HTMLElement {
  return h("li", { class: "bt-feature-item" }, [
    h("a", { class: "bt-feature bt-glass-std bt-lift", href: feature.href, "data-bt-handled": true }, [
      h("span", { class: "bt-feature-icon", "aria-hidden": "true" }, [icon(feature.icon, 22)]),
      h("span", { class: "bt-feature-body" }, [
        h("span", { class: "bt-feature-title" }, [feature.title]),
        h("span", { class: "bt-feature-text" }, [feature.text]),
        ...(feature.srHint ? [h("span", { class: "bt-sr-only" }, [feature.srHint])] : []),
      ]),
      icon(ICONS.arrowRight, 18),
    ]),
  ]);
}

export interface FeatureGroupOptions {
  readonly title: string;
  readonly intro?: string;
  readonly features: readonly FeatureOptions[];
  /** Botón al pie del grupo. */
  readonly cta?: HTMLElement;
}

/** Bloque con título (h3), frase de entrada, lista de funcionalidades y un CTA. */
export function featureGroup(options: FeatureGroupOptions): HTMLElement {
  return h("div", { class: "bt-feature-group" }, [
    h("h3", { class: "bt-feature-group-title" }, [options.title]),
    ...(options.intro ? [h("p", { class: "bt-feature-group-intro" }, [options.intro])] : []),
    h("ul", { class: "bt-feature-list" }, options.features.map(featureCard)),
    ...(options.cta ? [options.cta] : []),
  ]);
}

/* ---------------- Estrellas ---------------- */
/** Cinco estrellas; las `filled` primeras rellenas. Decorativas: el texto accesible va aparte. */
export function stars(filled: number, size = 16): HTMLElement {
  return h("span", { class: "bt-stars", "aria-hidden": "true" }, Array.from({ length: 5 }, (_, i) => {
    const star = icon(ICONS.star, size);
    if (i < filled) star.classList.add("is-on");
    return star;
  }));
}

/* ---------------- Estado vacío ---------------- */
export interface EmptyStateOptions {
  readonly title: string;
  readonly text?: string;
  /** Nodo encima del título (icono, estrellas). */
  readonly media?: Node;
  /** "center" (listados) o "start" (dentro de una sección). */
  readonly align?: "center" | "start";
  /** Fondo de vidrio (tarjeta) en lugar de transparente. */
  readonly glass?: boolean;
  readonly actions?: readonly HTMLElement[];
}

/** Mensaje cuando no hay contenido: listados sin resultados, reseñas aún no publicadas, etc. */
export function emptyState(options: EmptyStateOptions): HTMLElement {
  const cls = ["bt-empty", options.align === "start" ? "bt-empty--start" : "", options.glass ? "bt-glass-std" : ""].filter(Boolean).join(" ");
  return h("div", { class: cls, role: "status" }, [
    ...(options.media ? [options.media] : []),
    h("h3", {}, [options.title]),
    ...(options.text ? [h("p", {}, [options.text])] : []),
    ...(options.actions?.length ? [h("div", { class: "bt-section-actions" }, [...options.actions])] : []),
  ]);
}

/* ---------------- Luz ambiental ---------------- */
/** Luces de marca desenfocadas detrás de un bloque, para que el vidrio tenga algo que difuminar. */
export const ambientGlow = (): HTMLElement => h("div", { class: "bt-ambient-glow", "aria-hidden": "true" });

/* ---------------- Interacción compartida ---------------- */
/** Aplica la interacción estándar (sube y brilla al pasar el mouse, se hunde al pulsar). */
export function lift(...nodes: ReadonlyArray<Element | null | undefined>): void {
  for (const node of nodes) node?.classList.add("bt-lift");
}

/* ---------------- Reseña ---------------- */
export interface ReviewCardData {
  readonly author: string;
  readonly date: string;
  readonly rating: number;
  readonly text: string;
  readonly url?: string;
  /** Texto accesible de la calificación ("5 de 5 estrellas"). */
  readonly ratingLabel: string;
  readonly linkLabel?: string;
}

/** Tarjeta de reseña (autor con inicial, fecha, estrellas, texto y enlace opcional). */
export function reviewCard(data: ReviewCardData): HTMLElement {
  const children: Child[] = [
    h("div", { class: "bt-review-head" }, [
      h("span", { class: "bt-review-avatar", "aria-hidden": "true" }, [data.author.trim().charAt(0).toLocaleUpperCase("es")]),
      h("span", { class: "bt-review-meta" }, [h("strong", { class: "bt-review-author" }, [data.author]), h("span", { class: "bt-review-date" }, [data.date])]),
    ]),
    h("span", { class: "bt-sr-only" }, [data.ratingLabel]),
    stars(data.rating),
    h("p", { class: "bt-review-text" }, [data.text]),
  ];
  if (data.url) {
    children.push(h("a", { class: "bt-review-link", href: data.url, target: "_blank", rel: "noopener noreferrer", "data-bt-handled": true }, [data.linkLabel ?? "Leer en Google", icon(ICONS.arrowRight, 14)]));
  }
  return h("li", { class: "bt-review-card bt-glass-std" }, children);
}

/** Resumen de calificación: nota grande, estrellas y total. */
export function ratingSummary(score: string, rounded: number, totalLabel: string, ratingLabel: string): HTMLElement {
  return h("div", { class: "bt-rating-summary bt-glass-std" }, [
    h("span", { class: "bt-rating-score" }, [score]),
    h("span", { class: "bt-sr-only" }, [ratingLabel]),
    stars(rounded, 20),
    h("span", { class: "bt-rating-total" }, [totalLabel]),
  ]);
}
