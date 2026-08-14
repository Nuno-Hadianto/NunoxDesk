const db = require('../database/db');

function getParts(searchQuery = '') {
    if (searchQuery) {
        const stmt = db.prepare(`SELECT * FROM spare_parts WHERE name LIKE ? OR part_code LIKE ? ORDER BY name ASC`);
        return stmt.all(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    const stmt = db.prepare(`SELECT * FROM spare_parts ORDER BY name ASC`);
    return stmt.all();
}

function getPartById(id) {
    const stmt = db.prepare(`SELECT * FROM spare_parts WHERE id = ?`);
    return stmt.get(id);
}

function addPart(data) {
    const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
    const stmt = db.prepare(`
        INSERT INTO spare_parts (part_code, name, category, stock, buy_price, sell_price, unit, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(part_code, name, category, stock, buy_price, sell_price, unit, notes);
    return info.lastInsertRowid;
}

function updatePart(id, data) {
    const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
    const stmt = db.prepare(`
        UPDATE spare_parts SET 
            part_code = ?, name = ?, category = ?, stock = ?, buy_price = ?, 
            sell_price = ?, unit = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    stmt.run(part_code, name, category, stock, buy_price, sell_price, unit, notes, id);
    return true;
}

function updatePartStock(id, change) {
    // change can be positive (stok masuk) or negative (stok keluar)
    const stmt = db.prepare(`UPDATE spare_parts SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(change, id);
    return true;
}

function deletePart(id) {
    const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM service_items WHERE spare_part_id = ?`);
    const result = checkStmt.get(id);
    if (result.count > 0) {
        throw new Error("Sparepart tidak bisa dihapus karena sudah tercatat dalam riwayat rincian biaya servis.");
    }
    
    const stmt = db.prepare(`DELETE FROM spare_parts WHERE id = ?`);
    stmt.run(id);
    return true;
}

module.exports = {
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    deletePart
};
