import React from 'react'
import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

function ErrorMessage({
  type = 'error',
  title,
  message,
  details,
  onClose,
  onRetry,
  className = "",
  showIcon = true
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-600 hover:text-red-500'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-600 hover:text-yellow-500'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-600 hover:text-blue-500'
        }
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'text-green-600 hover:text-green-500'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'text-gray-600 hover:text-gray-500'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="w-5 h-5" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5" />
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />
      default:
        return <InformationCircleIcon className="w-5 h-5" />
    }
  }

  const styles = getTypeStyles()

  const getDefaultTitle = () => {
    switch (type) {
      case 'error':
        return 'Erreur'
      case 'warning':
        return 'Attention'
      case 'info':
        return 'Information'
      case 'success':
        return 'Succès'
      default:
        return 'Notification'
    }
  }

  const displayTitle = title || getDefaultTitle()

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon()}
          </div>
        )}

        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {displayTitle && (
                <h3 className={`text-sm font-medium ${styles.title}`}>
                  {displayTitle}
                </h3>
              )}

              {message && (
                <div className={`${displayTitle ? 'mt-1' : ''} text-sm ${styles.message}`}>
                  {message}
                </div>
              )}

              {details && (
                <div className={`mt-2 text-xs ${styles.message} opacity-75`}>
                  {Array.isArray(details) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{details}</p>
                  )}
                </div>
              )}

              {onRetry && (
                <div className="mt-3">
                  <button
                    onClick={onRetry}
                    className={`text-sm font-medium ${styles.button} focus:outline-none focus:underline`}
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            {onClose && (
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={onClose}
                  className={`inline-flex rounded-md p-1.5 ${styles.button} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composants spécialisés pour plus de simplicité
export function ErrorAlert({ message, onClose, onRetry, ...props }) {
  return (
    <ErrorMessage
      type="error"
      message={message}
      onClose={onClose}
      onRetry={onRetry}
      {...props}
    />
  )
}

export function WarningAlert({ message, onClose, ...props }) {
  return (
    <ErrorMessage
      type="warning"
      message={message}
      onClose={onClose}
      {...props}
    />
  )
}

export function InfoAlert({ message, onClose, ...props }) {
  return (
    <ErrorMessage
      type="info"
      message={message}
      onClose={onClose}
      {...props}
    />
  )
}

export function SuccessAlert({ message, onClose, ...props }) {
  return (
    <ErrorMessage
      type="success"
      message={message}
      onClose={onClose}
      {...props}
    />
  )
}

// Hook pour gérer les états d'erreur
export function useErrorHandler() {
  const [error, setError] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleError = (error, customMessage) => {
    console.error('Error:', error)

    let errorMessage = customMessage || 'Une erreur inattendue s\'est produite'

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message) {
      errorMessage = error.message
    }

    setError({
      message: errorMessage,
      details: error?.response?.data?.details || null,
      originalError: error
    })
  }

  const clearError = () => setError(null)

  const executeAsync = async (asyncFn, loadingMessage) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await asyncFn()
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync
  }
}

export default ErrorMessage