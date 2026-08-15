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

function importParts(dataArray) {
    const tx = db.transaction(() => {
        let imported = 0;
        let updated = 0;
        
        for (const row of dataArray) {
            // Mapping possible Indonesian headers
            const part_code = row['Kode'] || row['part_code'];
            const name = row['Nama'] || row['name'] || row['Nama Sparepart'];
            if (!name) continue; // Nama is required
            
            const category = row['Kategori'] || row['category'] || '';
            const stock = parseInt(row['Stok'] || row['stock'] || 0, 10);
            const buy_price = parseFloat(row['Harga Beli'] || row['buy_price'] || 0);
            const sell_price = parseFloat(row['Harga Jual'] || row['sell_price'] || 0);
            const unit = row['Satuan'] || row['unit'] || 'pcs';
            const notes = row['Keterangan'] || row['notes'] || '';

            if (part_code) {
                const existing = db.prepare(`SELECT id, stock FROM spare_parts WHERE part_code = ?`).get(part_code);
                if (existing) {
                    db.prepare(`
                        UPDATE spare_parts 
                        SET name = ?, category = ?, stock = stock + ?, buy_price = ?, sell_price = ?, unit = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    `).run(name, category, stock || 0, buy_price || 0, sell_price || 0, unit, notes, existing.id);
                    updated++;
                    continue;
                }
            }
            
            // Insert new
            db.prepare(`
                INSERT INTO spare_parts (part_code, name, category, stock, buy_price, sell_price, unit, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(part_code || null, name, category, stock || 0, buy_price || 0, sell_price || 0, unit, notes);
            imported++;
        }
        
        return { imported, updated };
    });
    
    return tx();
}

module.exports = {
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    deletePart,
    importParts
};
