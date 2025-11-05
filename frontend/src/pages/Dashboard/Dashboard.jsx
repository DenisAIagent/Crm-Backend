import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import {
  UsersIcon,
  MegaphoneIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

import { analyticsAPI, leadsAPI, campaignsAPI } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LeadModal from '@/components/Leads/LeadModal'
import CampaignModal from '@/components/Campaigns/CampaignModal'
import ConversionFunnel from '@/components/Analytics/ConversionFunnel'
import PlatformMetrics from '@/components/Analytics/PlatformMetrics'
import TrendAnalysis from '@/components/Analytics/TrendAnalysis'
import ReportsManager from '@/components/Reports/ReportsManager'
import OpportunitiesManager from '@/components/Opportunities/OpportunitiesManager'
import toast from 'react-hot-toast'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('30')
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Récupération des données essentielles
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard-simple', dateRange],
    () => analyticsAPI.getDashboard({ period: dateRange }),
    {
      initialData: {
        leads: {
          total: 0,
          new: 0,
          qualified: 0,
          converted: 0
        },
        clients: {
          total: 0,
          active: 0,
          new: 0
        },
        campaigns: {
          total: 0,
          active: 0,
          completed: 0
        },
        revenue: {
          total: 0,
          thisMonth: 0,
          growth: 0
        }
      }
    }
  )

  // KPIs commerciaux essentiels
  const kpis = [
    {
      title: 'Leads Totaux',
      value: dashboardData?.leads?.total || 0,
      subtitle: `${dashboardData?.leads?.new || 0} nouveaux ce mois`,
      icon: UsersIcon,
      color: 'blue',
      onClick: () => navigate('/leads')
    },
    {
      title: 'Clients Actifs',
      value: dashboardData?.clients?.active || 0,
      subtitle: `${dashboardData?.clients?.total || 0} au total`,
      icon: CurrencyEuroIcon,
      color: 'green',
      onClick: () => navigate('/clients')
    },
    {
      title: 'Campagnes Actives',
      value: dashboardData?.campaigns?.active || 0,
      subtitle: `${dashboardData?.campaigns?.total || 0} au total`,
      icon: MegaphoneIcon,
      color: 'purple',
      onClick: () => navigate('/campaigns')
    },
    {
      title: 'CA du Mois',
      value: `${(dashboardData?.revenue?.thisMonth || 0).toLocaleString('fr-FR')} €`,
      subtitle: `+${dashboardData?.revenue?.growth || 0}% vs mois dernier`,
      icon: ChartBarIcon,
      color: 'orange',
      onClick: () => navigate('/analytics')
    }
  ]

  // Handlers pour les modals
  const handleSaveLead = async (leadData) => {
    try {
      await leadsAPI.create(leadData)
      setShowLeadModal(false)
      toast.success('Lead créé avec succès')
      // Recharger les données du dashboard si nécessaire
    } catch (error) {
      toast.error('Erreur lors de la création du lead')
      console.error('Error creating lead:', error)
    }
  }

  const handleSaveCampaign = async (campaignData) => {
    try {
      await campaignsAPI.create(campaignData)
      setShowCampaignModal(false)
      toast.success('Campagne créée avec succès')
      // Recharger les données du dashboard si nécessaire
    } catch (error) {
      toast.error('Erreur lors de la création de la campagne')
      console.error('Error creating campaign:', error)
    }
  }

  // Actions rapides
  const quickActions = [
    {
      title: 'Nouveau Lead',
      description: 'Ajouter un prospect',
      icon: UsersIcon,
      action: () => setShowLeadModal(true),
      color: 'blue'
    },
    {
      title: 'Nouvelle Campagne',
      description: 'Créer une campagne',
      icon: MegaphoneIcon,
      action: () => setShowCampaignModal(true),
      color: 'purple'
    },
    {
      title: 'Saisir Résultats',
      description: 'Entrer les métriques',
      icon: ChartBarIcon,
      action: () => navigate('/analytics?action=metrics'),
      color: 'green'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="p-6 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-white/70 text-lg">
              Bienvenue {user.firstName} ! Vue d'ensemble de votre activité commerciale
            </p>
          </div>

          {/* Filtre période */}
          <div className="mb-8">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:ring-2 transition-all duration-300 text-white"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                focusRingColor: '#e50914',
                focusBorderColor: '#e50914'
              }}
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => (
              <div
                key={index}
                onClick={kpi.onClick}
                className="group border rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e50914'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl border" style={{ backgroundColor: '#e50914', borderColor: '#ffffff' }}>
                    <kpi.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{kpi.title}</h3>
                  <div className="text-2xl font-bold text-white mb-2">{kpi.value}</div>
                  <p className="text-sm text-white/70">{kpi.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions Rapides */}
          <div className="border rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <h2 className="text-xl font-bold text-white mb-6">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="group flex items-center p-4 border rounded-xl transition-all duration-300 hover:scale-105 text-left"
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
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: '#e50914' }}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{action.title}</h3>
                      <p className="text-sm text-white/70">{action.description}</p>
                    </div>
                  </div>
                  <PlusIcon className="w-5 h-5 text-white/50 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Overview */}
          <div className="mt-8 border rounded-2xl p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <h2 className="text-xl font-bold text-white mb-6">Workflow Commercial</h2>
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{dashboardData?.leads?.new || 0}</div>
                <div className="text-sm text-white/70">Nouveaux Leads</div>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: '#e50914' }}></div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{dashboardData?.leads?.qualified || 0}</div>
                <div className="text-sm text-white/70">Leads Qualifiés</div>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: '#e50914' }}></div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{dashboardData?.clients?.active || 0}</div>
                <div className="text-sm text-white/70">Clients Actifs</div>
              </div>
              <div className="w-8 h-0.5" style={{ backgroundColor: '#e50914' }}></div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{dashboardData?.campaigns?.active || 0}</div>
                <div className="text-sm text-white/70">Campagnes En Cours</div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-8">
            {/* Onglets de navigation */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'opportunities', label: 'Opportunités' },
                { id: 'funnel', label: 'Entonnoir de Conversion' },
                { id: 'platforms', label: 'Plateformes' },
                { id: 'trends', label: 'Tendances' },
                { id: 'reports', label: 'Rapports Client' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white border'
                      : 'text-white/70 hover:text-white border hover:border-white/30'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: activeTab === tab.id ? '#e50914' : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ConversionFunnel data={dashboardData} />
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="space-y-6">
                <OpportunitiesManager />
              </div>
            )}

            {activeTab === 'funnel' && (
              <div className="space-y-6">
                <ConversionFunnel data={dashboardData} />
              </div>
            )}

            {activeTab === 'platforms' && (
              <div className="space-y-6">
                <PlatformMetrics data={dashboardData} />
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <TrendAnalysis data={dashboardData} dateRange={dateRange} />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <ReportsManager />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Lead Modal */}
      <LeadModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSave={handleSaveLead}
        mode="create"
      />

      {/* Campaign Modal */}
      <CampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onSubmit={handleSaveCampaign}
      />
    </>
  )
}

export default Dashboard