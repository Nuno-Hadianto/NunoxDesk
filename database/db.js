const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const schema = require('./schema');

let dbPath;
if (app) {
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'nunoxdesk.db');
} else {
    // Fallback for testing
    dbPath = path.join(__dirname, 'nunoxdesk.db');
}

const db = new Database(dbPath);

function initializeDB() {
    try {
        db.exec(schema.createTables);
        db.exec(schema.insertDefaultSettings);
        console.log("Database initialized successfully at", dbPath);
    } catch (err) {
        console.error("Failed to initialize database:", err);
    }
}

initializeDB();

module.exports = db;
