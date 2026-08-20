"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
const paymentRepository = require('./paymentRepository');
function getServiceItems(serviceOrderId) {
    const stmt = db.prepare(`
        SELECT si.*, sp.name as part_name 
        FROM service_items si 
        LEFT JOIN spare_parts sp ON si.spare_part_id = sp.id 
        WHERE si.service_order_id = ?
        ORDER BY si.id ASC
    `);
    return stmt.all(serviceOrderId);
}
function addServiceItem(data) {
    const { service_order_id, item_type, spare_part_id, description, quantity, price } = data;
    // Diskon uses negative total
    let total = quantity * price;
    if (item_type === 'Diskon') {
        total = -Math.abs(total);
    }
    let cost_price = 0;
    if (item_type === 'Sparepart' && spare_part_id) {
        const part = db.prepare(`SELECT stock, buy_price FROM spare_parts WHERE id = ?`).get(spare_part_id);
        if (part) {
            if (part.stock < quantity) {
                throw new Error(`Stok sparepart tidak mencukupi (Tersisa: ${part.stock})`);
            }
            cost_price = part.buy_price * quantity;
        }
    }
    const tx = db.transaction(() => {
        const stmt = db.prepare(`
            INSERT INTO service_items (service_order_id, item_type, spare_part_id, description, quantity, price, cost_price, total) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(service_order_id, item_type, spare_part_id || null, description, quantity, price, cost_price, total);
        // Update stock if it's a spare part
        if (item_type === 'Sparepart' && spare_part_id) {
            db.prepare(`UPDATE spare_parts SET stock = stock - ? WHERE id = ?`).run(quantity, spare_part_id);
        }
        // Recalculate total cost in service_orders
        recalculateServiceTotal(service_order_id);
        return info.lastInsertRowid;
    });
    return tx();
}
function deleteServiceItem(id) {
    const item = db.prepare(`SELECT * FROM service_items WHERE id = ?`).get(id);
    if (!item)
        return false;
    const tx = db.transaction(() => {
        const stmt = db.prepare(`DELETE FROM service_items WHERE id = ?`);
        stmt.run(id);
        // Return stock if it was a spare part
        if (item.item_type === 'Sparepart' && item.spare_part_id) {
            db.prepare(`UPDATE spare_parts SET stock = stock + ? WHERE id = ?`).run(item.quantity, item.spare_part_id);
        }
        recalculateServiceTotal(item.service_order_id);
        return true;
    });
    return tx();
}
function recalculateServiceTotal(serviceOrderId) {
    const items = db.prepare(`SELECT SUM(total) as grand_total FROM service_items WHERE service_order_id = ?`).get(serviceOrderId);
    const total = items.grand_total || 0;
    db.prepare(`UPDATE service_orders SET total_cost = ? WHERE id = ?`).run(total, serviceOrderId);
    // Payment status might change if total cost changes (e.g. from Lunas to DP / Sebagian)
    paymentRepository.updateServicePaymentStatus(serviceOrderId);
}
module.exports = {
    getServiceItems,
    addServiceItem,
    deleteServiceItem
};
