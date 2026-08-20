"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = exports.PaymentSchema = exports.ServiceItemSchema = exports.ServiceOrderSchema = exports.DeviceSchema = exports.SparepartSchema = exports.CustomerSchema = void 0;
const zod_1 = require("zod");
exports.CustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nama pelanggan wajib diisi.').max(100, 'Nama terlalu panjang.'),
    phone: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.SparepartSchema = zod_1.z.object({
    part_code: zod_1.z.string().optional().nullable(),
    name: zod_1.z.string().min(1, 'Nama sparepart wajib diisi.').max(150, 'Nama terlalu panjang.'),
    category: zod_1.z.string().optional().nullable(),
    stock: zod_1.z.number().int('Stok harus berupa bilangan bulat.').min(0, 'Stok tidak boleh negatif.'),
    buy_price: zod_1.z.number().min(0, 'Harga beli tidak boleh negatif.').optional().default(0),
    sell_price: zod_1.z.number().min(0, 'Harga jual tidak boleh negatif.').optional().default(0),
    unit: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.DeviceSchema = zod_1.z.object({
    customer_id: zod_1.z.number().int('ID Pelanggan tidak valid.'),
    device_type: zod_1.z.string().min(1, 'Jenis perangkat wajib diisi.'),
    brand: zod_1.z.string().optional().nullable(),
    model: zod_1.z.string().optional().nullable(),
    serial_number: zod_1.z.string().optional().nullable(),
    color: zod_1.z.string().optional().nullable(),
    accessories: zod_1.z.string().optional().nullable(),
    physical_condition: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.ServiceOrderSchema = zod_1.z.object({
    customer_id: zod_1.z.number().int('ID Pelanggan tidak valid.'),
    device_id: zod_1.z.number().int('ID Perangkat tidak valid.'),
    estimated_completion_date: zod_1.z.string().optional().nullable(),
    technician: zod_1.z.string().optional().nullable(),
    customer_complaint: zod_1.z.string().optional().nullable(),
    diagnosis_result: zod_1.z.string().optional().nullable(),
    actions_taken: zod_1.z.string().optional().nullable(),
    technician_notes: zod_1.z.string().optional().nullable(),
    estimated_cost: zod_1.z.number().min(0, 'Estimasi biaya tidak boleh negatif.').default(0),
});
exports.ServiceItemSchema = zod_1.z.object({
    service_order_id: zod_1.z.number().int('ID Servis tidak valid.'),
    item_type: zod_1.z.enum(['Jasa', 'Sparepart', 'Biaya lainnya', 'Diskon'], {
        message: 'Jenis item tidak valid.'
    }),
    spare_part_id: zod_1.z.number().int().optional().nullable(),
    description: zod_1.z.string().min(1, 'Deskripsi wajib diisi.'),
    quantity: zod_1.z.number().int('Kuantitas harus berupa bilangan bulat.').min(1, 'Kuantitas minimal 1.'),
    price: zod_1.z.number().min(0, 'Harga tidak boleh negatif.'),
});
exports.PaymentSchema = zod_1.z.object({
    service_order_id: zod_1.z.number().int('ID Servis tidak valid.'),
    amount: zod_1.z.number().min(1, 'Jumlah pembayaran minimal 1.'),
    payment_method: zod_1.z.string().min(1, 'Metode pembayaran wajib diisi.'),
    notes: zod_1.z.string().optional().nullable(),
});
const validateData = (schema, data) => {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Flatten error messages to a single readable string
            const errMessages = error.issues.map((err) => err.message).join(' | ');
            throw new Error(`Validasi Gagal: ${errMessages}`);
        }
        throw error;
    }
};
exports.validateData = validateData;
