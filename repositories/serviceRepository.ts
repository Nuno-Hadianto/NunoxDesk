import { ServiceOrder } from '../src/types';
const db = require('../database/db');

function generateTicketNumber() {
    const year = new Date().getFullYear();
    const prefix = `NSV-${year}-`;
    const stmt = db.prepare(`SELECT ticket_number FROM service_orders WHERE ticket_number LIKE ? ORDER BY id DESC LIMIT 1`);
    const lastOrder = stmt.get(`${prefix}%`);
    
    let nextNum = 1;
    if (lastOrder && lastOrder.ticket_number) {
        const parts = lastOrder.ticket_number.split('-');
        if (parts.length === 3) {
            nextNum = parseInt(parts[2], 10) + 1;
        }
    }
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

function getServices(searchQuery: string = '', page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    let query = `
        SELECT so.*, c.name as customer_name, d.brand, d.model, d.device_type
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
    `;
    let countQuery = `
        SELECT COUNT(*) as count
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
    `;
    
    let data, total;
    if (searchQuery) {
        const whereClause = ` WHERE so.ticket_number LIKE ? OR c.name LIKE ? OR d.brand LIKE ?`;
        query += whereClause + ` ORDER BY so.id DESC LIMIT ? OFFSET ?`;
        countQuery += whereClause;
        
        const qStr = `%${searchQuery}%`;
        data = db.prepare(query).all(qStr, qStr, qStr, limit, offset);
        total = db.prepare(countQuery).get(qStr, qStr, qStr).count;
    } else {
        query += ` ORDER BY so.id DESC LIMIT ? OFFSET ?`;
        data = db.prepare(query).all(limit, offset);
        total = db.prepare(countQuery).get().count;
    }
    
    return { data, total, page, limit };
}

function getServiceById(id: number | string) {
    const stmt = db.prepare(`
        SELECT so.*, 
               c.name as customer_name, c.phone as customer_phone, c.address as customer_address, 
               d.brand, d.model, d.device_type, d.serial_number, d.color, d.accessories
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
        WHERE so.id = ?
    `);
    return stmt.get(id);
}

function getServiceStatusHistory(serviceOrderId: any) {
    const stmt = db.prepare(`SELECT * FROM service_status_history WHERE service_order_id = ? ORDER BY id ASC`);
    return stmt.all(serviceOrderId);
}

function addService(data: ServiceOrder) {
    const { customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost } = data;
    const ticket_number = generateTicketNumber();
    
    const tx = db.transaction(() => {
        const stmt = db.prepare(`
            INSERT INTO service_orders (ticket_number, customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost, service_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Diterima')
        `);
        
        const info = stmt.run(ticket_number, customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost || 0);
        
        // Add history
        const historyStmt = db.prepare(`INSERT INTO service_status_history (service_order_id, status, notes) VALUES (?, ?, ?)`);
        historyStmt.run(info.lastInsertRowid, 'Diterima', 'Servis diterima');
        
        return info.lastInsertRowid;
    });
    
    return tx();
}

function updateServiceStatus(id: any, status: any, notes: any, warrantyDays: any = 0) {
    const tx = db.transaction(() => {
        const stmt = db.prepare(`UPDATE service_orders SET service_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
        stmt.run(status, id);
        
        const historyStmt = db.prepare(`INSERT INTO service_status_history (service_order_id, status, notes) VALUES (?, ?, ?)`);
        historyStmt.run(id, status, notes);
        
        if (status === 'Selesai (Belum Diambil)' || status === 'Selesai (Sudah Diambil)' || status.includes('Selesai')) {
            // Hanya set completed_date jika masih kosong agar tanggal aslinya tidak berubah-ubah
            const checkStmt = db.prepare(`SELECT completed_date FROM service_orders WHERE id = ?`);
            const so = checkStmt.get(id);
            if (!so.completed_date) {
                const finishStmt = db.prepare(`UPDATE service_orders SET completed_date = CURRENT_TIMESTAMP WHERE id = ?`);
                finishStmt.run(id);
            }
            
            if (warrantyDays > 0) {
                const wStmt = db.prepare(`UPDATE service_orders SET warranty_end_date = datetime('now', '+' || ? || ' days') WHERE id = ?`);
                wStmt.run(warrantyDays, id);
            }
        }
        
        return true;
    });
    
    return tx();
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    const { diagnosis_result, actions_taken, technician_notes } = data;
    const stmt = db.prepare(`
        UPDATE service_orders SET 
            diagnosis_result = ?, actions_taken = ?, technician_notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    stmt.run(diagnosis_result, actions_taken, technician_notes, id);
    return true;
}

function deleteService(id: number | string) {
    const tx = db.transaction(() => {
        // Ambil semua item sparepart untuk dikembalikan stoknya sebelum order dihapus
        const items = db.prepare(`SELECT * FROM service_items WHERE service_order_id = ? AND item_type = 'Sparepart' AND spare_part_id IS NOT NULL`).all(id);
        
        const updateStock = db.prepare(`UPDATE spare_parts SET stock = stock + ? WHERE id = ?`);
        for (const item of items) {
            updateStock.run(item.quantity, item.spare_part_id);
        }
        
        // Hapus service_order (service_items akan terhapus otomatis karena ON DELETE CASCADE)
        const stmt = db.prepare(`DELETE FROM service_orders WHERE id = ?`);
        stmt.run(id);
        
        return true;
    });
    
    return tx();
}

// Photos logic
function addPhoto(serviceOrderId: any, photoType: any, filepath: any) {
    const stmt = db.prepare(`INSERT INTO service_photos (service_order_id, photo_type, filepath) VALUES (?, ?, ?)`);
    const info = stmt.run(serviceOrderId, photoType, filepath);
    return info.lastInsertRowid;
}

function getPhotos(serviceOrderId: any) {
    const stmt = db.prepare(`SELECT * FROM service_photos WHERE service_order_id = ? ORDER BY id ASC`);
    return stmt.all(serviceOrderId);
}

function getPhotoById(id: any) {
    const stmt = db.prepare(`SELECT * FROM service_photos WHERE id = ?`);
    return stmt.get(id);
}

function deletePhoto(id: any) {
    const stmt = db.prepare(`DELETE FROM service_photos WHERE id = ?`);
    stmt.run(id);
    return true;
}

// Warranty Logic
function checkWarranty(deviceId: any) {
    const stmt = db.prepare(`
        SELECT ticket_number, warranty_end_date 
        FROM service_orders 
        WHERE device_id = ? AND warranty_end_date IS NOT NULL AND warranty_end_date >= datetime('now') 
        ORDER BY warranty_end_date DESC 
        LIMIT 1
    `);
    return stmt.get(deviceId) || null;
}

module.exports = {
    generateTicketNumber,
    getServices,
    getServiceById,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService,
    addPhoto,
    getPhotos,
    getPhotoById,
    deletePhoto,
    checkWarranty
};
