import React, { useState } from 'react'
import {
  XMarkIcon,
  PlusIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  MusicalNoteIcon,
  UserIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import {
  SpotifyIcon,
  YouTubeIcon,
  TikTokIcon,
  MetaIcon,
  GoogleIcon
} from '@/components/UI/MusicIcons'
import NewClientModal from './NewClientModal'

const platforms = [
  { id: 'spotify', name: 'Spotify', icon: SpotifyIcon, color: '#1DB954' },
  { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '#FF0000' },
  { id: 'meta', name: 'Meta', icon: MetaIcon, color: '#1877F2' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: '#FF0050' },
  { id: 'google', name: 'Google Ads', icon: GoogleIcon, color: '#4285F4' }
]

const genres = [
  'Pop', 'Hip-Hop', 'Rock', 'Électronique', 'Folk', 'Jazz', 'Classical',
  'R&B', 'Country', 'Reggae', 'Metal', 'Indie', 'Alternative', 'Ambient'
]

const objectives = [
  { id: 'streams', label: 'Augmenter les streams', icon: MusicalNoteIcon },
  { id: 'awareness', label: 'Notoriété de marque', icon: SparklesIcon },
  { id: 'engagement', label: 'Engagement social', icon: UserIcon },
  { id: 'reach', label: 'Portée géographique', icon: GlobeAltIcon }
]

function CampaignModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    track: '',
    album: '',
    genre: '',
    platform: '',
    objective: '',
    budget: '',
    startDate: '',
    endDate: '',
    targetCountries: [],
    description: '',
    client: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientAddress: '',
    clientCity: '',
    clientPostalCode: '',
    clientCountry: 'France',
    clientSiret: '',
    clientTva: ''
  })

  const [errors, setErrors] = useState({})
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [selectedClientData, setSelectedClientData] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleNewClientSubmit = (clientData) => {
    // Mettre à jour les données du formulaire avec les informations du client
    setFormData(prev => ({
      ...prev,
      ...clientData,
      client: 'new'
    }))
    setSelectedClientData(clientData)
    setShowNewClientModal(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom de la campagne est requis'
    if (!formData.artist.trim()) newErrors.artist = 'Le nom de l\'artiste est requis'
    if (!formData.track.trim()) newErrors.track = 'Le titre est requis'
    if (!formData.platform) newErrors.platform = 'La plateforme est requise'
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Le budget doit être supérieur à 0'
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise'
    if (!formData.endDate) newErrors.endDate = 'La date de fin est requise'
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({
        ...formData,
        budget: parseFloat(formData.budget),
        status: 'draft',
        createdAt: new Date().toISOString()
      })

      // Reset form
      setFormData({
        name: '',
        artist: '',
        track: '',
        album: '',
        genre: '',
        platform: '',
        objective: '',
        budget: '',
        startDate: '',
        endDate: '',
        targetCountries: [],
        description: '',
        client: '',
        clientEmail: '',
        clientPhone: '',
        clientCompany: '',
        clientAddress: '',
        clientCity: '',
        clientPostalCode: '',
        clientCountry: 'France',
        clientSiret: '',
        clientTva: ''
      })
      setErrors({})
      setShowNewClientModal(false)
      setSelectedClientData(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative rounded-3xl shadow-2xl w-full max-w-4xl border"
             style={{ backgroundColor: '#0f0f0f', borderColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(229, 9, 20, 0.25)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(229, 9, 20, 0.05)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border"
                   style={{ backgroundColor: '#e50914', borderColor: '#ffffff' }}>
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Nouvelle Campagne
                </h2>
                <p className="text-sm opacity-80" style={{ color: '#ffffff' }}>
                  Créez une campagne pour promouvoir votre musique
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
            {/* Section 1: Informations de base et Client - Layout côte à côte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                  <MusicalNoteIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                  Informations de base
                </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nom de la campagne *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.name ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.name ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="Ex: Nom de campagne"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nom de l'artiste *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => handleChange('artist', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.artist ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.artist ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="Ex: Nom de l'artiste"
                  />
                  {errors.artist && <p className="text-red-500 text-sm mt-1">{errors.artist}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Titre du morceau *
                  </label>
                  <input
                    type="text"
                    value={formData.track}
                    onChange={(e) => handleChange('track', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.track ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: errors.track ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="Ex: Titre du morceau"
                  />
                  {errors.track && <p className="text-red-500 text-sm mt-1">{errors.track}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Album (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={(e) => handleChange('album', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    placeholder="Ex: Nom de l'album"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Genre musical
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => handleChange('genre', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    <option value="">Sélectionner un genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              </div>

              {/* Client */}
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                  <UserIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                  Client
                </h3>

                <div className="space-y-4">
                  {/* Sélecteur de client existant */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Sélectionner un client
                    </label>
                    <select
                      value={formData.client}
                      onChange={(e) => handleChange('client', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      <option value="">Sélectionner un client existant</option>
                    </select>
                  </div>

                  {/* Bouton nouveau client */}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowNewClientModal(true)}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-200 hover:scale-105 w-full justify-center"
                      style={{
                        backgroundColor: 'rgba(229, 9, 20, 0.1)',
                        borderColor: '#e50914',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e50914'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.1)'
                      }}
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span className="font-medium">Ajouter un nouveau client</span>
                    </button>
                  </div>

                  {/* Affichage du client sélectionné */}
                  {selectedClientData && (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(229, 9, 20, 0.05)', borderColor: 'rgba(229, 9, 20, 0.2)' }}>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: '#e50914' }}>
                        ✅ Nouveau client ajouté
                      </h4>
                      <p className="text-sm text-white font-medium">
                        {selectedClientData.clientCompany}
                      </p>
                      <p className="text-xs text-white/70">
                        {selectedClientData.clientEmail}
                      </p>
                      {selectedClientData.clientCity && (
                        <p className="text-xs text-white/70">
                          {selectedClientData.clientCity}, {selectedClientData.clientCountry}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Plateforme et Objectif */}
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                <SparklesIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                Plateforme et Objectif
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Plateforme de diffusion *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {platforms.map(platform => {
                      const IconComponent = platform.icon
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => handleChange('platform', platform.id)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                            formData.platform === platform.id
                              ? 'shadow-lg'
                              : 'hover:border-gray-500'
                          )}
                          style={{
                            backgroundColor: formData.platform === platform.id ? '#e50914' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: formData.platform === platform.id ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          <IconComponent
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: formData.platform === platform.id ? '#ffffff' : platform.color }}
                          />
                          <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                            {platform.name}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                  {errors.platform && <p className="text-red-500 text-sm mt-2">{errors.platform}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Objectif de la campagne
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {objectives.map(objective => {
                      const IconComponent = objective.icon
                      return (
                        <button
                          key={objective.id}
                          type="button"
                          onClick={() => handleChange('objective', objective.id)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-left',
                            formData.objective === objective.id
                              ? 'shadow-lg'
                              : 'hover:border-gray-500'
                          )}
                          style={{
                            backgroundColor: formData.objective === objective.id ? '#e50914' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: formData.objective === objective.id ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          <div className="flex items-center">
                            <IconComponent className="w-5 h-5 mr-3" style={{ color: '#ffffff' }} />
                            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                              {objective.label}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Budget et Calendrier */}
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#e50914' }}>
                <CurrencyEuroIcon className="w-5 h-5 mr-2" style={{ color: '#e50914' }} />
                Budget et Calendrier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Budget total (€) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white placeholder-gray-500',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.budget ? 'border-red-500' : 'border-white'
                    )}
                    style={{ backgroundColor: '#000000', borderColor: errors.budget ? '#ef4444' : '#ffffff' }}
                    placeholder="2500"
                  />
                  {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.startDate ? 'border-red-500' : 'border-white'
                    )}
                    style={{
                      backgroundColor: '#000000',
                      borderColor: errors.startDate ? '#ef4444' : '#ffffff',
                      colorScheme: 'dark'
                    }}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      'bg-black text-white',
                      'focus:ring-2 focus:ring-red-500 focus:border-transparent',
                      errors.endDate ? 'border-red-500' : 'border-white'
                    )}
                    style={{
                      backgroundColor: '#000000',
                      borderColor: errors.endDate ? '#ef4444' : '#ffffff',
                      colorScheme: 'dark'
                    }}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description de la campagne
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ backgroundColor: '#000000', borderColor: '#ffffff' }}
                placeholder="Décrivez les objectifs, la stratégie et les particularités de cette campagne..."
              />
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
                Créer la campagne
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Nouveau Client */}
      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSubmit={handleNewClientSubmit}
        initialData={{
          clientCompany: formData.clientCompany,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientAddress: formData.clientAddress,
          clientCity: formData.clientCity,
          clientPostalCode: formData.clientPostalCode,
          clientCountry: formData.clientCountry,
          clientSiret: formData.clientSiret,
          clientTva: formData.clientTva
        }}
      />
    </div>
  )
}

export default CampaignModal