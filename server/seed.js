const mongoose = require('mongoose');
const Service = require('./models/Service');
// require('dotenv').config(); // caused issues

const MONGO_URI = "mongodb://127.0.0.1:27017/tvarix";

const services = [
    {
        title: "Certified Electrical Professionals",
        description: "Expert electrical services for residential and commercial needs.",
        icon: "Zap"
    },
    {
        title: "Experienced Plumbing Specialists",
        description: "Reliable plumbing solutions for all your maintenance needs.",
        icon: "Droplets"
    },
    {
        title: "Technical Maintenance Experts",
        description: "Comprehensive technical support and maintenance.",
        icon: "Wrench"
    },
    {
        title: "Qualified Academic Tutors",
        description: "Personalized tutoring to achieve academic excellence.",
        icon: "BookOpen"
    }
];

console.log("Connecting to:", MONGO_URI);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB Connected');
        await Service.deleteMany({});
        await Service.insertMany(services);
        console.log('Services Seeded');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error("Connection Error:", err);
        process.exit(1);
    });
