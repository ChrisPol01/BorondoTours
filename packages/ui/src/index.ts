/**
 * @borondo/ui — librería de UI compartida por B2C (apps/web), ERP (apps/erp) y B2B (apps/b2b).
 * Fuente de verdad del comportamiento: docs/04-Tech-Design/Catalogo-Componentes-UI.md.
 * Regla: ninguna app redefine un componente que viva aquí; los textos llegan ya traducidos.
 */
export { cx, type ClassValue } from "./lib/cx";

// Primitivas
export { Button, buttonClasses, type ButtonProps, type ButtonSize, type ButtonVariant } from "./primitives/Button";
export { Input, type InputProps } from "./primitives/Input";
export { Checkbox, type CheckboxProps } from "./primitives/Checkbox";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./primitives/RadioGroup";
export { Chip, chipClasses, type ChipProps } from "./primitives/Chip";
export { Tabs, type TabItem, type TabsProps } from "./primitives/Tabs";
export { Badge, type BadgeProps, type BadgeTone } from "./primitives/Badge";

// Tipografía
export { Eyebrow, Heading, Text, type HeadingProps, type HeadingSize, type TextProps, type TextSize, type TextTone } from "./typography/Typography";

// Overlays
export { AccessibleDialog, type AccessibleDialogProps, type AccessibleDialogVariant, type DrawerEdge } from "./overlays/AccessibleDialog";
export { Banner, Toast, ToastRegion, type BannerProps, type NoticeAction, type NoticeTone, type ToastProps } from "./overlays/Toast";

// Feedback
export { Skeleton, toCssSize, type SkeletonProps, type SkeletonRadius } from "./feedback/Skeleton";
export { Spinner, type SpinnerProps } from "./feedback/Spinner";
export { StatusMessage, type StatusMessageProps, type StatusMessageTone } from "./feedback/StatusMessage";

// Superficies
export { GlassSurface, LiquidGlassSurface, type GlassSurfaceProps } from "./surfaces/GlassSurface";
export { Card, type CardProps, type CardVariant } from "./surfaces/Card";

// Hooks
export { getFocusableElements, useFocusTrap, type UseFocusTrapOptions } from "./hooks/useFocusTrap";
