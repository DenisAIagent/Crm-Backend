import React, { useState, useEffect } from 'react'
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, CurrencyEuroIcon, CalendarIcon, BriefcaseIcon, MusicalNoteIcon, StarIcon, MapPinIcon, IdentificationIcon, PlusIcon } from '@heroicons/react/24/outline'
import Button, { SaveButton, CancelButton } from '@/components/UI/Button'
import ErrorMessage from '@/components/UI/ErrorMessage'
import NewClientModal from '@/components/Campaigns/NewClientModal'

function LeadModal({
  isOpen,
  onClose,
  lead = null,
  onSave,
  mode = 'create' // 'create', 'edit', 'view'
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    artistName: '',
    genre: '',
    platform: '',
    budget: '',
    status: 'new',
    notes: '',
    source: 'website',
    // Relation avec l'entreprise de facturation
    billingCompanyId: '',
    billingCompanyName: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [availableCompanies, setAvailableCompanies] = useState([])

  // Charger les entreprises disponibles
  useEffect(() => {
    if (isOpen) {
      loadAvailableCompanies()
    }
  }, [isOpen])

  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        artistName: lead.artistName || '',
        genre: lead.genre || '',
        platform: lead.platform || '',
        budget: lead.budget || '',
        status: lead.status || 'new',
        notes: lead.notes || '',
        source: lead.source || 'website',
        billingCompanyId: lead.billingCompanyId || '',
        billingCompanyName: lead.billingCompanyName || ''
      })
    } else {
      // Reset form for new lead
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        artistName: '',
        genre: '',
        platform: '',
        budget: '',
        status: 'new',
        notes: '',
        source: 'website',
        billingCompanyId: '',
        billingCompanyName: ''
      })
    }
    setErrors({})
  }, [lead, isOpen])

  const loadAvailableCompanies = async () => {
    try {
      // Ici tu peux charger les entreprises depuis ton API
      // const response = await fetch('/api/companies')
      // const companies = await response.json()
      // setAvailableCompanies(companies)

      // Pour l'instant, je simule quelques entreprises
      setAvailableCompanies([
        { id: '1', name: 'Universal Music Group', siret: '12345678901234' },
        { id: '2', name: 'Warner Music France', siret: '98765432109876' },
        { id: '3', name: 'Sony Music Entertainment', siret: '11223344556677' }
      ])
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleNewClientCreated = (clientData) => {
    // Ajouter la nouvelle entreprise à la liste
    const newCompany = {
      id: Date.now().toString(), // ID temporaire
      name: clientData.clientCompany,
      siret: clientData.clientSiret || ''
    }
    setAvailableCompanies(prev => [...prev, newCompany])

    // Sélectionner automatiquement la nouvelle entreprise
    handleInputChange('billingCompanyId', newCompany.id)
    handleInputChange('billingCompanyName', newCompany.name)

    setShowNewClientModal(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    if (!formData.artistName.trim()) {
      newErrors.artistName = 'Le nom d\'artiste est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await onSave(formData, lead?.id)
      onClose()
    } catch (error) {
      console.error('Error saving lead:', error)
      setErrors({ submit: 'Erreur lors de la sauvegarde' })
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'new', label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contacté', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualifié', color: 'bg-green-100 text-green-800' },
    { value: 'proposal', label: 'Proposition', color: 'bg-purple-100 text-purple-800' },
    { value: 'closed-won', label: 'Gagné', color: 'bg-green-100 text-green-800' },
    { value: 'closed-lost', label: 'Perdu', color: 'bg-red-100 text-red-800' }
  ]

  const sourceOptions = [
    { value: 'website', label: 'Site web' },
    { value: 'social', label: 'Réseaux sociaux' },
    { value: 'referral', label: 'Référence' },
    { value: 'advertising', label: 'Publicité' },
    { value: 'event', label: 'Événement' },
    { value: 'other', label: 'Autre' }
  ]

  const platformOptions = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'deezer', label: 'Deezer' },
    { value: 'apple-music', label: 'Apple Music' },
    { value: 'soundcloud', label: 'SoundCloud' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'multiple', label: 'Multiples plateformes' }
  ]

  if (!isOpen) return null

  const isReadOnly = mode === 'view'
  const title = mode === 'create' ? 'Nouveau Lead' : mode === 'edit' ? 'Modifier le Lead' : 'Détails du Lead'

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay avec effet de flou */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative rounded-3xl shadow-2xl w-full max-w-4xl border transform transition-all duration-300 scale-100"
          style={{
            backgroundColor: '#0f0f0f',
            borderColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(229, 9, 20, 0.25)'
          }}
        >
          {/* Header avec design moderne */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(229, 9, 20, 0.05)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border"
                style={{ backgroundColor: '#e50914', borderColor: '#ffffff' }}
              >
                {mode === 'create' ? (
                  <UserIcon className="w-7 h-7 text-white" />
                ) : mode === 'edit' ? (
                  <StarIcon className="w-7 h-7 text-white" />
                ) : (
                  <BriefcaseIcon className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {title}
                </h2>
                <p className="text-sm opacity-80" style={{ color: '#ffffff' }}>
                  {mode === 'create' ? 'Ajouter un nouveau prospect' :
                   mode === 'edit' ? 'Modifier les informations' :
                   'Consulter les détails'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl transition-all duration-200 hover:scale-105 border"
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

          {/* Form avec design moderne */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {errors.submit && (
              <div
                className="p-4 rounded-xl border flex items-center space-x-3"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#ef4444'
                }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {!isReadOnly && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-white">Progression du formulaire</h4>
                  <span className="text-xs font-medium" style={{ color: '#e50914' }}>
                    {Object.keys(formData).filter(key => formData[key]).length}/{Object.keys(formData).length} champs complétés
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${((Object.keys(formData).filter(key => formData[key]).length / Object.keys(formData).length) * 100)}%`,
                      background: 'linear-gradient(90deg, #e50914 0%, #ff1e2d 100%)'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Section 1: Informations personnelles */}
              <div
                className="rounded-2xl p-6 border space-y-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                    style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', borderColor: '#e50914' }}
                  >
                    <UserIcon className="w-6 h-6" style={{ color: '#e50914' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#e50914' }}>
                      Contact Principal
                    </h3>
                    <p className="text-sm text-white/60">
                      Informations de base du prospect
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Prénom *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Prénom du contact"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.firstName ? '#ef4444' : 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.firstName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nom *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Nom de famille"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.lastName ? '#ef4444' : 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.lastName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <EnvelopeIcon className="w-4 h-4 mr-2" style={{ color: '#e50914' }} />
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="contact@exemple.com"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                      </div>
                    ) : formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    ) : null}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <PhoneIcon className="w-4 h-4 mr-2" style={{ color: '#e50914' }} />
                    Téléphone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" style={{ color: '#e50914' }} />
                    Entreprise/Label
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Nom de l'entreprise ou du label"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.company && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Informations projet */}
              <div
                className="rounded-2xl p-6 border space-y-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                    style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', borderColor: '#e50914' }}
                  >
                    <MusicalNoteIcon className="w-6 h-6" style={{ color: '#e50914' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#e50914' }}>
                      Projet Musical
                    </h3>
                    <p className="text-sm text-white/60">
                      Détails du projet et budget
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nom d'artiste *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.artistName}
                      onChange={(e) => handleInputChange('artistName', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Nom de scène ou nom d'artiste"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.artistName ? '#ef4444' : 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.artistName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                  {errors.artistName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                      {errors.artistName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Genre musical
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Ex: Pop, Hip-Hop, Électro..."
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    {formData.genre && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Plateforme cible
                  </label>
                  <div className="relative">
                    <select
                      value={formData.platform}
                      onChange={(e) => handleInputChange('platform', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>Sélectionner une plateforme...</option>
                      {platformOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {formData.platform && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <CurrencyEuroIcon className="w-4 h-4 mr-2" style={{ color: '#e50914' }} />
                    Budget estimé
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="5000"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      €
                    </div>
                    {formData.budget && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Statut du lead
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {formData.status && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white"
                          style={{
                            backgroundColor: formData.status === 'new' ? '#3b82f6' :
                                           formData.status === 'contacted' ? '#f59e0b' :
                                           formData.status === 'qualified' ? '#10b981' :
                                           formData.status === 'proposal' ? '#8b5cf6' :
                                           formData.status === 'closed-won' ? '#10b981' :
                                           formData.status === 'closed-lost' ? '#ef4444' : '#6b7280'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Source d'acquisition
                  </label>
                  <div className="relative">
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                      style={{
                        backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {sourceOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {formData.source && (
                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Entreprise de Facturation */}
            <div
              className="rounded-2xl p-6 border space-y-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                    style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', borderColor: '#e50914' }}
                  >
                    <BuildingOfficeIcon className="w-6 h-6" style={{ color: '#e50914' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#e50914' }}>
                      Entreprise de Facturation
                    </h3>
                    <p className="text-sm text-white/60">
                      Sélectionner ou créer une entreprise
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Entreprise de facturation
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <select
                        value={formData.billingCompanyId}
                        onChange={(e) => {
                          const selectedCompany = availableCompanies.find(c => c.id === e.target.value)
                          handleInputChange('billingCompanyId', e.target.value)
                          handleInputChange('billingCompanyName', selectedCompany?.name || '')
                        }}
                        disabled={isReadOnly}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
                        style={{
                          backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                          Sélectionner une entreprise...
                        </option>
                        {availableCompanies.map(company => (
                          <option key={company.id} value={company.id} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                            {company.name} {company.siret && `(${company.siret})`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {formData.billingCompanyId && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                        </div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setShowNewClientModal(true)}
                        className="px-4 py-3 border rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                        style={{
                          color: '#e50914',
                          backgroundColor: 'rgba(229, 9, 20, 0.1)',
                          borderColor: '#e50914'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.1)'
                        }}
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span className="whitespace-nowrap">Nouvelle</span>
                      </button>
                    )}
                  </div>
                </div>

                {formData.billingCompanyName && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
                      <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                        Entreprise sélectionnée : {formData.billingCompanyName}
                      </p>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      Cette entreprise sera utilisée pour la facturation de ce lead.
                    </p>
                  </div>
                )}

                {!formData.billingCompanyId && (
                  <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-sm text-white/60">
                      💡 <strong>Astuce :</strong> Plusieurs artistes peuvent être rattachés à la même entreprise de facturation.
                      Sélectionnez une entreprise existante ou créez-en une nouvelle.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Notes */}
            <div
              className="rounded-2xl p-6 border space-y-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                  style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', borderColor: '#e50914' }}
                >
                  <svg className="w-6 h-6" style={{ color: '#e50914' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#e50914' }}>
                    Notes & Commentaires
                  </h3>
                  <p className="text-sm text-white/60">
                    Informations supplémentaires
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={isReadOnly}
                  rows={4}
                  placeholder="Ajoutez des notes, commentaires ou détails supplémentaires sur ce prospect..."
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  style={{
                    backgroundColor: isReadOnly ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                />
                {formData.notes && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Actions avec design moderne */}
            {!isReadOnly && (
              <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    borderColor: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: '#ffffff',
                    backgroundColor: '#e50914',
                    borderColor: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#c5070f'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#e50914'
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'create' ? 'Créer le Lead' : 'Sauvegarder'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal pour créer une nouvelle entreprise */}
      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSubmit={handleNewClientCreated}
      />
    </div>
  )
}

export default LeadModal