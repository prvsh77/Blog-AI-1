// filepath: server/configs/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  // Set default to true in case it fails or before it succeeds
  global.isMockDB = true;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000, // Timeout after 2s instead of 30s to activate local mock mode instantly
    });
    console.log('MongoDB connected successfully');
    global.isMockDB = false;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('--- FALLBACK ACTIVATED: Operating in local file-based database mode (mock db) ---');
    global.isMockDB = true;
  }
};

export default connectDB;