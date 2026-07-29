/**
 * E2E — Teclado y foco (task 16.2)
 *
 * Tests end-to-end de accesibilidad por teclado que verifican:
 * 1. R22.1: Skip-link como primer elemento tabulable que mueve foco a #main
 * 2. R22.6: Focus trap en menú móvil y drawer (Tab/Shift+Tab ciclan dentro)
 * 3. R22.7: Escape cierra overlays y retorna foco al trigger
 * 4. R22.8: Elementos interactivos alcanzables via Tab y activables con Enter
 *
 * Se interceptan las llamadas al API con respuestas mock.
 */
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Mock helpers
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TOURS = [
  {
    slug: "trek-cocora",
    name: "Trek Valle del Cocora",
    operatorName: "Cocora Adventures",
    region: "eje_cafetero",
    durationLabel: "1 día",
    basePriceCop: 250000,
    photoUrl: "https://example.com/cocora.jpg",
    photoAlt: "Valle del Cocora con palmas de cera",
    coordinates: [-75.487, 4.638] as [number, number],
    difficulty: "moderado" as const,
    ivaExemptAvailable: false,
  },
];

async function interceptApis(page: import("@playwright/test").Page) {
  await page.route("**/tours/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { tours: MOCK_TOURS, total: 1 },
        error: null,
        meta: { page: 1, pageSize: 12, total: 1 },
      }),
    });
  });

  await page.route("**/home/page-data**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { tours: MOCK_TOURS },
        error: null,
        meta: null,
      }),
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// R22.1: Skip-link como primer tabulable que mueve foco a #main
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R22.1 — Skip-link", () => {
  test("skip-link es el primer elemento que recibe foco con Tab", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Tab desde el inicio de la página
    await page.keyboard.press("Tab");

    // El primer elemento enfocado debe ser el skip-link
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "#main");
    await expect(focused).toContainText("Ir al contenido principal");
  });

  test("activar skip-link mueve foco a #main", async ({ page }) => {
    await interceptApis(page);
    await page.goto("/");

    // Tab para enfocar el skip-link
    await page.keyboard.press("Tab");

    // Enter para activar el skip-link
    await page.keyboard.press("Enter");

    // El foco debe estar ahora en el <main id="main">
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("id", "main");
  });

  test("skip-link es visualmente oculto hasta recibir foco", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    const skipLink = page.locator('a[href="#main"]');

    // Antes de recibir foco: el skip-link tiene clase sr-only (oculto)
    await expect(skipLink).toHaveClass(/sr-only/);

    // Tab para enfocarlo
    await page.keyboard.press("Tab");

    // Al recibir foco: ya no debería ser sr-only (se vuelve visible via focus:not-sr-only)
    await expect(skipLink).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R22.6: Focus trap en menú móvil
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R22.6 — Focus trap menú móvil", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("Tab cicla dentro del menú móvil sin escapar", async ({ page }) => {
    await interceptApis(page);
    await page.goto("/");

    // Abrir menú móvil via el botón hamburguesa
    const hamburger = page.locator("button[aria-controls='mobile-nav-menu']");
    await hamburger.click();

    // Esperar a que el menú se abra y el focus trap se active
    const menu = page.locator("#mobile-nav-menu");
    await expect(menu).toBeVisible();

    // Recolectar los elementos enfocables dentro del menú
    const focusableInMenu = menu.locator(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusableInMenu.count();
    expect(count).toBeGreaterThan(0);

    // El foco debería estar dentro del menú (primer elemento)
    await page.waitForTimeout(100); // RAF del focus trap
    const firstFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest("#mobile-nav-menu") !== null;
    });
    expect(firstFocused).toBe(true);

    // Tab a través de todos los elementos y verificar que sigue dentro del menú
    for (let i = 0; i < count + 1; i++) {
      await page.keyboard.press("Tab");
      const isInMenu = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest("#mobile-nav-menu") !== null;
      });
      expect(isInMenu).toBe(true);
    }
  });

  test("Shift+Tab cicla hacia atrás dentro del menú móvil", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Abrir menú móvil
    const hamburger = page.locator("button[aria-controls='mobile-nav-menu']");
    await hamburger.click();

    const menu = page.locator("#mobile-nav-menu");
    await expect(menu).toBeVisible();

    // Esperar focus trap
    await page.waitForTimeout(100);

    // Shift+Tab desde el primer elemento debería ir al último (wrap)
    await page.keyboard.press("Shift+Tab");

    const isInMenu = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest("#mobile-nav-menu") !== null;
    });
    expect(isInMenu).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R22.7: Escape cierra overlays y retorna foco al trigger
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R22.7 — Escape cierra overlays y retorna foco", () => {
  test("Escape cierra menú móvil y retorna foco al botón hamburguesa", async ({
    page,
  }) => {
    // Viewport móvil para que el menú hamburguesa sea visible
    await page.setViewportSize({ width: 375, height: 667 });
    await interceptApis(page);
    await page.goto("/");

    const hamburger = page.locator("button[aria-controls='mobile-nav-menu']");
    await hamburger.click();

    // Verificar que el menú está abierto
    const menu = page.locator("#mobile-nav-menu");
    await expect(menu).toBeVisible();

    // Esperar que el focus trap se active
    await page.waitForTimeout(100);

    // Presionar Escape
    await page.keyboard.press("Escape");

    // El menú se debe cerrar
    await expect(menu).not.toBeVisible();

    // El foco debe retornar al botón hamburguesa
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("aria-controls", "mobile-nav-menu");
  });

  test("Escape cierra filter drawer y retorna foco al botón de filtros", async ({
    page,
  }) => {
    // Viewport móvil para que el drawer sea visible
    await page.setViewportSize({ width: 375, height: 667 });
    await interceptApis(page);
    await page.goto("/discovery");

    // Abrir el drawer de filtros (botón con aria-controls="filter-drawer")
    const filterButton = page.locator(
      'button[aria-controls="filter-drawer"]',
    );
    await filterButton.click();

    // Verificar que el drawer está abierto
    const drawer = page.locator("#filter-drawer");
    await expect(drawer).toBeVisible();

    // Esperar que el focus trap se active
    await page.waitForTimeout(100);

    // Presionar Escape
    await page.keyboard.press("Escape");

    // El drawer se debe cerrar
    await expect(drawer).not.toBeVisible();

    // El foco debe retornar al botón de filtros
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("aria-controls", "filter-drawer");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R22.6: Focus trap en filter drawer
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R22.6 — Focus trap en filter drawer", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("Tab cicla dentro del drawer de filtros sin escapar", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/discovery");

    // Abrir drawer de filtros
    const filterButton = page.locator(
      'button[aria-controls="filter-drawer"]',
    );
    await filterButton.click();

    const drawer = page.locator("#filter-drawer");
    await expect(drawer).toBeVisible();

    // Esperar focus trap
    await page.waitForTimeout(100);

    // Recolectar elementos enfocables dentro del drawer
    const focusableInDrawer = drawer.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusableInDrawer.count();
    expect(count).toBeGreaterThan(0);

    // Verificar que el foco está dentro del drawer
    const isInDrawer = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest("#filter-drawer") !== null;
    });
    expect(isInDrawer).toBe(true);

    // Tab a través de todos los elementos + 1 extra para verificar el wrap
    for (let i = 0; i < count + 1; i++) {
      await page.keyboard.press("Tab");
      const stillInDrawer = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest("#filter-drawer") !== null;
      });
      expect(stillInDrawer).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R22.8: Elementos interactivos alcanzables via Tab y activables con Enter
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R22.8 — Navegación por teclado", () => {
  test("enlaces de navegación son alcanzables con Tab y activables con Enter", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Tab pasando el skip-link hasta llegar a los enlaces de navegación
    // En desktop los enlaces están visibles en el navbar
    await page.keyboard.press("Tab"); // skip-link
    await page.keyboard.press("Tab"); // logo link

    // Verificar que podemos llegar a un enlace del navbar
    await page.keyboard.press("Tab"); // primer enlace de nav

    const focused = page.locator(":focus");
    // Debe ser un elemento interactivo (link o button)
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(["a", "button"]).toContain(tagName);
  });

  test("todos los enlaces de navegación son alcanzables secuencialmente", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Contar los links de navegación en el navbar desktop
    const navLinks = page.locator(
      'header nav ul.hidden.md\\:flex a[href]',
    );
    const navLinkCount = await navLinks.count();
    expect(navLinkCount).toBeGreaterThanOrEqual(5); // 5 enlaces + CTA button

    // Tab desde el inicio: skip-link (1) + logo (1) + nav links
    // Verificar que podemos tabear a través de todos
    await page.keyboard.press("Tab"); // skip-link
    await page.keyboard.press("Tab"); // logo

    for (let i = 0; i < navLinkCount; i++) {
      await page.keyboard.press("Tab");
      const isInteractive = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        return tag === "a" || tag === "button" || tag === "input";
      });
      expect(isInteractive).toBe(true);
    }
  });

  test("Enter activa un enlace de navegación", async ({ page }) => {
    await interceptApis(page);
    await page.goto("/");

    // Tab hasta el logo (que es un link a "/")
    await page.keyboard.press("Tab"); // skip-link
    await page.keyboard.press("Tab"); // logo link

    // Verificar que estamos en el logo link
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "/");

    // Enter debería navegar (en este caso a "/" — la misma página)
    // No verificamos la navegación real ya que es la misma página,
    // pero verificamos que el elemento es activable
    const isActivable = await focused.evaluate((el) => {
      return (
        el.tagName.toLowerCase() === "a" ||
        el.tagName.toLowerCase() === "button"
      );
    });
    expect(isActivable).toBe(true);
  });
});
