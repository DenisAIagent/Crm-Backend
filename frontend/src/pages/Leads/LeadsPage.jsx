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
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'
import { leadsAPI } from '@/utils/api'
import toast from 'react-hot-toast'
import {
  SpotifyIcon,
  YouTubeIcon,
  TikTokIcon,
  MetaIcon,
  MicrophoneIcon,
  WaveformIcon,
  AnalyticsIcon,
  StreamingIcon
} from '@/components/UI/MusicIcons'
import KanbanBoard from './KanbanBoard'
import LeadModal from '@/components/Leads/LeadModal'
import { ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline'

// Data démo réaliste avec noms d'artistes crédibles
const mockLeads = []

const statusConfig = {
  nouveau: {
    color: 'bg-primary-500',
    label: 'Nouveau',
    textColor: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    borderColor: 'border-primary-500/30'
  },
  contacté: {
    color: 'bg-warning-500',
    label: 'Contacté',
    textColor: 'text-warning-400',
    bgColor: 'bg-warning-500/20',
    borderColor: 'border-warning-500/30'
  },
  qualifié: {
    color: 'bg-accent-500',
    label: 'Qualifié',
    textColor: 'text-accent-400',
    bgColor: 'bg-accent-500/20',
    borderColor: 'border-accent-500/30'
  },
  proposition: {
    color: 'bg-secondary-500',
    label: 'Proposition',
    textColor: 'text-secondary-400',
    bgColor: 'bg-secondary-500/20',
    borderColor: 'border-secondary-500/30'
  },
  négociation: {
    color: 'bg-orange-500',
    label: 'Négociation',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  gagné: {
    color: 'bg-success-500',
    label: 'Gagné',
    textColor: 'text-success-400',
    bgColor: 'bg-success-500/20',
    borderColor: 'border-success-500/30'
  },
  perdu: {
    color: 'bg-danger-500',
    label: 'Perdu',
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

function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('tous')
  const [selectedPlatform, setSelectedPlatform] = useState('toutes')
  const [selectedAssignee, setSelectedAssignee] = useState('tous')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' ou 'kanban'
  const itemsPerPage = 10

  // Charger les leads depuis l'API
  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leadsAPI.getAll()

      // Si pas de données depuis l'API, utiliser les données démo
      if (response.data && response.data.length > 0) {
        setLeads(response.data)
      } else {
        setLeads(mockLeads)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des leads:', error)
      // En cas d'erreur API, utiliser les données démo
      setLeads(mockLeads)
      setError('Connexion à l\'API impossible, données de démonstration affichées')
    } finally {
      setLoading(false)
    }
  }

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = leads.length
    const nouveau = leads.filter(lead => lead.status === 'nouveau').length
    const convertis = leads.filter(lead => lead.status === 'gagné').length
    const enCours = leads.filter(lead => ['contacté', 'qualifié', 'proposition', 'négociation'].includes(lead.status)).length
    const revenue = leads.filter(lead => lead.status === 'gagné').reduce((sum, lead) => sum + lead.budget, 0)

    return { total, nouveau, convertis, enCours, revenue }
  }, [leads])

  // Filtrage et tri des leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = searchTerm === '' ||
        lead.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.genre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'tous' || lead.status === selectedStatus
      const matchesPlatform = selectedPlatform === 'toutes' || lead.platform === selectedPlatform
      const matchesAssignee = selectedAssignee === 'tous' || lead.assignedTo === selectedAssignee

      return matchesSearch && matchesStatus && matchesPlatform && matchesAssignee
    })

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastActivity') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [leads, searchTerm, selectedStatus, selectedPlatform, selectedAssignee, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage)
  const paginatedLeads = filteredAndSortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    setSelectedLeads(prev =>
      prev.length === paginatedLeads.length
        ? []
        : paginatedLeads.map(lead => lead.id)
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Fonctions CRUD
  const handleCreateLead = () => {
    setShowCreateModal(true)
  }

  const handleSaveLead = async (leadData) => {
    try {
      await leadsAPI.create(leadData)
      await loadLeads()
      setShowCreateModal(false)
      toast.success('Lead créé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la création du lead')
      console.error('Error creating lead:', error)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return

    try {
      await leadsAPI.delete(leadId)
      await loadLeads()
      toast.success('Lead supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression du lead')
    }
  }

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await leadsAPI.update(leadId, { status: newStatus })
      await loadLeads()
      toast.success('Statut mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedLeads.length === 0) return

    try {
      switch (action) {
        case 'delete':
          if (!confirm(`Supprimer ${selectedLeads.length} lead(s) ?`)) return
          await Promise.all(selectedLeads.map(id => leadsAPI.delete(id)))
          toast.success(`${selectedLeads.length} lead(s) supprimé(s)`)
          break
        case 'assign':
          // Logique d'assignation en masse
          break
      }

      setSelectedLeads([])
      await loadLeads()
    } catch (error) {
      toast.error('Erreur lors de l\'action en masse')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Chargement des leads...</p>
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
            <h1 className="text-3xl font-bold text-white">Gestion des Leads</h1>
            <p className="text-slate-400 mt-2">
              Suivez et convertissez vos prospects musicaux en clients
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle de vue */}
            <div className="flex items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                  viewMode === 'list'
                    ? "bg-primary-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <ListBulletIcon className="h-4 w-4 mr-2" />
                Liste
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                  viewMode === 'kanban'
                    ? "bg-primary-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <ViewColumnsIcon className="h-4 w-4 mr-2" />
                Kanban
              </button>
            </div>
            <button
              onClick={handleCreateLead}
              className="group flex items-center px-6 py-3 border rounded-xl transition-all duration-300 hover:scale-105 text-white font-semibold"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.1)'
                e.currentTarget.style.borderColor = '#e50914'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau Lead
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center group-hover:bg-primary-500/30 transition-colors duration-200">
                <MicrophoneIcon className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Nouveaux</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.nouveau}</p>
              </div>
              <div className="w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center group-hover:bg-warning-500/30 transition-colors duration-200">
                <ClockIcon className="h-6 w-6 text-warning-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">En Cours</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.enCours}</p>
              </div>
              <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center group-hover:bg-accent-500/30 transition-colors duration-200">
                <WaveformIcon className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Convertis</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.convertis}</p>
              </div>
              <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center group-hover:bg-success-500/30 transition-colors duration-200">
                <StreamingIcon className="h-6 w-6 text-success-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Revenus</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors duration-200">
                <AnalyticsIcon className="h-6 w-6 text-secondary-400" />
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
                placeholder="Rechercher un artiste, email, genre..."
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
                  <option value="tous">Tous les statuts</option>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Assigné à</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="tous">Tous les assignés</option>
                  <option value="Denis">Denis</option>
                  <option value="Marine">Marine</option>
                </select>
              </div>
            </div>
          )}

          {/* Badges de filtres actifs */}
          {(selectedStatus !== 'tous' || selectedPlatform !== 'toutes' || selectedAssignee !== 'tous' || searchTerm) && (
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
              {selectedStatus !== 'tous' && (
                <div className="inline-flex items-center px-3 py-1 bg-warning-500/20 text-warning-300 rounded-lg text-sm">
                  Statut: {statusConfig[selectedStatus].label}
                  <button
                    onClick={() => setSelectedStatus('tous')}
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
              {selectedAssignee !== 'tous' && (
                <div className="inline-flex items-center px-3 py-1 bg-secondary-500/20 text-secondary-300 rounded-lg text-sm">
                  Assigné: {selectedAssignee}
                  <button
                    onClick={() => setSelectedAssignee('tous')}
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
      {selectedLeads.length > 0 && (
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-primary-300 font-medium">
                {selectedLeads.length} lead(s) sélectionné(s)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('assign')}
                className="px-4 py-2 bg-warning-500/20 text-warning-300 rounded-lg hover:bg-warning-500/30 transition-colors duration-200"
              >
                Assigner
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-danger-500/20 text-danger-300 rounded-lg hover:bg-danger-500/30 transition-colors duration-200"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedLeads([])}
                className="px-4 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table des Leads */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* En-tête de table */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Leads ({filteredAndSortedLeads.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                {selectedLeads.length === paginatedLeads.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            </div>
          </div>
        </div>

        {/* Vue conditionnelle : Liste ou Kanban */}
        {viewMode === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <>
            {/* Table responsive - Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white group"
                      onClick={() => handleSort('artistName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Artiste</span>
                        {sortConfig.key === 'artistName' && (
                          sortConfig.direction === 'asc' ?
                            <ArrowUpIcon className="h-4 w-4" /> :
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Plateforme
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Statut</span>
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ?
                            <ArrowUpIcon className="h-4 w-4" /> :
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Assigné
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('budget')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Budget</span>
                        {sortConfig.key === 'budget' && (
                          sortConfig.direction === 'asc' ?
                            <ArrowUpIcon className="h-4 w-4" /> :
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('lastActivity')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Dernière Activité</span>
                        {sortConfig.key === 'lastActivity' && (
                          sortConfig.direction === 'asc' ?
                            <ArrowUpIcon className="h-4 w-4" /> :
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-700/30 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(lead.artistName)}
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-primary-300 transition-colors duration-200">
                              {lead.artistName}
                            </div>
                            <div className="text-sm text-slate-400">{lead.genre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">{lead.email}</div>
                          <div className="text-slate-400">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            platformConfig[lead.platform].bgColor
                          )}>
                            {React.createElement(platformConfig[lead.platform].icon, {
                              className: cn("w-4 h-4", platformConfig[lead.platform].textColor)
                            })}
                          </div>
                          <span className="text-white text-sm">
                            {platformConfig[lead.platform].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                          statusConfig[lead.status].bgColor,
                          statusConfig[lead.status].textColor
                        )}>
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            statusConfig[lead.status].color
                          )} />
                          {statusConfig[lead.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white">
                            {lead.assignedTo[0]}
                          </div>
                          <span className="text-white text-sm">{lead.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {formatCurrency(lead.budget)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(lead.lastActivity)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {/* TODO: Ouvrir modal de détails */}}
                            className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                            className="p-2 text-slate-400 hover:text-warning-400 hover:bg-warning-500/20 rounded-lg transition-all duration-200"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-slate-400 hover:text-danger-400 hover:bg-danger-500/20 rounded-lg transition-all duration-200"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 px-6 py-4">
              {paginatedLeads.map((lead) => (
                <div key={lead.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="w-4 h-4 text-primary-500 bg-slate-600 border-slate-500 rounded focus:ring-primary-500"
                      />
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(lead.artistName)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{lead.artistName}</div>
                        <div className="text-sm text-slate-400">{lead.genre}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* TODO: Ouvrir modal de détails */}}
                        className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-all duration-200"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                        className="p-2 text-slate-400 hover:text-warning-400 hover:bg-warning-500/20 rounded-lg transition-all duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2 text-slate-400 hover:text-danger-400 hover:bg-danger-500/20 rounded-lg transition-all duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contact</div>
                      <div className="text-sm text-white">{lead.email}</div>
                      <div className="text-xs text-slate-400">{lead.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Budget</div>
                      <div className="text-sm font-medium text-white">{formatCurrency(lead.budget)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center",
                          platformConfig[lead.platform].bgColor
                        )}>
                          {React.createElement(platformConfig[lead.platform].icon, {
                            className: cn("w-3 h-3", platformConfig[lead.platform].textColor)
                          })}
                        </div>
                        <span className="text-xs text-slate-300">{platformConfig[lead.platform].label}</span>
                      </div>
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        statusConfig[lead.status].bgColor,
                        statusConfig[lead.status].textColor
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig[lead.status].color)} />
                        {statusConfig[lead.status].label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Assigné à</div>
                      <div className="text-sm text-white">{lead.assignedTo}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <div className="text-xs text-slate-400">
                      Dernière activité: {formatDate(lead.lastActivity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} sur {filteredAndSortedLeads.length} résultats
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
            {filteredAndSortedLeads.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucun lead trouvé</h3>
            <p className="text-slate-400 mb-6">
              Essayez de modifier vos critères de recherche ou créez un nouveau lead.
            </p>
            <button
              onClick={handleCreateLead}
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer un nouveau lead
            </button>
          </div>
            )}
          </>
        )}
      </div>

      {/* Modal de création de lead */}
      <LeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveLead}
        mode="create"
      />
    </div>
  )
}

export default LeadsPage