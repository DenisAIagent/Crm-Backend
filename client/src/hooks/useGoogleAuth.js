import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

/**
 * Hook personnalisé pour gérer l'authentification Google OAuth
 * Gère la redirection, le callback et l'état de chargement
 */
export function useGoogleAuth() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Gérer le callback OAuth au retour de Google
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      const success = urlParams.get('success')
      const token = urlParams.get('token')
      const userParam = urlParams.get('user')

      // Si retour direct avec succès depuis le backend
      if (success === 'true' && token && userParam) {
        setIsLoading(true)

        try {
          const userData = JSON.parse(decodeURIComponent(userParam))

          // Connecter l'utilisateur directement
          const loginResult = await login({
            googleToken: token,
            user: userData
          })

          if (loginResult.success) {
            // Analytics tracking
            if (window.gtag) {
              window.gtag('event', 'login', {
                event_category: 'authentication',
                event_label: 'google_oauth',
                user_id: userData?.id
              })
            }

            toast.success(`Connexion Google réussie ! Bienvenue ${userData.firstName}`, {
              duration: 3000
            })

            // Rediriger vers le dashboard
            window.history.replaceState({}, document.title, '/dashboard')
          } else {
            throw new Error(loginResult.error || 'Erreur lors de la connexion')
          }

        } catch (error) {
          console.error('Google OAuth direct callback error:', error)
          setError('Erreur lors de la connexion Google')
          toast.error('Erreur lors de la connexion Google')
        } finally {
          setIsLoading(false)
          // Nettoyer l'URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        return
      }

      // Si on a une erreur OAuth
      if (error) {
        console.error('OAuth error:', error)
        let errorMessage = 'Erreur lors de la connexion Google'

        switch (error) {
          case 'oauth_error':
            errorMessage = 'Connexion Google annulée ou échouée'
            break
          case 'missing_params':
            errorMessage = 'Paramètres d\'authentification manquants'
            break
          case 'invalid_code':
            errorMessage = 'Code d\'autorisation invalide'
            break
          case 'server_error':
            errorMessage = 'Erreur serveur lors de l\'authentification'
            break
        }

        setError(errorMessage)
        toast.error(errorMessage)

        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      // Si on a un code d'autorisation
      if (code && state) {
        setIsLoading(true)

        try {
          // Échanger le code contre un token
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
            credentials: 'include'
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la connexion Google')
          }

          // Simuler un login avec les données reçues
          const loginResult = await login({
            googleToken: data.token,
            user: data.user
          })

          if (loginResult.success) {
            // Analytics tracking
            if (window.gtag) {
              window.gtag('event', 'login', {
                event_category: 'authentication',
                event_label: 'google_oauth',
                user_id: data.user?.id
              })
            }

            toast.success(`Connexion Google réussie ! Bienvenue ${data.user.firstName}`, {
              duration: 3000
            })

            // Nettoyer l'URL et rediriger
            window.history.replaceState({}, document.title, '/dashboard')
          } else {
            throw new Error(loginResult.error || 'Erreur lors de la connexion')
          }

        } catch (error) {
          console.error('Google OAuth callback error:', error)
          setError(error.message)
          toast.error(`Erreur de connexion Google: ${error.message}`)
        } finally {
          setIsLoading(false)
          // Nettoyer l'URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }

    handleOAuthCallback()
  }, [login])

  /**
   * Initier la connexion Google OAuth
   */
  const initiateGoogleLogin = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Générer un state CSRF unique
      const state = generateRandomString(32)

      // Stocker le state pour validation
      sessionStorage.setItem('oauth_state', state)

      // Paramètres OAuth Google
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}/login`,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        access_type: 'offline',
        prompt: 'select_account'
      })

      // Rediriger vers Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
      window.location.href = googleAuthUrl

    } catch (error) {
      console.error('Error initiating Google login:', error)
      setError('Erreur lors de l\'initialisation de la connexion Google')
      toast.error('Impossible de se connecter à Google')
      setIsLoading(false)
    }
  }

  /**
   * Gérer la déconnexion Google
   */
  const handleGoogleLogout = async () => {
    try {
      // Révoquer le token côté serveur si nécessaire
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/revoke`, {
        method: 'POST',
        credentials: 'include'
      })

      // Nettoyer le storage local
      sessionStorage.removeItem('oauth_state')

    } catch (error) {
      console.error('Error during Google logout:', error)
    }
  }

  return {
    initiateGoogleLogin,
    handleGoogleLogout,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}

/**
 * Générer une chaîne aléatoire pour le state CSRF
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const values = new Uint8Array(length)

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(values)
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length]
    }
  } else {
    // Fallback pour les navigateurs plus anciens
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)]
    }
  }

  return result
}

/**
 * Vérifier si Google OAuth est configuré
 */
export function isGoogleAuthEnabled() {
  return !!(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_API_URL)
}

/**
 * Hook pour vérifier le support OAuth du navigateur
 */
export function useOAuthSupport() {
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Vérifier les APIs nécessaires
    const hasRequiredAPIs = !!(
      window.crypto &&
      window.crypto.getRandomValues &&
      window.sessionStorage &&
      window.URLSearchParams
    )

    setIsSupported(hasRequiredAPIs)

    if (!hasRequiredAPIs) {
      console.warn('OAuth not fully supported in this browser')
    }
  }, [])

  return isSupported
}

export default useGoogleAuth