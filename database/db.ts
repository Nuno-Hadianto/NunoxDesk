export {};
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
db.pragma('foreign_keys = ON');

module.exports = db;
