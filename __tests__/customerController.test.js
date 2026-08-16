const db = require('../database/db');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');

describe('Customer & Device Controller Integration Tests', () => {
    beforeEach(() => {
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
});
