import mongoose from 'mongoose';

/**
 * T025: Database Connection Utility
 * Manages MongoDB connection and initialization
 */

let isConnected = false;

/**
 * Connect to MongoDB
 * @param mongoUri MongoDB connection string
 * @returns Promise resolving when connected
 */
async function connectToDatabase(mongoUri: string): Promise<void> {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  try {
    console.log(`📦 Connecting to MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      // Connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Disconnect from MongoDB
 * @returns Promise resolving when disconnected
 */
async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    console.log('⚠️  Not connected to MongoDB');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB disconnection failed:', error.message);
    throw new Error(`Database disconnection failed: ${error.message}`);
  }
}

/**
 * Get current connection status
 * @returns true if connected, false otherwise
 */
function isConnectedToDatabase(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get MongoDB connection instance
 * @returns Mongoose connection object
 */
function getConnection(): typeof mongoose {
  return mongoose;
}

export {
  connectToDatabase,
  disconnectFromDatabase,
  isConnectedToDatabase,
  getConnection,
};
