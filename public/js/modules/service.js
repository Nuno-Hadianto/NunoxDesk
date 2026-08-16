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

    let currentServicePage = 1;

    async function loadServices(searchQuery = '', page = 1) {
        if (window.api && window.api.getServices) {
            try {
                currentServicePage = page;
                const result = await window.api.getServices(searchQuery, page, ITEMS_PER_PAGE);
                const services = result.data || [];
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
                renderPagination('service-pagination', result.total, result.page, result.limit, (newPage) => {
                    loadServices(document.getElementById('search-service').value, newPage);
                });
            } catch (error) {
                console.error("Failed to load services:", error);
            }
        }
    }

    document.getElementById('search-service').addEventListener('input', debounce((e) => {
        loadServices(e.target.value, 1);
    }, 300));

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
                
                document.getElementById('detail-date').textContent = new Date(service.received_date + 'Z').toLocaleDateString('id-ID');
                
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
        if (await window.customConfirm('Hapus item ini?')) {
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

        if (!qty || isNaN(price)) return alert('Quantity dan Harga harus diisi dengan benar.');

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
                    
                    const date = new Date(h.created_at + 'Z').toLocaleString('id-ID');
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

    // WhatsApp Integration
    document.getElementById('btn-whatsapp').addEventListener('click', () => {
        const phoneRaw = document.getElementById('detail-customer').textContent.split('(')[1];
        if (!phoneRaw) return window.toast('Nomor telepon pelanggan tidak tersedia.', 'error');
        
        let phone = phoneRaw.replace(')', '').replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }
        
        const customerName = document.getElementById('detail-customer').textContent.split('(')[0].trim();
        const device = document.getElementById('detail-device').textContent;
        const ticket = document.getElementById('detail-ticket-number').textContent;
        const status = document.getElementById('detail-status-badge').textContent;
        
        const text = `Halo Bpk/Ibu ${customerName}, perihal perbaikan perangkat ${device}, nomor tiket ${ticket} saat ini berstatus ${status}. Terima kasih.`;
        window.api.openExternalUrl(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
    });

    // Export PDF Invoice
    document.getElementById('btn-export-pdf-invoice').addEventListener('click', async () => {
        const id = document.getElementById('btn-update-status').dataset.id;
        if (!id) return;
        
        try {
            
            const settings = await window.api.getSettings();
            const service = await window.api.getService(id);
            const items = await window.api.getServiceItems(id);
            const payments = await window.api.getPayments(id);
            
            // Get Logo Base64
            let logoBase64 = '';
            if (window.api.getLogoBase64) {
                logoBase64 = await window.api.getLogoBase64();
            }
            
            const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(val);
            
            let itemsHtml = '';
            items.forEach(i => {
                let desc = i.description;
                if (i.item_type === 'Sparepart') desc = i.part_name || desc;
                itemsHtml += `
                    <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                        <td style="padding: 12px 15px; color: #334155;">
                            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #1e293b;">${desc}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">${i.item_type} &bull; Qty: ${i.quantity} &bull; ${formatRp(i.price)}/item</div>
                        </td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: 700; font-size: 1rem; color: #0f172a;">${formatRp(i.total)}</td>
                    </tr>
                `;
            });
            
            let totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
            let remaining = service.total_cost - totalPaid;
            
            const logoHtml = logoBase64 
                ? `<img src="${logoBase64}" alt="Logo" style="max-height: 70px; object-fit: contain; margin-bottom: 10px;" />`
                : `<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">${(settings.business_name || 'N').charAt(0)}</div>`;
            
            const html = `
                <style>
                    @page { margin: 0; size: A4 portrait; }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        margin: 0; 
                        padding: 0; 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        background: #f8fafc;
                    }
                    .invoice-box {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 50px;
                        background: white;
                        min-height: 100vh;
                        box-sizing: border-box;
                        position: relative;
                    }
                    .invoice-box::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0;
                        height: 8px;
                        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
                    }
                </style>
                <div class="invoice-box">
                    
                    <!-- Header Section -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                        <div style="flex: 1;">
                            ${logoHtml}
                            <h2 style="font-size: 1.8rem; margin: 0 0 5px 0; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="font-size: 0.9rem; color: #475569; line-height: 1.5; max-width: 250px;">${settings.address || ''}</div>
                            <div style="font-size: 0.9rem; color: #4f46e5; margin-top: 5px; font-weight: 600;">${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <h1 style="font-size: 2.5rem; color: #1e1b4b; margin: 0 0 10px 0; font-weight: 900; letter-spacing: 1px;">INVOICE</h1>
                            <div style="background: #f1f5f9; display: inline-block; padding: 10px 20px; border-radius: 8px; text-align: left;">
                                <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">No. Tiket</div>
                                <div style="font-size: 1.1rem; color: #0f172a; font-weight: 800;">${service.ticket_number}</div>
                                <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px; margin-bottom: 2px;">Tanggal</div>
                                <div style="font-size: 0.95rem; color: #0f172a; font-weight: 600;">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer & Device Info -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px;">
                        <div style="flex: 1; background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                            <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 700;">Tagihan Kepada</div>
                            <div style="font-weight: 800; color: #0f172a; font-size: 1.1rem; margin-bottom: 4px;">${service.customer_name}</div>
                            <div style="font-size: 0.9rem; color: #475569;">${service.customer_phone || '-'}</div>
                        </div>
                        <div style="flex: 1; background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                            <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 700;">Informasi Perangkat</div>
                            <div style="font-weight: 800; color: #0f172a; font-size: 1.1rem; margin-bottom: 4px;">${service.device_type} ${service.brand || ''}</div>
                            <div style="font-size: 0.9rem; color: #475569;">${service.model || '-'}</div>
                        </div>
                    </div>
                    
                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <thead>
                            <tr style="background-color: #f8fafc;">
                                <th style="text-align: left; padding: 15px; font-size: 0.8rem; color: #475569; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Deskripsi Layanan / Suku Cadang</th>
                                <th style="text-align: right; padding: 15px; font-size: 0.8rem; color: #475569; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <!-- Summary & Totals -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px;">
                        <div style="flex: 1.5; padding-right: 40px;">
                            <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700;">Catatan Tambahan</div>
                            <div style="font-size: 0.9rem; color: #475569; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; line-height: 1.6;">
                                ${settings.receipt_footer || 'Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami. Garansi servis berlaku selama 30 hari sejak tanggal pengambilan.'}
                            </div>
                        </div>
                        <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <table style="width: 100%; font-size: 0.95rem;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Total Biaya:</td>
                                    <td style="text-align: right; padding: 6px 0; font-weight: 700; color: #1e293b;">${formatRp(service.total_cost)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Telah Dibayar:</td>
                                    <td style="text-align: right; padding: 6px 0; font-weight: 700; color: #10b981;">${formatRp(totalPaid)}</td>
                                </tr>
                                <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0;"></td></tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #0f172a; font-weight: 800; font-size: 1.1rem;">Sisa Tagihan:</td>
                                    <td style="text-align: right; padding: 6px 0; font-weight: 900; font-size: 1.2rem; color: ${remaining > 0 ? '#ef4444' : '#10b981'};">${formatRp(Math.max(0, remaining))}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Signatures -->
                    <div style="display: flex; justify-content: space-between; padding: 0 40px; margin-top: 60px;">
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 70px;">Pelanggan</div>
                            <div style="border-top: 1px solid #94a3b8; width: 150px; margin: 0 auto; padding-top: 5px; font-weight: 700; color: #1e293b;">${service.customer_name}</div>
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 70px;">Teknisi / Kasir</div>
                            <div style="border-top: 1px solid #94a3b8; width: 150px; margin: 0 auto; padding-top: 5px; font-weight: 700; color: #1e293b;">${settings.business_name || 'NUNOX'}</div>
                        </div>
                    </div>
                </div>
            `;
            
            const filename = `Invoice_${service.ticket_number}_${service.customer_name.replace(/\\s+/g, '_')}.pdf`;
            const result = await window.api.exportPdf({ html, filename });
            
            if (result.success) {
                window.toast('PDF berhasil disimpan!');
            } else if (!result.canceled) {
                alert("Gagal menyimpan PDF: " + result.error);
            }
        } catch (error) {
            console.error("Failed to export pdf:", error);
            alert("Terjadi kesalahan saat memproses PDF.");
        }
    });

    // ==========================================