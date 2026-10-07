/**
 * RadioGroup — grupo de radios nativos (Figma: set "Radio" 165:104681).
 * Las flechas del teclado cambian la opción (comportamiento nativo). `fieldset` + `legend`
 * dan el nombre accesible del grupo.
 */
import { useId, type ChangeEvent, type JSX, type ReactNode } from "react";

import { cx } from "../lib/cx";

export interface RadioOption<V extends string> {
  readonly value: V;
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  readonly legend: string;
  readonly hideLegend?: boolean;
  readonly options: readonly RadioOption<V>[];
  readonly value: V | null;
  readonly onChange: (value: V) => void;
  readonly name?: string;
  readonly error?: string;
  readonly orientation?: "vertical" | "horizontal";
  readonly className?: string;
}

export function RadioGroup<V extends string>({
  legend,
  hideLegend = false,
  options,
  value,
  onChange,
  name,
  error,
  orientation = "vertical",
  className,
}: RadioGroupProps<V>): JSX.Element {
  const autoId = useId();
  const groupName = name ?? `radio-${autoId}`;
  const errorId = `${groupName}-error`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const option = options.find((o) => o.value === event.target.value);
    if (option) onChange(option.value);
  };

  return (
    <fieldset className={cx("flex flex-col gap-2", className)} aria-describedby={error ? errorId : undefined}>
      <legend className={cx("mb-1 font-body text-caption font-semibold text-text-primary", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cx("flex gap-x-6 gap-y-1", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap")}>
        {options.map((option) => {
          const inputId = `${groupName}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={cx(
                "inline-flex min-h-11 items-center gap-2.5 font-body text-body2",
                option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                error ? "text-sold-out" : "text-text-primary",
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={handleChange}
                aria-invalid={error ? true : undefined}
                className={cx(
                  "size-5 shrink-0 cursor-[inherit] appearance-none rounded-full border-2 bg-transparent transition-[box-shadow,border-color] duration-brand",
                  // Punto interior de 10 px con sombra interna: sin pseudo-elementos (los inputs no los admiten).
                  "checked:border-action-primary checked:shadow-[inset_0_0_0_3px_var(--semantic-surface-page),inset_0_0_0_10px_var(--semantic-action-primary)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  error ? "border-sold-out" : "border-text-muted",
                )}
              />
              <span className="flex flex-col">
                <span>{option.label}</span>
                {option.description && <span className="text-label text-text-muted">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="font-body text-label text-sold-out">
          {error}
        </p>
      )}
    </fieldset>
  );
}
