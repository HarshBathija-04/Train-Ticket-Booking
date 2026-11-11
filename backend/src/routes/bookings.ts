import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';
import { pool, withTransaction } from '../db/pool.js';
import { todayIST } from '../lib/dates.js';
import { HttpError } from '../lib/errors.js';
import { assignSeats, generatePnr, SeatError } from '../lib/seats.js';
import { requireAuth } from '../middleware/auth.js';

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

const passenger = z.object({
  name: z.string().trim().min(2, 'Passenger name is too short').max(100),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.enum(['M', 'F', 'O']),
  seatNo: z.number().int().positive().optional(),
});
const createSchema = z.object({
  scheduleId: z.number().int().positive(),
  classCode: z.enum(['1A', '2A', '3A', 'SL', 'CC', 'EC']),
  passengers: z.array(passenger).min(1, 'Add at least one passenger').max(6, 'At most 6 passengers per booking'),
});
const pnrParam = z.string().regex(/^\d{10}$/, 'PNR is 10 digits');

const bookingSelect = `
  SELECT b.pnr, b.booking_id AS "bookingId", b.user_id AS "userId", b.no_of_seats AS "noOfSeats", b.total_fare AS "totalFare",
         b.payment_status AS "paymentStatus", b.booking_status AS "bookingStatus", b.booking_date AS "bookingDate",
         sc.class_code AS "classCode", s.id AS "scheduleId", s.journey_date AS "journeyDate",
         t.train_number AS "trainNumber", t.train_name AS "trainName",
         t.departure_time AS "departureTime", t.arrival_time AS "arrivalTime", t.duration_min AS "durationMin",
         json_build_object('code', src.code, 'name', src.name, 'city', src.city) AS "from",
         json_build_object('code', dst.code, 'name', dst.name, 'city', dst.city) AS "to",
         (SELECT json_agg(json_build_object('name', p.name, 'age', p.age, 'gender', p.gender, 'seatNo', p.seat_no)
                  ORDER BY p.id) FROM passengers p WHERE p.booking_id = b.booking_id) AS passengers
  FROM bookings b
  JOIN schedule_classes sc ON sc.id = b.schedule_class_id
  JOIN train_schedules s ON s.id = sc.schedule_id
  JOIN trains t ON t.train_number = s.train_number
  JOIN stations src ON src.code = t.source
  JOIN stations dst ON dst.code = t.destination`;

export async function getBooking(db: pg.Pool | pg.PoolClient, pnr: string) {
  const { rows } = await db.query(`${bookingSelect} WHERE b.pnr = $1`, [pnr]);
  return rows[0];
}

/**
 * Overbooking guard: the class inventory row is locked FOR UPDATE, so concurrent
 * bookings of the same class run one after another. The CHECK on available_seats
 * and the partial unique index on active seats back this up at the schema level.
 */
export async function createBooking(userId: number, input: z.infer<typeof createSchema>) {
  return withTransaction(async (c) => {
    const { rows } = await c.query(
      `SELECT sc.id, sc.fare, sc.total_seats, sc.available_seats, s.journey_date
       FROM schedule_classes sc JOIN train_schedules s ON s.id = sc.schedule_id
       WHERE sc.schedule_id = $1 AND sc.class_code = $2
       FOR UPDATE OF sc`,
      [input.scheduleId, input.classCode],
    );
    const inv = rows[0];
    if (!inv) throw new HttpError(404, 'NOT_FOUND', 'This class is not available on this train');
    if (inv.journey_date < todayIST()) throw new HttpError(400, 'DEPARTED', 'This train has already departed');
    const n = input.passengers.length;
    if (inv.available_seats < n) {
      throw new HttpError(409, 'NOT_ENOUGH_SEATS', `Only ${inv.available_seats} seat(s) left in ${input.classCode}`);
    }
    const booked = await c.query<{ seat_no: number }>(
      'SELECT seat_no FROM passengers WHERE schedule_class_id = $1 AND NOT cancelled',
      [inv.id],
    );
    let seats: number[];
    try {
      seats = assignSeats(
        input.passengers.map((p) => p.seatNo),
        inv.total_seats,
        booked.rows.map((r) => r.seat_no),
      );
    } catch (err) {
      if (err instanceof SeatError) throw new HttpError(409, err.code, err.message);
      throw err;
    }
    await c.query('UPDATE schedule_classes SET available_seats = available_seats - $2 WHERE id = $1', [inv.id, n]);
    const pnr = generatePnr();
    const b = await c.query<{ booking_id: number }>(
      `INSERT INTO bookings (pnr, user_id, schedule_class_id, no_of_seats, total_fare)
       VALUES ($1, $2, $3, $4, $5) RETURNING booking_id`,
      [pnr, userId, inv.id, n, Math.round(inv.fare * n * 100) / 100],
    );
    for (const [i, p] of input.passengers.entries()) {
      await c.query(
        `INSERT INTO passengers (booking_id, schedule_class_id, seat_no, name, age, gender)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [b.rows[0].booking_id, inv.id, seats[i], p.name, p.age, p.gender],
      );
    }
    return getBooking(c, pnr);
  });
}

export async function cancelBooking(userId: number, pnr: string) {
  return withTransaction(async (c) => {
    const { rows } = await c.query(
      `SELECT b.booking_id, b.booking_status, b.no_of_seats, b.schedule_class_id, s.journey_date
       FROM bookings b
       JOIN schedule_classes sc ON sc.id = b.schedule_class_id
       JOIN train_schedules s ON s.id = sc.schedule_id
       WHERE b.pnr = $1 AND b.user_id = $2
       FOR UPDATE OF b`,
      [pnr, userId],
    );
    const b = rows[0];
    if (!b) throw new HttpError(404, 'NOT_FOUND', 'Booking not found');
    if (b.booking_status === 'CANCELLED') throw new HttpError(409, 'ALREADY_CANCELLED', 'Booking is already cancelled');
    if (b.journey_date < todayIST()) throw new HttpError(400, 'DEPARTED', 'Past journeys cannot be cancelled');
    await c.query(`UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = $1`, [b.booking_id]);
    await c.query('UPDATE passengers SET cancelled = true WHERE booking_id = $1', [b.booking_id]);
    await c.query('UPDATE schedule_classes SET available_seats = available_seats + $2 WHERE id = $1', [
      b.schedule_class_id,
      b.no_of_seats,
    ]);
    return getBooking(c, pnr);
  });
}

bookingsRouter.post('/', async (req, res) => {
  const booking = await createBooking(req.user!.id, createSchema.parse(req.body));
  res.status(201).json({ booking });
});

bookingsRouter.get('/', async (req, res) => {
  const { rows } = await pool.query(`${bookingSelect} WHERE b.user_id = $1 ORDER BY b.booking_date DESC`, [
    req.user!.id,
  ]);
  res.json({ bookings: rows });
});

bookingsRouter.get('/:pnr', async (req, res) => {
  const booking = await getBooking(pool, pnrParam.parse(req.params.pnr));
  // 404 rather than 403 so PNRs of other users cannot be probed
  if (!booking || (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
    throw new HttpError(404, 'NOT_FOUND', 'Booking not found');
  }
  res.json({ booking });
});

bookingsRouter.post('/:pnr/cancel', async (req, res) => {
  const booking = await cancelBooking(req.user!.id, pnrParam.parse(req.params.pnr));
  res.json({ booking });
});
