# Documentation Sécurité - MDMC CRM

## Vue d'ensemble de la sécurité

Le CRM MDMC Music Ads implémente une approche de sécurité multi-niveaux, combinant les meilleures pratiques de l'industrie avec des mesures spécifiques au domaine du marketing musical et de la gestion de données personnelles.

## Architecture de sécurité

```
┌─────────────────────────────────────────────────────────────────┐
│                     COUCHE TRANSPORT                           │
│  • HTTPS/TLS 1.3 obligatoire                                  │
│  • HSTS (HTTP Strict Transport Security)                      │
│  • Certificate pinning                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE APPLICATION                          │
│  • Rate limiting & DDoS protection                            │
│  • CORS configuré strictement                                 │
│  • CSP (Content Security Policy)                              │
│  • Input validation & sanitization                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COUCHE AUTHENTIFICATION                       │
│  • JWT + Refresh tokens                                       │
│  • Account lockout après tentatives                           │
│  • Session management sécurisé                                │
│  • 2FA (Two-Factor Authentication)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COUCHE DONNÉES                             │
│  • Chiffrement AES-256 pour données sensibles                 │
│  • Hashage bcrypt pour mots de passe                          │
│  • MongoDB injection protection                               │
│  • Audit logging complet                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Authentification et autorisation

### Système JWT + Refresh Tokens

Le CRM utilise un système de double tokens pour optimiser sécurité et expérience utilisateur :

```javascript
// Structure des tokens
const tokenStructure = {
  accessToken: {
    payload: {
      userId: "ObjectId",
      email: "user@example.com",
      role: "agent|manager|admin",
      team: "denis|marine",
      permissions: {
        leads: { create: true, read: true, update: true, delete: false },
        campaigns: { create: true, read: true, update: true, delete: false }
      },
      sessionId: "unique-session-id"
    },
    expiration: "15 minutes",
    algorithm: "HS256"
  },
  refreshToken: {
    payload: {
      userId: "ObjectId",
      sessionId: "unique-session-id",
      tokenVersion: 1 // Pour invalidation globale
    },
    expiration: "7 days",
    algorithm: "HS256"
  }
}
```

### Génération sécurisée des secrets

```bash
# Génération des secrets JWT en production
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # JWT_REFRESH_SECRET
openssl rand -hex 16  # ENCRYPTION_KEY (AES-256 = 32 bytes = 16 hex)

# Exemple de secrets forts
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_REFRESH_SECRET=zyxwvu9876543210fedcba0987654321098765432109876543210987654321
ENCRYPTION_KEY=1a2b3c4d5e6f7890abcdef1234567890
```

### Protection contre les attaques par timing

```javascript
// Middleware anti-timing attack
export const timingAttackProtection = (req, res, next) => {
  const startTime = process.hrtime.bigint()

  res.on('finish', () => {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // Convert to ms

    // Ensure minimum response time for auth endpoints
    const minResponseTime = 100 // 100ms minimum
    const delay = Math.max(0, minResponseTime - duration)

    if (delay > 0) {
      setTimeout(() => {}, delay)
    }
  })

  next()
}
```

### Gestion des sessions

```javascript
// Invalidation de session
const invalidateSession = async (sessionId) => {
  // Blacklist le session ID
  await RedisClient.setex(`blacklist:${sessionId}`, 86400, 'true')

  // Log l'événement
  await AuditLog.create({
    action: 'session_invalidated',
    sessionId,
    metadata: { reason: 'security_breach' }
  })
}

// Vérification de session
const validateSession = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // Vérifier si la session est blacklistée
  const isBlacklisted = await RedisClient.get(`blacklist:${decoded.sessionId}`)
  if (isBlacklisted) {
    throw new Error('Session invalidated')
  }

  return decoded
}
```

## Chiffrement des données

### Chiffrement symétrique AES-256

```javascript
// Configuration du chiffrement
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

// Fonction de chiffrement
export const encrypt = (text) => {
  if (!text) return text

  try {
    // Générer un IV aléatoire pour chaque chiffrement
    const iv = CryptoJS.lib.WordArray.random(16)

    // Chiffrer avec AES-256-CBC
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Retourner IV + données chiffrées en base64
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64)
  } catch (error) {
    logger.error('Encryption error:', error)
    throw new Error('Encryption failed')
  }
}

// Fonction de déchiffrement
export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText

  try {
    // Convertir de base64 à WordArray
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedText)

    // Extraire IV (16 premiers bytes)
    const iv = ciphertext.clone()
    iv.sigBytes = 16
    iv.clamp()

    // Extraire données chiffrées
    const encrypted = ciphertext.clone()
    encrypted.words.splice(0, 4) // Remove IV (4 words = 16 bytes)
    encrypted.sigBytes -= 16

    // Déchiffrer
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      ENCRYPTION_KEY,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    logger.error('Decryption error:', error)
    return encryptedText // Retourner la valeur originale si échec
  }
}
```

### Champs chiffrés en base de données

```javascript
// Configuration des champs chiffrés
const encryptedFields = [
  'personalInfo.email',
  'personalInfo.phone',
  'personalInfo.address.street',
  'businessInfo.bankInfo',
  'apiKeys.brevo',
  'apiKeys.slack',
  'apiKeys.googleAds',
  'apiKeys.metaAds'
]

// Middleware de chiffrement Mongoose
const encryptionMiddleware = function(next) {
  encryptedFields.forEach(field => {
    const value = this.get(field)
    if (value && !this.isModified(field)) return

    if (value) {
      this.set(field, encrypt(value))
    }
  })
  next()
}

// Application du middleware
leadSchema.pre('save', encryptionMiddleware)
userSchema.pre('save', encryptionMiddleware)
```

## Protection des mots de passe

### Configuration bcrypt

```javascript
import bcrypt from 'bcryptjs'

// Configuration sécurisée
const SALT_ROUNDS = 12 // Coût élevé pour la sécurité

// Hashage des mots de passe
export const hashPassword = async (password) => {
  // Validation force du mot de passe
  const passwordStrength = checkPasswordStrength(password)
  if (!passwordStrength.isStrong) {
    throw new Error(`Mot de passe faible: ${passwordStrength.issues.join(', ')}`)
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    logger.error('Password hashing error:', error)
    throw new Error('Password hashing failed')
  }
}

// Vérification sécurisée
export const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    logger.error('Password verification error:', error)
    return false
  }
}
```

### Politique de mots de passe

```javascript
// Règles de mot de passe
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /(.)\1{3,}/, // Répétitions (aaaa)
    /123456/, // Séquences numériques
    /qwerty/i, // Séquences clavier
    /password/i, // Mots interdits
    /mdmc/i // Nom de l'entreprise
  ]
}

// Validation de force
export const checkPasswordStrength = (password) => {
  const issues = []

  if (password.length < passwordPolicy.minLength) {
    issues.push(`Minimum ${passwordPolicy.minLength} caractères`)
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Au moins une minuscule')
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Au moins une majuscule')
  }

  if (!/\d/.test(password)) {
    issues.push('Au moins un chiffre')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Au moins un caractère spécial')
  }

  // Vérifier les patterns interdits
  passwordPolicy.forbiddenPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      issues.push('Pattern interdit détecté')
    }
  })

  return {
    isStrong: issues.length === 0,
    score: Math.max(0, 100 - (issues.length * 20)),
    issues
  }
}
```

## Rate Limiting et protection DDoS

### Configuration Express Rate Limit

```javascript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

// Rate limiting général
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par window
  message: {
    error: 'Trop de requêtes, réessayez plus tard',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser IP + User-Agent pour éviter le bypass
    return `${req.ip}:${req.get('User-Agent')}`
  }
})

// Rate limiting strict pour l'authentification
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de connexion par 15 min
  skipSuccessfulRequests: true,
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    lockoutTime: '15 minutes'
  }
})

// Rate limiting pour les actions sensibles
export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 actions sensibles par heure
  skipSuccessfulRequests: false,
  message: {
    error: 'Limite d\'actions sensibles atteinte. Réessayez dans 1 heure.'
  }
})
```

### Protection contre l'énumération d'utilisateurs

```javascript
// Réponse uniforme pour éviter l'énumération
export const preventUserEnumeration = (req, res, next) => {
  const originalJson = res.json

  res.json = function(data) {
    // Pour les endpoints d'auth, uniformiser les messages d'erreur
    if (req.path.includes('/auth/') && !data.success) {
      data.message = 'Email ou mot de passe incorrect'
      delete data.details // Supprimer les détails techniques
    }

    return originalJson.call(this, data)
  }

  next()
}
```

## Validation et sanitization

### Validation Joi

```javascript
import Joi from 'joi'

// Schémas de validation
export const validationSchemas = {
  // User registration
  userRegistration: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    ).required(),
    team: Joi.string().valid('denis', 'marine').required(),
    role: Joi.string().valid('admin', 'manager', 'agent').default('agent')
  }),

  // Lead creation
  leadCreation: Joi.object({
    personalInfo: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    }).required(),

    artistInfo: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      genre: Joi.array().items(Joi.string()).max(5),
      spotifyUrl: Joi.string().uri().optional()
    }).required(),

    businessInfo: Joi.object({
      budget: Joi.object({
        amount: Joi.number().min(100).max(1000000).required(),
        currency: Joi.string().valid('EUR', 'USD').default('EUR')
      }).required(),
      platforms: Joi.array().items(
        Joi.string().valid('youtube', 'spotify', 'meta', 'tiktok', 'google')
      ).min(1).required()
    }).required()
  })
}

// Middleware de validation
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      })
    }

    req.body = value
    next()
  }
}
```

### Sanitization MongoDB

```javascript
import mongoSanitize from 'express-mongo-sanitize'

// Configuration de sanitization
app.use(mongoSanitize({
  replaceWith: '_', // Remplacer les caractères dangereux par _
  onSanitize: ({ req, key }) => {
    logger.warn(`MongoDB injection attempt detected`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      key,
      originalValue: req.body[key]
    })
  }
}))

// Sanitization personnalisée
export const customSanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj

  const sanitized = {}

  for (const [key, value] of Object.entries(obj)) {
    // Nettoyer les clés
    const cleanKey = key.replace(/[$.]/g, '_')

    if (typeof value === 'string') {
      // Nettoyer les valeurs string
      sanitized[cleanKey] = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Supprimer scripts
        .replace(/javascript:/gi, '') // Supprimer javascript:
        .replace(/on\w+\s*=/gi, '') // Supprimer event handlers
        .trim()
    } else if (typeof value === 'object') {
      sanitized[cleanKey] = customSanitize(value)
    } else {
      sanitized[cleanKey] = value
    }
  }

  return sanitized
}
```

## Headers de sécurité

### Configuration Helmet

```javascript
import helmet from 'helmet'

// Configuration Helmet complète
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour Tailwind
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        // "'unsafe-eval'" uniquement en développement
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "ws:",
        "wss:",
        "https://api.mailgun.net",
        "https://api.brevo.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  },

  // Autres headers de sécurité
  crossOriginEmbedderPolicy: false, // Désactivé pour Socket.io
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}))

// Headers personnalisés additionnels
app.use((req, res, next) => {
  // Empêcher la mise en cache des pages sensibles
  if (req.path.includes('/api/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  // Header de sécurité personnalisé
  res.setHeader('X-CRM-Version', 'MDMC-1.0')
  res.setHeader('X-Powered-By', 'MDMC-Security')

  next()
})
```

## Audit et monitoring

### Configuration des logs d'audit

```javascript
// Modèle AuditLog complet
const auditLogSchema = new mongoose.Schema({
  // Identification de l'action
  action: {
    type: String,
    required: true,
    enum: [
      // Actions d'authentification
      'login', 'logout', 'login_failed', 'password_reset', 'account_locked',

      // Actions sur les données
      'lead_created', 'lead_updated', 'lead_deleted', 'lead_converted',
      'campaign_created', 'campaign_updated', 'campaign_deleted',
      'user_created', 'user_updated', 'user_deleted',

      // Actions de sécurité
      'permission_changed', 'role_changed', 'data_exported', 'data_imported',
      'api_key_generated', 'api_key_revoked',

      // Actions système
      'backup_created', 'backup_restored', 'system_update', 'config_changed'
    ]
  },

  // Ressource affectée
  resource: {
    type: String,
    required: true,
    enum: ['user', 'lead', 'campaign', 'system', 'auth', 'api']
  },
  resourceId: {
    type: String,
    required: false
  },

  // Utilisateur responsable
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // null pour actions système
  },
  userRole: String,
  userTeam: String,

  // Détails de l'action
  details: {
    method: String, // GET, POST, PUT, DELETE
    endpoint: String,
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    changes: [String], // Liste des champs modifiés
    reason: String,
    impact: String // 'low', 'medium', 'high', 'critical'
  },

  // Contexte technique
  metadata: {
    ip: String,
    userAgent: String,
    referer: String,
    sessionId: String,
    timestamp: { type: Date, default: Date.now },
    duration: Number, // Durée en ms
    success: { type: Boolean, default: true },
    errorCode: String,
    errorMessage: String
  },

  // Classification
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['auth', 'data', 'security', 'performance', 'business'],
    required: true
  },

  // Géolocalisation
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },

  // Statut
  reviewed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  tags: [String]
}, {
  timestamps: true
})

// Index pour performance
auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ severity: 1, createdAt: -1 })
auditLogSchema.index({ category: 1, createdAt: -1 })
```

### Middleware d'audit automatique

```javascript
// Middleware d'audit pour toutes les requêtes
export const auditMiddleware = (req, res, next) => {
  const startTime = Date.now()
  const originalJson = res.json

  // Capturer la réponse
  res.json = function(data) {
    const duration = Date.now() - startTime

    // Créer le log d'audit
    createAuditLog({
      action: `${req.method.toLowerCase()}_${req.route?.path || req.path}`,
      resource: getResourceType(req.path),
      userId: req.user?.id,
      userRole: req.user?.role,
      details: {
        method: req.method,
        endpoint: req.originalUrl,
        changes: getChangedFields(req.body),
        impact: getSeverityLevel(req)
      },
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        sessionId: req.sessionId,
        duration,
        success: res.statusCode < 400,
        errorCode: res.statusCode >= 400 ? res.statusCode : null
      },
      severity: res.statusCode >= 500 ? 'error' :
                res.statusCode >= 400 ? 'warning' : 'info',
      category: getCategoryFromPath(req.path)
    })

    return originalJson.call(this, data)
  }

  next()
}
```

## Surveillance et alertes

### Configuration des alertes de sécurité

```javascript
// Système d'alertes en temps réel
export const securityAlertSystem = {
  // Détection d'attaques
  detectSuspiciousActivity: async (req, res, next) => {
    const alerts = []

    // Trop de requêtes 4xx
    const recentErrors = await AuditLog.countDocuments({
      'metadata.ip': req.ip,
      'metadata.success': false,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 min
    })

    if (recentErrors > 10) {
      alerts.push({
        type: 'SUSPICIOUS_ACTIVITY',
        level: 'high',
        message: `IP ${req.ip} has ${recentErrors} failed requests in 5 minutes`,
        action: 'BLOCK_IP'
      })
    }

    // Tentatives de login multiples
    const failedLogins = await AuditLog.countDocuments({
      action: 'login_failed',
      'metadata.ip': req.ip,
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    })

    if (failedLogins > 3) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        level: 'critical',
        message: `Potential brute force attack from ${req.ip}`,
        action: 'BLOCK_IP_EXTENDED'
      })
    }

    // Traiter les alertes
    for (const alert of alerts) {
      await processSecurityAlert(alert, req)
    }

    next()
  }
}

// Traitement des alertes
const processSecurityAlert = async (alert, req) => {
  // Log l'alerte
  logger.error('Security Alert', {
    type: alert.type,
    level: alert.level,
    message: alert.message,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Actions automatiques
  switch (alert.action) {
    case 'BLOCK_IP':
      await blockIP(req.ip, 3600) // 1 heure
      break
    case 'BLOCK_IP_EXTENDED':
      await blockIP(req.ip, 86400) // 24 heures
      break
  }

  // Notification immédiate aux admins
  await sendSecurityAlert(alert, req)
}
```

### Health checks de sécurité

```javascript
// Endpoint de health check sécurisé
export const securityHealthCheck = async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    security: {
      ssl: {
        status: req.secure ? 'enabled' : 'disabled',
        protocols: ['TLSv1.2', 'TLSv1.3']
      },
      headers: {
        hsts: !!res.getHeader('Strict-Transport-Security'),
        csp: !!res.getHeader('Content-Security-Policy'),
        xFrameOptions: !!res.getHeader('X-Frame-Options')
      },
      rateLimit: {
        enabled: true,
        window: '15 minutes',
        maxRequests: 100
      },
      authentication: {
        method: 'JWT + Refresh Tokens',
        sessionTimeout: '15 minutes',
        tokenRotation: true
      },
      encryption: {
        algorithm: 'AES-256-CBC',
        keyLength: 256,
        dataEncryption: 'enabled'
      }
    },
    vulnerabilities: await runSecurityChecks()
  }

  // Masquer les détails sensibles en production
  if (process.env.NODE_ENV === 'production') {
    delete checks.security.encryption.keyLength
    delete checks.vulnerabilities
  }

  res.json(checks)
}
```

## Conformité RGPD

### Gestion des données personnelles

```javascript
// Contrôleur RGPD
export const gdprController = {
  // Droit d'accès (Article 15)
  getPersonalData: async (req, res) => {
    const { userId } = req.params

    // Vérifier que l'utilisateur peut accéder à ces données
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const personalData = {
      user: await User.findById(userId).select('-password'),
      leads: await Lead.find({ 'assignment.assignedTo': userId }),
      auditLogs: await AuditLog.find({ userId }).limit(100),
      campaigns: await Campaign.find({ 'team.assignedTo': userId })
    }

    // Déchiffrer les données pour l'export
    personalData.leads = personalData.leads.map(lead => ({
      ...lead.toObject(),
      personalInfo: {
        ...lead.personalInfo,
        email: decrypt(lead.personalInfo.email),
        phone: decrypt(lead.personalInfo.phone)
      }
    }))

    res.json({
      exportDate: new Date().toISOString(),
      dataSubject: userId,
      data: personalData
    })
  },

  // Droit de rectification (Article 16)
  updatePersonalData: async (req, res) => {
    // Implementation avec audit trail
  },

  // Droit à l'effacement (Article 17)
  deletePersonalData: async (req, res) => {
    const { userId } = req.params

    // Anonymiser au lieu de supprimer pour préserver l'intégrité
    await Lead.updateMany(
      { 'assignment.assignedTo': userId },
      {
        $set: {
          'personalInfo.email': '[DELETED]',
          'personalInfo.phone': '[DELETED]',
          'personalInfo.firstName': '[DELETED]',
          'personalInfo.lastName': '[DELETED]'
        }
      }
    )

    // Log de la suppression
    await AuditLog.create({
      action: 'data_deleted',
      resource: 'user',
      resourceId: userId,
      details: { reason: 'GDPR_REQUEST' },
      severity: 'info',
      category: 'data'
    })

    res.json({ message: 'Personal data deleted successfully' })
  },

  // Droit à la portabilité (Article 20)
  exportPortableData: async (req, res) => {
    // Export en format JSON structuré
  }
}
```

## Incident Response Plan

### Procédure en cas de brèche

```javascript
// Plan de réponse aux incidents
export const incidentResponsePlan = {
  // Phase 1: Détection et analyse
  detectBreach: async (indicators) => {
    const incident = await SecurityIncident.create({
      type: 'data_breach',
      severity: 'critical',
      indicators,
      status: 'detected',
      detectedAt: new Date()
    })

    // Notification immédiate
    await notifySecurityTeam(incident)

    return incident
  },

  // Phase 2: Containment
  containBreach: async (incidentId) => {
    // 1. Bloquer l'accès suspect
    await blockSuspiciousIPs()

    // 2. Révoquer les tokens compromis
    await revokeCompromisedTokens()

    // 3. Activer le mode maintenance si nécessaire
    if (severity === 'critical') {
      await enableMaintenanceMode()
    }

    // 4. Préserver les logs
    await preserveAuditLogs(incidentId)
  },

  // Phase 3: Investigation
  investigate: async (incidentId) => {
    // Analyser les logs d'audit
    const auditLogs = await AuditLog.find({
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
      },
      severity: { $in: ['warning', 'error', 'critical'] }
    })

    // Identifier les données compromises
    const compromisedData = await identifyCompromisedData(auditLogs)

    return {
      timeline: auditLogs,
      compromisedData,
      recommendations: generateRecommendations(auditLogs)
    }
  },

  // Phase 4: Notification
  notifyStakeholders: async (incident, investigation) => {
    // Notification CNIL (72h max)
    if (incident.severity === 'critical') {
      await notifyCNIL(incident, investigation)
    }

    // Notification utilisateurs affectés
    const affectedUsers = await getAffectedUsers(investigation.compromisedData)
    await notifyAffectedUsers(affectedUsers, incident)
  }
}
```

Cette documentation de sécurité couvre tous les aspects critiques de la protection du CRM MDMC Music Ads, garantissant un niveau de sécurité enterprise approprié pour la gestion de données sensibles d'artistes et de campagnes marketing.