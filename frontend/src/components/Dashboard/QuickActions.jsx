import React from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  MegaphoneIcon,
  CameraIcon,
  MusicalNoteIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

function QuickActions({
  userPermissions = [],
  overdueCount = 0,
  className = '',
  darkTheme = false
}) {
  // Actions disponibles selon les permissions
  const actions = [
    {
      id: 'new-lead',
      title: 'Nouveau Lead',
      description: 'Ajouter un prospect',
      icon: PlusIcon,
      href: '/leads/new',
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      permission: 'leads:create',
      priority: 1
    },
    {
      id: 'view-leads',
      title: 'Gérer les Leads',
      description: `${overdueCount > 0 ? `${overdueCount} en retard` : 'Voir tous les leads'}`,
      icon: EyeIcon,
      href: '/leads',
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600',
      permission: 'leads:read',
      priority: overdueCount > 0 ? 0 : 2,
      badge: overdueCount > 0 ? overdueCount : null
    },
    {
      id: 'new-campaign',
      title: 'Nouvelle Campagne',
      description: 'Créer une campagne marketing',
      icon: MegaphoneIcon,
      href: '/campaigns/new',
      color: 'accent',
      gradient: 'from-accent-500 to-accent-600',
      permission: 'campaigns:create',
      priority: 3
    },
    {
      id: 'call-leads',
      title: 'Appeler les Leads',
      description: 'Planifier des appels',
      icon: PhoneIcon,
      href: '/leads?view=calls',
      color: 'warning',
      gradient: 'from-warning-500 to-warning-600',
      permission: 'leads:update',
      priority: 4
    },
    {
      id: 'send-emails',
      title: 'Campagne Email',
      description: 'Envoyer des emails groupés',
      icon: EnvelopeIcon,
      href: '/marketing/emails',
      color: 'primary',
      gradient: 'from-blue-500 to-blue-600',
      permission: 'marketing:create',
      priority: 5
    },
    {
      id: 'reports',
      title: 'Rapports',
      description: 'Analyser les performances',
      icon: ChartBarIcon,
      href: '/reports',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      permission: 'reports:read',
      priority: 6
    },
    {
      id: 'team-management',
      title: 'Équipe',
      description: 'Gérer l\'équipe',
      icon: UserGroupIcon,
      href: '/team',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      permission: 'team:manage',
      priority: 7
    },
    {
      id: 'music-projects',
      title: 'Projets Musicaux',
      description: 'Gérer les projets',
      icon: MusicalNoteIcon,
      href: '/projects',
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      permission: 'projects:read',
      priority: 8
    }
  ]

  // Filtrer les actions selon les permissions et trier par priorité
  const availableActions = actions
    .filter(action =>
      userPermissions.includes(action.permission) ||
      userPermissions.includes('admin') ||
      userPermissions.length === 0 // Si pas de permissions définies, montrer tout
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6) // Limiter à 6 actions max

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary-400',
      secondary: 'text-secondary-400',
      accent: 'text-accent-400',
      warning: 'text-warning-400',
      purple: 'text-purple-400',
      indigo: 'text-indigo-400',
      pink: 'text-pink-400'
    }
    return colors[color] || 'text-primary-400'
  }

  const getBorderColor = (color) => {
    const colors = {
      primary: 'border-primary-500/30 hover:border-primary-500/60',
      secondary: 'border-secondary-500/30 hover:border-secondary-500/60',
      accent: 'border-accent-500/30 hover:border-accent-500/60',
      warning: 'border-warning-500/30 hover:border-warning-500/60',
      purple: 'border-purple-500/30 hover:border-purple-500/60',
      indigo: 'border-indigo-500/30 hover:border-indigo-500/60',
      pink: 'border-pink-500/30 hover:border-pink-500/60'
    }
    return colors[color] || 'border-primary-500/30 hover:border-primary-500/60'
  }

  if (availableActions.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <SparklesIcon className="w-12 h-12 text-dark-400 mx-auto mb-3" />
        <p className="text-dark-400">Aucune action rapide disponible</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Actions principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableActions.map((action, index) => {
          const IconComponent = action.icon

          return (
            <Link
              key={action.id}
              to={action.href}
              className={`
                group relative p-4 rounded-xl border transition-all duration-300 hover:scale-105
                ${darkTheme
                  ? `bg-dark-700/50 backdrop-blur-safe ${getBorderColor(action.color)} hover:bg-dark-700/80`
                  : `bg-white border-gray-200 hover:border-${action.color}-300 hover:shadow-medium`
                }
                ${index === 0 ? 'animate-fade-in' : ''}
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Badge pour les éléments urgents */}
              {action.badge && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {action.badge}
                </div>
              )}

              {/* Gradient overlay au hover */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300
                bg-gradient-to-br ${action.gradient}
              `}></div>

              <div className="relative flex items-center space-x-3">
                {/* Icône avec glow effect */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                  bg-gradient-to-br ${action.gradient} group-hover:scale-110 group-hover:shadow-lg
                `}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`
                      font-medium text-sm truncate
                      ${darkTheme ? 'text-white group-hover:text-primary-300' : 'text-gray-900'}
                    `}>
                      {action.title}
                    </h4>
                    {action.priority <= 2 && (
                      <RocketLaunchIcon className={`
                        w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity
                        ${getIconColor(action.color)}
                      `} />
                    )}
                  </div>
                  <p className={`
                    text-xs truncate mt-1
                    ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
                  `}>
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Shimmer effect pour les actions prioritaires */}
              {action.priority <= 1 && (
                <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Section bonus si moins de 4 actions */}
      {availableActions.length < 4 && (
        <div className={`
          p-4 rounded-xl border-2 border-dashed transition-all duration-300 text-center
          ${darkTheme
            ? 'border-dark-600 hover:border-primary-500/50 bg-dark-800/30'
            : 'border-gray-300 hover:border-primary-300 bg-gray-50'
          }
        `}>
          <div className="flex flex-col items-center space-y-2">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${darkTheme ? 'bg-primary-500/20' : 'bg-primary-100'}
            `}>
              <SparklesIcon className={`
                w-4 h-4
                ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
              `} />
            </div>
            <div>
              <p className={`
                text-sm font-medium
                ${darkTheme ? 'text-white' : 'text-gray-900'}
              `}>
                Plus d'actions bientôt
              </p>
              <p className={`
                text-xs
                ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
              `}>
                Nouvelles fonctionnalités en développement
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer avec statistiques rapides */}
      <div className={`
        flex items-center justify-between p-3 rounded-lg text-xs
        ${darkTheme
          ? 'bg-dark-700/30 border border-dark-600/50'
          : 'bg-gray-50 border border-gray-200'
        }
      `}>
        <div className="flex items-center space-x-2">
          <div className={`
            w-2 h-2 rounded-full animate-pulse
            ${overdueCount > 0 ? 'bg-danger-400' : 'bg-accent-400'}
          `}></div>
          <span className={darkTheme ? 'text-dark-300' : 'text-gray-600'}>
            {overdueCount > 0 ? `${overdueCount} tâches urgentes` : 'Tout est à jour'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <MusicalNoteIcon className={`w-3 h-3 ${darkTheme ? 'text-primary-400' : 'text-primary-600'}`} />
          <span className={`font-medium ${darkTheme ? 'text-primary-400' : 'text-primary-600'}`}>
            MDMC
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickActions