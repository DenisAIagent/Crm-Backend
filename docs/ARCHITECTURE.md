# Architecture Technique - MDMC CRM

## Vue d'ensemble du système

Le CRM MDMC Music Ads est une application web complète construite sur une architecture moderne et scalable, conçue spécifiquement pour les agences de marketing musical.

### Stack technologique

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                     │
├─────────────────────────────────────────────────────────────────┤
│ • React Query (État serveur)                                   │
│ • React Router (Navigation)                                    │
│ • Socket.io Client (Temps réel)                               │
│ • Tailwind CSS (Styling)                                      │
│ • Vite (Build tool)                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/WSS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER / REVERSE PROXY               │
│                        (Nginx/Railway)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│ • Express.js (API REST)                                        │
│ • Socket.io Server (WebSocket)                                │
│ • JWT Auth + Refresh Tokens                                   │
│ • Rate Limiting & Security                                     │
│ • Validation & Sanitization                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                         │
├─────────────────────────────────────────────────────────────────┤
│ • Users (Auth & Roles)                                         │
│ • Leads (Pipeline & Conversion)                               │
│ • Campaigns (Multi-platform)                                  │
│ • AuditLogs (Traçabilité)                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES EXTERNES                         │
├─────────────────────────────────────────────────────────────────┤
│ • Mailgun/Brevo (Notifications)                               │
│ • TikTok/Meta/Google APIs (Campagnes)                         │
│ • Railway MongoDB (Base de données)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Frontend

### Structure des composants

```
client/src/
├── components/
│   ├── common/           # Composants réutilisables
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── DataTable.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/           # Layout et navigation
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── leads/            # Gestion des leads
│   │   ├── LeadsList.jsx
│   │   ├── LeadForm.jsx
│   │   └── LeadDetails.jsx
│   ├── campaigns/        # Gestion des campagnes
│   │   ├── CampaignsList.jsx
│   │   ├── CampaignForm.jsx
│   │   └── CampaignAnalytics.jsx
│   └── analytics/        # Tableaux de bord
│       ├── Dashboard.jsx
│       ├── Charts.jsx
│       └── KPICards.jsx
├── hooks/                # Hooks personnalisés
│   ├── useAuth.js
│   ├── useSocket.js
│   └── useApi.js
├── services/             # Services API
│   ├── api.js
│   ├── auth.js
│   └── socket.js
├── context/              # Contextes React
│   ├── AuthContext.jsx
│   └── SocketContext.jsx
├── utils/                # Utilitaires
│   ├── helpers.js
│   ├── constants.js
│   └── validation.js
└── styles/               # Styles globaux
    ├── globals.css
    └── components.css
```

### Gestion d'état

Le frontend utilise une approche hybride pour la gestion d'état :

1. **React Context** : État global de l'application (auth, utilisateur)
2. **React Query** : Cache et synchronisation des données serveur
3. **État local** : État spécifique aux composants

```javascript
// Exemple de structure d'état
const AppState = {
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean
  },
  socket: {
    connected: boolean,
    notifications: Notification[]
  },
  ui: {
    sidebarOpen: boolean,
    theme: 'light' | 'dark',
    currentPage: string
  }
}
```

### Routing et navigation

```javascript
// Structure des routes
const routes = {
  '/': 'Dashboard',
  '/leads': 'Gestion des leads',
  '/leads/:id': 'Détail lead',
  '/campaigns': 'Gestion des campagnes',
  '/campaigns/:id': 'Détail campagne',
  '/analytics': 'Analytics',
  '/settings': 'Paramètres',
  '/login': 'Connexion'
}
```

## Architecture Backend

### Structure modulaire

```
server/
├── config/               # Configuration
│   ├── database.js       # Connexion MongoDB
│   ├── cors.js          # Configuration CORS
│   └── rateLimit.js     # Rate limiting
├── controllers/          # Contrôleurs métier
│   ├── authController.js
│   ├── leadsController.js
│   ├── campaignsController.js
│   └── analyticsController.js
├── middleware/           # Middlewares
│   ├── auth.js          # Authentification JWT
│   ├── validation.js    # Validation des données
│   ├── errorHandler.js  # Gestion d'erreurs
│   └── rateLimit.js     # Rate limiting
├── models/              # Modèles de données
│   ├── User.js
│   ├── Lead.js
│   ├── Campaign.js
│   └── AuditLog.js
├── routes/              # Routes API
│   ├── auth.js
│   ├── leads.js
│   ├── campaigns.js
│   ├── analytics.js
│   └── webhooks.js
├── services/            # Services métier
│   ├── authService.js
│   ├── emailService.js
│   └── analyticsService.js
├── utils/               # Utilitaires
│   ├── logger.js
│   ├── encryption.js
│   └── validation.js
└── server.js            # Point d'entrée
```

### Flux de données

```
Client Request
      │
      ▼
┌─────────────┐
│ Rate Limit  │ ──── Rejection (429)
└─────────────┘
      │
      ▼
┌─────────────┐
│ CORS Check  │ ──── Rejection (CORS error)
└─────────────┘
      │
      ▼
┌─────────────┐
│ Auth Check  │ ──── Rejection (401/403)
└─────────────┘
      │
      ▼
┌─────────────┐
│ Validation  │ ──── Rejection (400)
└─────────────┘
      │
      ▼
┌─────────────┐
│ Controller  │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Service     │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Database    │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Response    │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Socket Emit │ (si applicable)
└─────────────┘
```

## Architecture de données

### Modèle de données principal

```javascript
// Structure Lead-to-Company
Lead {
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String (encrypted),
    phone: String (encrypted)
  },
  artistInfo: {
    name: String,
    genre: String,
    spotifyUrl: String
  },
  businessInfo: {
    budget: Number,
    platforms: [String],
    goals: [String]
  },
  pipeline: {
    stage: Enum,
    priority: Enum,
    score: Number
  },
  conversion: {
    convertedAt: Date,
    companyId: ObjectId,
    contractValue: Number
  }
}
```

### Relations entre entités

```
User ──────────┐
    │          │
    │ created  │ assigned
    ▼          ▼
  Lead ────── Campaign
    │          │
    │ convert  │ performance
    ▼          ▼
  Company ── Analytics
    │
    │ billing
    ▼
  Invoice
```

## Sécurité

### Niveaux de sécurité

1. **Transport** : HTTPS/WSS uniquement
2. **Application** : JWT + Refresh tokens, CSRF protection
3. **Données** : Chiffrement AES-256 pour données sensibles
4. **Réseau** : Rate limiting, IP whitelisting
5. **Base de données** : Sanitization, injection protection

### Authentification et autorisation

```javascript
// Flux d'authentification
const authFlow = {
  1: 'Login → JWT Access Token (15min) + Refresh Token (7d)',
  2: 'Request → Bearer Token dans headers',
  3: 'Validation → Vérification signature + expiration',
  4: 'Autorisation → Vérification rôles et permissions',
  5: 'Refresh → Nouveau token si expiré'
}
```

### Chiffrement des données

```javascript
// Données chiffrées en base
const encryptedFields = [
  'email',      // Emails des leads
  'phone',      // Numéros de téléphone
  'address',    // Adresses
  'bankInfo'    // Informations bancaires
]
```

## Performance et scalabilité

### Optimisations Frontend

1. **Code splitting** : Lazy loading des routes
2. **Memoization** : React.memo et useMemo
3. **Virtualisation** : Pour les grandes listes
4. **CDN** : Assets statiques
5. **Compression** : Gzip/Brotli

### Optimisations Backend

1. **Connexions pool** : MongoDB connection pooling
2. **Cache** : Redis pour les données fréquentes
3. **Pagination** : Limite des résultats API
4. **Indexation** : Index optimisés MongoDB
5. **Compression** : Compression des réponses

### Monitoring et observabilité

```javascript
// Métriques surveillées
const metrics = {
  performance: {
    responseTime: '< 200ms (p95)',
    throughput: '1000 req/min',
    errorRate: '< 1%'
  },
  business: {
    conversionRate: 'Lead → Company',
    userActivity: 'DAU/MAU',
    featureUsage: 'Feature adoption'
  },
  infrastructure: {
    cpuUsage: '< 70%',
    memoryUsage: '< 80%',
    diskSpace: '> 20% free'
  }
}
```

## Déploiement et infrastructure

### Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                        Production                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │   Frontend       │  │   Backend        │               │
│  │   (Vercel)       │  │   (Railway)      │               │
│  │                  │  │                  │               │
│  │ • React Build    │  │ • Node.js        │               │
│  │ • CDN Global     │  │ • Auto-scale     │               │
│  │ • Edge Cache     │  │ • Health Check   │               │
│  └──────────────────┘  └──────────────────┘               │
│           │                       │                        │
│           └───────────────────────┼────────────────────────┤
│                                   │                        │
│  ┌──────────────────┐  ┌──────────▼────────┐               │
│  │   Database       │  │   External APIs   │               │
│  │   (MongoDB)      │  │                   │               │
│  │                  │  │ • Mailgun         │               │
│  │ • Railway        │  │ • TikTok API      │               │
│  │ • Auto-backup    │  │ • Meta API        │               │
│  │ • Monitoring     │  │ • Google API      │               │
│  └──────────────────┘  └───────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Variables d'environnement

```bash
# Environnements gérés
NODE_ENV=development|staging|production

# Base de données
MONGODB_URI=mongodb://...
DB_NAME=mdmc_crm

# Sécurité
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
ENCRYPTION_KEY=xxx

# Services externes
MAILGUN_API_KEY=xxx
MAILGUN_DOMAIN=xxx
```

## Évolutivité

### Roadmap technique

1. **Phase 1** : Microservices (Analytics séparé)
2. **Phase 2** : Cache Redis
3. **Phase 3** : Message Queue (Bull/BeeQueue)
4. **Phase 4** : Kubernetes
5. **Phase 5** : Multi-tenant

### Intégrations futures

```javascript
const futureIntegrations = [
  'Spotify for Artists API',
  'YouTube Analytics API',
  'TikTok Creator Fund API',
  'Instagram Business API',
  'Salesforce Integration',
  'HubSpot Integration',
  'Slack Notifications',
  'Zapier Webhook'
]
```

Cette architecture garantit une base solide pour l'évolution du CRM MDMC Music Ads tout en maintenant performance, sécurité et facilité de maintenance.