const db = require('../database/db');
const dashboardController = require('../controllers/dashboardController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const serviceController = require('../controllers/serviceController');

describe('Dashboard Controller Integration Tests', () => {
    beforeEach(() => {
        // Hapus data agar terisolasi
        db.exec('DELETE FROM service_orders');
        db.exec('DELETE FROM devices');
        db.exec('DELETE FROM customers');
    });

    afterAll(() => {
        if (db && db.open) {
            db.close();
        }
    });

    it('seharusnya mengambil statistik dashboard dengan default 0', () => {
        const stats = dashboardController.getDashboardStats();
        expect(stats).toBeDefined();
        expect(stats.todayServices).toBe(0);
        expect(stats.inProgress).toBe(0);
        expect(stats.completed).toBe(0);
        expect(stats.incomeMonth).toBe(0);
        expect(stats.labaBersih).toBe(0);
    });

    it('seharusnya menghitung todayServices ketika ada servis baru', () => {
        // Buat customer & device mock
        const customerId = customerController.addCustomer({ name: 'Test', phone: '081', address: 'Test', notes: '' });
        const deviceId = deviceController.addDevice({ 
            customer_id: customerId, device_type: 'HP', brand: 'Samsung', model: 'A50', 
            serial_number: '', color: '', accessories: '', physical_condition: '', notes: '' 
        });

        // Buat Service Order
        const serviceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            service_status: 'Diterima',
            estimated_cost: 100000,
            estimated_completion: '2030-01-01',
            notes: 'Test service'
        });

        expect(serviceId).toBeGreaterThan(0);

        // Uji Dashboard lagi
        const stats = dashboardController.getDashboardStats();
        expect(stats.todayServices).toBe(1);
        expect(stats.inProgress).toBe(1);
        expect(stats.completed).toBe(0);
    });
});
