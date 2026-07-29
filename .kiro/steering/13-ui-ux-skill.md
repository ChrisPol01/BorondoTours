---
inclusion: manual
---
# 13. UI/UX Pro Max Skill — Adaptada para BorondoTours

## Propósito
Esta skill guía la generación de interfaces UI/UX profesionales para
BorondoTours. Combina las reglas de UI/UX Pro Max con el DESIGN.md
de la marca. Activar cuando se trabaje en frontend.

## Workflow de Diseño

### Paso 1: Analizar Requerimientos
Antes de generar UI, extraer:
- Tipo de página: Landing B2C, Detalle Tour, Dashboard ERP, Checkout
- Audiencia: viajero casual, agente, operador, admin
- Contexto: mobile-first (B2C) o desktop-first (ERP)

### Paso 2: Aplicar Design System BorondoTours
Siempre consultar `docs/04-Tech-Design/DESIGN.md` y aplicar:
- Paleta: Primary `#1B6B4A`, Secondary `#2E7D9B`, Accent `#7B4FA2`
- Tipografía: Fraunces (H1/H2 italic) + Instrument Sans (UI)
- Glassmorphism: solo sobre fotografía, nunca fondos sólidos
- Border radius: 20px hero, 16px cards, 12px generales, 10px inputs

### Paso 3: Reglas de UI Profesional

#### Iconos
- Usar Lucide React (ya en el stack aprobado)
- No emojis como iconos estructurales
- Tamaño consistente: sm=16px, md=20px, lg=24px
- Stroke: 1.5px consistente

#### Interacción
- Feedback en hover/press: scale, opacity o color change (150-250ms)
- Touch targets mínimo 44x44px en mobile
- Skeleton loaders en lugar de spinners genéricos
- Transiciones: fast 150ms, base 250ms, slow 400ms

#### Contraste Light/Dark
- Texto primario: min 4.5:1 en ambos modos
- Texto secundario: min 3:1
- Glassmorphism: verificar que texto sea legible sobre blur
- Bordes visibles en ambos temas

#### Layout
- Safe areas respetadas en mobile
- Spacing rhythm: 4/8/12/16/20/24/32/48/64/80px
- Contenido max-width 1440px desktop
- Gutters: 24px desktop, 20px tablet, 16px mobile

### Paso 4: Stack BorondoTours
- React 19 + Vite + TypeScript
- Tailwind CSS 4 + Shadcn/UI
- Lucide React (iconos)
- Framer Motion (transiciones)
- GSAP ScrollTrigger (scroll animations)
- TanStack Router (routing)
- i18next (textos via t('key'))

### Checklist Pre-Entrega
- [ ] Colores solo de la paleta definida
- [ ] Fraunces solo en H1/H2
- [ ] Glass solo sobre fotos
- [ ] Contraste 4.5:1 verificado
- [ ] Touch targets >= 44px
- [ ] Textos via i18next, no hardcoded
- [ ] Responsive: mobile 375px, tablet 768px, desktop 1280px
- [ ] Dark mode funcional
- [ ] Skeleton loaders en loading states
- [ ] Sin emojis como iconos

### Anti-patterns
- No usar gradientes de color como fondo
- No mezclar border-radius arbitrarios
- No ALL CAPS excepto overline 11px
- No inventar colores fuera de la paleta
- No sombras agresivas
- No texto sobre foto sin overlay/glass
- No lenguaje comercial forzado en microcopy
