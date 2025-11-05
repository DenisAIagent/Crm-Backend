import React from 'react'
import { useParams } from 'react-router-dom'

function CampaignDetail() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Détail de la campagne #{id}</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Détails de la campagne en cours de développement...</p>
      </div>
    </div>
  )
}

export default CampaignDetail