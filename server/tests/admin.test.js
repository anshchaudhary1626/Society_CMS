const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Complaint = require('../models/complaint.model');
const { ROLES, STATUS } = require('../utils/constants');
require('./setup');

describe('Admin Management Suite (Batch 4)', () => {
  let adminCookie;
  let residentId;
  let workerId;
  let complaintId;

  beforeEach(async () => {
    // 1. Create and authenticate Admin Priya
    const admin = await User.create({
      name: "Priya Sharma (Admin)",
      email: "admin@society.com",
      password: "password123",
      phone: "9998887776",
      role: ROLES.ADMIN
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: "admin@society.com",
        password: "password123"
      });
    adminCookie = loginRes.headers['set-cookie'];

    // 2. Create Resident Rajesh
    const resident = await User.create({
      name: "Rajesh Kumar",
      email: "rajesh@society.com",
      password: "password123",
      phone: "9876543210",
      flatNumber: "B-402",
      role: ROLES.RESIDENT
    });
    residentId = resident._id;

    // 3. Create Worker Suresh
    const worker = await User.create({
      name: "Suresh Yadav (Plumber)",
      email: "suresh@society.com",
      password: "password123",
      phone: "9123456789",
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: ['plumbing'],
      activeComplaints: 1
    });
    workerId = worker._id;

    // 4. Create Complaint
    const complaint = await Complaint.create({
      resident: residentId,
      category: "plumbing",
      description: "Severe PVC union pipe leakage.",
      status: STATUS.ASSIGNED,
      assignedWorker: workerId
    });
    complaintId = complaint._id;
  });

  test('GET /api/admin/complaints - Should list all complaints', async () => {
    const res = await request(app)
      .get('/api/admin/complaints')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
  });

  test('GET /api/admin/stats - Should retrieve analytics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.statusCounts).toBeDefined();
    expect(res.body.data.categoryCounts).toBeDefined();
  });

  test('POST /api/admin/workers - Should allow admin to register a new worker', async () => {
    const res = await request(app)
      .post('/api/admin/workers')
      .set('Cookie', adminCookie)
      .send({
        name: "Ramesh Dev (Electrician)",
        email: "ramesh@society.com",
        password: "password123",
        phone: "9988776655",
        specialization: ["electricity"]
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.worker.email).toBe('ramesh@society.com');
  });

  test('PATCH /api/admin/complaints/:id/assign - Should allow manual worker reassignment', async () => {
    // A. Create another available worker (Ramesh Plumber 2) to reassign to
    const newWorker = await User.create({
      name: "Ramesh Yadav (Plumber 2)",
      email: "ramesh.plumber2@society.com",
      password: "password123",
      phone: "9000011111",
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: ['plumbing'],
      activeComplaints: 0
    });

    const res = await request(app)
      .patch(`/api/admin/complaints/${complaintId}/assign`)
      .set('Cookie', adminCookie)
      .send({
        workerId: newWorker._id
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint.assignedWorker.toString()).toBe(newWorker._id.toString());

    // B. Check workloads: Old worker Suresh decremented, New worker Ramesh incremented
    const updatedOldWorker = await User.findById(workerId);
    const updatedNewWorker = await User.findById(newWorker._id);
    expect(updatedOldWorker.activeComplaints).toBe(0); // 1 -> 0
    expect(updatedNewWorker.activeComplaints).toBe(1); // 0 -> 1
  });

  test('GET /api/admin/residents - Should list all residents', async () => {
    const res = await request(app)
      .get('/api/admin/residents')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
  });

});
