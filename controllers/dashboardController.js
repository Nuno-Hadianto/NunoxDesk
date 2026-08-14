const db = require('../database/db');

function getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Servis Hari Ini
    const todayServicesQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE DATE(created_at) = ?`);
    const todayServices = todayServicesQuery.get(today).count;

    // Sedang Dikerjakan
    const inProgressQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status NOT IN ('Selesai', 'Diambil', 'Dibatalkan')`);
    const inProgress = inProgressQuery.get().count;

    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db.prepare(`SELECT COUNT(*) as count FROM service_orders WHERE service_status = 'Selesai' OR service_status = 'Diambil'`);
    const completed = completedQuery.get().count;

    // Pendapatan Bulan Ini (Total dari payments)
    const incomeMonthQuery = db.prepare(`SELECT SUM(amount) as total FROM payments WHERE strftime('%Y-%m', payment_date) = ?`);
    const incomeMonth = incomeMonthQuery.get(currentMonth).total || 0;

    // Chart Data (Income last 6 months)
    const chartQuery = db.prepare(`
        SELECT strftime('%Y-%m', payment_date) as month, SUM(amount) as total 
        FROM payments 
        WHERE payment_date >= date('now', 'start of month', '-5 months')
        GROUP BY month 
        ORDER BY month ASC
    `);
    const chartDataRaw = chartQuery.all();

    const chartLabels = [];
    const chartValues = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('id-ID', { month: 'short' });
        
        const row = chartDataRaw.find(r => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }

    return {
        todayServices,
        inProgress,
        completed,
        incomeMonth,
        chartData: { labels: chartLabels, values: chartValues }
    };
}

module.exports = {
    getDashboardStats
};
