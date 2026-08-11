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
        el.addEventListener('click', () => {
            customerModal.classList.remove('show');
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
                alert("Gagal menghapus data.");
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
                alert("Gagal menghapus data.");
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
                    <tr>
                        <td>${desc} (${i.quantity})</td>
                        <td style="text-align:right;">${formatRp(i.total)}</td>
                    </tr>
                `;
            });
            
            let totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
            let remaining = service.total_cost - totalPaid;
            
            const html = `
                <div class="print-header">
                    <h2>${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div>${settings.address || ''}</div>
                    <div>Telp/WA: ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                
                <div style="margin-bottom:10px;">
                    <div>No. Tiket: <strong>${service.ticket_number}</strong></div>
                    <div>Tanggal: ${new Date().toLocaleString('id-ID')}</div>
                    <div>Pelanggan: ${service.customer_name}</div>
                    <div>Perangkat: ${service.brand || ''} ${service.model || ''}</div>
                </div>
                
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Item / Jasa</th>
                            <th style="text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="print-total-section">
                    <div>TOTAL BIAYA: ${formatRp(service.total_cost)}</div>
                    <div>SUDAH DIBAYAR: ${formatRp(totalPaid)}</div>
                    <div>SISA TAGIHAN: ${formatRp(remaining > 0 ? remaining : 0)}</div>
                    <div>STATUS: ${service.payment_status.toUpperCase()}</div>
                </div>
                
                <div class="print-footer">
                    <p>${settings.receipt_footer || 'Terima kasih telah menggunakan jasa kami.'}</p>
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

            document.getElementById('report-total-income').textContent = formatRp(incomeData.total_income);
            document.getElementById('report-total-transactions').textContent = incomeData.transaction_count || 0;
            
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
