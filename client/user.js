// Base API URL
const API_BASE = '/api/user';

// Login Handling
const loginForm = document.getElementById('user-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        const msg = document.getElementById('login-msg');
        const btn = loginForm.querySelector('.btn-submit');

        btn.disabled = true;
        btn.innerHTML = 'Verifying...';
        msg.textContent = '';

        try {
            // Updated to Unified Login Endpoint
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === 'admin') {
                    localStorage.setItem('adminToken', data.token);
                    window.location.href = 'admin-dashboard.html';
                } else {
                    localStorage.setItem('userToken', data.token);
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                msg.textContent = data.message || 'Login failed';
            }
        } catch (err) {
            msg.textContent = 'Server Error. Please ensure backend is running.';
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Sign In';
        }
    });
}

// Logout Handling
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userToken');
            window.location.href = 'login.html';
        }
    });
}

// Dashboard Data Loading & Task Submission
async function loadUserDashboard() {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            // Token Invalid/Expired
            localStorage.removeItem('userToken');
            window.location.href = 'login.html';
            return;
        }

        const user = await res.json();

        // Populate User Info
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-domain').textContent = user.domain;

        // Populate Task Links
        const form = document.getElementById('task-form');
        if (form && user.taskLinks && Array.isArray(user.taskLinks)) {
            user.taskLinks.forEach((link, index) => {
                if (index < 5 && form[`task${index + 1}`]) {
                    form[`task${index + 1}`].value = link || '';
                }
            });
        }

    } catch (err) {
        console.error('Data Load Error:', err);
    }
}

// Task Submission
const taskForm = document.getElementById('task-form');
if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = taskForm.querySelector('.btn-submit');
        const msg = document.getElementById('task-msg');

        btn.disabled = true;
        btn.textContent = 'Saving...';
        msg.textContent = '';

        // Collect links
        const taskLinks = [];
        for (let i = 1; i <= 5; i++) {
            taskLinks.push(taskForm[`task${i}`].value.trim());
        }

        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API_BASE}/submit-tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ taskLinks })
            });

            const data = await res.json();

            if (res.ok) {
                msg.textContent = 'Tasks saved successfully!';
                msg.style.color = '#10b981'; // Green
            } else {
                msg.textContent = data.message || 'Failed to save tasks';
                msg.style.color = '#ef4444'; // Red
            }
        } catch (err) {
            msg.textContent = 'Error connecting to server';
            msg.style.color = '#ef4444';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save Task Links';
        }
    });
}
