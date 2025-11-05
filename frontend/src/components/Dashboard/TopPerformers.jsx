import React from 'react'
import { Link } from 'react-router-dom'
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  SparklesIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'

function TopPerformers({
  performers = [],
  loading = false,
  userRole = 'agent',
  className = '',
  darkTheme = false
}) {
  // Données de démonstration si pas de performers
  const defaultPerformers = [
    {
      id: 1,
      name: 'Denis Adam',
      role: 'Music Industry Expert',
      avatar: null,
      stats: {
        leadsGenerated: 45,
        conversionRate: 32.5,
        revenue: 89500,
        campaigns: 12,
        satisfaction: 4.8,
        streamsGenerated: 2500000,
        topChart: '#3 on Spotify France'
      },
      badges: ['top_closer', 'revenue_leader', 'stream_king'],
      trend: 'up',
      change: '+15%',
      specialties: ['Hip-Hop', 'R&B', 'Trap'],
      platforms: ['spotify', 'youtube', 'tiktok']
    },
    {
      id: 2,
      name: 'Marine Dubois',
      role: 'Digital Music Strategist',
      avatar: null,
      stats: {
        leadsGenerated: 38,
        conversionRate: 28.9,
        revenue: 72300,
        campaigns: 18,
        satisfaction: 4.6,
        streamsGenerated: 1800000,
        topChart: 'Top 10 Discovery Weekly'
      },
      badges: ['campaign_expert', 'creative_star', 'viral_master'],
      trend: 'up',
      change: '+8%',
      specialties: ['Pop', 'Indie', 'Electronic'],
      platforms: ['youtube', 'instagram', 'tiktok']
    },
    {
      id: 3,
      name: 'Alex Martin',
      role: 'Artist Development Specialist',
      avatar: null,
      stats: {
        leadsGenerated: 28,
        conversionRate: 25.2,
        revenue: 56800,
        campaigns: 9,
        satisfaction: 4.4,
        streamsGenerated: 950000,
        topChart: 'Rising on Apple Music'
      },
      badges: ['rising_star', 'underground_hero'],
      trend: 'up',
      change: '+22%',
      specialties: ['Rock', 'Metal', 'Alternative'],
      platforms: ['spotify', 'apple', 'bandcamp']
    }
  ]

  const displayPerformers = performers.length > 0 ? performers : defaultPerformers

  const getBadgeConfig = (badge) => {
    const badges = {
      top_closer: {
        label: 'Top Closer',
        icon: TrophyIconSolid,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/20'
      },
      revenue_leader: {
        label: 'Revenue Leader',
        icon: CurrencyEuroIcon,
        color: 'text-green-400',
        bg: 'bg-green-500/20'
      },
      campaign_expert: {
        label: 'Campaign Expert',
        icon: ChartBarIcon,
        color: 'text-blue-400',
        bg: 'bg-blue-500/20'
      },
      creative_star: {
        label: 'Creative Star',
        icon: SparklesIcon,
        color: 'text-purple-400',
        bg: 'bg-purple-500/20'
      },
      rising_star: {
        label: 'Rising Star',
        icon: StarIconSolid,
        color: 'text-pink-400',
        bg: 'bg-pink-500/20'
      },
      stream_king: {
        label: 'Stream King',
        icon: MusicalNoteIcon,
        color: 'text-violet-400',
        bg: 'bg-violet-500/20'
      },
      viral_master: {
        label: 'Viral Master',
        icon: FireIcon,
        color: 'text-orange-400',
        bg: 'bg-orange-500/20'
      },
      underground_hero: {
        label: 'Underground Hero',
        icon: UserCircleIcon,
        color: 'text-gray-400',
        bg: 'bg-gray-500/20'
      }
    }
    return badges[badge] || badges.rising_star
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRankIcon = (index) => {
    if (index === 0) return <TrophyIconSolid className="w-4 h-4 text-yellow-400" />
    if (index === 1) return <StarIconSolid className="w-4 h-4 text-gray-300" />
    if (index === 2) return <StarIconSolid className="w-4 h-4 text-amber-600" />
    return <span className="text-sm font-bold text-dark-400">#{index + 1}</span>
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              p-4 rounded-lg animate-pulse
              ${darkTheme ? 'bg-dark-700/50' : 'bg-gray-100'}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-full
                ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
              `}></div>
              <div className="flex-1 space-y-2">
                <div className={`
                  h-4 rounded w-32
                  ${darkTheme ? 'bg-dark-600' : 'bg-gray-300'}
                `}></div>
                <div className={`
                  h-3 rounded w-24
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
    <div className={`space-y-4 ${className}`}>
      {/* Classement */}
      <div className="space-y-3">
        {displayPerformers.map((performer, index) => (
          <div
            key={performer.id}
            className={`
              group relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]
              ${darkTheme
                ? 'bg-dark-700/40 border-dark-600/50 hover:bg-dark-700/60'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-medium'
              }
              ${index === 0 ? 'ring-2 ring-yellow-400/20' : ''}
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Badge de rang */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              {getRankIcon(index)}
            </div>

            {/* Gradient overlay pour le premier */}
            {index === 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-xl"></div>
            )}

            <div className="relative">
              {/* En-tête performer */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                      : 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    }
                  `}>
                    {performer.avatar ? (
                      <img
                        src={performer.avatar}
                        alt={performer.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(performer.name)
                    )}
                  </div>

                  {/* Info performer */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`
                        font-semibold text-sm
                        ${darkTheme ? 'text-white' : 'text-gray-900'}
                      `}>
                        {performer.name}
                      </h4>
                      {performer.trend === 'up' && (
                        <div className="flex items-center text-xs text-green-400">
                          <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                          {performer.change}
                        </div>
                      )}
                    </div>
                    <p className={`
                      text-xs
                      ${darkTheme ? 'text-dark-300' : 'text-gray-500'}
                    `}>
                      {performer.role}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex space-x-1">
                  {performer.badges.slice(0, 2).map((badge, badgeIndex) => {
                    const badgeConfig = getBadgeConfig(badge)
                    const BadgeIcon = badgeConfig.icon

                    return (
                      <div
                        key={badge}
                        className={`
                          w-6 h-6 rounded-lg flex items-center justify-center
                          ${badgeConfig.bg}
                        `}
                        title={badgeConfig.label}
                      >
                        <BadgeIcon className={`w-3 h-3 ${badgeConfig.color}`} />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Statistiques principales */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={`
                  p-2 rounded-lg text-center
                  ${darkTheme ? 'bg-dark-600/50' : 'bg-gray-50'}
                `}>
                  <p className={`
                    text-lg font-bold
                    ${darkTheme ? 'text-white' : 'text-gray-900'}
                  `}>
                    {performer.stats.leadsGenerated}
                  </p>
                  <p className={`
                    text-xs
                    ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
                  `}>
                    Leads
                  </p>
                </div>

                <div className={`
                  p-2 rounded-lg text-center
                  ${darkTheme ? 'bg-dark-600/50' : 'bg-gray-50'}
                `}>
                  <p className={`
                    text-lg font-bold text-accent-400
                  `}>
                    {performer.stats.conversionRate}%
                  </p>
                  <p className={`
                    text-xs
                    ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
                  `}>
                    Conversion
                  </p>
                </div>
              </div>

              {/* Revenus et campagnes */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`
                    text-sm font-semibold
                    ${darkTheme ? 'text-primary-400' : 'text-primary-600'}
                  `}>
                    {formatCurrency(performer.stats.revenue)}
                  </p>
                  <p className={`
                    text-xs
                    ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
                  `}>
                    Revenus générés
                  </p>
                </div>

                <div className="text-right">
                  <p className={`
                    text-sm font-semibold
                    ${darkTheme ? 'text-secondary-400' : 'text-secondary-600'}
                  `}>
                    {performer.stats.campaigns}
                  </p>
                  <p className={`
                    text-xs
                    ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
                  `}>
                    Campagnes
                  </p>
                </div>
              </div>

              {/* Spécialités musicales */}
              <div className="space-y-3 mb-3">
                <div className="flex flex-wrap gap-1">
                  {performer.specialties.map((specialty, specIndex) => (
                    <span
                      key={specIndex}
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm
                        ${darkTheme
                          ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30'
                          : 'bg-primary-100 text-primary-600'
                        }
                      `}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Plateformes musicales */}
                {performer.platforms && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Plateformes:</span>
                    <div className="flex space-x-1">
                      {performer.platforms.map((platform, platIndex) => {
                        const platformColors = {
                          spotify: 'bg-green-500/20 text-green-400',
                          youtube: 'bg-red-500/20 text-red-400',
                          tiktok: 'bg-gray-500/20 text-gray-300',
                          apple: 'bg-gray-500/20 text-gray-300',
                          instagram: 'bg-pink-500/20 text-pink-400',
                          bandcamp: 'bg-cyan-500/20 text-cyan-400'
                        }
                        return (
                          <span
                            key={platIndex}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              platformColors[platform] || 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {platform}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Statistiques de streaming */}
                {performer.stats.streamsGenerated && (
                  <div className="text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <MusicalNoteIcon className="w-3 h-3" />
                      <span>{(performer.stats.streamsGenerated / 1000000).toFixed(1)}M streams générés</span>
                    </span>
                    {performer.stats.topChart && (
                      <span className="text-xs text-amber-400 mt-1 block">
                        {performer.stats.topChart}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Satisfaction client */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  <span className={`
                    text-sm font-medium
                    ${darkTheme ? 'text-white' : 'text-gray-900'}
                  `}>
                    {performer.stats.satisfaction}/5
                  </span>
                  <span className={`
                    text-xs
                    ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
                  `}>
                    Satisfaction
                  </span>
                </div>

                {userRole === 'admin' && (
                  <Link
                    to={`/team/${performer.id}`}
                    className={`
                      text-xs font-medium transition-colors
                      ${darkTheme
                        ? 'text-primary-400 hover:text-primary-300'
                        : 'text-primary-600 hover:text-primary-700'
                      }
                    `}
                  >
                    Détails →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer avec actions */}
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
            Équipe MDMC
          </span>
        </div>

        {userRole === 'admin' && (
          <div className="flex justify-center space-x-2">
            <Link
              to="/team/performance"
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-colors
                ${darkTheme
                  ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                }
              `}
            >
              Rapport Équipe
            </Link>
            <Link
              to="/team/leaderboard"
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-colors
                ${darkTheme
                  ? 'bg-secondary-500/20 text-secondary-400 hover:bg-secondary-500/30'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }
              `}
            >
              Classement
            </Link>
          </div>
        )}

        {userRole !== 'admin' && (
          <p className={`
            text-xs
            ${darkTheme ? 'text-dark-300' : 'text-gray-600'}
          `}>
            Continuez vos efforts pour gravir le classement !
          </p>
        )}
      </div>
    </div>
  )
}

export default TopPerformers