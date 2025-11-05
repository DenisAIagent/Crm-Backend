import express from 'express';
import {
  getDashboardAnalytics,
  getLeadAnalytics,
  getCampaignAnalytics,
  getRevenueAnalytics,
  getPerformanceComparison
} from '../controllers/analyticsController.js';
import {
  authenticate,
  requirePermission
} from '../middleware/auth.js';
import {
  validateDateRange
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard analytics overview
router.get('/dashboard',
  validateDateRange,
  requirePermission('analytics.read'),
  getDashboardAnalytics
);

// Get lead analytics
router.get('/leads',
  validateDateRange,
  requirePermission('analytics.read'),
  getLeadAnalytics
);

// Get campaign analytics
router.get('/campaigns',
  validateDateRange,
  requirePermission('analytics.read'),
  getCampaignAnalytics
);

// Get revenue analytics
router.get('/revenue',
  validateDateRange,
  requirePermission('analytics.read'),
  getRevenueAnalytics
);

// Get performance comparison between periods
router.get('/comparison',
  requirePermission('analytics.read'),
  getPerformanceComparison
);

export default router;