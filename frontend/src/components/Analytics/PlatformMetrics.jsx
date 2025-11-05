import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function PlatformMetrics({ data }) {
  // Données simulées réalistes par plateforme
  const platformData = {
    spotify: { campaigns: 8, budget: 15000, leads: 12, conversion: 67 },
    youtube: { campaigns: 6, budget: 12000, leads: 18, conversion: 45 },
    tiktok: { campaigns: 4, budget: 8000, leads: 15, conversion: 52 },
    meta: { campaigns: 3, budget: 6000, leads: 8, conversion: 71 },
    google: { campaigns: 2, budget: 4000, leads: 5, conversion: 38 }
  }

  // Données pour le graphique en barres (budgets par plateforme)
  const budgetData = {
    labels: ['Spotify', 'YouTube', 'TikTok', 'Meta', 'Google'],
    datasets: [
      {
        label: 'Budget Dépensé (€)',
        data: [
          platformData.spotify.budget,
          platformData.youtube.budget,
          platformData.tiktok.budget,
          platformData.meta.budget,
          platformData.google.budget
        ],
        backgroundColor: [
          '#1DB954', // Spotify Green
          '#FF0000', // YouTube Red
          '#FF0050', // TikTok Pink
          '#1877F2', // Meta Blue
          '#4285F4'  // Google Blue
        ],
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
  }

  // Données pour le graphique en ligne (taux de conversion)
  const conversionData = {
    labels: ['Spotify', 'YouTube', 'TikTok', 'Meta', 'Google'],
    datasets: [
      {
        label: 'Taux de Conversion (%)',
        data: [
          platformData.spotify.conversion,
          platformData.youtube.conversion,
          platformData.tiktok.conversion,
          platformData.meta.conversion,
          platformData.google.conversion
        ],
        borderColor: '#e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        pointBackgroundColor: '#e50914',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
          color: '#ffffff',
          maxRotation: 45
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

  // Calculs de performance
  const totalBudget = Object.values(platformData).reduce((acc, platform) => acc + platform.budget, 0)
  const totalCampaigns = Object.values(platformData).reduce((acc, platform) => acc + platform.campaigns, 0)
  const avgConversion = Object.values(platformData).reduce((acc, platform) => acc + platform.conversion, 0) / 5

  const topPlatform = Object.entries(platformData).reduce((top, [name, data]) =>
    data.conversion > top.conversion ? { name, ...data } : top,
    { name: '', conversion: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{totalCampaigns}</div>
          <div className="text-sm text-white/70">Campagnes Totales</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{totalBudget.toLocaleString()}€</div>
          <div className="text-sm text-white/70">Budget Total</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{avgConversion.toFixed(1)}%</div>
          <div className="text-sm text-white/70">Conversion Moyenne</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold" style={{ color: '#1DB954' }}>
            {topPlatform.name.charAt(0).toUpperCase() + topPlatform.name.slice(1)}
          </div>
          <div className="text-sm text-white/70">Top Plateforme</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget par plateforme */}
        <div
          className="border rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Budget par Plateforme</h3>
          <div className="h-80">
            <Bar data={budgetData} options={chartOptions} />
          </div>
        </div>

        {/* Taux de conversion */}
        <div
          className="border rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Taux de Conversion</h3>
          <div className="h-80">
            <Line data={conversionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Tableau de performance détaillé */}
      <div
        className="border rounded-2xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Performance Détaillée</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <th className="text-left py-3 px-4 text-white font-semibold">Plateforme</th>
                <th className="text-center py-3 px-4 text-white font-semibold">Campagnes</th>
                <th className="text-center py-3 px-4 text-white font-semibold">Budget</th>
                <th className="text-center py-3 px-4 text-white font-semibold">Leads</th>
                <th className="text-center py-3 px-4 text-white font-semibold">Conversion</th>
                <th className="text-center py-3 px-4 text-white font-semibold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(platformData).map(([platform, metrics]) => (
                <tr key={platform} className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{
                          backgroundColor: platform === 'spotify' ? '#1DB954' :
                                          platform === 'youtube' ? '#FF0000' :
                                          platform === 'tiktok' ? '#FF0050' :
                                          platform === 'meta' ? '#1877F2' : '#4285F4'
                        }}
                      ></div>
                      <span className="text-white capitalize">{platform}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{metrics.campaigns}</td>
                  <td className="text-center py-3 px-4 text-white">{metrics.budget.toLocaleString()}€</td>
                  <td className="text-center py-3 px-4 text-white">{metrics.leads}</td>
                  <td className="text-center py-3 px-4">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: metrics.conversion > 60 ? 'rgba(34, 197, 94, 0.2)' :
                                         metrics.conversion > 45 ? 'rgba(251, 191, 36, 0.2)' :
                                         'rgba(239, 68, 68, 0.2)',
                        color: metrics.conversion > 60 ? '#22c55e' :
                               metrics.conversion > 45 ? '#fbbf24' : '#ef4444'
                      }}
                    >
                      {metrics.conversion}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-white">
                      {(metrics.leads * 500 / metrics.budget * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PlatformMetrics