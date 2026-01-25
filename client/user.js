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
            localStorage.removeItem('userToken');
            window.location.href = 'login.html';
            return;
        }

        const user = await res.json();

        // Populate User Info
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-domain').textContent = user.domain;

        // Populate Task Links & Calculate Progress
        const form = document.getElementById('task-form');
        let filledCount = 0;

        if (form && user.taskLinks && Array.isArray(user.taskLinks)) {
            user.taskLinks.forEach((link, index) => {
                if (index < 5 && form[`task${index + 1}`]) {
                    const val = link || '';
                    form[`task${index + 1}`].value = val;
                    if (val.trim() !== '') filledCount++;
                }
            });
        }

        // Update Progress Bar
        const percentage = (filledCount / 5) * 100;
        document.getElementById('progress-bar').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${percentage}%`;

        // Handle Certificate Status
        const statusEl = document.getElementById('cert-status');
        const requestBtn = document.getElementById('request-cert-btn');

        if (user.certificateStatus === 'Approved') {
            statusEl.textContent = 'Certificate Status: Approved ✅';
            statusEl.style.color = '#10b981';
            requestBtn.style.display = 'none';
        } else if (user.certificateStatus === 'Requested') {
            statusEl.textContent = 'Certificate Status: Requested ⏳';
            statusEl.style.color = '#f59e0b';
            requestBtn.style.display = 'none';
        } else {
            statusEl.textContent = 'Complete 5 tasks to request certificate';
            if (percentage === 100) {
                requestBtn.style.display = 'inline-block';
                requestBtn.onclick = requestCertificate;
            } else {
                requestBtn.style.display = 'none';
            }
        }

    } catch (err) {
        console.error('Data Load Error:', err);
    }
}

// Individual Task Submission
async function submitSingleTask(btn) {
    const taskForm = document.getElementById('task-form');
    const msg = document.getElementById('task-msg');

    // Identify associated input (assuming it's the previous sibling in the flex container)
    // Structure: div > input, button. So input is previousElementSibling.
    const input = btn.previousElementSibling;

    // Lock the specific input and button
    btn.disabled = true;
    input.readOnly = true; // Use readOnly for input to allow copy, or disabled
    input.disabled = true; // disabled is safer for "closed" visual

    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    msg.textContent = '';

    // Collect all links (including the one just locked)
    const taskLinks = [];
    for (let i = 1; i <= 5; i++) {
        // value property is accessible even on disabled inputs
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
            msg.textContent = 'Progress saved!';
            msg.style.color = '#10b981';

            // Visual feedback for success
            btn.innerHTML = 'Saved';
            btn.style.backgroundColor = '#10b981'; // Green
            btn.style.borderColor = '#10b981';

            // Re-fetch dashboard to update progress bar and certificate status
            // This will re-set values but shouldn't un-disable the element
            loadUserDashboard();
        } else {
            throw new Error(data.message || 'Failed to save');
        }
    } catch (err) {
        msg.textContent = 'Error: ' + err.message;
        msg.style.color = '#ef4444';

        // Re-enable on error
        btn.disabled = false;
        input.disabled = false;
        btn.innerHTML = originalText;
    } finally {
        // Clear global message after delay
        setTimeout(() => {
            msg.textContent = '';
        }, 3000);
    }
}

// Request Certificate
async function requestCertificate() {
    if (!confirm('Are you sure you want to request your certificate? Ensure all 5 tasks are correct.')) return;

    try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE}/request-certificate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            loadUserDashboard(); // Refresh UI
        } else {
            alert(data.message || 'Request failed');
        }
    } catch (err) {
        alert('Server Error');
    }
}
