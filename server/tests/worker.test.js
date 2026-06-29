const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Complaint = require('../models/complaint.model');
const Review = require('../models/review.model');
const { ROLES, STATUS } = require('../utils/constants');
require('./setup');

describe('Worker Operations Suite (Batch 3)', () => {
  let workerCookie;
  let residentId;
  let complaintId;

  beforeEach(async () => {
    // 1. Create and authenticate worker Suresh Plumber
    const worker = await User.create({
      name: "Suresh Yadav (Plumber)",
      email: "suresh.plumber@test.com",
      password: "password123",
      phone: "9123456789",
      role: ROLES.WORKER,
      isAvailable: true,
      specialization: ['plumbing'],
      activeComplaints: 0
    });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: "suresh.plumber@test.com",
        password: "password123"
      });
    workerCookie = loginRes.headers['set-cookie'];

    // 2. Create a resident
    const resident = await User.create({
      name: "Rajesh Kumar",
      email: "rajesh@society.com",
      password: "password123",
      phone: "9876543210",
      flatNumber: "B-402",
      role: ROLES.RESIDENT
    });
    residentId = resident._id;

    // 3. Seed an assigned complaint in database
    const complaint = await Complaint.create({
      resident: residentId,
      category: "plumbing",
      description: "Severe basin pipe leakage in master bathroom",
      status: STATUS.ASSIGNED,
      assignedWorker: worker._id
    });
    complaintId = complaint._id;
  });

  test('GET /api/worker/complaints - Should list complaints assigned to worker', async () => {
    const res = await request(app)
      .get('/api/worker/complaints')
      .set('Cookie', workerCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
    expect(res.body.data.complaints[0]._id.toString()).toBe(complaintId.toString());
  });

  test('PATCH /api/worker/complaints/:id/start - Should allow worker to start work', async () => {
    const res = await request(app)
      .patch(`/api/worker/complaints/${complaintId}/start`)
      .set('Cookie', workerCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint.status).toBe(STATUS.IN_PROGRESS);
  });

  test('PATCH /api/worker/complaints/:id/resolve - Should allow worker to mark task as resolved', async () => {
    // Manually set status to IN_PROGRESS
    await Complaint.findByIdAndUpdate(complaintId, { status: STATUS.IN_PROGRESS });

    const res = await request(app)
      .patch(`/api/worker/complaints/${complaintId}/resolve`)
      .set('Cookie', workerCookie)
      .send({
        resolutionNotes: "Fixed the leakage by coupling new PVC joints.",
        resolutionImage: "https://ik.imagekit.io/ansh2616/fixed_joints.jpg"
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.complaint.status).toBe(STATUS.RESOLVED);
    expect(res.body.data.complaint.resolutionNotes).toBe("Fixed the leakage by coupling new PVC joints.");
  });

  test('PATCH /api/worker/availability - Should toggle worker availability status', async () => {
    const res = await request(app)
      .patch('/api/worker/availability')
      .set('Cookie', workerCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.isAvailable).toBe(false); // Default true -> toggled to false
  });

});
