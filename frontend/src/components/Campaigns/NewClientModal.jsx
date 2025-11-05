import React, { useState } from 'react'
import {
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'

function NewClientModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  const [clientData, setClientData] = useState({
    clientCompany: initialData.clientCompany || '',
    clientEmail: initialData.clientEmail || '',
    clientPhone: initialData.clientPhone || '',
    clientAddress: initialData.clientAddress || '',
    clientCity: initialData.clientCity || '',
    clientPostalCode: initialData.clientPostalCode || '',
    clientCountry: initialData.clientCountry || 'France',
    clientSiret: initialData.clientSiret || '',
    clientTva: initialData.clientTva || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setClientData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!clientData.clientCompany.trim()) newErrors.clientCompany = 'Le nom du client est requis'
    if (!clientData.clientEmail.trim()) newErrors.clientEmail = 'L\'email est requis'
    if (!clientData.clientAddress.trim()) newErrors.clientAddress = 'L\'adresse est requise'
    if (!clientData.clientCity.trim()) newErrors.clientCity = 'La ville est requise'
    if (!clientData.clientPostalCode.trim()) newErrors.clientPostalCode = 'Le code postal est requis'

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (clientData.clientEmail && !emailRegex.test(clientData.clientEmail)) {
      newErrors.clientEmail = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(clientData)
      // Reset form
      setClientData({
        clientCompany: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        clientPostalCode: '',
        clientCountry: 'France',
        clientSiret: '',
        clientTva: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative rounded-3xl shadow-2xl w-full max-w-2xl border"
             style={{ backgroundColor: '#0f0f0f', borderColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(229, 9, 20, 0.25)' }}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(229, 9, 20, 0.05)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                   style={{ backgroundColor: '#e50914', borderColor: '#ffffff' }}>
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Nouveau Client
                </h2>
                <p className="text-sm opacity-80" style={{ color: '#ffffff' }}>
                  Ajoutez les informations de facturation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105 border"
              style={{
                color: '#ffffff',
                backgroundColor: 'transparent',
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e50914'
                e.currentTarget.style.borderColor = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Section 1: Informations de contact */}
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                <UserIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                Informations de contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nom du client / Artiste *
                  </label>
                  <input
                    type="text"
                    value={clientData.clientCompany}
                    onChange={(e) => handleChange('clientCompany', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.clientCompany ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.clientCompany ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="Ex: Nom du client"
                  />
                  {errors.clientCompany && <p className="text-red-500 text-sm mt-1">{errors.clientCompany}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    value={clientData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.clientEmail ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.clientEmail ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="client@exemple.com"
                  />
                  {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={clientData.clientPhone}
                    onChange={(e) => handleChange('clientPhone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Adresse de facturation */}
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                <MapPinIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                Adresse de facturation
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Adresse complète *
                  </label>
                  <input
                    type="text"
                    value={clientData.clientAddress}
                    onChange={(e) => handleChange('clientAddress', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.clientAddress ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.clientAddress ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="123 Rue de la Musique"
                  />
                  {errors.clientAddress && <p className="text-red-500 text-sm mt-1">{errors.clientAddress}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={clientData.clientCity}
                      onChange={(e) => handleChange('clientCity', e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                        'bg-black text-white placeholder-gray-500',
                        'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                        errors.clientCity ? 'border-red-500' : 'border-white'
                      )}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.clientCity ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                      placeholder="Paris"
                    />
                    {errors.clientCity && <p className="text-red-500 text-sm mt-1">{errors.clientCity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={clientData.clientPostalCode}
                      onChange={(e) => handleChange('clientPostalCode', e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                        'bg-black text-white placeholder-gray-500',
                        'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                        errors.clientPostalCode ? 'border-red-500' : 'border-white'
                      )}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.clientPostalCode ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                      placeholder="75001"
                    />
                    {errors.clientPostalCode && <p className="text-red-500 text-sm mt-1">{errors.clientPostalCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Pays
                    </label>
                    <select
                      value={clientData.clientCountry}
                      onChange={(e) => handleChange('clientCountry', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Informations légales */}
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                <IdentificationIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                Informations légales (optionnel)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={clientData.clientSiret}
                    onChange={(e) => handleChange('clientSiret', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="12345678901234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    N° TVA intracommunautaire
                  </label>
                  <input
                    type="text"
                    value={clientData.clientTva}
                    onChange={(e) => handleChange('clientTva', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  borderColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border"
                style={{
                  color: '#ffffff',
                  backgroundColor: '#e50914',
                  borderColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5070f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e50914'
                }}
              >
                Ajouter le client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewClientModal