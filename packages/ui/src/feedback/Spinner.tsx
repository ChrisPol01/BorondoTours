import type { JSX } from "react";

import { cx } from "../lib/cx";

export interface SpinnerProps {
  /** Lado en píxeles (Figma: 16 en botones). */
  readonly size?: 16 | 20 | 24;
  /** Texto para lectores de pantalla. Si se omite, el spinner es decorativo (`aria-hidden`). */
  readonly label?: string;
  readonly className?: string;
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps["size"]>, string> = { 16: "size-4", 20: "size-5", 24: "size-6" };

/** Indicador de carga circular. Hereda el color del texto (`currentColor`). */
export function Spinner({ size = 16, label, className }: SpinnerProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cx("shrink-0 animate-spin", SIZE_CLASS[size], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
