# Guide de Développement - MDMC CRM

## Vue d'ensemble

Ce guide fournit toutes les informations nécessaires pour développer, maintenir et contribuer au CRM MDMC Music Ads. Il couvre les standards de code, les workflows de développement, les tests, et les bonnes pratiques.

## Configuration de l'environnement de développement

### Prérequis

```bash
# Versions requises
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.20.0

# Outils recommandés
MongoDB Compass (GUI MongoDB)
Postman (Tests API)
VS Code avec extensions recommandées
```

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-js-debug"
  ]
}
```

### Configuration initiale

```bash
# 1. Fork et clone du repository
git clone https://github.com/YOUR_USERNAME/mdmc-crm.git
cd mdmc-crm

# 2. Configuration des remotes
git remote add upstream https://github.com/DenisAIagent/mdmc-crm.git
git remote -v

# 3. Installation des dépendances
npm install
cd client && npm install && cd ..

# 4. Configuration des hooks Git
npm run prepare  # Installe husky pour les pre-commit hooks

# 5. Configuration de l'environnement
cp .env.example .env.development
# Éditer .env.development avec vos valeurs

# 6. Configuration MongoDB local (optionnel)
# Option A: MongoDB local
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Option B: MongoDB Atlas/Railway
# Utiliser l'URI fourni dans .env.development

# 7. Premier démarrage
npm run dev:all
```

## Structure du projet

```
mdmc-crm/
├── client/                     # Frontend React
│   ├── public/                 # Assets publics
│   ├── src/
│   │   ├── components/         # Composants React
│   │   │   ├── common/         # Composants réutilisables
│   │   │   ├── layout/         # Layout et navigation
│   │   │   ├── leads/          # Composants leads
│   │   │   ├── campaigns/      # Composants campagnes
│   │   │   └── analytics/      # Composants analytics
│   │   ├── hooks/              # Hooks personnalisés
│   │   ├── services/           # Services API
│   │   ├── context/            # Contextes React
│   │   ├── utils/              # Utilitaires frontend
│   │   └── styles/             # Styles globaux
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js
│   ├── config/                 # Configuration
│   ├── controllers/            # Contrôleurs API
│   ├── middleware/             # Middlewares Express
│   ├── models/                 # Modèles MongoDB
│   ├── routes/                 # Routes API
│   ├── services/               # Services métier
│   ├── utils/                  # Utilitaires backend
│   └── server.js               # Point d'entrée
├── docs/                       # Documentation
├── scripts/                    # Scripts d'automatisation
├── tests/                      # Tests automatisés
├── .github/                    # GitHub Actions
├── package.json                # Dépendances principales
└── README.md
```

## Standards de code

### JavaScript/Node.js

#### Style de code

```javascript
// ✅ Bon
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  } catch (error) {
    logger.error('Error fetching user:', error)
    throw error
  }
}

// ❌ Mauvais
function getUser(id) {
  return User.findById(id).then(user => {
    if (user) return user
    else throw new Error('not found')
  })
}
```

#### Conventions de nommage

```javascript
// Variables et fonctions : camelCase
const userEmail = 'user@example.com'
const getUserLeads = () => {}

// Constantes : UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5
const JWT_EXPIRES_IN = '15m'

// Classes et constructeurs : PascalCase
class LeadController {}
const User = mongoose.model('User', userSchema)

// Fichiers : kebab-case ou camelCase selon le type
lead-controller.js      // Controllers
userModel.js           // Models
api-client.js         // Utilitaires
```

#### Structure des fonctions

```javascript
// Template pour les contrôleurs
export const controllerFunction = asyncHandler(async (req, res) => {
  // 1. Validation des entrées
  const { error, value } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data',
      errors: error.details
    })
  }

  // 2. Vérification des permissions
  if (!hasPermission(req.user, 'resource:action')) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    })
  }

  // 3. Logique métier
  const result = await businessLogic(value)

  // 4. Audit log
  await createAuditLog({
    action: 'resource_action',
    userId: req.user.id,
    details: { resourceId: result.id }
  })

  // 5. Réponse
  res.status(200).json({
    success: true,
    message: 'Operation successful',
    data: result
  })
})
```

### React/Frontend

#### Composants fonctionnels

```jsx
// ✅ Bon composant
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

const LeadsList = ({ filters, onLeadSelect }) => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.leads.getAll(filters)
      setLeads(response.data.leads)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="leads-list">
      {leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onClick={() => onLeadSelect(lead)}
        />
      ))}
    </div>
  )
}

export default LeadsList
```

#### Hooks personnalisés

```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react'
import { api } from '../services/api'

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(endpoint, options)
      setData(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [endpoint, options])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
```

### CSS/Styling

#### Conventions Tailwind

```jsx
// ✅ Organisation des classes Tailwind
const Button = ({ variant, size, children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
```

## Workflow de développement

### Git Flow

```bash
# 1. Sync avec upstream
git checkout main
git pull upstream main
git push origin main

# 2. Créer une branche feature
git checkout -b feature/lead-filters
# Convention: feature/*, bugfix/*, hotfix/*

# 3. Développement avec commits atomiques
git add .
git commit -m "feat: add budget filter for leads list

- Add budget range slider component
- Update API to support budget filtering
- Add tests for budget filter functionality

Closes #123"

# 4. Push et Pull Request
git push origin feature/lead-filters
# Créer PR sur GitHub

# 5. Après merge, cleanup
git checkout main
git pull upstream main
git branch -d feature/lead-filters
git push origin --delete feature/lead-filters
```

### Conventions de commit

Utilisation de [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Types
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatting, sans impact sur la logique
refactor: # Refactoring sans ajout de fonctionnalité
test:     # Ajout ou modification de tests
chore:    # Maintenance (dependencies, build, etc.)
perf:     # Amélioration de performance
ci:       # Configuration CI/CD

# Exemples
feat(leads): add advanced filtering options
fix(auth): resolve token refresh loop issue
docs(api): update authentication documentation
test(campaigns): add unit tests for KPI calculations
chore: update dependencies to latest versions
```

### Pull Request Process

#### Template de PR

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No console errors/warnings

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding documentation updates made
- [ ] No new warnings introduced
```

#### Code Review Guidelines

```javascript
// ✅ Points à vérifier lors du review

// 1. Sécurité
// - Validation des entrées
// - Gestion des permissions
// - Pas de données sensibles en dur

// 2. Performance
// - Pas de requêtes N+1
// - Pagination pour les listes
// - Optimisation des requêtes MongoDB

// 3. Maintenabilité
// - Code réutilisable
// - Fonctions pures quand possible
// - Documentation des fonctions complexes

// 4. Tests
// - Coverage des nouvelles fonctionnalités
// - Tests des cas limites
// - Tests d'intégration appropriés
```

## Tests

### Structure des tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── controllers/         # Tests contrôleurs
│   ├── models/             # Tests modèles
│   ├── utils/              # Tests utilitaires
│   └── middleware/         # Tests middlewares
├── integration/            # Tests d'intégration
│   ├── api/               # Tests API endpoints
│   └── database/          # Tests base de données
├── e2e/                   # Tests end-to-end
├── fixtures/              # Données de test
└── helpers/               # Utilitaires de test
```

### Tests unitaires

```javascript
// tests/unit/controllers/leadsController.test.js
import { describe, it, expect, beforeEach, afterEach } from 'jest'
import request from 'supertest'
import { app } from '../../../server/server.js'
import Lead from '../../../server/models/Lead.js'
import User from '../../../server/models/User.js'

describe('Leads Controller', () => {
  let authToken
  let testUser
  let testLead

  beforeEach(async () => {
    // Setup test data
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      team: 'denis',
      role: 'agent'
    })

    authToken = generateTestToken(testUser)

    testLead = await Lead.create({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      artistInfo: {
        name: 'John D',
        genre: ['Pop']
      },
      businessInfo: {
        budget: { amount: 2000, currency: 'EUR' },
        platforms: ['youtube']
      }
    })
  })

  afterEach(async () => {
    // Cleanup
    await Lead.deleteMany({})
    await User.deleteMany({})
  })

  describe('GET /api/leads', () => {
    it('should return leads list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.leads).toHaveLength(1)
      expect(response.body.data.leads[0].personalInfo.firstName).toBe('John')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/leads')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should support filtering by stage', async () => {
      const response = await request(app)
        .get('/api/leads?stage=new')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.leads).toHaveLength(1)
    })
  })

  describe('POST /api/leads', () => {
    it('should create new lead with valid data', async () => {
      const leadData = {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        },
        artistInfo: {
          name: 'Jane S',
          genre: ['R&B']
        },
        businessInfo: {
          budget: { amount: 3000, currency: 'EUR' },
          platforms: ['spotify']
        }
      }

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.lead.personalInfo.firstName).toBe('Jane')

      // Verify in database
      const createdLead = await Lead.findById(response.body.data.lead.id)
      expect(createdLead).toBeTruthy()
    })

    it('should validate required fields', async () => {
      const invalidData = {
        personalInfo: {
          firstName: 'Jane'
          // Missing required fields
        }
      }

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.errors).toBeDefined()
    })
  })
})
```

### Tests d'intégration

```javascript
// tests/integration/api/auth.test.js
import { describe, it, expect, beforeAll, afterAll } from 'jest'
import request from 'supertest'
import { app } from '../../../server/server.js'
import { connectDB, disconnectDB } from '../../helpers/database.js'

describe('Authentication Integration', () => {
  beforeAll(async () => {
    await connectDB('test')
  })

  afterAll(async () => {
    await disconnectDB()
  })

  describe('Login Flow', () => {
    it('should complete full authentication cycle', async () => {
      // 1. Register user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'TestPassword123!',
        team: 'denis'
      }

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200)

      const { accessToken, refreshToken } = loginResponse.body.data

      // 3. Access protected resource
      const protectedResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(protectedResponse.body.data.user.email).toBe(userData.email)

      // 4. Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(refreshResponse.body.data.accessToken).toBeDefined()

      // 5. Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    })
  })
})
```

### Tests E2E

```javascript
// tests/e2e/leads-workflow.test.js
import { test, expect } from '@playwright/test'

test.describe('Leads Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create and manage lead', async ({ page }) => {
    // Navigate to leads
    await page.click('[data-testid="nav-leads"]')
    await expect(page).toHaveURL('/leads')

    // Create new lead
    await page.click('[data-testid="create-lead-button"]')

    // Fill form
    await page.fill('[data-testid="firstName"]', 'John')
    await page.fill('[data-testid="lastName"]', 'Doe')
    await page.fill('[data-testid="email"]', 'john@example.com')
    await page.fill('[data-testid="artistName"]', 'John D')
    await page.selectOption('[data-testid="genre"]', 'Pop')
    await page.fill('[data-testid="budget"]', '2000')
    await page.check('[data-testid="platform-youtube"]')

    // Submit
    await page.click('[data-testid="submit-lead"]')

    // Verify creation
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="lead-john-doe"]')).toBeVisible()

    // Update lead stage
    await page.click('[data-testid="lead-john-doe"]')
    await page.selectOption('[data-testid="stage-select"]', 'contacted')
    await page.click('[data-testid="save-lead"]')

    // Verify update
    await expect(page.locator('[data-testid="stage-contacted"]')).toBeVisible()
  })
})
```

### Configuration Jest

```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/server.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js'
}
```

## Débogage

### Configuration VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true
    }
  ]
}
```

### Logging pour le développement

```javascript
// utils/logger.js - Configuration développement
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/debug.log',
      level: 'debug'
    })
  ]
})

// Helper pour debug API
export const debugAPI = (req, res, next) => {
  logger.debug('API Request', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
    user: req.user?.email
  })

  const originalJson = res.json
  res.json = function(data) {
    logger.debug('API Response', {
      status: res.statusCode,
      data: JSON.stringify(data, null, 2)
    })
    return originalJson.call(this, data)
  }

  next()
}
```

## Optimisation des performances

### Backend

```javascript
// Optimisations MongoDB
const optimizedQueries = {
  // ✅ Utiliser la projection pour limiter les données
  getLeads: async (filters, page = 1, limit = 20) => {
    const skip = (page - 1) * limit

    return await Lead.find(filters)
      .select('personalInfo.firstName personalInfo.lastName artistInfo.name pipeline.stage createdAt')
      .populate('assignment.assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Retourner des objets JS simples
  },

  // ✅ Utiliser l'aggregation pour les calculs complexes
  getAnalytics: async () => {
    return await Lead.aggregate([
      {
        $group: {
          _id: '$pipeline.stage',
          count: { $sum: 1 },
          avgBudget: { $avg: '$businessInfo.budget.amount' },
          totalValue: { $sum: '$conversion.contractValue' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
  },

  // ✅ Index appropriés
  createIndexes: async () => {
    await Lead.collection.createIndex({ 'pipeline.stage': 1, createdAt: -1 })
    await Lead.collection.createIndex({ 'assignment.assignedTo': 1 })
    await Lead.collection.createIndex({ 'personalInfo.email': 1 })
    await Campaign.collection.createIndex({ status: 1, 'timeline.startDate': -1 })
  }
}

// Cache avec Redis (si disponible)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const cacheMiddleware = (ttl = 300) => { // 5 minutes par défaut
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`

    try {
      const cached = await redis.get(key)
      if (cached) {
        return res.json(JSON.parse(cached))
      }

      const originalJson = res.json
      res.json = function(data) {
        redis.setex(key, ttl, JSON.stringify(data))
        return originalJson.call(this, data)
      }

      next()
    } catch (error) {
      // Si Redis n'est pas disponible, continuer sans cache
      next()
    }
  }
}
```

### Frontend

```javascript
// Optimisations React
import React, { memo, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

// ✅ Memoization des composants lourds
const LeadCard = memo(({ lead, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(lead.id)
  }, [lead.id, onSelect])

  const statusColor = useMemo(() => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800'
    }
    return colors[lead.pipeline.stage] || 'bg-gray-100 text-gray-800'
  }, [lead.pipeline.stage])

  return (
    <div onClick={handleClick} className="lead-card">
      <span className={`status ${statusColor}`}>
        {lead.pipeline.stage}
      </span>
      {/* Reste du composant */}
    </div>
  )
})

// ✅ Virtualisation pour les grandes listes
const VirtualizedLeadsList = ({ leads }) => {
  const parentRef = useRef()

  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Hauteur estimée d'un item
    overscan: 10 // Render 10 items en dehors de la vue
  })

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <LeadCard lead={leads[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ✅ Debouncing pour les recherches
import { useDebouncedCallback } from 'use-debounce'

const SearchInput = ({ onSearch }) => {
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      onSearch(value)
    },
    300 // 300ms de délai
  )

  return (
    <input
      type="text"
      placeholder="Rechercher..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  )
}
```

## Monitoring en développement

### Performance monitoring

```javascript
// middleware/performance.js
export const performanceMonitoring = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start

    // Log slow requests
    if (duration > 1000) { // > 1 seconde
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        user: req.user?.email
      })
    }

    // Métriques pour développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${req.method} ${req.originalUrl} - ${duration}ms - ${res.statusCode}`)
    }
  })

  next()
}
```

### Error tracking

```javascript
// utils/errorTracking.js
export const trackError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })

  // En développement, afficher l'erreur dans la console
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error:', error)
    console.error('📍 Context:', context)
  }

  // En production, envoyer à Sentry ou autre service
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context })
  }
}
```

## Outils et ressources

### Extensions utiles

```bash
# VS Code Extensions
code --install-extension ms-vscode.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension mongodb.mongodb-vscode

# Outils CLI utiles
npm install -g nodemon        # Auto-restart serveur
npm install -g http-server    # Serveur statique simple
npm install -g mongodb-tools  # Outils MongoDB
```

### Scripts npm utiles

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "dev:server": "nodemon server/server.js",
    "dev:client": "cd client && npm run dev",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint server client/src --ext .js,.jsx",
    "lint:fix": "eslint server client/src --ext .js,.jsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\"",
    "build": "cd client && npm run build",
    "analyze": "cd client && npm run build -- --analyze",
    "db:seed": "node scripts/seed-database.js",
    "db:reset": "node scripts/reset-database.js",
    "logs": "tail -f logs/combined.log",
    "docs:serve": "docsify serve docs"
  }
}
```

### Commandes utiles

```bash
# Développement quotidien
npm run dev                    # Démarrer tout
npm run test:watch            # Tests en mode watch
npm run lint:fix              # Fix automatique du linting

# Base de données
npm run db:seed               # Peupler la DB avec des données de test
npm run db:reset              # Reset complet de la DB

# Debugging
npm run logs                  # Suivre les logs en temps réel
npm run analyze               # Analyser la taille du bundle

# Git
git log --oneline -10         # Historique concis
git status -sb                # Status court
git diff --staged             # Diff des fichiers stagés
```

Ce guide de développement fournit tout le nécessaire pour contribuer efficacement au CRM MDMC Music Ads en maintenant la qualité et la cohérence du code.