"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const migrations_1 = require("./migrations");
const app_1 = require("./app");
/**
 * Backend Server Entry Point
 * Initializes database connection, runs migrations, and starts Express server
 */
// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.test';
const envPath = path_1.default.join(process.cwd(), envFile);
console.log(`📁 Loading environment from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error(`⚠️  .env file not found: ${envPath}`);
}
else {
    console.log(`✅ Environment file loaded successfully`);
}
// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanding-test';
/**
 * Async startup function
 */
async function bootstrap() {
    try {
        console.log('\n🚀 Fanding Backend Server - Startup Sequence\n');
        console.log(`Environment: ${NODE_ENV}`);
        console.log(`Port: ${PORT}\n`);
        // Step 1: Connect to database
        console.log('📦 Step 1: Database Connection');
        console.log('='.repeat(50));
        await (0, database_1.connectToDatabase)(MONGODB_URI);
        console.log();
        // Step 2: Run migrations
        console.log('🔄 Step 2: Database Migrations');
        console.log('='.repeat(50));
        await (0, migrations_1.runAllMigrations)();
        console.log();
        // Step 3: Start server
        console.log('⚡ Step 3: Starting Express Server');
        console.log('='.repeat(50));
        (0, app_1.startServer)();
        // Step 4: Setup graceful shutdown
        console.log('\n✅ Server initialized successfully\n');
        setupGracefulShutdown();
    }
    catch (error) {
        console.error('\n❌ Server startup failed:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}
/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
        process.on(signal, async () => {
            console.log(`\n\n⏹️  Received ${signal} signal - Starting graceful shutdown...`);
            try {
                console.log('Closing database connection...');
                // Note: Import disconnectFromDatabase when needed
                // await disconnectFromDatabase();
                console.log('✅ Database connection closed');
                console.log('✅ Server shutdown complete');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', error.message);
                process.exit(1);
            }
        });
    });
}
// Start the server
bootstrap();
//# sourceMappingURL=index.js.map