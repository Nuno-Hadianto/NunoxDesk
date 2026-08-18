    // SETTINGS & BACKUP LOGIC
    // ==========================================
    async function loadSettings() {
        try {
            const settings = await window.api.getSettings();
            document.getElementById('setting-business-name').value = settings.business_name || '';
            document.getElementById('setting-phone').value = settings.phone || settings.whatsapp || '';
            document.getElementById('setting-address').value = settings.address || '';
            document.getElementById('setting-footer').value = settings.receipt_footer || '';
        } catch (error) {
            console.error(error);
        }
    }

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            business_name: document.getElementById('setting-business-name').value,
            phone: document.getElementById('setting-phone').value,
            whatsapp: document.getElementById('setting-phone').value,
            address: document.getElementById('setting-address').value,
            receipt_footer: document.getElementById('setting-footer').value
        };
        try {
            await window.api.updateSettings(data);
            alert("Pengaturan berhasil disimpan.");
            loadDashboardStats();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan pengaturan.");
        }
    });

    document.getElementById('btn-backup').addEventListener('click', async () => {
        try {
            const success = await window.api.backupDatabase();
            if (success) {
                alert("Backup database berhasil!");
            }
        } catch (error) {
            console.error(error);
            alert("Gagal backup database.");
        }
    });

    document.getElementById('btn-restore').addEventListener('click', async () => {
        if (await window.customConfirm("WARNING: Restore akan menimpa semua data saat ini. Aplikasi akan ditutup dan dibuka ulang. Yakin ingin melanjutkan?")) {
            try {
                const success = await window.api.restoreDatabase();
                if (success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Restore Berhasil!',
                        text: 'Aplikasi akan dimuat ulang secara otomatis untuk menerapkan data baru...',
                        showConfirmButton: false,
                        timer: 2500
                    });
                } else {
                    console.log("Restore dibatalkan.");
                }
            } catch (error) {
                console.error(error);
                alert("Gagal restore database.");
            }
        }
    });

    // ==========================================