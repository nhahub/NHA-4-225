import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';
import User from '../../models/User';

describe('Epic 0: Auth API', () => {
  const testUser = {
    name: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register').set("X-Requested-With", "XMLHttpRequest")
        .send(testUser)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      // Removed token assertion since register doesn't return one
    });

    it('should fail with duplicate email', async () => {
      // Setup: register first user
      await request(app).post('/api/auth/register').set("X-Requested-With", "XMLHttpRequest").send(testUser);

      // Attempt duplicate
      const res = await request(app)
        .post('/api/auth/register').set("X-Requested-With", "XMLHttpRequest")
        .send(testUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing verified user', async () => {
      // Setup
      await request(app).post('/api/auth/register').set("X-Requested-With", "XMLHttpRequest").send(testUser);
      // Manually verify user
      await User.updateOne({ email: testUser.email }, { isVerified: true });

      const res = await request(app)
        .post('/api/auth/login').set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      await request(app).post('/api/auth/register').set("X-Requested-With", "XMLHttpRequest").send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });

      const res = await request(app)
        .post('/api/auth/login').set("X-Requested-With", "XMLHttpRequest")
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
        
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('AUTH');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user and clear cookie', async () => {
      const res = await request(app)
        .post('/api/auth/logout').set("X-Requested-With", "XMLHttpRequest")
        .expect(200);
        
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie'].some(cookie => cookie.includes('accessToken=;'))).toBe(true);
    });
  });
});
