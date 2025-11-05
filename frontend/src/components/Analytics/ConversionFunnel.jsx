import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function ConversionFunnel({ data }) {
  // Données de l'entonnoir de conversion
  const funnelData = {
    leads: data?.leads?.total || 42,
    qualified: data?.leads?.qualified || 15,
    clients: data?.clients?.active || 18,
    campaigns: data?.campaigns?.active || 12
  }

  // Calcul des taux de conversion
  const conversionRates = {
    leadToQualified: ((funnelData.qualified / funnelData.leads) * 100).toFixed(1),
    qualifiedToClient: ((funnelData.clients / funnelData.qualified) * 100).toFixed(1),
    clientToCampaign: ((funnelData.campaigns / funnelData.clients) * 100).toFixed(1)
  }

  // Configuration du graphique en barres pour l'entonnoir
  const barData = {
    labels: ['Leads Totaux', 'Leads Qualifiés', 'Clients Actifs', 'Campagnes'],
    datasets: [
      {
        label: 'Entonnoir Commercial',
        data: [funnelData.leads, funnelData.qualified, funnelData.clients, funnelData.campaigns],
        backgroundColor: [
          'rgba(229, 9, 20, 0.8)',
          'rgba(229, 9, 20, 0.6)',
          'rgba(229, 9, 20, 0.4)',
          'rgba(229, 9, 20, 0.2)'
        ],
        borderColor: '#e50914',
        borderWidth: 1
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Entonnoir de Conversion Commercial',
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e50914',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }

  // Configuration du graphique en donut pour les taux de conversion
  const doughnutData = {
    labels: ['Lead → Qualifié', 'Qualifié → Client', 'Client → Campagne'],
    datasets: [
      {
        data: [conversionRates.leadToQualified, conversionRates.qualifiedToClient, conversionRates.clientToCampaign],
        backgroundColor: [
          '#e50914',
          'rgba(229, 9, 20, 0.7)',
          'rgba(229, 9, 20, 0.4)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Taux de Conversion (%)',
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e50914',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%'
          }
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Entonnoir en barres */}
      <div
        className="border rounded-2xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="h-80">
          <Bar data={barData} options={barOptions} />
        </div>

        {/* Métriques de performance */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{conversionRates.leadToQualified}%</div>
            <div className="text-xs text-white/70">Lead → Qualifié</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{conversionRates.qualifiedToClient}%</div>
            <div className="text-xs text-white/70">Qualifié → Client</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{conversionRates.clientToCampaign}%</div>
            <div className="text-xs text-white/70">Client → Campagne</div>
          </div>
        </div>
      </div>

      {/* Graphique en donut */}
      <div
        className="border rounded-2xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>

        {/* Insights rapides */}
        <div className="mt-4 space-y-2">
          <div className="text-sm text-white/70">
            <span className="text-white font-semibold">Performance globale :</span>
            {' '}{((funnelData.campaigns / funnelData.leads) * 100).toFixed(1)}% des leads deviennent des campagnes
          </div>
          <div className="text-sm text-white/70">
            <span className="text-white font-semibold">Goulot d'étranglement :</span>
            {' '}{conversionRates.leadToQualified < 30 ? 'Qualification leads' :
                  conversionRates.qualifiedToClient < 50 ? 'Conversion client' :
                  'Activation campagne'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversionFunnel