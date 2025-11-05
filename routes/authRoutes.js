import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  adminLogin,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  checkAuth
} from '../controllers/authController.js';
import {
  authenticate,
  adminOnly,
  generateToken,
  generateRefreshToken
} from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validatePasswordReset
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/admin-login', validateUserLogin, adminLogin);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validatePasswordReset, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate tokens for the authenticated user
    const accessToken = generateToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    // Add refresh token to user
    req.user.addRefreshToken(refreshToken);
    req.user.save();

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
  }
);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.post('/change-password', validatePasswordChange, changePassword);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/check', checkAuth);
router.post('/resend-verification', resendEmailVerification);

export default router;