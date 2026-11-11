import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { migrate } from '../src/db/migrate.js';
import { pool } from '../src/db/pool.js';
import { DEMO_USER, seed } from '../src/db/seed.js';
import { addDays, todayIST } from '../src/lib/dates.js';

const app = createApp();
const date = addDays(todayIST(), 3);
let token = '';
let scheduleId = 0;

beforeAll(async () => {
  expect(config.dbSchema).toBe('train_booking_test');
  await pool.query(`DROP SCHEMA IF EXISTS ${config.dbSchema} CASCADE`);
  await migrate();
  await seed();
  const res = await request(app).post('/api/auth/login').send(DEMO_USER);
  token = res.body.token;
});

afterAll(() => pool.end());

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('health', () => {
  it('reports db ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'ok' });
  });
});

describe('stations and search', () => {
  it('autocompletes stations by city or code', async () => {
    const res = await request(app).get('/api/stations?q=mum');
    expect(res.body.stations.map((s: { code: string }) => s.code)).toEqual(expect.arrayContaining(['BCT', 'CSMT']));
  });

  it('finds trains with class availability', async () => {
    const res = await request(app).get(`/api/trains/search?from=NDLS&to=BCT&date=${date}`);
    expect(res.status).toBe(200);
    expect(res.body.results.map((r: { trainNumber: string }) => r.trainNumber)).toEqual(['12904', '12952']);
    const rajdhani = res.body.results[1];
    expect(rajdhani.classes.map((c: { classCode: string }) => c.classCode)).toEqual(['1A', '2A', '3A']);
    scheduleId = rajdhani.scheduleId;
  });

  it('validates search input', async () => {
    expect((await request(app).get(`/api/trains/search?from=NDLS&to=NDLS&date=${date}`)).status).toBe(400);
    const past = await request(app).get(`/api/trains/search?from=NDLS&to=BCT&date=${addDays(todayIST(), -2)}`);
    expect(past.body.error.code).toBe('DATE_OUT_OF_WINDOW');
    expect((await request(app).get('/api/trains/search?from=x')).body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('auth', () => {
  it('registers, rejects duplicates and bad passwords', async () => {
    const user = { name: 'Test Rider', email: 'rider@test.dev', password: 'longenough1' };
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect((await request(app).post('/api/auth/register').send(user)).status).toBe(409);
    expect(
      (
        await request(app)
          .post('/api/auth/login')
          .send({ ...user, password: 'wrong-pass' })
      ).status,
    ).toBe(401);
    const me = await request(app)
      .get('/api/auth/me')
      .set({ Authorization: `Bearer ${res.body.token}` });
    expect(me.body.user.email).toBe(user.email);
  });

  it('protects bookings', async () => {
    expect((await request(app).get('/api/bookings')).status).toBe(401);
  });
});

describe('booking flow', () => {
  it('books chosen seats, lists, and cancels', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set(auth())
      .send({
        scheduleId,
        classCode: '2A',
        passengers: [
          { name: 'Aarav Sharma', age: 31, gender: 'M', seatNo: 7 },
          { name: 'Meera Sharma', age: 29, gender: 'F' },
        ],
      });
    expect(res.status).toBe(201);
    const b = res.body.booking;
    expect(b.pnr).toMatch(/^\d{10}$/);
    expect(b.totalFare).toBe(2860 * 2);
    expect(b.passengers.map((p: { seatNo: number }) => p.seatNo)).toEqual([7, 1]);

    const taken = await request(app)
      .post('/api/bookings')
      .set(auth())
      .send({ scheduleId, classCode: '2A', passengers: [{ name: 'Someone Else', age: 40, gender: 'O', seatNo: 7 }] });
    expect(taken.status).toBe(409);
    expect(taken.body.error.code).toBe('SEAT_TAKEN');

    const seats = await request(app).get(`/api/schedules/${scheduleId}/classes/2A/seats`);
    expect(seats.body.booked).toEqual([1, 7]);
    expect(seats.body.availableSeats).toBe(44);

    const list = await request(app).get('/api/bookings').set(auth());
    expect(list.body.bookings.some((x: { pnr: string }) => x.pnr === b.pnr)).toBe(true);
    expect((await request(app).get(`/api/bookings/${b.pnr}`).set(auth())).status).toBe(200);

    const cancel = await request(app).post(`/api/bookings/${b.pnr}/cancel`).set(auth());
    expect(cancel.body.booking.bookingStatus).toBe('CANCELLED');
    expect((await request(app).post(`/api/bookings/${b.pnr}/cancel`).set(auth())).status).toBe(409);
    const after = await request(app).get(`/api/schedules/${scheduleId}/classes/2A/seats`);
    expect(after.body).toMatchObject({ availableSeats: 46, booked: [] });
  });

  it("hides other users' bookings", async () => {
    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Nosy Parker', email: 'nosy@test.dev', password: 'longenough1' });
    const mine = await request(app).get('/api/bookings').set(auth());
    const pnr = mine.body.bookings[0].pnr;
    const res = await request(app)
      .get(`/api/bookings/${pnr}`)
      .set({ Authorization: `Bearer ${other.body.token}` });
    expect(res.status).toBe(404);
  });

  it('never overbooks under concurrent requests', async () => {
    // 1A has 18 berths; fire 30 single-seat bookings at once
    const attempts = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        request(app)
          .post('/api/bookings')
          .set(auth())
          .send({ scheduleId, classCode: '1A', passengers: [{ name: `Rider ${i}`, age: 30, gender: 'M' }] }),
      ),
    );
    expect(attempts.filter((r) => r.status === 201)).toHaveLength(18);
    expect(attempts.filter((r) => r.status === 409)).toHaveLength(12);
    const seats = await request(app).get(`/api/schedules/${scheduleId}/classes/1A/seats`);
    expect(seats.body.availableSeats).toBe(0);
    expect(new Set(seats.body.booked).size).toBe(18);
  });

  it('rejects invalid bookings', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set(auth())
      .send({ scheduleId, classCode: '3A', passengers: [] });
    expect(res.status).toBe(400);
  });
});

describe('admin', () => {
  it('is forbidden for regular users', async () => {
    expect((await request(app).get('/api/admin/overview').set(auth())).status).toBe(403);
  });
});
