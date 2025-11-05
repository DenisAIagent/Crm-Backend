import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'

function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const suggestedPages = [
    { name: 'Dashboard', path: '/dashboard', description: 'Vue d\'ensemble de vos données' },
    { name: 'Leads', path: '/leads', description: 'Gestion des prospects' },
    { name: 'Campagnes', path: '/campaigns', description: 'Suivi des campagnes publicitaires' },
    { name: 'Analytics', path: '/analytics', description: 'Rapports et analyses' }
  ]

  return (
    <>
      <Helmet>
        <title>Page non trouvée - MDMC Music Ads CRM</title>
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

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-primary-100 rounded-full mb-6">
                <div className="text-6xl font-bold text-primary-600">404</div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Page non trouvée
              </h1>

              <p className="text-lg text-gray-600 mb-2">
                Désolé, la page que vous recherchez n'existe pas.
              </p>

              <div className="bg-gray-100 rounded-lg p-3 mb-8">
                <p className="text-sm text-gray-700 font-mono break-all">
                  URL demandée : {location.pathname}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-12">
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
                  {isAuthenticated ? 'Dashboard' : 'Connexion'}
                </button>
              </div>
            </div>

            {/* Suggested Pages */}
            {isAuthenticated && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Pages suggérées
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedPages.map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all group"
                    >
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {page.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">Besoin d'aide ?</h3>
                </div>

                <p className="text-sm text-blue-800 mb-4">
                  Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions,
                  n'hésitez pas à nous contacter.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Contacter le support
                  </Link>

                  <a
                    href="mailto:support@mdmc.fr"
                    className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    support@mdmc.fr
                  </a>
                </div>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="mt-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Vous cherchiez peut-être...
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {['dashboard', 'leads', 'campaigns', 'analytics', 'settings'].map((term) => (
                    <span
                      key={term}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                    >
                      {term}
                    </span>
                  ))}
                </div>
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

export default NotFoundPage