import React, { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

function ClientReport({
  clientData,
  campaignData,
  dateRange = '30',
  onClose
}) {
  const componentRef = useRef()
  const [isGenerating, setIsGenerating] = useState(false)

  // Données client par défaut
  const defaultClientData = {
    name: '',
    email: '',
    artistName: '',
    genre: '',
    startDate: '',
    campaigns: []
  }

  const client = clientData || defaultClientData

  // Calculs de performance
  const totalBudget = client.campaigns.reduce((sum, campaign) => sum + campaign.budget, 0)
  const totalSpent = client.campaigns.reduce((sum, campaign) => sum + campaign.spent, 0)
  const totalImpressions = client.campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
  const totalClicks = client.campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
  const totalEngagement = client.campaigns.reduce((sum, campaign) => sum + (campaign.streams || campaign.views || 0), 0)

  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
  const cpm = totalImpressions > 0 ? ((totalSpent / totalImpressions) * 1000).toFixed(2) : 0
  const budgetUsage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0

  // Configuration des graphiques pour PDF
  const campaignPerformanceData = {
    labels: client.campaigns.map(c => c.name.split(' - ')[1] || c.platform),
    datasets: [
      {
        label: 'Budget (€)',
        data: client.campaigns.map(c => c.budget),
        backgroundColor: 'rgba(229, 9, 20, 0.6)',
        borderColor: '#e50914',
        borderWidth: 1
      },
      {
        label: 'Dépensé (€)',
        data: client.campaigns.map(c => c.spent),
        backgroundColor: 'rgba(229, 9, 20, 0.3)',
        borderColor: '#e50914',
        borderWidth: 1
      }
    ]
  }

  const engagementData = {
    labels: client.campaigns.map(c => c.name.split(' - ')[1] || c.platform),
    datasets: [
      {
        label: 'Engagement',
        data: client.campaigns.map(c => c.streams || c.views || 0),
        borderColor: '#e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const budgetBreakdownData = {
    labels: client.campaigns.map(c => c.name.split(' - ')[1] || c.platform),
    datasets: [
      {
        data: client.campaigns.map(c => c.spent),
        backgroundColor: [
          '#e50914',
          'rgba(229, 9, 20, 0.7)',
          'rgba(229, 9, 20, 0.5)',
          'rgba(229, 9, 20, 0.3)'
        ],
        borderWidth: 0
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#000000',
          font: { size: 10 }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#000000', font: { size: 8 } },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { color: '#000000', font: { size: 8 } },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000000',
          font: { size: 8 },
          padding: 10
        }
      }
    }
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Rapport-${client.artistName}-${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      setIsGenerating(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setIsGenerating(false)
    }
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="relative w-full max-w-6xl my-8 transition-all transform shadow-xl rounded-lg border"
          style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.2)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Rapport Client - {client.artistName}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* Contenu du rapport */}
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <div ref={componentRef} className="bg-white">
              {/* En-tête du rapport */}
              <div className="mb-8 border-b border-gray-200 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Rapport de Performance
                    </h1>
                    <div className="text-lg font-semibold text-red-600 mb-4">
                      {client.artistName}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Artiste:</span> {client.artistName}
                      </div>
                      <div>
                        <span className="font-medium">Genre:</span> {client.genre}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span> {client.email}
                      </div>
                      <div>
                        <span className="font-medium">Période:</span> {dateRange} derniers jours
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">MDMC</div>
                    <div className="text-sm text-gray-600">Music Ads</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Généré le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques principales */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé Exécutif</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{totalBudget.toLocaleString()}€</div>
                    <div className="text-sm text-gray-600">Budget Total</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{totalEngagement.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Engagement Total</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{ctr}%</div>
                    <div className="text-sm text-gray-600">Taux de Clic</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{cpm}€</div>
                    <div className="text-sm text-gray-600">CPM Moyen</div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Performance des Campagnes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Budget vs Dépenses</h3>
                    <div className="h-48">
                      <Bar data={campaignPerformanceData} options={chartOptions} />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Évolution de l'Engagement</h3>
                    <div className="h-48">
                      <Line data={engagementData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition budget */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition du Budget</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-48">
                      <Doughnut data={budgetBreakdownData} options={doughnutOptions} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {client.campaigns.map((campaign, index) => (
                      <div key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{campaign.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{campaign.spent.toLocaleString()}€</div>
                          <div className="text-sm text-gray-600">/{campaign.budget.toLocaleString()}€</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tableau détaillé */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Détail des Campagnes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Campagne</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Plateforme</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Budget</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Dépensé</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Impressions</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Clics</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Engagement</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{campaign.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center capitalize">{campaign.platform}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{campaign.budget.toLocaleString()}€</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{campaign.spent.toLocaleString()}€</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{campaign.impressions.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{campaign.clicks.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{(campaign.streams || campaign.views || 0).toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommandations */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recommandations</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Optimiser les campagnes avec un CTR inférieur à 2%
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Augmenter le budget sur les plateformes performantes (CTR &gt; 3%)
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Tester de nouveaux créatifs pour améliorer l'engagement
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Analyser les heures de diffusion optimales
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
                <p>Ce rapport a été généré automatiquement par MDMC Music Ads CRM</p>
                <p>Pour toute question, contactez votre gestionnaire de compte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientReport