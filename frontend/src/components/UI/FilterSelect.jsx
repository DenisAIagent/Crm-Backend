import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

function FilterSelect({
  options = [],
  value,
  onChange,
  placeholder = "Sélectionner...",
  multiple = false,
  searchable = false,
  className = "",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.value && option.value.toString().toLowerCase().includes(searchLower))
    )
  })

  const handleOptionSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const isSelected = currentValues.some(v => v === option.value)

      let newValues
      if (isSelected) {
        newValues = currentValues.filter(v => v !== option.value)
      } else {
        newValues = [...currentValues, option.value]
      }

      onChange && onChange(newValues)
    } else {
      onChange && onChange(option.value)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const isOptionSelected = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      return currentValues.includes(option.value)
    }
    return value === option.value
  }

  const getDisplayText = () => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.length === 0) return placeholder

      if (currentValues.length === 1) {
        const selectedOption = options.find(opt => opt.value === currentValues[0])
        return selectedOption ? selectedOption.label : placeholder
      }

      return `${currentValues.length} sélectionnés`
    } else {
      const selectedOption = options.find(opt => opt.value === value)
      return selectedOption ? selectedOption.label : placeholder
    }
  }

  const clearSelection = (e) => {
    e.stopPropagation()
    if (multiple) {
      onChange && onChange([])
    } else {
      onChange && onChange(null)
    }
  }

  const hasSelection = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== ''

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full px-3 py-2 text-left bg-white border rounded-lg shadow-sm cursor-default
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
          ${disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
            : 'text-gray-900 border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`block truncate ${!hasSelection ? 'text-gray-500' : ''}`}>
            {getDisplayText()}
          </span>
          <div className="flex items-center space-x-1">
            {hasSelection && !disabled && (
              <button
                onClick={clearSelection}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                type="button"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <ChevronDownIcon
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune option disponible'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = isOptionSelected(option)

                return (
                  <button
                    key={option.value || index}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm flex items-center justify-between
                      hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                      ${isSelected ? 'bg-accent-50 text-accent-900' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center">
                      {option.icon && (
                        <span className="mr-2 text-gray-400">
                          {option.icon}
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="ml-2 text-xs text-gray-500">
                          {option.description}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <CheckIcon className="w-4 h-4 text-accent-600" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterSelect