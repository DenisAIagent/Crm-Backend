import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  changeUserRole,
  getUserStats,
  getUserActivity,
  bulkUpdateUsers,
  getUserPermissions,
  updateUserPermissions
} from '../controllers/userController.js';
import {
  authenticate,
  requirePermission,
  adminOnly,
  managerAndAbove
} from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserUpdate,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get users with filtering and pagination
router.get('/',
  validatePagination,
  requirePermission('users.read'),
  getUsers
);

// Get user statistics (admin/manager only)
router.get('/stats',
  requirePermission('users.read'),
  managerAndAbove,
  getUserStats
);

// Bulk update users (admin only)
router.patch('/bulk',
  requirePermission('users.write'),
  adminOnly,
  bulkUpdateUsers
);

// Get single user
router.get('/:id',
  validateObjectId('id'),
  requirePermission('users.read'),
  getUser
);

// Get user activity
router.get('/:id/activity',
  validateObjectId('id'),
  requirePermission('users.read'),
  getUserActivity
);

// Get user permissions
router.get('/:id/permissions',
  validateObjectId('id'),
  requirePermission('users.read'),
  adminOnly,
  getUserPermissions
);

// Create new user (admin only)
router.post('/',
  validateUserRegistration,
  requirePermission('users.write'),
  adminOnly,
  createUser
);

// Update user
router.put('/:id',
  validateObjectId('id'),
  validateUserUpdate,
  requirePermission('users.write'),
  updateUser
);

// Delete user (deactivate)
router.delete('/:id',
  validateObjectId('id'),
  requirePermission('users.delete'),
  adminOnly,
  deleteUser
);

// Activate user
router.patch('/:id/activate',
  validateObjectId('id'),
  requirePermission('users.write'),
  adminOnly,
  activateUser
);

// Change user role
router.patch('/:id/role',
  validateObjectId('id'),
  requirePermission('users.write'),
  adminOnly,
  changeUserRole
);

// Update user permissions
router.patch('/:id/permissions',
  validateObjectId('id'),
  requirePermission('users.write'),
  adminOnly,
  updateUserPermissions
);

export default router;