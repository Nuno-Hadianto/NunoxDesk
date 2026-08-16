const db = require('../database/db');
const userController = require('../controllers/userController');

describe('User Controller Integration Tests', () => {
    beforeEach(() => {
        // Hapus semua data user terlebih dahulu
        db.exec('DELETE FROM users');
        // Saat tabel users kosong, get/add biasanya tidak memicu pembuatan admin default
        // Kecuali fungsi getUsers / initialize diakses pertama kali. 
        // Mari kita buat admin default secara manual agar sesuai dengan setup awal.
        userController.addUser({ username: 'admin', password: '123', role: 'admin' });
    });

    afterAll(() => {
        if (db && db.open) {
            db.close();
        }
    });

    it('seharusnya memiliki 1 admin setelah diinisialisasi', () => {
        const users = userController.getUsers();
        expect(users).toHaveLength(1);
        expect(users[0].username).toBe('admin');
    });

    it('seharusnya bisa membuat user teknisi baru', () => {
        const teknisiId = userController.addUser({ username: 'joko', password: '123', role: 'teknisi' });
        expect(teknisiId).toBeDefined();
        expect(teknisiId).toBeGreaterThan(0);
        
        const users = userController.getUsers();
        expect(users).toHaveLength(2);
    });

    it('seharusnya bisa login dengan username dan password yang benar', () => {
        userController.addUser({ username: 'joko', password: '123', role: 'teknisi' });
        const user = userController.login('joko', '123');
        expect(user.username).toBe('joko');
    });

    it('seharusnya gagal login jika password salah', () => {
        userController.addUser({ username: 'joko', password: '123', role: 'teknisi' });
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
