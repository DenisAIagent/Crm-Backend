import React, { useState } from 'react'
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import ClientReport from './ClientReport'

function ReportsManager() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showClientReport, setShowClientReport] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [reports, setReports] = useState([])

  const [newReport, setNewReport] = useState({
    clientName: '',
    clientEmail: '',
    reportType: 'mensuel',
    frequency: 'monthly',
    autoSend: true,
    includeCharts: true,
    includeRecommendations: true,
    includeComparison: false
  })

  const handleCreateReport = () => {
    const report = {
      id: Date.now(),
      ...newReport,
      status: 'active',
      nextSend: getNextSendDate(newReport.frequency),
      lastSent: null
    }
    setReports([...reports, report])
    setNewReport({
      clientName: '',
      clientEmail: '',
      reportType: 'mensuel',
      frequency: 'monthly',
      autoSend: true,
      includeCharts: true,
      includeRecommendations: true,
      includeComparison: false
    })
    setShowCreateModal(false)
  }

  const getNextSendDate = (frequency) => {
    const today = new Date()
    switch (frequency) {
      case 'weekly':
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case 'monthly':
        return new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0]
      case 'quarterly':
        return new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString().split('T')[0]
      default:
        return null
    }
  }

  const handlePreviewReport = (report) => {
    setSelectedClient(report)
    setShowClientReport(true)
  }

  const handleDeleteReport = (reportId) => {
    setReports(reports.filter(r => r.id !== reportId))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'weekly': return 'Hebdomadaire'
      case 'monthly': return 'Mensuel'
      case 'quarterly': return 'Trimestriel'
      case 'on-demand': return 'À la demande'
      default: return frequency
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Rapports</h2>
          <p className="text-white/70 mt-1">Automatisation et envoi des rapports clients</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau Rapport
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-white">{reports.length}</div>
          <div className="text-sm text-white/70">Rapports Configurés</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-green-400">{reports.filter(r => r.status === 'active').length}</div>
          <div className="text-sm text-white/70">Actifs</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-blue-400">{reports.filter(r => r.autoSend).length}</div>
          <div className="text-sm text-white/70">Automatisés</div>
        </div>
        <div
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="text-2xl font-bold text-orange-400">
            {reports.filter(r => new Date(r.nextSend) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-sm text-white/70">Cette Semaine</div>
        </div>
      </div>

      {/* Liste des rapports */}
      <div
        className="border rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
          <h3 className="text-lg font-semibold text-white">Rapports Programmés</h3>
        </div>

        <div className="divide-y" style={{ divideColor: 'rgba(255, 255, 255, 0.1)' }}>
          {reports.map((report) => (
            <div key={report.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-white/70" />
                    <div>
                      <h4 className="font-semibold text-white">{report.clientName}</h4>
                      <p className="text-sm text-white/70">{report.clientEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Type et fréquence */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{getFrequencyLabel(report.frequency)}</div>
                    <div className="text-xs text-white/70">{report.reportType}</div>
                  </div>

                  {/* Statut */}
                  <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status === 'active' ? 'Actif' :
                       report.status === 'draft' ? 'Brouillon' : 'Pausé'}
                    </span>
                  </div>

                  {/* Prochaine envoi */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">
                      {report.nextSend ? new Date(report.nextSend).toLocaleDateString('fr-FR') : 'À la demande'}
                    </div>
                    <div className="text-xs text-white/70">
                      {report.nextSend ? 'Prochain envoi' : 'Manuel'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewReport(report)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Prévisualiser"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 transition-opacity"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              onClick={() => setShowCreateModal(false)}
            />

            <div
              className="relative w-full max-w-md my-8 transition-all transform shadow-xl rounded-lg border"
              style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <h3 className="text-lg font-medium text-white">Nouveau Rapport Automatisé</h3>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Client</label>
                  <input
                    type="text"
                    value={newReport.clientName}
                    onChange={(e) => setNewReport({...newReport, clientName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '--tw-ring-color': '#e50914'
                    }}
                    placeholder="Nom du client"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <input
                    type="email"
                    value={newReport.clientEmail}
                    onChange={(e) => setNewReport({...newReport, clientEmail: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '--tw-ring-color': '#e50914'
                    }}
                    placeholder="email@client.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Fréquence</label>
                  <select
                    value={newReport.frequency}
                    onChange={(e) => setNewReport({...newReport, frequency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '--tw-ring-color': '#e50914'
                    }}
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="on-demand">À la demande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReport.autoSend}
                      onChange={(e) => setNewReport({...newReport, autoSend: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-white">Envoi automatique</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReport.includeCharts}
                      onChange={(e) => setNewReport({...newReport, includeCharts: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-white">Inclure les graphiques</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReport.includeRecommendations}
                      onChange={(e) => setNewReport({...newReport, includeRecommendations: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-white">Inclure les recommandations</span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end space-x-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showClientReport && selectedClient && (
        <ClientReport
          clientData={{
            name: selectedClient.clientName,
            email: selectedClient.clientEmail,
            artistName: selectedClient.clientName,
            genre: 'Pop Électronique'
          }}
          onClose={() => {
            setShowClientReport(false)
            setSelectedClient(null)
          }}
        />
      )}
    </div>
  )
}

export default ReportsManager