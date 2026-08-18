const db = require('../database/db');

function getDashboardStats() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Servis Hari Ini
    const todayServicesQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE DATE(created_at, 'localtime') = ?`);
    const todayServices = todayServicesQuery.get(today).count;

    // Sedang Dikerjakan
    const inProgressQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status NOT IN ('Selesai', 'Diambil', 'Dibatalkan')`);
    const inProgress = inProgressQuery.get().count;

    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status = 'Selesai' OR service_status = 'Diambil'`);
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
        
        const row = chartDataRaw.find(r => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }

    // Peringatan Stok Menipis (Stok <= 5)
    const lowStockParts = db.prepare(`SELECT * FROM spare_parts WHERE stock <= 5 ORDER BY stock ASC LIMIT 10`).all();

    return {
        todayServices,
        inProgress,
        completed,
        incomeMonth,
        labaBersih,
        chartData: { labels: chartLabels, values: chartValues },
        lowStockParts
    };
}

module.exports = {
    getDashboardStats
};
