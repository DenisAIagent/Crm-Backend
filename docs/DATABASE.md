# Documentation Base de Données - MDMC CRM

## Vue d'ensemble

Le CRM MDMC utilise MongoDB comme base de données principale avec Mongoose comme ODM (Object Document Mapper). L'architecture suit le principe Lead-to-Company pour optimiser le processus de conversion et la facturation.

## Schéma de données

```
                     ┌─────────────────────────────────────┐
                     │              USERS                  │
                     │  - Authentication & Permissions    │
                     │  - Team Assignment                  │
                     │  - Performance Stats                │
                     └─────────────────┬───────────────────┘
                                       │
                                       │ created/assigned
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                            LEADS                                │
│  - Personal Information (encrypted)                             │
│  - Artist & Business Details                                   │
│  - Pipeline & Conversion Tracking                              │
│  - Notes & Follow-ups                                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ converts to
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          CAMPAIGNS                             │
│  - Multi-platform Management                                   │
│  - KPIs & Performance Metrics                                  │
│  - Creative Assets                                             │
│  - Budget & ROI Tracking                                       │
└─────────────────────────────────────────────────────────────────┘
                  │
                  │ tracked in
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AUDIT LOGS                             │
│  - System Activity Tracking                                    │
│  - Security Events                                             │
│  - Data Changes                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Modèles de données

### 1. User Model

```javascript
{
  // Informations personnelles
  firstName: String,           // Prénom (requis)
  lastName: String,            // Nom (requis)
  email: String,               // Email unique (requis)
  password: String,            // Mot de passe hashé (select: false)

  // Rôle et permissions
  role: Enum['admin', 'manager', 'agent'],  // Rôle système
  permissions: {
    leads: {
      create: Boolean,         // Peut créer des leads
      read: Boolean,           // Peut voir les leads
      update: Boolean,         // Peut modifier les leads
      delete: Boolean          // Peut supprimer les leads
    },
    campaigns: {
      create: Boolean,
      read: Boolean,
      update: Boolean,
      delete: Boolean
    },
    analytics: {
      read: Boolean,
      export: Boolean          // Peut exporter les données
    },
    admin: {
      users: Boolean,          // Gestion des utilisateurs
      settings: Boolean,       // Paramètres système
      audit: Boolean           // Accès aux logs d'audit
    }
  },

  // Assignation métier
  assignedPlatforms: [Enum],   // ['youtube', 'spotify', 'meta', 'tiktok', 'google']
  team: Enum['denis', 'marine'], // Équipe d'appartenance

  // Configuration utilisateur
  preferences: {
    language: String,          // Langue interface (default: 'fr')
    timezone: String,          // Fuseau horaire (default: 'Europe/Paris')
    notifications: {
      email: Boolean,          // Notifications par email
      browser: Boolean,        // Notifications navigateur
      slack: Boolean           // Notifications Slack
    },
    dashboard: {
      defaultView: String,     // Vue par défaut (kanban, list, etc.)
      refreshInterval: Number  // Intervalle de rafraîchissement (ms)
    }
  },

  // Sécurité
  isActive: Boolean,           // Compte actif
  isVerified: Boolean,         // Email vérifié
  lastLogin: Date,             // Dernière connexion
  loginAttempts: Number,       // Tentatives de connexion échouées
  lockUntil: Date,             // Verrouillage temporaire
  twoFactorSecret: String,     // Secret 2FA
  twoFactorEnabled: Boolean,   // 2FA activé

  // Tokens de sécurité
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Clés API (select: false)
  apiKeys: {
    brevo: String,             // Clé API Brevo
    slack: String,             // Token Slack
    googleAds: String,         // Clé Google Ads
    metaAds: String            // Token Meta Ads
  },

  // Statistiques de performance
  stats: {
    leadsCreated: Number,      // Leads créés
    leadsConverted: Number,    // Leads convertis
    campaignsManaged: Number,  // Campagnes gérées
    totalRevenue: Number,      // Chiffre d'affaires généré
    avgResponseTime: Number    // Temps de réponse moyen (minutes)
  },

  // Virtuels calculés
  fullName: String,            // firstName + lastName
  isLocked: Boolean,           // Compte verrouillé
  conversionRate: Number       // Taux de conversion (%)
}
```

### 2. Lead Model

```javascript
{
  // Informations personnelles (chiffrées)
  personalInfo: {
    firstName: String,         // Prénom (requis)
    lastName: String,          // Nom (requis)
    email: String,             // Email (chiffré, requis)
    phone: String,             // Téléphone (chiffré)
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },

  // Informations artistiques
  artistInfo: {
    name: String,              // Nom d'artiste (requis)
    genre: [String],           // Genres musicaux
    spotifyUrl: String,        // URL Spotify
    youtubeUrl: String,        // URL YouTube
    instagramUrl: String,      // URL Instagram
    tiktokUrl: String,         // URL TikTok
    website: String,           // Site web officiel
    label: String,             // Label musical
    manager: String            // Manager
  },

  // Informations business
  businessInfo: {
    budget: {
      amount: Number,          // Montant du budget
      currency: String,        // Devise (default: 'EUR')
      frequency: Enum,         // 'monthly', 'campaign', 'yearly'
      flexibility: Enum        // 'strict', 'flexible', 'negotiable'
    },
    platforms: [Enum],         // Plateformes ciblées
    goals: [String],           // Objectifs marketing
    timeline: {
      startDate: Date,         // Date de début souhaitée
      endDate: Date,           // Date de fin souhaitée
      urgency: Enum            // 'low', 'medium', 'high', 'urgent'
    },
    previousExperience: {
      hasRunAds: Boolean,      // A déjà fait de la pub
      platforms: [String],     // Plateformes utilisées
      budget: Number,          // Budget précédent
      results: String          // Résultats obtenus
    }
  },

  // Gestion du pipeline
  pipeline: {
    stage: Enum,               // 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'
    priority: Enum,            // 'low', 'medium', 'high', 'urgent'
    score: Number,             // Score de qualification (0-100)
    probability: Number,       // Probabilité de conversion (0-100)
    expectedCloseDate: Date,   // Date de clôture prévue
    lostReason: String,        // Raison de la perte (si applicable)
    tags: [String]             // Tags personnalisés
  },

  // Source et tracking
  source: {
    channel: Enum,             // 'website', 'social', 'referral', 'direct', 'ads'
    campaign: String,          // Campagne d'acquisition
    medium: String,            // Medium UTM
    content: String,           // Contenu UTM
    referrer: String,          // Site référent
    ip: String,                // Adresse IP
    userAgent: String,         // User agent
    formType: String           // Type de formulaire
  },

  // Assignation et propriété
  assignment: {
    assignedTo: ObjectId,      // Utilisateur assigné (ref: User)
    assignedAt: Date,          // Date d'assignation
    previousAssignee: ObjectId, // Assignation précédente
    autoAssigned: Boolean,     // Assignation automatique
    assignmentReason: String   // Raison de l'assignation
  },

  // Communication et suivi
  communication: {
    preferredMethod: Enum,     // 'email', 'phone', 'whatsapp', 'telegram'
    preferredTime: String,     // Créneau horaire préféré
    language: String,          // Langue de communication
    timezone: String,          // Fuseau horaire
    lastContact: Date,         // Dernier contact
    nextFollowUp: Date,        // Prochain suivi programmé
    contactAttempts: Number,   // Nombre de tentatives de contact
    responseRate: Number       // Taux de réponse (0-100)
  },

  // Conversion
  conversion: {
    isConverted: Boolean,      // Lead converti
    convertedAt: Date,         // Date de conversion
    campaignId: ObjectId,      // Campagne liée (ref: Campaign)
    contractValue: Number,     // Valeur du contrat
    monthlyValue: Number,      // Valeur mensuelle récurrente
    conversionStage: String,   // Étape de conversion
    timeToConversion: Number   // Temps jusqu'à conversion (jours)
  },

  // Notes et historique
  notes: [{
    author: ObjectId,          // Auteur (ref: User)
    content: String,           // Contenu de la note
    type: Enum,                // 'note', 'call', 'email', 'meeting', 'task'
    isPrivate: Boolean,        // Note privée
    createdAt: Date,           // Date de création
    updatedAt: Date            // Date de modification
  }],

  // Follow-ups programmés
  followUps: [{
    scheduledBy: ObjectId,     // Programmé par (ref: User)
    assignedTo: ObjectId,      // Assigné à (ref: User)
    type: Enum,                // 'call', 'email', 'meeting', 'task'
    subject: String,           // Sujet du follow-up
    description: String,       // Description
    scheduledFor: Date,        // Date programmée
    completed: Boolean,        // Complété
    completedAt: Date,         // Date de completion
    priority: Enum             // Priorité
  }],

  // Métriques et analytics
  analytics: {
    pageViews: Number,         // Vues de page
    timeOnSite: Number,        // Temps sur site (secondes)
    downloads: Number,         // Téléchargements
    emailOpens: Number,        // Ouvertures d'emails
    emailClicks: Number,       // Clics dans emails
    socialEngagement: Number,  // Engagement social
    qualificationScore: Number // Score de qualification
  }
}
```

### 3. Campaign Model

```javascript
{
  // Informations de base
  name: String,                // Nom de la campagne (requis)
  description: String,         // Description
  status: Enum,                // 'draft', 'active', 'paused', 'completed', 'cancelled'
  type: Enum,                  // 'acquisition', 'conversion', 'retention', 'branding'

  // Relation avec le lead/client
  leadId: ObjectId,            // Lead d'origine (ref: Lead)
  clientInfo: {
    artistName: String,        // Nom de l'artiste
    songTitle: String,         // Titre de la chanson
    genre: [String],           // Genres musicaux
    releaseDate: Date,         // Date de sortie
    label: String,             // Label musical
    isrc: String               // Code ISRC
  },

  // Équipe et assignation
  team: {
    manager: ObjectId,         // Chef de projet (ref: User)
    assignedTo: [ObjectId],    // Équipe assignée (ref: User)
    accountManager: ObjectId,  // Account manager (ref: User)
    createdBy: ObjectId        // Créateur (ref: User)
  },

  // Configuration des plateformes
  platforms: [{
    name: Enum,                // 'youtube', 'spotify', 'meta', 'tiktok', 'google'
    isActive: Boolean,         // Plateforme active
    config: {
      adAccount: String,       // Compte publicitaire
      pixelId: String,         // ID pixel de tracking
      campaignObjective: String, // Objectif de campagne
      targeting: {
        demographics: {
          ageMin: Number,      // Âge minimum
          ageMax: Number,      // Âge maximum
          genders: [Enum],     // Genres ciblés
          languages: [String] // Langues ciblées
        },
        interests: [String],   // Centres d'intérêt
        behaviors: [String],   // Comportements
        lookalike: {
          enabled: Boolean,    // Audience similaire activée
          source: String,      // Source de l'audience
          percentage: Number   // Pourcentage de similarité
        },
        custom: {
          enabled: Boolean,    // Audience personnalisée
          type: String,        // Type d'audience
          definition: Object   // Définition de l'audience
        },
        geographic: {
          countries: [String], // Pays ciblés
          regions: [String],   // Régions
          cities: [String],    // Villes
          radius: Number       // Rayon (km)
        }
      },
      budget: {
        daily: Number,         // Budget quotidien
        total: Number,         // Budget total
        bidStrategy: String,   // Stratégie d'enchères
        optimization: String   // Optimisation
      },
      schedule: {
        startDate: Date,       // Date de début
        endDate: Date,         // Date de fin
        timeSlots: [{          // Créneaux horaires
          days: [Number],      // Jours de la semaine (0-6)
          startTime: String,   // Heure de début
          endTime: String      // Heure de fin
        }]
      }
    }
  }],

  // Assets créatifs
  creatives: [{
    name: String,              // Nom du créatif
    type: Enum,                // 'image', 'video', 'carousel', 'story'
    platform: String,         // Plateforme ciblée
    url: String,               // URL du fichier
    thumbnail: String,         // Miniature
    dimensions: {
      width: Number,           // Largeur
      height: Number,          // Hauteur
      aspectRatio: String      // Ratio d'aspect
    },
    metadata: {
      duration: Number,        // Durée (pour vidéos)
      fileSize: Number,        // Taille du fichier
      format: String,          // Format de fichier
      quality: String          // Qualité
    },
    performance: {
      impressions: Number,     // Impressions
      clicks: Number,          // Clics
      ctr: Number,             // Taux de clic
      cpc: Number,             // Coût par clic
      conversions: Number      // Conversions
    },
    isActive: Boolean,         // Créatif actif
    createdAt: Date,           // Date de création
    updatedAt: Date            // Date de modification
  }],

  // KPIs et métriques par jour
  dailyKpis: [{
    date: Date,                // Date des métriques

    // Métriques principales
    impressions: Number,       // Impressions
    views: Number,             // Vues
    clicks: Number,            // Clics
    reach: Number,             // Portée
    frequency: Number,         // Fréquence

    // Engagement
    likes: Number,             // J'aime
    shares: Number,            // Partages
    comments: Number,          // Commentaires
    saves: Number,             // Sauvegardes
    follows: Number,           // Nouveaux abonnés

    // Conversions
    conversions: Number,       // Conversions
    conversionValue: Number,   // Valeur des conversions
    streamClicks: Number,      // Clics vers streaming
    actualStreams: Number,     // Streams réels

    // Coûts et performance
    spend: Number,             // Dépenses
    cpm: Number,               // CPM (coût pour mille)
    cpc: Number,               // CPC (coût par clic)
    cpv: Number,               // CPV (coût par vue)
    ctr: Number,               // CTR (taux de clic)
    vtr: Number,               // VTR (taux de vue)

    // Métriques spécifiques par plateforme
    platformSpecific: {
      youtube: {
        watchTime: Number,     // Temps de visionnage
        avgViewDuration: Number, // Durée moyenne
        subscribers: Number,   // Nouveaux abonnés
        retention25: Number,   // Rétention 25%
        retention50: Number,   // Rétention 50%
        retention75: Number    // Rétention 75%
      },
      spotify: {
        streams: Number,       // Écoutes
        saves: Number,         // Sauvegardes
        followers: Number,     // Nouveaux followers
        playlistAdds: Number,  // Ajouts en playlist
        skipRate: Number       // Taux de skip
      },
      meta: {
        videoViews: Number,    // Vues vidéo
        postEngagement: Number, // Engagement post
        pageFollows: Number,   // Nouveaux followers
        linkClicks: Number,    // Clics sur liens
        videoPlays: Number     // Lectures vidéo
      },
      tiktok: {
        videoViews: Number,    // Vues vidéo
        profileViews: Number,  // Vues profil
        followers: Number,     // Nouveaux followers
        likes: Number,         // J'aime
        shares: Number         // Partages
      }
    }
  }],

  // Budget et facturation
  budget: {
    allocated: Number,         // Budget alloué
    spent: Number,             // Budget dépensé
    remaining: Number,         // Budget restant
    currency: String,          // Devise
    billingModel: Enum,        // 'fixed', 'percentage', 'performance'
    commission: Number,        // Commission (%)
    invoicing: {
      frequency: Enum,         // 'monthly', 'quarterly', 'end'
      lastInvoice: Date,       // Dernière facture
      nextInvoice: Date,       // Prochaine facture
      totalInvoiced: Number    // Total facturé
    }
  },

  // Dates importantes
  timeline: {
    startDate: Date,           // Date de début
    endDate: Date,             // Date de fin
    launchDate: Date,          // Date de lancement
    lastOptimization: Date,    // Dernière optimisation
    nextReview: Date           // Prochain review
  },

  // Objectifs et résultats
  objectives: {
    primary: String,           // Objectif principal
    secondary: [String],       // Objectifs secondaires
    kpiTargets: {
      streams: Number,         // Objectif streams
      followers: Number,       // Objectif followers
      engagement: Number,      // Objectif engagement
      roas: Number,            // Objectif ROAS
      cpa: Number              // Objectif CPA
    },
    achieved: {
      streams: Number,         // Streams atteints
      followers: Number,       // Followers gagnés
      engagement: Number,      // Engagement obtenu
      roas: Number,            // ROAS réalisé
      cpa: Number              // CPA réalisé
    }
  },

  // Notes et commentaires
  notes: [{
    author: ObjectId,          // Auteur (ref: User)
    content: String,           // Contenu
    type: Enum,                // 'note', 'optimization', 'issue', 'review'
    isInternal: Boolean,       // Note interne
    createdAt: Date            // Date de création
  }],

  // Métriques calculées (virtuels)
  totalSpend: Number,          // Dépenses totales
  totalImpressions: Number,    // Impressions totales
  totalClicks: Number,         // Clics totaux
  overallCtr: Number,          // CTR global
  overallCpc: Number,          // CPC global
  roi: Number,                 // Retour sur investissement
  roas: Number                 // Retour sur dépenses publicitaires
}
```

### 4. AuditLog Model

```javascript
{
  // Informations de base
  action: String,              // Action effectuée (requis)
  resource: String,            // Ressource affectée (requis)
  resourceId: String,          // ID de la ressource

  // Utilisateur et session
  userId: ObjectId,            // Utilisateur (ref: User)
  userRole: String,            // Rôle au moment de l'action
  sessionId: String,           // ID de session

  // Détails de l'action
  details: {
    method: String,            // Méthode HTTP
    endpoint: String,          // Endpoint API
    oldValues: Object,         // Anciennes valeurs
    newValues: Object,         // Nouvelles valeurs
    changes: [String],         // Champs modifiés
    reason: String             // Raison du changement
  },

  // Contexte technique
  metadata: {
    ip: String,                // Adresse IP
    userAgent: String,         // User agent
    referer: String,           // URL de référence
    timestamp: Date,           // Timestamp précis
    duration: Number,          // Durée de l'opération (ms)
    success: Boolean,          // Opération réussie
    errorCode: String,         // Code d'erreur (si applicable)
    errorMessage: String       // Message d'erreur
  },

  // Classification
  severity: Enum,              // 'info', 'warning', 'error', 'critical'
  category: Enum,              // 'auth', 'data', 'security', 'performance', 'business'
  tags: [String],              // Tags personnalisés

  // Géolocalisation
  location: {
    country: String,           // Pays
    region: String,            // Région
    city: String,              // Ville
    timezone: String           // Fuseau horaire
  }
}
```

## Index et optimisations

### Index principaux

```javascript
// Users
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ team: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ assignedPlatforms: 1 })

// Leads
leadSchema.index({ 'personalInfo.email': 1 })
leadSchema.index({ 'pipeline.stage': 1 })
leadSchema.index({ 'assignment.assignedTo': 1 })
leadSchema.index({ 'source.channel': 1 })
leadSchema.index({ createdAt: -1 })
leadSchema.index({ 'pipeline.stage': 1, 'pipeline.priority': 1 })

// Campaigns
campaignSchema.index({ leadId: 1 })
campaignSchema.index({ status: 1 })
campaignSchema.index({ 'team.manager': 1 })
campaignSchema.index({ 'platforms.name': 1 })
campaignSchema.index({ 'timeline.startDate': 1 })

// AuditLogs
auditLogSchema.index({ userId: 1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ severity: 1 })
auditLogSchema.index({ category: 1 })
```

### Requêtes optimisées

```javascript
// Exemple de requêtes typiques optimisées

// Dashboard analytics
const dashboardData = await Promise.all([
  Lead.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: {
      _id: '$pipeline.stage',
      count: { $sum: 1 },
      totalValue: { $sum: '$conversion.contractValue' }
    }}
  ]),

  Campaign.aggregate([
    { $match: { status: 'active' } },
    { $group: {
      _id: null,
      totalSpend: { $sum: '$budget.spent' },
      totalImpressions: { $sum: { $sum: '$dailyKpis.impressions' } }
    }}
  ])
])

// Lead assignment par équipe
const leadsByTeam = await Lead.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'assignment.assignedTo',
      foreignField: '_id',
      as: 'assignedUser'
    }
  },
  {
    $group: {
      _id: '$assignedUser.team',
      count: { $sum: 1 },
      qualified: {
        $sum: { $cond: [{ $eq: ['$pipeline.stage', 'qualified'] }, 1, 0] }
      }
    }
  }
])
```

## Sécurité des données

### Chiffrement

- **Emails** : Chiffrés avec AES-256
- **Téléphones** : Chiffrés avec AES-256
- **Adresses** : Chiffrées avec AES-256
- **Mots de passe** : Hashés avec bcrypt (salt rounds: 12)
- **Tokens** : SHA-256 pour les tokens de sécurité

### Validation et sanitization

```javascript
// Validation Joi pour Lead
const leadValidation = {
  'personalInfo.email': Joi.string().email().required(),
  'personalInfo.firstName': Joi.string().min(2).max(50).required(),
  'artistInfo.name': Joi.string().min(2).max(100).required(),
  'businessInfo.budget.amount': Joi.number().min(100).max(1000000)
}

// Sanitization MongoDB
app.use(mongoSanitize({
  replaceWith: '_'
}))
```

## Backup et récupération

### Stratégie de backup

1. **Backup automatique** : Quotidien via Railway
2. **Export JSON** : Hebdomadaire pour les données critiques
3. **Point-in-time recovery** : Disponible sur 7 jours
4. **Réplication** : Master-slave pour haute disponibilité

### Procédure de récupération

```bash
# Backup complet
mongodump --uri="mongodb://..." --db=mdmc_crm --out=/backup/

# Restauration
mongorestore --uri="mongodb://..." --db=mdmc_crm /backup/mdmc_crm/

# Export spécifique
mongoexport --uri="mongodb://..." --collection=leads --out=leads.json
```

Cette architecture de base de données assure performance, sécurité et évolutivité pour le CRM MDMC Music Ads.