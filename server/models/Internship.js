const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
    name: { type: String, required: true },
    collegeName: { type: String, required: true },
    course: { type: String, required: true },
    branch: { type: String, required: true },
    academicYear: { type: String, required: true }, // e.g., 1st, 2nd, 3rd, 4th
    domain: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Internship', InternshipSchema);
