import { cleanup, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from '@/components/Header'
import { TeacherNavbar } from '@/components/layout/TeacherNavbar'
import { ISKOOL_THEME_TOKENS } from '@/lib/branding/tenantThemeTokens'
import { useWhiteLabelStore } from '@/store/useWhiteLabelStore'

vi.mock('next/navigation', () => ({
  usePathname: () => '/parent',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn(), logout: vi.fn() }),
}))

const setBrand = (logoUrl: string, schoolName: string) =>
  act(() => useWhiteLabelStore.setState({ logoUrl, schoolName }))

describe.each([
  ['Header', Header],
  ['TeacherNavbar', TeacherNavbar],
])('%s', (_name, Component) => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('con la marca propia muestra el logotipo y no una imagen', () => {
    setBrand(ISKOOL_THEME_TOKENS.logoUrl, ISKOOL_THEME_TOKENS.schoolName)
    const { container } = render(<Component />)
    expect(screen.getByRole('img', { name: 'ISkool' })).toBeTruthy()
    expect(container.querySelector(`img[src="${ISKOOL_THEME_TOKENS.logoUrl}"]`)).toBeNull()
    expect(container.textContent).not.toContain(ISKOOL_THEME_TOKENS.schoolName)
  })

  it('con marca blanca conserva el logo y el nombre de la escuela', () => {
    setBrand('/uploads/sol.webp', 'Colegio Sol')
    const { container } = render(<Component />)
    expect(screen.queryByRole('img', { name: 'ISkool' })).toBeNull()
    expect(container.querySelector('img[src="/uploads/sol.webp"]')).toBeTruthy()
    expect(container.textContent).toContain('Colegio Sol')
  })
})
