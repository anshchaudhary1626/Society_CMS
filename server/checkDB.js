require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Complaint = require('./models/complaint.model');

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  const complaints = await Complaint.find({});
  console.log('--- USERS IN DB ---');
  console.log(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, isAvailable: u.isAvailable, specialization: u.specialization, activeComplaints: u.activeComplaints })));
  console.log('--- COMPLAINTS IN DB ---');
  console.log(complaints.map(c => ({ id: c._id, complaintId: c.complaintId, category: c.category, status: c.status, assignedWorker: c.assignedWorker })));
  process.exit(0);
};

check();
