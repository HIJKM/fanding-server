/**
 * Posts Collection Migration
 * Creates the posts collection with all required indexes
 *
 * Indexes created:
 * 1. musicianId - For efficient musician lookups
 * 2. createdAt - For time-based sorting
 * 3. musicianId + createdAt - For musician posts with chronological order
 */
declare function runMigration(): Promise<boolean>;
export { runMigration };
//# sourceMappingURL=002_create_posts_collection.d.ts.map