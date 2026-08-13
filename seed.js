const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Menggunakan path DB dari log saat aplikasi berjalan
const dbPath = 'C:\\Users\\Nuno\\AppData\\Roaming\\Electron\\database\\nunox_servis.db';

if (!fs.existsSync(dbPath)) {
    console.error('Database tidak ditemukan di:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

console.log('Memasukkan data dummy ke:', dbPath);

db.transaction(() => {
    // 1. Pelanggan
    const insertCustomer = db.prepare('INSERT INTO customers (name, phone, address, notes) VALUES (?, ?, ?, ?)');
    const c1 = insertCustomer.run('Budi Santoso', '081234567890', 'Jl. Merdeka No. 1, Jakarta', 'Pelanggan lama').lastInsertRowid;
    const c2 = insertCustomer.run('Siti Aminah', '085612345678', 'Jl. Sudirman No. 10, Bandung', 'VIP Customer').lastInsertRowid;
    const c3 = insertCustomer.run('Andi Wijaya', '087811223344', 'Jl. Gatot Subroto, Surabaya', '').lastInsertRowid;

    // 2. Perangkat
    const insertDevice = db.prepare('INSERT INTO devices (customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const d1 = insertDevice.run(c1, 'Laptop', 'Asus', 'ROG Zephyrus G14', 'SN123456', 'Putih', 'Charger, Tas', 'Lecet pemakaian', 'Sering panas').lastInsertRowid;
    const d2 = insertDevice.run(c2, 'PC Desktop', 'Rakitan', 'Core i5 12th Gen', '-', 'Hitam', 'Kabel Power', 'Mulus', 'Sering BSOD').lastInsertRowid;
    const d3 = insertDevice.run(c3, 'Laptop', 'Lenovo', 'ThinkPad T480', 'PF123XXX', 'Hitam', 'Charger', 'Baret di sudut', 'Keyboard beberapa tombol mati').lastInsertRowid;

    // 3. Sparepart
    const insertPart = db.prepare('INSERT INTO spare_parts (part_code, name, category, stock, buy_price, sell_price, unit, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const sp1 = insertPart.run('RAM-8GB-DDR4', 'RAM Kingston 8GB DDR4', 'Memori', 10, 300000, 450000, 'Pcs', 'Garansi Lifetime').lastInsertRowid;
    const sp2 = insertPart.run('SSD-512GB-NVME', 'SSD Samsung 970 EVO Plus 512GB', 'Penyimpanan', 5, 800000, 1100000, 'Pcs', 'Garansi 5 Tahun').lastInsertRowid;
    const sp3 = insertPart.run('PASTA-PROC', 'Thermal Paste Grizzly', 'Bahan Habis Pakai', 20, 50000, 150000, 'Tube', '').lastInsertRowid;
    const sp4 = insertPart.run('KB-TP-T480', 'Keyboard Lenovo ThinkPad T480', 'Keyboard', 2, 450000, 650000, 'Pcs', 'Original Copotan').lastInsertRowid;

    // 4. Tiket Servis (Service Orders)
    const insertService = db.prepare(`
        INSERT INTO service_orders (ticket_number, customer_id, device_id, technician, customer_complaint, diagnosis_result, actions_taken, estimated_cost, service_status, payment_status, total_cost) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const year = new Date().getFullYear();
    const so1 = insertService.run(`NSV-${year}-0001`, c1, d1, 'Teknisi A', 'Laptop sering mati sendiri saat main game', 'Overheating, Thermal paste kering', 'Pembersihan debu, Repasta', 300000, 'Dikerjakan', 'Belum Bayar', 300000).lastInsertRowid;
    const so2 = insertService.run(`NSV-${year}-0002`, c2, d2, 'Teknisi B', 'Windows bluescreen terus menerus', 'SSD lama rusak', 'Ganti SSD, Install Ulang Windows', 1300000, 'Selesai', 'Lunas', 1300000).lastInsertRowid;
    const so3 = insertService.run(`NSV-${year}-0003`, c3, d3, 'Teknisi A', 'Keyboard huruf A, S, D, W tidak berfungsi', 'Jalur fleksibel keyboard putus', 'Ganti Keyboard', 750000, 'Diterima', 'Belum Bayar', 0).lastInsertRowid;

    // 5. Rincian Servis (Service Items)
    const insertServiceItem = db.prepare(`
        INSERT INTO service_items (service_order_id, item_type, spare_part_id, description, quantity, price, cost_price, total) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // SO1 (Pembersihan + Repasta)
    insertServiceItem.run(so1, 'Jasa', null, 'Jasa Pembersihan & Repasta', 1, 150000, 0, 150000);
    insertServiceItem.run(so1, 'Sparepart', sp3, 'Thermal Paste Grizzly', 1, 150000, 50000, 150000);

    // SO2 (Ganti SSD + Install OS)
    insertServiceItem.run(so2, 'Sparepart', sp2, 'SSD Samsung 970 EVO Plus 512GB', 1, 1100000, 800000, 1100000);
    insertServiceItem.run(so2, 'Jasa', null, 'Jasa Install Ulang Windows 11', 1, 200000, 0, 200000);

    // SO3 (Ganti Keyboard - masih diterima, baru estimasi)
    insertServiceItem.run(so3, 'Sparepart', sp4, 'Keyboard Lenovo ThinkPad T480', 1, 650000, 450000, 650000);
    insertServiceItem.run(so3, 'Jasa', null, 'Jasa Pasang Keyboard', 1, 100000, 0, 100000);
    db.prepare('UPDATE service_orders SET total_cost = 750000 WHERE id = ?').run(so3);

    // 6. Histori Status
    const insertHistory = db.prepare(`INSERT INTO service_status_history (service_order_id, status, notes) VALUES (?, ?, ?)`);
    insertHistory.run(so1, 'Diterima', 'Barang diterima di toko');
    insertHistory.run(so1, 'Dikerjakan', 'Mulai dibongkar');
    
    insertHistory.run(so2, 'Diterima', 'Barang diterima di toko');
    insertHistory.run(so2, 'Dikerjakan', 'Proses install ulang');
    insertHistory.run(so2, 'Selesai', 'Sudah bisa diambil');
    
    insertHistory.run(so3, 'Diterima', 'Keyboard dipesan ke supplier');

    // 7. Pembayaran (Hanya SO2 yang sudah lunas)
    const insertPayment = db.prepare(`
        INSERT INTO payments (service_order_id, payment_number, amount, payment_method, notes) 
        VALUES (?, ?, ?, ?, ?)
    `);
    insertPayment.run(so2, 'PAY-' + year + '-0001', 1300000, 'Transfer Bank', 'Lunas via BCA');

})();

console.log('✅ Data dummy berhasil ditambahkan!');
