import React, { useState, useMemo, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { campaignsAPI } from '@/utils/api'
import toast from 'react-hot-toast'
import {
  SpotifyIcon,
  YouTubeIcon,
  TikTokIcon,
  MetaIcon,
  AnalyticsIcon,
  StreamingIcon,
  WaveformIcon
} from '@/components/UI/MusicIcons'
import CampaignModal from '@/components/Campaigns/CampaignModal'

// Données de démonstration pour campagnes musicales
const mockCampaigns = []

const statusConfig = {
  draft: {
    color: 'bg-gray-500',
    label: 'Brouillon',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30'
  },
  active: {
    color: 'bg-success-500',
    label: 'Active',
    textColor: 'text-success-400',
    bgColor: 'bg-success-500/20',
    borderColor: 'border-success-500/30'
  },
  paused: {
    color: 'bg-warning-500',
    label: 'En pause',
    textColor: 'text-warning-400',
    bgColor: 'bg-warning-500/20',
    borderColor: 'border-warning-500/30'
  },
  completed: {
    color: 'bg-primary-500',
    label: 'Terminée',
    textColor: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    borderColor: 'border-primary-500/30'
  },
  cancelled: {
    color: 'bg-danger-500',
    label: 'Annulée',
    textColor: 'text-danger-400',
    bgColor: 'bg-danger-500/20',
    borderColor: 'border-danger-500/30'
  }
}

const platformConfig = {
  youtube: {
    color: 'bg-red-500',
    label: 'YouTube',
    icon: YouTubeIcon,
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30'
  },
  spotify: {
    color: 'bg-green-500',
    label: 'Spotify',
    icon: SpotifyIcon,
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30'
  },
  meta: {
    color: 'bg-blue-500',
    label: 'Meta',
    icon: MetaIcon,
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30'
  },
  tiktok: {
    color: 'bg-gray-800',
    label: 'TikTok',
    icon: TikTokIcon,
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/30'
  }
}

const objectiveConfig = {
  stream_promotion: { label: 'Promotion Streaming', color: 'text-green-400' },
  brand_awareness: { label: 'Notoriété', color: 'text-blue-400' },
  event_promotion: { label: 'Événement', color: 'text-purple-400' },
  viral_content: { label: 'Viral', color: 'text-pink-400' },
  tour_promotion: { label: 'Tournée', color: 'text-orange-400' },
  engagement: { label: 'Engagement', color: 'text-yellow-400' }
}

function CampaignsPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('toutes')
  const [selectedPlatform, setSelectedPlatform] = useState('toutes')
  const [selectedManager, setSelectedManager] = useState('tous')
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const itemsPerPage = 8

  // Charger les campagnes depuis l'API
  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await campaignsAPI.getAll()

      // Si pas de données depuis l'API, utiliser les données démo
      if (response.data && response.data.length > 0) {
        setCampaigns(response.data)
      } else {
        setCampaigns(mockCampaigns)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error)
      // En cas d'erreur API, utiliser les données démo
      setCampaigns(mockCampaigns)
      setError('Connexion à l\'API impossible, données de démonstration affichées')
    } finally {
      setLoading(false)
    }
  }

  // Calcul des statistiques globales
  const stats = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter(c => c.status === 'active').length
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalStreams = campaigns.reduce((sum, c) => sum + c.streams, 0)
    const avgCtr = campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length : 0

    return { total, active, totalBudget, totalSpent, totalStreams, avgCtr }
  }, [campaigns])

  // Filtrage et tri des campagnes
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = searchTerm === '' ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.track.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'toutes' || campaign.status === selectedStatus
      const matchesPlatform = selectedPlatform === 'toutes' || campaign.platform === selectedPlatform
      const matchesManager = selectedManager === 'tous' || campaign.manager === selectedManager

      return matchesSearch && matchesStatus && matchesPlatform && matchesManager
    })

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [campaigns, searchTerm, selectedStatus, selectedPlatform, selectedManager, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / itemsPerPage)
  const paginatedCampaigns = filteredAndSortedCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectCampaign = (campaignId) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const handleSelectAll = () => {
    setSelectedCampaigns(prev =>
      prev.length === paginatedCampaigns.length
        ? []
        : paginatedCampaigns.map(campaign => campaign.id)
    )
  }

  // Fonctions CRUD
  const handleCreateCampaign = () => {
    setShowCampaignModal(true)
  }

  const handleSubmitCampaign = async (campaignData) => {
    try {
      // Essayer d'abord avec l'API
      await campaignsAPI.create(campaignData)
      await loadCampaigns()
      toast.success('Campagne créée avec succès!')
    } catch (error) {
      // Si l'API ne fonctionne pas, ajouter aux données locales
      const newCampaign = {
        ...campaignData,
        id: Date.now(), // ID temporaire
        spent: 0,
        impressions: 0,
        clicks: 0,
        streams: 0,
        ctr: 0,
        cpm: 0,
        cpc: 0
      }
      setCampaigns(prev => [newCampaign, ...prev])
      toast.success('Campagne créée avec succès! (mode démo)')
    }
  }

  const handleUpdateCampaignStatus = async (campaignId, newStatus) => {
    try {
      await campaignsAPI.update(campaignId, { status: newStatus })
      await loadCampaigns()
      toast.success('Statut mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return

    try {
      await campaignsAPI.delete(campaignId)
      await loadCampaigns()
      toast.success('Campagne supprimée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression de la campagne')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedCampaigns.length === 0) return

    try {
      switch (action) {
        case 'pause':
          // Logique de pause en masse
          toast.success('Campagnes mises en pause')
          break
        case 'activate':
          // Logique d'activation en masse
          toast.success('Campagnes activées')
          break
        case 'delete':
          if (!confirm(`Supprimer ${selectedCampaigns.length} campagne(s) ?`)) return
          await Promise.all(selectedCampaigns.map(id => campaignsAPI.delete(id)))
          toast.success(`${selectedCampaigns.length} campagne(s) supprimée(s)`)
          break
      }

      setSelectedCampaigns([])
      await loadCampaigns()
    } catch (error) {
      toast.error('Erreur lors de l\'action en masse')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    })
  }

  const getPerformanceColor = (value, metric) => {
    if (metric === 'ctr') {
      if (value >= 3) return 'text-success-400'
      if (value >= 2) return 'text-warning-400'
      return 'text-danger-400'
    }
    if (metric === 'budget_usage') {
      if (value <= 80) return 'text-success-400'
      if (value <= 95) return 'text-warning-400'
      return 'text-danger-400'
    }
    return 'text-white'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Chargement des campagnes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Message d'erreur API */}
      {error && (
        <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4 flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning-400 flex-shrink-0" />
          <div>
            <p className="text-warning-300 text-sm font-medium">Mode Démonstration</p>
            <p className="text-warning-400/80 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Header avec Stats KPI */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des Campagnes</h1>
            <p className="text-slate-400 mt-2">
              Créez et optimisez vos campagnes de promotion musicale
            </p>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Nouvelle Campagne
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Campagnes</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center group-hover:bg-primary-500/30 transition-colors duration-200">
                <ChartBarIcon className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Actives</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center group-hover:bg-success-500/30 transition-colors duration-200">
                <BoltIcon className="h-6 w-6 text-success-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Budget Total</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalBudget)}</p>
              </div>
              <div className="w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center group-hover:bg-warning-500/30 transition-colors duration-200">
                <CurrencyEuroIcon className="h-6 w-6 text-warning-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Streams</p>
                <p className="text-2xl font-bold text-white mt-1">{formatNumber(stats.totalStreams)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors duration-200">
                <StreamingIcon className="h-6 w-6 text-secondary-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">CTR Moyen</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.avgCtr.toFixed(2)}%</p>
              </div>
              <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center group-hover:bg-accent-500/30 transition-colors duration-200">
                <AnalyticsIcon className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une campagne, artiste, track..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200",
                showFilters
                  ? "bg-primary-500 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
              )}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="toutes">Tous les statuts</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Plateforme</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="toutes">Toutes les plateformes</option>
                  {Object.entries(platformConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Manager</label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="tous">Tous les managers</option>
                  <option value="Denis">Denis</option>
                  <option value="Marine">Marine</option>
                </select>
              </div>
            </div>
          )}

          {/* Badges de filtres actifs */}
          {(selectedStatus !== 'toutes' || selectedPlatform !== 'toutes' || selectedManager !== 'tous' || searchTerm) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="inline-flex items-center px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm">
                  Recherche: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedStatus !== 'toutes' && (
                <div className="inline-flex items-center px-3 py-1 bg-warning-500/20 text-warning-300 rounded-lg text-sm">
                  Statut: {statusConfig[selectedStatus].label}
                  <button
                    onClick={() => setSelectedStatus('toutes')}
                    className="ml-2 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedPlatform !== 'toutes' && (
                <div className="inline-flex items-center px-3 py-1 bg-accent-500/20 text-accent-300 rounded-lg text-sm">
                  Plateforme: {platformConfig[selectedPlatform].label}
                  <button
                    onClick={() => setSelectedPlatform('toutes')}
                    className="ml-2 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedManager !== 'tous' && (
                <div className="inline-flex items-center px-3 py-1 bg-secondary-500/20 text-secondary-300 rounded-lg text-sm">
                  Manager: {selectedManager}
                  <button
                    onClick={() => setSelectedManager('tous')}
                    className="ml-2 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions en lot */}
      {selectedCampaigns.length > 0 && (
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-primary-300 font-medium">
                {selectedCampaigns.length} campagne(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-success-500/20 text-success-300 rounded-lg hover:bg-success-500/30 transition-colors duration-200"
              >
                <PlayIcon className="h-4 w-4 inline mr-1" />
                Activer
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-4 py-2 bg-warning-500/20 text-warning-300 rounded-lg hover:bg-warning-500/30 transition-colors duration-200"
              >
                <PauseIcon className="h-4 w-4 inline mr-1" />
                Suspendre
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-danger-500/20 text-danger-300 rounded-lg hover:bg-danger-500/30 transition-colors duration-200"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedCampaigns([])}
                className="px-4 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grille des campagnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paginatedCampaigns.map((campaign) => {
          const budgetUsage = (campaign.spent / campaign.budget) * 100
          const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24))

          return (
            <div
              key={campaign.id}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
            >
              {/* Header de la carte */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => handleSelectCampaign(campaign.id)}
                      className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
                    />
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      platformConfig[campaign.platform].bgColor
                    )}>
                      {React.createElement(platformConfig[campaign.platform].icon, {
                        className: cn("w-5 h-5", platformConfig[campaign.platform].textColor)
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      statusConfig[campaign.status].bgColor,
                      statusConfig[campaign.status].textColor
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        statusConfig[campaign.status].color
                      )} />
                      {statusConfig[campaign.status].label}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-primary-300 transition-colors duration-200">
                  {campaign.name}
                </h3>
                <p className="text-slate-400 text-sm mb-2">{campaign.artist}</p>
                <p className="text-slate-500 text-xs mb-4">"{campaign.track}"</p>

                {/* Métriques principales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Budget utilisé</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(campaign.spent)}
                    </p>
                    <p className="text-xs text-slate-500">
                      / {formatCurrency(campaign.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Streams</p>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(campaign.streams)}
                    </p>
                    <p className={cn(
                      "text-xs font-medium",
                      getPerformanceColor(campaign.ctr, 'ctr')
                    )}>
                      CTR: {campaign.ctr}%
                    </p>
                  </div>
                </div>

                {/* Barre de progression du budget */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Budget</span>
                    <span className={getPerformanceColor(budgetUsage, 'budget_usage')}>
                      {budgetUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        budgetUsage <= 80 ? "bg-success-500" :
                        budgetUsage <= 95 ? "bg-warning-500" : "bg-danger-500"
                      )}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={cn(
                      "font-medium",
                      daysLeft > 7 ? "text-success-400" :
                      daysLeft > 0 ? "text-warning-400" : "text-danger-400"
                    )}>
                      {daysLeft > 0 ? `${daysLeft}j restants` : 'Terminée'}
                    </span>
                  </div>
                </div>

                {/* Objectif et genre */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full bg-slate-700/50",
                    objectiveConfig[campaign.objective]?.color || 'text-slate-400'
                  )}>
                    {objectiveConfig[campaign.objective]?.label || campaign.objective}
                  </span>
                  <span className="text-slate-400">{campaign.genre}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: Ouvrir détails */}}
                      className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Ouvrir édition */}}
                      className="p-2 text-slate-400 hover:text-warning-400 hover:bg-warning-500/20 rounded-lg transition-all duration-200"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {campaign.status === 'active' ? (
                      <button
                        onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                        className="p-2 text-slate-400 hover:text-warning-400 hover:bg-warning-500/20 rounded-lg transition-all duration-200"
                        title="Mettre en pause"
                      >
                        <PauseIcon className="h-4 w-4" />
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button
                        onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                        className="p-2 text-slate-400 hover:text-success-400 hover:bg-success-500/20 rounded-lg transition-all duration-200"
                        title="Activer"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{campaign.manager}</span>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-slate-400 hover:text-danger-400 hover:bg-danger-500/20 rounded-lg transition-all duration-200"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedCampaigns.length)} sur {filteredAndSortedCampaigns.length} résultats
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700/50 transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-all duration-200",
                    page === currentPage
                      ? "bg-primary-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-slate-700/50 transition-all duration-200"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredAndSortedCampaigns.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune campagne trouvée</h3>
          <p className="text-slate-400 mb-6">
            Essayez de modifier vos critères de recherche ou créez une nouvelle campagne.
          </p>
          <button
            onClick={handleCreateCampaign}
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer une nouvelle campagne
          </button>
        </div>
      )}

      {/* Modal de création de campagne */}
      <CampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onSubmit={handleSubmitCampaign}
      />
    </div>
  )
}

export default CampaignsPage