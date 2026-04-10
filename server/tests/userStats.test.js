const request = require('supertest');
const app = require('../app.js');
const connectDB = require('../config/database.js');
const { clearStatsCache } = require('../controllers/userController.js');
const mongoose = require('mongoose');
const User = require('../models/User.js');

let patientToken, doctorToken, adminToken;
const testEmails = [];

const registerAndLogin = async (userData) => {
  await request(app).post('/api/auth/register').send(userData);
  testEmails.push(userData.email);
  const res = await request(app).post('/api/auth/login').send({
    email: userData.email,
    password: userData.password,
  });
  return res.body.token;
};

describe('GET /api/users/stats', () => {
  beforeAll(async () => {
    await connectDB();

    patientToken = await registerAndLogin({
      name: 'Stats Patient',
      email: 'stats-patient@test.com',
      password: 'Test1234',
      role: 'patient',
    });

    doctorToken = await registerAndLogin({
      name: 'Stats Doctor',
      email: 'stats-doctor@test.com',
      password: 'Test1234',
      role: 'doctor',
      specialization: 'General',
    });

    adminToken = await registerAndLogin({
      name: 'Stats Admin',
      email: 'stats-admin@test.com',
      password: 'Test1234',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: [...testEmails, 'new-user-cache@test.com'] } });
    await mongoose.disconnect();
  });

  beforeEach(() => {
    clearStatsCache();
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/users/stats');
    expect(res.statusCode).toBe(401);
  });

  it('should return patient stats', async () => {
    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty('myAppointments');
    expect(res.body.stats).toHaveProperty('upcomingAppointments');
    expect(res.body.stats).toHaveProperty('myReports');
    expect(res.body.stats).toHaveProperty('myAnalyses');
  });

  it('should return doctor stats', async () => {
    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty('myAppointments');
    expect(res.body.stats).toHaveProperty('pendingAppointments');
    expect(res.body.stats).toHaveProperty('completedAppointments');
    expect(res.body.stats).toHaveProperty('myAnalyses');
    expect(res.body.stats).toHaveProperty('totalPatients');
  });

  it('should return admin stats', async () => {
    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty('totalUsers');
    expect(res.body.stats).toHaveProperty('totalPatients');
    expect(res.body.stats).toHaveProperty('totalDoctors');
    expect(res.body.stats).toHaveProperty('totalAppointments');
    expect(res.body.stats).toHaveProperty('totalAnalyses');
    expect(res.body.stats).toHaveProperty('pendingAppointments');
  });

  it('should return cached response on second call', async () => {
    const first = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    const second = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(first.body.stats).toEqual(second.body.stats);
  });

  it('should return fresh data after cache is cleared', async () => {
    const first = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    clearStatsCache();

    const second = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(second.statusCode).toBe(200);
    expect(second.body.stats).toHaveProperty('totalUsers');
  });

  it('should invalidate cache when a new user registers', async () => {
    await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'new-user-cache@test.com',
      password: 'Test1234',
      role: 'patient',
    });

    expect(regRes.statusCode).toBe(201);

    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(4);
  });

  it('should respond within 100ms', async () => {
    // warm the cache
    await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    const start = Date.now();
    const res = await request(app)
      .get('/api/users/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    const elapsed = Date.now() - start;

    expect(res.statusCode).toBe(200);
    expect(elapsed).toBeLessThan(100);
  });
});
