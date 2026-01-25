// Base API URL
const API_BASE = '/api/admin';

// Login Handling
const loginForm = document.getElementById('login-form');
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
                } else if (data.role === 'user') {
                    // Start user session
                    localStorage.setItem('userToken', data.token);
                    window.location.href = 'user-dashboard.html';
                } else {
                    msg.textContent = 'Unknown Role';
                }
            } else {
                msg.textContent = data.message || 'Login failed';
            }
        } catch (err) {
            msg.textContent = 'Server Error. Please ensure backend is running.';
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
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });
}

// Dashboard Data Loading
// Create User Handling
const createUserForm = document.getElementById('create-user-form');
if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = createUserForm.username.value;
        const password = createUserForm.password.value;
        const domain = createUserForm.domain.value;
        const msg = document.getElementById('create-user-msg');
        const btn = createUserForm.querySelector('.btn-submit');

        btn.disabled = true;
        btn.textContent = 'Creating...';
        msg.textContent = '';
        msg.style.color = 'var(--gray-600)';

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, domain })
            });

            const data = await res.json();

            if (res.ok) {
                msg.textContent = 'User created successfully!';
                msg.style.color = 'var(--secondary)';
                createUserForm.reset();
            } else {
                msg.textContent = data.message || 'Failed to create user';
                msg.style.color = '#ef4444';
            }
        } catch (err) {
            msg.textContent = 'Error connecting to server';
            msg.style.color = '#ef4444';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create User';
        }
    });
}

async function loadDashboardData() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/data`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            // Token Invalid/Expired
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
            return;
        }

        const data = await res.json();

        // Update Stats
        document.getElementById('stat-interns').textContent = data.internshipCount;
        document.getElementById('stat-contacts').textContent = data.contactCount;

        // Render Recent Internships
        const internTable = document.getElementById('interns-table-body');
        internTable.innerHTML = data.recentInternships.map(i => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 0.75rem; font-weight: 500;">${i.name}</td>
                <td style="padding: 0.75rem;">${i.domain}</td>
                <td style="padding: 0.75rem;">${i.academicYear}</td>
                <td style="padding: 0.75rem;">${i.phone}</td>
                <td style="padding: 0.75rem; color: var(--gray-600); font-size: 0.875rem;">${new Date(i.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');

        // Render Student Tasks
        const usersTable = document.getElementById('users-table-body');
        if (usersTable && data.users) {
            usersTable.innerHTML = data.users.map(u => {
                const linksHtml = u.taskLinks && u.taskLinks.length > 0
                    ? u.taskLinks.map((link, i) => `<a href="${link}" target="_blank" style="color: var(--secondary); margin-right: 10px;">Task ${i + 1}</a>`).join('')
                    : '<span style="color: var(--gray-400);">No submissions</span>';

                return `
                <tr style="border-bottom: 1px solid var(--gray-100);">
                    <td style="padding: 0.75rem; font-weight: 500;">${u.username}</td>
                    <td style="padding: 0.75rem;">${u.domain}</td>
                    <td style="padding: 0.75rem;">
                        <span style="
                            padding: 0.25rem 0.5rem; 
                            border-radius: 9999px; 
                            font-size: 0.75rem; 
                            font-weight: 600;
                            background: ${u.certificateStatus === 'Approved' ? '#d1fae5' : u.certificateStatus === 'Requested' ? '#fef3c7' : '#f3f4f6'};
                            color: ${u.certificateStatus === 'Approved' ? '#065f46' : u.certificateStatus === 'Requested' ? '#b45309' : '#4b5563'};
                        ">
                            ${u.certificateStatus || 'Not Requested'}
                        </span>
                    </td>
                    <td style="padding: 0.75rem;">${linksHtml}</td>
                </tr>
            `}).join('');
        }

        // Render Recent Contacts
        const contactsList = document.getElementById('contacts-list');
        contactsList.innerHTML = data.recentContacts.map(c => `
             <div style="padding: 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">${c.name}</span>
                    <span style="font-size: 0.75rem; color: var(--gray-600);">${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.5rem;">${c.message}</p>
                <a href="mailto:${c.email}" style="font-size: 0.75rem; color: var(--secondary); text-decoration: none;">Reply to ${c.email}</a>
            </div>
        `).join('');

    } catch (err) {
        console.error('Data Load Error:', err);
    }
}

// Secure Excel Download
async function downloadExcel() {
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Please login as admin');

    try {
        const res = await fetch(`${API_BASE}/../internship/excel`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Internship_Applications.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } else {
            alert('Failed to download: Access Denied');
        }
    } catch (err) {
        console.error('Download Error:', err);
        alert('Error downloading file');
    }
}
