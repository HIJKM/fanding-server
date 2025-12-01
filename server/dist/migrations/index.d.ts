import { runMigration as migration001 } from './001_create_musicians_collection';
/**
 * Migration Runner
 * Executes all database migrations in order
 */
declare const migrations: {
    version: string;
    name: string;
    run: typeof migration001;
}[];
declare function runAllMigrations(): Promise<boolean>;
export { runAllMigrations, migrations };
//# sourceMappingURL=index.d.ts.map