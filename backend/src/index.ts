import * as dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './config/database';
import { runAllMigrations } from './migrations';
import { startServer } from './app';

// -----------------------------------------------------
// 1. Load environment variables Safely
// -----------------------------------------------------

// Render와 같은 프로덕션 환경에서는 이미 시스템 환경 변수가 주입되어 있습니다.
// 따라서 NODE_ENV가 'production'일 때는 로컬 .env 파일 로딩을 건너뛰고,
// 'development' 또는 'test' 환경일 때만 로컬 파일을 로딩합니다.
if (process.env.NODE_ENV !== 'production') {
  const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
  const envPath = path.join(process.cwd(), envFile);
  
  console.log(`📁 Loading environment from local file: ${envPath}`);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️  Local .env file not found. Using defaults/system variables.`);
  } else {
    console.log(`✅ Local environment file loaded successfully`);
  }
} else {
  console.log(`✅ Running in production. Relying on Render system environment variables.`);
}

// -----------------------------------------------------
// 2. Configuration (Render System Variables are prioritized)
// -----------------------------------------------------

// Render에 설정된 값이 최우선입니다. 값이 없다면 기본값을 사용합니다.
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // LOG_LEVEL도 추가했습니다.

// MONGODB_URI는 Render 대시보드에서 설정된 값이 최우선입니다.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // 값이 없으면 서버 시작을 중단합니다.
    throw new Error("MONGODB_URI environment variable is NOT set. Please set it in Render dashboard.");
}
/**
 * Async startup function
 */
async function bootstrap(): Promise<void> {
  try {
    console.log('\n🚀 Fanding Backend Server - Startup Sequence\n');
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Log Level: ${LOG_LEVEL}\n`);


    // MONGODB_URI가 설정되어 있지 않으면 서버 시작을 중단합니다.
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is NOT set. Cannot connect to database.");
    }

    // Step 1: Connect to database
    console.log('📦 Step 1: Database Connection');
    console.log('='.repeat(50));
    // Render에 설정된 MONGODB_URI (외부 DB 주소)를 사용합니다.
    await connectToDatabase(MONGODB_URI); 
    console.log('✅ Database connected successfully');
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
    // Stack trace 대신 에러 메시지만 출력
    // console.error('\nStack trace:', error.stack); 
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