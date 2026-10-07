import type { ElementType, JSX, ReactNode } from "react";

/**
 * Props de `GlassSurface` (R4.2–R4.5).
 *
 * `overImage` es un literal `true`: a nivel de tipos obliga a que la superficie
 * glass se declare explícitamente como superpuesta a una imagen o fotografía,
 * que es su único uso permitido (R4.3). No tiene efecto en tiempo de ejecución;
 * su valor es puramente una restricción de tipo en el punto de llamada.
 */
export interface GlassSurfaceProps {
  /** Etiqueta HTML a renderizar. Por defecto `"div"`. */
  as?: keyof JSX.IntrinsicElements;
  /** Debe ser `true`: la glass surface solo se usa sobre una imagen (R4.3). */
  overImage: true;
  /** Contenido superpuesto (texto/controles) sobre la superficie translúcida. */
  children: ReactNode;
  /** Clases utilitarias adicionales (posicionamiento/espaciado del contenedor). */
  className?: string;
}

/**
 * `GlassSurface` — superficie translúcida reutilizable de la UI Library.
 *
 * El aspecto visual (translucidez + `backdrop-filter: blur`, borde de 1px con
 * opacidad ≤30%, overlay que garantiza contraste ≥4.5:1 y el fallback sólido
 * `@supports not`) vive en la clase `.glass-surface` de `styles/global.css`,
 * que referencia los tokens de marca (R4.2, R4.4, R4.5).
 *
 * @remarks
 * - `overImage` es un literal `true` que fuerza, a nivel de tipos, que la
 *   superficie se use únicamente superpuesta a una imagen (R4.3).
 * - No se renderiza texto propio: el contraste ≥4.5:1 se garantiza para el
 *   contenido claro que se coloque encima gracias al overlay oscuro opaco.
 */
export function LiquidGlassSurface({
  as,
  children,
  className,
}: GlassSurfaceProps): JSX.Element {
  const Tag: ElementType = as ?? "div";
  const classes = className ? `glass-surface ${className}` : "glass-surface";

  return <Tag className={classes} data-liquid-glass>{children}</Tag>;
}

/** Existing alias retained for current card consumers. */
export const GlassSurface = LiquidGlassSurface;
