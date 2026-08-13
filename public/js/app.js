document.addEventListener('DOMContentLoaded', () => {
    // Update Datetime
    const datetimeDisplay = document.getElementById('datetime-display');
    const updateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        datetimeDisplay.textContent = now.toLocaleDateString('id-ID', options);
    };
    
    updateTime();
    setInterval(updateTime, 60000);

    // Simple routing / navigation highlighting for now
    const navLinks = document.querySelectorAll('.sidebar-nav li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.id) {
                // Remove active class from all
                document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
                // Add to clicked
                e.target.parentElement.classList.add('active');
                
                // Update title
                document.getElementById('page-title').textContent = e.target.textContent;
                
                // Switch View
                switchView(e.target.id);
            }
        });
    });

    function switchView(navId) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(view => {
            view.style.display = 'none';
        });

        if (navId === 'nav-dashboard') {
            document.getElementById('view-dashboard').style.display = 'block';
            loadDashboardStats();
        } else if (navId === 'nav-customers') {
            document.getElementById('view-customers').style.display = 'block';
            loadCustomers();
        } else if (navId === 'nav-devices') {
            document.getElementById('view-devices').style.display = 'block';
            loadDevices();
        } else if (navId === 'nav-services') {
            document.getElementById('view-services').style.display = 'block';
            loadServices();
        } else if (navId === 'nav-parts') {
            document.getElementById('view-parts').style.display = 'block';
            loadParts();
        } else if (navId === 'nav-reports') {
            document.getElementById('view-reports').style.display = 'block';
            initReports();
        } else if (navId === 'nav-settings') {
            document.getElementById('view-settings').style.display = 'block';
            loadSettings();
        } else if (navId === 'nav-backup') {
            document.getElementById('view-backup').style.display = 'block';
        }
    }

    // Load Dashboard Stats
    async function loadDashboardStats() {
        if (window.api && window.api.getDashboardStats) {
            try {
                const stats = await window.api.getDashboardStats();
                const statValues = document.querySelectorAll('.stat-value');
                if (statValues.length >= 4) {
                    statValues[0].textContent = stats.todayServices;
                    statValues[1].textContent = stats.inProgress;
                    statValues[2].textContent = stats.completed;
                    
                    // Format currency
                    const formattedIncome = new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                    }).format(stats.incomeMonth);
                    
                    statValues[3].textContent = formattedIncome;
                }
            } catch (error) {
                console.error("Failed to load stats:", error);
            }
        }
    }

    // Initial load
    loadDashboardStats();

    // ==========================================
    // CUSTOMER LOGIC
    // ==========================================
    const customerModal = document.getElementById('customer-modal');
    const customerForm = document.getElementById('customer-form');
    
    // Close modal handlers
    document.querySelectorAll('.close-modal').forEach(el => {
        el.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Open add modal
    document.getElementById('btn-add-customer').addEventListener('click', () => {
        document.getElementById('customer-modal-title').textContent = 'Tambah Pelanggan';
        customerForm.reset();
        document.getElementById('customer-id').value = '';
        customerModal.classList.add('show');
    });

    // Load Customers
    async function loadCustomers(searchQuery = '') {
        if (window.api && window.api.getCustomers) {
            try {
                const customers = await window.api.getCustomers(searchQuery);
                const tbody = document.getElementById('customer-list');
                tbody.innerHTML = '';
                
                customers.forEach(customer => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${customer.id}</td>
                        <td>${customer.name}</td>
                        <td>${customer.phone || '-'}</td>
                        <td>${customer.address || '-'}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editCustomer(${customer.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">Hapus</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error("Failed to load customers:", error);
            }
        }
    }

    // Search Customers
    document.getElementById('search-customer').addEventListener('input', (e) => {
        loadCustomers(e.target.value);
    });

    // Save Customer
    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('customer-id').value;
        const data = {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value,
            notes: document.getElementById('customer-notes').value
        };

        try {
            if (id) {
                await window.api.updateCustomer(id, data);
            } else {
                await window.api.addCustomer(data);
            }
            customerModal.classList.remove('show');
            loadCustomers(document.getElementById('search-customer').value);
        } catch (error) {
            console.error("Error saving customer:", error);
            alert("Gagal menyimpan data pelanggan.");
        }
    });

    // Attach to window for inline onclick
    window.editCustomer = async (id) => {
        try {
            const customer = await window.api.getCustomer(id);
            if (customer) {
                document.getElementById('customer-modal-title').textContent = 'Edit Pelanggan';
                document.getElementById('customer-id').value = customer.id;
                document.getElementById('customer-name').value = customer.name;
                document.getElementById('customer-phone').value = customer.phone;
                document.getElementById('customer-address').value = customer.address;
                document.getElementById('customer-notes').value = customer.notes;
                customerModal.classList.add('show');
            }
        } catch (error) {
            console.error(error);
        }
    };

    window.deleteCustomer = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
            try {
                await window.api.deleteCustomer(id);
                loadCustomers(document.getElementById('search-customer').value);
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

    document.getElementById('search-device').addEventListener('input', (e) => {
        loadDevices(e.target.value);
    });

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
        if (confirm("Apakah Anda yakin ingin menghapus perangkat ini?")) {
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
    // SERVICE LOGIC
    // ==========================================
    const serviceModal = document.getElementById('service-modal');
    const serviceForm = document.getElementById('service-form');

    document.getElementById('btn-add-service').addEventListener('click', async () => {
        serviceForm.reset();
        await loadServiceCustomersDropdown();
        document.getElementById('service-device-id').innerHTML = '<option value="">-- Pilih Pelanggan Terlebih Dahulu --</option>';
        serviceModal.classList.add('show');
    });

    async function loadServiceCustomersDropdown() {
        if (window.api && window.api.getCustomers) {
            const customers = await window.api.getCustomers();
            const select = document.getElementById('service-customer-id');
            select.innerHTML = '<option value="">-- Pilih Pelanggan --</option>';
            customers.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.name} (${c.phone || '-'})`;
                select.appendChild(option);
            });
        }
    }

    document.getElementById('service-customer-id').addEventListener('change', async (e) => {
        const customerId = e.target.value;
        const deviceSelect = document.getElementById('service-device-id');
        if (!customerId) {
            deviceSelect.innerHTML = '<option value="">-- Pilih Pelanggan Terlebih Dahulu --</option>';
            return;
        }

        if (window.api && window.api.getDevicesByCustomer) {
            const devices = await window.api.getDevicesByCustomer(customerId);
            deviceSelect.innerHTML = '<option value="">-- Pilih Perangkat --</option>';
            devices.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.textContent = `${d.brand || ''} ${d.model || ''} - ${d.device_type} (SN: ${d.serial_number || '-'})`;
                deviceSelect.appendChild(option);
            });
        }
    });

    async function loadServices(searchQuery = '') {
        if (window.api && window.api.getServices) {
            try {
                const services = await window.api.getServices(searchQuery);
                const tbody = document.getElementById('service-list');
                tbody.innerHTML = '';
                
                services.forEach(service => {
                    const tr = document.createElement('tr');
                    
                    // Format currency
                    const formattedCost = new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                    }).format(service.total_cost || 0);

                    tr.innerHTML = `
                        <td><strong>${service.ticket_number}</strong></td>
                        <td>${service.customer_name}</td>
                        <td>${service.brand || ''} ${service.model || ''}</td>
                        <td><span style="padding: 4px 8px; border-radius: 4px; background: #e2e8f0; font-size: 0.85rem; font-weight: 500;">${service.service_status}</span></td>
                        <td>${formattedCost}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="openServiceDetail(${service.id})">Detail</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error("Failed to load services:", error);
            }
        }
    }

    document.getElementById('search-service').addEventListener('input', (e) => {
        loadServices(e.target.value);
    });

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            customer_id: document.getElementById('service-customer-id').value,
            device_id: document.getElementById('service-device-id').value,
            customer_complaint: document.getElementById('service-complaint').value,
            technician: document.getElementById('service-technician').value,
            estimated_cost: document.getElementById('service-estimate-cost').value,
            estimated_completion_date: null
        };

        try {
            await window.api.addService(data);
            serviceModal.classList.remove('show');
            loadServices();
            loadDashboardStats();
        } catch (error) {
            console.error("Error creating service:", error);
            alert("Gagal membuat tiket servis.");
        }
    });

    window.openServiceDetail = async (id) => {
        try {
            const service = await window.api.getService(id);
            if (service) {
                document.getElementById('view-services').style.display = 'none';
                document.getElementById('view-service-detail').style.display = 'block';
                
                document.getElementById('detail-ticket-number').textContent = service.ticket_number;
                document.getElementById('detail-customer').textContent = `${service.customer_name} (${service.customer_phone || '-'})`;
                document.getElementById('detail-device').textContent = `${service.brand || ''} ${service.model || ''} - ${service.device_type} (SN: ${service.serial_number || '-'})`;
                document.getElementById('detail-complaint').textContent = service.customer_complaint;
                
                document.getElementById('detail-diagnosis').value = service.diagnosis_result || '';
                document.getElementById('detail-actions').value = service.actions_taken || '';
                document.getElementById('detail-notes').value = service.technician_notes || '';
                
                document.getElementById('detail-status-badge').textContent = service.service_status.toUpperCase();
                
                // Set data-id to save button
                document.getElementById('btn-save-detail').dataset.id = id;
                document.getElementById('btn-update-status').dataset.id = id;
                
                // Set data-id for item form
                document.getElementById('btn-add-item').dataset.id = id;
                
                // Payment tracking variables for this service
                window.currentServiceTotalCost = service.total_cost || 0;
                
                await loadServiceHistory(id);
                await loadServiceItems(id);
                await loadPartsDropdown();
                await loadServicePayments(id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    async function loadServiceItems(id) {
        if (window.api && window.api.getServiceItems) {
            try {
                const items = await window.api.getServiceItems(id);
                const tbody = document.getElementById('detail-items-list');
                tbody.innerHTML = '';
                let grandTotal = 0;
                
                items.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                    }).format(val);

                    grandTotal += item.total;
                    
                    let desc = item.description;
                    if (item.item_type === 'Sparepart') {
                        desc = item.part_name || desc;
                    }
                    if (item.item_type === 'Diskon') {
                        tr.style.color = 'red';
                    }

                    tr.innerHTML = `
                        <td>${item.item_type}</td>
                        <td>${desc}</td>
                        <td>${item.quantity}</td>
                        <td>${formatRp(item.price)}</td>
                        <td>${formatRp(item.total)}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteServiceItem(${item.id}, ${id})">X</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                document.getElementById('detail-grand-total').textContent = new Intl.NumberFormat('id-ID', {
                    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(grandTotal);
            } catch (error) {
                console.error(error);
            }
        }
    }

    window.deleteServiceItem = async (itemId, serviceId) => {
        if (confirm('Hapus item ini?')) {
            try {
                await window.api.deleteServiceItem(itemId);
                await loadServiceItems(serviceId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    async function loadPartsDropdown() {
        if (window.api && window.api.getParts) {
            try {
                const parts = await window.api.getParts();
                const select = document.getElementById('item-part-id');
                select.innerHTML = '<option value="">-- Pilih Sparepart --</option>';
                window.partsData = parts; // cache for auto-fill price
                parts.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = `${p.name} (Stok: ${p.stock})`;
                    if (p.stock <= 0) {
                        opt.disabled = true;
                    }
                    select.appendChild(opt);
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    document.getElementById('item-type').addEventListener('change', (e) => {
        const type = e.target.value;
        const partSelect = document.getElementById('item-part-id');
        const descInput = document.getElementById('item-desc');
        
        if (type === 'Sparepart') {
            partSelect.style.display = 'block';
            descInput.style.display = 'none';
        } else {
            partSelect.style.display = 'none';
            descInput.style.display = 'block';
        }
    });

    document.getElementById('item-part-id').addEventListener('change', (e) => {
        const partId = parseInt(e.target.value, 10);
        if (window.partsData && partId) {
            const part = window.partsData.find(p => p.id === partId);
            if (part) {
                document.getElementById('item-price').value = part.sell_price;
            }
        }
    });

    document.getElementById('btn-add-item').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const type = document.getElementById('item-type').value;
        let partId = null;
        let desc = document.getElementById('item-desc').value;
        
        if (type === 'Sparepart') {
            partId = document.getElementById('item-part-id').value;
            if (!partId) return alert('Pilih sparepart!');
            desc = 'Sparepart ID: ' + partId; // fallback
        } else {
            if (!desc) return alert('Keterangan wajib diisi!');
        }

        const qty = parseInt(document.getElementById('item-qty').value, 10);
        const price = parseFloat(document.getElementById('item-price').value);

        if (!qty || !price) return alert('Quantity dan Harga harus diisi dengan benar.');

        const data = {
            service_order_id: id,
            item_type: type,
            spare_part_id: partId || null,
            description: desc,
            quantity: qty,
            price: price
        };

        try {
            await window.api.addServiceItem(data);
            
            // reset form
            document.getElementById('item-desc').value = '';
            document.getElementById('item-qty').value = '1';
            document.getElementById('item-price').value = '';
            document.getElementById('item-part-id').value = '';
            
            await loadServiceItems(id);
            if (type === 'Sparepart') {
                await loadPartsDropdown(); // refresh stock
            }
        } catch (error) {
            console.error(error);
            alert("Gagal menambahkan item. (Mungkin stok tidak cukup)");
        }
    });

    async function loadServiceHistory(id) {
        if (window.api && window.api.getServiceHistory) {
            try {
                const history = await window.api.getServiceHistory(id);
                const ul = document.getElementById('detail-history');
                ul.innerHTML = '';
                history.forEach(h => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '10px';
                    li.style.paddingBottom = '10px';
                    li.style.borderBottom = '1px solid #e2e8f0';
                    
                    const date = new Date(h.created_at).toLocaleString('id-ID');
                    li.innerHTML = `
                        <div style="font-size: 0.8rem; color: #64748b;">${date}</div>
                        <div style="font-weight: 500;">${h.status}</div>
                        ${h.notes ? `<div style="font-size: 0.9rem; color: #334155; margin-top: 5px;">${h.notes}</div>` : ''}
                    `;
                    ul.appendChild(li);
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    document.getElementById('btn-save-detail').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const data = {
            diagnosis_result: document.getElementById('detail-diagnosis').value,
            actions_taken: document.getElementById('detail-actions').value,
            technician_notes: document.getElementById('detail-notes').value,
            estimated_cost: 0 // Will handle later in Tahap 6 when adding items
        };
        try {
            await window.api.updateServiceDetails(id, data);
            alert("Detail servis berhasil disimpan.");
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan detail.");
        }
    });

    const statusModal = document.getElementById('status-modal');
    const statusForm = document.getElementById('status-form');

    document.getElementById('btn-update-status').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        document.getElementById('status-service-id').value = id;
        statusForm.reset();
        statusModal.classList.add('show');
    });

    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('status-service-id').value;
        const status = document.getElementById('status-select').value;
        const notes = document.getElementById('status-notes').value;

        try {
            await window.api.updateServiceStatus(id, status, notes);
            statusModal.classList.remove('show');
            openServiceDetail(id); // reload
        } catch (error) {
            console.error(error);
            alert("Gagal update status.");
        }
    });

    // ==========================================
    // PART LOGIC
    // ==========================================
    const partModal = document.getElementById('part-modal');
    const partForm = document.getElementById('part-form');

    document.getElementById('btn-add-part').addEventListener('click', () => {
        document.getElementById('part-modal-title').textContent = 'Tambah Sparepart';
        partForm.reset();
        document.getElementById('part-id').value = '';
        partModal.classList.add('show');
    });

    async function loadParts(searchQuery = '') {
        if (window.api && window.api.getParts) {
            try {
                const parts = await window.api.getParts(searchQuery);
                const tbody = document.getElementById('part-list');
                tbody.innerHTML = '';
                
                parts.forEach(part => {
                    const tr = document.createElement('tr');
                    
                    const formattedSellPrice = new Intl.NumberFormat('id-ID', {
                        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                    }).format(part.sell_price || 0);

                    tr.innerHTML = `
                        <td>${part.part_code || '-'}</td>
                        <td>${part.name}</td>
                        <td>${part.category || '-'}</td>
                        <td>${part.stock} ${part.unit || ''}</td>
                        <td>${formattedSellPrice}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editPart(${part.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deletePart(${part.id})">Hapus</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error("Failed to load parts:", error);
            }
        }
    }

    document.getElementById('search-part').addEventListener('input', (e) => {
        loadParts(e.target.value);
    });

    partForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('part-id').value;
        const data = {
            part_code: document.getElementById('part-code').value,
            name: document.getElementById('part-name').value,
            category: document.getElementById('part-category').value,
            stock: parseInt(document.getElementById('part-stock').value, 10),
            buy_price: parseFloat(document.getElementById('part-buy-price').value),
            sell_price: parseFloat(document.getElementById('part-sell-price').value),
            unit: document.getElementById('part-unit').value,
            notes: document.getElementById('part-notes').value
        };

        try {
            if (id) {
                await window.api.updatePart(id, data);
            } else {
                await window.api.addPart(data);
            }
            partModal.classList.remove('show');
            loadParts(document.getElementById('search-part').value);
        } catch (error) {
            console.error("Error saving part:", error);
            alert("Gagal menyimpan data sparepart.");
        }
    });

    window.editPart = async (id) => {
        try {
            const part = await window.api.getPart(id);
            if (part) {
                document.getElementById('part-modal-title').textContent = 'Edit Sparepart';
                document.getElementById('part-id').value = part.id;
                document.getElementById('part-code').value = part.part_code;
                document.getElementById('part-name').value = part.name;
                document.getElementById('part-category').value = part.category;
                document.getElementById('part-stock').value = part.stock;
                document.getElementById('part-buy-price').value = part.buy_price;
                document.getElementById('part-sell-price').value = part.sell_price;
                document.getElementById('part-unit').value = part.unit;
                document.getElementById('part-notes').value = part.notes;
                partModal.classList.add('show');
            }
        } catch (error) {
            console.error(error);
        }
    };

    window.deletePart = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus sparepart ini?")) {
            try {
                await window.api.deletePart(id);
                loadParts(document.getElementById('search-part').value);
            } catch (error) {
                console.error(error);
                alert("Gagal menghapus data.");
            }
        }
    };

    // ==========================================
    // PAYMENT LOGIC
    // ==========================================
    const paymentModal = document.getElementById('payment-modal');
    const paymentForm = document.getElementById('payment-form');

    async function loadServicePayments(serviceId) {
        if (window.api && window.api.getPayments) {
            try {
                // Fetch service again to get updated payment_status and total_cost
                const service = await window.api.getService(serviceId);
                const payments = await window.api.getPayments(serviceId);
                
                const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(val);

                let totalPaid = 0;
                const ul = document.getElementById('payment-history');
                ul.innerHTML = '';
                
                payments.forEach(p => {
                    totalPaid += p.amount;
                    const li = document.createElement('li');
                    li.style.marginBottom = '8px';
                    li.style.paddingBottom = '8px';
                    li.style.borderBottom = '1px dashed #e2e8f0';
                    li.innerHTML = `
                        <div style="display:flex; justify-content:space-between;">
                            <strong>${p.payment_number}</strong>
                            <span style="color:var(--primary); font-weight:bold;">${formatRp(p.amount)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
                            <span>${new Date(p.payment_date).toLocaleString('id-ID')} - ${p.payment_method}</span>
                            <button class="btn btn-danger" style="padding:2px 5px; font-size:0.7rem;" onclick="deletePayment(${p.id}, ${serviceId})">Hapus</button>
                        </div>
                    `;
                    ul.appendChild(li);
                });

                const remaining = service.total_cost - totalPaid;
                window.currentServiceRemaining = remaining > 0 ? remaining : 0;
                
                document.getElementById('payment-total-bill').textContent = formatRp(service.total_cost);
                document.getElementById('payment-total-paid').textContent = formatRp(totalPaid);
                document.getElementById('payment-remaining').textContent = formatRp(window.currentServiceRemaining);
                
                const statusBadge = document.getElementById('detail-payment-status');
                statusBadge.textContent = service.payment_status.toUpperCase();
                
                if (service.payment_status === 'Lunas') {
                    statusBadge.style.background = '#10b981'; // Green
                    document.getElementById('btn-show-payment-modal').style.display = 'none';
                } else if (service.payment_status === 'DP / Sebagian') {
                    statusBadge.style.background = '#f59e0b'; // Yellow
                    document.getElementById('btn-show-payment-modal').style.display = 'block';
                } else {
                    statusBadge.style.background = '#64748b'; // Gray
                    document.getElementById('btn-show-payment-modal').style.display = 'block';
                }

            } catch (error) {
                console.error(error);
            }
        }
    }

    document.getElementById('btn-show-payment-modal').addEventListener('click', () => {
        const id = document.getElementById('btn-update-status').dataset.id;
        document.getElementById('payment-service-id').value = id;
        paymentForm.reset();
        
        const remaining = window.currentServiceRemaining || 0;
        document.getElementById('payment-amount').value = remaining;
        document.getElementById('payment-suggest-amount').textContent = `Sisa Tagihan: Rp ${remaining.toLocaleString('id-ID')}`;
        
        paymentModal.classList.add('show');
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('payment-service-id').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);
        
        if (amount <= 0) return alert('Nominal harus lebih dari 0');
        
        const data = {
            service_order_id: id,
            amount: amount,
            payment_method: document.getElementById('payment-method').value,
            notes: document.getElementById('payment-notes').value
        };

        try {
            await window.api.addPayment(data);
            paymentModal.classList.remove('show');
            await loadServicePayments(id);
            loadServices(document.getElementById('search-service').value); // Update lists
        } catch (error) {
            console.error(error);
            alert("Gagal memproses pembayaran.");
        }
    });

    window.deletePayment = async (paymentId, serviceId) => {
        if (confirm("Hapus catatan pembayaran ini?")) {
            try {
                await window.api.deletePayment(paymentId);
                await loadServicePayments(serviceId);
                loadServices(document.getElementById('search-service').value); // Update lists
            } catch (error) {
                console.error(error);
            }
        }
    };

    // ==========================================
    // RECEIPT / PRINT LOGIC
    // ==========================================
    document.getElementById('btn-print-nota').addEventListener('click', async () => {
        const id = document.getElementById('btn-update-status').dataset.id;
        if (!id) return;
        
        try {
            const settings = await window.api.getSettings();
            const service = await window.api.getService(id);
            const printArea = document.getElementById('print-area');
            
            const html = `
                <style>
                    @page { size: A5 landscape; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                </style>
                <div style="width: 100%; max-height: 98vh; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.3; box-sizing: border-box;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <h2 style="font-size: 1.5rem; margin: 0 0 2px 0; font-weight: 800; color: #0f172a;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="font-size: 0.85rem; color: #475569;">${settings.address || ''}</div>
                            <div style="font-size: 0.85rem; color: #475569; margin-top: 2px; font-weight: 600;">📞 ${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <h1 style="font-size: 1.6rem; color: #10b981; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">TANDA TERIMA</h1>
                            <div style="font-size: 0.9rem; color: #334155; margin-bottom: 2px;"><strong>No:</strong> ${service.ticket_number}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">Tanggal: ${new Date(service.created_at).toLocaleDateString('id-ID')}</div>
                        </div>
                    </div>
                    
                    <!-- Body: 3 Columns -->
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <!-- Pelanggan -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Pelanggan</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 50px; color: #475569; padding: 2px 0; vertical-align: top;">Nama</td><td style="vertical-align: top;">: <strong>${service.customer_name}</strong></td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">No. HP</td><td style="vertical-align: top;">: ${service.phone || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Alamat</td><td style="vertical-align: top;">: ${service.customer_address || '-'}</td></tr>
                            </table>
                        </div>
                        
                        <!-- Perangkat -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Perangkat</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 55px; color: #475569; padding: 2px 0; vertical-align: top;">Barang</td><td style="vertical-align: top;">: <strong>${service.type} ${service.brand || ''} ${service.model || ''}</strong></td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">S/N</td><td style="vertical-align: top;">: ${service.serial_number || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Warna</td><td style="vertical-align: top;">: ${service.color || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Lengkap</td><td style="vertical-align: top;">: ${service.accessories || '-'}</td></tr>
                            </table>
                        </div>

                        <!-- Keluhan -->
                        <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fff;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Keluhan / Kerusakan</h4>
                            <p style="font-size: 0.8rem; margin: 0; color: #1e293b;">${service.complaint}</p>
                            
                            <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #cbd5e1;">
                                <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 1px;">Estimasi Biaya:</div>
                                <div style="font-weight: 800; color: #ef4444; font-size: 1rem;">${service.estimated_cost ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.estimated_cost) : 'Menunggu Pengecekan'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer / Signatures -->
                    <div style="display: flex; gap: 15px; align-items: stretch;">
                        <div style="flex: 2; font-size: 0.7rem; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                            <strong style="display: block; margin-bottom: 2px; color: #334155;">Syarat & Ketentuan:</strong>
                            <ol style="margin: 0; padding-left: 12px; line-height: 1.3;">
                                <li>Tanda terima ini adalah bukti sah. Harap dibawa saat pengambilan.</li>
                                <li>Perangkat yang tidak diambil > 30 hari di luar tanggung jawab kami.</li>
                                <li>Kami tidak bertanggung jawab atas kehilangan data (harap di-backup).</li>
                            </ol>
                        </div>
                        
                        <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 0.75rem; color: #64748b;">Hormat Kami,</div>
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${settings.business_name || 'Toko'}</div>
                        </div>
                        
                        <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 0.75rem; color: #64748b;">Pelanggan,</div>
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${service.customer_name}</div>
                        </div>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print();
        } catch (error) {
            console.error("Failed to print nota:", error);
            alert("Gagal mencetak tanda terima.");
        }
    });
    document.getElementById('btn-print-receipt').addEventListener('click', async () => {
        const id = document.getElementById('btn-update-status').dataset.id;
        if (!id) return;
        
        try {
            const settings = await window.api.getSettings();
            const service = await window.api.getService(id);
            const items = await window.api.getServiceItems(id);
            const payments = await window.api.getPayments(id);
            
            const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(val);
            
            const printArea = document.getElementById('print-area');
            
            let itemsHtml = '';
            items.forEach(i => {
                let desc = i.description;
                if (i.item_type === 'Sparepart') desc = i.part_name || desc;
                itemsHtml += `
                    <tr style="border-bottom: 1px dashed #cbd5e1;">
                        <td style="padding: 8px 4px; color: #334155;">
                            <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 2px;">${desc}</div>
                            <div style="font-size: 0.75rem; color: #64748b;">${i.item_type} - Jumlah: ${i.quantity} x ${formatRp(i.price)}</div>
                        </td>
                        <td style="padding: 8px 4px; text-align: right; font-weight: bold; font-size: 0.9rem; color: #1e293b;">${formatRp(i.total)}</td>
                    </tr>
                `;
            });
            
            let totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
            let remaining = service.total_cost - totalPaid;
            
            const html = `
                <style>
                    @page { size: A5 portrait; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                </style>
                <div style="width: 100%; max-height: 98vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.3; box-sizing: border-box;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <h2 style="font-size: 1.5rem; margin: 0 0 2px 0; font-weight: 800; color: #0f172a;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="font-size: 0.85rem; color: #475569;">${settings.address || ''}</div>
                            <div style="font-size: 0.85rem; color: #475569; margin-top: 2px; font-weight: 600;">📞 ${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <h1 style="font-size: 1.8rem; color: #4f46e5; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">INVOICE</h1>
                            <div style="font-size: 0.9rem; color: #334155; margin-bottom: 2px;"><strong>No:</strong> ${service.ticket_number}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
                        </div>
                    </div>
                    
                    <!-- Customer & Device Info -->
                    <div style="display: flex; gap: 10px; margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <div style="flex: 1;">
                            <h4 style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Ditagihkan Kepada:</h4>
                            <div style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 2px;">${service.customer_name}</div>
                            <div style="font-size: 0.8rem; color: #475569;">HP: ${service.phone || '-'}</div>
                            <div style="font-size: 0.8rem; color: #475569;">Alamat: ${service.customer_address || '-'}</div>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <h4 style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Detail Perangkat:</h4>
                            <div style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 2px;">${service.type} ${service.brand || ''} ${service.model || ''}</div>
                            <div style="font-size: 0.8rem; color: #475569;">S/N: ${service.serial_number || '-'}</div>
                            <div style="font-size: 0.8rem; color: #475569;">Keluhan: ${service.complaint || '-'}</div>
                        </div>
                    </div>
                    
                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <thead>
                            <tr style="background-color: #4f46e5; color: #fff;">
                                <th style="padding: 8px 10px; text-align: left; border-radius: 4px 0 0 4px; font-size: 0.85rem; letter-spacing: 0.5px;">Deskripsi Item / Jasa</th>
                                <th style="padding: 8px 10px; text-align: right; border-radius: 0 4px 4px 0; font-size: 0.85rem; letter-spacing: 0.5px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <!-- Summary -->
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                        <div style="width: 250px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;">
                                <span style="color: #64748b;">Total Biaya:</span>
                                <strong>${formatRp(service.total_cost)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;">
                                <span style="color: #64748b;">Sudah Dibayar:</span>
                                <strong style="color: #10b981;">${formatRp(totalPaid)}</strong>
                            </div>
                            <div style="border-top: 1px dashed #cbd5e1; margin: 8px 0;"></div>
                            <div style="display: flex; justify-content: space-between; font-size: 1rem; align-items: center; margin-bottom: 15px;">
                                <span style="color: #1e293b; font-weight: 800;">Sisa Tagihan:</span>
                                <strong style="color: #ef4444;">${formatRp(remaining > 0 ? remaining : 0)}</strong>
                            </div>
                            <div style="text-align: right;">
                                <span style="display: inline-block; padding: 4px 10px; background: ${service.payment_status === 'Lunas' ? '#10b981' : (service.payment_status === 'Belum Bayar' ? '#ef4444' : '#f59e0b')}; color: white; border-radius: 20px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                                    ${service.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="display: flex; gap: 15px; align-items: stretch;">
                        <div style="flex: 2; font-size: 0.7rem; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                            <strong style="display: block; margin-bottom: 2px; color: #334155;">Ketentuan Garansi & Servis:</strong>
                            <ol style="margin: 0; padding-left: 12px; line-height: 1.3;">
                                <li>Garansi servis berlaku selama <strong>30 Hari</strong> sejak perangkat diambil, khusus untuk kerusakan dan sparepart yang sama.</li>
                                <li>Garansi hangus apabila segel rusak, terkena air, cacat fisik, atau dibongkar oleh pihak lain.</li>
                                <li>Invoice ini adalah bukti pembayaran dan klaim garansi yang sah. Harap disimpan dengan baik.</li>
                            </ol>
                        </div>
                        
                        <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 0.75rem; color: #64748b;">Hormat Kami,</div>
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${settings.business_name || 'Toko'}</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #94a3b8; font-size: 0.7rem; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 15px;">
                        <p style="margin:0;">${settings.receipt_footer || 'Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami.'}</p>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print();
        } catch (error) {
            console.error("Failed to print receipt:", error);
            alert("Gagal mencetak struk.");
        }
    });

    // ==========================================
    // REPORTS LOGIC
    // ==========================================
    function initReports() {
        const today = new Date().toISOString().split('T')[0];
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        const startInput = document.getElementById('report-start');
        const endInput = document.getElementById('report-end');
        
        if (!startInput.value) startInput.value = firstDay;
        if (!endInput.value) endInput.value = today;
        
        generateReport();
    }

    document.getElementById('btn-generate-report').addEventListener('click', generateReport);

    async function generateReport() {
        const start = document.getElementById('report-start').value;
        const end = document.getElementById('report-end').value;
        if (!start || !end) return;

        try {
            const incomeData = await window.api.getIncomeReport(start, end);
            const services = await window.api.getCompletedServices(start, end);
            
            const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(val || 0);

            // Hitung Omset (Total Tagihan Servis Selesai) dan Total Modal
            let totalOmset = 0;
            let totalModal = 0;
            services.forEach(s => {
                totalOmset += (s.total_cost || 0);
                totalModal += (s.total_modal || 0);
            });
            let netProfit = totalOmset - totalModal;

            // Kita tampilkan Omset berdasarkan Total Tagihan servis selesai (bukan cash basis) agar sinkron dengan Modal
            document.getElementById('report-total-income').textContent = formatRp(totalOmset);
            document.getElementById('report-total-modal').textContent = formatRp(totalModal);
            document.getElementById('report-net-profit').textContent = formatRp(netProfit);
            document.getElementById('report-total-transactions').textContent = services.length;
            
            const tbody = document.getElementById('report-services-list');
            tbody.innerHTML = '';
            
            services.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.ticket_number}</td>
                    <td>${new Date(s.completed_date).toLocaleDateString('id-ID')}</td>
                    <td>${s.customer_name}</td>
                    <td>${s.brand || ''} ${s.model || ''}</td>
                    <td>${formatRp(s.total_cost)}</td>
                `;
                tbody.appendChild(tr);
            });
            
        } catch (error) {
            console.error(error);
        }
    }

    document.getElementById('btn-export-excel').addEventListener('click', async () => {
        const start = document.getElementById('report-start').value;
        const end = document.getElementById('report-end').value;
        if (!start || !end) return;

        try {
            const services = await window.api.getCompletedServices(start, end);
            if (services.length === 0) return alert("Tidak ada data untuk diekspor pada tanggal tersebut.");
            
            // Format data for excel
            const excelData = services.map(s => ({
                'No Tiket': s.ticket_number,
                'Tanggal Selesai': new Date(s.completed_date).toLocaleDateString('id-ID'),
                'Pelanggan': s.customer_name,
                'Perangkat': `${s.brand || ''} ${s.model || ''}`.trim(),
                'Total Biaya': s.total_cost
            }));

            const result = await window.api.exportExcel(excelData);
            if (result.success) {
                alert(`Laporan berhasil disimpan di:\n${result.filePath}`);
            } else if (!result.canceled) {
                alert("Gagal menyimpan file Excel: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat membuat Excel.");
        }
    });

    document.getElementById('btn-export-pdf').addEventListener('click', async () => {
        const start = document.getElementById('report-start').value;
        const end = document.getElementById('report-end').value;
        if (!start || !end) return;

        try {
            const settings = await window.api.getSettings();
            const incomeData = await window.api.getIncomeReport(start, end);
            const services = await window.api.getCompletedServices(start, end);
            
            const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(val || 0);

            const printArea = document.getElementById('print-area');
            
            let itemsHtml = '';
            services.forEach(s => {
                itemsHtml += `
                    <tr>
                        <td>${s.ticket_number}</td>
                        <td>${new Date(s.completed_date).toLocaleDateString('id-ID')}</td>
                        <td>${s.customer_name}</td>
                        <td>${s.brand || ''} ${s.model || ''}</td>
                        <td style="text-align:right;">${formatRp(s.total_cost)}</td>
                    </tr>
                `;
            });
            
            const html = `
                <div class="print-header">
                    <h2>${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div>${settings.address || ''}</div>
                    <div>Telp/WA: ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                
                <h3 style="text-align:center; margin: 20px 0; border-bottom: 2px solid #333; padding-bottom: 10px;">LAPORAN TRANSAKSI SERVIS</h3>
                
                <div style="margin-bottom:15px;">
                    <div><strong>Periode:</strong> ${new Date(start).toLocaleDateString('id-ID')} s/d ${new Date(end).toLocaleDateString('id-ID')}</div>
                    <div><strong>Total Transaksi Selesai:</strong> ${incomeData.transaction_count || 0} Tiket</div>
                </div>
                
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>No. Tiket</th>
                            <th>Tanggal Selesai</th>
                            <th>Pelanggan</th>
                            <th>Perangkat</th>
                            <th style="text-align:right;">Total Biaya</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="print-total-section" style="margin-top: 20px;">
                    <div>TOTAL PENDAPATAN: <span style="font-size: 1.2rem;">${formatRp(incomeData.total_income)}</span></div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print();
        } catch (error) {
            console.error("Failed to print pdf:", error);
            alert("Gagal mencetak laporan.");
        }
    });

    document.getElementById('btn-print-blank-receipt').addEventListener('click', async () => {
        try {
            const settings = await window.api.getSettings();
            const printArea = document.getElementById('print-area');
            
            const html = `
                <div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 25px; margin-bottom: 30px;">
                        <div>
                            <h2 style="font-size: 2.2rem; color: #1e293b; margin-bottom: 10px; font-weight: 800;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="color: #475569; font-size: 1rem; max-width: 320px; line-height: 1.5;">${settings.address || ''}</div>
                            <div style="color: #475569; font-size: 1rem; margin-top: 8px; font-weight: 500;">📞 Telp/WA: ${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right;">
                            <h1 style="font-size: 2.3rem; color: #4f46e5; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">KWITANSI</h1>
                            <div style="font-size: 1.1rem; color: #334155;"><strong>No:</strong> ........................................</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 50px; margin-top: 50px;">
                        <table style="width: 100%; font-size: 1.25rem; line-height: 3;">
                            <tr>
                                <td style="width: 250px; color: #475569; font-weight: 600;">Telah terima dari</td>
                                <td style="width: 30px; text-align: center;">:</td>
                                <td style="border-bottom: 2px solid #cbd5e1;"></td>
                            </tr>
                            <tr>
                                <td style="color: #475569; font-weight: 600;">Uang Sejumlah</td>
                                <td style="text-align: center;">:</td>
                                <td style="border-bottom: 2px solid #cbd5e1; background: #f8fafc; position: relative;">
                                    <span style="position: absolute; left: 15px; font-weight: 800; color: #4f46e5; font-size: 1.5rem; top: 50%; transform: translateY(-50%);">Rp</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="vertical-align: top; color: #475569; font-weight: 600; padding-top: 20px;">Untuk Pembayaran</td>
                                <td style="vertical-align: top; text-align: center; padding-top: 20px;">:</td>
                                <td style="border-bottom: 2px solid #cbd5e1; padding-top: 20px;"></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td style="border-bottom: 2px solid #cbd5e1;"></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 80px;">
                        <div style="background: #f8fafc; padding: 20px 30px; border-radius: 12px; border: 2px dashed #94a3b8;">
                            <span style="color: #64748b; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Sisa Tagihan</span>
                            <span style="font-size: 1.6rem; font-weight: 800; color: #ef4444;">Rp ...................................</span>
                        </div>
                        <div style="text-align: center; width: 300px;">
                            <p style="color: #334155; margin-bottom: 100px; font-size: 1.1rem;">................., ........................... ${new Date().getFullYear()}</p>
                            <div style="border-bottom: 2px solid #1e293b; margin-bottom: 8px;"></div>
                            <p style="color: #64748b; font-size: 1rem; font-weight: 500;">Tanda Tangan Penerima</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #94a3b8; font-size: 1rem; border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 60px;">
                        <p>${settings.receipt_footer || 'Terima kasih atas kepercayaannya menggunakan jasa kami.'}</p>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print();
        } catch (error) {
            console.error("Failed to print blank receipt:", error);
            alert("Gagal mencetak kwitansi kosong.");
        }
    });

    document.getElementById('btn-print-blank-nota').addEventListener('click', async () => {
        try {
            const settings = await window.api.getSettings();
            const printArea = document.getElementById('print-area');
            
            const html = `
                <style>
                    @page { size: A5 landscape; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                </style>
                <div style="width: 100%; max-height: 98vh; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.3; box-sizing: border-box;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <h2 style="font-size: 1.5rem; margin: 0 0 2px 0; font-weight: 800; color: #0f172a;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="font-size: 0.85rem; color: #475569;">${settings.address || ''}</div>
                            <div style="font-size: 0.85rem; color: #475569; margin-top: 2px; font-weight: 600;">📞 ${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <h1 style="font-size: 1.6rem; color: #10b981; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">TANDA TERIMA</h1>
                            <div style="font-size: 0.9rem; color: #334155; margin-bottom: 2px;"><strong>No:</strong> ..............................</div>
                            <div style="font-size: 0.8rem; color: #64748b;">Tanggal: ..............................</div>
                        </div>
                    </div>
                    
                    <!-- Body: 3 Columns -->
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <!-- Pelanggan -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Pelanggan</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 50px; color: #475569; padding: 2px 0; vertical-align: top;">Nama</td><td style="vertical-align: top;">: .......................................</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">No. HP</td><td style="vertical-align: top;">: .......................................</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Alamat</td><td style="vertical-align: top;">: .......................................<br>  .......................................</td></tr>
                            </table>
                        </div>
                        
                        <!-- Perangkat -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Perangkat</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 55px; color: #475569; padding: 2px 0; vertical-align: top;">Barang</td><td style="vertical-align: top;">: .......................................</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">S/N</td><td style="vertical-align: top;">: .......................................</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Warna</td><td style="vertical-align: top;">: .......................................</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Lengkap</td><td style="vertical-align: top;">: .......................................</td></tr>
                            </table>
                        </div>

                        <!-- Keluhan -->
                        <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fff;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Keluhan / Kerusakan</h4>
                            <div style="border-bottom: 1px dashed #cbd5e1; margin-bottom: 15px; margin-top: 10px;"></div>
                            <div style="border-bottom: 1px dashed #cbd5e1; margin-bottom: 15px;"></div>
                            <div style="border-bottom: 1px dashed #cbd5e1; margin-bottom: 10px;"></div>
                            
                            <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #cbd5e1;">
                                <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">Estimasi Biaya:</div>
                                <div style="font-weight: 800; color: #ef4444; font-size: 1rem;">Rp ........................................</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer / Signatures -->
                    <div style="display: flex; gap: 15px; align-items: stretch;">
                        <div style="flex: 2; font-size: 0.7rem; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                            <strong style="display: block; margin-bottom: 2px; color: #334155;">Syarat & Ketentuan:</strong>
                            <ol style="margin: 0; padding-left: 12px; line-height: 1.3;">
                                <li>Tanda terima ini adalah bukti sah. Harap dibawa saat pengambilan.</li>
                                <li>Perangkat yang tidak diambil > 30 hari di luar tanggung jawab kami.</li>
                                <li>Kami tidak bertanggung jawab atas kehilangan data (harap di-backup).</li>
                            </ol>
                        </div>
                        
                        <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 0.75rem; color: #64748b;">Hormat Kami,</div>
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${settings.business_name || 'Toko'}</div>
                        </div>
                        
                        <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="font-size: 0.75rem; color: #64748b;">Pelanggan,</div>
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">( .................................... )</div>
                        </div>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print();
        } catch (error) {
            console.error("Failed to print blank nota:", error);
            alert("Gagal mencetak nota kosong.");
        }
    });

    // ==========================================
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
        if (confirm("WARNING: Restore akan menimpa semua data saat ini. Aplikasi akan restart setelah selesai. Yakin ingin melanjutkan?")) {
            try {
                const success = await window.api.restoreDatabase();
                if (!success) {
                    console.log("Restore dibatalkan.");
                }
            } catch (error) {
                console.error(error);
                alert("Gagal restore database.");
            }
        }
    });

});
