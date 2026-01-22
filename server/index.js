const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve Static Frontend Files with Absolute Path
// Serve Static Frontend Files with Absolute Path
app.use(express.static(path.join(__dirname, '../client'), { extensions: ['html'] }));

// Database Connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing in environment variables');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (err) {
        console.log(err);
    }
};

// Connect immediately but also ensure connection in middleware
connectDB();

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
const Service = require('./models/Service');
const Contact = require('./models/Contact');
const Internship = require('./models/Internship');
const Admin = require('./models/Admin');
const User = require('./models/User');
const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

// ... existing code ...

// --- Admin Routes ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ message: 'Invalid Username or Password' });

        const validPass = await bcrypt.compare(password, admin.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid Username or Password' });

        // Create Token
        const token = jwt.sign({ _id: admin._id, role: 'admin' }, 'SECRET_KEY_123'); // Use env var in prod
        res.header('Authorization', token).json({ token });
    } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Unified Login
app.post('/api/login', async (req, res) => {
    try {
        const username = req.body.username.trim();
        const password = req.body.password.trim();

        console.log(`[Login Attempt] Username: '${username}'`);

        // 1. Check Admin
        const admin = await Admin.findOne({ username });
        if (admin) {
            console.log('  -> Found Admin');
            const validPass = await bcrypt.compare(password, admin.password);
            if (validPass) {
                console.log('  -> Admin Password Valid');
                const token = jwt.sign({ _id: admin._id, role: 'admin' }, 'SECRET_KEY_123');
                return res.json({ token, role: 'admin' });
            } else {
                console.log('  -> Admin Password Invalid');
            }
        }

        // 2. Check User if not Admin
        if (admin) return res.status(400).json({ message: 'Invalid Username or Password' });

        const user = await User.findOne({ username });
        if (!user) {
            console.log('  -> User Not Found');
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        console.log('  -> Found User');
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            console.log('  -> User Password Invalid');
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        console.log('  -> User Password Valid');
        const token = jwt.sign({ _id: user._id, role: 'user' }, 'SECRET_KEY_123');
        res.header('Authorization', token).json({ token, domain: user.domain, role: 'user' });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Admin Create User
app.post('/api/admin/create-user', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });

        const username = req.body.username.trim();
        const password = req.body.password.trim();
        const { domain } = req.body;

        console.log(`[Create User] Creating user: '${username}'`);

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            domain
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- User Routes ---

// User Login
app.post('/api/user/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid Username or Password' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid Username or Password' });

        const token = jwt.sign({ _id: user._id, role: 'user' }, 'SECRET_KEY_123');
        res.header('Authorization', token).json({ token, domain: user.domain });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User Dashboard Data
app.get('/api/user/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User Submit Tasks
app.post('/api/user/submit-tasks', auth, async (req, res) => {
    try {
        const { taskLinks } = req.body;
        if (!taskLinks || !Array.isArray(taskLinks) || taskLinks.length > 5) {
            return res.status(400).json({ message: 'Invalid task links' });
        }

        const user = await User.findById(req.user._id);
        user.taskLinks = taskLinks;
        await user.save();

        res.json({ message: 'Tasks submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Protected Admin Data (Dashboard Stats)
app.get('/api/admin/data', auth, async (req, res) => {
    try {
        const contactCount = await Contact.countDocuments();
        const internshipCount = await Internship.countDocuments();
        const recentInternships = await Internship.find().sort({ createdAt: -1 }).limit(10);
        const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(10);

        // Fetch all users for tasks
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            internshipCount,
            recentInternships,
            contactCount,
            recentContacts,
            users // Return users
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export Internships to Excel
app.get('/api/internship/excel', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access Denied');
    try {
        const internships = await Internship.find().lean();

        // Transform data for Excel (flatten object if needed, handle dates)
        const data = internships.map(item => ({
            Name: item.name,
            College: item.collegeName,
            Course: item.course,
            Branch: item.branch,
            Year: item.academicYear,
            Domain: item.domain,
            Email: item.email,
            Phone: item.phone,
            AppliedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
        }));

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Internships");

        const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader('Content-Disposition', 'attachment; filename="Internship_Applications.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get All Services
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Submit Internship Application
app.post('/api/internship', async (req, res) => {
    try {
        const newInternship = new Internship(req.body);
        await newInternship.save();
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
