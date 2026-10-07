# @borondo/ui

Librería de UI compartida por las 3 apps web. Fuente de verdad del comportamiento: `docs/04-Tech-Design/Catalogo-Componentes-UI.md`.

```
src/
  styles/        tokens.css, global.css (@theme), fonts.css   ← Fase 2
  primitives/    Button, Input, Select, Checkbox, Radio, Chip, Tabs, Badge   ← Fase 3
  overlays/      Dialog, Popover, Toast, Banner
  feedback/      Skeleton, StatusMessage, EmptyState
  surfaces/      Card, GlassSurface
  typography/    Heading, Text
  hooks/         useFocusTrap, useDisclosure, useMediaQuery
  lib/           cx (clases), types
  index.ts       API pública (solo se importa desde aquí)
```

Reglas: sin hex (tokens semánticos), sin `style={{}}`, sin `any`, textos por i18n, área táctil ≥44 px, `prefers-reduced-motion`.
