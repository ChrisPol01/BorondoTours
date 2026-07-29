/**
 * E2E — Flujo de Tour Detail (task 15.8)
 *
 * Tests end-to-end de la vista Tour Detail que verifican:
 * 1. R15.1: Galería renderiza slider con fotos, navegación prev/next funciona
 * 2. R17.4: Click en fecha verde → selección cambia (aria-selected actualiza)
 * 3. R17.5: Click en fecha roja/gris → selección NO cambia, indicación visual
 * 4. R17.9: Seleccionar fecha → precio del CTA se actualiza
 * 5. R18.1: Sección de tours cercanos aparece con tours dentro de 50km
 * 6. R18.3: Sección cercanos oculta cuando no hay tours en 50km o falla
 *
 * Se intercepta `GET /tours/:slug/page-data` con datos mock ya que no hay
 * backend real en el entorno de test.
 */
import { test, expect } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

/** Genera una fecha futura ISO yyyy-mm-dd a N días de hoy. */
function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Tour de prueba con galería, coordenadas y add-ons. */
const MOCK_TOUR = {
  slug: "trek-cocora",
  name: "Trek Valle del Cocora",
  region: "eje_cafetero" as const,
  destination: "Salento, Quindío",
  durationDays: 1,
  durationNights: null,
  durationHours: null,
  basePriceCop: 250000,
  operatorName: "Cocora Adventures",
  difficulty: "moderado" as const,
  ivaExemptAvailable: false,
  gallery: [
    { url: "https://picsum.photos/seed/cocora1/1200/800", alt: "Valle del Cocora con palmas de cera", decorative: false },
    { url: "https://picsum.photos/seed/cocora2/1200/800", alt: "Sendero entre palmas de cera", decorative: false },
    { url: "https://picsum.photos/seed/cocora3/1200/800", alt: "", decorative: true },
  ],
  longDescriptionHtml: "<p>Un recorrido inolvidable por el valle más alto de Colombia.</p>",
  includes: ["Transporte", "Guía bilingüe"],
  notIncludes: ["Alimentación"],
  whatToBring: ["Botas de trekking", "Protector solar"],
  addOns: [
    {
      id: "addon-1",
      name: "Cabalgata adicional",
      shortDescription: "Recorre el valle a caballo",
      additionalPriceCop: 80000,
    },
  ],
  coordinates: [-75.487, 4.638] as [number, number],
};

/** Instancias con distintos estados de disponibilidad. */
const MOCK_INSTANCES = [
  // Green (≥50% disponible) — seleccionable
  {
    date: futureDate(7),
    available: 10,
    total: 20,
    currentPriceCop: 280000,
    isOffered: true,
  },
  // Yellow (1-49% disponible) — seleccionable
  {
    date: futureDate(14),
    available: 3,
    total: 20,
    currentPriceCop: 300000,
    isOffered: true,
  },
  // Red (0 disponible) — NO seleccionable
  {
    date: futureDate(21),
    available: 0,
    total: 20,
    currentPriceCop: 250000,
    isOffered: true,
  },
  // Gray (no ofertado) — NO seleccionable
  {
    date: futureDate(28),
    available: 5,
    total: 20,
    currentPriceCop: 250000,
    isOffered: false,
  },
];

/** Tours cercanos dentro de 50km del tour principal. */
const MOCK_NEARBY = [
  {
    slug: "laguna-otun",
    name: "Laguna del Otún",
    operatorName: "Risaralda Tours",
    region: "eje_cafetero" as const,
    durationLabel: "2 días / 1 noche",
    basePriceCop: 450000,
    photoUrl: "https://picsum.photos/seed/otun/400/300",
    photoAlt: "Laguna del Otún rodeada de frailejones",
    coordinates: [-75.407, 4.7] as [number, number], // ~15km away
    difficulty: "aventurero" as const,
    ivaExemptAvailable: true,
  },
  {
    slug: "termales-santa-rosa",
    name: "Termales de Santa Rosa",
    operatorName: "Termales Co",
    region: "eje_cafetero" as const,
    durationLabel: "4 horas",
    basePriceCop: 120000,
    photoUrl: "https://picsum.photos/seed/termales/400/300",
    photoAlt: "Termales naturales en el Eje Cafetero",
    coordinates: [-75.5, 4.65] as [number, number], // ~3km away
    difficulty: "familiar" as const,
    ivaExemptAvailable: false,
  },
];

/** Tours lejanos (fuera de 50km) — la sección debería ocultarse. */
const MOCK_NEARBY_FAR = [
  {
    slug: "caribe-snorkel",
    name: "Snorkel Islas del Rosario",
    operatorName: "Caribe Sub",
    region: "costa_caribe" as const,
    durationLabel: "1 día",
    basePriceCop: 350000,
    photoUrl: "https://picsum.photos/seed/caribe/400/300",
    photoAlt: "Arrecifes de coral",
    coordinates: [-75.78, 10.17] as [number, number], // >600km away
    difficulty: "familiar" as const,
    ivaExemptAvailable: false,
  },
];

function mockPageData(overrides?: {
  nearby?: typeof MOCK_NEARBY;
  instances?: typeof MOCK_INSTANCES;
}) {
  return {
    data: {
      tour: MOCK_TOUR,
      instances: overrides?.instances ?? MOCK_INSTANCES,
      nearby: overrides?.nearby ?? MOCK_NEARBY,
    },
    error: null,
    meta: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intercepta la llamada al endpoint de page-data y devuelve los datos mock.
 */
async function interceptPageData(
  page: import("@playwright/test").Page,
  data: ReturnType<typeof mockPageData> = mockPageData(),
) {
  await page.route("**/tours/trek-cocora/page-data**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Tour Detail — flujo E2E", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // R15.1: Galería renderiza slider con fotos y navegación prev/next
  // ─────────────────────────────────────────────────────────────────────────

  test("R15.1 — galería muestra slider con fotos y navega prev/next", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    // Verificar que el carousel está presente
    const gallery = page.locator('[aria-roledescription="carousel"]');
    await expect(gallery).toBeVisible();

    // Verificar que se muestra el indicador "1 / 3"
    await expect(gallery.locator("text=1 / 3")).toBeVisible();

    // Verificar que existen los thumbnails (role="tablist")
    const thumbnails = gallery.locator('[role="tablist"]');
    await expect(thumbnails).toBeVisible();

    // El primer thumbnail debe estar seleccionado (aria-selected=true)
    const firstTab = thumbnails.locator('[role="tab"]').first();
    await expect(firstTab).toHaveAttribute("aria-selected", "true");

    // Click en "Foto siguiente" → indicador debe cambiar a "2 / 3"
    const nextBtn = gallery.locator('button[aria-label="Foto siguiente"]');
    await nextBtn.click();
    await expect(gallery.locator("text=2 / 3")).toBeVisible();

    // Click en "Foto anterior" → vuelve a "1 / 3"
    const prevBtn = gallery.locator('button[aria-label="Foto anterior"]');
    await prevBtn.click();
    await expect(gallery.locator("text=1 / 3")).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R17.4: Click en fecha verde/amarilla → selección cambia
  // ─────────────────────────────────────────────────────────────────────────

  test("R17.4 — seleccionar fecha verde actualiza aria-selected", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    // Esperar a que el calendario sea visible
    const calendarGroup = page.locator(
      'div[role="group"][aria-label="Calendario de disponibilidad"]',
    );
    await expect(calendarGroup).toBeVisible();

    // Encontrar un botón de fecha con aria-selected="false" que sea seleccionable
    // (fondo verde = bg-[var(--color-avail-green)]) y no aria-disabled
    const selectableDate = calendarGroup.locator(
      'button[aria-disabled="false"][aria-selected="false"]',
    ).first();

    // Verificar que existe al menos una fecha seleccionable
    await expect(selectableDate).toBeVisible();

    // Click en la fecha verde/amarilla
    await selectableDate.click();

    // Ahora debe haber exactamente un botón con aria-selected="true" en el calendario
    const selectedDate = calendarGroup.locator(
      'button[aria-selected="true"]',
    );
    await expect(selectedDate).toHaveCount(1);
  });

  test("R17.4 — seleccionar segunda fecha verde reemplaza la anterior", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    const calendarGroup = page.locator(
      'div[role="group"][aria-label="Calendario de disponibilidad"]',
    );
    await expect(calendarGroup).toBeVisible();

    // Seleccionar la primera fecha disponible (verde o amarilla)
    const selectableDates = calendarGroup.locator(
      'button[aria-disabled="false"][aria-selected="false"]',
    );

    const firstSelectableDate = selectableDates.first();
    await firstSelectableDate.click();

    // Verificar que se seleccionó
    let selectedDates = calendarGroup.locator('button[aria-selected="true"]');
    await expect(selectedDates).toHaveCount(1);

    // Ahora seleccionar otra fecha disponible (la segunda)
    const secondSelectableDate = calendarGroup.locator(
      'button[aria-disabled="false"][aria-selected="false"]',
    ).first();

    // Si hay una segunda fecha seleccionable, hacer click
    const secondCount = await secondSelectableDate.count();
    if (secondCount > 0) {
      await secondSelectableDate.click();

      // Siempre debe haber máximo una fecha seleccionada
      selectedDates = calendarGroup.locator('button[aria-selected="true"]');
      await expect(selectedDates).toHaveCount(1);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R17.5: Click en fecha roja/gris → selección NO cambia
  // ─────────────────────────────────────────────────────────────────────────

  test("R17.5 — click en fecha roja/gris no cambia la selección", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    const calendarGroup = page.locator(
      'div[role="group"][aria-label="Calendario de disponibilidad"]',
    );
    await expect(calendarGroup).toBeVisible();

    // Primero seleccionar una fecha válida (verde/amarilla)
    const selectableDate = calendarGroup.locator(
      'button[aria-disabled="false"][aria-selected="false"]',
    ).first();
    await selectableDate.click();

    // Guardar referencia a la fecha seleccionada (aria-selected="true")
    const selectedBefore = calendarGroup.locator('button[aria-selected="true"]');
    await expect(selectedBefore).toHaveCount(1);
    const selectedLabelBefore = await selectedBefore.getAttribute("aria-label");

    // Buscar una fecha deshabilitada (roja o gris: aria-disabled="true")
    const disabledDate = calendarGroup.locator(
      'button[aria-disabled="true"]',
    ).first();
    const disabledCount = await disabledDate.count();

    if (disabledCount > 0) {
      // Click en la fecha deshabilitada
      await disabledDate.click();

      // La selección no debe haber cambiado
      const selectedAfter = calendarGroup.locator('button[aria-selected="true"]');
      await expect(selectedAfter).toHaveCount(1);
      const selectedLabelAfter = await selectedAfter.getAttribute("aria-label");
      expect(selectedLabelAfter).toBe(selectedLabelBefore);

      // Debe aparecer el mensaje de bloqueo (role="alert")
      const blockedAlert = page.locator('p[role="alert"]');
      await expect(blockedAlert).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R17.9: Seleccionar fecha con cupos actualiza precio del CTA ≤1s
  // ─────────────────────────────────────────────────────────────────────────

  test("R17.9 — seleccionar fecha actualiza el precio del CTA", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    // Capturar el precio base inicial (formateado como "Desde $250.000 COP por persona")
    const priceElement = page.locator(
      '[aria-label="Precio y reserva del tour"] p',
    ).first();
    await expect(priceElement).toBeVisible();
    const initialPrice = await priceElement.textContent();

    // Seleccionar una fecha verde (con precio distinto: 280.000)
    const calendarGroup = page.locator(
      'div[role="group"][aria-label="Calendario de disponibilidad"]',
    );
    await expect(calendarGroup).toBeVisible();

    const selectableDate = calendarGroup.locator(
      'button[aria-disabled="false"][aria-selected="false"]',
    ).first();
    await selectableDate.click();

    // Esperar que el precio se actualice (≤1s según R17.9)
    await expect(async () => {
      const currentPrice = await priceElement.textContent();
      // El precio debería haber cambiado (280.000 vs 250.000)
      expect(currentPrice).not.toBe(initialPrice);
    }).toPass({ timeout: 1000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R18.1: Tours cercanos aparecen con tours dentro de 50km
  // ─────────────────────────────────────────────────────────────────────────

  test("R18.1 — sección tours cercanos aparece con tours dentro de 50km", async ({
    page,
  }) => {
    await interceptPageData(page);
    await page.goto("/tours/trek-cocora");

    // Esperar a que la sección de tours cercanos sea visible
    const nearbySection = page.locator(
      'section[aria-label="Tours cercanos"]',
    );
    await expect(nearbySection).toBeVisible({ timeout: 5000 });

    // Verificar que contiene tour cards (al menos uno)
    const tourCards = nearbySection.locator("a"); // TourCard renders as links
    await expect(tourCards.first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // R18.3: Sección cercanos oculta si no hay tours en 50km
  // ─────────────────────────────────────────────────────────────────────────

  test("R18.3 — sección tours cercanos oculta si no hay tours en 50km", async ({
    page,
  }) => {
    // Pasar tours que están a >50km del origen
    await interceptPageData(page, mockPageData({ nearby: MOCK_NEARBY_FAR }));
    await page.goto("/tours/trek-cocora");

    // Esperar un momento para que el cómputo se ejecute
    await page.waitForTimeout(1500);

    // La sección no debería existir en el DOM
    const nearbySection = page.locator(
      'section[aria-label="Tours cercanos"]',
    );
    await expect(nearbySection).toHaveCount(0);
  });

  test("R18.3 — sección tours cercanos oculta si nearby está vacío", async ({
    page,
  }) => {
    // Pasar lista vacía de nearby
    await interceptPageData(page, mockPageData({ nearby: [] }));
    await page.goto("/tours/trek-cocora");

    // Esperar un momento para que el cómputo se ejecute
    await page.waitForTimeout(1500);

    // La sección no debería existir en el DOM
    const nearbySection = page.locator(
      'section[aria-label="Tours cercanos"]',
    );
    await expect(nearbySection).toHaveCount(0);
  });
});
