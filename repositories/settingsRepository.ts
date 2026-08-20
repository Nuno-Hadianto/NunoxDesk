import { Settings } from '../src/types';
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
    const stmt = db.prepare(`UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`);
    const transaction = db.transaction((settingsData) => {
        for (const [key, value] of Object.entries(settingsData)) {
            stmt.run(value, key);
        }
    });
    transaction(data);
    return true;
}

module.exports = {
    getSettings,
    updateSettings
};
