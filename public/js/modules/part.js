    // PART LOGIC
    // ==========================================
    const partModal = document.getElementById('part-modal');
    const partForm = document.getElementById('part-form');

    // Import Sparepart Excel
    const btnImportPart = document.getElementById('btn-import-part');
    if (btnImportPart) {
        btnImportPart.addEventListener('click', async () => {
            try {
                const res = await window.api.importPartsExcel();
                if (res.canceled) return;
                
                if (res.success) {
                    window.toast(`Berhasil import: ${res.result.imported} baru, ${res.result.updated} diperbarui.`, 'success');
                    loadParts();
                } else {
                    Swal.fire('Gagal', res.error || 'Terjadi kesalahan saat import.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Gagal memproses file Excel.', 'error');
            }
        });
    }

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

    document.getElementById('search-part').addEventListener('input', debounce((e) => {
        loadParts(e.target.value);
    }, 300));

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
        if (await window.customConfirm("Apakah Anda yakin ingin menghapus sparepart ini?")) {
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