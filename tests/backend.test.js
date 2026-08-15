process.env.NODE_ENV = 'test';
const assert = require('assert');
const db = require('../database/db');
const userController = require('../controllers/userController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');
const partController = require('../controllers/partController');
const dashboardController = require('../controllers/dashboardController');

async function runTests() {
    console.log("Starting integration tests...");

    // 1. User Controller
    console.log("Testing userController...");
    // userController already inserts a default 'admin' on initialization
    const users = userController.getUsers();
    assert.strictEqual(users.length, 1, "Should have 1 default admin user");
    assert.strictEqual(users[0].username, 'admin');

    const teknisi = userController.addUser({ username: 'joko', password: '123', role: 'teknisi' });
    assert.ok(teknisi > 0 || teknisi.id > 0 || teknisi !== undefined, "Teknisi user created");
    
    let loginOk = userController.login('joko', '123');
    assert.strictEqual(loginOk.username, 'joko', "Login successful");
    
    assert.throws(() => {
        userController.login('joko', 'wrong');
    }, /salah/, "Wrong password should throw");

    // Test admin deletion protection
    assert.throws(() => {
        userController.deleteUser(users[0].id);
    }, /Admin terakhir/i, "Cannot delete last admin");

    // 2. Customer & Device Controller
    console.log("Testing customerController & deviceController...");
    const customer = customerController.addCustomer({ name: 'Budi', phone: '0812', address: 'Jakarta', notes: '' });
    assert.ok(customer > 0, "Customer created");

    const device = deviceController.addDevice({
        customer_id: customer,
        device_type: 'Laptop',
        brand: 'Asus',
        model: 'ROG',
        serial_number: 'SN123',
        color: 'Black',
        accessories: 'Charger',
        physical_condition: 'Good',
        notes: ''
    });
    assert.ok(device > 0, "Device created");

    // 3. Parts Controller
    console.log("Testing partController...");
    const part = partController.addPart({
        part_code: 'P001',
        name: 'RAM 8GB',
        category: 'Memory',
        unit: 'Pcs',
        stock: 10,
        buy_price: 200000,
        sell_price: 350000,
        notes: ''
    });
    assert.ok(part > 0, "Part created");
    
    partController.updatePartStock(part, -2);
    const updatedPart = partController.getPartById(part);
    assert.strictEqual(updatedPart.stock, 8, "Stock updated to 8");

    // 4. Dashboard Controller
    console.log("Testing dashboardController...");
    const stats = dashboardController.getDashboardStats();
    assert.strictEqual(stats.todayServices, 0, "Dashboard has 0 todayServices");

    console.log("✅ All tests passed successfully!");
}

runTests().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
