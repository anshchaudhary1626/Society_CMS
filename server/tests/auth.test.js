const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
require('./setup');

describe('Authentication API Suite (Batch 1)', () => {

  test('POST /api/auth/register - Should register a resident and set cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Rajesh Kumar",
        email: "rajesh@society.com",
        password: "password123",
        phone: "9876543210",
        flatNumber: "B-402"
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.user.email).toBe('rajesh@society.com');
    expect(res.body.user.password).toBeUndefined(); // Verify password hash is hidden
    expect(res.headers['set-cookie']).toBeDefined(); // Verify session cookie is set
  });

  test('POST /api/auth/register - Should reject registration with validation error (missing name)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: "rajesh.bad@society.com",
        password: "password123",
        phone: "9876543210",
        flatNumber: "B-402"
        // missing name
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/register - Should block duplicate registrations', async () => {
    // Register first user
    await User.create({
      name: "Duplicate User",
      email: "duplicate@society.com",
      password: "password123",
      phone: "9876543210",
      flatNumber: "B-402"
    });

    // Try to register again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Duplicate User",
        email: "duplicate@society.com",
        password: "password123",
        phone: "9876543210",
        flatNumber: "B-402"
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  test('POST /api/auth/login - Should login and return session cookie', async () => {
    await User.create({
      name: "Login User",
      email: "login@society.com",
      password: "password123",
      phone: "9876543210",
      flatNumber: "B-402"
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "login@society.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login - Should block login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "nonexistent@society.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  test('GET /api/auth/me - Should return profile of authenticated user', async () => {
    // 1. Register a user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Me User",
        email: "me@society.com",
        password: "password123",
        phone: "9876543210",
        flatNumber: "B-402"
      });

    // 2. Extract cookie
    const cookie = registerRes.headers['set-cookie'];

    // 3. Request profile using the cookie
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.user.email).toBe('me@society.com');
  });

  test('POST /api/auth/logout - Should clear session cookies', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('loggedout'); // Cookie contains cleared string
  });

});
