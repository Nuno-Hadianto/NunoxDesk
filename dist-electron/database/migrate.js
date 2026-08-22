"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('./db');
const schema = require('./schema');
const log = require('electron-log');
// Array of migration functions. Index 0 corresponds to Version 1, Index 1 to Version 2, etc.
const migrations = [
    // Version 1: Initial schema creation
    function up_v1() {
        db.exec(schema.createTables);
        db.exec(schema.insertDefaultSettings);
    },
    // Version 2: Add warranty_end_date to service_orders (replacing the hardcoded ALTER TABLE in main.ts)
    function up_v2() {
        try {
            db.prepare('ALTER TABLE service_orders ADD COLUMN warranty_end_date DATETIME').run();
        }
        catch (e) {
            // Ignore if the column already exists (e.g. from the old naive migration method)
            if (!e.message.includes('duplicate column name')) {
                throw e;
            }
        }
    },
    // Version 3: Add cost_price to service_items (moved from db.ts)
    function up_v3() {
        try {
            db.prepare('ALTER TABLE service_items ADD COLUMN cost_price REAL DEFAULT 0').run();
        }
        catch (e) {
            if (!e.message.includes('duplicate column name')) {
                throw e;
            }
        }
    }
];
function runMigrations() {
    const currentVersionResult = db.pragma('user_version', { simple: true });
    const currentVersion = typeof currentVersionResult === 'number' ? currentVersionResult : 0;
    log.info(`Current database version: ${currentVersion}`);
    if (currentVersion >= migrations.length) {
        log.info('Database is up to date.');
        return;
    }
    const runTransaction = db.transaction(() => {
        for (let i = currentVersion; i < migrations.length; i++) {
            const targetVersion = i + 1;
            log.info(`Migrating database to version ${targetVersion}...`);
            // Execute the migration step
            migrations[i]();
            // Update user_version
            db.pragma(`user_version = ${targetVersion}`);
        }
    });
    try {
        runTransaction();
        log.info('Database migration completed successfully.');
    }
    catch (error) {
        log.error('Database migration failed:', error);
        throw error;
    }
}
module.exports = runMigrations;
