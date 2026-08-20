const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const schema = require('./schema');

let dbPath;
if (process.env.NODE_ENV === 'test') {
    dbPath = ':memory:';
} else if (app) {
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'nunox_servis.db');
} else {
    // Fallback for development
    dbPath = path.join(__dirname, 'nunox_servis.db');
}

const db = new Database(dbPath);

function initializeDB() {
    try {
        db.exec(schema.createTables);
        db.exec(schema.insertDefaultSettings);
        
        // Migration: Add cost_price to service_items if it doesn't exist
        try {
            db.exec("ALTER TABLE service_items ADD COLUMN cost_price REAL DEFAULT 0;");
        } catch (e) {
            // Column already exists or other error, ignore
        }
        
        console.log("Database initialized successfully at", dbPath);
    } catch (err) {
        console.error("Failed to initialize database:", err);
    }
}

initializeDB();

module.exports = db;
