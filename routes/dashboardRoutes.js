import express from 'express';
import {
  asyncHandler,
  createNotFoundError
} from '../middleware/errorMiddleware.js';
import {
  authenticate,
  requirePermission
} from '../middleware/auth.js';
import Lead from '../models/Lead.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard overview
router.get('/overview',
  requirePermission('dashboard.read'),
  asyncHandler(async (req, res) => {
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

    const [
      // Lead metrics
      totalLeads,
      newLeadsToday,
      overdueTasks,
      hotLeads,

      // Campaign metrics
      activeCampaigns,
      totalSpend,
      totalRevenue,

      // Recent activity
      recentLeads,
      recentCampaigns,
      upcomingTasks
    ] = await Promise.all([
      // Lead counts
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({
        ...leadFilter,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      Lead.countDocuments({
        ...leadFilter,
        nextFollowUp: { $lt: new Date() },
        status: { $nin: ['won', 'lost', 'unqualified'] }
      }),
      Lead.countDocuments({
        ...leadFilter,
        temperature: 'hot',
        status: { $nin: ['won', 'lost', 'unqualified'] }
      }),

      // Campaign metrics
      Campaign.countDocuments({ ...campaignFilter, status: 'active' }),
      Campaign.aggregate([
        { $match: campaignFilter },
        { $group: { _id: null, total: { $sum: '$budget.spent' } } }
      ]),
      Campaign.aggregate([
        { $match: campaignFilter },
        { $group: { _id: null, total: { $sum: '$metrics.revenue' } } }
      ]),

      // Recent activity
      Lead.find(leadFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email status score createdAt')
        .populate('assignedTo', 'firstName lastName'),

      Campaign.find(campaignFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name type status budget metrics createdAt')
        .populate('manager', 'firstName lastName'),

      Lead.find({
        ...leadFilter,
        nextFollowUp: {
          $gte: new Date(),
          $lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      })
        .sort({ nextFollowUp: 1 })
        .limit(10)
        .select('firstName lastName nextFollowUp followUpReason')
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          leads: {
            total: totalLeads,
            newToday: newLeadsToday,
            overdue: overdueTasks,
            hot: hotLeads
          },
          campaigns: {
            active: activeCampaigns,
            totalSpend: totalSpend[0]?.total || 0,
            totalRevenue: totalRevenue[0]?.total || 0
          }
        },
        recentActivity: {
          leads: recentLeads,
          campaigns: recentCampaigns
        },
        upcomingTasks
      }
    });
  })
);

// Get user dashboard widgets
router.get('/widgets',
  requirePermission('dashboard.read'),
  asyncHandler(async (req, res) => {
    const { widgets } = req.query; // Comma-separated list of widget names

    const requestedWidgets = widgets ? widgets.split(',') : ['leads', 'campaigns', 'tasks', 'performance'];
    const widgetData = {};

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

    // Leads widget
    if (requestedWidgets.includes('leads')) {
      const [leadStats, leadsByStatus] = await Promise.all([
        Lead.aggregate([
          { $match: leadFilter },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgScore: { $avg: '$score' },
              converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
            }
          }
        ]),
        Lead.aggregate([
          { $match: leadFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      widgetData.leads = {
        stats: leadStats[0] || { total: 0, avgScore: 0, converted: 0 },
        distribution: leadsByStatus
      };
    }

    // Campaigns widget
    if (requestedWidgets.includes('campaigns')) {
      const [campaignStats, campaignsByStatus] = await Promise.all([
        Campaign.aggregate([
          { $match: campaignFilter },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              totalSpend: { $sum: '$budget.spent' },
              totalRevenue: { $sum: '$metrics.revenue' }
            }
          }
        ]),
        Campaign.aggregate([
          { $match: campaignFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      widgetData.campaigns = {
        stats: campaignStats[0] || { total: 0, active: 0, totalSpend: 0, totalRevenue: 0 },
        distribution: campaignsByStatus
      };
    }

    // Tasks widget
    if (requestedWidgets.includes('tasks')) {
      const tasks = await Lead.aggregate([
        {
          $match: {
            ...leadFilter,
            nextFollowUp: { $exists: true }
          }
        },
        {
          $project: {
            overdue: { $cond: [{ $lt: ['$nextFollowUp', new Date()] }, 1, 0] },
            today: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$nextFollowUp', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$nextFollowUp', new Date(new Date().setHours(23, 59, 59, 999))] }
                  ]
                },
                1,
                0
              ]
            },
            upcoming: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$nextFollowUp', new Date()] },
                    { $lte: ['$nextFollowUp', new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            overdue: { $sum: '$overdue' },
            today: { $sum: '$today' },
            upcoming: { $sum: '$upcoming' }
          }
        }
      ]);

      widgetData.tasks = tasks[0] || { overdue: 0, today: 0, upcoming: 0 };
    }

    // Performance widget
    if (requestedWidgets.includes('performance')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [performanceData] = await Promise.all([
        Lead.aggregate([
          {
            $match: {
              ...leadFilter,
              createdAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              leads: { $sum: 1 },
              conversions: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      widgetData.performance = performanceData;
    }

    res.json({
      success: true,
      data: widgetData
    });
  })
);

// Get team performance (managers and above)
router.get('/team-performance',
  requirePermission('dashboard.read'),
  asyncHandler(async (req, res) => {
    // Only managers and above can view team performance
    if (req.user.role === 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Managers and above only.'
      });
    }

    const [teamStats, topPerformers, teamActivity] = await Promise.all([
      // Team statistics
      User.aggregate([
        { $match: { isActive: true, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'leads',
            localField: '_id',
            foreignField: 'assignedTo',
            as: 'leads'
          }
        },
        {
          $lookup: {
            from: 'campaigns',
            localField: '_id',
            foreignField: 'manager',
            as: 'campaigns'
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            leadCount: { $size: '$leads' },
            campaignCount: { $size: '$campaigns' },
            conversions: {
              $size: {
                $filter: {
                  input: '$leads',
                  cond: { $eq: ['$$this.status', 'won'] }
                }
              }
            }
          }
        }
      ]),

      // Top performers by conversions
      User.aggregate([
        { $match: { isActive: true, role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'leads',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$assignedTo', '$$userId'] },
                  status: 'won',
                  convertedAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                  }
                }
              }
            ],
            as: 'conversions'
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            role: 1,
            conversionCount: { $size: '$conversions' },
            totalRevenue: { $sum: '$conversions.conversionValue' }
          }
        },
        { $sort: { conversionCount: -1 } },
        { $limit: 5 }
      ]),

      // Recent team activity
      Lead.find({
        isDeleted: false,
        updatedAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('assignedTo', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .select('firstName lastName status updatedAt assignedTo updatedBy')
    ]);

    res.json({
      success: true,
      data: {
        teamStats,
        topPerformers,
        recentActivity: teamActivity
      }
    });
  })
);

// Get quick actions for dashboard
router.get('/quick-actions',
  requirePermission('dashboard.read'),
  asyncHandler(async (req, res) => {
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

    const [
      leadsNeedingAttention,
      campaignsNeedingReview,
      overdueFollowUps
    ] = await Promise.all([
      // Leads that need attention (high score, no recent interaction)
      Lead.find({
        ...leadFilter,
        score: { $gte: 80 },
        status: { $nin: ['won', 'lost', 'unqualified'] },
        'interactions.0': { $exists: false } // No interactions yet
      })
        .limit(5)
        .select('firstName lastName email score status createdAt')
        .sort({ score: -1 }),

      // Campaigns that need review (low performance)
      Campaign.find({
        ...campaignFilter,
        status: 'active',
        'metrics.roas': { $lt: 1.5 }
      })
        .limit(5)
        .select('name type metrics.roas budget.spent status')
        .sort({ 'metrics.roas': 1 }),

      // Overdue follow-ups
      Lead.find({
        ...leadFilter,
        nextFollowUp: { $lt: new Date() },
        status: { $nin: ['won', 'lost', 'unqualified'] }
      })
        .limit(10)
        .select('firstName lastName nextFollowUp followUpReason')
        .sort({ nextFollowUp: 1 })
    ]);

    res.json({
      success: true,
      data: {
        leadsNeedingAttention,
        campaignsNeedingReview,
        overdueFollowUps
      }
    });
  })
);

export default router;