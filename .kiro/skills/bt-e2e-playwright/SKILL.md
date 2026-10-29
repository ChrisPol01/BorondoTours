---
name: bt-e2e-playwright
description: >
  Pruebas E2E con Playwright para apps/web de BorondoTours: Page Object Model, un test por caso
  borde con @EC-xxx en el título, @axe-core/playwright para reglas con verification: axe, lanzamiento
  vía factory.mjs run-e2e (reporter json, retries, grep @EC-), manejo de flaky y presupuesto LCP.
  Para los roles qa-e2e y frontend.
---

# bt-e2e-playwright

Pruebas de extremo a extremo de la web B2C con Playwright, que ya está en el stack
(`@playwright/test` y `@axe-core/playwright`). No se agregan librerías nuevas. Comandos en
PowerShell, uno por invocación del shell.

## Cuándo se activa

- En el modo `gate` de qa-e2e: escribir las specs de los casos borde con `testLevel: e2e` y correrlas.
- En el modo `build`/`fix` de frontend: ejecutar la suite para comprobar un flujo tocado.

## Dónde viven las pruebas

- Specs en `apps/web/e2e/` (dentro del alcance de la capa `ui`).
- Config en `apps/web/playwright.config.ts` (reporter `list` en local, `github` en CI).
- El resultado JSON queda en `apps/web/test-results/factory-<feature>.json` (ignorado por git).

## Page Object Model

Un objeto por página o flujo; los selectores por `data-testid`, nunca por texto visible (cambia con
i18n). Esperar condiciones concretas, nunca `waitForTimeout`.

```typescript
import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly payButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payButton = page.locator('[data-testid="checkout-pay"]');
  }

  async goto(tourId: string) {
    await this.page.goto(`/checkout/${tourId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async pay() {
    await this.payButton.click();
    await this.page.waitForResponse((r) => r.url().includes('/api/v1/bookings') && r.ok());
  }
}
```

## Un test por caso borde

Cada EC con `testLevel: e2e` del `EdgeCases.yml` tiene un test con `@EC-xxx` en el título, para que
`--grep @EC-` lo seleccione y el agente copie los ids que pasan a `edgeCasesCovered`.

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('Checkout Split Fare', () => {
  test('paga el saldo con cupo disponible @EC-C06b-01', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto('tour-demo');
    await checkout.pay();
    await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
  });

  test('bloquea el pago sin cupo @EC-C06b-02', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto('tour-sin-cupo');
    await expect(page.locator('[data-testid="no-availability"]')).toBeVisible();
  });
});
```

## Reglas de accesibilidad (verification: axe)

Las reglas de `a11y_rules.json` con `verification: axe` se comprueban con `@axe-core/playwright`
sobre la página real. Las que no son automatizables quedan como revisión manual en el reporte.

```typescript
test('sin violaciones de accesibilidad en checkout @EC-C06b-a11y', async ({ page }) => {
  await page.goto('/checkout/tour-demo');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
```

## Lanzar la suite

No se invoca Playwright a mano con comandos encadenados (`;` está negado y Kiro compara mal el
encadenado). Se usa el comando de la fábrica, que lanza Playwright sin shell con
`--reporter=json --retries=2 --grep @EC-` y fija `PLAYWRIGHT_JSON_OUTPUT_NAME` absoluto:

```powershell
node .kiro/factory/scripts/factory.mjs run-e2e --feature <feature-id>
```

Lanzar con un timeout de herramienta explícito de **1 800 000 ms (30 min)**: construye la web y corre
la suite, y puede superar el timeout por defecto del shell. El comando imprime `EC_PASSED` (ids que
pasan) y `EC_FLAKY` (ids inestables); el agente copia el primero a `edgeCasesCovered` y el segundo a
`flaky[]`.

## Cuando no hay casos e2e

Si ningún EC tiene `testLevel: e2e` (lo indica `status` con `applicable:false`), **no** se lanza
Playwright: se registra `tools[].available:false` con `summary: "sin EC e2e"` y se publica el
`quality-report:qa` sin correr la suite. Así se evita construir la web y un `--grep @EC-` sin
coincidencias.

## Flaky

Un test que solo pasa en un reintento va a `flaky[]` y es un hallazgo `medium` (deuda, no bloquea).
No se usa `test.fixme` para esconder un flaky sin registrarlo: primero se busca la causa (condición
de carrera, espera arbitraria, animación) y se corrige la espera.

```typescript
// Mal: espera arbitraria
await page.waitForTimeout(3000);
// Bien: espera una condición concreta
await page.waitForResponse((r) => r.url().includes('/api/v1/availability'));
```

## Presupuesto de performance

Si la feature tiene un NFR de performance, medir LCP con `PerformanceObserver` dentro de un test y
compararlo con el presupuesto declarado; un LCP por encima es un hallazgo.

## Reglas

- Un test por EC e2e, con `@EC-xxx` en el título; selectores por `data-testid`.
- Textos verificados por rol semántico o `data-testid`, no por copy (cambia con i18n).
- Nunca datos reales de tarjeta ni PII en fixtures; usar datos de ejemplo.
- No encadenar comandos; lanzar siempre vía `factory.mjs run-e2e`.
- El JSON de resultados no se versiona (está en `test-results/`).

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/e2e-testing`, MIT, Copyright (c) 2026 Affaan Mustafa. Ver
`.kiro/factory/THIRD_PARTY.md`. Reescrito para `apps/web` de BorondoTours (Playwright + axe-core ya
en el stack, Page Object Model, convención `@EC-xxx`, lanzamiento vía `factory.mjs run-e2e` y
PowerShell).
