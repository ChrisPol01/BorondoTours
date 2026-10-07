/**
 * Button — botón base compartido (Figma: set "Button" 165:104505).
 *
 * Variantes: primary (Turquesa → hover Verde), cta (Dorado → hover Verde),
 * secondary (outline de vidrio), ghost (sin fondo) y danger (error sólido).
 * Tamaños: sm 32 px · md 40 px · lg 48 px. En sm se amplía el área táctil a 44 px
 * con un pseudo-elemento, sin cambiar el tamaño visual (WCAG 2.5.8).
 *
 * Estados: hover, focus-visible (anillo), pressed (sombra interna + scale 0.98),
 * disabled (`aria-disabled`, opacidad 0.5, no ejecuta la acción) y loading
 * (`aria-busy`, spinner). Con `href` se renderiza un `<a>`.
 *
 * El texto lo pasa quien lo usa (ya traducido): la librería no depende de i18n.
 */
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX, MouseEvent, ReactNode } from "react";

import { Spinner } from "../feedback/Spinner";
import { cx } from "../lib/cx";

export type ButtonVariant = "primary" | "cta" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Icono (lucide-react u otro SVG); se marca `aria-hidden` automáticamente. */
  readonly icon?: ReactNode;
  readonly iconPosition?: "start" | "end";
  readonly loading?: boolean;
  /** Texto mientras carga (Figma: "Cargando…"). Si se omite, se conserva el contenido. */
  readonly loadingLabel?: string;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly children?: ReactNode;
  readonly className?: string;
}

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "children" | "className">;
type NativeAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">;

export type ButtonAsButtonProps = ButtonOwnProps & NativeButtonProps & { readonly href?: undefined };
export type ButtonAsLinkProps = ButtonOwnProps & NativeAnchorProps & { readonly href: string };
export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const BASE =
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-pill font-body font-semibold " +
  "transition-[background-color,box-shadow,transform,opacity] duration-brand ease-brand " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const SIZE: Record<ButtonSize, string> = {
  // before: amplía el área táctil a 44 px sin alterar el tamaño visual de 32 px.
  sm: "h-8 px-4 text-caption before:absolute before:inset-x-0 before:-inset-y-1.5",
  md: "h-10 px-5 text-body2",
  lg: "h-12 px-6 text-nav",
};

const VARIANT: Record<ButtonVariant, { base: string; interactive: string }> = {
  primary: { base: "bg-action-primary text-on-action", interactive: "hover:bg-action-primary-hover" },
  cta: { base: "bg-action-cta text-on-action", interactive: "hover:bg-action-primary-hover" },
  secondary: { base: "glass-surface text-text-primary", interactive: "glass-interactive" },
  ghost: { base: "bg-transparent text-text-primary", interactive: "hover:bg-surface-card" },
  danger: { base: "bg-sold-out text-on-danger", interactive: "hover:opacity-90" },
};

const PRESSED = "active:scale-[0.98] active:shadow-pressed";
const DISABLED = "cursor-not-allowed opacity-50";

/** Clases de un botón según variante, tamaño y estado. Exportada para reutilizar el estilo en enlaces de Astro. */
export function buttonClasses(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  inactive?: boolean;
  fullWidth?: boolean;
  className?: string;
}): string {
  const { variant = "primary", size = "md", inactive = false, fullWidth = false, className } = options;
  const v = VARIANT[variant];
  return cx(BASE, SIZE[size], v.base, !inactive && v.interactive, !inactive && PRESSED, inactive && DISABLED, fullWidth && "w-full", className);
}

export function Button(props: ButtonProps): JSX.Element {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "start",
    loading = false,
    loadingLabel,
    disabled = false,
    fullWidth = false,
    children,
    className,
    ...rest
  } = props;

  const inactive = disabled || loading;
  const classes = buttonClasses({ variant, size, inactive: disabled, fullWidth, className });
  const iconNode = icon ? (
    <span aria-hidden="true" className="inline-flex size-[1.125rem] shrink-0 items-center justify-center [&>svg]:size-full">
      {icon}
    </span>
  ) : null;

  const content = loading ? (
    <>
      <Spinner size={16} />
      <span>{loadingLabel ?? children}</span>
    </>
  ) : (
    <>
      {iconPosition === "start" && iconNode}
      {children !== undefined && <span>{children}</span>}
      {iconPosition === "end" && iconNode}
    </>
  );

  if (rest.href !== undefined) {
    const { href, onClick, ...anchorRest } = rest as NativeAnchorProps & { href: string };
    const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
      if (inactive) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };
    return (
      <a
        {...anchorRest}
        href={inactive ? undefined : href}
        role={inactive ? "link" : undefined}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        className={classes}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  const { type = "button", onClick, ...buttonRest } = rest as NativeButtonProps;
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    // aria-disabled (no `disabled` nativo) mantiene el botón enfocable y anunciado; aquí se bloquea la acción.
    if (inactive) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      {...buttonRest}
      type={type}
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      className={classes}
      onClick={handleClick}
    >
      {content}
    </button>
  );
}
