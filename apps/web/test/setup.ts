// Setup global para Vitest + Testing Library.
// Añade los matchers de jest-dom (toBeInTheDocument, toHaveAttribute, ...)
// y limpia el DOM tras cada test para evitar fugas de estado entre casos.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
