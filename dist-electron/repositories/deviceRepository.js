"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
function getDevices(searchQuery = '') {
    let query = `
        SELECT devices.*, customers.name as customer_name, customers.phone as customer_phone 
        FROM devices 
        JOIN customers ON devices.customer_id = customers.id
    `;
    if (searchQuery) {
        query += ` WHERE devices.brand LIKE ? OR devices.model LIKE ? OR devices.serial_number LIKE ? OR customers.name LIKE ?`;
        const stmt = db.prepare(query + ` ORDER BY devices.id DESC`);
        return stmt.all(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }
    const stmt = db.prepare(query + ` ORDER BY devices.id DESC`);
    return stmt.all();
}
function getDeviceById(id) {
    const stmt = db.prepare(`SELECT * FROM devices WHERE id = ?`);
    return stmt.get(id);
}
function getDevicesByCustomerId(customerId) {
    const stmt = db.prepare(`SELECT * FROM devices WHERE customer_id = ? ORDER BY id DESC`);
    return stmt.all(customerId);
}
function addDevice(data) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    const stmt = db.prepare(`
        INSERT INTO devices (customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes);
    return info.lastInsertRowid;
}
function updateDevice(id, data) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    const stmt = db.prepare(`
        UPDATE devices SET 
            customer_id = ?, device_type = ?, brand = ?, model = ?, serial_number = ?, 
            color = ?, accessories = ?, physical_condition = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    stmt.run(customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes, id);
    return true;
}
function checkDeviceHasServiceOrders(id) {
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE device_id = ?`);
    const result = checkStmt.get(id);
    return result.count > 0;
}
function deleteDevice(id) {
    const stmt = db.prepare(`DELETE FROM devices WHERE id = ?`);
    stmt.run(id);
    return true;
}
module.exports = {
    getDevices,
    getDeviceById,
    getDevicesByCustomerId,
    addDevice,
    updateDevice,
    checkDeviceHasServiceOrders,
    deleteDevice
};
