// ---- AUTH LOGIC ----
    const loginScreen = document.getElementById('login-screen');
    const appMainContainer = document.getElementById('app-main-container');
    const currentUserDisplay = document.getElementById('current-user-display');
    const menuUsers = document.getElementById('menu-users');
    const navReports = document.getElementById('nav-reports').parentElement;
    const navPayments = document.getElementById('nav-payments').parentElement;
    const navSettings = document.getElementById('nav-settings').parentElement;
    const navBackup = document.getElementById('nav-backup').parentElement;
    const navReceipts = document.getElementById('nav-receipts').parentElement;

    let currentUser = null;
    
    function checkAuth() {
        const userJson = sessionStorage.getItem('currentUser');
        if (userJson) {
            currentUser = JSON.parse(userJson);
            showApp();
        } else {
            loginScreen.style.display = 'flex';
            appMainContainer.style.display = 'none';
        }
    }

    function showApp() {
        loginScreen.style.display = 'none';
        appMainContainer.style.display = 'flex';
        currentUserDisplay.textContent = currentUser.username + ' (' + currentUser.role + ')';

        // Role Based Access Control
        if (currentUser.role === 'teknisi') {
            menuUsers.style.display = 'none';
            navReports.style.display = 'none';
            navPayments.style.display = 'none';
            navSettings.style.display = 'none';
            navBackup.style.display = 'none';
            navReceipts.style.display = 'none';
            
            // Hide delete buttons globally using a CSS class injection or inline styles
            const style = document.createElement('style');
            style.innerHTML = '.btn-danger { display: none !important; } .delete-btn { display: none !important; }';
            document.head.appendChild(style);
        } else {
            menuUsers.style.display = 'block';
            navReports.style.display = 'block';
            navPayments.style.display = 'block';
            navSettings.style.display = 'block';
            navBackup.style.display = 'block';
            navReceipts.style.display = 'block';
        }
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userVal = document.getElementById('login-username').value;
        const passVal = document.getElementById('login-password').value;
        const btnLogin = document.getElementById('btn-login');
        
        try {
            btnLogin.textContent = 'Memeriksa...';
            btnLogin.disabled = true;
            
            const res = await window.api.login(userVal, passVal);
            if (res.success) {
                sessionStorage.setItem('currentUser', JSON.stringify(res.user));
                checkAuth();
            } else {
                Swal.fire('Login Gagal', res.error, 'error');
            }
        } catch (err) {
            Swal.fire('Login Gagal', 'Terjadi kesalahan sistem.', 'error');
        } finally {
            btnLogin.textContent = 'Masuk';
            btnLogin.disabled = false;
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        location.reload(); // Reload app to clear memory
    });

    checkAuth();
    // ---- END AUTH LOGIC ----
