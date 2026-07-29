/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// Configuración de Vitest para apps/web.
// - Entorno jsdom por defecto para component tests (Testing Library).
// - Las funciones puras de `src/lib/` se ejecutan igual en jsdom (subconjunto de node).
// - Cobertura ≥ 80% exigida SOLO sobre `src/lib/` (funciones puras property-tested).
export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    // Excluir los tests E2E de Playwright: los ejecuta `playwright test`, no Vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.astro/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // La cobertura se mide sobre la lógica pura de `src/lib/`.
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.{test,spec}.ts', 'src/lib/**/index.ts'],
      // Umbrales por glob: solo aplican a archivos existentes que coincidan.
      thresholds: {
        'src/lib/**/*.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
})
