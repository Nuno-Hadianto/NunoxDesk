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

function getServices(searchQuery = '') {
    let query = `
        SELECT so.*, c.name as customer_name, d.brand, d.model, d.device_type
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
    `;
    if (searchQuery) {
        query += ` WHERE so.ticket_number LIKE ? OR c.name LIKE ? OR d.brand LIKE ?`;
        const stmt = db.prepare(query + ` ORDER BY so.id DESC`);
        return stmt.all(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }
    const stmt = db.prepare(query + ` ORDER BY so.id DESC`);
    return stmt.all();
}

function getServiceById(id) {
    const stmt = db.prepare(`
        SELECT so.*, c.name as customer_name, c.phone as customer_phone, d.brand, d.model, d.device_type, d.serial_number
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
        WHERE so.id = ?
    `);
    return stmt.get(id);
}

function getServiceStatusHistory(serviceOrderId) {
    const stmt = db.prepare(`SELECT * FROM service_status_history WHERE service_order_id = ? ORDER BY id ASC`);
    return stmt.all(serviceOrderId);
}

function addService(data) {
    const { customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost } = data;
    const ticket_number = generateTicketNumber();
    
    const stmt = db.prepare(`
        INSERT INTO service_orders (ticket_number, customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost, service_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Diterima')
    `);
    
    const info = stmt.run(ticket_number, customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost || 0);
    
    // Add history
    const historyStmt = db.prepare(`INSERT INTO service_status_history (service_order_id, status, notes) VALUES (?, ?, ?)`);
    historyStmt.run(info.lastInsertRowid, 'Diterima', 'Servis diterima');
    
    return info.lastInsertRowid;
}

function updateServiceStatus(id, status, notes) {
    const stmt = db.prepare(`UPDATE service_orders SET service_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(status, id);
    
    const historyStmt = db.prepare(`INSERT INTO service_status_history (service_order_id, status, notes) VALUES (?, ?, ?)`);
    historyStmt.run(id, status, notes);
    
    if (status === 'Selesai') {
        const finishStmt = db.prepare(`UPDATE service_orders SET completed_date = CURRENT_TIMESTAMP WHERE id = ?`);
        finishStmt.run(id);
    }
    
    return true;
}

function updateServiceDetails(id, data) {
    const { diagnosis_result, actions_taken, technician_notes, estimated_cost } = data;
    const stmt = db.prepare(`
        UPDATE service_orders SET 
            diagnosis_result = ?, actions_taken = ?, technician_notes = ?, estimated_cost = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    stmt.run(diagnosis_result, actions_taken, technician_notes, estimated_cost, id);
    return true;
}

function deleteService(id) {
    const stmt = db.prepare(`DELETE FROM service_orders WHERE id = ?`);
    stmt.run(id);
    return true;
}

module.exports = {
    getServices,
    getServiceById,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService
};
