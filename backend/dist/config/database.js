"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
exports.isConnectedToDatabase = isConnectedToDatabase;
exports.getConnection = getConnection;
const mongoose_1 = __importDefault(require("mongoose"));
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
async function connectToDatabase(mongoUri) {
    if (isConnected) {
        console.log('✅ Already connected to MongoDB');
        return;
    }
    try {
        console.log(`📦 Connecting to MongoDB: ${mongoUri}`);
        await mongoose_1.default.connect(mongoUri, {
            // Connection options
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw new Error(`Database connection failed: ${error.message}`);
    }
}
/**
 * Disconnect from MongoDB
 * @returns Promise resolving when disconnected
 */
async function disconnectFromDatabase() {
    if (!isConnected) {
        console.log('⚠️  Not connected to MongoDB');
        return;
    }
    try {
        await mongoose_1.default.disconnect();
        isConnected = false;
        console.log('✅ MongoDB disconnected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB disconnection failed:', error.message);
        throw new Error(`Database disconnection failed: ${error.message}`);
    }
}
/**
 * Get current connection status
 * @returns true if connected, false otherwise
 */
function isConnectedToDatabase() {
    return isConnected && mongoose_1.default.connection.readyState === 1;
}
/**
 * Get MongoDB connection instance
 * @returns Mongoose connection object
 */
function getConnection() {
    return mongoose_1.default;
}
//# sourceMappingURL=database.js.map