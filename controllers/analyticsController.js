import Lead from '../models/Lead.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import {
  asyncHandler,
  createValidationError
} from '../middleware/errorMiddleware.js';

// Get overall analytics dashboard
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    groupBy = 'day'
  } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Role-based filtering
  let leadFilter = { isDeleted: false };
  let campaignFilter = { isArchived: false };

  if (req.user.role === 'agent') {
    leadFilter.assignedTo = req.user._id;
    campaignFilter.$or = [
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  if (Object.keys(dateFilter).length > 0) {
    leadFilter.createdAt = dateFilter;
    campaignFilter.createdAt = dateFilter;
  }

  const [
    // Lead analytics
    totalLeads,
    newLeads,
    convertedLeads,
    leadsByStatus,
    leadsBySource,
    conversionRate,

    // Campaign analytics
    totalCampaigns,
    activeCampaigns,
    campaignsByStatus,
    campaignsByType,
    totalSpend,
    totalRevenue,

    // Performance metrics
    averageLeadScore,
    leadConversionTrend,
    campaignPerformance
  ] = await Promise.all([
    // Lead metrics
    Lead.countDocuments(leadFilter),
    Lead.countDocuments({
      ...leadFilter,
      createdAt: {
        ...dateFilter,
        $gte: dateFilter.$gte || new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }),
    Lead.countDocuments({ ...leadFilter, status: 'won' }),
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
        }
      },
      {
        $project: {
          rate: { $multiply: [{ $divide: ['$converted', '$total'] }, 100] }
        }
      }
    ]),

    // Campaign metrics
    Campaign.countDocuments(campaignFilter),
    Campaign.countDocuments({ ...campaignFilter, status: 'active' }),
    Campaign.aggregate([
      { $match: campaignFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Campaign.aggregate([
      { $match: campaignFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Campaign.aggregate([
      { $match: campaignFilter },
      { $group: { _id: null, total: { $sum: '$budget.spent' } } }
    ]),
    Campaign.aggregate([
      { $match: campaignFilter },
      { $group: { _id: null, total: { $sum: '$metrics.revenue' } } }
    ]),

    // Performance metrics
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: groupBy === 'day' ? { $dayOfMonth: '$createdAt' } : null
          },
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    Campaign.aggregate([
      { $match: campaignFilter },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalConversions: { $sum: '$metrics.conversions' },
          avgCTR: { $avg: '$metrics.ctr' },
          avgROAS: { $avg: '$metrics.roas' }
        }
      }
    ])
  ]);

  // Calculate derived metrics
  const roi = totalSpend[0]?.total > 0 && totalRevenue[0]?.total > 0
    ? ((totalRevenue[0].total - totalSpend[0].total) / totalSpend[0].total) * 100
    : 0;

  res.json({
    success: true,
    data: {
      overview: {
        leads: {
          total: totalLeads,
          new: newLeads,
          converted: convertedLeads,
          conversionRate: conversionRate[0]?.rate || 0,
          averageScore: averageLeadScore[0]?.avgScore || 0
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          totalSpend: totalSpend[0]?.total || 0,
          totalRevenue: totalRevenue[0]?.total || 0,
          roi
        }
      },
      distributions: {
        leadsByStatus,
        leadsBySource,
        campaignsByStatus,
        campaignsByType
      },
      trends: {
        leadConversion: leadConversionTrend,
        campaignPerformance: campaignPerformance[0] || {}
      }
    }
  });
});

// Get lead analytics
export const getLeadAnalytics = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    groupBy = 'day',
    source,
    status,
    assignedTo
  } = req.query;

  // Build filter
  let filter = { isDeleted: false };

  // Role-based filtering
  if (req.user.role === 'agent') {
    filter.assignedTo = req.user._id;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Additional filters
  if (source) filter.source = source;
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const [
    totalLeads,
    leadsByStatus,
    leadsBySource,
    leadsByScore,
    leadsByGenre,
    conversionFunnel,
    timeToConversion,
    leadTrends
  ] = await Promise.all([
    Lead.countDocuments(filter),

    Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),

    Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$score', 25] }, then: '0-25' },
                { case: { $lte: ['$score', 50] }, then: '26-50' },
                { case: { $lte: ['$score', 75] }, then: '51-75' },
                { case: { $lte: ['$score', 100] }, then: '76-100' }
              ],
              default: 'unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]),

    Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          order: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'new'] }, then: 1 },
                { case: { $eq: ['$_id', 'contacted'] }, then: 2 },
                { case: { $eq: ['$_id', 'qualified'] }, then: 3 },
                { case: { $eq: ['$_id', 'proposal_sent'] }, then: 4 },
                { case: { $eq: ['$_id', 'negotiating'] }, then: 5 },
                { case: { $eq: ['$_id', 'won'] }, then: 6 },
                { case: { $eq: ['$_id', 'lost'] }, then: 7 }
              ],
              default: 8
            }
          }
        }
      },
      { $sort: { order: 1 } }
    ]),

    Lead.aggregate([
      {
        $match: {
          ...filter,
          status: 'won',
          convertedAt: { $exists: true }
        }
      },
      {
        $project: {
          timeToConvert: {
            $divide: [
              { $subtract: ['$convertedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTimeToConvert: { $avg: '$timeToConvert' },
          minTimeToConvert: { $min: '$timeToConvert' },
          maxTimeToConvert: { $max: '$timeToConvert' }
        }
      }
    ]),

    Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: groupBy === 'day' ? { $dayOfMonth: '$createdAt' } : null,
            week: groupBy === 'week' ? { $week: '$createdAt' } : null
          },
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalLeads,
        conversionTime: timeToConversion[0] || {}
      },
      distributions: {
        byStatus: leadsByStatus,
        bySource: leadsBySource,
        byScore: leadsByScore,
        byGenre: leadsByGenre
      },
      funnel: conversionFunnel,
      trends: leadTrends
    }
  });
});

// Get campaign analytics
export const getCampaignAnalytics = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    groupBy = 'day',
    type,
    status,
    manager
  } = req.query;

  // Build filter
  let filter = { isArchived: false };

  // Role-based filtering
  if (req.user.role === 'agent') {
    filter.$or = [
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Additional filters
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (manager) filter.manager = manager;

  const [
    totalCampaigns,
    campaignsByStatus,
    campaignsByType,
    performanceMetrics,
    budgetAnalysis,
    topPerformers,
    campaignTrends
  ] = await Promise.all([
    Campaign.countDocuments(filter),

    Campaign.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    Campaign.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),

    Campaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$budget.spent' },
          totalBudget: { $sum: '$budget.total' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalConversions: { $sum: '$metrics.conversions' },
          totalRevenue: { $sum: '$metrics.revenue' },
          avgCTR: { $avg: '$metrics.ctr' },
          avgCPC: { $avg: '$metrics.cpc' },
          avgCPM: { $avg: '$metrics.cpm' },
          avgROAS: { $avg: '$metrics.roas' }
        }
      }
    ]),

    Campaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          totalSpend: { $sum: '$budget.spent' },
          totalBudget: { $sum: '$budget.total' },
          avgUtilization: {
            $avg: {
              $cond: [
                { $gt: ['$budget.total', 0] },
                { $multiply: [{ $divide: ['$budget.spent', '$budget.total'] }, 100] },
                0
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSpend: -1 } }
    ]),

    Campaign.find(filter)
      .sort({ 'metrics.roas': -1 })
      .limit(10)
      .select('name type metrics.roas metrics.revenue budget.spent status')
      .populate('manager', 'firstName lastName'),

    Campaign.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: groupBy === 'day' ? { $dayOfMonth: '$createdAt' } : null,
            week: groupBy === 'week' ? { $week: '$createdAt' } : null
          },
          count: { $sum: 1 },
          totalSpend: { $sum: '$budget.spent' },
          totalRevenue: { $sum: '$metrics.revenue' },
          avgROAS: { $avg: '$metrics.roas' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalCampaigns,
        performance: performanceMetrics[0] || {}
      },
      distributions: {
        byStatus: campaignsByStatus,
        byType: campaignsByType
      },
      budget: budgetAnalysis,
      topPerformers,
      trends: campaignTrends
    }
  });
});

// Get revenue analytics
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    groupBy = 'month'
  } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Role-based filtering
  let leadFilter = { isDeleted: false, status: 'won' };
  let campaignFilter = { isArchived: false };

  if (req.user.role === 'agent') {
    leadFilter.assignedTo = req.user._id;
    campaignFilter.$or = [
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  if (Object.keys(dateFilter).length > 0) {
    leadFilter.convertedAt = dateFilter;
    campaignFilter.createdAt = dateFilter;
  }

  const [
    leadRevenue,
    campaignRevenue,
    revenueBySource,
    revenueByType,
    revenueTrends
  ] = await Promise.all([
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$conversionValue' },
          avgDealSize: { $avg: '$conversionValue' },
          count: { $sum: 1 }
        }
      }
    ]),

    Campaign.aggregate([
      { $match: campaignFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$metrics.revenue' },
          totalSpend: { $sum: '$budget.spent' },
          avgROAS: { $avg: '$metrics.roas' }
        }
      }
    ]),

    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: '$source',
          revenue: { $sum: '$conversionValue' },
          count: { $sum: 1 },
          avgDealSize: { $avg: '$conversionValue' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    Campaign.aggregate([
      { $match: campaignFilter },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$metrics.revenue' },
          spend: { $sum: '$budget.spent' },
          roas: {
            $avg: {
              $cond: [
                { $gt: ['$budget.spent', 0] },
                { $divide: ['$metrics.revenue', '$budget.spent'] },
                0
              ]
            }
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: {
            year: { $year: '$convertedAt' },
            month: { $month: '$convertedAt' },
            day: groupBy === 'day' ? { $dayOfMonth: '$convertedAt' } : null,
            week: groupBy === 'week' ? { $week: '$convertedAt' } : null
          },
          revenue: { $sum: '$conversionValue' },
          deals: { $sum: 1 },
          avgDealSize: { $avg: '$conversionValue' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        leads: leadRevenue[0] || { totalRevenue: 0, avgDealSize: 0, count: 0 },
        campaigns: campaignRevenue[0] || { totalRevenue: 0, totalSpend: 0, avgROAS: 0 }
      },
      distributions: {
        bySource: revenueBySource,
        byType: revenueByType
      },
      trends: revenueTrends
    }
  });
});

// Get performance comparison
export const getPerformanceComparison = asyncHandler(async (req, res) => {
  const {
    metric = 'revenue',
    period1Start,
    period1End,
    period2Start,
    period2End
  } = req.query;

  if (!period1Start || !period1End || !period2Start || !period2End) {
    throw createValidationError('All period dates are required for comparison');
  }

  // Build filters for both periods
  const period1Filter = {
    createdAt: {
      $gte: new Date(period1Start),
      $lte: new Date(period1End)
    }
  };

  const period2Filter = {
    createdAt: {
      $gte: new Date(period2Start),
      $lte: new Date(period2End)
    }
  };

  // Role-based filtering
  if (req.user.role === 'agent') {
    period1Filter.$or = [
      { assignedTo: req.user._id },
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
    period2Filter.$or = [
      { assignedTo: req.user._id },
      { manager: req.user._id },
      { 'team.user': req.user._id }
    ];
  }

  const [period1Data, period2Data] = await Promise.all([
    getMetricData(metric, period1Filter),
    getMetricData(metric, period2Filter)
  ]);

  // Calculate percentage change
  const change = period1Data.value > 0
    ? ((period2Data.value - period1Data.value) / period1Data.value) * 100
    : 0;

  res.json({
    success: true,
    data: {
      metric,
      period1: {
        start: period1Start,
        end: period1End,
        value: period1Data.value,
        details: period1Data.details
      },
      period2: {
        start: period2Start,
        end: period2End,
        value: period2Data.value,
        details: period2Data.details
      },
      change: {
        absolute: period2Data.value - period1Data.value,
        percentage: change
      }
    }
  });
});

// Helper function to get metric data
async function getMetricData(metric, filter) {
  switch (metric) {
    case 'revenue':
      const leadRevenue = await Lead.aggregate([
        { $match: { ...filter, status: 'won', isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$conversionValue' } } }
      ]);
      const campaignRevenue = await Campaign.aggregate([
        { $match: { ...filter, isArchived: false } },
        { $group: { _id: null, total: { $sum: '$metrics.revenue' } } }
      ]);
      return {
        value: (leadRevenue[0]?.total || 0) + (campaignRevenue[0]?.total || 0),
        details: {
          leadRevenue: leadRevenue[0]?.total || 0,
          campaignRevenue: campaignRevenue[0]?.total || 0
        }
      };

    case 'leads':
      const leadCount = await Lead.countDocuments({ ...filter, isDeleted: false });
      return { value: leadCount, details: { count: leadCount } };

    case 'campaigns':
      const campaignCount = await Campaign.countDocuments({ ...filter, isArchived: false });
      return { value: campaignCount, details: { count: campaignCount } };

    case 'conversions':
      const conversions = await Lead.countDocuments({
        ...filter,
        status: 'won',
        isDeleted: false
      });
      return { value: conversions, details: { conversions } };

    default:
      return { value: 0, details: {} };
  }
}