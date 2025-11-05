import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import {
  asyncHandler,
  createNotFoundError,
  createValidationError,
  createForbiddenError
} from '../middleware/errorMiddleware.js';

// Get all campaigns with filtering and pagination
export const getCampaigns = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    manager,
    search,
    startDate,
    endDate,
    minBudget,
    maxBudget,
    tags,
    category
  } = req.query;

  // Build filter object
  const filter = { isArchived: false };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (manager) filter.manager = manager;
  if (category) filter.category = category;

  // Budget filtering
  if (minBudget || maxBudget) {
    filter['budget.total'] = {};
    if (minBudget) filter['budget.total'].$gte = parseFloat(minBudget);
    if (maxBudget) filter['budget.total'].$lte = parseFloat(maxBudget);
  }

  // Date range filtering
  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    filter.$or = [
      { startDate: dateFilter },
      { endDate: dateFilter },
      {
        startDate: { $lte: new Date(startDate || '1900-01-01') },
        endDate: { $gte: new Date(endDate || '2100-12-31') }
      }
    ];
  }

  // Tags filtering
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }

  // Role-based filtering
  if (req.user.role === 'agent') {
    filter.$or = [
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  // Build sort object
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    const sortBy = req.query.sort;
    const order = req.query.order === 'asc' ? 1 : -1;
    sort = { [sortBy]: order };
  }

  // Text search
  let searchFilter = {};
  if (search) {
    searchFilter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    };
  }

  // Combine filters
  const finalFilter = search ? { ...filter, ...searchFilter } : filter;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [campaigns, totalCount] = await Promise.all([
    Campaign.find(finalFilter)
      .populate('manager', 'firstName lastName email')
      .populate('client', 'firstName lastName email artistName')
      .populate('team.user', 'firstName lastName email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Campaign.countDocuments(finalFilter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: {
      campaigns,
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

// Get single campaign by ID
export const getCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false })
    .populate('manager', 'firstName lastName email phone')
    .populate('client', 'firstName lastName email artistName')
    .populate('team.user', 'firstName lastName email role')
    .populate('leads', 'firstName lastName email status score')
    .populate('createdBy', 'firstName lastName email')
    .populate('optimizations.createdBy', 'firstName lastName');

  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      campaign.manager.toString() !== req.user._id.toString() &&
      !campaign.team.some(member => member.user._id.toString() === req.user._id.toString())) {
    throw createForbiddenError('You can only view campaigns you manage or are part of');
  }

  res.json({
    success: true,
    data: { campaign }
  });
});

// Create new campaign
export const createCampaign = asyncHandler(async (req, res) => {
  const campaignData = {
    ...req.body,
    createdBy: req.user._id
  };

  // Validate manager exists
  const manager = await User.findById(campaignData.manager);
  if (!manager) {
    throw createNotFoundError('Campaign manager');
  }

  // Validate client if provided
  if (campaignData.client) {
    const client = await Lead.findById(campaignData.client);
    if (!client) {
      throw createNotFoundError('Client');
    }
  }

  const campaign = await Campaign.create(campaignData);

  // Populate references
  await campaign.populate('manager', 'firstName lastName email');
  await campaign.populate('client', 'firstName lastName email artistName');
  await campaign.populate('createdBy', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully',
    data: { campaign }
  });
});

// Update campaign
export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      campaign.manager.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only update campaigns you manage');
  }

  // Prepare update data
  const updateData = {
    ...req.body,
    updatedBy: req.user._id
  };

  // Update campaign
  const updatedCampaign = await Campaign.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('manager', 'firstName lastName email')
    .populate('client', 'firstName lastName email artistName')
    .populate('team.user', 'firstName lastName email role');

  res.json({
    success: true,
    message: 'Campaign updated successfully',
    data: { campaign: updatedCampaign }
  });
});

// Delete campaign (archive)
export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Archive the campaign
  await campaign.archive(req.user._id);

  res.json({
    success: true,
    message: 'Campaign archived successfully'
  });
});

// Update campaign metrics
export const updateMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metrics } = req.body;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      campaign.manager.toString() !== req.user._id.toString() &&
      !campaign.team.some(member => member.user.toString() === req.user._id.toString())) {
    throw createForbiddenError('You can only update metrics for campaigns you manage or are part of');
  }

  await campaign.updateMetrics(metrics);

  res.json({
    success: true,
    message: 'Campaign metrics updated successfully',
    data: { campaign }
  });
});

// Add daily metrics
export const addDailyMetrics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, metrics } = req.body;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  await campaign.addDailyMetric(new Date(date), metrics);

  res.json({
    success: true,
    message: 'Daily metrics added successfully',
    data: { campaign }
  });
});

// Pause campaign
export const pauseCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      campaign.manager.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only pause campaigns you manage');
  }

  await campaign.pause();

  res.json({
    success: true,
    message: 'Campaign paused successfully',
    data: { campaign }
  });
});

// Resume campaign
export const resumeCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      campaign.manager.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only resume campaigns you manage');
  }

  await campaign.resume();

  res.json({
    success: true,
    message: 'Campaign resumed successfully',
    data: { campaign }
  });
});

// Complete campaign
export const completeCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  await campaign.complete();

  res.json({
    success: true,
    message: 'Campaign completed successfully',
    data: { campaign }
  });
});

// Add optimization
export const addOptimization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description, previousValue, newValue, reason, impact } = req.body;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  const optimization = {
    type,
    description,
    previousValue,
    newValue,
    reason,
    impact,
    createdBy: req.user._id
  };

  await campaign.addOptimization(optimization);

  res.json({
    success: true,
    message: 'Optimization added successfully',
    data: { campaign }
  });
});

// Get campaign performance stats
export const getCampaignStats = asyncHandler(async (req, res) => {
  let matchFilter = { isArchived: false };

  // Role-based filtering
  if (req.user.role === 'agent') {
    matchFilter.$or = [
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  const [
    statusStats,
    typeStats,
    performanceStats,
    totalCampaigns,
    activeCampaigns,
    recentCampaigns
  ] = await Promise.all([
    Campaign.getCampaignsByStatus(),
    Campaign.getCampaignsByType(),
    Campaign.getPerformanceStats(),
    Campaign.countDocuments(matchFilter),
    Campaign.countDocuments({ ...matchFilter, status: 'active' }),
    Campaign.find(matchFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('manager', 'firstName lastName')
      .populate('client', 'firstName lastName artistName')
  ]);

  // Calculate budget utilization
  const budgetStats = await Campaign.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: '$budget.total' },
        totalSpent: { $sum: '$budget.spent' },
        avgUtilization: {
          $avg: {
            $cond: [
              { $gt: ['$budget.total', 0] },
              { $multiply: [{ $divide: ['$budget.spent', '$budget.total'] }, 100] },
              0
            ]
          }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalCampaigns,
      activeCampaigns,
      statusDistribution: statusStats,
      typeDistribution: typeStats,
      performance: performanceStats[0] || {},
      budget: budgetStats[0] || {},
      recentCampaigns
    }
  });
});

// Get campaign performance over time
export const getCampaignPerformance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, metric = 'impressions' } = req.query;

  const campaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!campaign) {
    throw createNotFoundError('Campaign');
  }

  // Filter daily metrics by date range
  let dailyMetrics = campaign.dailyMetrics;

  if (startDate || endDate) {
    dailyMetrics = dailyMetrics.filter(metric => {
      const metricDate = new Date(metric.date);
      if (startDate && metricDate < new Date(startDate)) return false;
      if (endDate && metricDate > new Date(endDate)) return false;
      return true;
    });
  }

  // Sort by date
  dailyMetrics.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Extract the requested metric
  const performanceData = dailyMetrics.map(metric => ({
    date: metric.date,
    value: metric[metric] || 0
  }));

  res.json({
    success: true,
    data: {
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type
      },
      metric,
      performance: performanceData
    }
  });
});

// Bulk operations
export const bulkUpdateCampaigns = asyncHandler(async (req, res) => {
  const { campaignIds, updates } = req.body;

  if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
    throw createValidationError('campaignIds must be a non-empty array');
  }

  // Check permissions for agents
  if (req.user.role === 'agent') {
    const campaigns = await Campaign.find({
      _id: { $in: campaignIds },
      isArchived: false
    });

    const unauthorizedCampaigns = campaigns.filter(
      campaign => campaign.manager.toString() !== req.user._id.toString()
    );

    if (unauthorizedCampaigns.length > 0) {
      throw createForbiddenError('You can only update campaigns you manage');
    }
  }

  const updateData = {
    ...updates,
    updatedBy: req.user._id
  };

  const result = await Campaign.updateMany(
    { _id: { $in: campaignIds }, isArchived: false },
    updateData
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} campaigns updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// Duplicate campaign
export const duplicateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const originalCampaign = await Campaign.findOne({ _id: id, isArchived: false });
  if (!originalCampaign) {
    throw createNotFoundError('Campaign');
  }

  // Create duplicate with new name and reset metrics
  const duplicateData = originalCampaign.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.name = name || `${originalCampaign.name} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.metrics = {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0
  };
  duplicateData.budget.spent = 0;
  duplicateData.dailyMetrics = [];
  duplicateData.optimizations = [];
  duplicateData.createdBy = req.user._id;

  const duplicatedCampaign = await Campaign.create(duplicateData);

  await duplicatedCampaign.populate('manager', 'firstName lastName email');
  await duplicatedCampaign.populate('client', 'firstName lastName email artistName');

  res.status(201).json({
    success: true,
    message: 'Campaign duplicated successfully',
    data: { campaign: duplicatedCampaign }
  });
});