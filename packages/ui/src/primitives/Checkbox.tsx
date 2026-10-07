/**
 * Checkbox — casilla nativa con apariencia de marca (Figma: set "Checkbox" 165:104661).
 * Estados: off, on, indeterminado, focus, error, disabled. Área táctil ≥44 px vía la etiqueta.
 */
import { useEffect, useId, useRef, type InputHTMLAttributes, type JSX, type ReactNode } from "react";

import { cx } from "../lib/cx";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  readonly label: ReactNode;
  readonly indeterminate?: boolean;
  readonly error?: string;
  readonly className?: string;
}

export function Checkbox({ label, indeterminate = false, error, id, disabled, className, ...rest }: CheckboxProps): JSX.Element {
  const autoId = useId();
  const inputId = id ?? `checkbox-${autoId}`;
  const errorId = `${inputId}-error`;
  const ref = useRef<HTMLInputElement>(null);

  // `indeterminate` solo existe como propiedad del DOM, no como atributo HTML.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={inputId} className={cx("inline-flex min-h-11 items-center gap-2.5 font-body text-body2", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer", error ? "text-sold-out" : "text-text-primary")}>
        <span className="relative inline-flex size-5 shrink-0">
          <input
            {...rest}
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cx(
              "peer size-5 cursor-[inherit] appearance-none rounded-md border-2 bg-transparent transition-colors duration-brand",
              "checked:border-action-primary checked:bg-action-primary indeterminate:border-action-primary indeterminate:bg-action-primary",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              error ? "border-sold-out" : "border-text-muted",
            )}
          />
          <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute inset-0.5 hidden text-on-action peer-checked:block peer-indeterminate:hidden">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute inset-0.5 hidden text-on-action peer-indeterminate:block">
            <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="font-body text-label text-sold-out">
          {error}
        </p>
      )}
    </div>
  );
}
