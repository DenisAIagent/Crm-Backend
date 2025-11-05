import express from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateMetrics,
  addDailyMetrics,
  pauseCampaign,
  resumeCampaign,
  completeCampaign,
  addOptimization,
  getCampaignStats,
  getCampaignPerformance,
  bulkUpdateCampaigns,
  duplicateCampaign
} from '../controllers/campaignController.js';
import {
  authenticate,
  requirePermission,
  managerAndAbove
} from '../middleware/auth.js';
import {
  validateCampaignCreation,
  validateCampaignUpdate,
  validateObjectId,
  validatePagination,
  validateDateRange
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get campaigns with filtering and pagination
router.get('/',
  validatePagination,
  validateDateRange,
  requirePermission('campaigns.read'),
  getCampaigns
);

// Get campaign statistics
router.get('/stats',
  requirePermission('campaigns.read'),
  getCampaignStats
);

// Bulk update campaigns
router.patch('/bulk',
  requirePermission('campaigns.write'),
  managerAndAbove,
  bulkUpdateCampaigns
);

// Get single campaign
router.get('/:id',
  validateObjectId('id'),
  requirePermission('campaigns.read'),
  getCampaign
);

// Get campaign performance over time
router.get('/:id/performance',
  validateObjectId('id'),
  validateDateRange,
  requirePermission('campaigns.read'),
  getCampaignPerformance
);

// Create new campaign
router.post('/',
  validateCampaignCreation,
  requirePermission('campaigns.write'),
  createCampaign
);

// Duplicate campaign
router.post('/:id/duplicate',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  duplicateCampaign
);

// Update campaign
router.put('/:id',
  validateObjectId('id'),
  validateCampaignUpdate,
  requirePermission('campaigns.write'),
  updateCampaign
);

// Delete campaign (archive)
router.delete('/:id',
  validateObjectId('id'),
  requirePermission('campaigns.delete'),
  managerAndAbove,
  deleteCampaign
);

// Update campaign metrics
router.patch('/:id/metrics',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  updateMetrics
);

// Add daily metrics
router.post('/:id/daily-metrics',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  addDailyMetrics
);

// Pause campaign
router.patch('/:id/pause',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  pauseCampaign
);

// Resume campaign
router.patch('/:id/resume',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  resumeCampaign
);

// Complete campaign
router.patch('/:id/complete',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  completeCampaign
);

// Add optimization
router.post('/:id/optimizations',
  validateObjectId('id'),
  requirePermission('campaigns.write'),
  addOptimization
);

export default router;