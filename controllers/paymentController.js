const db = require('../database/db');

function generatePaymentNumber() {
    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;
    const stmt = db.prepare(`SELECT payment_number FROM payments WHERE payment_number LIKE ? ORDER BY id DESC LIMIT 1`);
    const lastPayment = stmt.get(`${prefix}%`);
    
    let nextNum = 1;
    if (lastPayment && lastPayment.payment_number) {
        const parts = lastPayment.payment_number.split('-');
        if (parts.length === 3) {
            nextNum = parseInt(parts[2], 10) + 1;
        }
    }
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

function getPaymentsByServiceId(serviceOrderId) {
    const stmt = db.prepare(`SELECT * FROM payments WHERE service_order_id = ? ORDER BY id ASC`);
    return stmt.all(serviceOrderId);
}

function addPayment(data) {
    const { service_order_id, amount, payment_method, notes } = data;
    const payment_number = generatePaymentNumber();
    
    const tx = db.transaction(() => {
        const stmt = db.prepare(`
            INSERT INTO payments (service_order_id, payment_number, amount, payment_method, notes) 
            VALUES (?, ?, ?, ?, ?)
        `);
        const info = stmt.run(service_order_id, payment_number, amount, payment_method, notes);
        
        // Check payment status (Belum Bayar, DP, Lunas)
        updateServicePaymentStatus(service_order_id);
        
        return info.lastInsertRowid;
    });
    
    return tx();
}

function deletePayment(id) {
    const payment = db.prepare(`SELECT service_order_id FROM payments WHERE id = ?`).get(id);
    if (!payment) return false;
    
    const tx = db.transaction(() => {
        db.prepare(`DELETE FROM payments WHERE id = ?`).run(id);
        updateServicePaymentStatus(payment.service_order_id);
        return true;
    });
    
    return tx();
}

function updateServicePaymentStatus(serviceOrderId) {
    // 1. Get total cost
    const so = db.prepare(`SELECT total_cost FROM service_orders WHERE id = ?`).get(serviceOrderId);
    if (!so) return;
    const totalCost = so.total_cost || 0;
    
    // 2. Get total paid
    const p = db.prepare(`SELECT SUM(amount) as total_paid FROM payments WHERE service_order_id = ?`).get(serviceOrderId);
    const totalPaid = p.total_paid || 0;
    
    // 3. Determine status
    let status = 'Belum Bayar';
    if (totalPaid >= totalCost && totalCost > 0) {
        status = 'Lunas';
    } else if (totalPaid > 0) {
        status = 'DP / Sebagian';
    } else if (totalPaid === 0 && totalCost === 0) {
        status = 'Gratis';
    }
    
    db.prepare(`UPDATE service_orders SET payment_status = ? WHERE id = ?`).run(status, serviceOrderId);
}

module.exports = {
    getPaymentsByServiceId,
    addPayment,
    deletePayment
};
