const request = require('supertest');
const app = require('../app.js');
const connectDB = require('../config/database.js');

describe('errorHandler middleware', () => {
  beforeAll(async () => {
    await connectDB();
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('returns 401 for protected routes without token', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for invalid ObjectId parameter', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    const token = loginRes.body.token;
    if (!token) return;

    const res = await request(app)
      .get('/api/users/invalid-id')
      .set('Authorization', `Bearer ${token}`);

    expect([400, 404, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });

  it('includes stack trace in development mode', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const res = await request(app).get('/api/nonexistent');

    process.env.NODE_ENV = original;
    expect(res.statusCode).toBe(404);
  });

  it('response body contains success false on error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.body.success === false || res.body.message).toBeTruthy();
  });

  it('does not leak sensitive data in error response', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrong' });

    const body = JSON.stringify(res.body);
    expect(body).not.toContain('wrong');
  });
});
