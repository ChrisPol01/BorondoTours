import { expect, test, type Page } from '@playwright/test'

/**
 * Pruebas de preservación (spec b2c-glass-theme-ui-fixes, tarea 2, Property 8 del design).
 *
 * Registran el comportamiento del código SIN arreglar para entradas donde isBugCondition es
 * falso. Deben PASAR antes del arreglo y seguir pasando después (tarea 4.10):
 *  - Auth demo: login, sidebar con sesión, logout y Auth Gate al pulsar "Pagar" (Req. 3.1)
 *  - Chrome fijo tras scroll: navbar, rail y FAB `position: fixed` + `.bt-nav-scrolled` (Req. 3.7)
 *  - Temas Colorido, Claro, Oscuro y Sistema aplican `data-theme` y tokens (Req. 3.8)
 *  - Teclado: Tab con foco visible; Escape cierra menús y FAB y devuelve el foco (Req. 3.10, 3.11)
 *  - i18n: cambiar de idioma traduce los textos (Req. 3.5)
 */

const DEMO = { email: 'demo@borondotours.com', password: 'Borondo2026' }
const THEME_KEY = 'borondo.theme'

test.use({ viewport: { width: 1440, height: 900 } })
test.setTimeout(90_000)

/** Abre una vista y espera a que el runtime de Figma haya montado el chrome (sin esperas fijas). */
async function open(page: Page, path: string, ready = '.bt-nav-row, .bt-sidebar-fixed, .bt-auth-dialog'): Promise<void> {
  await page.goto(path, { waitUntil: 'load' })
  await page.locator('.fig-stage').first().waitFor({ state: 'attached', timeout: 30_000 })
  await page.locator(ready).first().waitFor({ state: 'attached', timeout: 30_000 })
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('bt-preserve-init')) {
        localStorage.clear()
        sessionStorage.clear()
        sessionStorage.setItem('bt-preserve-init', '1')
      }
    } catch {
      /* sin almacenamiento */
    }
  })
}

/** Token CSS resuelto en <html> (el tema vive en data-theme del documento). */
async function token(page: Page, name: string): Promise<string> {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name)
}

const position = (page: Page, selector: string): Promise<string> =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).position)

test.describe('Preservation · auth demo (Req. 3.1)', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('login con la cuenta demo → sidebar visible; cerrar sesión vuelve al inicio', async ({ page }) => {
    await open(page, '/iniciar-sesion', '.bt-auth-dialog')
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Correo electrónico').fill(DEMO.email)
    await dialog.locator('input[name="password"]').fill(DEMO.password)
    await dialog.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
    // Con varios workers el dev server tarda más en servir /mis-reservas: margen amplio, sin esperas fijas.
    await page.waitForURL('**/mis-reservas', { timeout: 60_000 })
    await open(page, '/mis-reservas', '.bt-sidebar-fixed')

    const sidebar = page.locator('.bt-sidebar-fixed')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Ver perfil')).toBeVisible()
    expect(await page.evaluate(() => Boolean(localStorage.getItem('borondo.demo.session') ?? sessionStorage.getItem('borondo.demo.session')))).toBe(true)

    // "Cerrar sesión" vive en el menú de cuenta (estado /estados/perfil-menu del diseño).
    await open(page, '/estados/perfil-menu', '[data-bt-signout]')
    const signOut = page.locator('[data-bt-signout]').first()
    await expect(signOut).toBeAttached()
    await signOut.evaluate((el) => (el as HTMLElement).click())
    await page.waitForURL((url) => url.pathname === '/', { timeout: 30_000 })
    expect(await page.evaluate(() => localStorage.getItem('borondo.demo.session') ?? sessionStorage.getItem('borondo.demo.session'))).toBeNull()
  })

  test('sin sesión, una ruta privada redirige al login', async ({ page }) => {
    await page.goto('/mis-reservas', { waitUntil: 'load' })
    await page.waitForURL(/\/iniciar-sesion\?next=%2Fmis-reservas/, { timeout: 30_000 })
  })

  test('Auth Gate: pulsar "Pagar" sin sesión abre el login con contexto de pago', async ({ page }) => {
    await open(page, '/checkout/pago', 'a[href="/checkout/procesando"]')
    const pay = page.locator('a[href="/checkout/procesando"]').first()
    await pay.evaluate((el) => (el as HTMLElement).click())
    await page.waitForURL(/\/iniciar-sesion\?next=%2Fcheckout%2Fprocesando/, { timeout: 30_000 })
    await page.locator('.bt-auth-dialog').waitFor({ timeout: 30_000 })
    await expect(page.locator('#bt-auth-title')).toHaveText('Inicia sesión para pagar')
  })
})

test.describe('Preservation · chrome fijo tras scroll (Req. 3.7)', () => {
  for (const path of ['/', '/explorar']) {
    test(`${path}: navbar, rail y FAB fijos; .bt-nav-scrolled al bajar`, async ({ page }) => {
      await open(page, path, '.bt-nav-fixed')
      await page.locator('.bt-rail, .bt-rail-host').first().waitFor({ state: 'attached', timeout: 30_000 })
      await page.locator('.bt-fab-fixed, .bt-fab').first().waitFor({ state: 'attached', timeout: 30_000 })

      const nav = page.locator('.bt-nav-fixed').first()
      await expect(nav).not.toHaveClass(/bt-nav-scrolled/)
      await page.mouse.wheel(0, 1200)
      await expect(nav).toHaveClass(/bt-nav-scrolled/)

      expect(await position(page, '.bt-nav-fixed')).toBe('fixed')
      expect(await position(page, '.bt-rail, .bt-rail-host')).toBe('fixed')
      expect(await position(page, '.bt-fab-fixed, .bt-fab')).toBe('fixed')
      await expect(nav).toBeInViewport()

      await page.evaluate(() => window.scrollTo(0, 0))
      await expect(nav).not.toHaveClass(/bt-nav-scrolled/)
    })
  }

  test('el colofón visible marca <html> con .bt-colophon-visible (el FAB sube)', async ({ page }) => {
    await open(page, '/', '.bt-nav-fixed')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(page.locator('html')).toHaveClass(/bt-colophon-visible/)
  })
})

test.describe('Preservation · temas (Req. 3.8)', () => {
  const TOKENS = ['--semantic-surface-page', '--semantic-text-primary', '--semantic-action-primary', '--semantic-focus'] as const

  async function read(page: Page): Promise<{ attr: string | null; values: string[] }> {
    return {
      attr: await page.evaluate(() => document.documentElement.getAttribute('data-theme')),
      values: await Promise.all(TOKENS.map((t) => token(page, t))),
    }
  }

  async function withTheme(page: Page, theme: string): Promise<{ attr: string | null; values: string[] }> {
    await page.addInitScript(
      ([key, t]) => {
        try {
          if (t === 'colorido') localStorage.removeItem(key)
          else localStorage.setItem(key, t)
        } catch {
          /* sin almacenamiento */
        }
      },
      [THEME_KEY, theme] as const,
    )
    await open(page, '/', '.bt-nav-fixed')
    return read(page)
  }

  test('Colorido, Claro y Oscuro aplican data-theme y tokens distintos', async ({ browser }) => {
    const out: Record<string, { attr: string | null; values: string[] }> = {}
    for (const theme of ['colorido', 'claro', 'oscuro']) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      out[theme] = await withTheme(await ctx.newPage(), theme)
      await ctx.close()
    }
    expect(out.colorido.attr).toBeNull()
    expect(out.claro.attr).toBe('claro')
    expect(out.oscuro.attr).toBe('oscuro')
    for (const r of Object.values(out)) expect(r.values.every((v) => v.length > 0)).toBe(true)
    // El fondo de página cambia entre los tres temas.
    const surfaces = new Set(Object.values(out).map((r) => r.values[0]))
    expect(surfaces.size).toBe(3)
  })

  test('Sistema sigue a prefers-color-scheme (claro ↔ oscuro)', async ({ browser }) => {
    const result: Record<string, { attr: string | null; values: string[] }> = {}
    for (const [name, scheme, theme] of [
      ['sistema-light', 'light', 'sistema'],
      ['sistema-dark', 'dark', 'sistema'],
      ['claro', 'light', 'claro'],
      ['oscuro', 'dark', 'oscuro'],
    ] as const) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme })
      result[name] = await withTheme(await ctx.newPage(), theme)
      await ctx.close()
    }
    expect(result['sistema-light'].attr).toBe('sistema')
    expect(result['sistema-dark'].attr).toBe('sistema')
    expect(result['sistema-light'].values[0]).toBe(result.claro.values[0])
    expect(result['sistema-dark'].values[0]).toBe(result.oscuro.values[0])
  })

  test('el menú de tema cambia data-theme y lo guarda', async ({ page }) => {
    await clearStorage(page)
    await open(page, '/', '.bt-theme-btn')
    const btn = page.locator('.bt-theme-btn')
    await btn.click()
    const menu = page.locator('#bt-menu-theme')
    await expect(menu).toBeVisible()
    await menu.locator('[data-theme-option="oscuro"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'oscuro')
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('oscuro')
    await expect(btn).toBeFocused()
    // Se recarga antes de reabrir: el temporizador de respaldo de hideAnimated (450 ms) puede
    // cerrar un menú reabierto de inmediato. Además comprueba que el tema guardado persiste.
    await open(page, '/', '.bt-theme-btn')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'oscuro')
    await btn.click()
    await expect(menu).toBeVisible()
    await menu.locator('[data-theme-option="colorido"]').click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
  })
})

test.describe('Preservation · teclado y diálogos (Req. 3.10, 3.11)', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('Tab produce foco visible en los controles de la navbar', async ({ page }) => {
    await open(page, '/', '.bt-nav-fixed')
    const checks: { tag: string; focusVisible: boolean; ring: boolean }[] = []
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab')
      checks.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return { tag: 'BODY', focusVisible: false, ring: false }
          const cs = getComputedStyle(el)
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'
          return { tag: el.tagName, focusVisible: el.matches(':focus-visible'), ring }
        }),
      )
    }
    const focused = checks.filter((c) => c.tag !== 'BODY')
    expect(focused.length).toBeGreaterThan(0)
    for (const c of focused) {
      expect(c.focusVisible).toBe(true)
      expect(c.ring).toBe(true)
    }
  })

  test('Escape cierra el menú de idioma y devuelve el foco al disparador', async ({ page }) => {
    await open(page, '/', 'button[aria-controls="bt-menu-lang"]')
    const trigger = page.locator('button[aria-controls="bt-menu-lang"]')
    const menu = page.locator('#bt-menu-lang')
    await trigger.focus()
    await page.keyboard.press('ArrowDown')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('Escape cierra el asistente del FAB y devuelve el foco al FAB', async ({ page }) => {
    await open(page, '/', '.bt-fab-fixed, .bt-fab')
    const fab = page.locator('.bt-fab-fixed, .bt-fab').first()
    await fab.focus()
    await page.keyboard.press('Enter')
    const dialog = page.locator('.bt-overlay:not([hidden]) [role="dialog"]').first()
    await expect(dialog).toBeVisible()
    await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(fab).toBeFocused()
  })
})

test.describe('Preservation · i18n (Req. 3.5)', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page)
  })

  test('cambiar a inglés traduce la navbar y se recuerda al recargar', async ({ page }) => {
    await open(page, '/', 'button[aria-controls="bt-menu-lang"]')
    const about = page.locator('.bt-nav-row a[href="/nosotros"]').first()
    await expect(about).toContainText('Nosotros')
    await page.locator('button[aria-controls="bt-menu-lang"]').click()
    await page.locator('#bt-menu-lang [data-lang="en"]').click()
    await expect(about).toContainText('About us')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    expect(await page.evaluate(() => localStorage.getItem('borondo.lang'))).toBe('en')

    await open(page, '/', 'button[aria-controls="bt-menu-lang"]')
    await expect(page.locator('.bt-nav-row a[href="/nosotros"]').first()).toContainText('About us')

    await page.locator('button[aria-controls="bt-menu-lang"]').click()
    await page.locator('#bt-menu-lang [data-lang="es"]').click()
    await expect(page.locator('.bt-nav-row a[href="/nosotros"]').first()).toContainText('Nosotros')
  })
})
