/**
 * Input — campo de texto con etiqueta, ayuda y error (Figma: set "Input" 165:104587).
 *
 * Estados: default, hover (borde 60 %), focus (anillo de foco), filled, error
 * (borde de error + mensaje con `aria-describedby`) y disabled (opacidad 0.5).
 * Alto del campo: 48 px (DESIGN.md §19). Superficie: vidrio (`glass-surface`).
 */
import { useId, type InputHTMLAttributes, type JSX, type ReactNode } from "react";

import { cx } from "../lib/cx";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "className"> {
  /** Etiqueta visible (obligatoria: WCAG 3.3.2). */
  readonly label: string;
  /** Texto de ayuda bajo el campo. */
  readonly hint?: string;
  /** Mensaje de error; activa `aria-invalid`. */
  readonly error?: string;
  /** Icono a la izquierda (decorativo). */
  readonly icon?: ReactNode;
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  readonly hideLabel?: boolean;
  readonly className?: string;
}

export function Input({ label, hint, error, icon, hideLabel = false, id, className, disabled, required, ...rest }: InputProps): JSX.Element {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const helpId = `${inputId}-help`;
  const invalid = Boolean(error);
  const helpText = error ?? hint;

  return (
    <div className={cx("flex flex-col gap-2", disabled && "opacity-50", className)}>
      <label htmlFor={inputId} className={cx("font-body text-caption font-semibold text-text-primary", hideLabel && "sr-only")}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div
        className={cx(
          "glass-surface flex h-12 items-center gap-2.5 rounded-control px-4",
          "transition-[border-color] duration-brand ease-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
          !disabled && !invalid && "hover:[--glass-border:var(--glass-border-hover)]",
          invalid && "[--glass-border:var(--semantic-sold-out)]",
        )}
      >
        {icon && (
          <span aria-hidden="true" className="inline-flex size-[1.125rem] shrink-0 text-text-muted [&>svg]:size-full">
            {icon}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="min-w-0 flex-1 bg-transparent font-body text-body1 text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
        />
      </div>
      {helpText && (
        <p id={helpId} className={cx("font-body text-label", invalid ? "text-sold-out" : "text-text-muted")} role={invalid ? "alert" : undefined}>
          {helpText}
        </p>
      )}
    </div>
  );
}
