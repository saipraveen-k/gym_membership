require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN = {
  name: 'Gym Administrator',
  email: 'admin@gym.com',
  phone: '9876543210',
  password: 'Admin@123',
  role: 'admin',
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const existing = await User.findOne({ email: ADMIN.email }).select('+password');

    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`Existing user ${ADMIN.email} promoted to admin.`);
      } else {
        console.log(`Admin already exists: ${ADMIN.email} (no duplicate created).`);
      }
    } else {
      // Password is hashed by the User model pre-save hook (bcryptjs)
      await User.create(ADMIN);
      console.log('Admin account created successfully.');
      console.log(`  Email:    ${ADMIN.email}`);
      console.log(`  Password: ${ADMIN.password}`);
      console.log(`  Role:     admin`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:');
    console.error(`  ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
};

seedAdmin();
