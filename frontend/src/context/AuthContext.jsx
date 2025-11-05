import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api, authAPI } from '@/utils/api'
import Cookies from 'js-cookie'

const AuthContext = createContext()

// Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        isLoading: false
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user }
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading
      }

    default:
      return state
  }
}

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Auto-refresh token
  useEffect(() => {
    let refreshInterval

    if (state.isAuthenticated && state.token) {
      // Refresh token toutes les 23 heures
      refreshInterval = setInterval(() => {
        refreshToken()
      }, 23 * 60 * 60 * 1000)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [state.isAuthenticated, state.token])

  // Vérifier le statut d'authentification
  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('authToken')

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } })
        return
      }

      // Vérifier si le token est valide
      const response = await authAPI.me()

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token
        }
      })

    } catch (error) {
      console.error('Auth check failed:', error)
      // Token invalide, nettoyer
      Cookies.remove('authToken')
      Cookies.remove('refreshToken')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      // Utiliser authAPI pour l'authentification réelle
      const response = await authAPI.login(credentials)
      const { user, token, refreshToken } = response.data

      // Stocker les tokens dans les cookies
      Cookies.set('authToken', token, {
        expires: credentials.rememberMe ? 7 : 1, // 7 jours ou 1 jour
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 7, // 7 jours
          secure: import.meta.env.PROD,
          sameSite: 'strict'
        })
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      })

      toast.success(`Bienvenue ${user.firstName} !`)
      return { success: true }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.data?.message || 'Erreur de connexion'

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      })

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      // Notifier le serveur pour invalider le token
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Nettoyer côté client
      Cookies.remove('authToken')
      Cookies.remove('refreshToken')

      dispatch({ type: AUTH_ACTIONS.LOGOUT })

      toast.success('Déconnexion réussie')
    }
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = Cookies.get('refreshToken')

      if (!refreshTokenValue) {
        throw new Error('No refresh token')
      }

      const response = await authAPI.refresh({
        refreshToken: refreshTokenValue
      })

      const { token, refreshToken: newRefreshToken } = response.data

      // Mettre à jour les cookies
      Cookies.set('authToken', token, {
        expires: 1,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      if (newRefreshToken) {
        Cookies.set('refreshToken', newRefreshToken, {
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict'
        })
      }

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { token }
      })

      return true

    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  // Inscription
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await authAPI.register(userData)
      const { user, token, refreshToken } = response.data

      // Stocker les tokens
      Cookies.set('authToken', token, {
        expires: 1,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: 'strict'
        })
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      })

      toast.success('Compte créé avec succès !')
      return { success: true }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.data?.message || 'Erreur lors de la création du compte'

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      })

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Mettre à jour le profil utilisateur
  const updateUser = async (userData) => {
    try {
      const response = await api.put(`/users/${state.user.id}`, userData)

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user: response.data.data }
      })

      toast.success('Profil mis à jour')
      return { success: true, data: response.data.data }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Changer le mot de passe
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData)
      toast.success('Mot de passe changé avec succès')
      return { success: true }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Email de réinitialisation envoyé')
      return { success: true }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Réinitialiser le mot de passe
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password })
      const { user, token: authToken, refreshToken } = response.data

      // Stocker les nouveaux tokens
      Cookies.set('authToken', authToken, {
        expires: 1,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      Cookies.set('refreshToken', refreshToken, {
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token: authToken }
      })

      toast.success('Mot de passe réinitialisé avec succès')
      return { success: true }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réinitialisation'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Vérifier les permissions
  const hasPermission = (resource, action) => {
    if (!state.user) return false

    // Admin a toutes les permissions
    if (state.user.role === 'admin') return true

    // Vérifier la permission spécifique
    return state.user.permissions?.[resource]?.[action] || false
  }

  // Vérifier le rôle
  const hasRole = (roles) => {
    if (!state.user) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.user.role)
  }

  // Vérifier l'équipe
  const isTeamMember = (team) => {
    if (!state.user) return false
    return state.user.team === team
  }

  const value = {
    // State
    ...state,

    // Actions
    login,
    logout,
    register,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,

    // Utilities
    hasPermission,
    hasRole,
    isTeamMember
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// HOC pour protéger les routes
export function withAuth(Component, requiredPermissions = {}) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, isLoading, hasPermission } = useAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner h-8 w-8"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-secondary-600">
              Vous devez être connecté pour accéder à cette page.
            </p>
          </div>
        </div>
      )
    }

    // Vérifier les permissions si spécifiées
    if (requiredPermissions.resource && requiredPermissions.action) {
      if (!hasPermission(requiredPermissions.resource, requiredPermissions.action)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                Permissions insuffisantes
              </h2>
              <p className="text-secondary-600">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
            </div>
          </div>
        )
      }
    }

    return <Component {...props} />
  }
}

export default AuthContext