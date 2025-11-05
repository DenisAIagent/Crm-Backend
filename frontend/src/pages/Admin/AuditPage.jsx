import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import {
  ClockIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  KeyIcon,
  CogIcon,
  BoltIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import {
  SpotifyIcon,
  YouTubeIcon,
  TikTokIcon,
  MetaIcon,
  AnalyticsIcon,
  StreamingIcon,
  WaveformIcon,
  VinylIcon
} from '@/components/UI/MusicIcons'
import { auditAPI } from '@/utils/api'

const actionConfig = {
  LOGIN: {
    label: 'Connexion',
    color: 'blue',
    icon: LockClosedIcon,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  LOGOUT: {
    label: 'Déconnexion',
    color: 'gray',
    icon: LockClosedIcon,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  },
  CREATE: {
    label: 'Création',
    color: 'green',
    icon: PlusIcon,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  UPDATE: {
    label: 'Modification',
    color: 'amber',
    icon: PencilIcon,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  DELETE: {
    label: 'Suppression',
    color: 'red',
    icon: TrashIcon,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  VIEW: {
    label: 'Consultation',
    color: 'cyan',
    icon: EyeIcon,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  EXPORT: {
    label: 'Export',
    color: 'purple',
    icon: ArrowDownTrayIcon,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  ADMIN: {
    label: 'Administration',
    color: 'rose',
    icon: ShieldCheckIcon,
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  }
}

const levelConfig = {
  INFO: {
    label: 'Information',
    color: 'blue',
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  WARNING: {
    label: 'Avertissement',
    color: 'amber',
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  ERROR: {
    label: 'Erreur',
    color: 'red',
    icon: XCircleIcon,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  SUCCESS: {
    label: 'Succès',
    color: 'green',
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  SECURITY: {
    label: 'Sécurité',
    color: 'purple',
    icon: ShieldCheckIcon,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
}

function AuditPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState('7')
  const [actionFilter, setActionFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch audit data from API with comprehensive music industry logs
  const { data: auditData, isLoading } = useQuery(
    ['audit', 'logs', { dateRange, actionFilter, levelFilter, userFilter, searchTerm }],
    () => auditAPI.getLogs({
      days: dateRange,
      action: actionFilter,
      level: levelFilter,
      user: userFilter,
      search: searchTerm
    }),
    {
      initialData: {
        logs: [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            user: { name: 'Denis Adam', email: 'denis@mdmc-music-ads.com', avatar: null },
            action: 'LOGIN',
            resource: 'Authentication',
            resourceId: null,
            details: 'Connexion administrateur réussie depuis Mac OS (Chrome)',
            level: 'SUCCESS',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            metadata: {
              platform: 'web',
              sessionId: 'sess_12345',
              location: 'Paris, France'
            }
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            user: { name: 'Sarah Martinez', email: 'sarah@mdmc-music-ads.com', avatar: null },
            action: 'CREATE',
            resource: 'Campaign',
            resourceId: 'camp_789',
            details: 'Création campagne Spotify "Summer Vibes 2025" - Budget: 15K€',
            level: 'INFO',
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            metadata: {
              campaignType: 'spotify',
              budget: 15000,
              targetAudience: '18-35',
              genre: 'Pop'
            }
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            user: { name: 'Thomas Chen', email: 'thomas@mdmc-music-ads.com', avatar: null },
            action: 'UPDATE',
            resource: 'Lead',
            resourceId: 'lead_456',
            details: 'Mise à jour lead artiste "Luna Park" - Status: Prospect → Client',
            level: 'INFO',
            ipAddress: '192.168.1.108',
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
            metadata: {
              leadType: 'artist',
              previousStatus: 'prospect',
              newStatus: 'client',
              revenue: 8500
            }
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            user: { name: 'Lisa Johnson', email: 'lisa@mdmc-music-ads.com', avatar: null },
            action: 'VIEW',
            resource: 'Analytics',
            resourceId: 'dashboard',
            details: 'Consultation dashboard analytics - Période: 30 derniers jours',
            level: 'INFO',
            ipAddress: '192.168.1.112',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            metadata: {
              reportType: 'dashboard',
              period: '30days',
              metrics: ['revenue', 'streams', 'conversions']
            }
          },
          {
            id: 5,
            timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            user: { name: 'Alex Rodriguez', email: 'alex@mdmc-music-ads.com', avatar: null },
            action: 'EXPORT',
            resource: 'Campaign',
            resourceId: 'multiple',
            details: 'Export CSV des performances campagnes TikTok Q1 2025',
            level: 'INFO',
            ipAddress: '192.168.1.115',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            metadata: {
              exportFormat: 'csv',
              recordCount: 147,
              platforms: ['tiktok'],
              period: 'Q1-2025'
            }
          },
          {
            id: 6,
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user: { name: 'Emma Wilson', email: 'emma@mdmc-music-ads.com', avatar: null },
            action: 'LOGIN',
            resource: 'Authentication',
            resourceId: null,
            details: 'Tentative de connexion échouée - Mot de passe incorrect',
            level: 'WARNING',
            ipAddress: '192.168.1.120',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            metadata: {
              attemptNumber: 2,
              reason: 'invalid_password',
              remainingAttempts: 3
            }
          },
          {
            id: 7,
            timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
            user: { name: 'Denis Adam', email: 'denis@mdmc-music-ads.com', avatar: null },
            action: 'DELETE',
            resource: 'User',
            resourceId: 'user_inactive_001',
            details: 'Suppression compte utilisateur inactif "test@example.com"',
            level: 'WARNING',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            metadata: {
              reason: 'account_cleanup',
              lastLogin: '2024-06-15',
              dataRetention: 'anonymized'
            }
          },
          {
            id: 8,
            timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
            user: { name: 'System', email: 'system@mdmc-music-ads.com', avatar: null },
            action: 'ADMIN',
            resource: 'Database',
            resourceId: 'backup_daily',
            details: 'Sauvegarde automatique base de données - 2.4GB sauvegardés',
            level: 'SUCCESS',
            ipAddress: 'localhost',
            userAgent: 'MDMC-CRM-Cron/1.0',
            metadata: {
              backupSize: '2.4GB',
              duration: '12.3s',
              destination: 's3://mdmc-backups/',
              integrity: 'verified'
            }
          },
          {
            id: 9,
            timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            user: { name: 'Sarah Martinez', email: 'sarah@mdmc-music-ads.com', avatar: null },
            action: 'UPDATE',
            resource: 'Campaign',
            resourceId: 'camp_spotify_winter',
            details: 'Optimisation campagne Spotify "Winter Hits" - CPC réduit de 0.15€',
            level: 'SUCCESS',
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            metadata: {
              platform: 'spotify',
              oldCPC: 0.45,
              newCPC: 0.30,
              expectedSavings: '2.1K€/month'
            }
          },
          {
            id: 10,
            timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
            user: { name: 'API Client', email: 'api@spotify.com', avatar: null },
            action: 'VIEW',
            resource: 'Integration',
            resourceId: 'spotify_api',
            details: 'Synchronisation données Spotify API - 1,247 artistes mis à jour',
            level: 'INFO',
            ipAddress: '35.185.44.232',
            userAgent: 'Spotify-Platform/2.1.0',
            metadata: {
              apiVersion: 'v1',
              recordsUpdated: 1247,
              syncDuration: '45.2s',
              dataTypes: ['artists', 'albums', 'tracks']
            }
          }
        ],
        total: 10,
        summary: {
          totalEvents: 10,
          byLevel: {
            INFO: 5,
            SUCCESS: 3,
            WARNING: 2,
            ERROR: 0,
            SECURITY: 0
          },
          byAction: {
            LOGIN: 2,
            CREATE: 1,
            UPDATE: 3,
            DELETE: 1,
            VIEW: 2,
            EXPORT: 1,
            ADMIN: 1
          },
          mostActiveUsers: [
            { name: 'Denis Adam', count: 3 },
            { name: 'Sarah Martinez', count: 2 },
            { name: 'Thomas Chen', count: 1 }
          ]
        }
      }
    }
  )

  // Filter logs based on search and filters
  const filteredLogs = auditData?.logs?.filter(log => {
    const matchesSearch = !searchTerm ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = !actionFilter || log.action === actionFilter
    const matchesLevel = !levelFilter || log.level === levelFilter
    const matchesUser = !userFilter || log.user.email === userFilter

    return matchesSearch && matchesAction && matchesLevel && matchesUser
  }) || []

  const getActionIcon = (action) => {
    const config = actionConfig[action] || actionConfig.VIEW
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  const getLevelIcon = (level) => {
    const config = levelConfig[level] || levelConfig.INFO
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  const getResourceIcon = (resource) => {
    const icons = {
      Authentication: LockClosedIcon,
      Campaign: BoltIcon,
      Lead: UserIcon,
      Analytics: AnalyticsIcon,
      User: UserIcon,
      Database: CogIcon,
      Integration: StreamingIcon
    }
    const Icon = icons[resource] || DocumentTextIcon
    return <Icon className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Audit & Logs - MDMC Music Ads CRM</title>
      </Helmet>

      {/* Musical Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-8 opacity-5">
          <ShieldCheckIcon className="w-28 h-28 text-purple-400 animate-pulse" />
        </div>
        <div className="absolute top-32 right-16 opacity-5">
          <DocumentTextIcon className="w-24 h-24 text-cyan-400 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute bottom-32 left-16 opacity-5">
          <EyeIcon className="w-32 h-32 text-violet-400 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Audit & Logs Sécurité
              </h1>
              <p className="text-slate-600 text-lg">
                Surveillance et traçabilité des activités système
              </p>
            </div>

            <button className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 mt-4 sm:mt-0">
              <ArrowDownTrayIcon className="w-5 h-5 group-hover:animate-pulse" />
              Exporter les logs
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Événements</p>
                  <p className="text-3xl font-bold text-slate-900">{auditData?.summary?.totalEvents || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Succès</p>
                  <p className="text-3xl font-bold text-green-600">
                    {auditData?.summary?.byLevel?.SUCCESS || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avertissements</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {auditData?.summary?.byLevel?.WARNING || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Erreurs</p>
                  <p className="text-3xl font-bold text-red-600">
                    {auditData?.summary?.byLevel?.ERROR || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-xl">
                  <XCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="1">Dernière heure</option>
                <option value="24">24 dernières heures</option>
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">3 derniers mois</option>
              </select>

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="">Toutes les actions</option>
                {Object.entries(actionConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="">Tous les niveaux</option>
                {Object.entries(levelConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>

              {/* User Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="">Tous les utilisateurs</option>
                {auditData?.summary?.mostActiveUsers?.map((user) => (
                  <option key={user.name} value={user.name}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Timestamp</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Utilisateur</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Action</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Ressource</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Détails</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Niveau</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const actionConf = actionConfig[log.action] || actionConfig.VIEW
                    const levelConf = levelConfig[log.level] || levelConfig.INFO

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="font-medium text-slate-900">
                              {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-slate-600">
                              {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {log.user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{log.user.name}</div>
                              <div className="text-sm text-slate-600">{log.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${actionConf.bgColor} ${actionConf.textColor} ${actionConf.borderColor} border`}>
                            {getActionIcon(log.action)}
                            {actionConf.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(log.resource)}
                            <span className="font-medium text-slate-700">{log.resource}</span>
                            {log.resourceId && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {log.resourceId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-md">
                          <div className="text-sm text-slate-700 truncate" title={log.details}>
                            {log.details}
                          </div>
                          {log.metadata && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(log.metadata).slice(0, 2).map(([key, value]) => (
                                <span key={key} className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${levelConf.bgColor} ${levelConf.textColor}`}>
                            {getLevelIcon(log.level)}
                            {levelConf.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-600 font-mono">
                            {log.ipAddress}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun log trouvé</h3>
                <p className="text-slate-500">Aucun événement ne correspond à vos critères de recherche.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Surveillance active</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <span className="text-sm text-slate-600">
                {filteredLogs.length} événement{filteredLogs.length > 1 ? 's' : ''} affiché{filteredLogs.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuditPage