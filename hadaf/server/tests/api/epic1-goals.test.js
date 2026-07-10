import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic 1: Goals & Milestones API', () => {
  
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


  describe('POST /api/goals', () => {
    it('should create a goal successfully', async () => {
      const res = await request(app)
        .post('/api/goals').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Learn Node.js',
          description: 'Master backend development',
          category: 'education_work',
          measure: 'Complete 2 milestones',
          priority: 'high',
          cycleStart: new Date().toISOString(),
          cycleEnd: new Date(Date.now() + 86400000 * 84).toISOString(),
          milestones: ['Learn Express', 'Learn MongoDB']
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Learn Node.js');
    });

    it('should fail with invalid category', async () => {
      const res = await request(app)
        .post('/api/goals').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Invalid category goal',
          category: 'invalid', // should fail enum check
          priority: 'high'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });
  });

  describe('Milestones Operations', () => {
    let goalId;
    let milestoneId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/goals').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Test Goal',
          description: 'Test description',
          category: 'other',
          customCategory: 'My Custom Category',
          measure: 'Complete 1 milestone',
          priority: 'medium',
          cycleStart: new Date().toISOString(),
          cycleEnd: new Date(Date.now() + 86400000 * 84).toISOString(),
          milestones: ['Milestone 1']
        });
      goalId = res.body.data._id;
      const Milestone = require('../../models/Milestone');
      const milestone = await Milestone.findOne({ goalId });
      if (milestone) milestoneId = milestone._id;
    });

    it('should add a new milestone', async () => {
      const res = await request(app)
        .post(`/api/goals/${goalId}/milestones`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Milestone 2'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Milestone 2');
    });

    it('should toggle milestone completion', async () => {
      const res = await request(app)
        .patch(`/api/milestones/${milestoneId}/toggle`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.is_completed).toBe(true);
      expect(res.body.data.completed_at).not.toBeNull();
    });
  });
});
