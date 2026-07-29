import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Smoke test de la infraestructura de testing.
// Verifica que Vitest, el entorno jsdom, el transform de JSX (React 19)
// y los matchers de @testing-library/jest-dom están correctamente cableados.
function Greeting({ name }: { name: string }) {
  return <p>Hola, {name}</p>
}

describe('testing infrastructure', () => {
  it('runs in a jsdom environment', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })

  it('renders a React island with Testing Library', () => {
    render(<Greeting name="Borondo" />)
    expect(screen.getByText('Hola, Borondo')).toBeInTheDocument()
  })
})
