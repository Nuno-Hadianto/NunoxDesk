export const generateNotaHtml = (settings, service, logoBase64) => {
    settings = settings || {};
    return `
        <div class="print-nota nota-wrapper">
            <!-- Header -->
            <div class="nota-header">
                <div class="nota-header-left">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="nota-logo" />` : ''}
                    <h2 class="nota-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div class="nota-biz-addr">${settings.address || ''}</div>
                    <div class="nota-biz-phone">📞 ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                <div class="nota-header-right">
                    <h1 class="nota-title">TANDA TERIMA</h1>
                    <div class="nota-no"><strong>No:</strong> ${service ? service.ticket_number : '..............................'}</div>
                    <div class="nota-date">Tanggal: ${service ? new Date(service.created_at + 'Z').toLocaleDateString('id-ID') : '..............................'}</div>
                </div>
            </div>
            
            <!-- Body: 3 Columns -->
            <div class="nota-body">
                <!-- Pelanggan -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Pelanggan</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Nama</td><td>: <strong>${service ? service.customer_name : '.......................'}</strong></td></tr>
                        <tr><td class="nota-label">No. HP</td><td>: ${service ? (service.customer_phone || '-') : '.......................'}</td></tr>
                        <tr><td class="nota-label">Alamat</td><td>: ${service ? (service.customer_address || '-') : '.......................'}</td></tr>
                    </table>
                </div>
                
                <!-- Perangkat -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Perangkat</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Jenis</td><td>: <strong>${service ? service.device_type : '.......................'}</strong></td></tr>
                        <tr><td class="nota-label">Merk/Tipe</td><td>: ${service ? (service.brand || '') + ' ' + (service.model || '') : '.......................'}</td></tr>
                        <tr><td class="nota-label">SN</td><td>: ${service ? (service.serial_number || '-') : '.......................'}</td></tr>
                    </table>
                </div>
                
                <!-- Keluhan -->
                <div class="nota-col-red">
                    <h4 class="nota-col-title-red">Keluhan / Kerusakan</h4>
                    <div class="nota-complaint">${service ? service.customer_complaint : '.......................<br/>.......................<br/>.......................'}</div>
                </div>
            </div>
            
            <div class="nota-footer">
                <div class="nota-terms">
                    <h4>Syarat & Ketentuan:</h4>
                    <ol>
                        <li>Nota ini adalah bukti sah penyerahan barang. Harap dibawa saat pengambilan.</li>
                        <li>Barang yang tidak diambil dalam 30 hari sejak selesai servis bukan tanggung jawab kami.</li>
                        <li>Kerusakan data / kehilangan data di luar tanggung jawab kami. Mohon backup data Anda.</li>
                    </ol>
                </div>
                
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Hormat Kami,</div>
                    <div class="nota-sig-line">${settings.business_name || 'Toko'}</div>
                </div>
                
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Pelanggan,</div>
                    <div class="nota-sig-line">${service ? service.customer_name : '.......................'}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateInvoiceHtml = (settings, service, items, payments, logoBase64) => {
    settings = settings || {};
    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val || 0);
    
    let itemsHtml = '';
    if (items && items.length > 0) {
        items.forEach(i => {
            let desc = i.description;
            if (i.item_type === 'Sparepart') desc = i.part_name || desc;
            itemsHtml += `
                <tr class="inv-tr">
                    <td class="inv-td-desc">
                        <div class="inv-item-title">${desc}</div>
                        <div class="inv-item-sub">${i.item_type} &bull; Qty: ${i.quantity} &bull; ${formatRp(i.price)}/item</div>
                    </td>
                    <td class="inv-td-amount">${formatRp(i.subtotal || i.total)}</td>
                </tr>
            `;
        });
    } else {
        itemsHtml = `<tr><td colspan="2" class="inv-empty">Belum ada rincian biaya.</td></tr>`;
    }
    
    let totalPaid = 0;
    if (payments && payments.length > 0) {
        totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    }
    let remaining = (service.total_cost || 0) - totalPaid;
    
    const logoHtml = logoBase64 
        ? `<img src="${logoBase64}" alt="Logo" class="inv-logo" />`
        : `<div class="inv-logo-placeholder">${(settings.business_name || 'N').charAt(0)}</div>`;
    
    return `
        <div class="print-invoice invoice-box">
            <!-- Header Section -->
            <div class="inv-header">
                <div class="inv-header-left">
                    ${logoHtml}
                    <h2 class="inv-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div class="inv-biz-addr">${settings.address || ''}</div>
                    <div class="inv-biz-phone">${settings.whatsapp || settings.phone || ''}</div>
                </div>
                <div class="inv-header-right">
                    <h1 class="inv-title">INVOICE</h1>
                    <div class="inv-meta-box">
                        <div class="inv-meta-label">No. Tiket</div>
                        <div class="inv-meta-value">${service.ticket_number}</div>
                        <div class="inv-meta-label inv-meta-label-mt">Tanggal</div>
                        <div class="inv-meta-value-sm">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </div>
            
            <!-- Customer & Device Info -->
            <div class="inv-info-row">
                <div class="inv-info-card">
                    <div class="inv-info-title">Tagihan Kepada</div>
                    <div class="inv-info-main">${service.customer_name}</div>
                    <div class="inv-info-sub">${service.customer_phone || '-'}</div>
                </div>
                <div class="inv-info-card">
                    <div class="inv-info-title">Informasi Perangkat</div>
                    <div class="inv-info-main">${service.device_type} ${service.brand || ''}</div>
                    <div class="inv-info-sub">${service.model || '-'}</div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="inv-table">
                <thead>
                    <tr>
                        <th class="inv-th-left">Deskripsi Layanan / Suku Cadang</th>
                        <th class="inv-th-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <!-- Summary & Totals -->
            <div class="inv-summary-row">
                <div class="inv-notes-box">
                    <div class="inv-notes-title">Catatan Tambahan</div>
                    <div class="inv-notes-content">
                        ${settings.receipt_footer || 'Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami. Garansi servis berlaku selama 30 hari sejak tanggal pengambilan.'}
                    </div>
                </div>
                <div class="inv-totals-box">
                    <table class="inv-totals-table">
                        <tr>
                            <td class="inv-tot-label">Total Biaya:</td>
                            <td class="inv-tot-val">${formatRp(service.total_cost || 0)}</td>
                        </tr>
                        <tr>
                            <td class="inv-tot-label">Telah Dibayar:</td>
                            <td class="inv-tot-val-paid">${formatRp(totalPaid)}</td>
                        </tr>
                        <tr><td colspan="2"><hr class="inv-tot-hr"></td></tr>
                        <tr>
                            <td class="inv-bal-label">Sisa Tagihan:</td>
                            <td class="inv-bal-val ${remaining > 0 ? 'inv-bal-unpaid' : 'inv-bal-paid'}">${formatRp(Math.max(0, remaining))}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Signatures -->
            <div class="inv-signatures">
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Pelanggan</div>
                    <div class="nota-sig-line">${service.customer_name}</div>
                </div>
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Teknisi / Kasir</div>
                    <div class="nota-sig-line">${settings.business_name || 'NUNOX'}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateBlankNotaHtml = (settings, logoBase64) => {
    settings = settings || {};
    return `
        <div class="print-nota nota-wrapper">
            <!-- Header -->
            <div class="nota-header">
                <div class="nota-header-left">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="nota-logo" />` : ''}
                    <h2 class="nota-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div class="nota-biz-addr">${settings.address || ''}</div>
                    <div class="nota-biz-phone">📞 ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                <div class="nota-header-right">
                    <h1 class="nota-title">TANDA TERIMA</h1>
                    <div class="nota-no"><strong>No:</strong> ..............................</div>
                    <div class="nota-date">Tanggal: ..............................</div>
                </div>
            </div>
            
            <!-- Body: 3 Columns -->
            <div class="nota-body">
                <!-- Pelanggan -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Pelanggan</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Nama</td><td>: <strong>.......................</strong></td></tr>
                        <tr><td class="nota-label">No. HP</td><td>: .......................</td></tr>
                        <tr><td class="nota-label">Alamat</td><td>: .......................</td></tr>
                    </table>
                </div>
                
                <!-- Perangkat -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Perangkat</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Jenis</td><td>: <strong>.......................</strong></td></tr>
                        <tr><td class="nota-label">Merk/Tipe</td><td>: .......................</td></tr>
                        <tr><td class="nota-label">SN</td><td>: .......................</td></tr>
                    </table>
                </div>
                
                <!-- Keluhan -->
                <div class="nota-col-red">
                    <h4 class="nota-col-title-red">Keluhan / Kerusakan</h4>
                    <div class="nota-complaint">.......................<br/>.......................<br/>.......................</div>
                </div>
            </div>
            
            <!-- Items Area (Empty for Nota) -->
            <div class="nota-blank-notes">
                <span class="nota-blank-notes-text">(Area Catatan Tambahan)</span>
            </div>
            
            <!-- Signatures -->
            <div class="nota-footer">
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Pelanggan</div>
                    <div class="nota-sig-line">.........................</div>
                </div>
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Teknisi / Kasir</div>
                    <div class="nota-sig-line">${settings.business_name || 'NUNOX'}</div>
                </div>
            </div>
            
            <div class="nota-blank-footer">
                ${settings.receipt_footer || 'Bawa nota ini saat pengambilan barang.'}
            </div>
        </div>
    `;
};

export const generateBlankReceiptHtml = (settings, logoBase64) => {
    settings = settings || {};
    return `
        <div class="print-receipt rcpt-wrapper">
            <div class="rcpt-header">
                <div>
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="nota-logo" />` : ''}
                    <h2 class="rcpt-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                    <div class="rcpt-biz-addr">${settings.address || ''}</div>
                    <div class="rcpt-biz-phone">📞 Telp/WA: ${settings.whatsapp || settings.phone || ''}</div>
                </div>
                <div style="text-align: right;">
                    <h1 class="rcpt-title">KWITANSI</h1>
                    <div class="rcpt-no"><strong>No:</strong> ....................................</div>
                </div>
            </div>
            
            <div class="rcpt-body">
                <table class="rcpt-table">
                    <tr>
                        <td class="rcpt-label">Telah terima dari</td>
                        <td class="rcpt-colon">:</td>
                        <td class="rcpt-line"></td>
                    </tr>
                    <tr>
                        <td class="rcpt-label">Uang Sejumlah</td>
                        <td class="rcpt-colon">:</td>
                        <td class="rcpt-amount-box">
                            <span class="rcpt-rp">Rp</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="rcpt-label rcpt-vtop">Untuk Pembayaran</td>
                        <td class="rcpt-colon rcpt-vtop">:</td>
                        <td class="rcpt-line rcpt-vtop"></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td class="rcpt-line"></td>
                    </tr>
                </table>
            </div>
            
            <div class="rcpt-footer">
                <div class="rcpt-bal-box">
                    <span class="rcpt-bal-label">Sisa Tagihan</span>
                    <span class="rcpt-bal-val">Rp .................................</span>
                </div>
                <div class="rcpt-sig-box">
                    <p class="rcpt-date">................., ......................... ${new Date().getFullYear()}</p>
                    <div class="rcpt-sig-line"></div>
                    <p class="rcpt-sig-title">Tanda Tangan Penerima</p>
                </div>
            </div>
            
            <div class="rcpt-thanks">
                <p style="margin: 0;">${settings.receipt_footer || 'Terima kasih atas kepercayaannya menggunakan jasa kami.'}</p>
            </div>
        </div>
    `;
};

export const generateReportHtml = (settings, services, startDate, endDate, totalOmset, totalModal, netProfit, logoBase64) => {
    settings = settings || {};
    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val || 0);

    let rowsHtml = '';
    if (services && services.length > 0) {
        services.forEach((s, idx) => {
            rowsHtml += `
                <tr>
                    <td class="rep-td-center">${idx + 1}</td>
                    <td class="rep-td">${s.ticket_number}</td>
                    <td class="rep-td">${new Date(s.completed_date + 'Z').toLocaleDateString('id-ID')}</td>
                    <td class="rep-td">${s.customer_name}</td>
                    <td class="rep-td">${s.brand || ''} ${s.model || ''}</td>
                    <td class="rep-td-right">${formatRp(s.total_cost)}</td>
                </tr>
            `;
        });
    } else {
        rowsHtml = `<tr><td colspan="6" class="rep-td-center" style="padding: 15px;">Tidak ada transaksi</td></tr>`;
    }

    return `
        <div class="print-report" style="max-width: 100%; box-sizing: border-box;">
            <div class="rep-header">
                ${logoBase64 ? `<img src="${logoBase64}" class="rep-logo" />` : ''}
                <h2 class="rep-title">LAPORAN TRANSAKSI SERVIS</h2>
                <h3 class="rep-subtitle">${settings.business_name || 'NUNOX SERVIS'}</h3>
                <p class="rep-period">Periode: ${startDate} s/d ${endDate}</p>
            </div>
            
            <div class="rep-stats">
                <div class="rep-stat-box">
                    <div class="rep-stat-label">Total Omset</div>
                    <div class="rep-stat-val">${formatRp(totalOmset)}</div>
                </div>
                <div class="rep-stat-box">
                    <div class="rep-stat-label">Total HPP (Modal)</div>
                    <div class="rep-stat-val-red">${formatRp(totalModal)}</div>
                </div>
                <div class="rep-stat-box">
                    <div class="rep-stat-label">Laba Bersih</div>
                    <div class="rep-stat-val-green">${formatRp(netProfit)}</div>
                </div>
                <div class="rep-stat-box">
                    <div class="rep-stat-label">Jumlah Transaksi</div>
                    <div class="rep-stat-val">${services.length}</div>
                </div>
            </div>
            
            <table class="rep-table">
                <thead>
                    <tr>
                        <th class="rep-th" style="width: 5%;">No</th>
                        <th class="rep-th" style="width: 15%;">No. Tiket</th>
                        <th class="rep-th" style="width: 15%;">Tgl Selesai</th>
                        <th class="rep-th" style="width: 25%;">Pelanggan</th>
                        <th class="rep-th" style="width: 25%;">Perangkat</th>
                        <th class="rep-th" style="width: 15%;">Total Biaya</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
}

export const printHtml = async (html, landscape = false, isThermal = false) => {
    const printArea = document.getElementById('print-area');
    if (printArea) {
        printArea.innerHTML = html;
        
        let styleTag = document.getElementById('dynamic-print-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-print-style';
            document.head.appendChild(styleTag);
        }
        if (isThermal) {
            styleTag.innerHTML = '@media print { @page { size: 58mm auto; margin: 0; } }';
        } else {
            styleTag.innerHTML = landscape ? '@media print { @page { size: A5 landscape; } }' : '@media print { @page { size: A4 portrait; } }';
        }

        if (window.api && window.api.printPreview) {
            try {
                let pdfOptions = { landscape: landscape && !isThermal };
                if (!isThermal) {
                    pdfOptions.pageSize = landscape ? 'A5' : 'A4';
                }
                await window.api.printPreview(pdfOptions);
            } catch (err) {
                console.error("Print preview error:", err);
            }
        } else {
            // Fallback for native browser
            window.print();
        }
        printArea.innerHTML = '';
        if (styleTag) styleTag.innerHTML = '';
    }
};

export const exportHtmlToPdf = async (html, filename) => {
    if (window.api && window.api.exportPdf) {
        return await window.api.exportPdf({ html, filename });
    }
    return { success: false, error: 'API exportPdf not found' };
};

export const generateThermalNotaHtml = (settings, service, logoBase64) => {
    settings = settings || {};
    return `
        <div class="print-thermal">
            <!-- Header -->
            <div class="thm-center">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="thm-logo" />` : ''}
                <div class="thm-bold thm-biz-name">${settings.business_name || 'NUNOX SERVIS'}</div>
                <div class="thm-biz-sub">${settings.address || ''}</div>
                <div class="thm-biz-sub">WA: ${settings.whatsapp || settings.phone || ''}</div>
            </div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-center thm-bold thm-title">TANDA TERIMA</div>
            
            <div class="thm-row">
                <span class="thm-label">No:</span>
                <span class="thm-val thm-bold">${service ? service.ticket_number : '-'}</span>
            </div>
            <div class="thm-row">
                <span class="thm-label">Tgl:</span>
                <span class="thm-val">${service ? new Date(service.created_at + 'Z').toLocaleDateString('id-ID') : '-'}</span>
            </div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">PELANGGAN:</div>
            <div>${service ? service.customer_name : '-'}</div>
            <div>${service ? service.customer_phone || '' : ''}</div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">PERANGKAT:</div>
            <div>${service ? service.device_type : '-'}</div>
            <div>${service ? (service.brand || '') + ' ' + (service.model || '') : '-'}</div>
            <div class="thm-row" style="margin-top: 2px;">
                <span class="thm-label">SN:</span>
                <span class="thm-val">${service ? service.serial_number || '-' : '-'}</span>
            </div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">KELUHAN:</div>
            <div class="thm-text-sm">${service ? service.customer_complaint : '-'}</div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">KELENGKAPAN:</div>
            <div class="thm-text-sm">${service ? service.accessories || '-' : '-'}</div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-center thm-sig">
                <div>Hormat Kami,</div>
                <br><br><br>
                <div>( .................... )</div>
            </div>
            
            <div class="thm-center thm-footer">
                * Harap bawa struk ini saat mengambil barang.
            </div>
            <div class="thm-gap"></div> <!-- Extra space for tearing -->
        </div>
    `;
};
