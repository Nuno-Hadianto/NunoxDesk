const db = require('../database/db');

function getCustomers(searchQuery = '', page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let data, total;
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        data = db.prepare(`SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC LIMIT ? OFFSET ?`).all(queryStr, queryStr, limit, offset);
        total = db.prepare(`SELECT COUNT(*) as count FROM customers WHERE name LIKE ? OR phone LIKE ?`).get(queryStr, queryStr).count;
    } else {
        data = db.prepare(`SELECT * FROM customers ORDER BY name ASC LIMIT ? OFFSET ?`).all(limit, offset);
        total = db.prepare(`SELECT COUNT(*) as count FROM customers`).get().count;
    }
    return { data, total, page, limit };
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
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE customer_id = ?`);
    const result = checkStmt.get(id);
    if (result.count > 0) {
        throw new Error("Pelanggan tidak bisa dihapus karena masih memiliki riwayat tiket servis.");
    }
    
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
