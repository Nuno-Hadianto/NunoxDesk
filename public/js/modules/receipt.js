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
                    @page { margin: 5mm; }
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
                            <h1 style="font-size: 1.6rem; color: #a855f7; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">TANDA TERIMA</h1>
                            <div style="font-size: 0.9rem; color: #334155; margin-bottom: 2px;"><strong>No:</strong> ${service.ticket_number}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">Tanggal: ${new Date(service.created_at + 'Z').toLocaleDateString('id-ID')}</div>
                        </div>
                    </div>
                    
                    <!-- Body: 3 Columns -->
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <!-- Pelanggan -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Pelanggan</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 50px; color: #475569; padding: 2px 0; vertical-align: top;">Nama</td><td style="vertical-align: top;">: <strong>${service.customer_name}</strong></td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">No. HP</td><td style="vertical-align: top;">: ${service.customer_phone || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Alamat</td><td style="vertical-align: top;">: ${service.customer_address || '-'}</td></tr>
                            </table>
                        </div>
                        
                        <!-- Perangkat -->
                        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Perangkat</h4>
                            <table style="width: 100%; font-size: 0.8rem;">
                                <tr><td style="width: 55px; color: #475569; padding: 2px 0; vertical-align: top;">Barang</td><td style="vertical-align: top;">: <strong>${service.device_type || ''} ${service.brand || ''} ${service.model || ''}</strong></td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">S/N</td><td style="vertical-align: top;">: ${service.serial_number || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Warna</td><td style="vertical-align: top;">: ${service.color || '-'}</td></tr>
                                <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Lengkap</td><td style="vertical-align: top;">: ${service.accessories || '-'}</td></tr>
                            </table>
                        </div>

                        <!-- Keluhan -->
                        <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fff;">
                            <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Keluhan / Kerusakan</h4>
                            <p style="font-size: 0.8rem; margin: 0; color: #1e293b;">${service.customer_complaint}</p>
                            
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
            window.print({ landscape: true, pageSize: 'A5' });
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
                    @page { margin: 5mm; }
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
                            <div style="font-size: 0.8rem; color: #475569;">HP: ${service.customer_phone || '-'}</div>
                            <div style="font-size: 0.8rem; color: #475569;">Alamat: ${service.customer_address || '-'}</div>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <h4 style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Detail Perangkat:</h4>
                            <div style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 2px;">${service.device_type || ''} ${service.brand || ''} ${service.model || ''}</div>
                            <div style="font-size: 0.8rem; color: #475569;">S/N: ${service.serial_number || '-'}</div>
                            <div style="font-size: 0.8rem; color: #475569;">Keluhan: ${service.customer_complaint || '-'}</div>
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
            window.print({ landscape: true, pageSize: 'A5' });
        } catch (error) {
            console.error("Failed to print receipt:", error);
            alert("Gagal mencetak struk.");
        }
    });

    // ==========================================