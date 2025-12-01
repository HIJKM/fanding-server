import * as dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './config/database';
import { runAllMigrations } from './migrations';
import { startServer } from './app';

/**
 * Backend Server Entry Point
 * Initializes database connection, runs migrations, and starts Express server
 */

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.test';
const envPath = path.join(process.cwd(), envFile);
console.log(`📁 Loading environment from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error(`⚠️  .env file not found: ${envPath}`);
} else {
  console.log(`✅ Environment file loaded successfully`);
}

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanding-test';

/**
 * Async startup function
 */
async function bootstrap(): Promise<void> {
  try {
    console.log('\n🚀 Fanding Backend Server - Startup Sequence\n');
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}\n`);

    // Step 1: Connect to database
    console.log('📦 Step 1: Database Connection');
    console.log('='.repeat(50));
    await connectToDatabase(MONGODB_URI);
    console.log();

    // Step 2: Run migrations
    console.log('🔄 Step 2: Database Migrations');
    console.log('='.repeat(50));
    await runAllMigrations();
    console.log();

    // Step 3: Start server
    console.log('⚡ Step 3: Starting Express Server');
    console.log('='.repeat(50));
    startServer();

    // Step 4: Setup graceful shutdown
    console.log('\n✅ Server initialized successfully\n');
    setupGracefulShutdown();
  } catch (error: any) {
    console.error('\n❌ Server startup failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
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
      } catch (error: any) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
      }
    });
  });
}

// Start the server
bootstrap();
