/**
 * Tabs — pestañas accesibles (Figma: set "Tab" 165:104635), patrón WAI-ARIA tablist.
 * Foco con roving tabindex: flechas izquierda/derecha, Inicio y Fin; activación automática.
 * Activa: fondo Turquesa 16 % + texto primario semibold. Inactiva: texto muted.
 */
import { useId, useRef, type JSX, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../lib/cx";

export interface TabItem<V extends string> {
  readonly value: V;
  readonly label: string;
  /** Contador opcional (ej. reservas por pestaña). */
  readonly count?: number;
  readonly disabled?: boolean;
}

export interface TabsProps<V extends string> {
  readonly items: readonly TabItem<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  /** Nombre accesible del grupo de pestañas. */
  readonly label: string;
  /** Contenido del panel activo. Si se omite, las pestañas solo filtran (sin tabpanel). */
  readonly children?: ReactNode;
  readonly className?: string;
}

export function Tabs<V extends string>({ items, value, onChange, label, children, className }: TabsProps<V>): JSX.Element {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = items.filter((item) => !item.disabled);

  const focusValue = (next: V): void => {
    onChange(next);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const index = enabled.findIndex((item) => item.value === value);
    const last = enabled.length - 1;
    const targets: Partial<Record<string, number>> = {
      ArrowRight: index >= last ? 0 : index + 1,
      ArrowLeft: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    const item = enabled[target];
    if (!item) return;
    event.preventDefault();
    focusValue(item.value);
  };

  const tabId = (v: V): string => `${baseId}-tab-${v}`;
  const panelId = `${baseId}-panel`;

  return (
    <div className={className}>
      <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex max-w-full gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              id={tabId(item.value)}
              type="button"
              role="tab"
              data-value={item.value}
              aria-selected={active}
              aria-controls={children ? panelId : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={active ? 0 : -1}
              onClick={() => !item.disabled && onChange(item.value)}
              className={cx(
                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill px-4 font-body text-body2 transition-colors duration-brand ease-brand",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                active ? "bg-action-primary/16 font-semibold text-text-primary" : "text-text-muted hover:bg-azul-condor/12 hover:text-text-primary",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-pill bg-surface-card px-1.5 text-label tabular-nums" aria-label={`(${item.count})`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {children && (
        <div id={panelId} role="tabpanel" aria-labelledby={tabId(value)} tabIndex={0} className="mt-4 focus-visible:outline-2 focus-visible:outline-focus">
          {children}
        </div>
      )}
    </div>
  );
}
