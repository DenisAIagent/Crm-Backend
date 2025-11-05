import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import LoginPage from '../LoginPage'

// Mock des hooks
jest.mock('@/hooks/useFormManager', () => ({
  useFormManager: () => ({
    values: { email: '', password: '', rememberMe: false },
    errors: {},
    touched: {},
    isSubmitting: false,
    isBlocked: false,
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    handleSubmit: jest.fn(),
    setValue: jest.fn(),
    clearErrors: jest.fn()
  }),
  commonValidationRules: {
    email: {
      required: { message: 'L\'email est requis' },
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format d\'email invalide' }
    }
  }
}))

jest.mock('@/hooks/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    initiateGoogleLogin: jest.fn(),
    isLoading: false,
    error: null
  }),
  isGoogleAuthEnabled: () => true
}))

// Mock de l'AuthContext
const mockLogin = jest.fn()
jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    user: null,
    isAuthenticated: false
  })
}))

// Wrapper de test
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <HelmetProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </HelmetProvider>
  </BrowserRouter>
)

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier la présence des éléments principaux
    expect(screen.getByText(/Bienvenue sur/)).toBeInTheDocument()
    expect(screen.getByText('MDMC')).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mot de passe/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Se connecter/ })).toBeInTheDocument()
  })

  it('should show MDMC branding and musical elements', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier le branding MDMC
    expect(screen.getByText('MDMC')).toBeInTheDocument()
    expect(screen.getByText('Music Ads')).toBeInTheDocument()
    expect(screen.getByText('Connectez-vous à votre CRM musical')).toBeInTheDocument()

    // Vérifier la présence d'éléments musicaux
    expect(screen.getByText('Studio Ready')).toBeInTheDocument()
    expect(screen.getByText('Pro Audio CRM')).toBeInTheDocument()
    expect(screen.getByText('Music Marketing')).toBeInTheDocument()
  })

  it('should show Google login button when enabled', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument()
  })

  it('should show demo mode indicator in development', () => {
    // Simuler l'environnement de développement
    const originalEnv = import.meta.env
    import.meta.env = { ...originalEnv, DEV: true }

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByText('Mode démonstration')).toBeInTheDocument()
    expect(screen.getByText('Remplir automatiquement')).toBeInTheDocument()

    // Restaurer l'environnement
    import.meta.env = originalEnv
  })

  it('should have proper form validation attributes', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/Adresse email/)
    const passwordInput = screen.getByLabelText(/Mot de passe/)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(emailInput).toBeRequired()

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    expect(passwordInput).toBeRequired()
  })

  it('should show/hide password when toggle button is clicked', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/Mot de passe/)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have proper security indicators', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByText('Connexion sécurisée SSL')).toBeInTheDocument()
  })

  it('should have proper navigation links', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByRole('link', { name: /Mot de passe oublié/ })).toHaveAttribute('href', '/forgot-password')
    expect(screen.getByRole('link', { name: /Créer un compte/ })).toHaveAttribute('href', '/register')
  })

  it('should have proper SEO meta tags', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier que Helmet a défini les meta tags
    expect(document.title).toContain('Connexion • MDMC Music Ads CRM')
  })

  it('should handle form submission properly', async () => {
    const mockSubmit = jest.fn().mockResolvedValue({ success: true })

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/Adresse email/)
    const passwordInput = screen.getByLabelText(/Mot de passe/)
    const submitButton = screen.getByRole('button', { name: /Se connecter/ })

    fireEvent.change(emailInput, { target: { value: 'test@mdmc.fr' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.click(submitButton)

    // Le formulaire devrait être soumis
    expect(submitButton).toBeDisabled()
  })

  it('should be responsive and mobile-friendly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier les classes responsive
    const mainContainer = screen.getByTestId('login-container') || document.querySelector('.min-h-screen')
    expect(mainContainer).toHaveClass('p-4') // Padding mobile
  })

  it('should have proper accessibility features', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier les labels et l'accessibilité
    expect(screen.getByLabelText(/Adresse email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mot de passe/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Se souvenir de moi/)).toBeInTheDocument()

    // Vérifier les focus states
    const emailInput = screen.getByLabelText(/Adresse email/)
    fireEvent.focus(emailInput)
    expect(emailInput).toHaveFocus()
  })
})

// Tests d'intégration pour les hooks personnalisés
describe('LoginPage Integration', () => {
  it('should integrate properly with form manager', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Vérifier que le composant utilise bien les hooks
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('should integrate properly with Google Auth', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    const googleButton = screen.getByRole('button', { name: /Google/ })
    expect(googleButton).toBeInTheDocument()
    expect(googleButton).not.toBeDisabled()
  })
})