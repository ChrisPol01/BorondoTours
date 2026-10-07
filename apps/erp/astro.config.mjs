import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// ERP Agencia — Astro + React islands. Tailwind 4 vía plugin de Vite (igual que apps/web).
export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
})