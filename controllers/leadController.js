import Lead from '../models/Lead.js';
import User from '../models/User.js';
import {
  asyncHandler,
  createNotFoundError,
  createValidationError,
  createForbiddenError
} from '../middleware/errorMiddleware.js';

// Get all leads with filtering and pagination
export const getLeads = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    source,
    assignedTo,
    priority,
    search,
    startDate,
    endDate,
    genre,
    score,
    temperature,
    tags
  } = req.query;

  // Build filter object
  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (priority) filter.priority = priority;
  if (genre) filter.genre = genre;
  if (temperature) filter.temperature = temperature;

  // Score filtering
  if (score) {
    const [min, max] = score.split('-').map(Number);
    filter.score = { $gte: min, $lte: max || 100 };
  }

  // Date range filtering
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Tags filtering
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }

  // Role-based filtering
  if (req.user.role === 'agent') {
    filter.assignedTo = req.user._id;
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    };
  }

  // Combine filters
  const finalFilter = search ? { ...filter, ...searchFilter } : filter;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [leads, totalCount] = await Promise.all([
    Lead.find(finalFilter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('campaign', 'name type')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Lead.countDocuments(finalFilter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: {
      leads,
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

// Get single lead by ID
export const getLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findOne({ _id: id, isDeleted: false })
    .populate('assignedTo', 'firstName lastName email phone')
    .populate('campaign', 'name type status budget')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('interactions.createdBy', 'firstName lastName');

  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check if user has permission to view this lead
  if (req.user.role === 'agent' &&
      lead.assignedTo?.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only view leads assigned to you');
  }

  res.json({
    success: true,
    data: { lead }
  });
});

// Create new lead
export const createLead = asyncHandler(async (req, res) => {
  const leadData = {
    ...req.body,
    createdBy: req.user._id
  };

  // Auto-assign to creator if agent role
  if (req.user.role === 'agent' && !leadData.assignedTo) {
    leadData.assignedTo = req.user._id;
    leadData.assignedAt = new Date();
  }

  // Check for duplicate email
  const existingLead = await Lead.findByEmail(leadData.email);
  if (existingLead) {
    throw createValidationError('Lead with this email already exists');
  }

  const lead = await Lead.create(leadData);

  // Populate references
  await lead.populate('assignedTo', 'firstName lastName email');
  await lead.populate('createdBy', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: { lead }
  });
});

// Update lead
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      lead.assignedTo?.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only update leads assigned to you');
  }

  // Prepare update data
  const updateData = {
    ...req.body,
    updatedBy: req.user._id
  };

  // Handle assignment change
  if (updateData.assignedTo && updateData.assignedTo !== lead.assignedTo?.toString()) {
    updateData.assignedAt = new Date();
  }

  // Update lead
  const updatedLead = await Lead.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Lead updated successfully',
    data: { lead: updatedLead }
  });
});

// Delete lead (soft delete)
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check permissions
  if (req.user.role === 'agent') {
    throw createForbiddenError('Agents cannot delete leads');
  }

  // Soft delete
  lead.isDeleted = true;
  lead.deletedAt = new Date();
  lead.updatedBy = req.user._id;
  await lead.save();

  res.json({
    success: true,
    message: 'Lead deleted successfully'
  });
});

// Assign lead to user
export const assignLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check if assigned user exists
  const assignee = await User.findById(assignedTo);
  if (!assignee) {
    throw createNotFoundError('User to assign');
  }

  // Update assignment
  lead.assignedTo = assignedTo;
  lead.assignedAt = new Date();
  lead.updatedBy = req.user._id;
  await lead.save();

  await lead.populate('assignedTo', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Lead assigned successfully',
    data: { lead }
  });
});

// Add interaction to lead
export const addInteraction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description, outcome, nextAction, nextActionDate } = req.body;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      lead.assignedTo?.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only add interactions to leads assigned to you');
  }

  const interaction = {
    type,
    description,
    outcome,
    nextAction,
    nextActionDate,
    createdBy: req.user._id
  };

  await lead.addInteraction(interaction);
  await lead.populate('interactions.createdBy', 'firstName lastName');

  res.json({
    success: true,
    message: 'Interaction added successfully',
    data: { lead }
  });
});

// Set next follow-up
export const setNextFollowUp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, reason } = req.body;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  // Check permissions
  if (req.user.role === 'agent' &&
      lead.assignedTo?.toString() !== req.user._id.toString()) {
    throw createForbiddenError('You can only set follow-ups for leads assigned to you');
  }

  await lead.setNextFollowUp(new Date(date), reason);

  res.json({
    success: true,
    message: 'Follow-up scheduled successfully',
    data: { lead }
  });
});

// Convert lead
export const convertLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { conversionValue } = req.body;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  await lead.convert(conversionValue);

  res.json({
    success: true,
    message: 'Lead converted successfully',
    data: { lead }
  });
});

// Mark lead as lost
export const markAsLost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) {
    throw createNotFoundError('Lead');
  }

  await lead.markAsLost(reason);

  res.json({
    success: true,
    message: 'Lead marked as lost',
    data: { lead }
  });
});

// Get overdue leads
export const getOverdueLeads = asyncHandler(async (req, res) => {
  let filter = {};

  // Role-based filtering
  if (req.user.role === 'agent') {
    filter.assignedTo = req.user._id;
  }

  const overdueLeads = await Lead.findOverdueLeads()
    .find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .populate('campaign', 'name type')
    .sort({ nextFollowUp: 1 });

  res.json({
    success: true,
    data: { leads: overdueLeads }
  });
});

// Get lead statistics
export const getLeadStats = asyncHandler(async (req, res) => {
  let matchFilter = { isDeleted: false };

  // Role-based filtering
  if (req.user.role === 'agent') {
    matchFilter.assignedTo = req.user._id;
  }

  const [
    statusStats,
    sourceStats,
    conversionRate,
    totalLeads,
    recentLeads
  ] = await Promise.all([
    Lead.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Lead.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),
    Lead.getConversionRate(),
    Lead.countDocuments(matchFilter),
    Lead.find(matchFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'firstName lastName')
  ]);

  // Calculate additional metrics
  const avgScore = await Lead.aggregate([
    { $match: matchFilter },
    { $group: { _id: null, avgScore: { $avg: '$score' } } }
  ]);

  const overdueCount = await Lead.countDocuments({
    ...matchFilter,
    nextFollowUp: { $lt: new Date() },
    status: { $nin: ['won', 'lost', 'unqualified'] }
  });

  res.json({
    success: true,
    data: {
      totalLeads,
      statusDistribution: statusStats,
      sourceDistribution: sourceStats,
      conversionRate: conversionRate[0]?.conversionRate || 0,
      averageScore: avgScore[0]?.avgScore || 0,
      overdueCount,
      recentLeads
    }
  });
});

// Bulk operations
export const bulkUpdateLeads = asyncHandler(async (req, res) => {
  const { leadIds, updates } = req.body;

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    throw createValidationError('leadIds must be a non-empty array');
  }

  // Check permissions for agents
  if (req.user.role === 'agent') {
    const leads = await Lead.find({
      _id: { $in: leadIds },
      isDeleted: false
    });

    const unauthorizedLeads = leads.filter(
      lead => lead.assignedTo?.toString() !== req.user._id.toString()
    );

    if (unauthorizedLeads.length > 0) {
      throw createForbiddenError('You can only update leads assigned to you');
    }
  }

  const updateData = {
    ...updates,
    updatedBy: req.user._id
  };

  const result = await Lead.updateMany(
    { _id: { $in: leadIds }, isDeleted: false },
    updateData
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} leads updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// Export leads
export const exportLeads = asyncHandler(async (req, res) => {
  const { format = 'json', ...filters } = req.query;

  // Build filter (similar to getLeads)
  const filter = { isDeleted: false };

  // Apply role-based filtering
  if (req.user.role === 'agent') {
    filter.assignedTo = req.user._id;
  }

  // Apply other filters from query
  Object.keys(filters).forEach(key => {
    if (filters[key] && key !== 'format') {
      filter[key] = filters[key];
    }
  });

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .populate('campaign', 'name type')
    .select('-interactions -reminders -customFields')
    .lean();

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Artist Name',
      'Genre', 'Status', 'Score', 'Source', 'Assigned To', 'Created At'
    ];

    const csvRows = leads.map(lead => [
      lead._id,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone || '',
      lead.artistName || '',
      lead.genre,
      lead.status,
      lead.score,
      lead.source,
      lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '',
      lead.createdAt
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(csvContent);
  }

  res.json({
    success: true,
    data: { leads }
  });
});