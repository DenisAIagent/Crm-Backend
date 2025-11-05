import React, { useState, useRef, useEffect } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'

function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className = "",
  placeholder = "Sélectionner une période"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(startDate || '')
  const [localEndDate, setLocalEndDate] = useState(endDate || '')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleApply = () => {
    if (onDateChange) {
      onDateChange({
        startDate: localStartDate,
        endDate: localEndDate
      })
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setLocalStartDate('')
    setLocalEndDate('')
    if (onDateChange) {
      onDateChange({
        startDate: '',
        endDate: ''
      })
    }
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!startDate && !endDate) return placeholder

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    } else if (startDate) {
      return `À partir du ${formatDate(startDate)}`
    } else if (endDate) {
      return `Jusqu'au ${formatDate(endDate)}`
    }

    return placeholder
  }

  const getQuickRanges = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return [
      {
        label: "Aujourd'hui",
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: "Hier",
        start: yesterday.toISOString().split('T')[0],
        end: yesterday.toISOString().split('T')[0]
      },
      {
        label: "7 derniers jours",
        start: lastWeek.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: "30 derniers jours",
        start: lastMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: "Ce mois",
        start: thisMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    ]
  }

  const handleQuickRange = (range) => {
    setLocalStartDate(range.start)
    setLocalEndDate(range.end)
    if (onDateChange) {
      onDateChange({
        startDate: range.start,
        endDate: range.end
      })
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
      >
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{formatDateRange()}</span>
        </div>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            {/* Sélections rapides */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Sélections rapides</h4>
              <div className="grid grid-cols-2 gap-2">
                {getQuickRanges().map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickRange(range)}
                    className="px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection personnalisée */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Période personnalisée</h4>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Effacer
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-1 text-sm text-white bg-accent-600 rounded hover:bg-accent-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker