/**
 * E2E — Accesibilidad (task 16.1)
 *
 * Verifica accesibilidad WCAG 2.1 AA en las tres vistas principales usando
 * @axe-core/playwright para auditorías automatizadas:
 *
 * 1. Landing page (/) — sin violaciones A/AA (R22.10)
 * 2. Discovery page (/discovery) — sin violaciones A/AA (R22.10)
 * 3. Tour Detail page (/tours/:slug) — sin violaciones A/AA (R22.10)
 * 4. Contraste ≥4.5:1 texto / ≥3:1 grande, componentes, foco (R22.2, R22.3)
 * 5. Inputs con label/aria-label (R22.4)
 * 6. Imágenes con alt (contenido) o alt="" (decorativas) (R22.5)
 * 7. Semáforo con texto accesible, no solo color (R5.9, R22.10)
 *
 * Se interceptan las llamadas al API con respuestas mock para que las páginas
 * rendericen contenido completo durante los tests.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
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
  {
    slug: "laguna-otun",
    name: "Laguna del Otún",
    operatorName: "Risaralda Tours",
    region: "eje_cafetero",
    durationLabel: "2 días / 1 noche",
    basePriceCop: 450000,
    photoUrl: "https://example.com/otun.jpg",
    photoAlt: "Laguna del Otún rodeada de frailejones",
    coordinates: [-75.407, 4.746] as [number, number],
    difficulty: "aventurero" as const,
    ivaExemptAvailable: true,
  },
];

const MOCK_TOUR_DETAIL = {
  slug: "trek-cocora",
  name: "Trek Valle del Cocora",
  region: "eje_cafetero",
  destination: "Valle del Cocora, Quindío",
  durationDays: 1,
  durationNights: null,
  durationHours: null,
  basePriceCop: 250000,
  operatorName: "Cocora Adventures",
  difficulty: "moderado" as const,
  ivaExemptAvailable: false,
  gallery: [
    {
      url: "https://example.com/cocora-1.jpg",
      alt: "Vista panorámica del Valle del Cocora",
      decorative: false,
    },
    {
      url: "https://example.com/cocora-2.jpg",
      alt: "",
      decorative: true,
    },
  ],
  longDescriptionHtml:
    "<p>Disfruta de una caminata por el Valle del Cocora, hogar de las palmas de cera más altas del mundo.</p>",
  includes: ["Transporte", "Guía bilingüe", "Almuerzo"],
  notIncludes: ["Seguro de viaje"],
  whatToBring: ["Protector solar", "Ropa cómoda"],
  addOns: [
    {
      id: "addon-1",
      name: "Cabalgata adicional",
      shortDescription: "Recorrido a caballo por el valle",
      additionalPriceCop: 80000,
    },
  ],
  coordinates: [-75.487, 4.638] as [number, number],
};

// Future dates for availability instances (use current month + 1 to avoid past dates)
function getFutureDate(dayOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(dayOffset);
  return d.toISOString().split("T")[0];
}

const MOCK_INSTANCES = [
  {
    date: getFutureDate(5),
    available: 10,
    total: 15,
    currentPriceCop: 250000,
    isOffered: true,
  },
  {
    date: getFutureDate(10),
    available: 3,
    total: 15,
    currentPriceCop: 280000,
    isOffered: true,
  },
  {
    date: getFutureDate(15),
    available: 0,
    total: 15,
    currentPriceCop: 250000,
    isOffered: true,
  },
  {
    date: getFutureDate(20),
    available: 8,
    total: 15,
    currentPriceCop: 250000,
    isOffered: false,
  },
];

const MOCK_PAGE_DATA = {
  tour: MOCK_TOUR_DETAIL,
  instances: MOCK_INSTANCES,
  nearby: [MOCK_TOURS[1]],
};

function mockSearchResponse() {
  return {
    data: { tours: MOCK_TOURS, total: MOCK_TOURS.length },
    error: null,
    meta: { page: 1, pageSize: 12, total: MOCK_TOURS.length },
  };
}

function mockPageDataResponse() {
  return {
    data: MOCK_PAGE_DATA,
    error: null,
    meta: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intercepts all API calls the pages need, providing mock data so pages
 * render with full content for accessibility testing.
 */
async function interceptAllApis(page: import("@playwright/test").Page) {
  // Discovery search endpoint
  await page.route("**/tours/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSearchResponse()),
    });
  });

  // Tour detail page-data endpoint
  await page.route("**/tours/*/page-data**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockPageDataResponse()),
    });
  });

  // Home page-data endpoint (landing featured tours)
  await page.route("**/home/page-data**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: MOCK_TOURS,
        error: null,
        meta: null,
      }),
    });
  });

  // Generic tours list endpoint (used by getStaticPaths)
  await page.route("**/tours", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: MOCK_TOURS,
        error: null,
        meta: null,
      }),
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Accesibilidad — axe WCAG 2.1 AA (R22.2, R22.3, R22.4, R22.5, R22.10)", () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllApis(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.10: Sin violaciones A/AA en Landing
  // ─────────────────────────────────────────────────────────────────────────

  test("Landing (/) — no axe A/AA violations", async ({ page }) => {
    await page.goto("/");
    // Wait for content to render (destinations section loads async)
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.10: Sin violaciones A/AA en Discovery
  // ─────────────────────────────────────────────────────────────────────────

  test("Discovery (/discovery) — no axe A/AA violations", async ({ page }) => {
    await page.goto("/discovery");
    // Wait for catalog to load with mock data
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.10: Sin violaciones A/AA en Tour Detail
  // ─────────────────────────────────────────────────────────────────────────

  test("Tour Detail (/tours/trek-cocora) — no axe A/AA violations", async ({
    page,
  }) => {
    await page.goto("/tours/trek-cocora");
    // Wait for islands to hydrate with mock data
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.4: All form inputs have accessible labels
  // ─────────────────────────────────────────────────────────────────────────

  test("Landing — all inputs have label or aria-label (R22.4)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // axe "label" rule checks that every form element has an accessible name
    const results = await new AxeBuilder({ page })
      .withRules(["label"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("Discovery — all inputs have label or aria-label (R22.4)", async ({
    page,
  }) => {
    await page.goto("/discovery");
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withRules(["label"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.5: Content images have non-empty alt; decorative have alt=""
  // ─────────────────────────────────────────────────────────────────────────

  test("Landing — images have appropriate alt attributes (R22.5)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // axe "image-alt" rule: all img elements must have alt attribute
    const results = await new AxeBuilder({ page })
      .withRules(["image-alt"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("Discovery — images have appropriate alt attributes (R22.5)", async ({
    page,
  }) => {
    await page.goto("/discovery");
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withRules(["image-alt"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("Tour Detail — images have appropriate alt attributes (R22.5)", async ({
    page,
  }) => {
    await page.goto("/tours/trek-cocora");
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withRules(["image-alt"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R22.2, R22.3: Contrast checks (covered by axe wcag2aa tags above,
  // but explicit check for documentation)
  // ─────────────────────────────────────────────────────────────────────────

  test("Landing — color contrast ≥4.5:1 normal text, ≥3:1 large text (R22.2, R22.3)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("Discovery — color contrast meets WCAG AA (R22.2, R22.3)", async ({
    page,
  }) => {
    await page.goto("/discovery");
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("Tour Detail — color contrast meets WCAG AA (R22.2, R22.3)", async ({
    page,
  }) => {
    await page.goto("/tours/trek-cocora");
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R5.9 + R22.10: Semáforo no depende solo del color (texto accesible)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Accesibilidad — semáforo con texto accesible (R5.9, R22.10)", () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllApis(page);
  });

  test("Tour Detail calendar dates expose availability state via aria-label text, not color only", async ({
    page,
  }) => {
    await page.goto("/tours/trek-cocora");
    // Wait for calendar island to hydrate
    await page.waitForTimeout(2000);

    // Verify that calendar day buttons have aria-labels with slot information.
    // The AvailabilityCalendar component renders each date with an aria-label
    // containing the formatted date + "N cupos disponibles" (R17.8, R5.9).
    const dayButtons = page.locator(
      'button[aria-label*="cupos disponibles"]',
    );

    // There should be at least one day button with accessible text about slots
    const count = await dayButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify the first one has meaningful text (not just color)
    const firstLabel = await dayButtons.first().getAttribute("aria-label");
    expect(firstLabel).not.toBeNull();
    // Should contain a date pattern and slot count
    expect(firstLabel).toMatch(/\d+.*cupos disponibles/);
  });
});
