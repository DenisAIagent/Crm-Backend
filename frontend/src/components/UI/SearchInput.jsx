import React, { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

function SearchInput({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = "Rechercher...",
  className = "",
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  debounceMs = 300,
  size = 'md'
}) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Mettre à jour la valeur locale quand la prop value change
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Auto focus si demandé
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounce la recherche
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (onChange) {
        onChange(localValue)
      }
      if (onSearch) {
        onSearch(localValue)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localValue, onChange, onSearch, debounceMs])

  const handleInputChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
    if (onClear) {
      onClear()
    }
    if (onChange) {
      onChange('')
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (onSearch) {
        onSearch(localValue)
      }
    }
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-8',
          input: 'text-xs px-3',
          icon: 'w-3 h-3',
          clearButton: 'w-4 h-4'
        }
      case 'lg':
        return {
          container: 'h-12',
          input: 'text-base px-4',
          icon: 'w-5 h-5',
          clearButton: 'w-5 h-5'
        }
      default: // md
        return {
          container: 'h-10',
          input: 'text-sm px-3',
          icon: 'w-4 h-4',
          clearButton: 'w-4 h-4'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative flex items-center
          ${sizeClasses.container}
          bg-white border rounded-lg shadow-sm transition-all duration-200
          ${isFocused
            ? 'border-accent-500 ring-2 ring-accent-500/20'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Icône de recherche */}
        <MagnifyingGlassIcon
          className={`
            absolute left-3 ${sizeClasses.icon}
            ${disabled ? 'text-gray-400' : 'text-gray-500'}
          `}
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 border-0 bg-transparent
            ${sizeClasses.input}
            placeholder-gray-500 text-gray-900
            focus:outline-none focus:ring-0
            ${disabled ? 'cursor-not-allowed text-gray-400' : ''}
          `}
        />

        {/* Bouton de suppression */}
        {showClearButton && localValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute right-3 p-1 text-gray-400
              hover:text-gray-600 focus:outline-none
              focus:text-gray-600 transition-colors
            `}
          >
            <XMarkIcon className={sizeClasses.clearButton} />
          </button>
        )}
      </div>

      {/* Indicateur de recherche active */}
      {isFocused && localValue && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1">
          <div className="px-3 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded shadow-sm">
            Recherche: "{localValue}"
          </div>
        </div>
      )}
    </div>
  )
}

// Variantes prédéfinies pour différents usages
export function TableSearchInput({ onSearch, placeholder = "Filtrer les résultats...", ...props }) {
  return (
    <SearchInput
      onSearch={onSearch}
      placeholder={placeholder}
      size="sm"
      debounceMs={300}
      {...props}
    />
  )
}

export function GlobalSearchInput({ onSearch, placeholder = "Rechercher dans tout...", ...props }) {
  return (
    <SearchInput
      onSearch={onSearch}
      placeholder={placeholder}
      size="lg"
      debounceMs={500}
      autoFocus
      {...props}
    />
  )
}

export function QuickSearchInput({ onSearch, placeholder = "Recherche rapide...", ...props }) {
  return (
    <SearchInput
      onSearch={onSearch}
      placeholder={placeholder}
      size="md"
      debounceMs={100}
      {...props}
    />
  )
}

// Hook pour gérer l'état de recherche
export function useSearch(initialValue = '', debounceMs = 300) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchValue, debounceMs])

  const clearSearch = () => {
    setSearchValue('')
    setDebouncedValue('')
  }

  return {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isSearching: searchValue !== debouncedValue
  }
}

export default SearchInput