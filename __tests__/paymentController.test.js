const db = require('../database/db');
const paymentController = require('../controllers/paymentController');
const serviceController = require('../controllers/serviceController');
const customerController = require('../controllers/customerController');
const deviceController = require('../controllers/deviceController');

describe('paymentController (White-box testing)', () => {
    let testServiceId;

    beforeAll(() => {
        // Prepare dummy relational data
        const customerId = customerController.addCustomer({name: 'Test Customer', phone: '123'});
        const deviceId = deviceController.addDevice({customer_id: customerId, device_type: 'Laptop', brand: 'Acer'});
        
        // Add a service order
        testServiceId = serviceController.addService({
            customer_id: customerId,
            device_id: deviceId,
            customer_complaint: 'Rusak',
            estimated_cost: 0
        });
    });

    beforeEach(() => {
        db.exec('DELETE FROM payments');
        // Reset service total cost and payment status
        db.prepare(`UPDATE service_orders SET total_cost = 500000, payment_status = 'Belum Bayar' WHERE id = ?`).run(testServiceId);
    });

    test('addPayment should calculate total paid and update payment_status to DP / Sebagian if underpaid', () => {
        const paymentData = {
            service_order_id: testServiceId,
            amount: 200000,
            payment_method: 'Tunai',
            notes: 'DP Awal'
        };

        const result = paymentController.addPayment(paymentData);
        expect(typeof result).toBe('number');

        // Check if payment status is updated
        const service = serviceController.getServiceById(testServiceId);
        expect(service.payment_status).toBe('DP / Sebagian');
    });

    test('addPayment should update payment_status to Lunas if fully paid', () => {
        const paymentData = {
            service_order_id: testServiceId,
            amount: 500000,
            payment_method: 'Transfer',
            notes: 'Pelunasan langsung'
        };

        paymentController.addPayment(paymentData);

        // Check if payment status is updated
        const service = serviceController.getServiceById(testServiceId);
        expect(service.payment_status).toBe('Lunas');
    });

    test('addPayment with multiple payments accumulating to Lunas', () => {
        // DP 1
        paymentController.addPayment({
            service_order_id: testServiceId, amount: 200000, payment_method: 'Tunai', notes: 'DP 1'
        });
        expect(serviceController.getServiceById(testServiceId).payment_status).toBe('DP / Sebagian');

        // DP 2
        paymentController.addPayment({
            service_order_id: testServiceId, amount: 100000, payment_method: 'Tunai', notes: 'DP 2'
        });
        expect(serviceController.getServiceById(testServiceId).payment_status).toBe('DP / Sebagian');

        // Pelunasan
        paymentController.addPayment({
            service_order_id: testServiceId, amount: 200000, payment_method: 'Tunai', notes: 'Pelunasan'
        });
        expect(serviceController.getServiceById(testServiceId).payment_status).toBe('Lunas');
    });
});
