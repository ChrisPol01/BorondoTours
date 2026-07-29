import { defineConfig, devices } from '@playwright/test'

// Configuración de Playwright para E2E y accesibilidad (axe).
// Corre contra el build estático servido por `astro preview` (SSG, S3 + CloudFront).
const PORT = 4321
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Construye y sirve el sitio estático antes de los tests E2E.
  webServer: {
    command: 'pnpm build && pnpm preview --port ' + PORT,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
