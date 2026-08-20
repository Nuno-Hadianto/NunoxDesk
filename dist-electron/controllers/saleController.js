"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const saleRepository = require('../repositories/saleRepository');
const partRepository = require('../repositories/partRepository');
function createSale(saleData, items) {
    // Basic validation
    if (!items || items.length === 0) {
        throw new Error("Keranjang belanja kosong");
    }
    // Verify stock
    for (const item of items) {
        const part = partRepository.getPartById(item.spare_part_id);
        if (!part) {
            throw new Error(`Sparepart ID ${item.spare_part_id} tidak ditemukan`);
        }
        if (part.stock < item.quantity) {
            throw new Error(`Stok tidak cukup untuk ${part.name}. Sisa stok: ${part.stock}`);
        }
    }
    // Generate invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    saleData.invoice_number = `INV-${dateStr}-${random}`;
    // Calculate total if not provided
    if (!saleData.total_amount) {
        let total = 0;
        for (const item of items) {
            total += item.price * item.quantity;
        }
        saleData.total_amount = total;
    }
    return saleRepository.createSale(saleData, items);
}
function getSales(startDate, endDate) {
    return saleRepository.getSales(startDate, endDate);
}
function getSaleItems(saleId) {
    return saleRepository.getSaleItems(saleId);
}
module.exports = {
    createSale,
    getSales,
    getSaleItems
};
