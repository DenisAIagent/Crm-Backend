import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: [
      'youtube_promotion', 'meta_ads', 'tiktok_ads', 'spotify_promotion',
      'playlist_placement', 'influencer_marketing', 'pr_campaign',
      'social_media', 'email_marketing', 'content_marketing',
      'paid_search', 'display_ads', 'retargeting', 'other'
    ],
    required: [true, 'Campaign type is required']
  },
  category: {
    type: String,
    enum: ['acquisition', 'retention', 'awareness', 'engagement', 'conversion'],
    default: 'acquisition'
  },

  // Status & Timeline
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Budget & Finance
  budget: {
    total: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative']
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'USD'
    },
    dailyBudget: {
      type: Number,
      min: [0, 'Daily budget cannot be negative']
    }
  },

  // Target Audience
  targetAudience: {
    demographics: {
      ageRange: {
        min: {
          type: Number,
          min: 13,
          max: 99
        },
        max: {
          type: Number,
          min: 13,
          max: 99
        }
      },
      gender: {
        type: String,
        enum: ['all', 'male', 'female', 'other']
      },
      locations: [{
        country: String,
        state: String,
        city: String,
        radius: Number // in km
      }]
    },
    interests: [{
      type: String,
      trim: true
    }],
    behaviors: [{
      type: String,
      trim: true
    }],
    customAudiences: [{
      name: String,
      description: String,
      size: Number
    }]
  },

  // Platforms & Channels
  platforms: [{
    name: {
      type: String,
      enum: ['youtube', 'facebook', 'instagram', 'tiktok', 'spotify', 'google', 'twitter', 'linkedin', 'other'],
      required: true
    },
    accountId: String,
    campaignId: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Creative Assets
  creativeAssets: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'text', 'carousel', 'story'],
      required: true
    },
    name: String,
    url: String,
    thumbnailUrl: String,
    duration: Number, // for video/audio
    size: String, // file size
    dimensions: {
      width: Number,
      height: Number
    },
    format: String,
    isActive: {
      type: Boolean,
      default: true
    },
    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      cpc: { type: Number, default: 0 },
      cpm: { type: Number, default: 0 }
    }
  }],

  // Goals & KPIs
  objectives: [{
    type: String,
    enum: [
      'brand_awareness', 'reach', 'traffic', 'engagement', 'app_installs',
      'video_views', 'lead_generation', 'conversions', 'sales', 'store_visits'
    ]
  }],
  kpis: [{
    metric: {
      type: String,
      enum: [
        'impressions', 'reach', 'clicks', 'ctr', 'cpc', 'cpm', 'conversions',
        'conversion_rate', 'cost_per_conversion', 'roas', 'revenue', 'leads'
      ],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      default: 0
    }
  }],

  // Performance Metrics
  metrics: {
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    engagements: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },

    // Calculated metrics
    ctr: { type: Number, default: 0 }, // Click-through rate
    cpc: { type: Number, default: 0 }, // Cost per click
    cpm: { type: Number, default: 0 }, // Cost per mille
    cpp: { type: Number, default: 0 }, // Cost per point
    cpe: { type: Number, default: 0 }, // Cost per engagement
    cpv: { type: Number, default: 0 }, // Cost per view
    cpl: { type: Number, default: 0 }, // Cost per lead
    cpa: { type: Number, default: 0 }, // Cost per acquisition
    roas: { type: Number, default: 0 }, // Return on ad spend
    roi: { type: Number, default: 0 }, // Return on investment
    frequency: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },

  // Daily Performance Tracking
  dailyMetrics: [{
    date: {
      type: Date,
      required: true
    },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    cpm: { type: Number, default: 0 }
  }],

  // Optimization & Testing
  optimizations: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['budget', 'targeting', 'creative', 'bidding', 'schedule']
    },
    description: String,
    previousValue: String,
    newValue: String,
    reason: String,
    impact: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // A/B Testing
  experiments: [{
    name: String,
    type: {
      type: String,
      enum: ['creative', 'audience', 'bidding', 'placement']
    },
    variants: [{
      name: String,
      description: String,
      traffic: Number, // percentage
      metrics: {
        impressions: Number,
        clicks: Number,
        conversions: Number,
        spend: Number
      }
    }],
    status: {
      type: String,
      enum: ['running', 'completed', 'paused'],
      default: 'running'
    },
    startDate: Date,
    endDate: Date,
    winner: String,
    confidence: Number
  }],

  // Team & Assignment
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign manager is required']
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'analyst', 'creative', 'strategist']
    }
  }],

  // Associated Leads/Clients
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  leads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  }],

  // Tags & Categories
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // External Integration
  externalIds: {
    facebook: String,
    google: String,
    tiktok: String,
    youtube: String,
    spotify: String
  },

  // Notifications & Alerts
  alerts: [{
    type: {
      type: String,
      enum: ['budget_threshold', 'performance_drop', 'optimization_opportunity']
    },
    threshold: Number,
    isActive: Boolean,
    lastTriggered: Date
  }],

  // Archive & History
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
campaignSchema.index({ name: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ manager: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ 'budget.total': -1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ tags: 1 });
campaignSchema.index({ isArchived: 1 });

// Compound indexes
campaignSchema.index({ status: 1, manager: 1 });
campaignSchema.index({ type: 1, status: 1 });
campaignSchema.index({ startDate: 1, status: 1 });

// Text search
campaignSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Virtuals
campaignSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
});

campaignSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
});

campaignSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

campaignSchema.virtual('budgetUtilization').get(function() {
  return this.budget.total > 0 ? (this.budget.spent / this.budget.total) * 100 : 0;
});

campaignSchema.virtual('averageDailySpend').get(function() {
  const daysRunning = Math.max(1, Math.floor((new Date() - this.startDate) / (1000 * 60 * 60 * 24)));
  return this.budget.spent / daysRunning;
});

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Calculate derived metrics
  if (this.metrics.impressions > 0) {
    this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100;
  }

  if (this.metrics.clicks > 0) {
    this.metrics.cpc = this.budget.spent / this.metrics.clicks;
  }

  if (this.metrics.impressions > 0) {
    this.metrics.cpm = (this.budget.spent / this.metrics.impressions) * 1000;
  }

  if (this.metrics.conversions > 0) {
    this.metrics.cpa = this.budget.spent / this.metrics.conversions;
    this.metrics.conversionRate = (this.metrics.conversions / this.metrics.clicks) * 100;
  }

  if (this.budget.spent > 0 && this.metrics.revenue > 0) {
    this.metrics.roas = this.metrics.revenue / this.budget.spent;
    this.metrics.roi = ((this.metrics.revenue - this.budget.spent) / this.budget.spent) * 100;
  }

  next();
});

// Instance methods
campaignSchema.methods.addDailyMetric = function(date, metrics) {
  // Remove existing metric for the same date
  this.dailyMetrics = this.dailyMetrics.filter(
    metric => metric.date.toDateString() !== date.toDateString()
  );

  // Add new metric
  this.dailyMetrics.push({ date, ...metrics });

  // Keep only last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  this.dailyMetrics = this.dailyMetrics.filter(metric => metric.date >= ninetyDaysAgo);

  // Sort by date
  this.dailyMetrics.sort((a, b) => a.date - b.date);

  return this.save();
};

campaignSchema.methods.updateMetrics = function(newMetrics) {
  Object.assign(this.metrics, newMetrics);
  return this.save();
};

campaignSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

campaignSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

campaignSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

campaignSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  return this.save();
};

campaignSchema.methods.addOptimization = function(optimization) {
  this.optimizations.push(optimization);
  return this.save();
};

// Static methods
campaignSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    isArchived: false
  });
};

campaignSchema.statics.findByManager = function(managerId) {
  return this.find({ manager: managerId, isArchived: false });
};

campaignSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ],
    isArchived: false
  });
};

campaignSchema.statics.getPerformanceStats = function() {
  return this.aggregate([
    { $match: { isArchived: false } },
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        totalSpend: { $sum: '$budget.spent' },
        totalImpressions: { $sum: '$metrics.impressions' },
        totalClicks: { $sum: '$metrics.clicks' },
        totalConversions: { $sum: '$metrics.conversions' },
        totalRevenue: { $sum: '$metrics.revenue' },
        avgCTR: { $avg: '$metrics.ctr' },
        avgCPC: { $avg: '$metrics.cpc' },
        avgROAS: { $avg: '$metrics.roas' }
      }
    }
  ]);
};

campaignSchema.statics.getCampaignsByType = function() {
  return this.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
};

campaignSchema.statics.getCampaignsByStatus = function() {
  return this.aggregate([
    { $match: { isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;