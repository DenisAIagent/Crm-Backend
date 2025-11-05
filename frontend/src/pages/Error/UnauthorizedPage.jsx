import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ShieldExclamationIcon,
  HomeIcon,
  ArrowLeftIcon,
  KeyIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'

function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getAccessLevel = () => {
    if (!user) return 'Aucun'

    switch (user.role) {
      case 'admin': return 'Administrateur'
      case 'manager': return 'Manager'
      case 'agent': return 'Agent'
      default: return 'Utilisateur'
    }
  }

  const getRequiredPermissions = () => {
    // This could be passed via state or derived from the attempted route
    return [
      'Administration système',
      'Gestion des utilisateurs',
      'Accès aux rapports avancés'
    ]
  }

  return (
    <>
      <Helmet>
        <title>Accès non autorisé - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">MDMC Music Ads</span>
            </div>

            <div className="flex items-center space-x-3">
              {user && (
                <div className="text-sm text-gray-600">
                  Connecté en tant que <strong>{user.firstName} {user.lastName}</strong>
                </div>
              )}

              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            {/* 403 Illustration */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
                <ShieldExclamationIcon className="w-16 h-16 text-red-600" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Accès non autorisé
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
            </div>

            {/* Current Access Level */}
            {user && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Votre niveau d'accès actuel
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Utilisateur :</span>
                    <span className="text-sm text-gray-900">{user.firstName} {user.lastName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email :</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rôle :</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getAccessLevel()}
                    </span>
                  </div>

                  {user.team && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Équipe :</span>
                      <span className="text-sm text-gray-900 capitalize">{user.team}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Required Permissions */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <KeyIcon className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-900">Permissions requises</h3>
              </div>

              <p className="text-sm text-red-800 mb-4">
                Cette page nécessite l'une des permissions suivantes :
              </p>

              <ul className="space-y-2">
                {getRequiredPermissions().map((permission, index) => (
                  <li key={index} className="flex items-center text-sm text-red-800">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Retour
                </button>

                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Dashboard
                </button>
              </div>

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Se déconnecter et changer de compte
                </button>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">Besoin d'accès ?</h3>
              </div>

              <p className="text-sm text-blue-800 mb-4">
                Si vous pensez avoir besoin d'accès à cette fonctionnalité pour votre travail,
                contactez votre administrateur ou l'équipe support.
              </p>

              <div className="space-y-3">
                <div className="text-sm text-blue-800">
                  <strong>Qui contacter :</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Votre manager direct</li>
                    <li>L'équipe IT/Support</li>
                    <li>Denis Adam (Administrateur système)</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Contacter le support
                  </Link>

                  <a
                    href="mailto:admin@mdmc.fr?subject=Demande d'accès - CRM"
                    className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    admin@mdmc.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Common Actions */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Actions disponibles avec votre niveau d'accès :
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Voir le dashboard', path: '/dashboard', available: true },
                  { name: 'Gérer les leads', path: '/leads', available: user?.permissions?.includes('leads:read') },
                  { name: 'Voir les campagnes', path: '/campaigns', available: user?.permissions?.includes('campaigns:read') },
                  { name: 'Mon profil', path: '/profile', available: true }
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      action.available
                        ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{ pointerEvents: action.available ? 'auto' : 'none' }}
                  >
                    {action.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-500">
              © 2024 MDMC Music Ads. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default UnauthorizedPage