"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
function getSettings() {
    const stmt = db.prepare(`SELECT key, value FROM settings`);
    const rows = stmt.all();
    const settings = {};
    rows.forEach(row => {
        settings[row.key] = row.value;
    });
    return settings;
}
function updateSettings(data) {
    const stmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) 
                             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`);
    const transaction = db.transaction((settingsData) => {
        for (const [key, value] of Object.entries(settingsData)) {
            stmt.run(key, value);
        }
    });
    transaction(data);
    return true;
}
module.exports = {
    getSettings,
    updateSettings
};
