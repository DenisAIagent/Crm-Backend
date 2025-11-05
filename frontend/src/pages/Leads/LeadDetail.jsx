import React from 'react'
import { useParams } from 'react-router-dom'

function LeadDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Détail du lead #{id}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées et historique du lead.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">Détails du lead en cours de développement...</p>
        </div>
      </div>
    </div>
  )
}

export default LeadDetail