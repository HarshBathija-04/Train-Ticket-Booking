import { Router } from 'express';
import type pg from 'pg';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { BOOKING_WINDOW_DAYS, isBookableDate } from '../lib/dates.js';
import { HttpError } from '../lib/errors.js';

export const trainsRouter = Router();

const stationCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,6}$/, 'Invalid station code');
const isoDate = z.iso.date('Use YYYY-MM-DD');
const id = z.coerce.number().int().positive();

trainsRouter.get('/stations', async (req, res) => {
  const { q } = z.object({ q: z.string().trim().max(50).optional() }).parse(req.query);
  const like = `%${(q ?? '').replace(/[%_\\]/g, (c) => '\\' + c)}%`;
  const { rows } = await pool.query(
    `SELECT code, name, city, state FROM stations
     WHERE code ILIKE $1 OR name ILIKE $1 OR city ILIKE $1
     ORDER BY (code ILIKE $2) DESC, (city ILIKE $3) DESC, city LIMIT 10`,
    [like, q ?? '', `${q ?? ''}%`],
  );
  res.json({ stations: rows });
});

/** Trains run daily: materialise the schedule + class inventory for a date on first look. */
export async function ensureSchedules(db: pg.Pool | pg.PoolClient, date: string, from?: string, to?: string) {
  const routeFilter = from && to ? 'AND t.source = $2 AND t.destination = $3' : '';
  const params = from && to ? [date, from, to] : [date];
  await db.query(
    `INSERT INTO train_schedules (train_number, journey_date)
     SELECT t.train_number, $1::date FROM trains t WHERE true ${routeFilter}
     ON CONFLICT DO NOTHING`,
    params,
  );
  await db.query(
    `INSERT INTO schedule_classes (schedule_id, class_code, fare, total_seats, available_seats)
     SELECT s.id, tc.class_code, tc.fare, tc.total_seats, tc.total_seats
     FROM train_schedules s
     JOIN trains t USING (train_number)
     JOIN train_classes tc USING (train_number)
     WHERE s.journey_date = $1::date ${routeFilter}
     ON CONFLICT DO NOTHING`,
    params,
  );
}

const scheduleSelect = `
  SELECT s.id AS "scheduleId", s.journey_date AS "journeyDate",
         t.train_number AS "trainNumber", t.train_name AS "trainName", t.train_type AS "trainType",
         t.departure_time AS "departureTime", t.arrival_time AS "arrivalTime", t.duration_min AS "durationMin",
         json_build_object('code', src.code, 'name', src.name, 'city', src.city) AS "from",
         json_build_object('code', dst.code, 'name', dst.name, 'city', dst.city) AS "to",
         (SELECT json_agg(json_build_object('classCode', sc.class_code, 'fare', sc.fare,
                  'totalSeats', sc.total_seats, 'availableSeats', sc.available_seats)
                  ORDER BY sc.fare DESC)
          FROM schedule_classes sc WHERE sc.schedule_id = s.id) AS classes
  FROM train_schedules s
  JOIN trains t USING (train_number)
  JOIN stations src ON src.code = t.source
  JOIN stations dst ON dst.code = t.destination`;

trainsRouter.get('/trains/search', async (req, res) => {
  const q = z.object({ from: stationCode, to: stationCode, date: isoDate }).parse(req.query);
  if (q.from === q.to) throw new HttpError(400, 'SAME_STATION', 'Origin and destination must differ');
  if (!isBookableDate(q.date)) {
    throw new HttpError(400, 'DATE_OUT_OF_WINDOW', `Pick a date between today and ${BOOKING_WINDOW_DAYS} days ahead`);
  }
  await ensureSchedules(pool, q.date, q.from, q.to);
  const { rows } = await pool.query(
    `${scheduleSelect} WHERE s.journey_date = $1 AND t.source = $2 AND t.destination = $3 ORDER BY t.departure_time`,
    [q.date, q.from, q.to],
  );
  res.json({ results: rows });
});

trainsRouter.get('/schedules/:id', async (req, res) => {
  const scheduleId = id.parse(req.params.id);
  const { rows } = await pool.query(`${scheduleSelect} WHERE s.id = $1`, [scheduleId]);
  if (!rows[0]) throw new HttpError(404, 'NOT_FOUND', 'Train schedule not found');
  res.json({ schedule: rows[0] });
});

trainsRouter.get('/schedules/:id/classes/:classCode/seats', async (req, res) => {
  const scheduleId = id.parse(req.params.id);
  const classCode = z.enum(['1A', '2A', '3A', 'SL', 'CC', 'EC']).parse(req.params.classCode);
  const { rows } = await pool.query(
    `SELECT sc.total_seats AS "totalSeats", sc.available_seats AS "availableSeats",
            COALESCE((SELECT json_agg(p.seat_no ORDER BY p.seat_no) FROM passengers p
                      WHERE p.schedule_class_id = sc.id AND NOT p.cancelled), '[]') AS booked
     FROM schedule_classes sc WHERE sc.schedule_id = $1 AND sc.class_code = $2`,
    [scheduleId, classCode],
  );
  if (!rows[0]) throw new HttpError(404, 'NOT_FOUND', 'This class is not available on this train');
  res.json({ classCode, ...rows[0] });
});
