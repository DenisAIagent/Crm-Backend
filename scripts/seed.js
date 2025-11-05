import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Campaign from '../models/Campaign.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    firstName: 'MDMC',
    lastName: 'Administrator',
    email: 'admin@mdmcmusicads.com',
    password: 'MDMC_Admin_2025!',
    role: 'admin',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@mdmcmusicads.com',
    password: 'Manager123!',
    role: 'manager',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Mike',
    lastName: 'Agent',
    email: 'mike.agent@mdmcmusicads.com',
    password: 'Agent123!',
    role: 'agent',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Agent',
    email: 'lisa.agent@mdmcmusicads.com',
    password: 'Agent123!',
    role: 'agent',
    isVerified: true,
    isActive: true
  }
];

const sampleLeads = [
  {
    firstName: 'Emma',
    lastName: 'Stone',
    email: 'emma.stone@example.com',
    phone: '+1-555-0101',
    artistName: 'Emma Sounds',
    genre: 'Pop',
    source: 'website',
    status: 'new',
    priority: 'medium',
    score: 75,
    servicesInterested: ['youtube_promotion', 'spotify_promotion'],
    budget: { min: 2000, max: 5000, currency: 'USD' },
    projectDescription: 'Looking to promote my debut album',
    musicLinks: {
      youtube: 'https://youtube.com/channel/emmasounds',
      spotify: 'https://open.spotify.com/artist/emmasounds'
    },
    location: {
      country: 'United States',
      state: 'California',
      city: 'Los Angeles'
    }
  },
  {
    firstName: 'David',
    lastName: 'Rock',
    email: 'david.rock@example.com',
    phone: '+1-555-0102',
    artistName: 'Dave Rock Band',
    genre: 'Rock',
    source: 'social_media',
    status: 'contacted',
    priority: 'high',
    score: 85,
    servicesInterested: ['meta_ads', 'influencer_marketing'],
    budget: { min: 5000, max: 10000, currency: 'USD' },
    projectDescription: 'Promoting our upcoming tour',
    musicLinks: {
      youtube: 'https://youtube.com/channel/daverockband'
    },
    location: {
      country: 'United States',
      state: 'New York',
      city: 'New York'
    }
  },
  {
    firstName: 'Sofia',
    lastName: 'Jazz',
    email: 'sofia.jazz@example.com',
    phone: '+1-555-0103',
    artistName: 'Sofia Jazz Ensemble',
    genre: 'Jazz',
    source: 'referral',
    status: 'qualified',
    priority: 'medium',
    score: 70,
    servicesInterested: ['pr_campaign', 'playlist_placement'],
    budget: { min: 3000, max: 7000, currency: 'USD' },
    projectDescription: 'Jazz album launch campaign',
    location: {
      country: 'United States',
      state: 'Illinois',
      city: 'Chicago'
    }
  },
  {
    firstName: 'Alex',
    lastName: 'Electronic',
    email: 'alex.electronic@example.com',
    phone: '+1-555-0104',
    artistName: 'Alex Beats',
    genre: 'Electronic',
    source: 'advertising',
    status: 'proposal_sent',
    priority: 'high',
    score: 90,
    servicesInterested: ['tiktok_ads', 'social_media_management'],
    budget: { min: 8000, max: 15000, currency: 'USD' },
    projectDescription: 'Electronic music festival promotion',
    musicLinks: {
      youtube: 'https://youtube.com/channel/alexbeats',
      spotify: 'https://open.spotify.com/artist/alexbeats',
      soundcloud: 'https://soundcloud.com/alexbeats'
    },
    location: {
      country: 'United States',
      state: 'Nevada',
      city: 'Las Vegas'
    }
  },
  {
    firstName: 'Maria',
    lastName: 'Country',
    email: 'maria.country@example.com',
    phone: '+1-555-0105',
    artistName: 'Maria Country',
    genre: 'Country',
    source: 'event',
    status: 'won',
    priority: 'medium',
    score: 95,
    conversionValue: 6000,
    convertedAt: new Date('2024-10-15'),
    servicesInterested: ['youtube_promotion', 'meta_ads'],
    budget: { min: 4000, max: 8000, currency: 'USD' },
    projectDescription: 'Country music single promotion',
    location: {
      country: 'United States',
      state: 'Tennessee',
      city: 'Nashville'
    }
  }
];

const sampleCampaigns = [
  {
    name: 'Emma Sounds - Debut Album Launch',
    description: 'Comprehensive promotion campaign for Emma\'s debut album',
    type: 'youtube_promotion',
    category: 'acquisition',
    status: 'active',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-31'),
    budget: {
      total: 5000,
      spent: 1250,
      currency: 'USD',
      dailyBudget: 83
    },
    objectives: ['brand_awareness', 'engagement'],
    platforms: [
      {
        name: 'youtube',
        accountId: 'yt_account_1',
        isActive: true
      }
    ],
    metrics: {
      impressions: 125000,
      clicks: 6250,
      conversions: 312,
      revenue: 1875,
      ctr: 5.0,
      cpc: 0.20,
      roas: 1.5
    },
    tags: ['debut', 'pop', 'album-launch']
  },
  {
    name: 'Dave Rock Band - Tour Promotion',
    description: 'Meta ads campaign for upcoming rock tour',
    type: 'meta_ads',
    category: 'conversion',
    status: 'active',
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-11-30'),
    budget: {
      total: 8000,
      spent: 3200,
      currency: 'USD',
      dailyBudget: 177
    },
    objectives: ['conversions', 'traffic'],
    platforms: [
      {
        name: 'facebook',
        accountId: 'fb_account_1',
        isActive: true
      },
      {
        name: 'instagram',
        accountId: 'ig_account_1',
        isActive: true
      }
    ],
    metrics: {
      impressions: 200000,
      clicks: 10000,
      conversions: 500,
      revenue: 4800,
      ctr: 5.0,
      cpc: 0.32,
      roas: 1.5
    },
    tags: ['rock', 'tour', 'concerts']
  },
  {
    name: 'Alex Beats - Festival Circuit',
    description: 'TikTok promotion for electronic music festival appearances',
    type: 'tiktok_ads',
    category: 'engagement',
    status: 'completed',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-10-31'),
    budget: {
      total: 12000,
      spent: 11800,
      currency: 'USD',
      dailyBudget: 196
    },
    objectives: ['engagement', 'video_views'],
    platforms: [
      {
        name: 'tiktok',
        accountId: 'tt_account_1',
        isActive: false
      }
    ],
    metrics: {
      impressions: 500000,
      clicks: 25000,
      conversions: 1250,
      revenue: 18750,
      ctr: 5.0,
      cpc: 0.47,
      roas: 1.59
    },
    tags: ['electronic', 'festival', 'edm']
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mdmc-crm');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create users with permissions
    const users = [];
    for (const userData of sampleUsers) {
      const permissions = User.getPermissionsByRole(userData.role);
      const user = new User({
        ...userData,
        permissions
      });
      users.push(user);
    }

    await User.insertMany(users);
    console.log(`✅ Created ${users.length} users`);

    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed leads
const seedLeads = async (users) => {
  try {
    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️ Cleared existing leads');

    // Get agents for assignment
    const agents = users.filter(user => user.role === 'agent');

    // Create leads with assignments
    const leads = sampleLeads.map((leadData, index) => ({
      ...leadData,
      assignedTo: agents[index % agents.length]._id,
      assignedAt: new Date(),
      createdBy: users[0]._id // Admin created
    }));

    await Lead.insertMany(leads);
    console.log(`✅ Created ${leads.length} leads`);

    return leads;
  } catch (error) {
    console.error('❌ Error seeding leads:', error);
    throw error;
  }
};

// Seed campaigns
const seedCampaigns = async (users, leads) => {
  try {
    // Clear existing campaigns
    await Campaign.deleteMany({});
    console.log('🗑️ Cleared existing campaigns');

    // Get manager and leads for assignment
    const manager = users.find(user => user.role === 'manager');
    const clients = leads.slice(0, 3); // Use first 3 leads as clients

    // Create campaigns
    const campaigns = sampleCampaigns.map((campaignData, index) => ({
      ...campaignData,
      manager: manager._id,
      client: clients[index]?._id,
      createdBy: users[0]._id, // Admin created
      leads: [clients[index]?._id].filter(Boolean)
    }));

    await Campaign.insertMany(campaigns);
    console.log(`✅ Created ${campaigns.length} campaigns`);

    return campaigns;
  } catch (error) {
    console.error('❌ Error seeding campaigns:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...');

    const users = await seedUsers();
    const leads = await seedLeads(users);
    const campaigns = await seedCampaigns(users, leads);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Leads: ${leads.length}`);
    console.log(`- Campaigns: ${campaigns.length}`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@mdmcmusicads.com / MDMC_Admin_2025!');
    console.log('Manager: sarah.manager@mdmcmusicads.com / Manager123!');
    console.log('Agent: mike.agent@mdmcmusicads.com / Agent123!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase();
}

export default seedDatabase;