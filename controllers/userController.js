const db = require('../database/db');
const bcrypt = require('bcryptjs');

// Inisialisasi: Cek apakah ada user, jika tidak buat default admin
function init() {
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM users`);
    const result = checkStmt.get();
    
    if (result.count === 0) {
        console.log("No users found. Creating default admin...");
        const hash = bcrypt.hashSync('admin123', 10);
        const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
        stmt.run('admin', hash, 'admin');
    }
}

// Panggil inisialisasi saat modul dimuat
init();

function login(username, password) {
    const stmt = db.prepare(`SELECT id, username, password, role FROM users WHERE username = ?`);
    const user = stmt.get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error("Username atau password salah!");
    }
    
    // Remove password from user object before returning
    const { password: _, ...safeUser } = user;
    return safeUser;
}

function getUsers() {
    const stmt = db.prepare(`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`);
    return stmt.all();
}

function getUserById(id) {
    const stmt = db.prepare(`SELECT id, username, role FROM users WHERE id = ?`);
    return stmt.get(id);
}

function addUser(data) {
    const { username, password, role } = data;
    
    // Check if username exists
    const existing = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
    if (existing) {
        throw new Error("Username sudah digunakan!");
    }

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
    const info = stmt.run(username, hash, role);
    return info.lastInsertRowid;
}

function updateUser(id, data) {
    const { username, password, role } = data;
    
    // Check if username exists for OTHER users
    const existing = db.prepare(`SELECT id FROM users WHERE username = ? AND id != ?`).get(username, id);
    if (existing) {
        throw new Error("Username sudah digunakan oleh akun lain!");
    }

    if (password && password.trim() !== '') {
        const hash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare(`UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?`);
        stmt.run(username, hash, role, id);
    } else {
        const stmt = db.prepare(`UPDATE users SET username = ?, role = ? WHERE id = ?`);
        stmt.run(username, role, id);
    }
    return true;
}

function deleteUser(id) {
    // Prevent deleting the last admin
    const user = db.prepare(`SELECT role FROM users WHERE id = ?`).get(id);
    if (user && user.role === 'admin') {
        const adminCount = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`).get().count;
        if (adminCount <= 1) {
            throw new Error("Tidak dapat menghapus Admin terakhir!");
        }
    }

    const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
    stmt.run(id);
    return true;
}

module.exports = {
    login,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
};
