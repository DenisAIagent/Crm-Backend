import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
  // Informations de base
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Veuillez entrer un email valide'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Le mot de passe n'est requis que si pas d'auth Google
    },
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
  },

  // OAuth et authentification externe
  googleId: {
    type: String,
    sparse: true // Permet null/undefined mais unique si défini
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: null
  },

  // Rôle et permissions
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent'],
    default: 'agent'
  },
  permissions: {
    leads: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    campaigns: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    analytics: {
      read: { type: Boolean, default: true },
      export: { type: Boolean, default: false }
    },
    admin: {
      users: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
      audit: { type: Boolean, default: false }
    }
  },

  // Assignation et spécialisation
  assignedPlatforms: [{
    type: String,
    enum: ['youtube', 'spotify', 'meta', 'tiktok', 'google']
  }],
  team: {
    type: String,
    enum: ['denis', 'marine'],
    required: true
  },

  // Configuration utilisateur
  preferences: {
    language: { type: String, default: 'fr' },
    timezone: { type: String, default: 'Europe/Paris' },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      slack: { type: Boolean, default: false }
    },
    dashboard: {
      defaultView: { type: String, default: 'kanban' },
      refreshInterval: { type: Number, default: 30000 }
    }
  },

  // Sécurité
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  // Tokens de sécurité
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // API Keys pour intégrations
  apiKeys: {
    brevo: { type: String, select: false },
    slack: { type: String, select: false },
    googleAds: { type: String, select: false },
    metaAds: { type: String, select: false }
  },

  // Statistiques performance
  stats: {
    leadsCreated: { type: Number, default: 0 },
    leadsConverted: { type: Number, default: 0 },
    campaignsManaged: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 } // en minutes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index pour optimiser les requêtes (email déjà indexé via unique: true)
userSchema.index({ team: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ assignedPlatforms: 1 })
userSchema.index({ googleId: 1 }, { sparse: true }) // Index sparse pour googleId

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

userSchema.virtual('conversionRate').get(function() {
  if (this.stats.leadsCreated === 0) return 0
  return (this.stats.leadsConverted / this.stats.leadsCreated * 100).toFixed(2)
})

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié et qu'il existe
  if (!this.isModified('password') || !this.password) return next()

  try {
    // Générer un salt et hasher le mot de passe
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Middleware pre-save pour la gestion des tentatives de connexion
userSchema.pre('save', function(next) {
  // Si lockUntil est défini et dans le passé, reset les tentatives
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 0
    this.lockUntil = undefined
  }
  next()
})

// Méthodes d'instance
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.incrementLoginAttempts = function() {
  // Si on a un verrou et qu'il est expiré, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Verrouiller le compte après 5 tentatives pour 2 heures
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }
  }

  return this.updateOne(updates)
}

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex')

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 heures

  return token
}

userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  return token
}

// Méthodes statiques
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true })
}

userSchema.statics.findByTeam = function(team) {
  return this.find({ team, isActive: true })
}

userSchema.statics.findByPlatform = function(platform) {
  return this.find({
    assignedPlatforms: platform,
    isActive: true
  })
}

const User = mongoose.model('User', userSchema)

export default User