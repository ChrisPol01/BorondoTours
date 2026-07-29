/**
 * E2E — Flujo end-to-end y fallbacks (task 16.3)
 *
 * Tests end-to-end que verifican:
 * 1. R9.4: Landing → SearchWidget → Discovery con query params correctos
 * 2. R14.7: Fallback de Mapbox a lista cuando no carga en 3s, preservando filtros
 * 3. R21.5: Placeholder de imagen con alt en fallo de carga sin bloquear render
 *
 * Se interceptan las llamadas al API y recursos externos con respuestas mock.
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

function mockSearchResponse() {
  return {
    data: { tours: MOCK_TOURS, total: MOCK_TOURS.length },
    error: null,
    meta: { page: 1, pageSize: 12, total: MOCK_TOURS.length },
  };
}

/**
 * Intercepta todas las APIs necesarias para que las páginas rendericen
 * contenido completo durante los tests.
 */
async function interceptApis(page: import("@playwright/test").Page) {
  await page.route("**/tours/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSearchResponse()),
    });
  });

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
}

// ─────────────────────────────────────────────────────────────────────────────
// R9.4: Landing → SearchWidget → Discovery con query params correctos
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R9.4 — Landing → SearchWidget → Discovery", () => {
  test("completar SearchWidget y enviar navega a /discovery con query params", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Rellenar campo Destino
    const destinationInput = page.locator("#search-destination");
    await expect(destinationInput).toBeVisible();
    await destinationInput.fill("Eje Cafetero");

    // Rellenar campo Fechas con una fecha futura.
    // Usamos evaluate para establecer el valor directamente y disparar el evento
    // de cambio, ya que Playwright fill() con inputs date puede no disparar
    // el onChange del componente React controlado.
    const dateInput = page.locator("#search-date");
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    futureDate.setDate(15);
    const futureDateStr = futureDate.toISOString().split("T")[0];
    await dateInput.evaluate((el, val) => {
      const input = el as HTMLInputElement;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(input, val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, futureDateStr);

    // Cambiar campo Viajeros (default es 1, poner 3)
    const travelersInput = page.locator("#search-travelers");
    await travelersInput.fill("3");

    // Click en el botón "Buscar aventura"
    const submitBtn = page.locator('button:has-text("Buscar aventura")');
    await submitBtn.click();

    // Verificar que la URL cambió a /discovery con los query params correctos
    await expect(page).toHaveURL(/\/discovery\?/, { timeout: 10000 });
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe("Eje Cafetero");
    expect(url.searchParams.get("date")).toBe(futureDateStr);
    expect(url.searchParams.get("travelers")).toBe("3");
  });

  test("SearchWidget navega a /discovery con solo destino (sin fecha ni viajeros extra)", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/");

    // Rellenar solo el campo Destino
    const destinationInput = page.locator("#search-destination");
    await destinationInput.fill("Costa Caribe");

    // Click en "Buscar aventura"
    const submitBtn = page.locator('button:has-text("Buscar aventura")');
    await submitBtn.click();

    // Verificar navegación con q param
    await expect(page).toHaveURL(/\/discovery\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe("Costa Caribe");
    // date y travelers no deberían estar en la URL (date=null, travelers=1 default)
    expect(url.searchParams.has("date")).toBe(false);
    expect(url.searchParams.has("travelers")).toBe(false);
  });

  test("Discovery hidrata el texto de búsqueda desde el query param q", async ({
    page,
  }) => {
    await interceptApis(page);
    await page.goto("/discovery?q=Eje%20Cafetero");

    // El input de búsqueda en Discovery debe tener el valor hidratado
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveValue("Eje Cafetero");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R14.7: Fallback de Mapbox a lista si no carga en 3s
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R14.7 — Mapbox fallback a lista", () => {
  test("bloquear Mapbox JS muestra fallback y permite cambiar a lista preservando filtros", async ({
    page,
  }) => {
    await interceptApis(page);

    // Interceptar y bloquear TODAS las peticiones de Mapbox (JS y CSS)
    // Esto simula un timeout/fallo en la carga de Mapbox (R14.7)
    await page.route("**/mapbox-gl**", async (route) => {
      await route.abort("connectionfailed");
    });
    await page.route("**/api.mapbox.com/**", async (route) => {
      await route.abort("connectionfailed");
    });

    // Navegar a Discovery con view=map y filtros aplicados
    await page.goto("/discovery?view=map&regions=eje_cafetero&sort=price_asc");

    // Esperar a que aparezca el mensaje de fallback (el timeout interno es 3s)
    const fallbackMessage = page.locator('text="No fue posible cargar el mapa."');
    await expect(fallbackMessage).toBeVisible({ timeout: 5000 });

    // Verificar que el rol="alert" está presente (indica error al usuario)
    const alertContainer = page.locator('[role="alert"]');
    await expect(alertContainer).toBeVisible();

    // Click en "Ver en lista" para cambiar a vista de lista
    const listButton = page.locator('button:has-text("Ver en lista")');
    await expect(listButton).toBeVisible();
    await listButton.click();

    // Verificar que la vista cambió (la URL ya no tiene view=map)
    await expect(async () => {
      expect(page.url()).not.toContain("view=map");
    }).toPass({ timeout: 1500 });

    // Verificar que los filtros se preservaron en la URL
    expect(page.url()).toContain("regions=eje_cafetero");
    expect(page.url()).toContain("sort=price_asc");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R21.5: Placeholder de imagen con alt en fallo de carga sin bloquear render
// ─────────────────────────────────────────────────────────────────────────────

test.describe("R21.5 — Image placeholder en fallo de carga", () => {
  test("imagen que falla muestra placeholder con alt text sin bloquear el render", async ({
    page,
  }) => {
    await interceptApis(page);

    // Interceptar todas las peticiones de imágenes para que fallen
    await page.route("**/*.jpg", async (route) => {
      await route.fulfill({ status: 404, body: "" });
    });
    await page.route("**/*.png", async (route) => {
      await route.fulfill({ status: 404, body: "" });
    });
    await page.route("**/*.webp", async (route) => {
      await route.fulfill({ status: 404, body: "" });
    });

    // Navegar a Discovery donde se muestran TourCards con imágenes
    await page.goto("/discovery");

    // Esperar a que la página renderice completamente
    await page.waitForTimeout(1500);

    // Verificar que la página no se bloqueó (el contenido principal renderizó)
    // El grid de tours o el contenedor principal debe ser visible
    const pageContent = page.locator("main");
    await expect(pageContent).toBeVisible();

    // Verificar que aparecen placeholders con el texto alt de las imágenes.
    // El componente Image de la app muestra un div con role="img" y aria-label
    // cuando la imagen falla (R21.5).
    const placeholders = page.locator('[role="img"][aria-label]');
    await expect(placeholders.first()).toBeVisible({ timeout: 3000 });

    // Verificar que el placeholder tiene un aria-label con contenido (alt text)
    const firstAlt = await placeholders.first().getAttribute("aria-label");
    expect(firstAlt).not.toBeNull();
    expect(firstAlt!.length).toBeGreaterThan(0);
  });

  test("múltiples imágenes fallidas no bloquean el render de la página", async ({
    page,
  }) => {
    await interceptApis(page);

    // Bloquear todas las imágenes
    await page.route(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/, async (route) => {
      await route.fulfill({ status: 500, body: "" });
    });

    await page.goto("/discovery");

    // La página debe renderizar sin colgarse
    await page.waitForTimeout(2000);

    // El main content debe estar visible (la página no se bloqueó)
    await expect(page.locator("main")).toBeVisible();

    // Verificar que se renderizan los nombres de los tours (contenido textual)
    // a pesar de que las imágenes fallaron
    await expect(
      page.locator("text=Trek Valle del Cocora"),
    ).toBeVisible();
  });
});
