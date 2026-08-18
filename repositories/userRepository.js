const db = require('../database/db');

function getUserCount() {
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM users`);
    return checkStmt.get().count;
}

function createDefaultAdmin(hash) {
    const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
    stmt.run('admin', hash, 'admin');
}

function getUserByUsername(username) {
    const stmt = db.prepare(`SELECT id, username, password, role FROM users WHERE username = ?`);
    return stmt.get(username);
}

function getUsers() {
    const stmt = db.prepare(`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`);
    return stmt.all();
}

function getUserById(id) {
    const stmt = db.prepare(`SELECT id, username, role FROM users WHERE id = ?`);
    return stmt.get(id);
}

function checkUsernameExists(username) {
    return db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
}

function checkUsernameExistsExceptId(username, id) {
    return db.prepare(`SELECT id FROM users WHERE username = ? AND id != ?`).get(username, id);
}

function addUser(username, hash, role) {
    const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
    const info = stmt.run(username, hash, role);
    return info.lastInsertRowid;
}

function updateUserWithPassword(id, username, hash, role) {
    const stmt = db.prepare(`UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?`);
    stmt.run(username, hash, role, id);
    return true;
}

function updateUserWithoutPassword(id, username, role) {
    const stmt = db.prepare(`UPDATE users SET username = ?, role = ? WHERE id = ?`);
    stmt.run(username, role, id);
    return true;
}

function getUserRole(id) {
    return db.prepare(`SELECT role FROM users WHERE id = ?`).get(id);
}

function getAdminCount() {
    return db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`).get().count;
}

function deleteUser(id) {
    const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
    stmt.run(id);
    return true;
}

module.exports = {
    getUserCount,
    createDefaultAdmin,
    getUserByUsername,
    getUsers,
    getUserById,
    checkUsernameExists,
    checkUsernameExistsExceptId,
    addUser,
    updateUserWithPassword,
    updateUserWithoutPassword,
    getUserRole,
    getAdminCount,
    deleteUser
};
