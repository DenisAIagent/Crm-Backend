import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../middleware/auth.js';
import {
  asyncHandler,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createInternalServerError
} from '../middleware/errorMiddleware.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createValidationError('User with this email already exists');
  }

  // Set default permissions based on role
  const permissions = User.getPermissionsByRole(role || 'agent');

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'agent',
    permissions,
    createdBy: req.user?.id // Set if admin is creating the user
  });

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Add refresh token to user
  user.addRefreshToken(refreshToken);
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+password');

  if (!user) {
    throw createUnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw createUnauthorizedError('Account is deactivated. Please contact administrator.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createUnauthorizedError('Invalid email or password');
  }

  // Update login stats
  user.lastLogin = new Date();
  user.loginCount += 1;
  user.lastActivity = new Date();

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Add refresh token to user
  user.addRefreshToken(refreshToken);
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
});

// Admin login with predefined credentials
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for admin credentials
  const adminEmail = 'admin@mdmcmusicads.com';
  const adminPassword = 'MDMC_Admin_2025!';

  if (email !== adminEmail || password !== adminPassword) {
    throw createUnauthorizedError('Invalid admin credentials');
  }

  // Find or create admin user
  let adminUser = await User.findByEmail(adminEmail);

  if (!adminUser) {
    // Create admin user if it doesn't exist
    adminUser = await User.create({
      firstName: 'MDMC',
      lastName: 'Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      permissions: User.getPermissionsByRole('admin'),
      isVerified: true,
      isActive: true
    });
  } else {
    // Update login stats
    adminUser.lastLogin = new Date();
    adminUser.loginCount += 1;
    adminUser.lastActivity = new Date();
  }

  // Generate tokens
  const accessToken = generateToken(adminUser._id);
  const refreshToken = generateRefreshToken(adminUser._id);

  // Add refresh token to user
  adminUser.addRefreshToken(refreshToken);
  await adminUser.save();

  // Remove password from response
  const userResponse = adminUser.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
});

// Refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createValidationError('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createUnauthorizedError('Invalid refresh token');
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      throw createUnauthorizedError('Invalid refresh token');
    }

    // Check if user is active
    if (!user.isActive) {
      throw createUnauthorizedError('Account is deactivated');
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    });

  } catch (error) {
    throw createUnauthorizedError('Invalid refresh token');
  }
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken && req.user) {
    // Remove refresh token from user
    req.user.removeRefreshToken(refreshToken);
    await req.user.save();
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Logout from all devices
export const logoutAll = asyncHandler(async (req, res) => {
  // Clear all refresh tokens
  req.user.refreshTokens = [];
  await req.user.save();

  res.json({
    success: true,
    message: 'Logged out from all devices'
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.json({
    success: true,
    data: { user }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'firstName', 'lastName', 'phone', 'timezone', 'preferences'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Add updatedBy
  updates.updatedBy = req.user._id;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createUnauthorizedError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  user.updatedBy = req.user._id;
  await user.save();

  // Clear all refresh tokens to force re-login
  user.refreshTokens = [];
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully. Please log in again.'
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal that user doesn't exist
    return res.json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // In a real application, you would send an email here
    // For now, we'll just log the token (remove in production)
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
      // Remove this in production:
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw createInternalServerError('Error sending password reset email');
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw createValidationError('Invalid or expired password reset token');
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.updatedBy = user._id;

  // Clear all refresh tokens
  user.refreshTokens = [];

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.'
  });
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw createValidationError('Invalid or expired verification token');
  }

  // Update user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Resend email verification
export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isVerified) {
    return res.json({
      success: true,
      message: 'Email is already verified'
    });
  }

  // Generate verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // In a real application, you would send an email here
    console.log('Email verification token:', verificationToken);

    res.json({
      success: true,
      message: 'Verification email has been sent.',
      // Remove this in production:
      ...(process.env.NODE_ENV === 'development' && { verificationToken })
    });

  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw createInternalServerError('Error sending verification email');
  }
});

// Check authentication status
export const checkAuth = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'User is authenticated',
    data: {
      user: req.user,
      permissions: req.user.permissions,
      isAuthenticated: true
    }
  });
});