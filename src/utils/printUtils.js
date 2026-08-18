export const generateNotaHtml = (settings, service, logoBase64) => {
    return `
        <style>
            @page { margin: 5mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.3; box-sizing: border-box; font-size: 12px; }
        </style>
        <div style="width: 100%; max-height: 98vh; overflow: hidden;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="max-height: 50px; object-fit: contain; margin-bottom: 5px;" />` : ''}
                    <h2 style="font-size: 1.5rem; margin: 0 0 2px 0; font-weight: 800; color: #0f172a;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div style="font-size: 0.85rem; color: #475569;">${settings.address || ''}</div>
                    <div style="font-size: 0.85rem; color: #475569; margin-top: 2px; font-weight: 600;">📞 ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                <div style="text-align: right; flex: 1;">
                    <h1 style="font-size: 1.6rem; color: #a855f7; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">TANDA TERIMA</h1>
                    <div style="font-size: 0.9rem; color: #334155; margin-bottom: 2px;"><strong>No:</strong> ${service ? service.ticket_number : '..............................'}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Tanggal: ${service ? new Date(service.created_at + 'Z').toLocaleDateString('id-ID') : '..............................'}</div>
                </div>
            </div>
            
            <!-- Body: 3 Columns -->
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <!-- Pelanggan -->
                <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Pelanggan</h4>
                    <table style="width: 100%; font-size: 0.8rem;">
                        <tr><td style="width: 50px; color: #475569; padding: 2px 0; vertical-align: top;">Nama</td><td style="vertical-align: top;">: <strong>${service ? service.customer_name : '.......................'}</strong></td></tr>
                        <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">No. HP</td><td style="vertical-align: top;">: ${service ? (service.customer_phone || '-') : '.......................'}</td></tr>
                        <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Alamat</td><td style="vertical-align: top;">: ${service ? (service.customer_address || '-') : '.......................'}</td></tr>
                    </table>
                </div>
                
                <!-- Perangkat -->
                <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #f8fafc;">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">Data Perangkat</h4>
                    <table style="width: 100%; font-size: 0.8rem;">
                        <tr><td style="width: 50px; color: #475569; padding: 2px 0; vertical-align: top;">Jenis</td><td style="vertical-align: top;">: <strong>${service ? service.device_type : '.......................'}</strong></td></tr>
                        <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">Merk/Tipe</td><td style="vertical-align: top;">: ${service ? (service.brand || '') + ' ' + (service.model || '') : '.......................'}</td></tr>
                        <tr><td style="color: #475569; padding: 2px 0; vertical-align: top;">SN</td><td style="vertical-align: top;">: ${service ? (service.serial_number || '-') : '.......................'}</td></tr>
                    </table>
                </div>
                
                <!-- Keluhan -->
                <div style="flex: 1.2; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fef2f2;">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin: 0 0 4px 0; color: #ef4444; border-bottom: 1px solid #fecaca; padding-bottom: 2px;">Keluhan / Kerusakan</h4>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #7f1d1d;">${service ? service.customer_complaint : '.......................<br/>.......................<br/>.......................'}</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 15px;">
                <div style="flex: 2; font-size: 0.7rem; color: #475569;">
                    <h4 style="margin: 0 0 3px 0; font-size: 0.75rem; color: #1e293b;">Syarat & Ketentuan:</h4>
                    <ol style="margin: 0; padding-left: 15px;">
                        <li>Nota ini adalah bukti sah penyerahan barang. Harap dibawa saat pengambilan.</li>
                        <li>Barang yang tidak diambil dalam 30 hari sejak selesai servis bukan tanggung jawab kami.</li>
                        <li>Kerusakan data / kehilangan data di luar tanggung jawab kami. Mohon backup data Anda.</li>
                    </ol>
                </div>
                
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 0.75rem; color: #64748b;">Hormat Kami,</div>
                    <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${settings.business_name || 'Toko'}</div>
                </div>
                
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 0.75rem; color: #64748b;">Pelanggan,</div>
                    <div style="margin-top: 30px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px;">${service ? service.customer_name : '.......................'}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateInvoiceHtml = (settings, service, items, payments, logoBase64) => {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val || 0);
    
    let itemsHtml = '';
    if (items && items.length > 0) {
        items.forEach(i => {
            let desc = i.description;
            if (i.item_type === 'Sparepart') desc = i.part_name || desc;
            itemsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                    <td style="padding: 12px 15px; color: #334155;">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #1e293b;">${desc}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">${i.item_type} &bull; Qty: ${i.quantity} &bull; ${formatRp(i.price)}/item</div>
                    </td>
                    <td style="padding: 12px 15px; text-align: right; font-weight: 700; font-size: 1rem; color: #0f172a;">${formatRp(i.subtotal || i.total)}</td>
                </tr>
            `;
        });
    } else {
        itemsHtml = `<tr><td colspan="2" style="text-align: center; padding: 20px;">Belum ada rincian biaya.</td></tr>`;
    }
    
    let totalPaid = 0;
    if (payments && payments.length > 0) {
        totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    }
    let remaining = (service.total_cost || 0) - totalPaid;
    
    const logoHtml = logoBase64 
        ? `<img src="${logoBase64}" alt="Logo" style="max-height: 70px; object-fit: contain; margin-bottom: 10px;" />`
        : `<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">${(settings.business_name || 'N').charAt(0)}</div>`;
    
    return `
        <style>
            @page { margin: 0; size: A4 portrait; }
            body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                margin: 0; 
                padding: 0; 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                background: #ffffff;
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
                            <td style="text-align: right; padding: 6px 0; font-weight: 700; color: #1e293b;">${formatRp(service.total_cost || 0)}</td>
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
};

export const generateBlankReceiptHtml = (settings, logoBase64) => {
    return `
        <style>
            @page { margin: 5mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif;}
        </style>
        <div style="max-width: 100%; margin: 0; background: #fff; padding: 5px 10px; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; margin-bottom: 12px;">
                <div>
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="max-height: 50px; object-fit: contain; margin-bottom: 5px;" />` : ''}
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
};

export const generateReportHtml = (settings, services, startDate, endDate, totalOmset, totalModal, netProfit, logoBase64) => {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val || 0);

    let rowsHtml = '';
    if (services && services.length > 0) {
        services.forEach((s, idx) => {
            rowsHtml += `
                <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${idx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${s.ticket_number}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${new Date(s.completed_date + 'Z').toLocaleDateString('id-ID')}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${s.customer_name}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${s.brand || ''} ${s.model || ''}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${formatRp(s.total_cost)}</td>
                </tr>
            `;
        });
    } else {
        rowsHtml = `<tr><td colspan="6" style="border: 1px solid #cbd5e1; padding: 15px; text-align: center;">Tidak ada transaksi</td></tr>`;
    }

    return `
        <style>
            @page { margin: 10mm; size: A4 landscape; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #333; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; }
        </style>
        <div style="max-width: 100%; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 20px;">
                ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 50px; margin-bottom: 10px;" />` : ''}
                <h2 style="margin: 0; font-size: 1.5rem;">LAPORAN TRANSAKSI SERVIS</h2>
                <h3 style="margin: 5px 0 0 0; color: #475569;">${settings.business_name || 'NUNOX SERVIS'}</h3>
                <p style="margin: 5px 0 0 0; color: #64748b;">Periode: ${startDate} s/d ${endDate}</p>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div style="flex: 1; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc;">
                    <div style="font-size: 0.8rem; color: #64748b;">Total Omset</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #1e293b;">${formatRp(totalOmset)}</div>
                </div>
                <div style="flex: 1; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc;">
                    <div style="font-size: 0.8rem; color: #64748b;">Total HPP (Modal)</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #ef4444;">${formatRp(totalModal)}</div>
                </div>
                <div style="flex: 1; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc;">
                    <div style="font-size: 0.8rem; color: #64748b;">Laba Bersih</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #10b981;">${formatRp(netProfit)}</div>
                </div>
                <div style="flex: 1; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc;">
                    <div style="font-size: 0.8rem; color: #64748b;">Jumlah Transaksi</div>
                    <div style="font-size: 1.2rem; font-weight: bold; color: #1e293b;">${services.length}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 15%;">No. Tiket</th>
                        <th style="width: 15%;">Tgl Selesai</th>
                        <th style="width: 25%;">Pelanggan</th>
                        <th style="width: 25%;">Perangkat</th>
                        <th style="width: 15%;">Total Biaya</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
}

export const printHtml = async (html, landscape = false) => {
    const printArea = document.getElementById('print-area');
    if (printArea) {
        printArea.innerHTML = html;
        if (window.api && window.api.printPreview) {
            try {
                await window.api.printPreview({ landscape, pageSize: landscape ? 'A5' : 'A4' });
            } catch (err) {
                console.error("Print preview error:", err);
            }
        } else {
            // Fallback for native browser
            window.print();
        }
        printArea.innerHTML = '';
    }
};

export const exportHtmlToPdf = async (html, filename) => {
    if (window.api && window.api.exportPdf) {
        return await window.api.exportPdf({ html, filename });
    }
    return { success: false, error: 'API exportPdf not found' };
};
