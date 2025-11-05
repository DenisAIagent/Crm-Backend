import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

import LoadingSpinner from '@/components/UI/LoadingSpinner'

function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Simulate API call to validate token
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock token validation
        if (token && token.length > 10) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
        }
      } catch (error) {
        setTokenValid(false)
      }
    }

    validateToken()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock successful password reset
      console.log('Password reset successful for token:', token)
      setSuccess(true)

      // Redirect to login after success message
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
          }
        })
      }, 3000)

    } catch (error) {
      setErrors({
        submit: 'Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Très faible', color: 'bg-red-500' },
      { strength: 2, text: 'Faible', color: 'bg-orange-500' },
      { strength: 3, text: 'Moyen', color: 'bg-yellow-500' },
      { strength: 4, text: 'Fort', color: 'bg-green-500' },
      { strength: 5, text: 'Très fort', color: 'bg-green-600' }
    ]

    return levels[strength]
  }

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <>
        <Helmet>
          <title>Réinitialisation du mot de passe - MDMC Music Ads CRM</title>
        </Helmet>

        <div className="w-full max-w-sm mx-auto text-center">
          <div className="mb-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification du lien
            </h2>
            <p className="text-gray-600">
              Validation de votre lien de réinitialisation...
            </p>
          </div>
        </div>
      </>
    )
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <>
        <Helmet>
          <title>Lien invalide - MDMC Music Ads CRM</title>
        </Helmet>

        <div className="w-full max-w-sm mx-auto text-center">
          <div className="mb-8">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Lien invalide
            </h2>
            <p className="text-gray-600 mb-6">
              Ce lien de réinitialisation n'est plus valide ou a expiré.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-900 mb-2">
              Possible causes :
            </h3>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Le lien a expiré (valide 24h)</li>
              <li>Le lien a déjà été utilisé</li>
              <li>L'URL est incomplète ou corrompue</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Demander un nouveau lien
            </Link>

            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Success state
  if (success) {
    return (
      <>
        <Helmet>
          <title>Mot de passe réinitialisé - MDMC Music Ads CRM</title>
        </Helmet>

        <div className="w-full max-w-sm mx-auto text-center">
          <div className="mb-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Mot de passe réinitialisé
            </h2>
            <p className="text-gray-600">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-sm text-gray-600">Redirection en cours...</span>
          </div>

          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-500 underline"
          >
            Aller à la connexion maintenant
          </Link>
        </div>
      </>
    )
  }

  const passwordStrength = getPasswordStrength()

  return (
    <>
      <Helmet>
        <title>Nouveau mot de passe - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-gray-600">
            Choisissez un mot de passe fort pour sécuriser votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Exigences du mot de passe
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Au moins 8 caractères</li>
              <li>Au moins une lettre minuscule</li>
              <li>Au moins une lettre majuscule</li>
              <li>Au moins un chiffre</li>
              <li>Caractères spéciaux recommandés</li>
            </ul>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {passwordStrength.text}
                  </span>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Connexion sécurisée SSL - Votre mot de passe est chiffré
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage