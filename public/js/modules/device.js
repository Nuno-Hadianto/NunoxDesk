    // DEVICE LOGIC
    // ==========================================
    const deviceModal = document.getElementById('device-modal');
    const deviceForm = document.getElementById('device-form');

    // Close device modal handled by generic close-modal handler

    async function loadCustomersDropdown(selectedId = null) {
        if (window.api && window.api.getCustomers) {
            const customers = await window.api.getCustomers();
            const select = document.getElementById('device-customer-id');
            select.innerHTML = '<option value="">-- Pilih Pelanggan --</option>';
            customers.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.name} (${c.phone || '-'})`;
                if (selectedId && c.id == selectedId) option.selected = true;
                select.appendChild(option);
            });
        }
    }

    document.getElementById('btn-add-device').addEventListener('click', async () => {
        document.getElementById('device-modal-title').textContent = 'Tambah Perangkat';
        deviceForm.reset();
        document.getElementById('device-id').value = '';
        await loadCustomersDropdown();
        deviceModal.classList.add('show');
    });

    async function loadDevices(searchQuery = '') {
        if (window.api && window.api.getDevices) {
            try {
                const devices = await window.api.getDevices(searchQuery);
                const tbody = document.getElementById('device-list');
                tbody.innerHTML = '';
                
                devices.forEach(device => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${device.id}</td>
                        <td>${device.customer_name}</td>
                        <td>${device.brand || '-'} / ${device.model || '-'}</td>
                        <td>${device.device_type}</td>
                        <td>${device.serial_number || '-'}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editDevice(${device.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteDevice(${device.id})">Hapus</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error("Failed to load devices:", error);
            }
        }
    }

    document.getElementById('search-device').addEventListener('input', debounce((e) => {
        loadDevices(e.target.value);
    }, 300));

    deviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('device-id').value;
        const data = {
            customer_id: document.getElementById('device-customer-id').value,
            device_type: document.getElementById('device-type').value,
            brand: document.getElementById('device-brand').value,
            model: document.getElementById('device-model').value,
            serial_number: document.getElementById('device-serial').value,
            color: document.getElementById('device-color').value,
            accessories: document.getElementById('device-accessories').value,
            physical_condition: document.getElementById('device-condition').value,
            notes: document.getElementById('device-notes').value
        };

        try {
            if (id) {
                await window.api.updateDevice(id, data);
            } else {
                await window.api.addDevice(data);
            }
            deviceModal.classList.remove('show');
            loadDevices(document.getElementById('search-device').value);
        } catch (error) {
            console.error("Error saving device:", error);
            alert("Gagal menyimpan data perangkat.");
        }
    });

    window.editDevice = async (id) => {
        try {
            const device = await window.api.getDevice(id);
            if (device) {
                document.getElementById('device-modal-title').textContent = 'Edit Perangkat';
                document.getElementById('device-id').value = device.id;
                
                await loadCustomersDropdown(device.customer_id);

                document.getElementById('device-type').value = device.device_type;
                document.getElementById('device-brand').value = device.brand;
                document.getElementById('device-model').value = device.model;
                document.getElementById('device-serial').value = device.serial_number;
                document.getElementById('device-color').value = device.color;
                document.getElementById('device-accessories').value = device.accessories;
                document.getElementById('device-condition').value = device.physical_condition;
                document.getElementById('device-notes').value = device.notes;
                
                deviceModal.classList.add('show');
            }
        } catch (error) {
            console.error(error);
        }
    };

    window.deleteDevice = async (id) => {
        if (await window.customConfirm("Apakah Anda yakin ingin menghapus perangkat ini?")) {
            try {
                await window.api.deleteDevice(id);
                loadDevices(document.getElementById('search-device').value);
            } catch (error) {
                console.error(error);
                let msg = "Gagal menghapus data.";
                if (error.message) {
                    msg = error.message.split('Error:').pop().trim();
                }
                alert(msg);
            }
        }
    };

    // ==========================================