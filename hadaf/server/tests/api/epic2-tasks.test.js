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

  describe('Goal-linked tasks drive goal & milestone progress', () => {
    let goalId;
    let milestoneId;

    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Ship the feature',
          category: 'education_work',
          targetPoints: 100,
          cycleStart: new Date().toISOString(),
          cycleEnd: new Date(Date.now() + 86400000 * 84).toISOString(),
        });
      goalId = goalRes.body.data._id;

      const milestoneRes = await request(app)
        .post(`/api/goals/${goalId}/milestones`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ title: 'Milestone 1' });
      milestoneId = milestoneRes.body.data.id;
    });

    it('should update goal and milestone progress when a goal-linked task completes', async () => {
      const taskRes = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Write the spec',
          goalId,
          milestoneId,
          goalPointsPlanned: 40,
          date: new Date().toISOString().split('T')[0],
        })
        .expect(201);
      const taskId = taskRes.body.data._id;

      await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ goalPointsEarned: 40 })
        .expect(200);

      const detailRes = await request(app)
        .get(`/api/goals/${goalId}`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .expect(200);

      expect(detailRes.body.data.goal.progress).toBe(40);
      const milestone = detailRes.body.data.milestones.find((m) => m.id === milestoneId || m._id === milestoneId);
      expect(milestone.progress).toBe(100);
      expect(milestone.is_completed).toBe(true);
    });

    it('should reject a milestoneId that does not belong to the given goal', async () => {
      const otherGoalRes = await request(app)
        .post('/api/goals').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Unrelated goal',
          category: 'health',
          targetPoints: 50,
          cycleStart: new Date().toISOString(),
          cycleEnd: new Date(Date.now() + 86400000 * 84).toISOString(),
        });

      const res = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Mismatched milestone',
          goalId: otherGoalRes.body.data._id,
          milestoneId,
          date: new Date().toISOString().split('T')[0],
        })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.field).toBe('milestoneId');
    });
  });
});
