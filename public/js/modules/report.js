    // REPORTS LOGIC
    // ==========================================
    function initReports() {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const firstDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        
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
                    <td>${new Date(s.completed_date + 'Z').toLocaleDateString('id-ID')}</td>
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
                'Tanggal Selesai': new Date(s.completed_date + 'Z').toLocaleDateString('id-ID'),
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
            let totalOmset = 0;
            
            services.forEach(s => {
                totalOmset += (s.total_cost || 0);
                itemsHtml += `
                    <tr>
                        <td>${s.ticket_number}</td>
                        <td>${new Date(s.completed_date + 'Z').toLocaleDateString('id-ID')}</td>
                        <td>${s.customer_name}</td>
                        <td>${s.brand || ''} ${s.model || ''}</td>
                        <td style="text-align:right;">${formatRp(s.total_cost)}</td>
                    </tr>
                `;
            });
            
            const html = `
                <style>
                    .report-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; }
                    .report-header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 30px; }
                    .report-header h2 { margin: 0; font-size: 28px; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; }
                    .report-header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
                    .report-title { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; text-align: center; }
                    .report-title h3 { margin: 0 0 15px 0; color: #a855f7; font-size: 20px; letter-spacing: 1px; }
                    .report-summary { display: flex; justify-content: center; gap: 50px; font-size: 14px; }
                    .summary-box { text-align: center; }
                    .summary-box span { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
                    .summary-box strong { font-size: 16px; color: #0f172a; }
                    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
                    .report-table th { background-color: #a855f7 !important; color: #ffffff !important; padding: 14px 12px; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #9333ea; }
                    .report-table td { padding: 12px; border: 1px solid #e2e8f0; color: #334155; }
                    .report-table tr:nth-child(even) { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .report-total { display: flex; justify-content: flex-end; align-items: center; padding: 20px; background-color: #f1f5f9 !important; border-radius: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; border: 1px solid #e2e8f0; }
                    .report-total-label { font-size: 15px; color: #64748b; margin-right: 20px; font-weight: 600; text-transform: uppercase; }
                    .report-total-value { font-size: 26px; font-weight: bold; color: #10b981; }
                </style>
                <div class="report-wrapper">
                    <div class="report-header">
                        <h2>${settings.business_name || 'NUNOX SERVIS'}</h2>
                        <p>${settings.address || 'Alamat Belum Diatur'}</p>
                        <p>Telp/WA: ${settings.whatsapp || settings.phone || '-'}</p>
                    </div>
                    
                    <div class="report-title">
                        <h3>LAPORAN TRANSAKSI SERVIS</h3>
                        <div class="report-summary">
                            <div class="summary-box">
                                <span>Periode</span>
                                <strong>${new Date(start).toLocaleDateString('id-ID')} - ${new Date(end).toLocaleDateString('id-ID')}</strong>
                            </div>
                            <div class="summary-box">
                                <span>Total Transaksi</span>
                                <strong>${services.length || 0} Tiket</strong>
                            </div>
                        </div>
                    </div>
                    
                    <table class="report-table">
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
                    
                    <div class="report-total">
                        <div class="report-total-label">Total Pendapatan:</div>
                        <div class="report-total-value">${formatRp(totalOmset)}</div>
                    </div>
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
                <style>
                    @page { margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                </style>
                <div style="max-width: 100%; margin: 0; background: #fff; padding: 5px 10px; box-sizing: border-box;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; margin-bottom: 12px;">
                        <div>
                            <h2 style="font-size: 1.4rem; color: #1e293b; margin: 0 0 5px 0; font-weight: 800;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                            <div style="color: #475569; font-size: 0.85rem; max-width: 320px; line-height: 1.4;">${settings.address || ''}</div>
                            <div style="color: #475569; font-size: 0.85rem; margin-top: 4px; font-weight: 600;">📞 Telp/WA: ${settings.whatsapp || settings.phone || ''}</div>
                        </div>
                        <div style="text-align: right;">
                            <h1 style="font-size: 1.6rem; color: #4f46e5; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">KWITANSI</h1>
                            <div style="font-size: 0.95rem; color: #334155;"><strong>No:</strong> ....................................</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <table style="width: 100%; font-size: 0.95rem; line-height: 2;">
                            <tr>
                                <td style="width: 150px; color: #475569; font-weight: 600;">Telah terima dari</td>
                                <td style="width: 15px; text-align: center;">:</td>
                                <td style="border-bottom: 1px solid #cbd5e1;"></td>
                            </tr>
                            <tr>
                                <td style="color: #475569; font-weight: 600;">Uang Sejumlah</td>
                                <td style="text-align: center;">:</td>
                                <td style="border-bottom: 1px solid #cbd5e1; background: #f8fafc; position: relative;">
                                    <span style="position: absolute; left: 10px; font-weight: 800; color: #4f46e5; font-size: 1.1rem; top: 50%; transform: translateY(-50%);">Rp</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="vertical-align: top; color: #475569; font-weight: 600; padding-top: 10px;">Untuk Pembayaran</td>
                                <td style="vertical-align: top; text-align: center; padding-top: 10px;">:</td>
                                <td style="border-bottom: 1px solid #cbd5e1; padding-top: 10px;"></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td></td>
                                <td style="border-bottom: 1px solid #cbd5e1;"></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
                        <div style="background: #f8fafc; padding: 12px 20px; border-radius: 8px; border: 1px dashed #94a3b8;">
                            <span style="color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px;">Sisa Tagihan</span>
                            <span style="font-size: 1.2rem; font-weight: 800; color: #ef4444;">Rp .................................</span>
                        </div>
                        <div style="text-align: center; width: 250px;">
                            <p style="color: #334155; margin-bottom: 30px; font-size: 0.9rem;">................., ......................... ${new Date().getFullYear()}</p>
                            <div style="border-bottom: 1px solid #1e293b; margin-bottom: 5px;"></div>
                            <p style="color: #64748b; font-size: 0.85rem; font-weight: 500; margin: 0;">Tanda Tangan Penerima</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 15px;">
                        <p style="margin: 0;">${settings.receipt_footer || 'Terima kasih atas kepercayaannya menggunakan jasa kami.'}</p>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print({ landscape: true, pageSize: 'A5' });
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
                            <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                        </div>
                    </div>
                </div>
            `;
            
            printArea.innerHTML = html;
            window.print({ landscape: true, pageSize: 'A5' });
        } catch (error) {
            console.error("Failed to print blank nota:", error);
            alert("Gagal mencetak nota kosong.");
        }
    });

    // ==========================================