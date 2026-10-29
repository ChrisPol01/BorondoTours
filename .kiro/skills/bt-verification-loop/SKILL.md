---
name: bt-verification-loop
description: >
  Bucle de verificación de la fábrica BorondoTours: toolcheck primero, un pnpm --filter por script
  (sin encadenar), test:run en web, available:false cuando falta config ESLint o tests,
  --passWithNoTests solo si no se agregaron tests. Resultado en BuildReport.commands. Para todos los developers.
---

# bt-verification-loop

Antes de dar un trabajo por terminado, verificar con los comandos del steering 16 en sintaxis
PowerShell. Un comando por invocación del shell: sin `;`, `&&`, `||`, `|`, `$(…)` ni comillas
invertidas (están negados por los permisos y el shell los compara mal).

## Cuándo se activa

- Al cerrar un modo `build`, `fix`, `zod` o `gate`.
- Antes de publicar un `BuildReport` o `QualityReport`.

## Orden del bucle

### 1. toolcheck del paquete

```powershell
node .kiro/factory/scripts/factory.mjs toolcheck --path <paquete>
```

Devuelve si hay config ESLint, scripts de test y (en `packages/db`) `drizzle.config`. Si falta, el
comando correspondiente no se ejecuta y se registra `available:false` con el motivo (`"sin config ESLint (#27)"`).

### 2. Lint (si `ESLINT_CONFIG=yes`)

```powershell
pnpm --filter <pkg> run lint
```

Hoy solo `apps/web` tiene config ESLint. En los demás paquetes: `available:false`.

### 3. Typecheck

```powershell
pnpm --filter <pkg> run typecheck
```

En `@borondo/web` el typecheck es `astro check`.

### 4. Tests

```powershell
pnpm --filter <pkg> run test
```

- En `@borondo/web` usar `run test:run` (nunca `run test`, que abre vitest en modo watch y cuelga).
- Si el agente no agregó tests y el paquete no tiene: `pnpm --filter <pkg> exec vitest run --passWithNoTests` con `summary: "sin tests en el paquete"`.
- En código de finanzas, RBAC o máquinas de estado, que falten tests es un hallazgo `high` (y `BuildReport.status: partial`), no un `available:false`.

### 5. Cobertura (solo si `COVERAGE=yes`)

```powershell
pnpm --filter <pkg> exec vitest run --coverage
```

Si no, `coverage.available:false` (#28). Umbral objetivo ≥ 80%.

### 6. E2E (solo frontend/qa, cuando aplica)

```powershell
node .kiro/factory/scripts/factory.mjs run-e2e --feature <id>
```

Lanzar con timeout de herramienta de 1 800 000 ms (construye la web y corre Playwright).

## Registro del resultado

Cada comando ejecutado va a `BuildReport.commands` (o `QualityReport`) con: `command`, `available`,
`exitCode`, `summary`. Un comando no disponible se registra con `available:false` y su motivo, no se omite.

## Reglas

- Un `pnpm --filter <pkg> run <script>` por invocación; nunca encadenar scripts.
- No usar `pnpm lint` ni `pnpm test` de la raíz: fallan en la línea base (servicios sin config ESLint, #27).
- Si el build o el typecheck fallan, detenerse y corregir antes de seguir.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/verification-loop` (y la idea de `.kiro/hooks/quality-gate`),
MIT, Copyright (c) 2026 Affaan Mustafa. Ver `.kiro/factory/THIRD_PARTY.md`. Reescrito para los
comandos del steering 16 de BorondoTours (pnpm + Turborepo, vitest, `toolcheck`, PowerShell).
