const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

// Inisialisasi: Cek apakah ada user, jika tidak buat default admin
function init() {
    const count = userRepository.getUserCount();
    
    if (count === 0) {
        console.log("No users found. Creating default admin...");
        const hash = bcrypt.hashSync('admin123', 10);
        userRepository.createDefaultAdmin(hash);
    }
}

// Panggil inisialisasi saat modul dimuat
init();

function login(username, password) {
    const user = userRepository.getUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error("Username atau password salah!");
    }
    
    // Remove password from user object before returning
    const { password: _, ...safeUser } = user;
    return safeUser;
}

function getUsers() {
    return userRepository.getUsers();
}

function getUserById(id) {
    return userRepository.getUserById(id);
}

function addUser(data) {
    const { username, password, role } = data;
    
    // Check if username exists
    const existing = userRepository.checkUsernameExists(username);
    if (existing) {
        throw new Error("Username sudah digunakan!");
    }

    const hash = bcrypt.hashSync(password, 10);
    return userRepository.addUser(username, hash, role);
}

function updateUser(id, data) {
    const { username, password, role } = data;
    
    // Check if username exists for OTHER users
    const existing = userRepository.checkUsernameExistsExceptId(username, id);
    if (existing) {
        throw new Error("Username sudah digunakan oleh akun lain!");
    }

    if (password && password.trim() !== '') {
        const hash = bcrypt.hashSync(password, 10);
        userRepository.updateUserWithPassword(id, username, hash, role);
    } else {
        userRepository.updateUserWithoutPassword(id, username, role);
    }
    return true;
}

function deleteUser(id) {
    // Prevent deleting the last admin
    const user = userRepository.getUserRole(id);
    if (user && user.role === 'admin') {
        const adminCount = userRepository.getAdminCount();
        if (adminCount <= 1) {
            throw new Error("Tidak dapat menghapus Admin terakhir!");
        }
    }

    return userRepository.deleteUser(id);
}

module.exports = {
    login,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
};
