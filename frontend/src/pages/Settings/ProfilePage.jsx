import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'

function ProfilePage() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Denis',
    lastName: user?.lastName || 'Adam',
    email: user?.email || 'denis@mdmc.fr',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Musique, 75001 Paris',
    bio: 'Directeur général de MDMC Music Ads, spécialisé dans la promotion d\'artistes émergents.',
    timezone: 'Europe/Paris',
    language: 'fr'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    leadUpdates: true,
    campaignAlerts: false
  })

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ]

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData)
    alert('Profil mis à jour avec succès!')
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas!')
      return
    }
    console.log('Changing password')
    alert('Mot de passe modifié avec succès!')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notificationSettings)
    alert('Préférences de notifications sauvegardées!')
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">
              {profileData.firstName[0]}{profileData.lastName[0]}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700">
            <CameraIcon className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Photo de profil</h3>
          <p className="text-sm text-gray-500">
            JPG, PNG ou GIF. Maximum 2MB.
          </p>
          <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Changer la photo
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <div className="relative">
            <PhoneIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse
        </label>
        <div className="relative">
          <MapPinIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <textarea
            value={profileData.address}
            onChange={(e) => handleProfileChange('address', e.target.value)}
            rows={3}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Biographie
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleProfileChange('bio', e.target.value)}
          rows={4}
          placeholder="Parlez-nous de vous..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuseau horaire
          </label>
          <select
            value={profileData.timezone}
            onChange={(e) => handleProfileChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Langue
          </label>
          <select
            value={profileData.language}
            onChange={(e) => handleProfileChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveProfile}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Changer le mot de passe
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Modifier le mot de passe
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Authentification à deux facteurs
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Configurer
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sessions actives
        </h3>

        <div className="space-y-3">
          {[
            {
              device: 'MacBook Pro - Chrome',
              location: 'Paris, France',
              current: true,
              lastActivity: 'Il y a 2 minutes'
            },
            {
              device: 'iPhone - Safari',
              location: 'Paris, France',
              current: false,
              lastActivity: 'Il y a 1 heure'
            }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Session actuelle
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.location} • {session.lastActivity}
                  </div>
                </div>
              </div>
              {!session.current && (
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Préférences de notifications
        </h3>

        <div className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              label: 'Notifications par email',
              description: 'Recevoir des notifications importantes par email'
            },
            {
              key: 'pushNotifications',
              label: 'Notifications push',
              description: 'Recevoir des notifications dans le navigateur'
            },
            {
              key: 'weeklyReports',
              label: 'Rapports hebdomadaires',
              description: 'Recevoir un résumé de vos performances chaque semaine'
            },
            {
              key: 'leadUpdates',
              label: 'Mises à jour des leads',
              description: 'Être notifié des changements sur vos leads'
            },
            {
              key: 'campaignAlerts',
              label: 'Alertes de campagnes',
              description: 'Recevoir des alertes sur les performances de campagnes'
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900">{setting.label}</div>
                <div className="text-sm text-gray-500">{setting.description}</div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key]}
                  onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveNotifications}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Sauvegarder les préférences
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab()
      case 'security': return renderSecurityTab()
      case 'notifications': return renderNotificationsTab()
      default: return renderProfileTab()
    }
  }

  return (
    <>
      <Helmet>
        <title>Mon Profil - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600">{profileData.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Membre depuis juin 2023
                <ClockIcon className="w-4 h-4 ml-4 mr-1" />
                Dernière connexion : aujourd'hui
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage