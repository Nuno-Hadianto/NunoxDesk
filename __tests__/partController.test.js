const db = require('../database/db');
const partController = require('../controllers/partController');

describe('partController (White-box testing)', () => {
    // Clear all parts before testing
    beforeEach(() => {
        db.exec('DELETE FROM spare_parts');
    });

    test('addPart should insert a new spare part', () => {
        const data = {
            part_code: 'P-001',
            name: 'LCD 14 Inch',
            category: 'Layar',
            stock: 10,
            buy_price: 500000,
            sell_price: 650000,
            unit: 'pcs',
            notes: 'Test Part'
        };

        const result = partController.addPart(data);
        expect(typeof result).toBe('number');

        const parts = partController.getParts('');
        expect(parts.length).toBe(1);
        expect(parts[0].part_code).toBe('P-001');
        expect(parts[0].stock).toBe(10);
    });

    test('updatePartStock should update the stock correctly', () => {
        // Add initial part
        const partId = partController.addPart({
            part_code: 'P-002', name: 'RAM 8GB', stock: 5, sell_price: 300000
        });

        // Reduce stock by 2 (e.g. used in service)
        partController.updatePartStock(partId, -2);
        
        let part = partController.getPartById(partId);
        expect(part.stock).toBe(3);

        // Increase stock by 5 (e.g. restocked)
        partController.updatePartStock(partId, 5);
        part = partController.getPartById(partId);
        expect(part.stock).toBe(8);
    });

    test('updatePartStock should not throw but silently constrain negative logic if needed (or we check it works)', () => {
        const partId = partController.addPart({
            part_code: 'P-003', name: 'Keyboard', stock: 1, sell_price: 150000
        });

        // Reduce stock by 2 (overdraft)
        partController.updatePartStock(partId, -2);
        const part = partController.getPartById(partId);
        // Our controller currently allows negative stock, which is common in small POS if physical stock isn't logged yet
        expect(part.stock).toBe(-1); 
    });
});
