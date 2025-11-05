import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import LoadingSpinner from '@/components/UI/LoadingSpinner'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({})
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!email) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide'
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

      // Mock successful reset request
      console.log('Password reset requested for:', email)
      setSuccess(true)

    } catch (error) {
      setErrors({
        submit: 'Une erreur est survenue. Veuillez réessayer.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Helmet>
          <title>Email envoyé - MDMC Music Ads CRM</title>
        </Helmet>

        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Email envoyé
            </h2>
            <p className="text-gray-600">
              Nous avons envoyé un lien de réinitialisation à votre adresse email
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Vérifiez votre boîte email
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>Un email a été envoyé à <strong>{email}</strong></p>
              <p>Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.</p>
              <p>Le lien expirera dans 24 heures.</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSuccess(false)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Renvoyer l'email
            </button>

            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour à la connexion
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:text-primary-500 underline"
              >
                réessayez avec une autre adresse
              </button>
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mot de passe oublié - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
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

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Comment ça marche ?
            </h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Entrez l'adresse email de votre compte</li>
              <li>Cliquez sur "Envoyer le lien de réinitialisation"</li>
              <li>Vérifiez votre boîte email (et spam)</li>
              <li>Cliquez sur le lien pour créer un nouveau mot de passe</li>
            </ol>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien de réinitialisation'
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
              Nous ne partagerons jamais votre email avec des tiers
            </span>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Besoin d'aide ?{' '}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-500 underline"
            >
              Contacter le support
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage