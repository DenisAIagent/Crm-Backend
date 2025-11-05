import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MusicalNoteIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { useGoogleAuth, isGoogleAuthEnabled } from '@/hooks/useGoogleAuth'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { initiateGoogleLogin, isLoading: googleLoading, error: googleError } = useGoogleAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const from = location.state?.from?.pathname || '/dashboard'

  // Removed auto-fill demo functionality for production

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
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
      const result = await login(formData)

      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setErrors({
          submit: result.error || 'Email ou mot de passe incorrect'
        })
      }
    } catch (error) {
      setErrors({
        submit: 'Une erreur est survenue. Veuillez réessayer.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (!isGoogleAuthEnabled()) {
      console.error('Google OAuth not configured')
      return
    }
    initiateGoogleLogin()
  }

  // Removed demo functionality for production

  return (
    <>
      <Helmet>
        <title>Connexion - MDMC Music Ads CRM</title>
        <meta name="description" content="Connectez-vous à votre plateforme MDMC Music Ads CRM pour gérer vos campagnes publicitaires musicales" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col lg:flex-row">
        {/* Left side - Branding */}
        <div className="hidden md:flex md:w-2/5 lg:w-2/5 xl:w-1/2 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-black"></div>

          {/* Musical notes animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${10 + (i * 10)}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s'
                }}
              >
                <MusicalNoteIcon className="w-4 h-4 text-red-500/30" />
              </div>
            ))}
          </div>

          {/* Waveform animation */}
          <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center space-x-1 opacity-30">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
                style={{
                  width: '3px',
                  height: `${Math.random() * 80 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${1.5 + Math.random()}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center p-4 md:p-6 lg:p-8 xl:p-12 pl-8 md:pl-16 lg:pl-40 xl:pl-48">
            <div className="max-w-xs md:max-w-sm lg:max-w-sm xl:max-w-md text-left">
              {/* Logo */}
              <div className="mb-4">
                <div className="flex items-center justify-start -mb-16">
                  <img
                    src="/assets/images/logo.webp"
                    alt="MDMC Music Ads"
                    className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-96 xl:h-96 object-contain"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-2 whitespace-nowrap">
                  MDMC Music Ads
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-300">
                  Plateforme CRM Premium
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {[
                  'Gestion des leads musicaux',
                  'Campagnes publicitaires optimisées',
                  'Analytics avancés temps réel',
                  'ROI transparent et mesurable'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-start space-x-3">
                    <CheckCircleIcon className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 md:w-3/5 lg:w-3/5 xl:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
            {/* Mobile header */}
            <div className="md:hidden text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/images/logo.webp"
                  alt="MDMC Music Ads"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">MDMC Music Ads</h1>
              <p className="text-gray-400">Connexion à votre CRM</p>
            </div>

            {/* Login form */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Connexion</h2>
                <p className="text-sm md:text-base text-gray-400">
                  Accédez à votre plateforme de gestion musicale
                </p>
              </div>


              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Global error */}
                {(errors.submit || googleError) && (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                      <p className="text-sm text-white">{errors.submit || googleError}</p>
                    </div>
                  </div>
                )}

                {/* Social login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || !isGoogleAuthEnabled()}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 py-2.5 md:py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <span>Continuer avec Google</span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-900 px-4 text-gray-400">ou</span>
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm md:text-base ${
                      errors.email
                        ? 'border-red-500'
                        : focusedField === 'email'
                        ? 'border-red-500'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 pr-10 md:pr-12 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm md:text-base ${
                        errors.password
                          ? 'border-red-500'
                          : focusedField === 'password'
                          ? 'border-red-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="ml-2 md:ml-3 text-xs md:text-sm text-gray-300">Se souvenir de moi</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs md:text-sm text-red-500 hover:text-red-400 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 md:py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-500/25 text-sm md:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Connexion en cours...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 md:mt-8 text-center">
                <p className="text-xs md:text-sm text-gray-500">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="text-red-500 hover:text-red-400 font-medium transition-colors">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>

            {/* Security badge */}
            <div className="mt-4 md:mt-6 text-center">
              <div className="inline-flex items-center space-x-1 md:space-x-2 text-xs text-gray-400 bg-gray-900/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-gray-700">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Connexion sécurisée SSL 256-bit</span><span className="sm:hidden">SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage