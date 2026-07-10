import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic 2: Tasks API', () => {
  
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


  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      const res = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Deep Work Session',
          type: 'flexible',
          difficulty: 'hard',
          date: new Date().toISOString().split('T')[0],
          plannedDurationMinutes: 120
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Deep Work Session');
      expect(res.body.data.status).toBe('pending');
    });

    it('should calculate points for deep_work based on difficulty', async () => {
      const res = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Deep Work Easy',
          type: 'flexible',
          difficulty: 'easy',
          date: new Date().toISOString().split('T')[0],
          plannedDurationMinutes: 60
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      // Base points for easy deep work is 3 * (60/30) = 6 points
      expect(res.body.data.predictedPoints).toBe(6);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    let taskId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Complete Me',
          type: 'quick',
          difficulty: 'easy',
          date: new Date().toISOString().split('T')[0]
        });
      taskId = res.body.data._id;
    });

    it('should complete a task and award points', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ actualDurationMinutes: 15 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.pointsEarned).toBeGreaterThan(0);
      expect(res.body.data.streakDays).toBeDefined();
    });

    it('should prevent double completion', async () => {
      await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .expect(200);

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });
  });
});
