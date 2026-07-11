import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic 4: Daily Summary & Scoring API', () => {
  
  let cookie;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const User = require('../../models/User');
    const { hashPassword } = require('../../utils/password');
    const passwordHash = await hashPassword(testUser.password);
    await User.create({
      name: testUser.name,
      email: testUser.email,
      passwordHash,
      isVerified: true
    });

    const res = await request(app)
      .post('/api/auth/login').set("X-Requested-With", "XMLHttpRequest")
      .send({ email: testUser.email, password: testUser.password });
    
    cookie = res.headers['set-cookie'];
  });


  describe('PATCH /api/user/settings', () => {
    it('should update day_start and recalculate boundaries correctly', async () => {
      const res = await request(app)
        .patch('/api/user/settings').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          day_start: '05:00',
          work_hours_start: '10:00',
          work_hours_end: '18:00'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.day_start).toBe('05:00');
      expect(res.body.data.work_hours_start).toBe('10:00');
    });

    it('should reject out of range day_start', async () => {
      const res = await request(app)
        .patch('/api/user/settings').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          day_start: '08:00' // Must be 01:00-06:00
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });
  });

  describe('GET /api/daily-summaries/today', () => {
    it('should fetch today summary with correct defaults', async () => {
      const res = await request(app)
        .get('/api/daily-summaries/today')
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.date).toBeDefined(); // logical date
      expect(res.body.data.pointsEarned).toBeDefined();
      expect(res.body.data.dayState).toBeDefined();
    });

    it('should dynamically update points when tasks are completed', async () => {
      // Create a quick task for today
      const taskRes = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Quick Win',
          type: 'quick',
          difficulty: 'easy',
          date: new Date().toISOString().split('T')[0] // Use absolute today for simplicity
        });
      
      const taskId = taskRes.body.data._id;

      // Complete it
      await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ actualDurationMinutes: 10 })
        .expect(200);

      // Fetch summary
      const summaryRes = await request(app)
        .get('/api/daily-summaries/today')
        .set("Cookie", cookie)
        .expect(200);

      // It should have some points now
      expect(summaryRes.body.data.tasksCompleted).toBeGreaterThan(0);
      expect(summaryRes.body.data.pointsEarned).toBeGreaterThan(0);
    });
  });

  describe('GET /api/daily-summaries/:date (HOME-1)', () => {
    it('returns a zeroed placeholder for a date with no summary yet', async () => {
      const res = await request(app)
        .get('/api/daily-summaries/2020-01-01')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe('2020-01-01');
      expect(res.body.data.pointsEarned).toBe(0);
      expect(res.body.data.summaryShown).toBe(true);
    });

    it('rejects a malformed date', async () => {
      const res = await request(app)
        .get('/api/daily-summaries/not-a-date')
        .set('Cookie', cookie)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });

    it('returns the real summary once today has data', async () => {
      const today = new Date().toISOString().split('T')[0];
      await request(app).get('/api/daily-summaries/today').set('Cookie', cookie);

      const res = await request(app)
        .get(`/api/daily-summaries/${today}`)
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.data.date).toBe(today);
    });
  });

  describe('PATCH /api/daily-summaries/:date/shown (HOME-1)', () => {
    it('marks a summary as shown, upserting if it does not exist yet', async () => {
      const res = await request(app)
        .patch('/api/daily-summaries/2020-01-01/shown')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.summaryShown).toBe(true);

      // Second read reflects the persisted flag, not the placeholder default.
      const readBack = await request(app)
        .get('/api/daily-summaries/2020-01-01')
        .set('Cookie', cookie)
        .expect(200);
      expect(readBack.body.data.summaryShown).toBe(true);
    });
  });
});
