process.env.NODE_ENV = 'test';
const db = require('../database/db');
const userController = require('../controllers/userController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const partController = require('../controllers/partController');
const dashboardController = require('../controllers/dashboardController');

describe('Backend Integration Tests', () => {

    afterAll(() => {
        // Tutup koneksi database setelah semua tes selesai
        if (db && db.open) {
            db.close();
        }
    });

    describe('User Controller', () => {
        it('seharusnya memiliki 1 default admin', () => {
            const users = userController.getUsers();
            expect(users).toHaveLength(1);
            expect(users[0].username).toBe('admin');
        });

        it('seharusnya bisa membuat user teknisi baru', () => {
            const teknisiId = userController.addUser({ username: 'joko', password: '123', role: 'teknisi' });
            expect(teknisiId).toBeDefined();
            expect(teknisiId).toBeGreaterThan(0);
        });

        it('seharusnya bisa login dengan username dan password yang benar', () => {
            const user = userController.login('joko', '123');
            expect(user.username).toBe('joko');
        });

        it('seharusnya gagal login jika password salah', () => {
            expect(() => {
                userController.login('joko', 'wrong');
            }).toThrow(/salah/);
        });

        it('tidak boleh menghapus admin terakhir', () => {
            const users = userController.getUsers();
            const adminUser = users.find(u => u.username === 'admin');
            
            expect(() => {
                userController.deleteUser(adminUser.id);
            }).toThrow(/Admin terakhir/i);
        });
    });

    describe('Customer & Device Controller', () => {
        let customerId;

        it('seharusnya bisa menambahkan pelanggan baru', () => {
            customerId = customerController.addCustomer({ 
                name: 'Budi', 
                phone: '0812', 
                address: 'Jakarta', 
                notes: '' 
            });
            expect(customerId).toBeGreaterThan(0);
        });

        it('seharusnya bisa menambahkan perangkat untuk pelanggan tersebut', () => {
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
            expect(deviceId).toBeGreaterThan(0);
        });
    });

    describe('Part Controller', () => {
        let partId;

        it('seharusnya bisa menambahkan part/suku cadang baru', () => {
            partId = partController.addPart({
                part_code: 'P001',
                name: 'RAM 8GB',
                category: 'Memory',
                unit: 'Pcs',
                stock: 10,
                buy_price: 200000,
                sell_price: 350000,
                notes: ''
            });
            expect(partId).toBeGreaterThan(0);
        });

        it('seharusnya bisa mengupdate stok', () => {
            partController.updatePartStock(partId, -2);
            const updatedPart = partController.getPartById(partId);
            expect(updatedPart.stock).toBe(8);
        });
    });

    describe('Dashboard Controller', () => {
        it('seharusnya bisa mengambil statistik dashboard dengan benar', () => {
            const stats = dashboardController.getDashboardStats();
            expect(stats).toBeDefined();
            expect(stats.todayServices).toBeDefined();
            expect(stats.todayServices).toBeGreaterThanOrEqual(0);
        });
    });
});
