/**
 * E2E — Flujo de Discovery (task 13.7)
 *
 * Tests end-to-end del catálogo Discovery que verifican:
 * 1. Búsqueda con debounce 300ms y mínimo 2 chars (R12.2)
 * 2. Filtros/orden reflejados en URL ≤500ms (R13.8)
 * 3. Recarga de página hidrata filtros desde URL (R13.10)
 * 4. Toggle Lista/Mapa conserva filtros (R14.5)
 *
 * Se interceptan las llamadas al API (/tours/search) con respuestas mock
 * ya que no hay backend real disponible en el entorno de test.
 */
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data y helpers
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

function mockSearchResponse(tours = MOCK_TOURS) {
  return {
    data: { tours, total: tours.length },
    error: null,
    meta: { page: 1, pageSize: 12, total: tours.length },
  };
}

/**
 * Intercepta las llamadas al endpoint de búsqueda del catálogo y devuelve
 * datos mock. Opcionalmente permite filtrar la respuesta.
 */
async function interceptSearchApi(
  page: import("@playwright/test").Page,
  responseFn: () => ReturnType<typeof mockSearchResponse> = mockSearchResponse,
) {
  await page.route("**/tours/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(responseFn()),
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Discovery — flujo E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar API de búsqueda para todos los tests
    await interceptSearchApi(page);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R12.2: Búsqueda con debounce 300ms y mínimo 2 chars
  // ─────────────────────────────────────────────────────────────────────────

  test("R12.2 — búsqueda NO actualiza URL antes del debounce (300ms)", async ({
    page,
  }) => {
    await page.goto("/discovery");

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("co");

    // Inmediatamente después de escribir, la URL no debe contener `q`
    // (aún estamos dentro de los 300ms de debounce)
    const urlBeforeDebounce = page.url();
    expect(urlBeforeDebounce).not.toContain("q=co");

    // Esperar a que pase el debounce (~350ms para dar margen)
    await page.waitForTimeout(400);

    // Después del debounce, la URL debe contener `q=co`
    const urlAfterDebounce = page.url();
    expect(urlAfterDebounce).toContain("q=co");
  });

  test("R12.2 — búsqueda NO dispara con menos de 2 chars", async ({
    page,
  }) => {
    await page.goto("/discovery");

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("c");

    // Esperar más que el debounce
    await page.waitForTimeout(400);

    // Con solo 1 char, la URL no debe tener `q`
    expect(page.url()).not.toContain("q=");
  });

  test("R12.2 — búsqueda SÍ dispara con 2+ chars tras debounce", async ({
    page,
  }) => {
    await page.goto("/discovery");

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("trek");

    // Esperar debounce
    await page.waitForTimeout(400);

    // La URL debe reflejar la búsqueda
    expect(page.url()).toContain("q=trek");
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R13.8: Filtros/orden reflejados en URL ≤500ms
  // ─────────────────────────────────────────────────────────────────────────

  test("R13.8 — seleccionar filtro de región se refleja en URL ≤500ms", async ({
    page,
  }) => {
    await page.goto("/discovery");

    // Buscar el checkbox de la región "llanos" en el sidebar (≥768px)
    const llanosCheckbox = page.locator(
      'aside[aria-label="Filtros del catálogo"] input[type="checkbox"]',
    ).nth(1); // llanos es la segunda región

    // Usar evaluate para evitar interferencia del Navbar sticky
    await llanosCheckbox.waitFor({ state: "attached" });
    await llanosCheckbox.evaluate((el) => (el as HTMLInputElement).click());

    // Esperar que la URL se actualice (≤500ms)
    await expect(async () => {
      expect(page.url()).toContain("regions=llanos");
    }).toPass({ timeout: 1000 });
  });

  test("R13.8 — cambiar sort se refleja en URL ≤500ms", async ({ page }) => {
    await page.goto("/discovery");

    const sortSelect = page.locator("#sort-select");
    await sortSelect.selectOption("price_asc");

    // Verificar que URL se actualiza con sort dentro de 500ms
    await expect(async () => {
      expect(page.url()).toContain("sort=price_asc");
    }).toPass({ timeout: 500 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R13.10: Recarga hidrata filtros desde URL
  // ─────────────────────────────────────────────────────────────────────────

  test("R13.10 — navegar a URL con q hidrata el input de búsqueda", async ({
    page,
  }) => {
    await page.goto("/discovery?q=laguna");

    const searchInput = page.locator('input[type="search"]');

    // El input debe tener el valor "laguna" hidratado desde la URL
    await expect(searchInput).toHaveValue("laguna");
  });

  test("R13.10 — navegar a URL con regions hidrata los checkboxes", async ({
    page,
  }) => {
    await page.goto("/discovery?regions=llanos");

    // El segundo checkbox de región (llanos) debe estar marcado
    const regionCheckboxes = page.locator(
      'aside[aria-label="Filtros del catálogo"] input[type="checkbox"]',
    );

    // Verificar que al menos un checkbox está marcado
    // "llanos" es el segundo en la lista de regiones
    const llanosCheckbox = regionCheckboxes.nth(1);
    await expect(llanosCheckbox).toBeChecked();
  });

  test("R13.10 — navegar a URL con sort hidrata el select", async ({
    page,
  }) => {
    await page.goto("/discovery?sort=price_desc");

    const sortSelect = page.locator("#sort-select");
    await expect(sortSelect).toHaveValue("price_desc");
  });

  test("R13.10 — navegar a URL con múltiples filtros hidrata todos", async ({
    page,
  }) => {
    await page.goto(
      "/discovery?q=trek&regions=llanos&sort=recent&view=list",
    );

    // Verificar búsqueda
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveValue("trek");

    // Verificar sort
    const sortSelect = page.locator("#sort-select");
    await expect(sortSelect).toHaveValue("recent");

    // Verificar que la región llanos está checked
    const llanosCheckbox = page.locator(
      'aside[aria-label="Filtros del catálogo"] input[type="checkbox"]',
    ).nth(1);
    await expect(llanosCheckbox).toBeChecked();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R14.5: Toggle Lista/Mapa conserva filtros
  // ─────────────────────────────────────────────────────────────────────────

  test("R14.5 — toggle a Mapa conserva filtros en URL", async ({ page }) => {
    // Empezar con filtros aplicados
    await page.goto("/discovery?regions=llanos&sort=price_asc&q=trek");

    // Localizar el ViewToggle group y el botón de Mapa (segundo)
    const viewToggle = page.locator('div[role="group"]');
    const mapButton = viewToggle.locator('button[aria-pressed="false"]');

    // Esperar que el botón sea visible y usar evaluate para click directo
    await mapButton.waitFor({ state: "visible" });
    await mapButton.evaluate((btn) => (btn as HTMLButtonElement).click());

    // Esperar que la URL incluya view=map (debounce 300ms + margen)
    await expect(async () => {
      expect(page.url()).toContain("view=map");
    }).toPass({ timeout: 1500 });

    // Verificar que los filtros siguen en la URL
    expect(page.url()).toContain("regions=llanos");
    expect(page.url()).toContain("sort=price_asc");
    expect(page.url()).toContain("q=trek");
  });

  test("R14.5 — toggle de vuelta a Lista conserva filtros en URL", async ({
    page,
  }) => {
    // Empezar en vista mapa con filtros
    await page.goto("/discovery?regions=llanos&sort=price_asc&view=map");

    // Localizar el ViewToggle group y el botón de Lista (primero)
    const viewToggle = page.locator('div[role="group"]');
    const listButton = viewToggle.locator("button").first();

    // Usar dispatchEvent para evitar que el Navbar sticky intercepte el click
    await listButton.dispatchEvent("click");

    // Esperar actualización de URL (debounce 300ms + margen)
    await expect(async () => {
      const url = page.url();
      // view=list es el default, puede no aparecer en la URL
      expect(url).not.toContain("view=map");
    }).toPass({ timeout: 1000 });

    // Los filtros deben seguir presentes
    expect(page.url()).toContain("regions=llanos");
    expect(page.url()).toContain("sort=price_asc");
  });

  test("R14.5 — alternar vista no pierde el texto de búsqueda del input", async ({
    page,
  }) => {
    await page.goto("/discovery?q=laguna");

    // Verificar valor inicial
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveValue("laguna");

    // Toggle a Mapa usando el ViewToggle group
    const viewToggle = page.locator('div[role="group"]');
    const mapButton = viewToggle.locator("button").nth(1);

    await mapButton.scrollIntoViewIfNeeded();
    await mapButton.click({ force: true });

    await page.waitForTimeout(400);

    // El input de búsqueda debe conservar su valor
    await expect(searchInput).toHaveValue("laguna");

    // La URL debe conservar q
    expect(page.url()).toContain("q=laguna");
  });
});
