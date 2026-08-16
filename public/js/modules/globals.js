    // Override alert to use SweetAlert2
    window.alert = (message) => {
        const isError = message.toLowerCase().includes('gagal') || message.toLowerCase().includes('error') || message.toLowerCase().includes('kesalahan');
        const isSuccess = message.toLowerCase().includes('berhasil');
        
        if (isSuccess) {
            window.toast(message, 'success');
        } else {
            Swal.fire({
                text: message,
                icon: isError ? 'error' : 'info',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#4f46e5'
            });
        }
    };

    // Override window.print for PDF Print Preview
    window.print = async (options = {}) => {
        try {
            await window.api.printPreview(options);
        } catch (error) {
            console.error("Print preview failed:", error);
            alert("Gagal memuat Print Preview.");
        }
    };

    // Custom async confirm using SweetAlert2
    window.customConfirm = async (message) => {
        const result = await Swal.fire({
            title: 'Konfirmasi',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal'
        });
        return result.isConfirmed;
    };

    // Dark Mode Toggle
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
        const isDarkMode = localStorage.getItem('theme') === 'dark';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️ Light Mode';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.textContent = '☀️ Light Mode';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggleBtn.textContent = '🌙 Dark Mode';
            }
            if (incomeChartInstance) {
                loadDashboardStats();
            }
        });
    }

    // Update Datetime
    const datetimeDisplay = document.getElementById('datetime-display');
    const updateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        datetimeDisplay.textContent = now.toLocaleDateString('id-ID', options);
    };
    
    updateTime();
    setInterval(updateTime, 60000);

    // Toast Utility Function
    window.toast = (message, type = 'success') => {
        Swal.fire({
            text: message,
            icon: type,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    };

    // Debounce Utility Function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Render Pagination Utility
    function renderPagination(containerId, total, page, limit, onPageClick) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        const totalPages = Math.ceil(total / limit) || 1;
        if (totalPages <= 1 && total === 0) return;
        if (totalPages <= 1) return;
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-secondary btn-sm';
        prevBtn.textContent = 'Sebelumnya';
        prevBtn.disabled = page <= 1;
        prevBtn.onclick = () => onPageClick(page - 1);
        
        const info = document.createElement('span');
        info.textContent = `Halaman ${page} dari ${totalPages}`;
        info.style.fontSize = '0.85rem';
        info.style.color = '#475569';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-secondary btn-sm';
        nextBtn.textContent = 'Selanjutnya';
        nextBtn.disabled = page >= totalPages;
        nextBtn.onclick = () => onPageClick(page + 1);
        
        container.appendChild(prevBtn);
        container.appendChild(info);
        container.appendChild(nextBtn);
    }

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
        } else if (navId === 'nav-users') {
            document.getElementById('view-users').style.display = 'block';
            loadUsers();
        }
    }

    let incomeChartInstance = null;

    // Load Dashboard Stats
    async function loadDashboardStats() {
        if (window.api && window.api.getDashboardStats) {
            try {
                const stats = await window.api.getDashboardStats();
                
                const statValues = document.querySelectorAll('#view-dashboard .dashboard-stats .stat-value');
                if (statValues.length >= 5) {
                    statValues[0].textContent = stats.todayServices;
                    statValues[1].textContent = stats.inProgress;
                    statValues[2].textContent = stats.completed;
                    
                    // Format currency
                    const formatRp = (val) => new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                    }).format(val || 0);
                    
                    statValues[3].textContent = formatRp(stats.incomeMonth);
                    statValues[4].textContent = formatRp(stats.labaBersih);
                }

                if (stats.chartData && window.Chart) {
                    const ctx = document.getElementById('incomeChart');
                    if (ctx) {
                        if (incomeChartInstance) {
                            incomeChartInstance.destroy();
                        }
                        const isDark = document.body.classList.contains('dark-mode');
                        incomeChartInstance = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: stats.chartData.labels,
                                datasets: [{
                                    label: 'Pendapatan (Rp)',
                                    data: stats.chartData.values,
                                    backgroundColor: '#4f46e5',
                                    borderRadius: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { 
                                        beginAtZero: true,
                                        ticks: { color: isDark ? '#f8fafc' : '#1e293b' },
                                        grid: { color: isDark ? '#334155' : '#e2e8f0' }
                                    },
                                    x: {
                                        ticks: { color: isDark ? '#f8fafc' : '#1e293b' },
                                        grid: { display: false }
                                    }
                                }
                            }
                        });
                    }
                }

                // Render Low Stock Alert
                if (stats.lowStockParts && stats.lowStockParts.length > 0) {
                    document.getElementById('low-stock-alert-container').style.display = 'block';
                    const tbody = document.getElementById('low-stock-list');
                    tbody.innerHTML = '';
                    stats.lowStockParts.forEach(part => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td style="padding: 8px;"><strong>${part.part_code || '-'}</strong></td>
                            <td style="padding: 8px;">${part.name}</td>
                            <td style="padding: 8px; color: #b91c1c; font-weight: bold;">${part.stock} ${part.unit || 'pcs'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    document.getElementById('low-stock-alert-container').style.display = 'none';
                }
            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
            }
        }
    }

    // Initial load
    loadDashboardStats();

    // ==========================================