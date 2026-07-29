import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import validateDesignTokens from './integrations/validate-design-tokens.mjs'

// https://astro.build/config
export default defineConfig({
  // `validateDesignTokens` aborta el build si un componente referencia un
  // design token no definido, indicando el nombre del token faltante (R1.10).
  integrations: [react(), validateDesignTokens()],
  vite: {
    // Tailwind CSS 4 se integra vía plugin de Vite (no @astrojs/tailwind, que es para Tailwind 3)
    plugins: [tailwindcss()],
  },
  output: 'static', // SSG para B2C público (S3 + CloudFront)
  site: 'https://borondotours.com',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
})
