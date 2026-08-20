"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
function createSale(saleData, items) {
    return db.transaction(() => {
        // Create Sale
        const stmt = db.prepare(`
            INSERT INTO sales (invoice_number, customer_name, total_amount, payment_method)
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(saleData.invoice_number, saleData.customer_name || '', saleData.total_amount, saleData.payment_method);
        const saleId = info.lastInsertRowid;
        // Insert Items and Deduct Stock
        const itemStmt = db.prepare(`
            INSERT INTO sale_items (sale_id, spare_part_id, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)
        `);
        const stockStmt = db.prepare(`
            UPDATE spare_parts SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `);
        for (const item of items) {
            itemStmt.run(saleId, item.spare_part_id, item.quantity, item.price, item.total);
            stockStmt.run(item.quantity, item.spare_part_id);
        }
        return saleId;
    })();
}
function getSales(startDate, endDate) {
    if (startDate && endDate) {
        const stmt = db.prepare(`
            SELECT * FROM sales 
            WHERE date(created_at, 'localtime') >= ? AND date(created_at, 'localtime') <= ?
            ORDER BY created_at DESC
        `);
        return stmt.all(startDate, endDate);
    }
    else {
        const stmt = db.prepare(`
            SELECT * FROM sales 
            ORDER BY created_at DESC 
            LIMIT 50
        `);
        return stmt.all();
    }
}
function getSaleItems(saleId) {
    const stmt = db.prepare(`
        SELECT si.*, sp.name as part_name, sp.part_code
        FROM sale_items si
        LEFT JOIN spare_parts sp ON si.spare_part_id = sp.id
        WHERE si.sale_id = ?
    `);
    return stmt.all(saleId);
}
module.exports = {
    createSale,
    getSales,
    getSaleItems
};
