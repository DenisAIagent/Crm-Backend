import React, { useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button, { SaveButton, CancelButton } from '@/components/UI/Button'

function QuickAddLead({ onAdd, onCancel, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    artistName: '',
    phone: '',
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est requis')
      return false
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format d\'email invalide')
      return false
    }
    if (!formData.artistName.trim()) {
      setError('Le nom d\'artiste est requis')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await onAdd({
        ...formData,
        status: 'new',
        source: 'manual',
        createdAt: new Date().toISOString()
      })

      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        artistName: '',
        phone: '',
        company: ''
      })
      setIsExpanded(false)
    } catch (err) {
      setError('Erreur lors de l\'ajout du lead')
      console.error('Error adding lead:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      artistName: '',
      phone: '',
      company: ''
    })
    setError('')
    setIsExpanded(false)
    if (onCancel) {
      onCancel()
    }
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setError('')
  }

  if (!isExpanded) {
    return (
      <div className={`${className}`}>
        <button
          onClick={handleExpand}
          className="flex items-center justify-center w-full p-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors group"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Ajouter un lead rapidement</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            Nouveau lead rapide
          </h3>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nom d'artiste *
            </label>
            <input
              type="text"
              value={formData.artistName}
              onChange={(e) => handleInputChange('artistName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="John Doe Music"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Entreprise/Label
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Music Label Inc."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
            <CancelButton
              onClick={handleCancel}
              disabled={loading}
              size="sm"
            >
              Annuler
            </CancelButton>
            <SaveButton
              type="submit"
              loading={loading}
              disabled={loading}
              size="sm"
            >
              Ajouter
            </SaveButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickAddLead