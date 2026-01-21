const fs = require('fs');

// Use global fetch if available (Node 18+), otherwise try require (for node-fetch v2)
const fetch = global.fetch || require('node-fetch');

const API_URL = 'http://localhost:5000/api';

// Global variables for test data
let ADMIN_TOKEN = '';
let USER_TOKEN = '';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'adminpassword';
const TEST_USER = `student_${Date.now()}`;
const TEST_PASS = 'studentpassword';
const TEST_DOMAIN = 'Frontend Development';

async function test() {
    console.log('Starting Verification...');

    // 3. Admin Login
    console.log('Testing Admin Login...');
    const adminRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS })
    });

    if (!adminRes.ok) {
        const text = await adminRes.text();
        console.error(`Admin Login Response: ${adminRes.status} ${adminRes.statusText}`);
        console.error(`Body: ${text}`);
        throw new Error(`Admin Login Failed: ${adminRes.statusText}`);
    }

    const adminData = await adminRes.json();
    if (!adminData.token || adminData.role !== 'admin') throw new Error('Admin Login did not return token or correct role');
    ADMIN_TOKEN = adminData.token;
    console.log('Admin Login Successful');

    // 4. Create User
    console.log('Testing Create User...');
    const createRes = await fetch(`${API_URL}/admin/create-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}` // Start Bearer
        },
        body: JSON.stringify({ username: TEST_USER, password: TEST_PASS, domain: TEST_DOMAIN })
    });

    if (!createRes.ok) {
        // If user already exists, that's fine for this test, but let's check
        const text = await createRes.text();
        if (createRes.status !== 400 || !text.includes('already exists')) {
            throw new Error(`Create User Failed: ${text}`);
        }
        console.log('User already exists (or created successfully)');
    } else {
        console.log('User Created Successfully');
    }

    // 5. User Login
    console.log('Testing User Login...');
    const userRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER, password: TEST_PASS })
    });

    if (!userRes.ok) throw new Error('User Login Failed');
    const userData = await userRes.json();
    if (!userData.token || userData.role !== 'user') throw new Error('User Login did not return token or correct role');
    USER_TOKEN = userData.token;
    console.log('User Login Successful');

    // 4. Submit Tasks
    console.log('[4] Submitting Tasks...');
    const taskLinks = [
        'https://github.com/user/project1',
        'https://github.com/user/project2',
        'https://github.com/user/project3',
        'https://github.com/user/project4',
        'https://github.com/user/project5'
    ];

    const submitRes = await fetch(`${API_URL}/user/submit-tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': userToken
        },
        body: JSON.stringify({ taskLinks })
    });

    if (!submitRes.ok) {
        const err = await submitRes.json();
        throw new Error(`Submit Tasks Failed: ${err.message}`);
    }
    console.log('    Success. Tasks submitted.');

    // 5. Verify Dashboard Data
    console.log('[5] Verifying User Dashboard Data...');
    const dashRes = await fetch(`${API_URL}/user/dashboard`, {
        headers: { 'Authorization': userToken }
    });

    if (!dashRes.ok) throw new Error(`Get Dashboard Failed`);
    const dashData = await dashRes.json();

    if (dashData.taskLinks.length !== 5 || dashData.taskLinks[0] !== taskLinks[0]) {
        throw new Error('Task Links verification failed! Data mismatch.');
    }
    console.log('    Success. Data persisted correctly.');

    // 6. Submit Contact Form
    console.log('[6] Submitting Contact Form...');
    const contactPayload = {
        name: 'Test Visitor',
        email: 'visitor@example.com',
        message: 'This is a test message from verify-flow.js'
    };

    const contactRes = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
    });

    if (!contactRes.ok) {
        const err = await contactRes.json();
        throw new Error(`Contact Submit Failed: ${err.message}`);
    }
    console.log('    Success. Contact message sent.');

    // 7. Submit Internship Application
    console.log('[7] Submitting Internship Application...');
    const internPayload = {
        name: 'Test Intern',
        collegeName: 'Test College',
        course: 'Test Course',
        branch: 'CS',
        academicYear: '2026',
        domain: 'Frontend Dev',
        email: 'intern@example.com',
        phone: '1234567890'
    };

    const internRes = await fetch(`${API_URL}/internship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internPayload)
    });

    if (!internRes.ok) {
        const err = await internRes.json();
        throw new Error(`Internship Submit Failed: ${err.message}`);
    }
    console.log('    Success. Internship application sent.');

    // 8. Verify Admin Data Updates
    console.log('[8] Verifying Admin Dashboard Stats...');
    const adminDataRes = await fetch(`${API_URL}/admin/data`, {
        headers: { 'Authorization': adminToken }
    });

    if (!adminDataRes.ok) throw new Error(`Get Admin Data Failed`);
    const adminStats = await adminDataRes.json();

    if (typeof adminStats.contactCount !== 'number' || typeof adminStats.internshipCount !== 'number') {
        throw new Error('Admin stats format incorrect.');
    }
    console.log(`    Success. Admin sees ${adminStats.contactCount} contacts and ${adminStats.internshipCount} internships.`);

    console.log('\nALL TESTS PASSED ✔');
}

test().catch(err => {
    console.error('\nTEST FAILED ❌');
    console.error(err);
    process.exit(1);
});

