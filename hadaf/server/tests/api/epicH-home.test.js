import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic HOME: Home Screen API (HOME-1 toast gating)', () => {
  let cookie;
  const testUser = {
    name: 'Test User',
    email: 'home-test@example.com',
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

  describe('PATCH /api/daily-summaries/:date/summary-shown', () => {
    const yesterdayStr = (() => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split('T')[0];
    })();

    it('requires authentication (401 without cookie)', async () => {
      const res = await request(app)
        .patch(`/api/daily-summaries/${yesterdayStr}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects malformed :date with VALIDATION 400', async () => {
      const res = await request(app)
        .patch('/api/daily-summaries/not-a-date/summary-shown')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION');
    });

    it('upserts the daily summary and flips summaryShown=true', async () => {
      const res = await request(app)
        .patch(`/api/daily-summaries/${yesterdayStr}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.date).toBe(yesterdayStr);
      expect(res.body.data.summary.summaryShown).toBe(true);
      expect(res.body.data.summary.dayState).toBeDefined();
      expect(res.body.data.wasNewlyShown).toBe(true);
    });

    it('is idempotent — second call returns wasNewlyShown=false and does not error', async () => {
      await request(app)
        .patch(`/api/daily-summaries/${yesterdayStr}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      const second = await request(app)
        .patch(`/api/daily-summaries/${yesterdayStr}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      expect(second.body.success).toBe(true);
      expect(second.body.data.summary.summaryShown).toBe(true);
      expect(second.body.data.wasNewlyShown).toBe(false);
    });

    it('only flips the requested date — does not touch other days', async () => {
      const dayA = '2026-01-10';
      const dayB = '2026-01-11';

      const dayARes = await request(app)
        .patch(`/api/daily-summaries/${dayA}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      const dayBRes = await request(app)
        .patch(`/api/daily-summaries/${dayB}/summary-shown`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Cookie', cookie)
        .send({})
        .expect(200);

      expect(dayARes.body.data.summary.summaryShown).toBe(true);
      expect(dayARes.body.data.wasNewlyShown).toBe(true);
      expect(dayBRes.body.data.summary.summaryShown).toBe(true);
      expect(dayBRes.body.data.wasNewlyShown).toBe(true);
      expect(dayARes.body.data.summary.date).toBe(dayA);
      expect(dayBRes.body.data.summary.date).toBe(dayB);
    });
  });
});