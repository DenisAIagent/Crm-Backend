import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

function AlertsPanel({
  alerts = [],
  className = '',
  darkTheme = false,
  onDismiss = null
}) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // Données de démonstration si pas d'alertes
  const defaultAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Follow-ups en retard',
      message: '5 leads nécessitent un suivi urgent',
      action: { label: 'Voir les leads', href: '/leads?filter=overdue' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      dismissible: true,
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'Nouvelle campagne disponible',
      message: 'Campaign Spotify Premium est maintenant active',
      action: { label: 'Voir campagne', href: '/campaigns/spotify-premium' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      dismissible: true,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Objectif mensuel atteint',
      message: 'Félicitations ! Vous avez dépassé votre objectif de 120%',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      dismissible: true,
      priority: 'low'
    }
  ]

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts

  // Filtrer les alertes non supprimées
  const visibleAlerts = displayAlerts.filter(alert => !dismissedAlerts.has(alert.id))

  const getAlertConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircleIcon,
        iconColor: 'text-green-400',
        borderColor: 'border-green-500/30',
        bgColor: 'from-green-500/10 to-transparent',
        textColor: 'text-green-300'
      },
      warning: {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/30',
        bgColor: 'from-yellow-500/10 to-transparent',
        textColor: 'text-yellow-300'
      },
      error: {
        icon: XCircleIcon,
        iconColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        bgColor: 'from-red-500/10 to-transparent',
        textColor: 'text-red-300'
      },
      info: {
        icon: InformationCircleIcon,
        iconColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'from-blue-500/10 to-transparent',
        textColor: 'text-blue-300'
      }
    }
    return configs[type] || configs.info
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority] || colors.medium
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
    if (onDismiss) {
      onDismiss(alertId)
    }
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className={`
        p-6 rounded-xl border border-dashed text-center
        ${darkTheme
          ? 'border-dark-600 bg-dark-700/20'
          : 'border-gray-300 bg-gray-50'
        }
        ${className}
      `}>
        <CheckCircleIcon className={`
          w-8 h-8 mx-auto mb-2
          ${darkTheme ? 'text-green-400' : 'text-green-500'}
        `} />
        <h3 className={`
          font-medium text-sm mb-1
          ${darkTheme ? 'text-white' : 'text-gray-900'}
        `}>
          Aucune alerte
        </h3>
        <p className={`
          text-xs
          ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
        `}>
          Tout fonctionne parfaitement !
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert, index) => {
        const config = getAlertConfig(alert.type)
        const IconComponent = config.icon

        return (
          <div
            key={alert.id}
            className={`
              relative p-4 rounded-xl border backdrop-blur-safe transition-all duration-300 hover:scale-[1.01]
              ${darkTheme
                ? `bg-gradient-to-r ${config.bgColor} border-dark-600/50 ${config.borderColor}`
                : `bg-gradient-to-r ${config.bgColor} ${config.borderColor}`
              }
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Indicateur de priorité */}
            {alert.priority && (
              <div className={`
                absolute top-2 right-2 w-2 h-2 rounded-full
                ${getPriorityColor(alert.priority)}
              `}></div>
            )}

            {/* Bouton de suppression */}
            {alert.dismissible && (
              <button
                onClick={() => handleDismiss(alert.id)}
                className={`
                  absolute top-2 right-6 w-5 h-5 rounded-full flex items-center justify-center
                  transition-colors duration-200
                  ${darkTheme
                    ? 'hover:bg-dark-600 text-dark-400 hover:text-white'
                    : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                  }
                `}
                title="Supprimer l'alerte"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}

            <div className="flex items-start space-x-3">
              {/* Icône */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${darkTheme ? 'bg-dark-600/50' : 'bg-white/50'}
              `}>
                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`
                    font-semibold text-sm truncate
                    ${darkTheme ? 'text-white' : 'text-gray-900'}
                  `}>
                    {alert.title}
                  </h4>
                  {alert.timestamp && (
                    <span className={`
                      text-xs flex-shrink-0 ml-2
                      ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
                    `}>
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  )}
                </div>

                <p className={`
                  text-sm mb-3
                  ${darkTheme ? 'text-dark-200' : 'text-gray-700'}
                `}>
                  {alert.message}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  {alert.action && (
                    <Link
                      to={alert.action.href}
                      className={`
                        inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all duration-200 hover:scale-105
                        ${darkTheme
                          ? `${config.textColor} hover:bg-white/10 border border-current/20`
                          : `${config.textColor} hover:bg-current/10 border border-current/20`
                        }
                      `}
                    >
                      <EyeIcon className="w-3 h-3 mr-1" />
                      {alert.action.label}
                    </Link>
                  )}

                  {/* Métadonnées */}
                  <div className="flex items-center space-x-2 text-xs">
                    {alert.priority && (
                      <span className={`
                        px-2 py-1 rounded-full font-medium
                        ${alert.priority === 'high'
                          ? darkTheme
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-red-100 text-red-600'
                          : alert.priority === 'medium'
                          ? darkTheme
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-yellow-100 text-yellow-600'
                          : darkTheme
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-600'
                        }
                      `}>
                        {alert.priority === 'high' ? 'Urgent' :
                         alert.priority === 'medium' ? 'Important' : 'Info'}
                      </span>
                    )}

                    {alert.type === 'warning' && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className={`w-3 h-3 ${config.iconColor}`} />
                        <span className={config.textColor}>Action requise</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression pour les alertes urgentes */}
            {alert.priority === 'high' && (
              <div className={`
                absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden
                ${darkTheme ? 'bg-dark-600/50' : 'bg-gray-200/50'}
              `}>
                <div className="h-full bg-red-500 animate-pulse"></div>
              </div>
            )}
          </div>
        )
      })}

      {/* Footer avec résumé */}
      {visibleAlerts.length > 0 && (
        <div className={`
          flex items-center justify-between p-3 rounded-lg text-xs
          ${darkTheme
            ? 'bg-dark-700/30 border border-dark-600/50'
            : 'bg-gray-50 border border-gray-200'
          }
        `}>
          <div className="flex items-center space-x-2">
            <BellIcon className={`
              w-4 h-4
              ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
            `} />
            <span className={darkTheme ? 'text-dark-300' : 'text-gray-600'}>
              {visibleAlerts.length} alerte{visibleAlerts.length > 1 ? 's' : ''} active{visibleAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
          <Link
            to="/alerts"
            className={`
              font-medium transition-colors
              ${darkTheme
                ? 'text-primary-400 hover:text-primary-300'
                : 'text-primary-600 hover:text-primary-700'
              }
            `}
          >
            Gérer toutes →
          </Link>
        </div>
      )}
    </div>
  )
}

export default AlertsPanel