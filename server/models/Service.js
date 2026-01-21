const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true } // Storing icon name for Lucide/Heroicons
});

module.exports = mongoose.model('Service', ServiceSchema);
