const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Complaint = require('../models/complaint.model');
const { ROLES, STATUS } = require('../utils/constants');
require('./setup');

describe('Resident Complaint Management Suite (Batch 2)', () => {
  let residentCookie;
  let workerId;

  beforeEach(async () => {
    // 1. Create a Plumber worker
    const worker = await User.create({
      name: "Suresh Yadav (Plumber)",
      email: "suresh@society.com",
      password: "password123",
      phone: "9123456789",
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: ['plumbing'],
      activeComplaints: 0
    });
    workerId = worker._id;

    // 2. Register resident
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Rajesh Kumar",
        email: "rajesh@society.com",
        password: "password123",
        phone: "9876543210",
        flatNumber: "B-402"
      });
    residentCookie = regRes.headers['set-cookie'];
  });

  test('POST /api/complaints - Should submit a complaint and auto-route to Plumber', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Cookie', residentCookie)
      .send({
        category: "plumbing",
        description: "Bathroom basin faucet is leaking severely."
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint.status).toBe(STATUS.ASSIGNED);
    expect(res.body.data.complaint.assignedWorker.toString()).toBe(workerId.toString());

    // Verify worker load incremented
    const updatedWorker = await User.findById(workerId);
    expect(updatedWorker.activeComplaints).toBe(1);
  });

  test('GET /api/complaints/my - Should fetch logged-in resident complaints', async () => {
    // Submit a complaint
    await request(app)
      .post('/api/complaints')
      .set('Cookie', residentCookie)
      .send({
        category: "plumbing",
        description: "Bathroom basin faucet is leaking severely."
      });

    const res = await request(app)
      .get('/api/complaints/my')
      .set('Cookie', residentCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
  });

  test('GET /api/complaints/:id - Should retrieve details of a complaint', async () => {
    const newComp = await request(app)
      .post('/api/complaints')
      .set('Cookie', residentCookie)
      .send({
        category: "plumbing",
        description: "Bathroom basin faucet is leaking severely."
      });
    const id = newComp.body.data.complaint._id;

    const res = await request(app)
      .get(`/api/complaints/${id}`)
      .set('Cookie', residentCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint._id.toString()).toBe(id.toString());
  });

  test('PATCH /api/complaints/:id/close - Should allow resident to close resolved complaints', async () => {
    const newComp = await request(app)
      .post('/api/complaints')
      .set('Cookie', residentCookie)
      .send({
        category: "plumbing",
        description: "Bathroom basin faucet is leaking severely."
      });
    const id = newComp.body.data.complaint._id;

    // Manually transition status to RESOLVED (simulating worker resolve)
    await Complaint.findByIdAndUpdate(id, { status: STATUS.RESOLVED });

    const res = await request(app)
      .patch(`/api/complaints/${id}/close`)
      .set('Cookie', residentCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    
    // Verify worker workload decremented back to 0
    const updatedWorker = await User.findById(workerId);
    expect(updatedWorker.activeComplaints).toBe(0);
  });

  test('PATCH /api/complaints/:id/reopen - Should allow resident to reopen resolved complaints', async () => {
    const newComp = await request(app)
      .post('/api/complaints')
      .set('Cookie', residentCookie)
      .send({
        category: "plumbing",
        description: "Bathroom basin faucet is leaking severely."
      });
    const id = newComp.body.data.complaint._id;

    // Manually set status to RESOLVED
    await Complaint.findByIdAndUpdate(id, { status: STATUS.RESOLVED });

    const res = await request(app)
      .patch(`/api/complaints/${id}/reopen`)
      .set('Cookie', residentCookie)
      .send({
        reopenReason: "Faucet still dripping under high pressure."
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint.status).toBe(STATUS.ASSIGNED); // Reassigned to Plumber
  });

});
