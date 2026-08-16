const db = require('../database/db');
const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const partController = require('../controllers/partController');
const serviceItemController = require('../controllers/serviceItemController');

describe('Service Controller Integration Tests', () => {
    let customerId;
    let deviceId;

    beforeAll(() => {
        // Hapus data agar bersih untuk inisialisasi awal
        db.exec('DELETE FROM service_items');
        db.exec('DELETE FROM service_status_history');
        db.exec('DELETE FROM service_orders');
        db.exec('DELETE FROM devices');
        db.exec('DELETE FROM customers');

        customerId = customerController.addCustomer({ 
            name: 'Service Test Customer', phone: '08123', address: '', notes: '' 
        });
        deviceId = deviceController.addDevice({
            customer_id: customerId, device_type: 'Laptop', brand: 'Asus', model: 'ROG', 
            serial_number: '', color: '', accessories: '', physical_condition: '', notes: ''
        });
    });

    beforeEach(() => {
        db.exec('DELETE FROM service_items');
        db.exec('DELETE FROM service_status_history');
        db.exec('DELETE FROM service_orders');
        db.exec('DELETE FROM spare_parts');
    });

    afterAll(() => {
        if (db && db.open) {
            db.close();
        }
    });

    it('seharusnya membuat tiket servis baru dengan format yang benar dan riwayat awal', () => {
        const serviceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            estimated_completion_date: '2030-12-31',
            technician: 'Teknisi A',
            customer_complaint: 'Mati Total',
            estimated_cost: 500000
        });

        expect(serviceId).toBeGreaterThan(0);

        const service = serviceController.getServiceById(serviceId);
        expect(service).toBeDefined();
        // Cek format tiket NSV-TAHUN-000X
        const currentYear = new Date().getFullYear();
        expect(service.ticket_number).toMatch(new RegExp(`^NSV-${currentYear}-\\d{4}$`));
        expect(service.service_status).toBe('Diterima');

        // Cek riwayat status awal
        const history = serviceController.getServiceStatusHistory(serviceId);
        expect(history).toHaveLength(1);
        expect(history[0].status).toBe('Diterima');
    });

    it('seharusnya bisa mengupdate status servis dan mencatat completed_date saat Selesai', () => {
        const serviceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Ganti Baterai',
            estimated_cost: 200000
        });

        // Update ke Dikerjakan
        serviceController.updateServiceStatus(serviceId, 'Dikerjakan', 'Sedang dicek teknisi');
        let service = serviceController.getServiceById(serviceId);
        expect(service.service_status).toBe('Dikerjakan');
        expect(service.completed_date).toBeNull(); // Belum selesai

        // Update ke Selesai
        serviceController.updateServiceStatus(serviceId, 'Selesai', 'Selesai diganti');
        service = serviceController.getServiceById(serviceId);
        expect(service.service_status).toBe('Selesai');
        expect(service.completed_date).not.toBeNull(); // Harus sudah terisi tanggal

        // Cek riwayat status
        const history = serviceController.getServiceStatusHistory(serviceId);
        expect(history).toHaveLength(3); // Diterima, Dikerjakan, Selesai
        expect(history[2].status).toBe('Selesai');
        expect(history[2].notes).toBe('Selesai diganti');
    });

    it('seharusnya bisa mengupdate detail teknis (diagnosis, actions_taken)', () => {
        const serviceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Layar Blank',
        });

        serviceController.updateServiceDetails(serviceId, {
            diagnosis_result: 'Kabel LCD kendor',
            actions_taken: 'Kencangkan kabel',
            technician_notes: 'Baut kurang satu'
        });

        const service = serviceController.getServiceById(serviceId);
        expect(service.diagnosis_result).toBe('Kabel LCD kendor');
        expect(service.actions_taken).toBe('Kencangkan kabel');
        expect(service.technician_notes).toBe('Baut kurang satu');
    });

    it('seharusnya mengembalikan stok sparepart saat servis dihapus', () => {
        // Buat sparepart baru
        const partId = partController.addPart({
            part_code: 'P-BAT', name: 'Baterai Asus', stock: 10, sell_price: 200000
        });

        const serviceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Ganti Baterai'
        });

        // Tambahkan sparepart ke servis (stok otomatis berkurang di serviceItemController)
        serviceItemController.addServiceItem({
            service_order_id: serviceId,
            item_type: 'Sparepart',
            description: 'Baterai Asus',
            quantity: 2,
            price: 200000,
            spare_part_id: partId
        });

        // Verifikasi stok berkurang menjadi 8
        let part = partController.getPartById(partId);
        expect(part.stock).toBe(8);

        // Hapus servis (harus mengembalikan stok)
        serviceController.deleteService(serviceId);

        // Verifikasi stok kembali ke 10
        part = partController.getPartById(partId);
        expect(part.stock).toBe(10);
    });
});
