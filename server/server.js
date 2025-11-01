import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import configurations et middlewares
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'
import { corsOptions } from './config/cors.js'
import { rateLimitConfig } from './config/rateLimit.js'

// Import des routes
import authRoutes from './routes/auth.js'
import leadsRoutes from './routes/leads.js'
import campaignsRoutes from './routes/campaigns.js'
import analyticsRoutes from './routes/analytics.js'
import usersRoutes from './routes/users.js'
import integrationsRoutes from './routes/integrations.js'
import auditRoutes from './routes/audit.js'
import webhooksRoutes from './routes/webhooks.js'

// Configuration des variables d'environnement
dotenv.config()

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: corsOptions
})

// Connexion à la base de données
console.log('Attempting to connect to DB...');
try {
  await connectDB();
  console.log('DB connection attempt finished.');
} catch (error) {
  console.error('FORCED ERROR: DB connection failed in server.js:', error);
  process.exit(1);
}

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Nécessaire pour Vite builds
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}))

app.use(compression())
app.use(mongoSanitize())
app.use(hpp())
app.use(cookieParser())

// Configuration CORS
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit(rateLimitConfig)
app.use('/api/', limiter)

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Parsing des données
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MDMC CRM API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Routes API
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/integrations', integrationsRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/webhooks', webhooksRoutes)

// Servir les fichiers statiques du client en production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist')

  // Configuration explicite pour les assets avec cache et MIME types corrects
  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
    maxAge: 0, // Pas de cache pour forcer le rechargement
    etag: false,
    lastModified: false,
    setHeaders: (res, filePath) => {
      // Headers anti-cache agressifs
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')

      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8')
      }
    }
  }))

  // Servir tous les autres fichiers statiques
  app.use(express.static(clientDistPath, {
    maxAge: '1d' // Cache 1 jour pour les autres fichiers
  }))

  // Pour toutes les routes non-API, servir index.html (SPA routing)
  app.get('*', (req, res) => {
    // Si c'est une route API qui n'existe pas, retourner 404 JSON
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Route API non trouvée'
      })
    }
    // Sinon, servir l'app React
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
} else {
  // En développement, gestion des erreurs 404 pour les API seulement
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route API non trouvée'
    })
  })
}

// Middleware de gestion d'erreurs
app.use(errorHandler)

// Configuration WebSocket pour les notifications temps réel
io.on('connection', (socket) => {
  logger.info(`Client connecté: ${socket.id}`)

  // Rejoindre une room basée sur l'utilisateur
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    logger.info(`User ${userId} a rejoint sa room`)
  })

  // Rejoindre une room basée sur l'équipe
  socket.on('join-team-room', (team) => {
    socket.join(`team-${team}`)
    logger.info(`User rejoint l'équipe ${team}`)
  })

  socket.on('disconnect', () => {
    logger.info(`Client déconnecté: ${socket.id}`)
  })
})

// Rendre io disponible globalement
app.set('io', io)

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu. Arrêt gracieux du serveur...')
  httpServer.close(() => {
    logger.info('Processus terminé')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT reçu. Arrêt gracieux du serveur...')
  httpServer.close(() => {
    logger.info('Processus terminé')
    process.exit(0)
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  logger.info(`🚀 Serveur MDMC CRM démarré sur le port ${PORT}`)
  logger.info(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`🔗 Base de données: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`)
})

export { app, io }