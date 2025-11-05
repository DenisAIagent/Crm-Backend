import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

// Couleurs MDMC pour les graphiques
const mdmcColors = [
  '#6366f1', // primary-500
  '#d946ef', // secondary-500
  '#10b981', // accent-500
  '#f59e0b', // warning-500
  '#ef4444', // danger-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
]

// Couleurs pour les plateformes
const platformColors = {
  youtube: '#FF0000',
  spotify: '#1DB954',
  meta: '#1877F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  twitter: '#1DA1F2',
  soundcloud: '#FF5500'
}

function ChartWidget({
  title,
  type = 'bar',
  data = [],
  loading = false,
  height = 200,
  showLegend = true,
  className = '',
  darkTheme = false
}) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Fonction pour obtenir les couleurs appropriées
    const getColors = (items) => {
      return items.map((item, index) => {
        // Utiliser les couleurs de plateforme si disponible
        if (item.platform && platformColors[item.platform.toLowerCase()]) {
          return platformColors[item.platform.toLowerCase()]
        }
        // Sinon utiliser les couleurs MDMC
        return mdmcColors[index % mdmcColors.length]
      })
    }

    switch (type) {
      case 'doughnut':
        const backgroundColor = getColors(data)
        return {
          labels: data.map(item => item.status || item.platform || item.source || item.label),
          datasets: [{
            data: data.map(item => item.count || item.value),
            backgroundColor,
            borderColor: darkTheme ? '#1e293b' : '#fff',
            borderWidth: 3,
            hoverBorderWidth: 4,
            hoverBorderColor: darkTheme ? '#334155' : '#f8fafc'
          }]
        }

      case 'bar':
        const barColors = getColors(data)
        return {
          labels: data.map(item => item.platform || item.source || item.label),
          datasets: [{
            label: 'Nombre de leads',
            data: data.map(item => item.count || item.value),
            backgroundColor: barColors.map(color => color + '80'),
            borderColor: barColors,
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }, {
            label: 'Taux de conversion',
            data: data.map(item => parseFloat(item.conversionRate) || 0),
            backgroundColor: mdmcColors[2] + '60',
            borderColor: mdmcColors[2],
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
            yAxisID: 'y1'
          }]
        }

      case 'line':
        const datasets = []

        // Créer un dataset pour chaque métrique avec les couleurs MDMC
        if (data.length > 0 && data[0].leadsCount !== undefined) {
          datasets.push({
            label: 'Leads créés',
            data: data.map(item => item.leadsCount),
            borderColor: mdmcColors[0],
            backgroundColor: mdmcColors[0] + '20',
            pointBackgroundColor: mdmcColors[0],
            pointBorderColor: darkTheme ? '#1e293b' : '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true
          })
        }

        if (data.length > 0 && data[0].wonCount !== undefined) {
          datasets.push({
            label: 'Leads gagnés',
            data: data.map(item => item.wonCount),
            borderColor: mdmcColors[2],
            backgroundColor: mdmcColors[2] + '20',
            pointBackgroundColor: mdmcColors[2],
            pointBorderColor: darkTheme ? '#1e293b' : '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true
          })
        }

        if (data.length > 0 && data[0].revenue !== undefined) {
          datasets.push({
            label: 'Chiffre d\'affaires (€)',
            data: data.map(item => item.revenue),
            borderColor: mdmcColors[3],
            backgroundColor: mdmcColors[3] + '20',
            pointBackgroundColor: mdmcColors[3],
            pointBorderColor: darkTheme ? '#1e293b' : '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          })
        }

        return {
          labels: data.map(item => item.period || item.userName || item.label),
          datasets
        }

      default:
        return {
          labels: data.map(item => item.label),
          datasets: [{
            label: 'Valeur',
            data: data.map(item => item.value),
            backgroundColor: mdmcColors[0],
            borderColor: mdmcColors[0],
            borderWidth: 2
          }]
        }
    }
  }, [data, type])

  const chartOptions = useMemo(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif'
            },
            color: darkTheme ? '#cbd5e1' : '#374151'
          }
        },
        tooltip: {
          backgroundColor: darkTheme ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: darkTheme ? '#6366f1' : '#374151',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          }
        }
      }
    }

    switch (type) {
      case 'doughnut':
        return {
          ...baseOptions,
          cutout: '60%',
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins.tooltip,
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((context.parsed * 100) / total).toFixed(1)
                  return `${context.label}: ${context.parsed} (${percentage}%)`
                }
              }
            }
          }
        }

      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: darkTheme ? '#334155' : '#f3f4f6',
                borderDash: [5, 5]
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              beginAtZero: true,
              max: 100,
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                },
                callback: function(value) {
                  return value + '%'
                }
              }
            }
          }
        }

      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: darkTheme ? '#334155' : '#f3f4f6',
                borderDash: [5, 5]
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              beginAtZero: true,
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                color: darkTheme ? '#94a3b8' : '#6b7280',
                font: {
                  size: 11
                },
                callback: function(value) {
                  return value.toLocaleString('fr-FR') + ' €'
                }
              }
            }
          }
        }

      default:
        return baseOptions
    }
  }, [type, showLegend])

  const ChartComponent = {
    bar: Bar,
    doughnut: Doughnut,
    line: Line
  }[type] || Bar

  if (loading) {
    return (
      <div className={`
        ${darkTheme
          ? 'bg-dark-800/60 backdrop-blur-safe border border-primary-500/20'
          : 'bg-white shadow border border-gray-200'
        }
        rounded-xl p-6 ${className}
      `}>
        {title && (
          <h3 className={`
            text-lg font-display font-semibold mb-4
            ${darkTheme ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`
        ${darkTheme
          ? 'bg-dark-800/60 backdrop-blur-safe border border-primary-500/20'
          : 'bg-white shadow border border-gray-200'
        }
        rounded-xl p-6 ${className}
      `}>
        {title && (
          <h3 className={`
            text-lg font-display font-semibold mb-4
            ${darkTheme ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
        )}
        <div
          className={`
            flex items-center justify-center
            ${darkTheme ? 'text-dark-400' : 'text-gray-500'}
          `}
          style={{ height }}
        >
          <div className="text-center">
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      ${darkTheme
        ? 'bg-dark-800/60 backdrop-blur-safe border border-primary-500/20'
        : 'bg-white shadow border border-gray-200'
      }
      rounded-xl p-6 ${className}
    `}>
      {title && (
        <h3 className={`
          text-lg font-display font-semibold mb-4
          ${darkTheme ? 'text-white' : 'text-gray-900'}
        `}>
          {title}
        </h3>
      )}
      <div style={{ height }}>
        <ChartComponent data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}

export default ChartWidget