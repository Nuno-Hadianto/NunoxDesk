const db = require('../database/db');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const serviceController = require('../controllers/serviceController');

describe('Customer & Device Controller Integration Tests', () => {
    beforeEach(() => {
        db.exec('DELETE FROM service_orders');
        db.exec('DELETE FROM devices');
        db.exec('DELETE FROM customers');
    });

    afterAll(() => {
        if (db && db.open) {
            db.close();
        }
    });

    it('seharusnya bisa menambahkan pelanggan baru', () => {
        const customerId = customerController.addCustomer({ 
            name: 'Budi', 
            phone: '08123456', 
            address: 'Jakarta', 
            notes: '' 
        });
        expect(customerId).toBeDefined();
        expect(customerId).toBeGreaterThan(0);
        
        const customers = customerController.getCustomers();
        expect(customers.data).toHaveLength(1);
        expect(customers.data[0].name).toBe('Budi');
    });

    it('seharusnya bisa menambahkan perangkat untuk pelanggan tersebut', () => {
        const customerId = customerController.addCustomer({ 
            name: 'Andi', 
            phone: '0811111', 
            address: 'Bandung', 
            notes: '' 
        });

        const deviceId = deviceController.addDevice({
            customer_id: customerId,
            device_type: 'Laptop',
            brand: 'Asus',
            model: 'ROG',
            serial_number: 'SN123',
            color: 'Black',
            accessories: 'Charger',
            physical_condition: 'Good',
            notes: ''
        });
        
        expect(deviceId).toBeDefined();
        expect(deviceId).toBeGreaterThan(0);

        const devices = deviceController.getDevicesByCustomerId(customerId);
        expect(devices).toHaveLength(1);
        expect(devices[0].model).toBe('ROG');
    });

    it('seharusnya bisa mengubah data pelanggan (Update)', () => {
        const customerId = customerController.addCustomer({ 
            name: 'Budi', phone: '08123456', address: 'Jakarta', notes: '' 
        });
        
        customerController.updateCustomer(customerId, {
            name: 'Budi Santoso', phone: '08123456', address: 'Jakarta Selatan', notes: 'Diubah'
        });

        const updatedCustomer = customerController.getCustomerById(customerId);
        expect(updatedCustomer.name).toBe('Budi Santoso');
        expect(updatedCustomer.address).toBe('Jakarta Selatan');
    });

    it('seharusnya bisa menghapus data pelanggan (Delete)', () => {
        const customerId = customerController.addCustomer({ 
            name: 'Budi', phone: '08123456', address: 'Jakarta', notes: '' 
        });
        
        customerController.deleteCustomer(customerId);
        const customers = customerController.getCustomers();
        expect(customers.total).toBe(0);
    });

    it('seharusnya menolak penghapusan pelanggan jika ada riwayat servis', () => {
        const customerId = customerController.addCustomer({ name: 'Budi', phone: '081', address: '', notes: '' });
        const deviceId = deviceController.addDevice({ 
            customer_id: customerId, device_type: 'HP', brand: 'Samsung', model: 'A50', 
            serial_number: '', color: '', accessories: '', physical_condition: '', notes: '' 
        });
        
        serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            service_status: 'Diterima',
            estimated_cost: 100000,
            estimated_completion: '2030-01-01',
            notes: 'Test service'
        });

        expect(() => {
            customerController.deleteCustomer(customerId);
        }).toThrow(/tidak bisa dihapus karena masih memiliki riwayat tiket servis/i);
    });

    it('seharusnya dapat melakukan pagination dengan benar', () => {
        // Masukkan 5 data
        for(let i=1; i<=5; i++) {
            customerController.addCustomer({ name: `Test ${i}`, phone: `081${i}`, address: '', notes: '' });
        }
        
        // Ambil halaman 1, limit 2
        const result = customerController.getCustomers('', 1, 2);
        
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(5);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(2);
    });
});
