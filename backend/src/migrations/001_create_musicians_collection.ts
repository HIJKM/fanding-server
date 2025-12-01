import mongoose from 'mongoose';
import { Musician } from '../models/musician';

/**
 * T021-T023: MongoDB Migration
 * Creates the musicians collection with all required indexes
 *
 * Indexes created:
 * 1. userId - For efficient user lookups
 * 2. walletAddress - For wallet-based queries
 * 3. tokenAddress - For deployed token lookups
 * 4. createdAt - For time-based sorting
 * 5. genre + createdAt - For genre-based queries with chronological order
 * 6. isTokenDeployed - For deployment status queries
 */

async function runMigration() {
  try {
    console.log('🚀 Running migration: 001_create_musicians_collection\n');

    // Ensure connection
    if (!mongoose.connection.readyState) {
      throw new Error('MongoDB connection not established');
    }

    // Get the collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collectionName = 'musicians';

    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    const collectionExists = collections.length > 0;

    if (collectionExists) {
      console.log(`✅ Collection '${collectionName}' already exists`);
    } else {
      console.log(`⏳ Creating collection '${collectionName}'...`);
      await db.createCollection(collectionName);
      console.log(`✅ Collection '${collectionName}' created`);
    }

    // Drop old unique index on walletAddress if it exists (schema changed to allow multiple per wallet)
    console.log('\n⏳ Checking for old unique index on walletAddress...');
    try {
      const indexes = await Musician.collection.getIndexes();
      // Check if walletAddress_1 index exists and try to drop it
      if (indexes.walletAddress_1) {
        console.log('   ⏳ Dropping old walletAddress index...');
        await Musician.collection.dropIndex('walletAddress_1');
        console.log('   ✅ Old walletAddress index dropped');
      }
    } catch (error: any) {
      // Ignore errors if index doesn't exist (code 27) or other issues
      if (error.code === 27) {
        console.log('   ℹ️  No walletAddress index to drop');
      } else if (error.message && error.message.includes('index not found')) {
        console.log('   ℹ️  No walletAddress index to drop');
      }
      // Continue with migration even if there's an error
    }

    // Create indexes through the model
    console.log('\n⏳ Creating indexes...');

    const indexes: Array<{ name: string; spec: Record<string, number>; options?: Record<string, any> }> = [
      { name: 'userId', spec: { userId: 1 }, options: { unique: true } },
      { name: 'walletAddress', spec: { walletAddress: 1 } },
      { name: 'tokenAddress', spec: { tokenAddress: 1 }, options: { sparse: true, unique: true } },
      { name: 'createdAt', spec: { createdAt: -1 } },
      { name: 'genre_createdAt', spec: { genre: 1, createdAt: -1 } },
      { name: 'isTokenDeployed', spec: { isTokenDeployed: 1 } },
    ];

    for (const index of indexes) {
      try {
        await Musician.collection.createIndex(index.spec as any, index.options || {});
        console.log(`   ✅ Index '${index.name}' created`);
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          // Index already exists (85 = IndexOptionsConflict, 86 = IndexKeySpecsConflict)
          console.log(`   ℹ️  Index '${index.name}' already exists`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✨ Migration 001 completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Collection: ${collectionName}`);
    console.log(`   Indexes: ${indexes.length}`);

    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export { runMigration };

// Run if executed directly
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanding-test';
      await mongoose.connect(mongoUri);
      console.log('📦 Connected to MongoDB\n');

      await runMigration();

      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
