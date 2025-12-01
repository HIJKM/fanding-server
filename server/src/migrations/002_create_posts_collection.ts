import mongoose from 'mongoose';
import { Post } from '../models/post';

/**
 * Posts Collection Migration
 * Creates the posts collection with all required indexes
 *
 * Indexes created:
 * 1. musicianId - For efficient musician lookups
 * 2. createdAt - For time-based sorting
 * 3. musicianId + createdAt - For musician posts with chronological order
 */

async function runMigration() {
  try {
    console.log('🚀 Running migration: 002_create_posts_collection\n');

    // Ensure connection
    if (!mongoose.connection.readyState) {
      throw new Error('MongoDB connection not established');
    }

    // Get the collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collectionName = 'posts';

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

    // Create indexes through the model
    console.log('\n⏳ Creating indexes...');

    const indexes: Array<{ name: string; spec: Record<string, number>; options?: Record<string, any> }> = [
      { name: 'musicianId', spec: { musicianId: 1 }, options: { index: true } },
      { name: 'createdAt', spec: { createdAt: -1 } },
      { name: 'musicianId_createdAt', spec: { musicianId: 1, createdAt: -1 } },
    ];

    for (const index of indexes) {
      try {
        await Post.collection.createIndex(index.spec as any, index.options || {});
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

    console.log('\n✨ Migration 002 completed successfully!');
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
