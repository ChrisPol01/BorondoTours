/**
 * Badge — etiqueta de estado. Nunca comunica solo con color: siempre lleva texto
 * y, en los tonos de estado, un punto indicador (Figma: "Badge/Disponible").
 */
import type { JSX, ReactNode } from "react";

import { cx } from "../lib/cx";

export type BadgeTone = "info" | "success" | "warning" | "danger" | "neutral" | "light" | "brand";

export interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
  /** Punto indicador a la izquierda del texto. */
  readonly dot?: boolean;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

const TONE: Record<BadgeTone, string> = {
  info: "bg-action-primary/16 text-text-primary",
  success: "bg-available text-on-action",
  warning: "bg-limited text-on-action",
  danger: "bg-sold-out text-on-danger",
  neutral: "bg-surface-card text-text-primary",
  // Sobre fotografía: blanco sólido con texto Negro Volcánico (Figma TourCard).
  light: "bg-blanco-niebla text-negro-volcanico",
  brand: "bg-action-primary text-on-action",
};

export function Badge({ children, tone = "neutral", dot = false, size = "md", className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill font-body font-semibold",
        size === "sm" ? "h-4 px-1.5 text-micro" : "h-6 px-3 text-label",
        TONE[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-2 rounded-full bg-current" />}
      {children}
    </span>
  );
}
