"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
exports.runAllMigrations = runAllMigrations;
const mongoose_1 = __importDefault(require("mongoose"));
const _001_create_musicians_collection_1 = require("./001_create_musicians_collection");
const _002_create_posts_collection_1 = require("./002_create_posts_collection");
/**
 * Migration Runner
 * Executes all database migrations in order
 */
const migrations = [
    {
        version: '001',
        name: 'create_musicians_collection',
        run: _001_create_musicians_collection_1.runMigration,
    },
    {
        version: '002',
        name: 'create_posts_collection',
        run: _002_create_posts_collection_1.runMigration,
    },
    // Add future migrations here
    // {
    //   version: '003',
    //   name: 'add_new_field',
    //   run: migration003,
    // },
];
exports.migrations = migrations;
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
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanding-test';
            console.log(`📦 Connecting to MongoDB: ${mongoUri}\n`);
            await mongoose_1.default.connect(mongoUri);
            await runAllMigrations();
            await mongoose_1.default.disconnect();
            console.log('\n✅ Disconnected from MongoDB');
            process.exit(0);
        }
        catch (error) {
            console.error('\nError running migrations:', error);
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=index.js.map