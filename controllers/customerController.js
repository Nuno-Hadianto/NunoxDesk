const db = require('../database/db');

function getCustomers(searchQuery = '') {
    if (searchQuery) {
        const stmt = db.prepare(`SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC`);
        return stmt.all(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    const stmt = db.prepare(`SELECT * FROM customers ORDER BY name ASC`);
    return stmt.all();
}

function getCustomerById(id) {
    const stmt = db.prepare(`SELECT * FROM customers WHERE id = ?`);
    return stmt.get(id);
}

function addCustomer(data) {
    const { name, phone, address, notes } = data;
    const stmt = db.prepare(`INSERT INTO customers (name, phone, address, notes) VALUES (?, ?, ?, ?)`);
    const info = stmt.run(name, phone, address, notes);
    return info.lastInsertRowid;
}

function updateCustomer(id, data) {
    const { name, phone, address, notes } = data;
    const stmt = db.prepare(`UPDATE customers SET name = ?, phone = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(name, phone, address, notes, id);
    return true;
}

function deleteCustomer(id) {
    const stmt = db.prepare(`DELETE FROM customers WHERE id = ?`);
    stmt.run(id);
    return true;
}

module.exports = {
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer
};
