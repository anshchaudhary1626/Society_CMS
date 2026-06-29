require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const { ROLES } = require('./utils/constants');

const seedUsers = async () => {
  try {
    // 1. Connect to MongoDB Atlas (Development DB)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 2. Clear existing admin/worker test users to avoid duplicates
    await User.deleteMany({ email: { $in: ['admin@society.com', 'suresh@society.com'] } });

    // 3. Create Admin
    const admin = await User.create({
      name: 'Priya Sharma',
      email: 'admin@society.com',
      password: 'password123', // Will be hashed by user.model.js pre-save hook
      phone: '9998887776',
      role: ROLES.ADMIN
    });
    console.log('Admin user created successfully:', admin.email);

    // 4. Create Worker
    const worker = await User.create({
      name: 'Suresh Yadav',
      email: 'suresh@society.com',
      password: 'password123',
      phone: '9123456789',
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: ['plumbing'],
      activeComplaints: 0
    });
    console.log('Worker user created successfully:', worker.email);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedUsers();
