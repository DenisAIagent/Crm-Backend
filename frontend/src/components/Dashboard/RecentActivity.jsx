import React from 'react'
import { Link } from 'react-router-dom'
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MusicalNoteIcon,
  MegaphoneIcon,
  CurrencyEuroIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

function RecentActivity({
  activities = [],
  loading = false,
  className = '',
  darkTheme = false
}) {
  // Données de démonstration si pas d'activités
  const defaultActivities = [
    {
      id: 1,
      type: 'lead_created',
      user: 'Denis Adam',
      action: 'a ajouté un nouveau lead',
      target: 'Artiste Hip-Hop "MC Flow"',
      platform: 'youtube',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'success',
      value: '€2,500'
    },
    {
      id: 2,
      type: 'call_completed',
      user: 'Marine Dubois',
      action: 'a terminé un appel avec',
      target: 'Label Indé Records',
      platform: 'meta',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'success',
      duration: '25 min'
    },
    {
      id: 3,
      type: 'campaign_launched',
      user: 'System',
      action: 'a lancé la campagne',
      target: 'Promo Single "Midnight"',
      platform: 'spotify',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'active',
      budget: '€1,200'
    },
    {
      id: 4,
      type: 'email_sent',
      user: 'Denis Adam',
      action: 'a envoyé un email à',
      target: 'Producer Sound Wave',
      platform: 'tiktok',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: 5,
      type: 'lead_updated',
      user: 'Marine Dubois',
      action: 'a mis à jour le statut de',
      target: 'Groupe Rock "Storm"',
      platform: 'youtube',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'qualified',
      previousStatus: 'contacted'
    }
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  const getActivityIcon = (type) => {
    const icons = {
      lead_created: UserCircleIcon,
      call_completed: PhoneIcon,
      email_sent: EnvelopeIcon,
      lead_updated: EyeIcon,
      campaign_launched: MegaphoneIcon,
      payment_received: CurrencyEuroIcon,
      contract_signed: CheckCircleIcon,
      lead_lost: XCircleIcon
    }
    return icons[type] || ClockIcon
  }

  const getActivityColor = (type, status) => {
    if (status === 'success' || status === 'qualified' || status === 'active') {
      return 'text-accent-400'
    }
    if (status === 'pending' || status === 'contacted') {
      return 'text-warning-400'
    }
    if (status === 'failed' || status === 'lost') {
      return 'text-danger-400'
    }

    const colors = {
      lead_created: 'text-primary-400',
      call_completed: 'text-secondary-400',
      email_sent: 'text-blue-400',
      campaign_launched: 'text-purple-400',
      payment_received: 'text-accent-400',
      lead_updated: 'text-indigo-400'
    }
    return colors[type] || 'text-dark-400'
  }

  const getPlatformColor = (platform) => {
    const colors = {
      youtube: 'bg-red-500',
      spotify: 'bg-green-500',
      meta: 'bg-blue-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      tiktok: 'bg-gray-800',
      twitter: 'bg-blue-400',
      soundcloud: 'bg-orange-500'
    }
    return colors[platform] || 'bg-primary-500'
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

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`
              p-4 rounded-lg animate-pulse
              ${darkTheme ? 'bg-dark-700/50' : 'bg-gray-100'}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-8 h-8 rounded-lg
                ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
              `}></div>
              <div className="flex-1 space-y-2">
                <div className={`
                  h-4 rounded
                  ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
                `}></div>
                <div className={`
                  h-3 rounded w-2/3
                  ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
                `}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {displayActivities.map((activity, index) => {
        const IconComponent = getActivityIcon(activity.type)
        const iconColor = getActivityColor(activity.type, activity.status)
        const platformColor = getPlatformColor(activity.platform)

        return (
          <div
            key={activity.id}
            className={`
              group p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]
              ${darkTheme
                ? 'bg-dark-700/40 border-dark-600/50 hover:bg-dark-700/60 hover:border-primary-500/30'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-medium'
              }
            `}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Icône d'activité */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${darkTheme ? 'bg-dark-600 group-hover:bg-dark-500' : 'bg-gray-100 group-hover:bg-gray-200'}
              `}>
                <IconComponent className={`w-4 h-4 ${iconColor}`} />
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    {/* Badge plateforme */}
                    <div className={`
                      w-3 h-3 rounded-full ${platformColor} flex-shrink-0
                    `}></div>

                    {/* Texte principal */}
                    <p className={`
                      text-sm truncate
                      ${darkTheme ? 'text-white' : 'text-gray-900'}
                    `}>
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium text-primary-400">
                        {activity.target}
                      </span>
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className={`
                    text-xs flex-shrink-0 ml-2
                    ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
                  `}>
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                {/* Métadonnées supplémentaires */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-3 text-xs">
                    {activity.value && (
                      <span className={`
                        px-2 py-1 rounded-full font-medium
                        ${darkTheme
                          ? 'bg-accent-500/20 text-accent-400'
                          : 'bg-accent-100 text-accent-600'
                        }
                      `}>
                        {activity.value}
                      </span>
                    )}

                    {activity.budget && (
                      <span className={`
                        px-2 py-1 rounded-full font-medium
                        ${darkTheme
                          ? 'bg-warning-500/20 text-warning-400'
                          : 'bg-warning-100 text-warning-600'
                        }
                      `}>
                        Budget: {activity.budget}
                      </span>
                    )}

                    {activity.duration && (
                      <span className={`
                        px-2 py-1 rounded-full font-medium
                        ${darkTheme
                          ? 'bg-secondary-500/20 text-secondary-400'
                          : 'bg-secondary-100 text-secondary-600'
                        }
                      `}>
                        {activity.duration}
                      </span>
                    )}

                    {activity.previousStatus && (
                      <span className={`
                        text-xs
                        ${darkTheme ? 'text-dark-400' : 'text-gray-500'}
                      `}>
                        {activity.previousStatus} → {activity.status}
                      </span>
                    )}
                  </div>

                  {/* Action rapide */}
                  {(activity.type === 'lead_created' || activity.type === 'lead_updated') && (
                    <Link
                      to={`/leads/${activity.id}`}
                      className={`
                        text-xs font-medium transition-colors
                        ${darkTheme
                          ? 'text-primary-400 hover:text-primary-300'
                          : 'text-primary-600 hover:text-primary-700'
                        }
                      `}
                    >
                      Voir →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className={`
        flex items-center justify-between p-3 rounded-lg text-xs border-t
        ${darkTheme
          ? 'border-dark-600/50 bg-dark-700/20'
          : 'border-gray-200 bg-gray-50'
        }
      `}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
          <span className={darkTheme ? 'text-dark-300' : 'text-gray-600'}>
            Activité en temps réel
          </span>
        </div>
        <Link
          to="/activity"
          className={`
            font-medium transition-colors
            ${darkTheme
              ? 'text-primary-400 hover:text-primary-300'
              : 'text-primary-600 hover:text-primary-700'
            }
          `}
        >
          Voir tout →
        </Link>
      </div>
    </div>
  )
}

export default RecentActivity