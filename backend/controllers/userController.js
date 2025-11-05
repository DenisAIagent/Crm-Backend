import User from '../models/User.js';
import {
  asyncHandler,
  createNotFoundError,
  createValidationError,
  createForbiddenError
} from '../middleware/errorMiddleware.js';

// Get all users with filtering and pagination
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    isActive,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Text search
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj = { [sort]: sortOrder };

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('-password -refreshTokens')
      .populate('createdBy', 'firstName lastName email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    }
  });
});

// Get single user by ID
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -refreshTokens')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!user) {
    throw createNotFoundError('User');
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Create new user (admin only)
export const createUser = asyncHandler(async (req, res) => {
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
    createdBy: req.user._id
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userResponse }
  });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  // Check permissions - users can only update their own profile unless admin/manager
  if (req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      req.user._id.toString() !== id) {
    throw createForbiddenError('You can only update your own profile');
  }

  // Restrict role changes for non-admins
  if (req.body.role && req.user.role !== 'admin') {
    throw createForbiddenError('Only admins can change user roles');
  }

  // Prepare update data
  const allowedUpdates = [
    'firstName', 'lastName', 'phone', 'timezone', 'preferences'
  ];

  // Add role and permissions for admins
  if (req.user.role === 'admin') {
    allowedUpdates.push('role', 'permissions', 'isActive');
  }

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Update permissions if role is changed
  if (updates.role) {
    updates.permissions = User.getPermissionsByRole(updates.role);
  }

  updates.updatedBy = req.user._id;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
});

// Delete user (deactivate)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  // Prevent self-deletion
  if (req.user._id.toString() === id) {
    throw createForbiddenError('You cannot delete your own account');
  }

  // Deactivate user instead of deleting
  user.isActive = false;
  user.updatedBy = req.user._id;
  await user.save();

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// Activate user
export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  user.isActive = true;
  user.updatedBy = req.user._id;
  await user.save();

  res.json({
    success: true,
    message: 'User activated successfully',
    data: { user: user.toObject() }
  });
});

// Change user role
export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  // Update role and permissions
  user.role = role;
  user.permissions = User.getPermissionsByRole(role);
  user.updatedBy = req.user._id;
  await user.save();

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: { user: user.toObject() }
  });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    roleDistribution,
    recentUsers,
    loginStats
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt'),
    User.aggregate([
      {
        $group: {
          _id: null,
          totalLogins: { $sum: '$loginCount' },
          avgLoginCount: { $avg: '$loginCount' },
          lastActivity: { $max: '$lastActivity' }
        }
      }
    ])
  ]);

  // Calculate users created in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsersCount = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      newUsersLast30Days: newUsersCount,
      roleDistribution,
      loginStats: loginStats[0] || {},
      recentUsers
    }
  });
});

// Get user activity
export const getUserActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  // Get user's recent activities
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // This would typically involve querying activity logs
  // For now, we'll return basic user activity info
  const activity = {
    user: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role
    },
    stats: {
      lastLogin: user.lastLogin,
      lastActivity: user.lastActivity,
      loginCount: user.loginCount,
      accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24))
    },
    // In a real implementation, you would query activity logs here
    activities: []
  };

  res.json({
    success: true,
    data: activity
  });
});

// Bulk operations
export const bulkUpdateUsers = asyncHandler(async (req, res) => {
  const { userIds, updates } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw createValidationError('userIds must be a non-empty array');
  }

  // Prevent bulk role changes by non-admins
  if (updates.role && req.user.role !== 'admin') {
    throw createForbiddenError('Only admins can change user roles');
  }

  // Update permissions if role is changed
  if (updates.role) {
    updates.permissions = User.getPermissionsByRole(updates.role);
  }

  const updateData = {
    ...updates,
    updatedBy: req.user._id
  };

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    updateData
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// Get user permissions
export const getUserPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('role permissions');
  if (!user) {
    throw createNotFoundError('User');
  }

  res.json({
    success: true,
    data: {
      role: user.role,
      permissions: user.permissions,
      allPermissions: User.getPermissionsByRole(user.role)
    }
  });
});

// Update user permissions
export const updateUserPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw createNotFoundError('User');
  }

  user.permissions = permissions;
  user.updatedBy = req.user._id;
  await user.save();

  res.json({
    success: true,
    message: 'User permissions updated successfully',
    data: {
      user: {
        id: user._id,
        role: user.role,
        permissions: user.permissions
      }
    }
  });
});