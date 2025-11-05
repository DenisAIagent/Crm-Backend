import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Support multiple environment variable names for Railway compatibility
    const mongoURI = process.env.MONGODB_URI || 
                     process.env.MONGO_URL || 
                     process.env.DATABASE_URL || 
                     'mongodb://localhost:27017/mdmc-crm';

    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Mongoose 8.x options - removed deprecated options
      // useNewUrlParser and useUnifiedTopology are now default
      // bufferMaxEntries and bufferCommands are no longer supported
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful close on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export { connectDB };