const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/tvarix');
        console.log('MongoDB Connected for Seeding');

        // Check if admin exists
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create Admin
        const newAdmin = new Admin({
            username: 'admin',
            password: hashedPassword
        });

        await newAdmin.save();
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
