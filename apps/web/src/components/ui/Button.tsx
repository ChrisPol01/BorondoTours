/**
 * `Button` — botón base de la UI Library del Portal B2C (R3.1–R3.9).
 *
 * Componente funcional React (island-friendly): puede montarse dentro de
 * cualquier island con una directiva de cliente. Toda la apariencia se expresa
 * con utilidades Tailwind que referencian los design tokens de marca "Ave azul"
 * (`bg-turquesa`, `hover:bg-verde`, `bg-dorado`, `text-negro-volcanico`, …)
 * mapeados en `styles/global.css` (`@theme`). No hay literales hexadecimales
 * en el componente (R1.9).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Variantes (R3.1–R3.4)
 * ─────────────────────────────────────────────────────────────────────────
 *   • primary   — fondo Turquesa Laguna, texto blanco; al hover pasa a Verde
 *                 Frailejón con una transición ≤300ms (R3.2).
 *   • cta        — fondo Dorado, texto Negro Volcánico (R3.3).
 *   • secondary  — fondo transparente, borde con contraste ≥3:1 (Azul Profundo)
 *                 y texto oscuro con contraste ≥4.5:1 (Negro Volcánico) (R3.4).
 *
 * Foco de teclado (R3.5): anillo de foco visible con contraste ≥3:1 respecto al
 * fondo adyacente (Azul Profundo sobre Blanco Niebla), mostrado solo con
 * `:focus-visible` (navegación por teclado).
 *
 * Estado deshabilitado (R3.6/R3.7): se usa `aria-disabled="true"` en lugar del
 * atributo nativo `disabled` para mantener el botón perceptible por lectores de
 * pantalla; la opacidad baja a ≤0.5 y el manejador de click se bloquea, de modo
 * que la acción asociada NO se ejecuta.
 *
 * Etiqueta (R3.8/R3.9): el texto se resuelve vía i18n con `t(labelKey)`. La
 * función `resolve()` subyacente ya cae al idioma de respaldo y, en último
 * término, a la clave literal (nunca cadena vacía), cumpliendo R3.9.
 *
 * TypeScript strict, sin `any`.
 */
import type { JSX, MouseEvent } from "react";

import { useTranslation } from "../../lib/i18n/provider";

/** Variantes visuales del botón (R3.1–R3.4). */
export type ButtonVariant = "primary" | "cta" | "secondary";

/** Props de `Button` (contrato de `design.md`). */
export interface ButtonProps {
  /** Variante visual: `primary` | `cta` | `secondary`. */
  readonly variant: ButtonVariant;
  /** Clave i18n de la etiqueta; se renderiza con `t(labelKey)` (R3.8/R3.9). */
  readonly labelKey: string;
  /** Estado deshabilitado: opacidad ≤0.5 + `aria-disabled` + bloqueo de click. */
  readonly disabled?: boolean;
  /** Acción asociada; se ignora mientras el botón está deshabilitado (R3.7). */
  readonly onClick?: () => void;
  /** Tipo del botón nativo. Por defecto `"button"`. */
  readonly type?: "button" | "submit";
}

/**
 * Clases base compartidas por todas las variantes.
 *
 * - Tipografía de botón de marca (`font-body`, `text-button`, semibold).
 * - `transition-colors duration-300`: la transición de color al hover dura
 *   300ms como máximo (R3.2).
 * - Anillo de foco visible solo con teclado (`focus-visible`), color Azul
 *   Profundo con offset para asegurar contraste ≥3:1 (R3.5).
 */
const BASE_CLASSES = [
  "inline-flex items-center justify-center",
  "font-body text-button font-semibold",
  "min-h-11 rounded-control px-6 py-3",
  "transition-colors duration-brand ease-brand",
  "focus:outline-none",
  "focus-visible:ring-2 focus-visible:ring-offset-2",
  "focus-visible:ring-azul-profundo focus-visible:ring-offset-blanco-niebla",
].join(" ");

/** Clases por variante (referencian tokens de marca, sin literales hex). */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // R3.1 fondo Turquesa + texto WCAG; R3.2 hover → Verde Frailejón.
  primary: "bg-action-primary text-on-action hover:bg-action-primary-hover",
  // R3.3 fondo Dorado + texto Negro Volcánico.
  cta: "bg-action-cta text-text-primary hover:bg-action-cta",
  // R3.4 transparente + borde/foco y texto con contraste WCAG AA.
  secondary:
    "bg-transparent border border-focus text-text-primary hover:bg-surface-warm",
};

/** Clases del estado deshabilitado (R3.6): opacidad ≤0.5. */
const DISABLED_CLASSES = "opacity-50 cursor-not-allowed";

/**
 * Botón base de la UI Library.
 *
 * @param props `{ variant, labelKey, disabled?, onClick?, type? }`.
 * @returns Un `<button>` con la etiqueta i18n resuelta y los estilos de marca.
 */
export function Button({
  variant,
  labelKey,
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps): JSX.Element {
  const { t } = useTranslation();

  const classes = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    disabled ? DISABLED_CLASSES : "",
  ]
    .filter((token) => token.length > 0)
    .join(" ");

  // R3.7: mientras está deshabilitado se bloquea la activación sin ejecutar la
  // acción asociada. Se usa `aria-disabled` (no el atributo nativo `disabled`)
  // para mantener el botón perceptible/enfocable por tecnologías de apoyo.
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.();
  };

  return (
    <button
      type={type}
      className={classes}
      aria-disabled={disabled}
      onClick={handleClick}
    >
      {t(labelKey)}
    </button>
  );
}
