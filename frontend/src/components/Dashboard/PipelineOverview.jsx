import React from 'react'
import { Link } from 'react-router-dom'
import {
  UserPlusIcon,
  PhoneIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline'

function PipelineOverview({
  pipeline = {},
  loading = false,
  className = '',
  darkTheme = false
}) {
  // Données de démonstration si pas de pipeline
  const defaultPipeline = {
    stages: [
      {
        id: 'new',
        name: 'Nouveaux',
        count: 12,
        value: 15600,
        color: 'primary',
        icon: UserPlusIcon,
        description: 'Leads récents'
      },
      {
        id: 'contacted',
        name: 'Contactés',
        count: 8,
        value: 22400,
        color: 'warning',
        icon: PhoneIcon,
        description: 'En discussion'
      },
      {
        id: 'qualified',
        name: 'Qualifiés',
        count: 5,
        value: 18750,
        color: 'secondary',
        icon: CheckCircleIcon,
        description: 'Prospects confirmés'
      },
      {
        id: 'proposal',
        name: 'Devis envoyés',
        count: 3,
        value: 12300,
        color: 'accent',
        icon: CurrencyEuroIcon,
        description: 'En négociation'
      },
      {
        id: 'won',
        name: 'Gagnés',
        count: 2,
        value: 8500,
        color: 'success',
        icon: CheckCircleIcon,
        description: 'Contrats signés'
      }
    ],
    totalValue: 77550,
    totalCount: 30,
    conversionRate: 26.7,
    avgDealSize: 2585
  }

  const displayPipeline = Object.keys(pipeline).length > 0 ? pipeline : defaultPipeline

  const getStageColor = (color, type = 'bg') => {
    const colors = {
      primary: {
        bg: 'bg-primary-500',
        text: 'text-primary-400',
        bgLight: 'bg-primary-500/20',
        border: 'border-primary-500/30'
      },
      secondary: {
        bg: 'bg-secondary-500',
        text: 'text-secondary-400',
        bgLight: 'bg-secondary-500/20',
        border: 'border-secondary-500/30'
      },
      accent: {
        bg: 'bg-accent-500',
        text: 'text-accent-400',
        bgLight: 'bg-accent-500/20',
        border: 'border-accent-500/30'
      },
      warning: {
        bg: 'bg-warning-500',
        text: 'text-warning-400',
        bgLight: 'bg-warning-500/20',
        border: 'border-warning-500/30'
      },
      success: {
        bg: 'bg-green-500',
        text: 'text-green-400',
        bgLight: 'bg-green-500/20',
        border: 'border-green-500/30'
      }
    }
    return colors[color]?.[type] || colors.primary[type]
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`
              p-3 rounded-lg animate-pulse
              ${darkTheme ? 'bg-dark-700/50' : 'bg-gray-100'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className={`
                h-4 w-20 rounded
                ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
              `}></div>
              <div className={`
                h-4 w-8 rounded
                ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
              `}></div>
            </div>
            <div className={`
              h-3 w-16 rounded mt-2
              ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
            `}></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête avec résumé */}
      <div className={`
        p-4 rounded-xl border
        ${darkTheme
          ? 'bg-dark-700/40 border-dark-600/50'
          : 'bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200'
        }
      `}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`
            font-semibold text-sm
            ${darkTheme ? 'text-white' : 'text-gray-900'}
          `}>
            Résumé Global
          </h4>
          <ArrowTrendingUpIcon className={`
            w-4 h-4
            ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
          `} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className={`
              text-lg font-bold
              ${darkTheme ? 'text-white' : 'text-gray-900'}
            `}>
              {displayPipeline.totalCount}
            </p>
            <p className={`
              text-xs
              ${darkTheme ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Total Artistes
            </p>
          </div>
          <div>
            <p className={`
              text-lg font-bold text-purple-400
            `}>
              {displayPipeline.totalStreams ? `${(displayPipeline.totalStreams / 1000000).toFixed(1)}M` : formatCurrency(displayPipeline.totalValue)}
            </p>
            <p className={`
              text-xs
              ${darkTheme ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {displayPipeline.totalStreams ? 'Streams' : 'Valeur Totale'}
            </p>
          </div>
        </div>

        {/* Genres musicaux populaires */}
        {displayPipeline.topGenres && (
          <div className="mt-4 pt-3 border-t border-opacity-20">
            <p className={`
              text-xs font-medium mb-2
              ${darkTheme ? 'text-gray-400' : 'text-gray-600'}
            `}>
              Top Genres
            </p>
            <div className="flex flex-wrap gap-1">
              {displayPipeline.topGenres.map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30"
                >
                  ♪ {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques supplémentaires */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-opacity-20">
          <div className="text-center">
            <p className={`
              text-sm font-semibold
              ${darkTheme ? 'text-secondary-400' : 'text-secondary-600'}
            `}>
              {displayPipeline.conversionRate}%
            </p>
            <p className={`
              text-xs
              ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
            `}>
              Conversion
            </p>
          </div>
          <div className="text-center">
            <p className={`
              text-sm font-semibold
              ${darkTheme ? 'text-warning-400' : 'text-warning-600'}
            `}>
              {formatCurrency(displayPipeline.avgDealSize)}
            </p>
            <p className={`
              text-xs
              ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
            `}>
              Ticket Moyen
            </p>
          </div>
        </div>
      </div>

      {/* Étapes du pipeline */}
      <div className="space-y-3">
        {displayPipeline.stages.map((stage, index) => {
          const IconComponent = stage.icon
          const percentage = (stage.count / displayPipeline.totalCount) * 100

          return (
            <Link
              key={stage.id}
              to={`/leads?stage=${stage.id}`}
              className={`
                group block p-3 rounded-xl border transition-all duration-300 hover:scale-105
                ${darkTheme
                  ? `bg-dark-700/40 border-dark-600/50 hover:bg-dark-700/60 ${getStageColor(stage.color, 'border')}`
                  : `bg-white border-gray-200 hover:border-${stage.color}-300 hover:shadow-medium`
                }
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Icône avec couleur de l'étape */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                    ${getStageColor(stage.color, 'bgLight')} group-hover:${getStageColor(stage.color, 'bg')}
                  `}>
                    <IconComponent className={`
                      w-4 h-4 transition-colors duration-300
                      ${getStageColor(stage.color, 'text')} group-hover:text-white
                    `} />
                  </div>

                  {/* Informations de l'étape */}
                  <div>
                    <p className={`
                      font-medium text-sm
                      ${darkTheme ? 'text-white' : 'text-gray-900'}
                    `}>
                      {stage.name}
                    </p>
                    <p className={`
                      text-xs
                      ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
                    `}>
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Métriques */}
                <div className="text-right">
                  <p className={`
                    font-bold text-sm
                    ${darkTheme ? 'text-white' : 'text-gray-900'}
                  `}>
                    {stage.count}
                  </p>
                  <p className={`
                    text-xs font-medium
                    ${getStageColor(stage.color, 'text')}
                  `}>
                    {formatCurrency(stage.value)}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className={`
                mt-3 h-1.5 rounded-full overflow-hidden
                ${darkTheme ? 'bg-dark-600' : 'bg-gray-200'}
              `}>
                <div
                  className={`
                    h-full transition-all duration-500 rounded-full
                    ${getStageColor(stage.color, 'bg')}
                  `}
                  style={{
                    width: `${percentage}%`,
                    transitionDelay: `${index * 100 + 200}ms`
                  }}
                ></div>
              </div>

              {/* Pourcentage */}
              <div className="flex items-center justify-between mt-2">
                <span className={`
                  text-xs
                  ${darkTheme ? 'text-dark-400' : 'text-gray-500'}
                `}>
                  {percentage.toFixed(1)}% du pipeline
                </span>
                <span className={`
                  text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity
                  ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
                `}>
                  Voir détails →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Actions rapides */}
      <div className={`
        p-3 rounded-lg border border-dashed text-center
        ${darkTheme
          ? 'border-dark-600 bg-dark-700/20'
          : 'border-gray-300 bg-gray-50'
        }
      `}>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <MusicalNoteIcon className={`
            w-4 h-4
            ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
          `} />
          <span className={`
            text-sm font-medium
            ${darkTheme ? 'text-white' : 'text-gray-900'}
          `}>
            Actions Rapides
          </span>
        </div>
        <div className="flex justify-center space-x-2">
          <Link
            to="/leads/new"
            className={`
              px-3 py-1 rounded-lg text-xs font-medium transition-colors
              ${darkTheme
                ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }
            `}
          >
            + Lead
          </Link>
          <Link
            to="/reports/pipeline"
            className={`
              px-3 py-1 rounded-lg text-xs font-medium transition-colors
              ${darkTheme
                ? 'bg-secondary-500/20 text-secondary-400 hover:bg-secondary-500/30'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }
            `}
          >
            Rapport
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PipelineOverview