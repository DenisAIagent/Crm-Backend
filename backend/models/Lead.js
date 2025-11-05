import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },

  // Music Information
  artistName: {
    type: String,
    trim: true,
    maxlength: [100, 'Artist name cannot be more than 100 characters']
  },
  genre: {
    type: String,
    enum: [
      'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 'Electronic', 'Jazz',
      'Classical', 'Folk', 'Blues', 'Reggae', 'Punk', 'Metal', 'Alternative',
      'Indie', 'Soul', 'Funk', 'Gospel', 'Latin', 'World', 'Other'
    ],
    default: 'Other'
  },
  musicLinks: {
    youtube: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/, 'Please enter a valid YouTube URL']
    },
    spotify: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?(open\.)?spotify\.com\/.+/, 'Please enter a valid Spotify URL']
    },
    soundcloud: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?(www\.)?soundcloud\.com\/.+/, 'Please enter a valid SoundCloud URL']
    },
    appleMusic: {
      type: String,
      trim: true
    },
    other: [{
      platform: String,
      url: String
    }]
  },

  // Lead Source & Campaign
  source: {
    type: String,
    enum: ['website', 'social_media', 'email', 'referral', 'advertising', 'event', 'cold_outreach', 'organic', 'other'],
    required: [true, 'Lead source is required']
  },
  sourceDetails: {
    type: String,
    trim: true,
    maxlength: [200, 'Source details cannot be more than 200 characters']
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  referralSource: {
    type: String,
    trim: true
  },

  // Lead Status & Scoring
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'unqualified'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  temperature: {
    type: String,
    enum: ['cold', 'warm', 'hot'],
    default: 'cold'
  },

  // Budget & Services
  budget: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'USD'
    }
  },
  servicesInterested: [{
    type: String,
    enum: [
      'youtube_promotion', 'meta_ads', 'tiktok_ads', 'spotify_promotion',
      'playlist_placement', 'influencer_marketing', 'pr_campaign',
      'music_video_production', 'social_media_management', 'website_development',
      'brand_development', 'consultation', 'other'
    ]
  }],
  projectDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Project description cannot be more than 1000 characters']
  },

  // Communication & Timeline
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'text', 'social_media'],
    default: 'email'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  urgency: {
    type: String,
    enum: ['immediate', 'within_week', 'within_month', 'flexible'],
    default: 'flexible'
  },
  expectedStartDate: Date,

  // Assignment & Ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },

  // Interaction History
  interactions: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'proposal', 'follow_up', 'note'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Interaction description cannot be more than 500 characters']
    },
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'no_response']
    },
    nextAction: {
      type: String,
      maxlength: [200, 'Next action cannot be more than 200 characters']
    },
    nextActionDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],

  // Follow-up & Reminders
  nextFollowUp: Date,
  followUpReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Follow-up reason cannot be more than 200 characters']
  },
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [200, 'Reminder message cannot be more than 200 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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

  // Conversion & Revenue
  convertedAt: Date,
  conversionValue: {
    type: Number,
    min: 0
  },
  lifetime_value: {
    type: Number,
    min: 0,
    default: 0
  },
  dealProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },

  // Location
  location: {
    country: String,
    state: String,
    city: String,
    zipCode: String,
    timezone: String
  },

  // Social Media
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    tiktok: String,
    linkedin: String
  },

  // Data Quality & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  dataQualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ campaign: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ nextFollowUp: 1 });
leadSchema.index({ convertedAt: 1 });
leadSchema.index({ tags: 1 });
leadSchema.index({ 'location.country': 1 });
leadSchema.index({ isDeleted: 1 });

// Compound indexes
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ source: 1, createdAt: -1 });
leadSchema.index({ score: -1, status: 1 });

// Text search index
leadSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  artistName: 'text',
  projectDescription: 'text'
});

// Virtuals
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

leadSchema.virtual('isOverdue').get(function() {
  return this.nextFollowUp && this.nextFollowUp < new Date();
});

leadSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

leadSchema.virtual('interactionCount').get(function() {
  return this.interactions.length;
});

leadSchema.virtual('lastInteraction').get(function() {
  return this.interactions.length > 0 ? this.interactions[this.interactions.length - 1] : null;
});

// Pre-save middleware
leadSchema.pre('save', function(next) {
  // Update data quality score based on filled fields
  let score = 0;
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'artistName', 'genre'];
  const optionalFields = ['projectDescription', 'budget.min', 'servicesInterested'];

  requiredFields.forEach(field => {
    if (this.get(field)) score += 15;
  });

  optionalFields.forEach(field => {
    if (this.get(field)) score += 5;
  });

  if (this.musicLinks.youtube || this.musicLinks.spotify || this.musicLinks.soundcloud) {
    score += 10;
  }

  this.dataQualityScore = Math.min(score, 100);

  // Auto-assign temperature based on score and interactions
  if (this.score >= 80 || this.interactions.length >= 3) {
    this.temperature = 'hot';
  } else if (this.score >= 60 || this.interactions.length >= 1) {
    this.temperature = 'warm';
  } else {
    this.temperature = 'cold';
  }

  next();
});

// Instance methods
leadSchema.methods.addInteraction = function(interaction) {
  this.interactions.push(interaction);

  // Update lead score based on interaction outcome
  if (interaction.outcome === 'positive') {
    this.score = Math.min(this.score + 10, 100);
  } else if (interaction.outcome === 'negative') {
    this.score = Math.max(this.score - 5, 0);
  }

  return this.save();
};

leadSchema.methods.setNextFollowUp = function(date, reason) {
  this.nextFollowUp = date;
  this.followUpReason = reason;
  return this.save();
};

leadSchema.methods.convert = function(value) {
  this.status = 'won';
  this.convertedAt = new Date();
  this.conversionValue = value;
  this.score = 100;
  return this.save();
};

leadSchema.methods.markAsLost = function(reason) {
  this.status = 'lost';
  this.addInteraction({
    type: 'note',
    description: `Lead marked as lost: ${reason}`,
    outcome: 'negative',
    createdBy: this.updatedBy
  });
  return this.save();
};

// Static methods
leadSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

leadSchema.statics.findActiveLeads = function() {
  return this.find({
    status: { $nin: ['won', 'lost', 'unqualified'] },
    isDeleted: false
  });
};

leadSchema.statics.findOverdueLeads = function() {
  return this.find({
    nextFollowUp: { $lt: new Date() },
    status: { $nin: ['won', 'lost', 'unqualified'] },
    isDeleted: false
  });
};

leadSchema.statics.getLeadsByStatus = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

leadSchema.statics.getLeadsBySource = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);
};

leadSchema.statics.getConversionRate = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        conversionRate: {
          $multiply: [{ $divide: ['$converted', '$total'] }, 100]
        }
      }
    }
  ]);
};

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;