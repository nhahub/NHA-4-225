import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic ONB: Onboarding API', () => {
  let cookie;
  const testUser = {
    name: 'Onboarding Tester',
    email: 'onboarding@example.com',
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
      isVerified: true,
    });

    const res = await request(app)
      .post('/api/auth/login').set('X-Requested-With', 'XMLHttpRequest')
      .send({ email: testUser.email, password: testUser.password });

    cookie = res.headers['set-cookie'];
  });

  describe('POST /api/user/onboarding/complete', () => {
    it('requires authentication (401 without cookie)', async () => {
      const res = await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('AUTH');
    });

    it('flips User.onboardingCompleted from false to true on first call', async () => {
      const User = require('../../models/User');

      // Sanity: freshly registered user starts at onboardingCompleted=false
      const before = await User.findOne({ email: testUser.email });
      expect(before?.onboardingCompleted).toBe(false);

      const res = await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.onboardingCompleted).toBe(true);

      // Confirm the persistence side: the user doc itself is flipped
      const after = await User.findOne({ email: testUser.email });
      expect(after?.onboardingCompleted).toBe(true);
    });

    it('is idempotent — a second call still returns success and the flag stays true', async () => {
      await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      const second = await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      expect(second.body.success).toBe(true);
      expect(second.body.data.user.onboardingCompleted).toBe(true);
    });

    it('writes an onboarding_complete AnalyticsEvent row', async () => {
      const AnalyticsEvent = require('../../models/AnalyticsEvent');
      const User = require('../../models/User');
      const user = await User.findOne({ email: testUser.email });

      await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      const events = await AnalyticsEvent.find({
        userId: user._id,
        eventType: 'onboarding_complete',
      });
      expect(events).toHaveLength(1);
      expect(events[0].userId.toString()).toBe(user._id.toString());
    });

    it('returns the same user shape as authController (id, email, name, onboardingCompleted, settings)', async () => {
      const res = await request(app)
        .post('/api/user/onboarding/complete').set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      const u = res.body.data.user;
      expect(u).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
          onboardingCompleted: expect.any(Boolean),
          settings: expect.any(Object),
        }),
      );
      expect(u.email).toBe(testUser.email);
      expect(u.onboardingCompleted).toBe(true);
      // settings surface mirrors the User.settings schema defaults
      expect(u.settings).toEqual(
        expect.objectContaining({
          work_hours_start: expect.any(String),
          work_hours_end: expect.any(String),
          off_days: expect.any(Array),
        }),
      );
    });
  });
});