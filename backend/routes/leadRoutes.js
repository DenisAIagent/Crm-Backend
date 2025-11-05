import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  addInteraction,
  setNextFollowUp,
  convertLead,
  markAsLost,
  getOverdueLeads,
  getLeadStats,
  bulkUpdateLeads,
  exportLeads
} from '../controllers/leadController.js';
import {
  authenticate,
  requirePermission,
  managerAndAbove
} from '../middleware/auth.js';
import {
  validateLeadCreation,
  validateLeadUpdate,
  validateObjectId,
  validatePagination,
  validateDateRange
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get leads with filtering and pagination
router.get('/',
  validatePagination,
  validateDateRange,
  requirePermission('leads.read'),
  getLeads
);

// Get lead statistics
router.get('/stats',
  requirePermission('leads.read'),
  getLeadStats
);

// Get overdue leads
router.get('/overdue',
  requirePermission('leads.read'),
  getOverdueLeads
);

// Export leads
router.get('/export',
  requirePermission('leads.read'),
  exportLeads
);

// Bulk update leads
router.patch('/bulk',
  requirePermission('leads.write'),
  bulkUpdateLeads
);

// Get single lead
router.get('/:id',
  validateObjectId('id'),
  requirePermission('leads.read'),
  getLead
);

// Create new lead
router.post('/',
  validateLeadCreation,
  requirePermission('leads.write'),
  createLead
);

// Update lead
router.put('/:id',
  validateObjectId('id'),
  validateLeadUpdate,
  requirePermission('leads.write'),
  updateLead
);

// Delete lead (soft delete)
router.delete('/:id',
  validateObjectId('id'),
  requirePermission('leads.delete'),
  managerAndAbove,
  deleteLead
);

// Assign lead to user
router.patch('/:id/assign',
  validateObjectId('id'),
  requirePermission('leads.write'),
  managerAndAbove,
  assignLead
);

// Add interaction to lead
router.post('/:id/interactions',
  validateObjectId('id'),
  requirePermission('leads.write'),
  addInteraction
);

// Set next follow-up
router.patch('/:id/follow-up',
  validateObjectId('id'),
  requirePermission('leads.write'),
  setNextFollowUp
);

// Convert lead
router.patch('/:id/convert',
  validateObjectId('id'),
  requirePermission('leads.write'),
  convertLead
);

// Mark lead as lost
router.patch('/:id/lost',
  validateObjectId('id'),
  requirePermission('leads.write'),
  markAsLost
);

export default router;