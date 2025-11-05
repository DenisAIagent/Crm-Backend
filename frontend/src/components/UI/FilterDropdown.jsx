import React, { useState, useRef, useEffect } from 'react'
import { FunnelIcon, ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

function FilterDropdown({
  filters = {},
  filterOptions = {},
  onFiltersChange,
  placeholder = "Filtres",
  clearAllText = "Tout effacer",
  applyText = "Appliquer",
  className = "",
  showApplyButton = true,
  autoApply = false,
  activeFiltersCount = 0
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

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

  const getActiveFiltersCount = () => {
    if (activeFiltersCount !== undefined) return activeFiltersCount

    return Object.values(localFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '' && v !== null && v !== undefined)
      }
      return value !== '' && value !== null && value !== undefined
    }).length
  }

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...localFilters,
      [filterKey]: value
    }

    setLocalFilters(newFilters)

    if (autoApply && onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(localFilters)
    }
    setIsOpen(false)
  }

  const handleClearAll = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = Array.isArray(localFilters[key]) ? [] : ''
      return acc
    }, {})

    setLocalFilters(clearedFilters)

    if (autoApply && onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }

  const renderFilterInput = (filterKey, filterConfig) => {
    const currentValue = localFilters[filterKey]

    switch (filterConfig.type) {
      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="">Tous</option>
            {filterConfig.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(currentValue) ? currentValue : []
        return (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterConfig.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <label key={option.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value)
                      handleFilterChange(filterKey, newValues)
                    }}
                    className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                  {isSelected && <CheckIcon className="w-3 h-3 text-accent-600" />}
                </label>
              )
            })}
          </div>
        )

      case 'daterange':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Du
              </label>
              <input
                type="date"
                value={currentValue?.start || ''}
                onChange={(e) => handleFilterChange(filterKey, {
                  ...currentValue,
                  start: e.target.value
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Au
              </label>
              <input
                type="date"
                value={currentValue?.end || ''}
                onChange={(e) => handleFilterChange(filterKey, {
                  ...currentValue,
                  end: e.target.value
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={currentValue?.min || ''}
                onChange={(e) => handleFilterChange(filterKey, {
                  ...currentValue,
                  min: e.target.value
                })}
                placeholder={filterConfig.minPlaceholder || 'Min'}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={currentValue?.max || ''}
                onChange={(e) => handleFilterChange(filterKey, {
                  ...currentValue,
                  max: e.target.value
                })}
                placeholder={filterConfig.maxPlaceholder || 'Max'}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        )

      case 'text':
      default:
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            placeholder={filterConfig.placeholder || `Filtrer par ${filterConfig.label}`}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        )
    }
  }

  const activeCount = getActiveFiltersCount()

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
          transition-colors duration-200
          ${activeCount > 0
            ? 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <FunnelIcon className="w-4 h-4 mr-2" />
        <span>{placeholder}</span>
        {activeCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent-600 text-white rounded-full">
            {activeCount}
          </span>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Filtres</h3>
              {activeCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {clearAllText}
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(filterOptions).map(([filterKey, filterConfig]) => (
                <div key={filterKey}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {filterConfig.label}
                  </label>
                  {renderFilterInput(filterKey, filterConfig)}
                </div>
              ))}
            </div>

            {showApplyButton && !autoApply && (
              <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-1 text-sm text-white bg-accent-600 rounded hover:bg-accent-700 transition-colors"
                >
                  {applyText}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook pour gérer l'état des filtres
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const updateFilters = (newFilters) => {
    setFilters(newFilters)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
  }

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = Array.isArray(filters[key]) ? [] : ''
      return acc
    }, {})
    setFilters(clearedFilters)
    setAppliedFilters(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.values(appliedFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== '' && v !== null && v !== undefined)
      }
      return value !== '' && value !== null && value !== undefined
    }).length
  }

  return {
    filters,
    appliedFilters,
    updateFilters,
    applyFilters,
    clearFilters,
    activeFiltersCount: getActiveFiltersCount()
  }
}

// Composants prédéfinis pour des cas d'usage courants
export function LeadsFilterDropdown({ onFiltersChange, ...props }) {
  const defaultFilterOptions = {
    status: {
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'new', label: 'Nouveau' },
        { value: 'contacted', label: 'Contacté' },
        { value: 'qualified', label: 'Qualifié' },
        { value: 'closed-won', label: 'Gagné' },
        { value: 'closed-lost', label: 'Perdu' }
      ]
    },
    source: {
      label: 'Source',
      type: 'multiselect',
      options: [
        { value: 'website', label: 'Site web' },
        { value: 'social', label: 'Réseaux sociaux' },
        { value: 'referral', label: 'Référence' },
        { value: 'advertising', label: 'Publicité' }
      ]
    },
    dateRange: {
      label: 'Période',
      type: 'daterange'
    }
  }

  return (
    <FilterDropdown
      filterOptions={defaultFilterOptions}
      onFiltersChange={onFiltersChange}
      placeholder="Filtres leads"
      {...props}
    />
  )
}

export function CampaignsFilterDropdown({ onFiltersChange, ...props }) {
  const defaultFilterOptions = {
    status: {
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'paused', label: 'En pause' },
        { value: 'completed', label: 'Terminé' },
        { value: 'draft', label: 'Brouillon' }
      ]
    },
    platform: {
      label: 'Plateforme',
      type: 'multiselect',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'spotify', label: 'Spotify' },
        { value: 'meta', label: 'Meta' },
        { value: 'tiktok', label: 'TikTok' }
      ]
    },
    budget: {
      label: 'Budget',
      type: 'range',
      minPlaceholder: 'Min €',
      maxPlaceholder: 'Max €'
    }
  }

  return (
    <FilterDropdown
      filterOptions={defaultFilterOptions}
      onFiltersChange={onFiltersChange}
      placeholder="Filtres campagnes"
      {...props}
    />
  )
}

export default FilterDropdown