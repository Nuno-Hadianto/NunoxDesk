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

    let currentCustomerPage = 1;
    const ITEMS_PER_PAGE = 50;

    // Load Customers
    async function loadCustomers(searchQuery = '', page = 1) {
        if (window.api && window.api.getCustomers) {
            try {
                currentCustomerPage = page;
                const result = await window.api.getCustomers(searchQuery, page, ITEMS_PER_PAGE);
                const customers = result.data || [];
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
                renderPagination('customer-pagination', result.total, result.page, result.limit, (newPage) => {
                    loadCustomers(document.getElementById('search-customer').value, newPage);
                });
            } catch (error) {
                console.error("Failed to load customers:", error);
            }
        }
    }

    // Search Customers
    document.getElementById('search-customer').addEventListener('input', debounce((e) => {
        loadCustomers(e.target.value, 1);
    }, 300));

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
            loadCustomers(document.getElementById('search-customer').value, currentCustomerPage);
            window.toast("Data pelanggan berhasil disimpan!");
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
        if (await window.customConfirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
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