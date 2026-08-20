const db = require('../database/db');

function getDashboardStats() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Servis Hari Ini
    const todayServicesQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE DATE(created_at, 'localtime') = ?`);
    const todayServices = todayServicesQuery.get(today).count;

    // Sedang Dikerjakan
    const inProgressQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status NOT LIKE '%Selesai%' AND service_status NOT IN ('Batal', 'Dibatalkan')`);
    const inProgress = inProgressQuery.get().count;

    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status LIKE '%Selesai%'`);
    const completed = completedQuery.get().count;

    // Pendapatan Bulan Ini (Total dari payments)
    const incomeMonthQuery = db.prepare(`SELECT SUM(amount) as total FROM payments WHERE strftime('%Y-%m', payment_date, 'localtime') = ?`);
    const incomeMonth = incomeMonthQuery.get(currentMonth).total || 0;

    // HPP (Modal Sparepart) untuk transaksi yang diselesaikan bulan ini
    const hppMonthQuery = db.prepare(`
        SELECT SUM(si.cost_price) as hpp 
        FROM service_items si
        JOIN service_orders so ON si.service_order_id = so.id
        WHERE strftime('%Y-%m', so.completed_date, 'localtime') = ?
    `);
    const hppMonth = hppMonthQuery.get(currentMonth).hpp || 0;
    const labaBersih = incomeMonth - hppMonth;

    // Chart Data (Income last 6 months)
    const chartQuery = db.prepare(`
        SELECT strftime('%Y-%m', payment_date, 'localtime') as month, SUM(amount) as total 
        FROM payments 
        WHERE date(payment_date, 'localtime') >= date('now', 'localtime', 'start of month', '-5 months')
        GROUP BY month 
        ORDER BY month ASC
    `);
    const chartDataRaw = chartQuery.all();

    const chartLabels = [];
    const chartValues = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1); // Prevent date overflow bug (e.g. March 31 -> Feb 31 -> March 3)
        d.setMonth(new Date().getMonth() - i);
        const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('id-ID', { month: 'short' });
        
        const row = chartDataRaw.find((r: any) => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }

    // Get threshold from settings
    let threshold = 3; // default
    try {
        const settingsQuery = db.prepare(`SELECT value FROM settings WHERE key = 'low_stock_threshold'`);
        const row = settingsQuery.get();
        if (row && row.value !== undefined) {
            threshold = Number(row.value);
        }
    } catch (e) {
        // ignore
    }

    // Peringatan Stok Menipis (Stok <= threshold)
    const lowStockParts = db.prepare(`SELECT * FROM spare_parts WHERE stock <= ? ORDER BY stock ASC LIMIT 20`).all(threshold);
    // Barang Terlantar / Follow Up
    // 1. Menunggu Sparepart > 7 hari
    const waitingQuery = db.prepare(`
        SELECT so.id, so.ticket_number, c.name as customer_name, so.service_status, 
               CAST(julianday('now', 'localtime') - julianday(so.created_at, 'localtime') AS INTEGER) as days_pending
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE so.service_status = 'Menunggu Sparepart' 
          AND (julianday('now', 'localtime') - julianday(so.created_at, 'localtime')) > 7
    `);
    
    // 2. Selesai (Belum Diambil) > 14 hari
    const completedNotPickedQuery = db.prepare(`
        SELECT so.id, so.ticket_number, c.name as customer_name, so.service_status, 
               CAST(julianday('now', 'localtime') - julianday(so.completed_date, 'localtime') AS INTEGER) as days_pending
        FROM service_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE so.service_status = 'Selesai (Belum Diambil)' 
          AND so.completed_date IS NOT NULL
          AND (julianday('now', 'localtime') - julianday(so.completed_date, 'localtime')) > 14
    `);

    const abandonedServices = [
        ...waitingQuery.all(),
        ...completedNotPickedQuery.all()
    ];

    return {
        todayServices,
        inProgress,
        completed,
        incomeMonth,
        labaBersih,
        chartData: { labels: chartLabels, values: chartValues },
        lowStockParts,
        abandonedServices
    };
}

module.exports = {
    getDashboardStats
};
