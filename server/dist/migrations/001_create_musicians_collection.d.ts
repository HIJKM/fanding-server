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
declare function runMigration(): Promise<boolean>;
export { runMigration };
//# sourceMappingURL=001_create_musicians_collection.d.ts.map