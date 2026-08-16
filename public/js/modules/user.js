    // USER MANAGEMENT
    // ==========================================
    const userList = document.getElementById('user-list');
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    
    async function loadUsers() {
        if (!window.api || !window.api.getUsers) return;
        try {
            const users = await window.api.getUsers();
            userList.innerHTML = '';
            users.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td><strong>${u.username}</strong></td>
                    <td><span style="background: ${u.role === 'admin' ? '#4f46e5' : '#10b981'}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${u.role}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="editUser(${u.id})">Edit</button>
                        ${u.id !== currentUser.id ? `<button class="btn btn-sm btn-danger delete-btn" onclick="deleteUser(${u.id})">Hapus</button>` : ''}
                    </td>
                `;
                userList.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }

    window.editUser = async (id) => {
        try {
            const user = await window.api.getUser(id);
            if (user) {
                document.getElementById('user-modal-title').textContent = 'Edit Karyawan';
                document.getElementById('user-id').value = user.id;
                document.getElementById('user-username').value = user.username;
                document.getElementById('user-password').value = '';
                document.getElementById('user-password').placeholder = '(Biarkan kosong jika tidak diubah)';
                document.getElementById('user-password').required = false;
                document.getElementById('user-role').value = user.role;
                userModal.style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.deleteUser = async (id) => {
        if (await window.customConfirm("Yakin ingin menghapus karyawan ini?")) {
            try {
                const res = await window.api.deleteUser(id);
                if (res.success) {
                    alert("Karyawan berhasil dihapus.");
                    loadUsers();
                } else {
                    alert(res.error || "Gagal menghapus.");
                }
            } catch (err) {
                console.error(err);
                alert("Gagal menghapus.");
            }
        }
    };

    document.getElementById('btn-add-user').addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Tambah Karyawan';
        userForm.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-password').placeholder = 'Masukkan password';
        document.getElementById('user-password').required = true;
        userModal.style.display = 'flex';
    });

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const data = {
            username: document.getElementById('user-username').value,
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value
        };

        try {
            if (id) {
                const res = await window.api.updateUser(id, data);
                if (res.success) {
                    userModal.style.display = 'none';
                    loadUsers();
                } else {
                    alert(res.error || "Gagal menyimpan.");
                }
            } else {
                const res = await window.api.addUser(data);
                if (res.success) {
                    userModal.style.display = 'none';
                    loadUsers();
                } else {
                    alert(res.error || "Gagal menyimpan.");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan data.");
        }
    });