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
                            <span>${new Date(p.payment_date + 'Z').toLocaleString('id-ID')} - ${p.payment_method}</span>
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
        if (await window.customConfirm("Hapus catatan pembayaran ini?")) {
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