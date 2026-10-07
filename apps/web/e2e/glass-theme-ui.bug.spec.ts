import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Prueba exploratoria de la condición del bug (spec b2c-glass-theme-ui-fixes, tarea 1).
 *
 * Codifica el comportamiento ESPERADO (Properties 1–7 del design) para los casos a–k de
 * isBugCondition(X, T). Sobre el código sin arreglar DEBE FALLAR: cada fallo es un
 * contraejemplo que confirma una hipótesis del design (§Hypothesized Root Cause).
 * Tras el arreglo (tarea 4.9) se re-ejecuta esta MISMA prueba y debe pasar.
 *
 * Cada caso guarda sus mediciones en playwright-report/glass-bug-report/ para documentar
 * los contraejemplos (exploration-results.md).
 */

type ThemeName = 'colorido' | 'claro' | 'oscuro'
const THEMES: readonly ThemeName[] = ['colorido', 'claro', 'oscuro']
const TOUR_HREF = /^\/tour\?tour=[^&]+$/
// Fuera de test-results/ (Playwright lo vacía en cada corrida); playwright-report/ está en .gitignore.
const REPORT_DIR = join(process.cwd(), 'playwright-report', 'glass-bug-report')

test.use({ viewport: { width: 1440, height: 900 } })
test.setTimeout(90_000)

function report(info: TestInfo, theme: ThemeName, kase: string, data: unknown): void {
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(join(REPORT_DIR, `${kase}-${theme}.json`), JSON.stringify(data, null, 2))
  void info.attach(`${kase}-${theme}`, { body: JSON.stringify(data, null, 2), contentType: 'application/json' })
}

async function applyTheme(page: Page, theme: ThemeName): Promise<void> {
  await page.addInitScript((t) => {
    try {
      if (t === 'colorido') window.localStorage.removeItem('borondo.theme')
      else window.localStorage.setItem('borondo.theme', t)
    } catch {
      /* sin almacenamiento */
    }
  }, theme)
}

/** Abre una vista y espera a que el runtime de Figma haya terminado de montar el chrome. */
async function open(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'load' })
  await page.locator('.fig-stage').first().waitFor({ state: 'attached', timeout: 30_000 })
  await page.waitForTimeout(800)
}

/** Resuelve un token CSS a su color computado (rgb/rgba) con un elemento sonda. */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((tk) => {
    const probe = document.createElement('span')
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    probe.style.color = `var(${tk})`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, token)
}

/** Rects del rail de redes y de las pestañas laterales; marca las que se intersectan. Corre en el navegador. */
function measureLane(): { rail: number[] | null; railCls: string | null; tabs: { sel: string; rect: number[] | null; intersects: boolean }[] } {
  const rail = document.querySelector<HTMLElement>('.bt-rail, .bt-rail-host')
  const r = rail?.getBoundingClientRect()
  const tabs = ['a.p0_13', 'a.p0_17', 'a.p0_18'].map((sel) => {
    const t = document.querySelector<HTMLElement>(sel)?.getBoundingClientRect()
    const hit = Boolean(r && t && r.left < t.right && t.left < r.right && r.top < t.bottom && t.top < r.bottom)
    return { sel, rect: t ? [t.left, t.top, t.right, t.bottom].map(Math.round) : null, intersects: hit }
  })
  return { rail: r ? [r.left, r.top, r.right, r.bottom].map(Math.round) : null, railCls: rail?.className ?? null, tabs }
}

for (const theme of THEMES) {
  test.describe(`Bug condition · tema ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await applyTheme(page, theme)
    })

    // Hip. 1 — casos a, b: TourCard de /explorar sin vidrio genérico .bt-drop.
    test('a/b · TourCard de /explorar no lleva .bt-drop ni backdrop-filter: none', async ({ page }, info) => {
      await open(page, '/explorar')
      const card = page.locator('a[href^="/tour?tour="]').first()
      await card.waitFor({ timeout: 30_000 })
      const data = await card.evaluate((el) => {
        const glassy = [el, ...el.querySelectorAll<HTMLElement>('*')].filter(
          (n) => n.classList.contains('bt-drop') || n.classList.contains('bt-drop-strong'),
        )
        return {
          dataTheme: document.documentElement.getAttribute('data-theme'),
          dropCount: glassy.length,
          dropClasses: glassy.slice(0, 4).map((n) => n.className),
          backdrop: glassy.slice(0, 4).map((n) => getComputedStyle(n).backdropFilter),
          border: glassy.slice(0, 4).map((n) => getComputedStyle(n).border),
        }
      })
      report(info, theme, 'a-b-tourcard', data)
      expect(data.dropCount, 'TourCard marcada con .bt-drop por initGlass').toBe(0)
      expect(data.backdrop.every((b) => b !== 'none')).toBe(true)
    })

    // Hip. 2 — caso c: navbar del Home igual a /explorar, sin fondo sólido detrás de las cápsulas.
    test('c · navbar del Home sin capa sólida, igual a /explorar', async ({ page }, info) => {
      const measure = async (): Promise<{ solidLayers: { cls: string; bg: string; w: number }[]; firstEmpty: string | null; firstEmptyBg: string | null; capsules: string[] }> =>
        page.evaluate(() => {
          const row = document.querySelector<HTMLElement>('.bt-nav-row')
          const host = row?.closest<HTMLElement>('.bt-nav-fixed') ?? row?.parentElement ?? null
          const solidLayers: { cls: string; bg: string; w: number }[] = []
          if (host) {
            for (const el of [host, ...host.querySelectorAll<HTMLElement>('*')]) {
              if (el.closest('.bt-nav-capsule') || el.closest('.bt-menu')) continue
              const cs = getComputedStyle(el)
              const w = el.getBoundingClientRect().width
              const transparent = cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent'
              if (w >= 900 && (!transparent || cs.backgroundImage !== 'none')) {
                solidLayers.push({ cls: el.className, bg: `${cs.backgroundColor} ${cs.backgroundImage.slice(0, 60)}`, w: Math.round(w) })
              }
            }
          }
          const empty = row ? [...row.querySelectorAll<HTMLElement>('div')].find((d) => d.childElementCount === 0) ?? null : null
          // Relleno propio de cada cápsula (el contenedor del vidrio, no la capa .bt-nav-glass).
          const capsules = row ? [...row.querySelectorAll<HTMLElement>('.bt-nav-capsule')].map((c) => {
            const own = c.tagName === 'A' ? (c.firstElementChild as HTMLElement | null) ?? c : c
            return getComputedStyle(own).backgroundColor
          }) : []
          return { solidLayers, firstEmpty: empty?.className ?? null, firstEmptyBg: empty ? getComputedStyle(empty).backgroundColor : null, capsules }
        })
      await open(page, '/')
      const home = await measure()
      await open(page, '/explorar')
      const explorar = await measure()
      report(info, theme, 'c-navbar', { home, explorar })
      expect.soft(home.solidLayers, 'capa sólida detrás de las cápsulas en el Home').toEqual([])
      expect.soft(home.firstEmptyBg).toBe(explorar.firstEmptyBg)
      expect(home.capsules, 'relleno de las cápsulas del Home ≠ /explorar').toEqual(explorar.capsules)
    })

    // Hip. 3 — caso d: indicador sin recorte; vuelve a "Explorar" al salir.
    test('d · indicador del navbar no recorta cápsulas y vuelve a Explorar', async ({ page }, info) => {
      await open(page, '/explorar')
      const blog = page.locator('.bt-nav-links > a[href="/blog"]').first()
      await blog.hover()
      await page.waitForTimeout(400)
      const hovered = await page.evaluate(() => {
        const links = document.querySelector<HTMLElement>('.bt-nav-links')
        const chain: { cls: string; overflow: string }[] = []
        let el: HTMLElement | null = links
        while (el && !el.classList.contains('bt-nav-row')) {
          const cs = getComputedStyle(el)
          chain.push({ cls: el.className, overflow: `${cs.overflowX}/${cs.overflowY}` })
          el = el.parentElement
        }
        const explorar = links?.querySelector<HTMLElement>('a[href="/explorar"] > div:empty') ?? null
        const ecs = explorar ? getComputedStyle(explorar) : null
        return {
          chain,
          explorarInnerBorder: ecs ? `${ecs.borderTopWidth} ${ecs.borderTopStyle}` : null,
          explorarInnerOutline: ecs ? `${ecs.outlineWidth} ${ecs.outlineStyle}` : null,
          indicated: links?.querySelector('a.is-indicated')?.textContent?.trim() ?? null,
        }
      })
      await page.mouse.move(700, 600)
      await page.waitForTimeout(400)
      const afterLeave = await page.evaluate(() => document.querySelector('.bt-nav-links a.is-indicated')?.textContent?.trim() ?? null)
      report(info, theme, 'd-indicator', { hovered, afterLeave })
      expect.soft(hovered.indicated).toBe('Blog')
      expect.soft(afterLeave, 'la píldora vuelve a Explorar').toBe('Explorar')
      expect.soft(hovered.chain.filter((c) => c.overflow !== 'visible/visible'), 'cápsula con overflow que recorta').toEqual([])
      expect(hovered.explorarInnerBorder === null || hovered.explorarInnerBorder.startsWith('0px') || hovered.explorarInnerBorder.endsWith('none'), `borde residual bajo la píldora: ${hovered.explorarInnerBorder}`).toBe(true)
    })

    // Hip. 4 — caso e: chips superiores completos y ≥ 44 px.
    test('e · chips de filtro superiores completos y con área ≥ 44 px', async ({ page }, info) => {
      await open(page, '/explorar')
      await page.locator('.bt-chip').first().waitFor({ timeout: 30_000 })
      const data = await page.evaluate(() => {
        const todas = [...document.querySelectorAll<HTMLElement>('.bt-chip')].find((c) => c.textContent?.trim() === 'Todas')
        const row = todas?.parentElement ?? null
        const chips = row ? [...row.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.classList.contains('bt-chip')) : []
        const rcs = row ? getComputedStyle(row) : null
        return {
          rowOverflowY: rcs?.overflowY ?? null,
          rowHeight: row?.getBoundingClientRect().height ?? null,
          chips: chips.map((c) => ({
            text: c.textContent?.trim(),
            h: Math.round(c.getBoundingClientRect().height * 10) / 10,
            scrollH: c.scrollHeight,
            clientH: c.clientHeight,
            overflow: getComputedStyle(c).overflowY,
            drop: c.classList.contains('bt-drop'),
          })),
        }
      })
      report(info, theme, 'e-chips', data)
      expect(data.chips.length, 'fila de chips encontrada').toBeGreaterThan(0)
      expect.soft(data.chips.filter((c) => c.scrollH > c.clientH), 'chip con contenido recortado').toEqual([])
      expect.soft(data.rowOverflowY === 'visible' || data.rowOverflowY === 'auto' && (data.rowHeight ?? 0) >= 44, `fila de chips recorta en vertical: ${data.rowOverflowY}`).toBe(true)
      expect(data.chips.filter((c) => c.h < 44), 'chip con alto < 44 px').toEqual([])
    })

    // Hip. 5 — caso f: unión hero → p0_50 sin borde duro.
    test('f · unión hero → p0_50 con degradado o máscara', async ({ page }, info) => {
      await open(page, '/')
      const data = await page.evaluate(() => {
        const seam = document.querySelector<HTMLElement>('.p0_50')
        const hero = document.querySelector<HTMLElement>('.p0_1')
        const read = (el: HTMLElement | null, pseudo?: string): Record<string, string> | null => {
          if (!el) return null
          const cs = getComputedStyle(el, pseudo)
          return { mask: cs.maskImage || cs.getPropertyValue('-webkit-mask-image'), bgImage: cs.backgroundImage.slice(0, 80), bg: cs.backgroundColor }
        }
        return {
          seamMarked: Boolean(document.querySelector('[data-bt-seam]')),
          p0_50: read(seam),
          p0_50Before: read(seam, '::before'),
          hero: read(hero),
        }
      })
      report(info, theme, 'f-seam', data)
      const hasGradient = (r: Record<string, string> | null): boolean => Boolean(r && (/gradient/.test(r.mask ?? '') || /gradient/.test(r.bgImage ?? '')))
      expect(data.seamMarked || hasGradient(data.p0_50) || hasGradient(data.p0_50Before) || /gradient/.test(data.hero?.mask ?? ''), 'unión hero → p0_50 sin máscara ni degradado').toBe(true)
    })

    // Hip. 6 y 7 — casos g, h: carril derecho (rail vs pestañas) y pestañas de marca.
    test('g · rail de redes no se superpone a las pestañas laterales (1440×900, 1280×720, 1440×720)', async ({ page }, info) => {
      const byViewport: Record<string, unknown> = {}
      const hits: string[] = []
      // 1440×720: escritorio con poca altura útil (barras del navegador); Property 4 exige
      // no intersección para todo viewport de escritorio.
      for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1440, height: 720 }]) {
        await page.setViewportSize(vp)
        await open(page, '/')
        // Las pestañas desplegadas (hover/foco) también deben quedar libres del rail.
        for (const state of ['reposo', 'hover'] as const) {
          if (state === 'hover') await page.locator('a.p0_18').first().hover({ force: true })
          await page.waitForTimeout(400)
          const data = await page.evaluate(measureLane)
          byViewport[`${vp.width}x${vp.height}:${state}`] = data
          for (const t of data.tabs) if (t.intersects) hits.push(`${vp.width}x${vp.height}:${state}:${t.sel}`)
          expect.soft(data.rail, 'rail encontrado').not.toBeNull()
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 })
      report(info, theme, 'g-rail-overlap', byViewport)
      expect(hits, 'rail ∩ pestaña ≠ ∅').toEqual([])
    })

    test('h · pestañas laterales con color de marca, sin rotar y sin .bt-drop', async ({ page }, info) => {
      await open(page, '/')
      const expected: Record<string, string> = {
        'a.p0_13': await tokenColor(page, '--semantic-action-cta'),
        'a.p0_17': await tokenColor(page, '--semantic-status-danger'),
        'a.p0_18': await tokenColor(page, '--semantic-focus'),
      }
      const onAction = await tokenColor(page, '--semantic-text-on-action')
      const tabs = await page.evaluate((sels) => sels.map((sel) => {
        const el = document.querySelector<HTMLElement>(sel)
        if (!el) return { sel, found: false }
        const cs = getComputedStyle(el)
        const m = cs.transform
        const parts = m.startsWith('matrix(') ? m.slice(7, -1).split(',').map(Number) : [1, 0, 0, 1]
        const angle = Math.round((Math.atan2(parts[1] ?? 0, parts[0] ?? 1) * 180) / Math.PI)
        const painted = [el, ...el.querySelectorAll<HTMLElement>('div')].map((n) => getComputedStyle(n).backgroundColor).filter((c) => c !== 'rgba(0, 0, 0, 0)')
        const text = [...el.querySelectorAll<HTMLElement>('span')].map((s) => getComputedStyle(s).color)
        return { sel, found: true, drop: el.classList.contains('bt-drop') || Boolean(el.querySelector('.bt-drop')), angle, rotate: cs.rotate, writingMode: cs.writingMode, bg: cs.backgroundColor, painted: painted.slice(0, 3), text: text.slice(0, 3) }
      }), Object.keys(expected))
      report(info, theme, 'h-side-tabs', { expected, onAction, tabs })
      for (const tab of tabs) {
        expect.soft(tab.found, `${tab.sel} existe`).toBe(true)
        if (!('angle' in tab)) continue
        expect.soft(tab.drop, `${tab.sel} con .bt-drop`).toBe(false)
        expect.soft(tab.angle, `${tab.sel} rotada`).toBe(0)
        expect.soft(tab.writingMode).toBe('horizontal-tb')
        expect.soft(tab.bg, `${tab.sel} fondo de marca`).toBe(expected[tab.sel])
        for (const c of tab.text ?? []) expect.soft(c, `${tab.sel} texto on-action`).toBe(onAction)
      }
      expect(test.info().errors.length, 'contraejemplos en pestañas laterales').toBe(0)
    })

    test('h · rail de redes en cápsula de vidrio con Instagram, Facebook y TikTok oficiales', async ({ page }, info) => {
      await open(page, '/')
      const facebook = await tokenColor(page, '--bt-social-facebook')
      const data = await page.evaluate(() => {
        const rail = document.querySelector<HTMLElement>('.bt-rail, .bt-rail-host')
        const links = rail ? [...rail.querySelectorAll<HTMLAnchorElement>('a')] : []
        return {
          railCls: rail?.className ?? null,
          glassStd: Boolean(rail?.classList.contains('bt-glass-std') || rail?.querySelector('.bt-glass-std')),
          links: links.map((a) => {
            const r = a.getBoundingClientRect()
            const svg = a.querySelector('svg')
            return {
              label: a.getAttribute('aria-label'),
              href: a.getAttribute('href'),
              w: Math.round(r.width), h: Math.round(r.height),
              gradient: Boolean(svg?.querySelector('linearGradient, radialGradient')) || /url\(#/.test(svg?.innerHTML ?? ''),
              svgFills: svg ? [...svg.querySelectorAll('*')].map((n) => getComputedStyle(n as Element).fill).filter((f) => f !== 'none').slice(0, 6) : [],
              svgStroke: svg ? getComputedStyle(svg).stroke : null,
              bg: getComputedStyle(a).backgroundColor,
              drop: a.classList.contains('bt-drop'),
            }
          }),
        }
      })
      report(info, theme, 'h-social-rail', { facebookToken: facebook, ...data })
      const labels = data.links.map((l) => l.label ?? '')
      expect.soft(data.links.length, 'exactamente 3 redes').toBe(3)
      expect.soft(labels.some((l) => /\bX\b|Twitter/.test(l)), 'X presente en el rail').toBe(false)
      expect.soft(data.glassStd, 'rail dentro de .bt-glass-std').toBe(true)
      const by = (name: string) => data.links.find((l) => (l.label ?? '').startsWith(name))
      expect.soft(by('Instagram')?.href).toContain('instagram.com/borondotours')
      expect.soft(by('Facebook')?.href).toContain('facebook.com/borondotours')
      expect.soft(by('TikTok')?.href).toContain('tiktok.com/@borondotours')
      expect.soft(by('Instagram')?.gradient, 'Instagram con degradado oficial').toBe(true)
      expect.soft(Boolean(facebook) && facebook !== 'rgba(0, 0, 0, 0)' && (by('Facebook')?.svgFills.includes('rgb(24, 119, 242)') || by('Facebook')?.bg === 'rgb(24, 119, 242)'), 'Facebook #1877F2').toBe(true)
      const tk = by('TikTok')?.svgFills ?? []
      expect.soft(tk.includes('rgb(37, 244, 238)') && tk.includes('rgb(254, 44, 85)'), 'TikTok con #25F4EE y #FE2C55').toBe(true)
      for (const l of data.links) expect.soft(l.w >= 44 && l.h >= 44, `${l.label} área ${l.w}×${l.h} < 44`).toBe(true)
      expect(test.info().errors.length, 'contraejemplos en rail de redes').toBe(0)
    })

    // Hip. 10 — caso k: estados estándar de la TourCard.
    test('k · estados de tarjeta: foco, skeleton, movimiento reducido y Agotado', async ({ page }, info) => {
      await open(page, '/explorar')
      const card = page.locator('a[href^="/tour?tour="]').first()
      await card.waitFor({ timeout: 30_000 })
      const ring = await tokenColor(page, '--semantic-focus')
      await page.keyboard.press('Tab')
      await card.focus()
      const focus = await card.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { focusVisible: el.matches(':focus-visible'), outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`, boxShadow: cs.boxShadow.slice(0, 80) }
      })
      const soldout = await page.evaluate(() => {
        const cards = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/tour?tour="]')]
        const sold = cards.filter((c) => c.classList.contains('bt-card--soldout'))
        return {
          total: cards.length,
          soldCount: sold.length,
          sold: sold.slice(0, 2).map((c) => ({ href: c.getAttribute('href'), label: c.textContent?.includes('Agotado') ?? false, icon: Boolean(c.querySelector('svg')), reserve: Boolean(c.querySelector('.bt-reserve-pill')) })),
        }
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.reload({ waitUntil: 'load' })
      await page.waitForTimeout(800)
      const motionCard = page.locator('a[href^="/tour?tour="]').first()
      await motionCard.hover()
      const motion = await motionCard.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { transition: `${cs.transitionProperty} ${cs.transitionDuration}`, transform: cs.transform }
      })
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await open(page, '/estados/explorar-cargando')
      const loading = await page.evaluate(() => ({
        busy: document.querySelectorAll('[aria-busy="true"]').length,
        skeleton: document.querySelectorAll('.bt-card--loading').length,
      }))
      report(info, theme, 'k-card-states', { ring, focus, soldout, motion, loading })
      expect.soft(focus.outline.startsWith('2px') && focus.outline.includes(ring.replace(/\)$/, '')), `anillo de foco: ${focus.outline}`).toBe(true)
      expect.soft(loading.busy, 'contenedor con aria-busy="true" en carga').toBeGreaterThan(0)
      expect.soft(loading.skeleton, 'skeleton .bt-card--loading').toBeGreaterThan(0)
      expect.soft(/0s/.test(motion.transition) || motion.transition.startsWith('none') || motion.transition.startsWith('all 0s'), `transición con movimiento reducido: ${motion.transition}`).toBe(true)
      expect.soft(motion.transform === 'none', `elevación con movimiento reducido: ${motion.transform}`).toBe(true)
      expect.soft(soldout.soldCount, 'tour demo agotado con .bt-card--soldout').toBeGreaterThan(0)
      for (const s of soldout.sold) {
        expect.soft(s.label && s.icon && !s.reserve, 'Agotado con etiqueta e icono y sin Reservar').toBe(true)
        expect.soft(s.href ?? '').toMatch(TOUR_HREF)
      }
      expect(test.info().errors.length, 'contraejemplos en estados de tarjeta').toBe(0)
    })

    // Hip. 8 — caso i: la vitrina es un carrusel horizontal de tarjetas estándar del mismo tamaño.
    test('i · modal Promociones muestra tarjetas estándar iguales en una sola fila', async ({ page }, info) => {
      await open(page, '/')
      await page.locator('a.p0_13').first().click({ force: true })
      const dialog = page.locator('#bt-promos')
      await dialog.waitFor({ state: 'visible', timeout: 10_000 })
      await page.waitForTimeout(600)
      const data = await dialog.evaluate((root) => {
        const cards = [...root.querySelectorAll<HTMLElement>('a.bt-vcard')].filter((c) => c.getBoundingClientRect().width > 0)
        const visible = cards.filter((c) => {
          const r = c.getBoundingClientRect()
          return r.right <= window.innerWidth + 1 && r.left >= -1
        })
        const sizes = cards.map((c) => { const r = c.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}` })
        return {
          total: cards.length,
          visible: visible.length,
          rows: [...new Set(visible.map((c) => Math.round(c.getBoundingClientRect().top)))].length,
          sizes: [...new Set(sizes)],
        }
      })
      report(info, theme, 'i-showcase', data)
      expect.soft(data.visible, 'al menos 3 tarjetas visibles').toBeGreaterThanOrEqual(3)
      expect.soft(data.rows, 'una sola fila').toBe(1)
      expect(data.sizes.length, 'todas las tarjetas con el mismo tamaño').toBe(1)
    })

    // Hip. 9 — caso j: toda tarjeta lleva a /tour?tour={slug}.
    test('j · toda tarjeta de tour apunta a /tour?tour={slug}', async ({ page }, info) => {
      const views = ['/', '/explorar', '/tour', '/blog', '/blog/articulo', '/favoritos', '/explorar/mapa', '/estados/home-promociones', '/estados/explorar-sugerencias', '/estados/favoritos-vacio']
      const bad: { view: string; href: string | null; text: string }[] = []
      const seen: Record<string, number> = {}
      const collect = async (view: string): Promise<void> => {
        const found = await page.evaluate(() => {
          // Tarjeta de tour: .bt-card, o bloque de 160–440 px de ancho con título h3 e imagen.
          // Si el bloque no es (ni está dentro de) un <a>, la tarjeta no es clicable: href null.
          const isCard = (el: HTMLElement): boolean => {
            if (el.classList.contains('bt-card')) return true
            if (el.closest('.bt-nav-row, .bt-menu, .bt-rail, .bt-rail-host')) return false
            const r = el.getBoundingClientRect()
            const hasTitle = Boolean(el.querySelector('h3'))
            const hasMedia = Boolean(el.querySelector('img')) || [...el.querySelectorAll<HTMLElement>('div')].some((d) => getComputedStyle(d).backgroundImage.includes('url('))
            return hasTitle && hasMedia && r.width >= 160 && r.width <= 440 && r.height >= 160 && r.height <= 560
          }
          const cards = [...document.querySelectorAll<HTMLElement>('a, div, button')]
            .filter(isCard)
            .filter((el) => !el.parentElement?.closest('a, button') && ![...el.querySelectorAll<HTMLElement>('a, div, button')].some((c) => c !== el && isCard(c)))
          return cards.map((el) => ({
            href: (el.closest('a') as HTMLAnchorElement | null)?.getAttribute('href') ?? null,
            text: `${el.tagName.toLowerCase()} · ${(el.querySelector('h3')?.textContent ?? '').trim().slice(0, 40)}`,
          }))
        })
        seen[view] = found.length
        for (const f of found) if (!TOUR_HREF.test(f.href ?? '')) bad.push({ view, ...f })
      }
      for (const view of views) {
        await open(page, view)
        await collect(view)
      }
      // Vitrina Promociones del Home.
      await open(page, '/')
      await page.locator('a.p0_13').first().click({ force: true })
      await page.locator('#bt-promos').waitFor({ state: 'visible', timeout: 10_000 })
      await collect('vitrina:promociones')
      // Chip de tour del hero del Home (tarjeta del Home sin <a>).
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      const heroChip = page.locator('.p0_19').first()
      let heroDestination: string | null = null
      if (await heroChip.count()) {
        await Promise.all([page.waitForURL(/.*/, { timeout: 15_000 }).catch(() => null), heroChip.click({ force: true })])
        await page.waitForTimeout(800)
        const u = new URL(page.url())
        heroDestination = u.pathname + u.search
        if (!TOUR_HREF.test(heroDestination)) bad.push({ view: 'home:hero-chip', href: heroDestination, text: 'chip del hero' })
      }
      report(info, theme, 'j-hrefs', { seen, heroDestination, bad })
      expect(bad, 'tarjetas que no llevan a /tour?tour={slug}').toEqual([])
    })
  })
}
