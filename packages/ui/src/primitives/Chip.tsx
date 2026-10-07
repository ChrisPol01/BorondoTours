/**
 * Chip — filtro o acceso rápido en forma de píldora (Figma: set "Chip" 165:104621).
 * Alto 32 (sm) o 40 (md). Si recibe `selected`, es un toggle (`aria-pressed`);
 * si recibe `href`, es un enlace. Seleccionado = fondo Turquesa con texto Negro Volcánico.
 */
import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";

import { cx } from "../lib/cx";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly selected?: boolean;
  readonly size?: "sm" | "md";
  readonly href?: string;
  readonly className?: string;
}

export function chipClasses(selected: boolean, size: "sm" | "md", className?: string): string {
  return cx(
    "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill font-body text-caption transition-[background-color,transform] duration-brand ease-brand",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.98]",
    size === "sm" ? "h-8 px-3.5 before:absolute before:inset-x-0 before:-inset-y-1.5" : "h-10 px-4",
    selected ? "bg-action-primary font-semibold text-on-action" : "glass-surface glass-interactive text-text-primary",
    className,
  );
}

export function Chip({ children, icon, selected, size = "sm", href, className, type = "button", ...rest }: ChipProps): JSX.Element {
  const classes = chipClasses(Boolean(selected), size, className);
  const inner = (
    <>
      {icon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0 [&>svg]:size-full">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} className={classes} aria-current={selected ? "page" : undefined}>
        {inner}
      </a>
    );
  }
  return (
    <button {...rest} type={type} className={classes} aria-pressed={selected === undefined ? undefined : selected}>
      {inner}
    </button>
  );
}
