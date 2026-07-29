import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

// Config plana de ESLint 9 para el Portal B2C (Astro 5 + React 19 islands).
// Alinea con los quality gates: sin `any`, accesibilidad en JSX, sin console.log.
export default tseslint.config(
  {
    // Artefactos y dependencias fuera del alcance del lint.
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Los tests pueden usar utilidades y globals del entorno de test.
    files: ['**/*.{test,spec}.{ts,tsx}', 'test/**', 'e2e/**'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Scripts de build / integraciones Astro (Node ESM).
    files: ['integrations/**/*.mjs', '*.config.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
)
