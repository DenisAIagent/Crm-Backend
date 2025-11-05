import React, { useState, useEffect } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

function OpportunitiesManager() {
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({})

  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    search: ''
  })

  // Données d'exemple pour la démo (en attendant l'API)
  const mockOpportunities = []

  useEffect(() => {
    loadOpportunities()
    loadStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [opportunities, filters])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      // Simulation d'appel API
      setTimeout(() => {
        setOpportunities(mockOpportunities)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erreur lors du chargement des opportunités:', error)
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const stats = {
        total: mockOpportunities.length,
        byStatus: {
          new: mockOpportunities.filter(o => o.status === 'new').length,
          qualified: mockOpportunities.filter(o => o.status === 'qualified').length,
          proposal: mockOpportunities.filter(o => o.status === 'proposal').length,
          won: mockOpportunities.filter(o => o.status === 'won').length
        },
        byPriority: {
          high: mockOpportunities.filter(o => o.priority === 'high').length,
          medium: mockOpportunities.filter(o => o.priority === 'medium').length,
          low: mockOpportunities.filter(o => o.priority === 'low').length
        },
        totalBudget: mockOpportunities.reduce((sum, o) => sum + (o.budget || 0), 0)
      }
      setStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...opportunities]

    if (filters.status) {
      filtered = filtered.filter(opp => opp.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter(opp => opp.priority === filters.priority)
    }

    if (filters.source) {
      filtered = filtered.filter(opp => opp.source === filters.source)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(opp =>
        opp.artistName.toLowerCase().includes(search) ||
        opp.email.toLowerCase().includes(search) ||
        opp.firstName.toLowerCase().includes(search) ||
        opp.lastName.toLowerCase().includes(search) ||
        (opp.projectName && opp.projectName.toLowerCase().includes(search))
      )
    }

    // Tri par priorité puis par date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    setFilteredOpportunities(filtered)
  }

  const handleEditOpportunity = (opportunity) => {
    setSelectedOpportunity({...opportunity})
    setShowEditModal(true)
  }

  const handleSaveOpportunity = async () => {
    try {
      // Mettre à jour dans la liste locale
      const updatedOpportunities = opportunities.map(opp =>
        opp.id === selectedOpportunity.id ? selectedOpportunity : opp
      )
      setOpportunities(updatedOpportunities)
      setShowEditModal(false)
      setSelectedOpportunity(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'medium': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nouveau',
      contacted: 'Contacté',
      qualified: 'Qualifié',
      proposal: 'Proposition',
      won: 'Gagné',
      lost: 'Perdu'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Opportunités</h2>
          <p className="text-white/70 mt-1">Leads générés automatiquement depuis le site web</p>
        </div>
        <button
          onClick={loadOpportunities}
          className="flex items-center px-4 py-2 border rounded-xl transition-all duration-300 hover:scale-105 text-white font-semibold"
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
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{stats.total || 0}</div>
          <div className="text-sm text-white/70">Total</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-blue-400">{stats.byStatus?.new || 0}</div>
          <div className="text-sm text-white/70">Nouveaux</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-green-400">{stats.byStatus?.qualified || 0}</div>
          <div className="text-sm text-white/70">Qualifiés</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-red-400">{stats.byPriority?.high || 0}</div>
          <div className="text-sm text-white/70">Priorité Haute</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{(stats.totalBudget || 0).toLocaleString()}€</div>
          <div className="text-sm text-white/70">Budget Total</div>
        </div>
      </div>

      {/* Filtres */}
      <div
        className="border rounded-xl p-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-white/50" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '--tw-ring-color': '#e50914'
              }}
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '--tw-ring-color': '#e50914'
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="contacted">Contacté</option>
            <option value="qualified">Qualifié</option>
            <option value="proposal">Proposition</option>
            <option value="won">Gagné</option>
            <option value="lost">Perdu</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '--tw-ring-color': '#e50914'
            }}
          >
            <option value="">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={filters.source}
            onChange={(e) => setFilters({...filters, source: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '--tw-ring-color': '#e50914'
            }}
          >
            <option value="">Toutes sources</option>
            <option value="website">Site web</option>
            <option value="referral">Référence</option>
            <option value="social">Réseaux sociaux</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', priority: '', source: '', search: '' })}
            className="px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Liste des opportunités */}
      <div
        className="border rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white/70 mt-2">Chargement des opportunités...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlusIcon className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">Aucune opportunité trouvée</p>
          </div>
        ) : (
          <div className="divide-y" style={{ divideColor: 'rgba(255, 255, 255, 0.1)' }}>
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPriorityIcon(opportunity.priority)}
                      <h3 className="font-semibold text-white text-lg">{opportunity.artistName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                        {getStatusLabel(opportunity.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Contact :</span> {opportunity.firstName} {opportunity.lastName}
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Email :</span> {opportunity.email}
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Genre :</span> {opportunity.genre}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Plateforme :</span> {opportunity.platform}
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Budget :</span> {opportunity.budget?.toLocaleString()}€
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Assigné à :</span> {opportunity.assignedTo || 'Non assigné'}
                        </p>
                      </div>
                    </div>

                    {opportunity.projectName && (
                      <div className="mb-2">
                        <p className="text-white font-medium">Projet : {opportunity.projectName}</p>
                      </div>
                    )}

                    {opportunity.campaignDetails && (
                      <div className="mb-4">
                        <p className="text-white/70 text-sm">{opportunity.campaignDetails}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-white/50">
                      <span>Créé le {new Date(opportunity.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>Dernière activité : {new Date(opportunity.lastActivity).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditOpportunity(opportunity)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {showEditModal && selectedOpportunity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 transition-opacity"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              onClick={() => setShowEditModal(false)}
            />

            <div
              className="relative w-full max-w-2xl my-8 transition-all transform shadow-xl rounded-lg border"
              style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <h3 className="text-lg font-medium text-white">
                  Modifier l'opportunité - {selectedOpportunity.artistName}
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nom du Projet *
                  </label>
                  <input
                    type="text"
                    value={selectedOpportunity.projectName}
                    onChange={(e) => setSelectedOpportunity({
                      ...selectedOpportunity,
                      projectName: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '--tw-ring-color': '#e50914'
                    }}
                    placeholder="Ex: Single 'Titre' - Promotion Spotify"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Détails de la Campagne
                  </label>
                  <textarea
                    value={selectedOpportunity.campaignDetails}
                    onChange={(e) => setSelectedOpportunity({
                      ...selectedOpportunity,
                      campaignDetails: e.target.value
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '--tw-ring-color': '#e50914'
                    }}
                    placeholder="Décrivez les objectifs, le ciblage, la durée..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Statut</label>
                    <select
                      value={selectedOpportunity.status}
                      onChange={(e) => setSelectedOpportunity({
                        ...selectedOpportunity,
                        status: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '--tw-ring-color': '#e50914'
                      }}
                    >
                      <option value="new">Nouveau</option>
                      <option value="contacted">Contacté</option>
                      <option value="qualified">Qualifié</option>
                      <option value="proposal">Proposition</option>
                      <option value="won">Gagné</option>
                      <option value="lost">Perdu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Assigné à</label>
                    <select
                      value={selectedOpportunity.assignedTo || ''}
                      onChange={(e) => setSelectedOpportunity({
                        ...selectedOpportunity,
                        assignedTo: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '--tw-ring-color': '#e50914'
                      }}
                    >
                      <option value="">Non assigné</option>
                      <option value="Denis">Denis</option>
                      <option value="Marine">Marine</option>
                      <option value="Alex">Alex</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end space-x-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveOpportunity}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpportunitiesManager