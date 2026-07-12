import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Epic 6: Analytics API', () => {

  let cookie;
  const testUser = {
    name: 'Analytics User',
    email: 'analytics@example.com',
    password: 'password123',
  };

  const todayStr = () => new Date().toISOString().split('T')[0];

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

  describe('auth & validation', () => {
    it('rejects unauthenticated requests', async () => {
      await request(app).get('/api/analytics/overview').expect(401);
      await request(app).get('/api/analytics/habits').expect(401);
    });

    it('rejects from > to with VALIDATION', async () => {
      const res = await request(app)
        .get('/api/analytics/overview?from=2026-07-10&to=2026-07-01')
        .set("Cookie", cookie)
        .expect(400);
      expect(res.body.errorCode).toBe('VALIDATION');
    });

    it('rejects malformed dates with VALIDATION', async () => {
      const res = await request(app)
        .get('/api/analytics/overview?from=10-07-2026')
        .set("Cookie", cookie)
        .expect(400);
      expect(res.body.errorCode).toBe('VALIDATION');
    });

    it('rejects a span larger than 92 days', async () => {
      const res = await request(app)
        .get('/api/analytics/overview?from=2026-01-01&to=2026-07-01')
        .set("Cookie", cookie)
        .expect(400);
      expect(res.body.errorCode).toBe('VALIDATION');
    });
  });

  describe('GET /api/analytics/overview', () => {
    it('returns a dense 30-day trend with zeroed gap days by default', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      const { range, dailyTrend, totals, weekdays, accuracy } = res.body.data;
      expect(range.from <= range.to).toBe(true);
      expect(dailyTrend).toHaveLength(30);
      expect(dailyTrend.every((d) => typeof d.points === 'number')).toBe(true);
      expect(totals.pointsEarned).toBe(0);
      expect(totals.activeDays).toBe(0);
      expect(totals.bestDay).toBeNull();
      expect(weekdays).toHaveLength(7);
      expect(accuracy.sampleSize).toBe(0);
      expect(accuracy.avgRatio).toBeNull();
    });

    it('reflects a completed time-blocked task in trend, hours histogram and accuracy', async () => {
      const date = todayStr();

      const taskRes = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({
          title: 'Deep work block',
          difficulty: 'medium',
          date,
          timeBlockStart: '09:00',
          timeBlockEnd: '10:00',
        });
      expect(taskRes.body.success).toBe(true);
      const taskId = taskRes.body.data._id;

      await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ actualDurationMinutes: 55 })
        .expect(200);

      const res = await request(app)
        .get('/api/analytics/overview')
        .set("Cookie", cookie)
        .expect(200);

      const { totals, dailyTrend, productiveHours, accuracy, unscheduledCompleted } = res.body.data;

      expect(totals.tasksCompleted).toBe(1);
      expect(totals.pointsEarned).toBeGreaterThan(0);
      expect(totals.activeDays).toBe(1);
      expect(totals.bestDay).not.toBeNull();

      const todayEntry = dailyTrend.find((d) => d.date === date);
      // The logical day may differ from the absolute date around day_start,
      // but at least one trend day must carry the points.
      const activeEntries = dailyTrend.filter((d) => d.points > 0);
      expect(activeEntries.length).toBe(1);
      if (todayEntry && todayEntry.points > 0) {
        expect(todayEntry.tasksCompleted).toBe(1);
      }

      const nineAm = productiveHours.find((h) => h.hour === 9);
      expect(nineAm).toBeDefined();
      expect(nineAm.tasksCompleted).toBe(1);
      expect(nineAm.minutes).toBe(55);
      expect(unscheduledCompleted).toBe(0);

      expect(accuracy.sampleSize).toBe(1);
      expect(accuracy.plannedMinutes).toBe(60);
      expect(accuracy.actualMinutes).toBe(55);
      expect(accuracy.onTargetRate).toBe(1);
    });

    it('counts quick tasks without a time block as unscheduled', async () => {
      const date = todayStr();
      const taskRes = await request(app)
        .post('/api/tasks').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ title: 'Quick win', type: 'quick', difficulty: 'easy', date });
      const taskId = taskRes.body.data._id;

      await request(app)
        .patch(`/api/tasks/${taskId}/complete`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ actualDurationMinutes: 5 })
        .expect(200);

      const res = await request(app)
        .get('/api/analytics/overview')
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.data.unscheduledCompleted).toBe(1);
      expect(res.body.data.productiveHours).toHaveLength(0);
    });
  });

  describe('GET /api/analytics/habits', () => {
    it('returns completion rate, streak and MVD rate for a logged habit', async () => {
      const date = todayStr();

      const habitRes = await request(app)
        .post('/api/habits').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ title: 'قراءة', category: 'education_work', type: 'boolean' });
      expect(habitRes.body.success).toBe(true);
      const habitId = habitRes.body.data._id;

      await request(app)
        .post(`/api/habits/${habitId}/log`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ date, value: 1, isMvd: true })
        .expect(200);

      const res = await request(app)
        .get(`/api/analytics/habits?from=${date}&to=${date}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      const habit = res.body.data.habits.find((h) => h.habitId === habitId);
      expect(habit).toBeDefined();
      expect(habit.daysInRange).toBe(1);
      expect(habit.daysLogged).toBe(1);
      expect(habit.completionRate).toBe(1);
      expect(habit.mvdRate).toBe(1);
      expect(habit.currentStreak).toBeGreaterThanOrEqual(1);
      expect(habit.longestStreak).toBe(1);
      expect(habit.relapses).toEqual([]);
      expect(habit.daysSinceRelapse).toBeNull(); // not a quit habit
    });

    it('tracks relapses and daysSinceRelapse for quit habits', async () => {
      const date = todayStr();

      const habitRes = await request(app)
        .post('/api/habits').set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ title: 'الإقلاع عن السكر', category: 'health', type: 'quit' });
      const habitId = habitRes.body.data._id;

      await request(app)
        .post(`/api/habits/${habitId}/relapse`).set("X-Requested-With", "XMLHttpRequest")
        .set("Cookie", cookie)
        .send({ date })
        .expect(200);

      const res = await request(app)
        .get(`/api/analytics/habits?from=${date}&to=${date}`)
        .set("Cookie", cookie)
        .expect(200);

      const habit = res.body.data.habits.find((h) => h.habitId === habitId);
      expect(habit).toBeDefined();
      expect(habit.relapses).toContain(date);
      expect(habit.daysSinceRelapse).toBe(0);
      expect(habit.currentStreak).toBe(0);
    });

    it('returns an empty habits array for a fresh account', async () => {
      const res = await request(app)
        .get('/api/analytics/habits')
        .set("Cookie", cookie)
        .expect(200);
      expect(res.body.data.habits).toEqual([]);
    });
  });
});
