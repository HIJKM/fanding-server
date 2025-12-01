import mongoose from 'mongoose';
/**
 * Connect to MongoDB
 * @param mongoUri MongoDB connection string
 * @returns Promise resolving when connected
 */
declare function connectToDatabase(mongoUri: string): Promise<void>;
/**
 * Disconnect from MongoDB
 * @returns Promise resolving when disconnected
 */
declare function disconnectFromDatabase(): Promise<void>;
/**
 * Get current connection status
 * @returns true if connected, false otherwise
 */
declare function isConnectedToDatabase(): boolean;
/**
 * Get MongoDB connection instance
 * @returns Mongoose connection object
 */
declare function getConnection(): typeof mongoose;
export { connectToDatabase, disconnectFromDatabase, isConnectedToDatabase, getConnection, };
//# sourceMappingURL=database.d.ts.map