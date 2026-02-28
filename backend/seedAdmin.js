require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wastewatch');

        const exists = await User.findOne({ email: 'admin@wastewatch.com' });
        if (exists) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        const admin = new User({
            fullName: 'System Administrator',
            email: 'admin@wastewatch.com',
            phone: '0000000000',
            password: 'adminpassword123',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user seeded successfully. Login: admin@wastewatch.com / adminpassword123');
        process.exit(0);

    } catch (err) {
        console.error('Failed to seed admin:', err);
        process.exit(1);
    }
};

seedAdmin();
