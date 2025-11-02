import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { generateToken, generateRefreshToken, authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { auditLogin, auditLogout } from '../middleware/audit.js'
import {
  sensitiveActionLimiter,
  timingAttackProtection,
  preventUserEnumeration
} from '../middleware/security.js'
import { logger } from '../utils/logger.js'
import crypto from 'crypto'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Validation rules
const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  body('team')
    .isIn(['denis', 'marine'])
    .withMessage('Équipe invalide')
]

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
]

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (admin only in production)
router.post('/register',
  sensitiveActionLimiter,
  registerValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      })
    }

    const { firstName, lastName, email, password, team, role = 'agent' } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      })
    }

    // Déterminer les plateformes assignées selon l'équipe
    let assignedPlatforms = []
    if (team === 'denis') {
      assignedPlatforms = ['youtube', 'spotify']
    } else if (team === 'marine') {
      assignedPlatforms = ['meta', 'tiktok']
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      team,
      role,
      assignedPlatforms,
      isVerified: process.env.NODE_ENV === 'development' // Auto-verify en dev
    })

    // Générer les tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Configurer le cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }

    res.cookie('authToken', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    })

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        team: user.team,
        assignedPlatforms: user.assignedPlatforms,
        permissions: user.permissions,
        isVerified: user.isVerified
      },
      token,
      refreshToken
    })
  })
)

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login',
  timingAttackProtection,
  preventUserEnumeration,
  auditLogin,
  loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      })
    }

    const { email, password, rememberMe } = req.body

    // Chercher l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      })
    }

    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      await user.incrementLoginAttempts()
      return res.status(423).json({
        success: false,
        message: 'Compte temporairement verrouillé. Réessayez plus tard.'
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      await user.incrementLoginAttempts()
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      })
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      })
    }

    // Connexion réussie - réinitialiser les tentatives
    await user.resetLoginAttempts()
    user.lastLogin = new Date()
    await user.save()

    // Générer les tokens
    const tokenExpiry = rememberMe ? '7d' : '24h'
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Configurer les cookies
    const cookieExpiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiry),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }

    res.cookie('authToken', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Refresh token toujours 7 jours
    })

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        team: user.team,
        assignedPlatforms: user.assignedPlatforms,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.twoFactorEnabled
      },
      token,
      refreshToken
    })
  })
)

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout',
  authenticate,
  auditLogout,
  asyncHandler(async (req, res) => {
    // Effacer les cookies
    res.clearCookie('authToken')
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    })
  })
)

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        team: user.team,
        assignedPlatforms: user.assignedPlatforms,
        permissions: user.permissions,
        preferences: user.preferences,
        stats: user.stats,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.twoFactorEnabled
      }
    })
  })
)

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || req.cookies

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant'
      })
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

      if (decoded.type !== 'refresh') {
        throw new Error('Type de token invalide')
      }

      const user = await User.findById(decoded.id)

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé ou inactif'
        })
      }

      // Générer nouveaux tokens
      const newToken = generateToken(user._id)
      const newRefreshToken = generateRefreshToken(user._id)

      // Configurer les cookies
      const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }

      res.cookie('authToken', newToken, cookieOptions)
      res.cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })

      res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken
      })

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide'
      })
    }
  })
)

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password',
  sensitiveActionLimiter,
  [body('email').isEmail().withMessage('Email invalide').normalizeEmail()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email invalide'
      })
    }

    const { email } = req.body

    const user = await User.findByEmail(email)

    if (!user) {
      // Toujours retourner succès pour éviter l'énumération d'utilisateurs
      return res.json({
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation'
      })
    }

    // Générer le token de réinitialisation
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    try {
      // TODO: Envoyer l'email avec Brevo
      // await sendPasswordResetEmail(user.email, resetToken)

      logger.info(`Token de réinitialisation généré pour ${email}: ${resetToken}`)

      res.json({
        success: true,
        message: 'Email de réinitialisation envoyé'
      })

    } catch (error) {
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save()

      logger.error('Erreur envoi email réinitialisation:', error)

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      })
    }
  })
)

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token',
  sensitiveActionLimiter,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: errors.array()
      })
    }

    const { token } = req.params
    const { password } = req.body

    // Hasher le token pour comparaison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      })
    }

    // Réinitialiser le mot de passe
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Générer nouveaux tokens
    const newToken = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Configurer les cookies
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }

    res.cookie('authToken', newToken, cookieOptions)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      token: newToken,
      refreshToken
    })
  })
)

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password',
  authenticate,
  sensitiveActionLimiter,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password')

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      })
    }

    // Changer le mot de passe
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    })
  })
)

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification invalide ou expiré'
      })
    }

    user.isVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    })
  })
)

// @desc    Google OAuth callback (GET pour redirection directe depuis Google)
// @route   GET /auth/google/callback
// @access  Public
router.get('/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query

    // Si erreur OAuth
    if (error) {
      const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000'
      return res.redirect(`${frontendURL}/login?error=oauth_error&message=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
      const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000'
      return res.redirect(`${frontendURL}/login?error=missing_params`)
    }

    try {
      // Échanger le code contre un token d'accès
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL}/login`
      })

      const { access_token } = tokenResponse.data

      // Récupérer les informations utilisateur depuis Google
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      const googleUser = userResponse.data

      // Chercher ou créer l'utilisateur
      let user = await User.findOne({
        $or: [
          { email: googleUser.email },
          { googleId: googleUser.id }
        ]
      })

      if (!user) {
        // Créer un nouvel utilisateur
        user = await User.create({
          firstName: googleUser.given_name || 'Utilisateur',
          lastName: googleUser.family_name || 'Google',
          email: googleUser.email,
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isVerified: true, // Les comptes Google sont pré-vérifiés
          team: 'denis', // Par défaut
          role: 'agent',
          assignedPlatforms: ['youtube', 'spotify'], // Par défaut équipe Denis
          authProvider: 'google'
        })
      } else if (!user.googleId) {
        // Lier un compte existant avec Google
        user.googleId = googleUser.id
        user.isVerified = true
        if (googleUser.picture && !user.profilePicture) {
          user.profilePicture = googleUser.picture
        }
        await user.save()
      }

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date()
      await user.save()

      // Générer les tokens
      const token = generateToken(user._id)
      const refreshToken = generateRefreshToken(user._id)

      // Configurer les cookies
      const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }

      res.cookie('authToken', token, cookieOptions)
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })

      // Audit de connexion
      logger.info(`Connexion Google réussie pour ${user.email}`)

      // Rediriger vers le frontend avec succès
      const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000'
      const redirectURL = `${frontendURL}/login?success=true&token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        team: user.team
      }))}`

      res.redirect(redirectURL)

    } catch (error) {
      logger.error('Erreur lors de l\'authentification Google:', error)

      const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000'

      if (error.response?.status === 400) {
        return res.redirect(`${frontendURL}/login?error=invalid_code`)
      }

      res.redirect(`${frontendURL}/login?error=server_error`)
    }
  })
)

// @desc    Google OAuth callback API (POST pour usage interne)
// @route   POST /api/auth/google/callback
// @access  Public
router.post('/google/callback',
  asyncHandler(async (req, res) => {
    const { code, state } = req.body

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Code d\'autorisation ou state manquant'
      })
    }

    try {
      // Échanger le code contre un token d'accès
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL}/login`
      })

      const { access_token } = tokenResponse.data

      // Récupérer les informations utilisateur depuis Google
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      const googleUser = userResponse.data

      // Chercher ou créer l'utilisateur
      let user = await User.findOne({
        $or: [
          { email: googleUser.email },
          { googleId: googleUser.id }
        ]
      })

      if (!user) {
        // Créer un nouvel utilisateur
        user = await User.create({
          firstName: googleUser.given_name || 'Utilisateur',
          lastName: googleUser.family_name || 'Google',
          email: googleUser.email,
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          isVerified: true,
          team: 'denis',
          role: 'agent',
          assignedPlatforms: ['youtube', 'spotify'],
          authProvider: 'google'
        })
      } else if (!user.googleId) {
        // Lier un compte existant avec Google
        user.googleId = googleUser.id
        user.isVerified = true
        if (googleUser.picture && !user.profilePicture) {
          user.profilePicture = googleUser.picture
        }
        await user.save()
      }

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date()
      await user.save()

      // Générer les tokens
      const token = generateToken(user._id)
      const refreshToken = generateRefreshToken(user._id)

      // Configurer les cookies
      const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }

      res.cookie('authToken', token, cookieOptions)
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })

      // Audit de connexion
      logger.info(`Connexion Google API réussie pour ${user.email}`)

      res.json({
        success: true,
        message: 'Connexion Google réussie',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          team: user.team,
          assignedPlatforms: user.assignedPlatforms,
          permissions: user.permissions,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      })

    } catch (error) {
      logger.error('Erreur lors de l\'authentification Google API:', error)

      if (error.response?.status === 400) {
        return res.status(400).json({
          success: false,
          message: 'Code d\'autorisation invalide ou expiré'
        })
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'authentification Google'
      })
    }
  })
)

// @desc    Revoke Google OAuth token
// @route   POST /api/auth/google/revoke
// @access  Private
router.post('/google/revoke',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user.id)

      if (user.authProvider === 'google' && user.googleId) {
        // En production, ici on pourrait révoquer le token côté Google
        // Pour l'instant, on nettoie juste côté serveur
        logger.info(`Révocation Google OAuth pour ${user.email}`)
      }

      res.json({
        success: true,
        message: 'Token Google révoqué avec succès'
      })

    } catch (error) {
      logger.error('Erreur lors de la révocation Google:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la révocation du token'
      })
    }
  })
)

export default router