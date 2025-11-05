import { body, param, query, validationResult } from 'express-validator';
import { createValidationError } from './errorMiddleware.js';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

// User validation rules
export const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  body('role')
    .optional()
    .isIn(['admin', 'manager', 'agent', 'viewer'])
    .withMessage('Invalid role'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['admin', 'manager', 'agent', 'viewer'])
    .withMessage('Invalid role'),

  handleValidationErrors
];

// Lead validation rules
export const validateLeadCreation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('artistName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Artist name cannot be more than 100 characters'),

  body('genre')
    .optional()
    .isIn([
      'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 'Electronic', 'Jazz',
      'Classical', 'Folk', 'Blues', 'Reggae', 'Punk', 'Metal', 'Alternative',
      'Indie', 'Soul', 'Funk', 'Gospel', 'Latin', 'World', 'Other'
    ])
    .withMessage('Invalid genre'),

  body('source')
    .notEmpty()
    .withMessage('Lead source is required')
    .isIn(['website', 'social_media', 'email', 'referral', 'advertising', 'event', 'cold_outreach', 'organic', 'other'])
    .withMessage('Invalid lead source'),

  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'unqualified'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number')
    .custom((value, { req }) => {
      if (req.body.budget && req.body.budget.max && value > req.body.budget.max) {
        throw new Error('Minimum budget cannot be greater than maximum budget');
      }
      return true;
    }),

  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),

  body('servicesInterested')
    .optional()
    .isArray()
    .withMessage('Services interested must be an array'),

  body('servicesInterested.*')
    .optional()
    .isIn([
      'youtube_promotion', 'meta_ads', 'tiktok_ads', 'spotify_promotion',
      'playlist_placement', 'influencer_marketing', 'pr_campaign',
      'music_video_production', 'social_media_management', 'website_development',
      'brand_development', 'consultation', 'other'
    ])
    .withMessage('Invalid service'),

  handleValidationErrors
];

export const validateLeadUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'unqualified'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('score')
    .optional()
    .isNumeric()
    .withMessage('Score must be a number')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),

  handleValidationErrors
];

// Campaign validation rules
export const validateCampaignCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),

  body('type')
    .notEmpty()
    .withMessage('Campaign type is required')
    .isIn([
      'youtube_promotion', 'meta_ads', 'tiktok_ads', 'spotify_promotion',
      'playlist_placement', 'influencer_marketing', 'pr_campaign',
      'social_media', 'email_marketing', 'content_marketing',
      'paid_search', 'display_ads', 'retargeting', 'other'
    ])
    .withMessage('Invalid campaign type'),

  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),

  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('budget.total')
    .notEmpty()
    .withMessage('Total budget is required')
    .isNumeric()
    .withMessage('Total budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Total budget cannot be negative'),

  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),

  body('manager')
    .notEmpty()
    .withMessage('Campaign manager is required')
    .isMongoId()
    .withMessage('Invalid manager ID'),

  handleValidationErrors
];

export const validateCampaignUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'])
    .withMessage('Invalid campaign status'),

  body('budget.total')
    .optional()
    .isNumeric()
    .withMessage('Total budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Total budget cannot be negative'),

  handleValidationErrors
];

// Generic validation rules
export const validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`),

  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query.startDate && value <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors
];

// Password validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];

export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};