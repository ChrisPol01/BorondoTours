/**
 * Heading y Text — tipografía de marca (Sora para titulares, Inter para texto).
 * El nivel semántico (`as`) es independiente del tamaño visual (`size`), para respetar
 * la jerarquía del documento (SEO y lectores de pantalla) sin forzar el aspecto.
 */
import type { ElementType, JSX, ReactNode } from "react";

import { cx } from "../lib/cx";

export type HeadingSize = "display" | "section" | "h1" | "h2" | "h3" | "h4" | "title" | "card";

const HEADING_SIZE: Record<HeadingSize, string> = {
  display: "text-display font-extrabold",
  section: "text-section font-bold",
  h1: "text-h1 font-extrabold",
  h2: "text-h2 font-bold",
  h3: "text-h3 font-semibold",
  h4: "text-h4 font-semibold",
  title: "text-title font-bold",
  card: "text-card-title font-semibold",
};

export interface HeadingProps {
  readonly as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  readonly size?: HeadingSize;
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
}

export function Heading({ as = "h2", size = "h2", children, id, className }: HeadingProps): JSX.Element {
  const Tag = as;
  return (
    <Tag id={id} className={cx("font-heading text-balance text-text-heading", HEADING_SIZE[size], className)}>
      {children}
    </Tag>
  );
}

export type TextSize = "lead" | "body1" | "body2" | "caption" | "label" | "micro";
export type TextTone = "primary" | "muted" | "subtle" | "inherit";

const TEXT_SIZE: Record<TextSize, string> = {
  lead: "text-lead",
  body1: "text-body1",
  body2: "text-body2",
  caption: "text-caption",
  label: "text-label",
  micro: "text-micro",
};
const TEXT_TONE: Record<TextTone, string> = {
  primary: "text-text-primary",
  muted: "text-text-muted",
  subtle: "text-text-subtle",
  inherit: "",
};

export interface TextProps {
  readonly as?: ElementType;
  readonly size?: TextSize;
  readonly tone?: TextTone;
  readonly weight?: "regular" | "semibold";
  readonly children: ReactNode;
  readonly className?: string;
}

export function Text({ as: Tag = "p", size = "body1", tone = "primary", weight = "regular", children, className }: TextProps): JSX.Element {
  return <Tag className={cx("font-body", TEXT_SIZE[size], TEXT_TONE[tone], weight === "semibold" && "font-semibold", className)}>{children}</Tag>;
}

/** Sobretítulo en mayúsculas espaciadas (Figma: "EXPLORA COLOMBIA", "MÁS ALLÁ DE COLOMBIA"). */
export function Eyebrow({ children, className }: { readonly children: ReactNode; readonly className?: string }): JSX.Element {
  return <p className={cx("font-body text-label font-semibold uppercase tracking-[0.08em] text-text-accent", className)}>{children}</p>;
}
