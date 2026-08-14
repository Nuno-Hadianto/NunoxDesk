const db = require('../database/db');

function getIncomeReport(startDate, endDate) {
    const stmt = db.prepare(`
        SELECT 
            SUM(amount) as total_income,
            COUNT(id) as transaction_count
        FROM payments 
        WHERE date(payment_date) >= date(?) AND date(payment_date) <= date(?)
    `);
    return stmt.get(startDate, endDate);
}

function getCompletedServices(startDate, endDate) {
    const stmt = db.prepare(`
        SELECT 
            so.ticket_number, c.name as customer_name, d.brand, d.model, 
            so.total_cost, so.completed_date,
            (SELECT SUM(cost_price) FROM service_items WHERE service_order_id = so.id) as total_modal
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        JOIN devices d ON so.device_id = d.id
        WHERE so.service_status IN ('Selesai', 'Diambil')
          AND date(so.completed_date) >= date(?) AND date(so.completed_date) <= date(?)
    `);
    return stmt.all(startDate, endDate);
}

module.exports = {
    getIncomeReport,
    getCompletedServices
};
