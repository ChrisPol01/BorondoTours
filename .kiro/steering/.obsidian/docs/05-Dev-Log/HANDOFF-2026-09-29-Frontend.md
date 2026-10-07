# Handoff — Cierre de diseño B2C y arranque del frontend (2026-09-29)

> Documento para retomar el trabajo desde otra cuenta. Leer completo antes de empezar.

## Estado de Figma (terminado)
- **Tableros:** Colorido `132:33618`, Claro `132:33619`, Oscuro `132:33620`. Página Design System `7:2`.
- **Auditoría de contraste:** `btvis.audit` da **0** en los 3 tableros.
- **Auth Gate (opción B):** los estados "Iniciar sesión", "Crear cuenta" y "Código OTP" aparecen sobre el **Checkout paso 3 (Pago)**. Son 18 pantallas: 3 estados × escritorio y móvil × 3 temas.
- **Sets de componentes:**

  | Componente | Id |
  |---|---|
  | Button | `165:104505` |
  | Input | `165:104587` |
  | Chip | `165:104621` |
  | Tab | `165:104635` |
  | Checkbox | `165:104661` |
  | Radio | `165:104681` |
  | TourCard | `166:104691` |
  | Rail derecho | `165:104120` |
  | FAB | `38:1933` |

- **Aceptado por el usuario:** unos 600 controles de las pantallas son copias sueltas y los textos no están vinculados a estilos. **El componente de código es la fuente de verdad.**
- **Cómo usar el plugin:** ver `.kiro/steering/13-figma-bridge-safety.md`.
  - Trabajos pesados con `async: true`.
  - Contar fallas de la auditoría con `r.n`.
  - Si el plugin se traba, reiniciarlo con Ctrl+Alt+P.

## Decisiones tomadas (ya en specs)
| Tema | Decisión | Dónde |
|---|---|---|
| Auth Gate | Aparece al pulsar "Pagar"; el checkout se recorre sin cuenta y la selección se guarda en sessionStorage | Spec-A RF-A10, Spec-F RF-F08 |
| Saldo por cancelación | Crédito interno, no se reembolsa al medio de pago | Spec-D RF-D12 |
| Emails transaccionales | Los envía el backend (SES, plantillas en código). El frontend tiene la vista de cada evento y el aviso (toast y bandeja) | Spec-D RF-D14 |
| Bandeja de notificaciones | Tope de 50 notificaciones o 90 días. Transaccionales sin publicidad; comerciales con opt-in y Ley 2300 | Spec-D RF-D14 |
| Estándar de componentes | Catálogo único para B2C, ERP, B2B y Mobile | `04-Tech-Design/Catalogo-Componentes-UI.md` |
| Medidas y grilla | Botones 32/40/48 (48 en móvil); chips 32/40; inputs 48; tarjetas con radio 20/24; contenido con sesión en x=328; margen móvil 16 | `04-Tech-Design/DESIGN.md` §19 |

## Siguiente trabajo, en orden
1. **Crear `packages/ui` (`@borondo/ui`).**
   - Mover desde `apps/web`:
     - `src/styles/tokens.css`, `global.css` y `fonts.css`.
     - De `src/components/ui/`: `Button`, `AccessibleDialog`, `useFocusTrap`, `GlassSurface`, `Card`, `Skeleton`, `StatusMessage`, `SafeHtml`, `Image` y `ThemeSelector`, con sus tests.
   - Ajustar en `apps/web`:
     - El validador `integrations/validate-design-tokens.mjs` debe leer los tokens del paquete.
     - `lib/designTokenManifest.test.ts` lee `../styles/tokens.css`; hay que cambiar esa ruta.
     - Agregar `"@borondo/ui": "workspace:*"` en `apps/web/package.json`.
   - Verificar con `pnpm --filter @borondo/web build`, `test:run` y `lint`.
2. **Completar la API de `Button` según el catálogo.** Hoy solo tiene las variantes `primary`, `cta` y `secondary`. Faltan:
   - Variantes `ghost` y `danger`.
   - Tamaños `sm`, `md` y `lg`.
   - Props `icon`, `loading` y `href`.

   Después, crear `Input`, `Chip`, `Tabs`, `Checkbox`, `Radio`, `Toast`, `Banner` y `Badge`.
3. **Construir las vistas B2C que faltan:**
   - Auth Gate al pagar (paso 3 de `CheckoutStep3.astro`).
   - Bandeja de notificaciones y toasts.
   - Mis reservas con sus pestañas (RF-D12).
   - Detalle de reserva con QR.
   - Vistas de pago rechazado, enlace vencido y cupo agotado (RF-C16).
4. **Desplegar primero en Dev:**
   - Dev: S3 `borondotours-web-dev` + CloudFront `E3BJK4DCIP1V66`.
   - Prod, después de validar: `borondotours-web-prod` + `E1DRI1BOOOHRAX`.
   - Perfil AWS: `AdministratorAccess-787565887675`.
5. **Comparar contra Figma** pantalla por pantalla.

## Pendientes menores
- El usuario debe indicar en qué pantalla está el comentario 5 ("alinear con foto").
- Enlazar en el prototipo de Figma el botón "Pagar" con el Auth Gate.
- Validar RF-D14 con asesoría legal.
- Borrar el módulo de prueba `btmr2`.
- Borondo Coins sigue en pausa (Spec-E): no mostrar Coins, niveles ni promos de Coins en el B2C.
