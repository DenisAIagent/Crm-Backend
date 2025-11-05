import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  EnvelopeIcon,
  CloudIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    timezone: 'Europe/Paris',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,

    // Security
    twoFactorAuth: false,
    sessionTimeout: '60',
    loginAlerts: true,

    // Appearance
    theme: theme || 'light',
    sidebarCollapsed: false,
    showAvatars: true,

    // Integration
    googleAnalytics: '',
    webhookUrl: '',
    apiKey: '••••••••••••••••'
  })

  const tabs = [
    { id: 'general', name: 'Général', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Apparence', icon: PaintBrushIcon },
    { id: 'integrations', name: 'Intégrations', icon: CloudIcon },
    { id: 'team', name: 'Équipe', icon: UserGroupIcon }
  ]

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))

    // Special handling for theme
    if (key === 'theme') {
      setTheme(value)
    }
  }

  const handleSave = () => {
    // API call would go here
    console.log('Saving settings:', settings)
    alert('Paramètres sauvegardés avec succès!')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fuseau horaire
        </label>
        <select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
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
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format de date
        </label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {[
        { key: 'emailNotifications', label: 'Notifications email', description: 'Recevoir des notifications par email' },
        { key: 'pushNotifications', label: 'Notifications push', description: 'Recevoir des notifications dans le navigateur' },
        { key: 'weeklyReports', label: 'Rapports hebdomadaires', description: 'Recevoir un résumé chaque semaine' },
        { key: 'marketingEmails', label: 'Emails marketing', description: 'Recevoir des informations sur les nouveautés' }
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={(e) => handleSettingChange(item.key, e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
        </div>
      ))}
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Authentification à deux facteurs</div>
          <div className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</div>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.twoFactorAuth}
            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeout de session (minutes)
        </label>
        <select
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="30">30 minutes</option>
          <option value="60">1 heure</option>
          <option value="240">4 heures</option>
          <option value="480">8 heures</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Alertes de connexion</div>
          <div className="text-sm text-gray-500">Être notifié des nouvelles connexions</div>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.loginAlerts}
            onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thème
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['light', 'dark', 'auto'].map((themeOption) => (
            <label
              key={themeOption}
              className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${
                settings.theme === themeOption
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={themeOption}
                checked={settings.theme === themeOption}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="sr-only"
              />
              <span className="capitalize">
                {themeOption === 'light' ? 'Clair' :
                 themeOption === 'dark' ? 'Sombre' : 'Automatique'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Sidebar réduite</div>
          <div className="text-sm text-gray-500">Réduire la barre latérale par défaut</div>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.sidebarCollapsed}
            onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Afficher les avatars</div>
          <div className="text-sm text-gray-500">Afficher les photos de profil des utilisateurs</div>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showAvatars}
            onChange={(e) => handleSettingChange('showAvatars', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Analytics ID
        </label>
        <input
          type="text"
          value={settings.googleAnalytics}
          onChange={(e) => handleSettingChange('googleAnalytics', e.target.value)}
          placeholder="GA-XXXXXXXX-X"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Webhook
        </label>
        <input
          type="url"
          value={settings.webhookUrl}
          onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
          placeholder="https://example.com/webhook"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé API
        </label>
        <div className="flex">
          <input
            type="password"
            value={settings.apiKey}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
          />
          <button className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700">
            Régénérer
          </button>
        </div>
      </div>
    </div>
  )

  const renderTeamSettings = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Paramètres d'équipe en cours de développement</p>
        <p className="text-sm text-gray-500 mt-2">
          Cette section permettra de gérer les paramètres partagés de l'équipe
        </p>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings()
      case 'notifications': return renderNotificationSettings()
      case 'security': return renderSecuritySettings()
      case 'appearance': return renderAppearanceSettings()
      case 'integrations': return renderIntegrationSettings()
      case 'team': return renderTeamSettings()
      default: return renderGeneralSettings()
    }
  }

  return (
    <>
      <Helmet>
        <title>Paramètres - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paramètres
          </h1>
          <p className="text-gray-600">
            Configurez votre expérience utilisateur et les préférences du système
          </p>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
              </div>

              {renderTabContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-sm text-blue-800">
              <strong>Note :</strong> Certains paramètres nécessitent une reconnexion pour prendre effet.
              Les modifications sont automatiquement sauvegardées.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage