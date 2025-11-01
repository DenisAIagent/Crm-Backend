import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

/**
 * Configuration et connexion MongoDB sécurisée pour MDMC CRM
 * Avec pool de connexions optimisé et gestion d'erreurs robuste
 */

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdmc_crm'

    const options = {
      // Pool de connexions optimisé
      maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
      minPoolSize: 5,

      // Timeouts pour la production
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,

      // Options de performance
      maxIdleTimeMS: 30000,
      bufferCommands: false,

      // Compression pour réduire la bande passante
      compressors: ['zlib'],

      // Options de sécurité
      authSource: 'admin',
      ssl: false, // Railway MongoDB ne supporte pas SSL

      // Nom de l'application pour monitoring
      appName: 'MDMC-CRM'
    }

    // Options spécifiques à la production
    if (process.env.NODE_ENV === 'production') {
      options.retryWrites = true
      options.w = 'majority'
      options.readPreference = 'primaryPreferred'
      options.readConcern = { level: 'majority' }
      options.wtimeoutMS = 5000
    }

    // Connexion avec retry automatique
    const conn = await mongoose.connect(mongoURI, options)

    // Configuration des index pour optimiser les performances
    // await createDatabaseIndexes()

    logger.info(`🔗 MongoDB connecté avec succès: ${conn.connection.host}:${conn.connection.port}`)
    logger.info(`📊 Base de données: ${conn.connection.name}`)
    logger.info(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`)

    // Monitoring des performances
    setupConnectionMonitoring()

    // Gestion des événements de connexion
    setupConnectionEventHandlers()

    // Configuration de l'arrêt gracieux
    setupGracefulShutdown()

    return conn

  } catch (error) {
    console.error('DEBUG: MongoDB connection error:', error.message);
    console.error('DEBUG: Stack trace:', error.stack);
    logger.error('❌ Erreur critique de connexion MongoDB:', error.message)
    logger.error('Stack trace:', error.stack)

    // Retry en cas d'échec en développement
    if (process.env.NODE_ENV !== 'production') {
      logger.info('⏳ Nouvelle tentative de connexion dans 5 secondes...')
      setTimeout(() => connectDB(), 5000)
    } else {
      console.error('FORCED ERROR: Backend exiting due to MongoDB connection failure.', error);
      process.exit(1)
    }
  }
}

/**
 * Crée les index de base de données pour optimiser les performances
 */
const createDatabaseIndexes = async () => {
  try {
    // Index pour les utilisateurs
    await mongoose.connection.db.collection('users').createIndex(
      { email: 1 },
      { unique: true, background: true }
    )

    // Index pour les leads
    await mongoose.connection.db.collection('leads').createIndexes([
      { key: { status: 1, assignedTo: 1 }, background: true },
      { key: { platform: 1, createdAt: -1 }, background: true },
      { key: { assignedTeam: 1, lastActivityDate: -1 }, background: true },
      { key: { nextFollowUp: 1 }, background: true },
      { key: { leadScore: -1 }, background: true },
      { key: { artistName: 'text' }, background: true }
    ])

    // Index pour les campagnes
    await mongoose.connection.db.collection('campaigns').createIndexes([
      { key: { leadId: 1, status: 1 }, background: true },
      { key: { assignedTo: 1, startDate: -1 }, background: true },
      { key: { platform: 1, status: 1 }, background: true }
    ])

    // Index pour les logs d'audit
    await mongoose.connection.db.collection('auditlogs').createIndexes([
      { key: { userId: 1, createdAt: -1 }, background: true },
      { key: { action: 1, createdAt: -1 }, background: true },
      { key: { entityType: 1, entityId: 1 }, background: true },
      // TTL index pour supprimer automatiquement les anciens logs (2 ans)
      { key: { createdAt: 1 }, expireAfterSeconds: 63072000, background: true }
    ])

    logger.info('✅ Index de base de données créés avec succès')
  } catch (error) {
    logger.warn('⚠️ Erreur lors de la création des index:', error.message)
  }
}

/**
 * Configure le monitoring des performances de connexion
 */
const setupConnectionMonitoring = () => {
  // Monitoring des requêtes lentes
  mongoose.set('debug', process.env.NODE_ENV === 'development')

  // Statistiques de connexion
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const stats = mongoose.connection.db.stats()
      logger.info('📈 Statistiques MongoDB:', {
        connectionsActive: mongoose.connection.readyState,
        poolSize: mongoose.connection.db.serverConfig?.connections?.length || 0
      })
    }, 300000) // Toutes les 5 minutes
  }
}

/**
 * Configure les gestionnaires d'événements de connexion
 */
const setupConnectionEventHandlers = () => {
  mongoose.connection.on('error', (err) => {
    logger.error('❌ Erreur MongoDB:', err.message)

    // Notification d'erreur critique en production
    if (process.env.NODE_ENV === 'production') {
      // Ici on peut ajouter une notification Slack/email
      logger.error('🚨 Erreur critique MongoDB en production')
    }
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB déconnecté - Tentative de reconnexion...')
  })

  mongoose.connection.on('reconnected', () => {
    logger.info('✅ MongoDB reconnecté avec succès')
  })

  mongoose.connection.on('close', () => {
    logger.info('🔌 Connexion MongoDB fermée')
  })

  mongoose.connection.on('fullsetup', () => {
    logger.info('🎯 Replica set MongoDB configuré')
  })
}

/**
 * Configure l'arrêt gracieux de la connexion
 */
const setupGracefulShutdown = () => {
  const gracefulShutdown = async (signal) => {
    logger.info(`📤 Signal ${signal} reçu - Fermeture gracieuse de MongoDB...`)

    try {
      await mongoose.connection.close()
      logger.info('✅ Connexion MongoDB fermée proprement')
      process.exit(0)
    } catch (error) {
      logger.error('❌ Erreur lors de la fermeture de MongoDB:', error.message)
      process.exit(1)
    }
  }

  // Gestion des signaux système
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'))

  // Gestion des erreurs non capturées
  process.on('uncaughtException', (error) => {
    logger.error('❌ Exception non capturée:', error)
    gracefulShutdown('uncaughtException')
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Promesse rejetée non gérée:', reason)
    gracefulShutdown('unhandledRejection')
  })
}

/**
 * Vérifie l'état de la connexion MongoDB
 */
export const checkConnection = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }

  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  }
}

/**
 * Ferme la connexion MongoDB (pour les tests)
 */
export const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
    logger.info('🔌 Connexion MongoDB fermée manuellement')
  }
}

export { connectDB }