import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

function RefreshButton({ onClick, loading = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center px-3 py-2 text-sm font-medium text-white
        bg-accent-500 hover:bg-accent-600 disabled:bg-gray-400
        border border-transparent rounded-lg transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
        ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <ArrowPathIcon
        className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
      />
      {loading ? 'Actualisation...' : 'Actualiser'}
    </button>
  )
}

export default RefreshButton