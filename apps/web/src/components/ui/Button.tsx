/**
 * `Button` del Portal B2C — adaptador i18n sobre el botón de @borondo/ui.
 *
 * Mantiene la API histórica (`labelKey` resuelto con `t()`), usada por Navbar,
 * catálogo y detalle, pero el estilo y los estados vienen del componente
 * compartido (una sola fuente para B2C, ERP y B2B). Pantallas nuevas pueden usar
 * directamente `Button` de `@borondo/ui` pasando el texto ya traducido.
 */
import { Button as UiButton, type ButtonSize, type ButtonVariant } from "@borondo/ui";
import type { JSX, ReactNode } from "react";

import { useTranslation } from "../../lib/i18n/provider";

export type { ButtonVariant };

export interface ButtonProps {
  readonly variant: ButtonVariant;
  /** Clave i18n de la etiqueta; si no existe se muestra la clave (nunca vacío). */
  readonly labelKey: string;
  readonly size?: ButtonSize;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly href?: string;
  readonly fullWidth?: boolean;
}

export function Button({ variant, labelKey, size = "md", icon, disabled, loading, onClick, type = "button", href, fullWidth }: ButtonProps): JSX.Element {
  const { t } = useTranslation();
  const label = t(labelKey);
  if (href) {
    return (
      <UiButton href={href} variant={variant} size={size} icon={icon} disabled={disabled} fullWidth={fullWidth}>
        {label}
      </UiButton>
    );
  }
  return (
    <UiButton variant={variant} size={size} icon={icon} disabled={disabled} loading={loading} onClick={() => onClick?.()} type={type} fullWidth={fullWidth}>
      {label}
    </UiButton>
  );
}
