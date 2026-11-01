import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
// Config plana de ESLint 9 compartida por los paquetes TypeScript sin config propia
// (services/* y packages/*). apps/web tiene su propio eslint.config.js, que ESLint
// encuentra antes por estar más cerca. Alinea con los quality gates: sin `any`, sin console.log.
export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.astro/**', '**/coverage/**', '.megafactory/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
)
