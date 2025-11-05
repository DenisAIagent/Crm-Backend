import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function TrendAnalysis({ data, dateRange }) {
  const [selectedMetric, setSelectedMetric] = useState('leads')

  // Génération de données temporelles réalistes
  const generateTimeSeriesData = (metric, period) => {
    const now = new Date()
    const labels = []
    const values = []

    const periods = {
      '7': { days: 7, format: 'DD/MM' },
      '30': { days: 30, format: 'DD/MM' },
      '90': { days: 90, format: 'DD/MM' }
    }

    const { days } = periods[period] || periods['30']

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }))

      // Données simulées avec variations réalistes
      let baseValue
      switch (metric) {
        case 'leads':
          baseValue = 8 + Math.sin(i / 5) * 3 + Math.random() * 4
          break
        case 'campaigns':
          baseValue = 2 + Math.sin(i / 7) * 1 + Math.random() * 2
          break
        case 'revenue':
          baseValue = 1500 + Math.sin(i / 10) * 500 + Math.random() * 800
          break
        case 'conversion':
          baseValue = 45 + Math.sin(i / 8) * 15 + Math.random() * 10
          break
        default:
          baseValue = Math.random() * 100
      }
      values.push(Math.max(0, Math.round(baseValue)))
    }

    return { labels, values }
  }

  const { labels, values } = generateTimeSeriesData(selectedMetric, dateRange)

  // Configuration des métriques
  const metrics = {
    leads: {
      label: 'Nouveaux Leads',
      color: '#e50914',
      backgroundColor: 'rgba(229, 9, 20, 0.1)',
      unit: '',
      format: (value) => value.toString()
    },
    campaigns: {
      label: 'Campagnes Créées',
      color: '#1DB954',
      backgroundColor: 'rgba(29, 185, 84, 0.1)',
      unit: '',
      format: (value) => value.toString()
    },
    revenue: {
      label: 'Chiffre d\'Affaires',
      color: '#4285F4',
      backgroundColor: 'rgba(66, 133, 244, 0.1)',
      unit: '€',
      format: (value) => value.toLocaleString() + '€'
    },
    conversion: {
      label: 'Taux de Conversion',
      color: '#FF0050',
      backgroundColor: 'rgba(255, 0, 80, 0.1)',
      unit: '%',
      format: (value) => value + '%'
    }
  }

  const selectedMetricConfig = metrics[selectedMetric]

  const chartData = {
    labels,
    datasets: [
      {
        label: selectedMetricConfig.label,
        data: values,
        borderColor: selectedMetricConfig.color,
        backgroundColor: selectedMetricConfig.backgroundColor,
        pointBackgroundColor: selectedMetricConfig.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: true
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
      title: {
        display: true,
        text: `Évolution - ${selectedMetricConfig.label}`,
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
        borderColor: selectedMetricConfig.color,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return selectedMetricConfig.label + ': ' + selectedMetricConfig.format(context.parsed.y)
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#ffffff',
          callback: function(value) {
            return selectedMetricConfig.format(value)
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  // Calculs de tendance
  const currentValue = values[values.length - 1]
  const previousValue = values[values.length - 2]
  const change = currentValue - previousValue
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : 0

  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <div className="space-y-6">
      {/* Sélecteur de métrique */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(metrics).map(([key, metric]) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedMetric === key
                ? 'text-white border'
                : 'text-white/70 hover:text-white border hover:border-white/30'
            }`}
            style={{
              backgroundColor: selectedMetric === key ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: selectedMetric === key ? '#e50914' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Graphique principal */}
      <div
        className="border rounded-2xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {selectedMetricConfig.format(currentValue)}
            </h3>
            <div className="flex items-center mt-1">
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-400' :
                  isNeutral ? 'text-white/70' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{change} ({changePercent}%)
              </span>
              <span className="text-white/70 text-sm ml-2">vs hier</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/70">Période</div>
            <div className="text-white font-semibold">
              {dateRange === '7' ? '7 derniers jours' :
               dateRange === '30' ? '30 derniers jours' :
               '90 derniers jours'}
            </div>
          </div>
        </div>

        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="border rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-sm text-white/70 mb-1">Tendance</div>
          <div className={`font-semibold ${
            isPositive ? 'text-green-400' :
            isNeutral ? 'text-white/70' : 'text-red-400'
          }`}>
            {isPositive ? '↗ En hausse' :
             isNeutral ? '→ Stable' : '↘ En baisse'}
          </div>
        </div>

        <div
          className="border rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-sm text-white/70 mb-1">Moyenne</div>
          <div className="font-semibold text-white">
            {selectedMetricConfig.format(Math.round(values.reduce((a, b) => a + b, 0) / values.length))}
          </div>
        </div>

        <div
          className="border rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-sm text-white/70 mb-1">Pic Maximum</div>
          <div className="font-semibold text-white">
            {selectedMetricConfig.format(Math.max(...values))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis