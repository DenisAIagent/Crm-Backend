import axios from 'axios'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

// Configuration de base
// Normaliser l'URL de l'API (ajouter https:// si manquant)
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  
  // Log pour debug (seulement en développement)
  if (import.meta.env.DEV) {
    console.log('🔍 API URL Debug:', {
      'VITE_API_URL (raw)': envUrl || 'undefined',
      'Resolved URL': envUrl ? (envUrl.startsWith('http://') || envUrl.startsWith('https://') 
        ? envUrl 
        : `https://${envUrl}`) : 'https://crm-backend-production-f0c8.up.railway.app'
    })
  }
  
  if (!envUrl) {
    // Valeur par défaut : Railway backend
    const defaultUrl = 'https://crm-backend-production-f0c8.up.railway.app'
    if (import.meta.env.DEV) {
      console.warn('⚠️ VITE_API_URL non défini, utilisation de la valeur par défaut:', defaultUrl)
    }
    return defaultUrl
  }
  
  // Si l'URL ne commence pas par http:// ou https://, ajouter https://
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    return `https://${envUrl}`
  }
  
  return envUrl
}

const API_BASE_URL = getApiBaseUrl()
const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_MOCK_API === 'true'

// Mock data pour le mode frontend-only
const mockData = {
  user: {
    id: '1',
    firstName: 'Denis',
    lastName: 'Adam',
    email: 'denis@mdmc.fr',
    role: 'admin',
    team: 'management',
    permissions: {
      leads: { read: true, write: true, delete: true },
      campaigns: { read: true, write: true, delete: true },
      users: { read: true, write: true, delete: true },
      analytics: { read: true, write: true, delete: true }
    }
  },
  leads: [
    {
      _id: '1',
      artistName: 'The Midnight Sound',
      platform: 'Meta Ads',
      status: 'new',
      budget: 2500,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      artistName: 'Echo Valley',
      platform: 'Google Ads',
      status: 'contacted',
      budget: 1800,
      createdAt: new Date().toISOString()
    }
  ],
  campaigns: [
    {
      _id: '1',
      name: 'Summer Music Festival',
      platform: 'Meta Ads',
      status: 'active',
      budget: 5000,
      spent: 2300,
      createdAt: new Date().toISOString()
    }
  ]
}

// Fonction mock pour simuler des appels API
const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: data })
    }, delay)
  })
}

// Créer l'instance axios
// Log de l'URL utilisée pour debug
if (import.meta.env.DEV) {
  console.log('🚀 API Client initialisé avec baseURL:', `${API_BASE_URL}/api`)
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification
    const token = Cookies.get('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Ajouter un timestamp pour éviter le cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // Log des requêtes en développement (seulement si pas en mode demo)
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`REQUEST ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      })
    }

    return config
  },
  (error) => {
    console.error('Erreur de configuration de requête:', error)
    return Promise.reject(error)
  }
)

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    // Log des réponses en développement (seulement si debug activé)
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`SUCCESS ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log des erreurs en développement (seulement si debug activé)
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.error(`ERROR ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    }

    // Gestion de l'expiration du token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tenter de rafraîchir le token
        const refreshToken = Cookies.get('refreshToken')

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          })

          const { token } = response.data

          // Mettre à jour le cookie
          Cookies.set('authToken', token, {
            expires: 1,
            secure: import.meta.env.PROD,
            sameSite: 'strict'
          })

          // Relancer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Erreur de rafraîchissement du token:', refreshError)

        // Supprimer les tokens et rediriger vers la connexion
        Cookies.remove('authToken')
        Cookies.remove('refreshToken')

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Gestion des erreurs de réseau
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('La requête a expiré. Veuillez réessayer.')
      } else if (error.message === 'Network Error') {
        toast.error('Erreur de connexion. Vérifiez votre connexion internet.')
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer.')
      }
      return Promise.reject(error)
    }

    // Gestion des erreurs HTTP
    const { status, data } = error.response

    switch (status) {
      case 400:
        if (data.errors && Array.isArray(data.errors)) {
          // Erreurs de validation
          data.errors.forEach(err => {
            toast.error(err.msg || err.message || 'Erreur de validation')
          })
        } else {
          toast.error(data.message || 'Requête invalide')
        }
        break

      case 401:
        if (originalRequest.url !== '/auth/login') {
          toast.error('Session expirée. Veuillez vous reconnecter.')
        }
        break

      case 403:
        toast.error('Accès refusé. Permissions insuffisantes.')
        break

      case 404:
        toast.error('Ressource non trouvée.')
        break

      case 409:
        toast.error(data.message || 'Conflit de données.')
        break

      case 422:
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            toast.error(err.msg || err.message || 'Erreur de validation')
          })
        } else {
          toast.error(data.message || 'Données invalides')
        }
        break

      case 429:
        toast.error('Trop de requêtes. Veuillez patienter.')
        break

      case 500:
        toast.error('Erreur serveur. Veuillez réessayer plus tard.')
        break

      case 502:
      case 503:
      case 504:
        toast.error('Service temporairement indisponible.')
        break

      default:
        toast.error(data.message || 'Une erreur est survenue.')
        break
    }

    return Promise.reject(error)
  }
)

// Fonctions utilitaires pour les requêtes API

// Leads API
export const leadsAPI = {
  // Récupérer tous les leads
  getAll: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: mockData.leads, total: mockData.leads.length })
    }
    return api.get('/leads', { params })
  },

  // Récupérer un lead par ID
  getById: (id) => {
    if (IS_MOCK_MODE) {
      const lead = mockData.leads.find(l => l._id === id)
      return mockApiCall({ data: lead || null })
    }
    return api.get(`/leads/${id}`)
  },

  // Créer un lead
  create: (data) => {
    if (IS_MOCK_MODE) {
      const newLead = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      }
      mockData.leads.push(newLead)
      return mockApiCall({ data: newLead, message: 'Lead créé avec succès' })
    }
    return api.post('/leads', data)
  },

  // Mettre à jour un lead
  update: (id, data) => {
    if (IS_MOCK_MODE) {
      const index = mockData.leads.findIndex(l => l._id === id)
      if (index !== -1) {
        mockData.leads[index] = { ...mockData.leads[index], ...data }
        return mockApiCall({ data: mockData.leads[index], message: 'Lead mis à jour' })
      }
      return mockApiCall({ error: 'Lead non trouvé' }, 404)
    }
    return api.put(`/leads/${id}`, data)
  },

  // Supprimer un lead
  delete: (id) => {
    if (IS_MOCK_MODE) {
      const index = mockData.leads.findIndex(l => l._id === id)
      if (index !== -1) {
        mockData.leads.splice(index, 1)
        return mockApiCall({ message: 'Lead supprimé avec succès' })
      }
      return mockApiCall({ error: 'Lead non trouvé' }, 404)
    }
    return api.delete(`/leads/${id}`)
  },

  // Ajouter une note
  addNote: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Note ajoutée avec succès' })
    }
    return api.post(`/leads/${id}/notes`, data)
  },

  // Programmer un suivi
  scheduleFollowUp: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Suivi programmé avec succès' })
    }
    return api.post(`/leads/${id}/follow-ups`, data)
  },

  // Marquer un suivi comme terminé
  completeFollowUp: (id, followUpId) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Suivi marqué comme terminé' })
    }
    return api.put(`/leads/${id}/follow-ups/${followUpId}/complete`)
  },

  // Statistiques des leads
  getStats: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        total: mockData.leads.length,
        new: mockData.leads.filter(l => l.status === 'new').length,
        contacted: mockData.leads.filter(l => l.status === 'contacted').length,
        qualified: mockData.leads.filter(l => l.status === 'qualified').length,
        won: mockData.leads.filter(l => l.status === 'won').length,
        lost: mockData.leads.filter(l => l.status === 'lost').length
      })
    }
    return api.get('/leads/stats/overview', { params })
  },

  // Export CSV
  exportCSV: (params = {}) => {
    if (IS_MOCK_MODE) {
      const csvContent = mockData.leads.map(lead =>
        `${lead.artistName},${lead.platform},${lead.status},${lead.budget}`
      ).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      return Promise.resolve({ data: blob })
    }
    return api.get('/leads/export/csv', {
      params,
      responseType: 'blob'
    })
  },

  // Mise à jour en masse
  bulkUpdate: (data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Mise à jour en masse effectuée' })
    }
    return api.patch('/leads/bulk', data)
  }
}

// Campagnes API
export const campaignsAPI = {
  // Récupérer toutes les campagnes
  getAll: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: mockData.campaigns, total: mockData.campaigns.length })
    }
    return api.get('/campaigns', { params })
  },

  // Récupérer une campagne par ID
  getById: (id) => {
    if (IS_MOCK_MODE) {
      const campaign = mockData.campaigns.find(c => c._id === id)
      return mockApiCall({ data: campaign || null })
    }
    return api.get(`/campaigns/${id}`)
  },

  // Créer une campagne
  create: (data) => {
    if (IS_MOCK_MODE) {
      const newCampaign = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      }
      mockData.campaigns.push(newCampaign)
      return mockApiCall({ data: newCampaign, message: 'Campagne créée avec succès' })
    }
    return api.post('/campaigns', data)
  },

  // Mettre à jour une campagne
  update: (id, data) => {
    if (IS_MOCK_MODE) {
      const index = mockData.campaigns.findIndex(c => c._id === id)
      if (index !== -1) {
        mockData.campaigns[index] = { ...mockData.campaigns[index], ...data }
        return mockApiCall({ data: mockData.campaigns[index], message: 'Campagne mise à jour' })
      }
      return mockApiCall({ error: 'Campagne non trouvée' }, 404)
    }
    return api.put(`/campaigns/${id}`, data)
  },

  // Supprimer une campagne
  delete: (id) => {
    if (IS_MOCK_MODE) {
      const index = mockData.campaigns.findIndex(c => c._id === id)
      if (index !== -1) {
        mockData.campaigns.splice(index, 1)
        return mockApiCall({ message: 'Campagne supprimée avec succès' })
      }
      return mockApiCall({ error: 'Campagne non trouvée' }, 404)
    }
    return api.delete(`/campaigns/${id}`)
  },

  // Mettre à jour les KPIs
  updateKPIs: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'KPIs mis à jour avec succès' })
    }
    return api.post(`/campaigns/${id}/kpis`, data)
  },

  // Ajouter une optimisation
  addOptimization: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Optimisation ajoutée avec succès' })
    }
    return api.post(`/campaigns/${id}/optimizations`, data)
  },

  // Ajouter un feedback client
  addFeedback: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Feedback ajouté avec succès' })
    }
    return api.post(`/campaigns/${id}/feedback`, data)
  },

  // Statistiques des campagnes
  getStats: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        totalCampaigns: mockData.campaigns.length,
        activeCampaigns: mockData.campaigns.filter(c => c.status === 'active').length,
        totalBudget: mockData.campaigns.reduce((sum, c) => sum + c.budget, 0),
        totalSpent: mockData.campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)
      })
    }
    return api.get('/campaigns/stats/performance', { params })
  },

  // Campagnes nécessitant une optimisation
  getNeedingOptimization: () => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: [] })
    }
    return api.get('/campaigns/optimization-needed')
  },

  // Export CSV
  exportCSV: (params = {}) => {
    if (IS_MOCK_MODE) {
      const csvContent = mockData.campaigns.map(campaign =>
        `${campaign.name},${campaign.platform},${campaign.status},${campaign.budget}`
      ).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      return Promise.resolve({ data: blob })
    }
    return api.get('/campaigns/export/csv', {
      params,
      responseType: 'blob'
    })
  }
}

// Analytics API
export const analyticsAPI = {
  // Dashboard général
  getDashboard: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        totalRevenue: 125000,
        totalLeads: 347,
        activeCampaigns: 12,
        conversionRate: 24.5
      })
    }
    return api.get('/analytics/dashboard', { params })
  },

  // Métriques temps réel
  getRealtimeMetrics: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        activeUsers: 23,
        currentCampaigns: 8,
        todayRevenue: 4250
      })
    }
    return api.get('/analytics/realtime', { params })
  },

  // Analytics des leads
  getLeadsAnalytics: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        totalLeads: mockData.leads.length,
        conversionRate: 24.5,
        sources: {
          'Meta Ads': 45,
          'Google Ads': 32,
          'Direct': 23
        }
      })
    }
    return api.get('/analytics/leads', { params })
  },

  // Analytics des campagnes
  getCampaignsAnalytics: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        totalCampaigns: mockData.campaigns.length,
        avgROI: 234.5,
        topPlatform: 'Meta Ads'
      })
    }
    return api.get('/analytics/campaigns', { params })
  },

  // Comparaison des équipes
  getTeamsComparison: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        teams: [
          { name: 'Marketing', leads: 45, revenue: 23000 },
          { name: 'Sales', leads: 32, revenue: 18500 }
        ]
      })
    }
    return api.get('/analytics/teams', { params })
  }
}

// Utilisateurs API
export const usersAPI = {
  // Récupérer tous les utilisateurs
  getAll: (params = {}) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: [mockData.user], total: 1 })
    }
    return api.get('/users', { params })
  },

  // Récupérer un utilisateur par ID
  getById: (id) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: mockData.user })
    }
    return api.get(`/users/${id}`)
  },

  // Créer un utilisateur
  create: (data) => {
    if (IS_MOCK_MODE) {
      const newUser = { _id: Date.now().toString(), ...data }
      return mockApiCall({ data: newUser, message: 'Utilisateur créé avec succès' })
    }
    return api.post('/users', data)
  },

  // Mettre à jour un utilisateur
  update: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ data: { ...mockData.user, ...data }, message: 'Utilisateur mis à jour' })
    }
    return api.put(`/users/${id}`, data)
  },

  // Supprimer un utilisateur
  delete: (id) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Utilisateur supprimé avec succès' })
    }
    return api.delete(`/users/${id}`)
  },

  // Mettre à jour les permissions
  updatePermissions: (id, data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Permissions mises à jour avec succès' })
    }
    return api.put(`/users/${id}/permissions`, data)
  },

  // Réinitialiser le mot de passe
  resetPassword: (id) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Mot de passe réinitialisé avec succès' })
    }
    return api.post(`/users/${id}/reset-password`)
  },

  // Statistiques utilisateur
  getStats: (id) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({
        totalLogins: 127,
        lastLogin: new Date().toISOString(),
        leadsCreated: 23,
        campaignsManaged: 5
      })
    }
    return api.get(`/users/${id}/stats`)
  }
}

// Authentification API
export const authAPI = {
  // Connexion
  login: (data) => {
    if (IS_MOCK_MODE) {
      // Simulation de connexion réussie
      const token = 'mock-jwt-token-' + Date.now()
      const refreshToken = 'mock-refresh-token-' + Date.now()
      return mockApiCall({
        user: mockData.user,
        token,
        refreshToken,
        message: 'Connexion réussie'
      })
    }
    return api.post('/auth/login', data)
  },

  // Inscription
  register: (data) => {
    if (IS_MOCK_MODE) {
      const token = 'mock-jwt-token-' + Date.now()
      const refreshToken = 'mock-refresh-token-' + Date.now()
      return mockApiCall({
        user: { ...mockData.user, ...data },
        token,
        refreshToken,
        message: 'Inscription réussie'
      })
    }
    return api.post('/auth/register', data)
  },

  // Déconnexion
  logout: () => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Déconnexion réussie' })
    }
    return api.post('/auth/logout')
  },

  // Profil actuel
  me: () => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ user: mockData.user })
    }
    return api.get('/auth/me')
  },

  // Rafraîchir le token
  refresh: (data) => {
    if (IS_MOCK_MODE) {
      const token = 'mock-jwt-token-refreshed-' + Date.now()
      const refreshToken = 'mock-refresh-token-refreshed-' + Date.now()
      return mockApiCall({ token, refreshToken })
    }
    return api.post('/auth/refresh', data)
  },

  // Changer le mot de passe
  changePassword: (data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Mot de passe changé avec succès' })
    }
    return api.put('/auth/change-password', data)
  },

  // Mot de passe oublié
  forgotPassword: (data) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Email de réinitialisation envoyé' })
    }
    return api.post('/auth/forgot-password', data)
  },

  // Réinitialiser le mot de passe
  resetPassword: (token, data) => {
    if (IS_MOCK_MODE) {
      const newToken = 'mock-jwt-token-reset-' + Date.now()
      const refreshToken = 'mock-refresh-token-reset-' + Date.now()
      return mockApiCall({
        user: mockData.user,
        token: newToken,
        refreshToken,
        message: 'Mot de passe réinitialisé'
      })
    }
    return api.post(`/auth/reset-password/${token}`, data)
  },

  // Vérifier l'email
  verifyEmail: (token) => {
    if (IS_MOCK_MODE) {
      return mockApiCall({ message: 'Email vérifié avec succès' })
    }
    return api.get(`/auth/verify-email/${token}`)
  }
}

// Intégrations API
export const integrationsAPI = {
  // Test Brevo
  testBrevo: (data) => api.post('/integrations/brevo/test', data),

  // Envoyer email Brevo
  sendEmail: (data) => api.post('/integrations/brevo/send-email', data),

  // Templates Brevo
  getBrevoTemplates: () => api.get('/integrations/brevo/templates'),

  // Sync Google Ads
  syncGoogleAds: (data) => api.post('/integrations/google-ads/sync', data),

  // Sync Meta Ads
  syncMetaAds: (data) => api.post('/integrations/meta-ads/sync', data)
}

// Audit API
export const auditAPI = {
  // Récupérer les logs d'audit
  getLogs: (params = {}) => api.get('/audit', { params }),

  // Récupérer un log par ID
  getLogById: (id) => api.get(`/audit/${id}`),

  // Activité utilisateur
  getUserActivity: (userId, params = {}) => api.get(`/audit/user/${userId}`, { params }),

  // Historique d'une ressource
  getResourceHistory: (resourceType, resourceId) =>
    api.get(`/audit/resource/${resourceType}/${resourceId}`),

  // Événements de sécurité
  getSecurityEvents: (params = {}) => api.get('/audit/security/events', { params }),

  // Statistiques d'activité
  getActivityStats: (params = {}) => api.get('/audit/stats/activity', { params }),

  // Export CSV
  exportCSV: (params = {}) => api.get('/audit/export/csv', {
    params,
    responseType: 'blob'
  }),

  // Données GDPR
  getGDPRData: (email) => api.get(`/audit/gdpr/${email}`),

  // Archiver les anciens logs
  archiveOldLogs: (params = {}) => api.post('/audit/archive', null, { params }),

  // Activité suspecte
  getSuspiciousActivity: () => api.get('/audit/security/suspicious')
}

// Fonction utilitaire pour télécharger un fichier blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// Fonction utilitaire pour uploader un fichier
export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

// Configuration pour les requêtes sans toast d'erreur automatique
export const apiSilent = axios.create({
  ...api.defaults,
  silent: true
})

// Supprimer l'intercepteur d'erreur pour les requêtes silencieuses
apiSilent.interceptors.response.handlers = []

export default api