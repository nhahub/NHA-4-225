import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic 3: Habits API', () => {
  
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


  describe('POST /api/habits', () => {
    it('should create a boolean habit', async () => {
      const res = await request(app)
        .post('/api/habits').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Read Quran',
          category: 'education_work',
          type: 'boolean',
          frequency: { type: 'daily' }
        })
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('boolean');
    });

    it('should create a counter habit with MVD', async () => {
      const res = await request(app)
        .post('/api/habits').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Drink Water',
          category: 'health',
          type: 'counter',
          targetValue: 8,
          mvdValue: 2,
          mvdDescription: '2 cups minimum'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('counter');
    });
  });

  describe('POST /api/habits/:id/log', () => {
    let habitId;
    const dateStr = new Date().toISOString().split('T')[0];

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/habits').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Drink Water',
          category: 'health',
          type: 'counter',
          targetValue: 8,
          mvdValue: 2
        });
      habitId = res.body.data._id;
    });

    it('should log a habit', async () => {
      const res = await request(app)
        .post(`/api/habits/${habitId}/log`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          date: dateStr,
          value: 4,
          isMvd: true
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(4);
      expect(res.body.data.isMvd).toBe(true);
    });

    it('should update an existing log for the same date', async () => {
      await request(app)
        .post(`/api/habits/${habitId}/log`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ date: dateStr, value: 4 })
        .expect(200);

      const res = await request(app)
        .post(`/api/habits/${habitId}/log`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ date: dateStr, value: 8 }) // Updated to full target
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.value).toBe(8);
    });
  });
});
