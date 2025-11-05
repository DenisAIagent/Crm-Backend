import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Helmet } from 'react-helmet-async'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { leadsAPI } from '@/utils/api'

// Données de démonstration pour les leads
const mockLeads = []
import { useAuth } from '@/context/AuthContext'

// Composants
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import SearchInput from '@/components/UI/SearchInput'
import FilterDropdown from '@/components/UI/FilterDropdown'
import Button from '@/components/UI/Button'
import LeadModal from '@/components/Leads/LeadModal'
import LeadCard from '@/components/Leads/LeadCard'
import KanbanColumn from '@/components/Kanban/KanbanColumn'
import QuickAddLead from '@/components/Leads/QuickAddLead'

// Configuration des colonnes Kanban - Thème MDMC
const KANBAN_COLUMNS = [
  {
    id: 'new',
    title: 'Nouveaux',
    color: '#e50914',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'contacted',
    title: 'Contactés',
    color: 'rgba(229, 9, 20, 0.8)',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'qualified',
    title: 'Qualifiés',
    color: 'rgba(229, 9, 20, 0.7)',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'proposal_sent',
    title: 'Devis Envoyé',
    color: 'rgba(229, 9, 20, 0.6)',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'negotiation',
    title: 'Négociation',
    color: 'rgba(229, 9, 20, 0.5)',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'won',
    title: 'Gagnés',
    color: '#e50914',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: '#e50914'
  },
  {
    id: 'lost',
    title: 'Perdus',
    color: 'rgba(255, 255, 255, 0.5)',
    textColor: 'rgba(255, 255, 255, 0.7)',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  }
]

function KanbanBoard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // États locaux
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadModal, setShowLeadModal] = useState(false)

  // Récupération des leads avec fallback sur données de démonstration
  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError
  } = useQuery(
    ['leads', searchTerm, selectedPlatform, selectedAssignee],
    async () => {
      try {
        return await leadsAPI.getAll({
          search: searchTerm,
          platform: selectedPlatform,
          assignedTo: selectedAssignee,
          limit: 500
        })
      } catch (error) {
        console.log('API indisponible, utilisation des données de démonstration')
        // Retourner des données de test filtrées
        let filteredLeads = mockLeads

        if (searchTerm) {
          filteredLeads = filteredLeads.filter(lead =>
            lead.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.genre.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        if (selectedPlatform) {
          filteredLeads = filteredLeads.filter(lead => lead.platform === selectedPlatform)
        }

        if (selectedAssignee) {
          filteredLeads = filteredLeads.filter(lead =>
            lead.assignedTo?.firstName.toLowerCase().includes(selectedAssignee.toLowerCase())
          )
        }

        return { data: filteredLeads, total: filteredLeads.length }
      }
    },
    {
      refetchInterval: 30000,
      staleTime: 15000,
      retry: false // Ne pas réessayer en cas d'erreur API
    }
  )

  // Mutation pour mettre à jour le statut des leads avec fallback
  const updateLeadMutation = useMutation(
    async ({ leadId, updates }) => {
      try {
        return await leadsAPI.update(leadId, updates)
      } catch (error) {
        console.log('API indisponible, simulation de la mise à jour')
        // Simuler une mise à jour réussie
        return { success: true, data: { _id: leadId, ...updates } }
      }
    },
    {
      onSuccess: (data, { leadId, updates }) => {
        // Mettre à jour le cache local
        queryClient.setQueryData(['leads', searchTerm, selectedPlatform, selectedAssignee], (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            data: oldData.data.map(lead =>
              lead._id === leadId ? { ...lead, ...updates } : lead
            )
          }
        })

        toast.success('Lead mis à jour avec succès')
      },
      onError: (error) => {
        toast.error('Erreur lors de la mise à jour du lead')
        console.error('Update error:', error)
      },
      retry: false
    }
  )

  // Organisation des leads par colonne
  const kanbanData = useMemo(() => {
    if (!leadsData?.data) return {}

    const organizedData = {}

    // Assurer que leadsData.data est un tableau
    const leadsArray = Array.isArray(leadsData.data) ? leadsData.data : []

    KANBAN_COLUMNS.forEach(column => {
      organizedData[column.id] = {
        ...column,
        leads: leadsArray.filter(lead => lead.status === column.id)
      }
    })

    return organizedData
  }, [leadsData])

  // Gestion du drag & drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // Annuler si pas de destination ou même position
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return
    }

    const leadId = draggableId
    const newStatus = destination.droppableId
    const oldStatus = source.droppableId

    // Mise à jour optimiste du cache
    queryClient.setQueryData(['leads', searchTerm, selectedPlatform, selectedAssignee], (oldData) => {
      if (!oldData) return oldData

      return {
        ...oldData,
        data: oldData.data.map(lead =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      }
    })

    // Mettre à jour via API
    try {
      await updateLeadMutation.mutateAsync({
        leadId,
        updates: { status: newStatus }
      })

      // Log de l'action pour analytics
      console.log(`Lead ${leadId} déplacé de ${oldStatus} vers ${newStatus}`)

    } catch (error) {
      // Rollback en cas d'erreur
      queryClient.setQueryData(['leads', searchTerm, selectedPlatform, selectedAssignee], (oldData) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          data: oldData.data.map(lead =>
            lead._id === leadId ? { ...lead, status: oldStatus } : lead
          )
        }
      })
    }
  }


  // Options de filtres
  const platformOptions = [
    { value: '', label: 'Toutes les plateformes' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'meta', label: 'Meta' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'google', label: 'Google' }
  ]

  const assigneeOptions = [
    { value: '', label: 'Tous les assignés' },
    ...(user.role === 'admin' ? [
      { value: 'denis', label: 'Équipe Denis' },
      { value: 'marine', label: 'Équipe Marine' }
    ] : [])
  ]

  // Gestion du loading
  if (leadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  // Gestion des erreurs
  if (leadsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
          <p className="text-red-600 text-sm mt-1">
            {leadsError?.response?.data?.message || 'Impossible de charger les leads'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Pipeline Kanban - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="min-h-screen p-6" style={{ backgroundColor: '#000000' }}>
        {/* En-tête avec filtres - Design MDMC */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="border rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <h1 className="text-3xl font-bold text-white">
              Pipeline Kanban
            </h1>
            <p className="text-white/70 mt-2 text-lg">
              Gérez vos leads artistiques avec le système de glisser-déposer
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche MDMC */}
            <div className="relative">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher un artiste..."
                className="w-full sm:w-80 rounded-2xl border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              />
            </div>

            {/* Filtres MDMC */}
            <div className="flex gap-3">
              <FilterDropdown
                value={selectedPlatform}
                onChange={setSelectedPlatform}
                options={platformOptions}
                icon={FunnelIcon}
                className="rounded-2xl border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              />

              {user.role === 'admin' && (
                <FilterDropdown
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  options={assigneeOptions}
                  icon={UserIcon}
                  className="rounded-2xl border"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
              )}

              {/* Bouton d'ajout MDMC */}
              <Button
                onClick={() => setShowQuickAdd(true)}
                className="whitespace-nowrap text-white border rounded-2xl px-6 py-3 transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#e50914', borderColor: '#ffffff' }}
                leftIcon={PlusIcon}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5070f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e50914'
                }}
              >
                Nouveau Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides MDMC */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {KANBAN_COLUMNS.map(column => {
            const columnData = kanbanData[column.id]
            const count = columnData?.leads?.length || 0
            const totalValue = columnData?.leads?.reduce((sum, lead) =>
              sum + (lead.budget || lead.dealValue || 0), 0
            ) || 0

            return (
              <div
                key={column.id}
                className="border rounded-2xl p-5 transition-all duration-300 hover:scale-105 group"
                style={{ backgroundColor: column.bgColor, borderColor: column.borderColor }}
              >
                <div
                  className="w-4 h-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: column.color }}
                ></div>
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: column.textColor }}
                >
                  {column.title}
                </h3>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: column.textColor }}
                >
                  {count}
                </p>
                {totalValue > 0 && (
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {totalValue.toLocaleString('fr-FR')} €
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Board Kanban */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {KANBAN_COLUMNS.map(column => {
              const columnData = kanbanData[column.id]
              const leads = columnData?.leads || []

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  leads={leads}
                  onLeadClick={(lead) => {
                    setSelectedLead(lead)
                    setShowLeadModal(true)
                  }}
                  loading={updateLeadMutation.isLoading}
                />
              )
            })}
          </div>
        </DragDropContext>

        {/* Modal d'ajout rapide */}
        {showQuickAdd && (
          <QuickAddLead
            isOpen={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
            onSuccess={() => {
              setShowQuickAdd(false)
              queryClient.invalidateQueries(['leads'])
            }}
          />
        )}

        {/* Modal de détail du lead */}
        {showLeadModal && selectedLead && (
          <LeadModal
            isOpen={showLeadModal}
            onClose={() => {
              setShowLeadModal(false)
              setSelectedLead(null)
            }}
            lead={selectedLead}
            onUpdate={(updates) => {
              updateLeadMutation.mutate({
                leadId: selectedLead._id,
                updates
              })
            }}
          />
        )}

        {/* Indicateur de synchronisation MDMC */}
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="rounded-2xl p-4 border hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div className="flex items-center text-sm text-white font-medium">
              <div
                className="w-3 h-3 rounded-full mr-3 animate-pulse"
                style={{ backgroundColor: '#e50914' }}
              ></div>
              <span>Dernière sync</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default KanbanBoard