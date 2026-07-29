/**
 * `Card` — componente base de tarjeta de la UI Library del Portal B2C (R4.1).
 *
 * Componente funcional React con radio de borde y espaciado derivados
 * exclusivamente de los tokens del Design_System expuestos como utilidades
 * Tailwind (`rounded-xl`, `p-4`). No contiene literales hexadecimales (R1.9).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Variantes
 * ─────────────────────────────────────────────────────────────────────────
 *   • default — fondo Blanco Niebla con sombra sutil.
 *   • glass   — delega en `GlassSurface` para superficies translúcidas
 *               sobre imágenes (R4.2, R4.3).
 *
 * TypeScript strict, sin `any`.
 */
import type { JSX, ReactNode } from "react";

import { GlassSurface } from "./GlassSurface";

/** Variantes de la tarjeta base. */
export type CardVariant = "default" | "glass";

/** Props de `Card` (R4.1). */
export interface CardProps {
  /** Variante visual: `"default"` (fondo sólido) o `"glass"` (translúcida). */
  readonly variant?: CardVariant;
  /** Contenido de la tarjeta. */
  readonly children: ReactNode;
  /** Clases Tailwind adicionales (márgenes, layout externo). */
  readonly className?: string;
}

/**
 * Clases base de la tarjeta (R4.1): radio y espaciado via tokens.
 * `rounded-xl` → token de radio del Design_System.
 * `p-4`        → espaciado interno consistente.
 */
const BASE_CLASSES = "rounded-card p-4 overflow-hidden";

/** Clases para la variante default (fondo sólido). */
const DEFAULT_CLASSES = `${BASE_CLASSES} bg-surface-page shadow-card`;

/**
 * Tarjeta base de la UI Library.
 *
 * @param props `{ variant?, children, className? }`.
 * @returns Un contenedor con los tokens de marca aplicados.
 */
export function Card({
  variant = "default",
  children,
  className,
}: CardProps): JSX.Element {
  if (variant === "glass") {
    const classes = [BASE_CLASSES, className].filter(Boolean).join(" ");
    return (
      <GlassSurface overImage={true} className={classes}>
        {children}
      </GlassSurface>
    );
  }

  const classes = [DEFAULT_CLASSES, className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
