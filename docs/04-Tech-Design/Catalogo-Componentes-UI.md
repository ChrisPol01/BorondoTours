---
tags: [frontend, design-system, componentes]
updated: 2026-09-29
---

# Catálogo de componentes UI — estándar para las 4 apps

> Fuente de verdad del **comportamiento** y la **API** de los componentes compartidos por B2C (`apps/web`), ERP (`apps/erp`), B2B (`apps/b2b`) y, en lo que aplique, Mobile.
> Fuente visual: Figma, página **Design System** (`7:2`). Valores: `apps/web/src/styles/tokens.css` (tokens semánticos, 3 temas).
> Si un componente de una pantalla de Figma difiere del set, **gana el set / este catálogo** (decisión 2026-09-29).

## Plan de paquete
- Paquete `packages/ui` (`@borondo/ui`): tokens (`tokens.css`, `global.css` con `@theme`), fuentes, componentes y hooks de este catálogo. Las 3 apps web lo consumen; ninguna app redefine un componente de la lista.
- Migración: se mueve desde `apps/web/src/components/ui` y `apps/web/src/styles`, manteniendo los tests. El validador `validate-design-tokens` pasa a leer los tokens del paquete.
- Reglas: sin hex en componentes (solo tokens semánticos), textos por i18n, `aria-*` incluidos, área táctil ≥44 px, respetar `prefers-reduced-motion`.

## Componentes base (Figma set → código)

| Componente | Set Figma | Props de código | Estados obligatorios |
|---|---|---|---|
| `Button` | `165:104505` | `variant: primary \| cta \| secondary \| ghost \| danger`, `size: sm(32) \| md(40) \| lg(48)`, `icon?`, `iconPosition?`, `loading?`, `disabled?`, `fullWidth?`, `href?` (renderiza `<a>`) | default, hover, focus-visible, active, disabled (`aria-disabled`), loading (`aria-busy`) |
| `Input` | `165:104587` | `label`, `type`, `hint?`, `error?`, `icon?`, `required?`, `disabled?` | default, focus, filled, error (`aria-describedby`), disabled |
| `Select` / `Combobox` | (Input) | igual que Input + `options` | + abierto, opción activa |
| `Chip` | `165:104621` | `selected?`, `icon?`, `removable?` | default, hover, selected (`aria-pressed`), disabled |
| `Tabs` | `165:104635` | `items`, `value`, `onChange`, `counts?` | default, hover, activa (`aria-selected`), foco con flechas |
| `Checkbox` | `165:104661` | `label`, `checked`, `indeterminate?`, `required?` | off, on, indeterminado, foco, disabled |
| `Radio` / `RadioGroup` | `165:104681` | `options`, `value` | off, on, foco, disabled |
| `Badge` | — | `tone: info \| success \| warning \| danger \| neutral`, `size: 16 \| 24` | siempre texto o icono además del color |
| `Dialog` (`AccessibleDialog`) | patrón §8f | `open`, `onClose`, `ariaLabel`, `variant: dialog \| drawer \| sheet` | focus trap, Escape, retorno de foco, velo 30 % + blur 20 |
| `Popover` / `Menu` | patrón §8f | `anchor`, `items` | sin velo; en móvil pasa a hoja inferior |
| `Toast` | patrón §8f | `tone`, `message`, `action?` | `role="status"` (info) o `role="alert"` (error) |
| `Banner` (aviso fijo) | patrón §8f | `tone`, `message`, `action?` | urgencias; nunca un modal |
| `StatusMessage` / `EmptyState` | Estados globales | `icon`, `title`, `description`, `action?` | vacío, error recuperable, bloqueado |
| `Skeleton` | Estados globales | `shape` | `aria-busy="true"` en el contenedor |
| `Card` / `GlassSurface` | btlg | `variant: solid \| glass \| glass-strong \| glass-light` | radio 20 (24 si ≥400×400) |
| `Avatar`, `Rating` (estrellas en Dorado), `Price` (formato COP), `Stepper`, `Pagination` (cursor), `DataTable` (ERP/B2B), `SafeHtml`, `Image` | — | — | — |

## Componentes de layout
- `PublicNavbar` (sin sesión, 3 cápsulas de vidrio), `AppSidebar` (con sesión, 280 px, fijo al viewport), `MobileTabBar`, `AccountMenu`, `NotificationsInbox`, `SupportPanel`, `Colophon`.
- ERP y B2B reutilizan `AppSidebar` con otra navegación por rol (RBAC, Stack-Tecnologico).

## Componentes de dominio (B2C, reutilizables en ERP/B2B)
`TourCard` (`166:104691`, Default/Hover; tarjeta estándar única con foto a sangre + panel de vidrio, estados Disponible/Quedan pocos/Agotado y variante de carga esqueleto; ver DESIGN §6.3), `AvailabilityCalendar` (semáforo), `PaxSelector`, `BookingCard`, `BookingDetailPanel`, `VoucherQR`, `PaymentMethodList` (con etiqueta de costo), `AuthGate` (opción B, al pagar), `NotificationItem`.

## Medidas y grilla
Ver `DESIGN.md` §19.
