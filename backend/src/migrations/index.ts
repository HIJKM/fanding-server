import mongoose from 'mongoose';
import { runMigration as migration001 } from './001_create_musicians_collection';
import { runMigration as migration002 } from './002_create_posts_collection';

/**
 * Migration Runner
 * Executes all database migrations in order
 */

const migrations = [
  {
    version: '001',
    name: 'create_musicians_collection',
    run: migration001,
  },
  {
    version: '002',
    name: 'create_posts_collection',
    run: migration002,
  },
  // Add future migrations here
  // {
  //   version: '003',
  //   name: 'add_new_field',
  //   run: migration003,
  // },
];

async function runAllMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');
    console.log(`Found ${migrations.length} migration(s)\n`);

    for (const migration of migrations) {
      console.log(`[${migration.version}] ${migration.name}`);
      console.log('='.repeat(50));
      await migration.run();
      console.log('='.repeat(50));
      console.log();
    }

    console.log('✨ All migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export { runAllMigrations, migrations };

// Run if executed directly
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanding-test';
      console.log(`📦 Connecting to MongoDB: ${mongoUri}\n`);
      await mongoose.connect(mongoUri);

      await runAllMigrations();

      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('\nError running migrations:', error);
      process.exit(1);
    }
  })();
}
