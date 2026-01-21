const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    domain: {
        type: String, // e.g., 'Frontend Dev', 'App Dev'
        required: true
    },
    taskLinks: {
        type: [String], // Array of 5 URL strings
        default: []
    }
});

module.exports = mongoose.model('User', UserSchema);
